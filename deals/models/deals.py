import datetime
from collections import defaultdict
from collections import namedtuple
import json

from django.conf import settings

from mongoengine import *


class Period(EmbeddedDocument):
    start = DateTimeField()
    end = DateTimeField()
    days = ListField()
    black_out_dates = ListField(DateTimeField)


class DealEntity(Document):
    hotel_id = StringField()
    name = StringField()
    description = StringField()
    type = StringField()
    status = IntField()
    discount_type = StringField()
    discount_value = IntField()
    checkIn = EmbeddedDocumentField(Period)
    booking = EmbeddedDocumentField(Period)
    room_types = ListField()
    rate_types = ListField()




    