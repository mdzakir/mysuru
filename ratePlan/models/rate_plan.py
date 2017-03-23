import datetime
from collections import defaultdict
from collections import namedtuple
import json

from django.conf import settings

from mongoengine import *
from enum import Enum


class RatePlanType(Enum):
    EP = (1,"EP","Room Only")
    CP = (2,"CP","With Breakfast")
    MAP = (3,"MAP","With Breakfast and Lunch")
    AP = (4,"AP","With Breakfast,Lunch and Dinner")

    def __init__(self, id, rp_name,description):
        self.rp_name = rp_name
        self.id = id
        self.description = description

class RateplanInclusions(EmbeddedDocument):
    name = StringField()

    def get_name(self):
        return self.name

class RateplanExclusions(EmbeddedDocument):
    name = StringField()

    def get_name(self):
        return self.name

class RateplanBlackoutDates(EmbeddedDocument):
    start = StringField()
    end = StringField()

    def get_start(self):
        return self.start

    def get_end(self):
        return self.end

class RatePlanCancellationPolicy(EmbeddedDocument):
    from_checkin = IntField()
    to_checkin = IntField()
    amount = IntField()
    amount_type = IntField()

    def get_from_checkin(self):
        return self.from_checkin

    def get_to_checkin(self):
        return self.to_checkin

    def get_amount(self):
        return self.amount

    def get_amount_type(self):
        return self.amount_type

class RatePlanEntity(Document):
    hotel_id = StringField()
    status = IntField()
    name = StringField()
    valid_from = DateTimeField()
    valid_to = DateTimeField()
    description = StringField()
    min_adult = IntField()
    max_adult = IntField()
    min_length_of_stay = IntField()
    max_length_of_stay = IntField()
    min_no_of_rooms = IntField()
    max_no_of_rooms = IntField()
    cut_of_days = IntField()
    inclusions = ListField(EmbeddedDocumentField(RateplanInclusions))
    exclusions = ListField(EmbeddedDocumentField(RateplanExclusions))
    blackout_dates = ListField(EmbeddedDocumentField(RateplanBlackoutDates))
    allow_modification = BooleanField()
    allow_cancellation = BooleanField()
    cancellation_policy = ListField(EmbeddedDocumentField(RatePlanCancellationPolicy))

    def get_id(self):
        return self.id

    def get_status(self):
        return self.status

    def get_hotel_id(self):
        return self.hotel_id

    def get_name(self):
        return self.name

    def get_valid_from(self):
        return self.valid_from

    def get_valid_to(self):
        return self.valid_to

    def get_description(self):
        return self.description

    def get_min_adult(self):
        return self.min_adult

    def get_max_adult(self):
        return self.max_adult

    def get_min_length_of_stay(self):
        return self.min_length_of_stay

    def get_max_length_of_stay(self):
        return self.max_length_of_stay

    def get_max_no_of_rooms(self):
        return self.max_no_of_rooms

    def get_min_no_of_rooms(self):
        return self.min_no_of_rooms

    def get_cut_of_days(self):
        return self.cut_of_days

    def get_inclusions(self):
        return self.inclusions

    def get_exclusions(self):
        return self.exclusions

    def get_blackout_dates(self):
        return self.blackout_dates

    def get_allow_modification(self):
        return self.allow_modification

    def get_allow_cancellation(self):
        return self.allow_cancellation

    def get_cancellation_policy(self):
        return self.cancellation_policy
