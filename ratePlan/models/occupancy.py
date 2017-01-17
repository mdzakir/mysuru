from enum import Enum
class Occupancy(Enum):
    SINGLE = (1, 'Single')
    DOUBLE = (2, 'Double')
    TRIPLE = (3, 'Triple')
    QUARD = (4, 'Four Person')
    EXTRA_ADULT = (5, 'Extra Adult')
    EXTRA_CHILD = (6, 'Extra child')

    def __init__(self, id, name):
        self.id = id
        self.name = name

    @property
    def get_id(self):
        return self.id

    @property
    def get_name(self):
        return self.name