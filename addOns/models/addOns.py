import datetime
from collections import defaultdict
from collections import namedtuple
import json

from django.conf import settings

from mongoengine import *


class AddOnsEntity(Document):
    hotel_id = StringField()
    name = StringField()
    description = StringField()
    valid_from = DateTimeField()
    valid_to = DateTimeField()
    days = ListField()
    cut_off = IntField()
    charge_type = IntField(default=0)
    charge_value = IntField(default=0)
    is_mandate = BooleanField(default=True)
    image = StringField(default='')
    


    