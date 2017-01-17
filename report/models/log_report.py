import datetime
from collections import defaultdict
from collections import namedtuple
import json
from ..ratePlan.models.prices import PriceDetails
from django.conf import settings

from mongoengine import *

class InventoryUpdateReport(Document):
    hotel_id = StringField()
    updation_time = DateTimeField()
    room_id = IntField()
    from_date = DateTimeField()
    to_date = DateTimeField()
    logged_user_id = LongField()
    new_value = IntField()
    old_value = IntField()

    
    def get_id(self):
        return self.id

    def get_hotel_id(self):
        return self.hotel_id

    def get_room_id(self):
        return self.room_id

    def get_updation_time(self):
        return self.updation_time

    def get_from_date(self):
        return self.from_date

    def get_to_date(self):
        return self.to_date

    def get_logged_user_id(self):
        return self.logged_user_id

    def get_new_value(self):
        return self.new_value

    def get_old_value(self):
        return self.old_value


class PriceUpdateReport(Document):
    hotel_id = StringField()
    updation_time = DateTimeField()
    room_id = IntField()
    rate_id = IntField()
    from_date = DateTimeField()
    to_date = DateTimeField()
    logged_user_id = LongField()
    new_price = EmbeddedDocumentField(PriceDetails)
    old_price = EmbeddedDocumentField(PriceDetails)
    
    def get_id(self):
        return self.id

    def get_hotel_id(self):
        return self.hotel_id

    def get_room_id(self):
        return self.room_id

    def get_rate_id(self):
        return self.rate_id

    def get_updation_time(self):
        return self.updation_time

    def get_from_date(self):
        return self.from_date

    def get_to_date(self):
        return self.to_date

    def get_logged_user_id(self):
        return self.logged_user_id

    def get_inventory(self):
        return self.price
