

class CountryCollection:
    def __init__(self):
        self.i = 0
        self.arr = []
        self.id_to_idx = {}
        self.name_to_idx = {}
        #вводим ничего, класс работает как конвертер в жсон
        
    def get_by_idx(self, i):
        return self.arr[self.id_to_idx[i]]
    
    def get_by_name(self, name):
        return self.arr[self.name_to_idx[name]]

    #два геттера гоус зере

    def add(self, country):
        self.id_to_idx[i] = len(self.arr)
        self.name_to_idx[country.name] = len(self.arr)
        self.arr.append(country)
        #тут появляется новая страна - считай пользователей
        return self.i

    def to_json(self):
        return ''
        #тут джосинифицируем

'''
capybara jerez '''


class World:
    def __init__(self):
        self.countries = CountryCollection()


