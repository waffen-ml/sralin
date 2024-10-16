from types import LambdaType


def lambdafy(val):
    if type(val) == LambdaType:
        return val
    return lambda: val


class InfoField:
    def __init__(self, title, f):
        self.title = title
        self.f = f

    def to_dict(self):
        return {
            'title': self.title,
            'value': str(self.f())
        }


class InfoList:
    def __init__(self, *fields):
        self.fields = fields

    def to_arr(self):
        return [f.to_dict() for f in self.fields]


class Input:
    def __init__(self, action, **params):
        self.params = params
        self.action = action

    def to_dict(self):
        return self.params

    def change(self, payload):
        self.action(payload)


class Card:
    def __init__(self, country, title='', text='', type='', inputs=None, info_list=None):
        self.id = -1
        self.country = country
        self.c = country
        self.title = title
        self.type = type

        self.text_f = lambdafy(text)
        self.inputs_f = lambdafy(inputs or [])
        self.info_list_f = lambdafy(info_list or InfoList())

    @property
    def text(self):
        return self.text_f()

    @property
    def inputs(self):
        return self.inputs_f()

    @property
    def info_list(self):
        return self.info_list_f()

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'type': self.type,
            'text': self.text,
            'inputs': [
                inp.to_dict() for inp in self.inputs
            ],
            'info_list': self.info_list.to_arr()
        }

    def change(self, inp_idx, payload):
        self.inputs[inp_idx].change(payload)



class CardContainer:
    def __init__(self, *cards):
        self.id_card = {}
        self.i = 0

        for card in cards:
            self.add(card)

    def add(self, card):
        self.id_card[self.i] = card
        card.id = self.i
        self.i += 1

    def remove(self, id):
        del self.id_card[id]
    
    def get(self, id):
        return self.id_card[id]
    
    def all(self):
        return self.id_card.values()

    def filter(self, type):
        res = []

        for card in self.all():
            if card.type == type:
                res.append(card)

        return res
    
    def change(self, card_id, inp_idx, payload):
        self.id_card[card_id].change(inp_idx, payload)




