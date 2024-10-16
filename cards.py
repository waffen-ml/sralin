from interface import *


class ShootingCard(Card):
    def __init__(self, c):
        super(c,
            title='Расстрел',
            text='Выберите действие:',
            type='inside',
            info_list=InfoList(
                InfoField('Расстреляно', lambda: c.shoot)
            ),
            inputs=[
                Input(self.shoot, text='Расстрелять!', type='button')
            ]
        )

    def shoot(self, data):
        self.country.shoot += 10**6





