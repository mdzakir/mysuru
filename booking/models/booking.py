import datetime
from collections import defaultdict
from collections import namedtuple
import json

from django.conf import settings

from mongoengine import *
from enum import Enum


class AgentDetails(EmbeddedDocument):
    id = IntField()
    name = StringField()
    mobile = StringField()
    email = StringField()

    def get_name(self):
        return self.name

    def get_id(self):
        return self.id

    def get_mobile(self):
        return self.mobile

    def get_email(self):
        return self.email

class GuestDetails(EmbeddedDocument):
    name = StringField()
    mobile = StringField()
    email = StringField()
    address = StringField()

    def get_name(self):
        return self.name

    def get_mobile(self):
        return self.mobile

    def get_email(self):
        return self.email

    def get_address(self):
        return self.address

class PaymentDetail(EmbeddedDocument):
    transaction_id = StringField()
    card_holder_name = StringField()
    card_number = StringField()
    cvv = StringField()
    expieryDate = StringField()

class RoomDailyPrice(EmbeddedDocument):
    date = StringField()
    price = StringField()

class RoomPrice(EmbeddedDocument):
    room_id = StringField()
    name = StringField()
    price = ListField(EmbeddedDocumentField(RoomDailyPrice))

    def get_room_id(self):
        return self.room_id

    def get_name(self):
        return self.name

    def get_price(self):
        return self.price

class BookingData(Document):
    hotel_id = StringField()
    reference_id = StringField()
    room_id = StringField()
    rate_id = StringField()
    status = IntField()
    no_of_rooms = IntField()
    room_night = IntField()
    total_adult = IntField()
    total_child = IntField()
    generation_time = DateTimeField()
    check_in = DateTimeField()
    check_out = DateTimeField()
    total_amount = LongField()
    total_tax = LongField()
    total_commition = LongField()
    logged_user_id = LongField()
    guest_detail = EmbeddedDocumentField(GuestDetails)
    transaction_id = LongField()
    special_request = StringField()
    room_prices = ListField(EmbeddedDocumentField(RoomPrice))
    payment_type = IntField()
    payment_details = EmbeddedDocumentField(PaymentDetail)
    agent_details = EmbeddedDocumentField(AgentDetails)
    segment = IntField()
    
    def get_id(self):
        return self.id

    def get_hotel_id(self):
        return self.hotel_id

    def get_reference_id(self):
        return self.reference_id

    def get_room_id(self):
        return self.room_id

    def get_rate_id(self):
        return self.rate_id

    def get_status(self):
        return self.status

    def get_generation_time(self):
        return self.generation_time

    def get_check_in(self):
        return self.check_in

    def get_check_out(self):
        return self.check_out

    def get_total_amount(self):
        return self.total_amount

    def get_total_tax(self):
        return self.total_tax

    def get_total_commition(self):
        return self.total_commition

    def get_logged_user_id(self):
        return self.logged_user_id

    def get_guest_detail(self):
        return self.guest_detail

    def get_transaction_id(self):
        return self.transaction_id


    

class BookingSource(Enum):
    TRAVEL_AGENT = (1,"Travel Agent")
    WEBSITE = (2,"Website")
    CORPORATE = (3,"Corporate")

    def __init__(self, id, name):
        self.type_name = name
        self.type_id = id

    @classmethod
    def get_id(cls, name):
        booking_type_details = cls.__members__.values()
        for booking_type in booking_type_details:
            if booking_type.name == name:
                return booking_type.type_id
        return -1

    @classmethod
    def get_name(cls, id):
        booking_type_details = cls.__members__.values()
        for booking_type in booking_type_details:
            if booking_type.type_id == id:
                return booking_type.type_name
        return None