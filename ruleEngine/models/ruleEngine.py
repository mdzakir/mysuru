import datetime
from collections import defaultdict
from collections import namedtuple
import json
from enum import Enum
from django.conf import settings
from mongoengine import *

class Status(Enum):
    ACTIVE = (1,"Active")
    IN_ACTIVE = (2,"In-Active")

    def __init__(self, id, name):
        self.type_name = name
        self.type_id = id

    @classmethod
    def get_id(cls, name):
        status_detail = cls.__members__.values()
        for status in status_detail:
            if status.name == name:
                return status.type_id

        return -1

    @classmethod
    def get_name(cls, id):
        status_detail = cls.__members__.values()
        for status in status_detail:
            if status.type_id == id:
                return status.type_name

        return None

class Rule(EmbeddedDocument):
    occupancy = IntField()
    price= IntField()
    type= IntField()

    
    def get_occupancy(self):
        return self.new_price

    def get_price(self):
        return self.old_price



class RuleEngineEntity(Document):
    status = IntField(default=1)
    hotel_id = StringField()
    room_id = StringField()
    creation_time = DateTimeField()
    start_date = DateTimeField()
    end_date = DateTimeField()
    rules = ListField(EmbeddedDocumentField(Rule))

    def get_id(self):
        return self.id

    def get_status(self):
        return self.status

    def get_room_id(self):
        return self.room_id

    def get_hotel_id(self):
        return self.hotel_id

    def get_creation_time(self):
        return self.creation_time

    def get_start_date(self):
        return self.start_date

    def get_end_date(self):
        return self.end_date

    def get_rule(self):
        return self.rules
