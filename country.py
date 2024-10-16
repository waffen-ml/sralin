from cards import *


class Country:
    def __init__(self, world):
        self.id = -1
        self.world = world
        self.shoot = 0

        self.cards = [
            ShootingCard(self)
        ]

        #тут задаем саму страну(пользователя)
    
    def update(self, dt):
        pass
        
    def change_card(self, card_idx, payload):
        self.cards[card_idx].change(payload)

