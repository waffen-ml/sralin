from interface import *
from enum import Enum


CardType = Enum('CardType', [
    'INSIDE', 'OUTSIDE',
    'TOWN', 'VILLAGE'
])


class ShootingCard(Card):
    def __init__(self, c):
        super(c,
            title='Расстрел',
            text='Выберите действие:',
            type=CardType.INSIDE,
            info_list=InfoList(
                InfoField('Расстреляно', lambda: c.shoot)
            ),
            inputs=[
                Input(self.shoot, text='Расстрелять!', type='button')
            ]
        )

    def shoot(self, data):
        self.country.shoot += 10**6





