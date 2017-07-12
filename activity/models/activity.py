import datetime
from collections import defaultdict
from collections import namedtuple
import json
from enum import Enum
from django.conf import settings
from mongoengine import *


class ActivityType(Enum):
    HOTEL = (1,"Hotel")
    ROOM = (2,"Room")
    RATE_PLAN = (3,"Room")
    INVENTORY = (4,"Room")
    PRICES = (5,"Room")
    CONTRACT = (6,"Contract")
    ADD_ONS = (7,"AddOns")
    DEAL = (8,"Deal")
    PROMOTION = (9,"Promo")

    def __init__(self, id, name):
        self.type_name = name
        self.type_id = id

    @classmethod
    def get_id(cls, name):
        activity_type_details = cls.__members__.values()
        for activity_type in activity_type_details:
            if activity_type.name == name:
                return activity_type.type_id

        return -1

    @classmethod
    def get_name(cls, id):
        activity_type_details = cls.__members__.values()
        for activity_type in activity_type_details:
            if activity_type.type_id == id:
                return activity_type.type_name

        return None


class ActivityEntity(Document):
    user_id = StringField()
    creation_time = DateTimeField()
    activity = IntField()

    def get_id(self):
        return self.id

    def get_user_id(self):
        return self.hotel_id

    def get_hotel_id(self):
        return self.hotel_id

    def get_creation_time(self):
        return self.creation_time
