import datetime


class CountryCollection:
    def __init__(self):
        self.i = 0
        self.id_country = {}
        self.name_id = {}
        #вводим ничего, класс работает как конвертер в жсон
        
    def get_by_id(self, id):
        return self.id_country[id]
    
    def get_by_name(self, name):
        return self.id_country[self.name_id[name]]

    #два геттера гоус зере

    def add(self, country):
        self.id_country[self.i] = country
        self.name_id[country.name] = self.i
        country.id = self.i
        self.i += 1
        return self.i - 1

        #тут появляется новая страна - считай пользователей

    def size(self):
        return len(self.arr)

    def to_json(self):
        return ''
        #тут джосинифицируем

    def all(self):
        return self.id_country.values()

'''
capybara jerez
'''


class World:
    def __init__(self):
        self.offset_date = datetime.date(1936, 1, 1)
        self.days_passed = 0
        self.countries = CountryCollection()

    def update(self):
        for country in self.countries.all():
            country.update(1)
        self.days_passed += 1
    


