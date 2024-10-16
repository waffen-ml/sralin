from flask import Flask, session, request
from flask_socketio import SocketIO, emit, join_room
from flask_cors import CORS

json_response = lambda success, **kwargs: \
    kwargs if success is None else {'success': success, **kwargs}

gthread = None

app = Flask(__name__)

app.config["SESSION_COOKIE_SAMESITE"] = "None"
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SECRET_KEY'] = 'sralin'
app.config['SESSION_TYPE'] = 'filesystem'

cors = CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
socketio = SocketIO(app, cors_allowed_origins="*", manage_session=False)

countries = []


def get_country_by_name(name):
    for c in countries:
        if c['name'] == name:
            return c
    return None


@app.route('/who_am_i')
def route_who_am_i():
    country_id = session.get('country_id')

    if country_id is None:
        return json_response(True, country=None)
    
    c = countries[country_id]

    return json_response(True, country={
        'id': c['id'],
        'name': c['name']
    })


@app.route('/create_country', methods=['POST'])
def route_create_country():
    name = request.json.get('name')
    password = request.json.get('password')

    c = get_country_by_name(name)

    if c is not None:
        return json_response(False, error='NAME_IS_NOT_AVAILABLE')

    session['country_id'] = len(countries)
    countries.append({'id': len(countries), 'name': name, 'password': password})

    return json_response(True)


@app.route('/continue_playing', methods=['POST'])
def route_continue_playing():
    name = request.json.get('name')
    password = request.json.get('password')

    c = get_country_by_name(name)

    if c is None:
        return json_response(False, error='COUNTRY_WAS_NOT_FOUND')
    elif c['password'] != password:
        return json_response(False, error='INCORRECT_PASSWORD')
    
    session['country_id'] = c['id']

    return json_response(True)


@app.route('/logout')
def logout():
    session['country_id'] = None
    return json_response(True)


@socketio.on('connect')
def connect():
    print('socket connected:', list(session.items()))

    global gthread

    if gthread is None:
        gthread = socketio.start_background_task(target=gameloop)


def gameloop():
    time = 0

    while True:


        socketio.emit('data', {'time': time})

        socketio.sleep(1)
        time += 1



if __name__ == '__main__':
    socketio.run(app, debug=True, port=80)
