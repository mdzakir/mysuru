import datetime
from collections import defaultdict
from collections import namedtuple
import json

from django.conf import settings

from mongoengine import *
from enum import Enum

class PriceDetails(EmbeddedDocument):
    occupancy = IntField()
    price = LongField()

    def get_occupancy(self):
        return self.occupancy

    def get_price(self):
        return self.price

class Price(Document):
    room_id = StringField()
    rate_id = StringField()
    date = DateTimeField()
    price = ListField(EmbeddedDocumentField(PriceDetails))

    def get_room_id(self):
        return self.room_id

    def get_rate_id(self):
        return self.rate_id

    def get_date(self):
        return self.date

    def get_price(self):
        return self.price
