import datetime
from collections import defaultdict
from collections import namedtuple
import json

from django.conf import settings

from mongoengine import *


class RoomImage(EmbeddedDocument):
    name = StringField()
    url = StringField()
    order = IntField()

    def get_name(self):
        return self.name

    def get_url(self):
        return self.url

    def get_order(self):
        return self.order


class RoomEntity(Document):
    hotel_id = StringField()
    name = StringField()
    description = StringField()
    type = StringField()
    status = IntField()
    is_smoking = BooleanField(default=False)
    max_adult = IntField()
    amenities = ListField()
    images = ListField(EmbeddedDocumentField(RoomImage))


    def get_id(self):
        return self.id

    def get_hotel_id(self):
        return self.hotel_id

    def get_name(self):
        return self.id

    def get_description(self):
        return self.description

    def get_type(self):
        return self.type

    def get_smoking(self):
        return self.is_smoking

    def get_max_adult(self):
        return self.max_adult

    def get_images(self):
        return self.images

    def get_amenities(self):
        return self.amenities



    