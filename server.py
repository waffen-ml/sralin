from flask import Flask, session, request
from flask_socketio import SocketIO, emit, join_room
from flask_cors import CORS
from world import World
from country import Country
from cards import CardType

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

world = World()


@app.route('/who_am_i')
def route_who_am_i():
    country_id = session.get('country_id')

    if country_id is None:
        return json_response(True, country=None)
    
    c = world.countries.get_by_id(country_id)

    return json_response(True, country={
        'id': c.id,
        'name': c.id
    })


@app.route('/create_country', methods=['POST'])
def route_create_country():
    name = request.json.get('name')
    password = request.json.get('password')

    c = world.countries.get_by_name(name)

    if c is not None:
        return json_response(False, error='NAME_IS_NOT_AVAILABLE')

    session['country_id'] = world.countries.add(Country(name, password, world))

    return json_response(True)


@app.route('/continue_playing', methods=['POST'])
def route_continue_playing():
    name = request.json.get('name')
    password = request.json.get('password')

    c = world.countries.get_by_name(name)

    if c is None:
        return json_response(False, error='COUNTRY_WAS_NOT_FOUND')
    elif c.password != password:
        return json_response(False, error='INCORRECT_PASSWORD')
    
    session['country_id'] = c.id

    return json_response(True)


@app.route('/logout')
def logout():
    session['country_id'] = None
    return json_response(True)


@socketio.on('connect')
def connect():
    print('socket connected:', session.get('country_id'))

    global gthread

    if gthread is None:
        gthread = socketio.start_background_task(target=gameloop)


@socketio.on('init')
def init_sock(data):
    cards_type = data['cards_type']
    join_room(f'{session["country_id"]}_{cards_type}')


def update_type(country, type):
    cards_to_update = country.cards.filter(type)

    to_send = {
        "updated": [
            card.to_dict() for card in cards_to_update
        ]
    }

    emit('update', to_send, to=f'{country.id}_{type}')



@socketio.on('action')
def on_action(data):
    card_id = data['card_id']
    input_idx = data['input_idx']
    payload = data['payload']
    country_id = session['country_id']

    country = world.countries.get_by_id(country_id)

    country.cards.change(card_id, input_idx, payload)
    
    type_to_update = country.cards.get(card_id).type

    update_type(country, type_to_update)



def gameloop():
    while True:
        world.update()

        for c in world.countries.all():
            for type in CardType:
                update_type(c, type)

        socketio.sleep(1)



if __name__ == '__main__':
    socketio.run(app, debug=True, port=80)
