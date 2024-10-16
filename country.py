from cards import *
from interface import CardContainer





class Country:
    def __init__(self, world, name, password):
        self.id = -1
        self.name = name
        self.password = password
        self.world = world

        self.cards = CardContainer(
            ShootingCard(self)
        )
        
        self.shoot = 0

        #тут задаем саму страну(пользователя)

    def update(self, dt):
        pass
        


