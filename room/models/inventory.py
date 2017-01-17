import datetime
from collections import defaultdict
from collections import namedtuple
import json

from django.conf import settings

from mongoengine import *

class Inventory(Document):
    room_id = StringField()
    booked = IntField()
    available = IntField()
    date = DateTimeField()
    sold_out = BooleanField()

    def get_room_id(self):
        return self.room_id

    def get_booked(self):
        return self.booked

    def get_available(self):
        return self.available

    def get_date(self):
        return self.date

    def is_sold_out(self):
        return self.sold_out

