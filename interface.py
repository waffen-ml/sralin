from types import LambdaType


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
        self.country = country
        self.c = country
        self.title = title
        self.text = text
        self.type = type
        self.inputs = inputs or []
        self.info_list = info_list or InfoList()

    def to_dict(self):
        return {
            'title': self.title,
            'text': self.text,
            'type': self.type,
            'inputs': [
                inp.to_dict() for inp in self.inputs
            ],
            'info_list': self.info_list.to_arr()
        }

    def change(self, inp_idx, payload):
        self.inputs[inp_idx].change(payload)








