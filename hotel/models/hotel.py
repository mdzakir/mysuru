import datetime
from collections import defaultdict
from collections import namedtuple
import json

from django.conf import settings

from mongoengine import *

class HotelTax(EmbeddedDocument):
    tax_type = IntField()
    amount = IntField()

    def get_tax_type(self):
        return self.tax_type

    def get_amount(self):
        return self.amount

class HotelContactPerson(EmbeddedDocument):
    name = StringField()
    phone = StringField()
    designation = StringField()
    email = StringField()

    def get_name(self):
        return self.name

    def get_phone(self):
        return self.phone

    def get_designation(self):
        return self.designation

    def get_email(self):
        return self.email

class HotelCancellationPolicy(EmbeddedDocument):
    from_checkin = StringField()
    to_checkin = StringField()
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

class HotelImage(EmbeddedDocument):
    name = StringField()
    url = StringField()
    order = IntField()

    def get_name(self):
        return self.name

    def get_url(self):
        return self.url

    def get_order(self):
        return self.order

class HotelDistance(EmbeddedDocument):
    name = StringField()
    distance = IntField()

    def get_name(self):
        return self.name

    def get_distance(self):
        return self.distance

class HotelBankDetail(EmbeddedDocument):
    name = StringField()
    branch_name = StringField()
    account_number= StringField()
    account_name = StringField()
    ifsc_code = StringField()

    def get_name(self):
        return self.name

    def get_branch_name(self):
        return self.branch_name

    def get_account_number(self):
        return self.account_number
   
    def get_account_name(self):
        return self.account_name

    def get_ifsc_code(self):
        return self.ifsc_code


class HotelEntity(Document):
    name = StringField()
    check_in_time = StringField()
    check_out_time = StringField()
    description = StringField()
    distance_form = ListField(EmbeddedDocumentField(HotelDistance))
    bank_detail = ListField(EmbeddedDocumentField(HotelBankDetail))
    capacity = IntField(default=0)
    address = StringField()
    contact_person = ListField(EmbeddedDocumentField(HotelContactPerson))
    latitude = StringField()
    longitude = StringField()
    websiteUrl = StringField()
    amenities = ListField()
    images = ListField(EmbeddedDocumentField(HotelImage))
    country = StringField()
    state = StringField()
    city = StringField()
    locality = StringField()
    star_rating = IntField()
    hotel_contact_no = IntField()
    hotel_type = IntField()
    pincode = IntField()
    cancellation_policy = ListField(EmbeddedDocumentField(HotelCancellationPolicy))
    taxes = EmbeddedDocumentField(HotelTax)

    def get_id(self):
        return self.id

    def get_websiteUrl(self):
        return self.websiteUrl

    def get_description(self):
        return self.description

    def get_check_in_time(self):
        return self.check_in_time

    def get_check_out_time(self):
        return self.check_out_time

    def get_distance_form(self):
        return self.distance_form

    def get_bank_detaile(self):
        return self.bank_detaile

    def get_name(self):
        return self.name

    def get_capacity(self):
        return self.capacity

    def get_address(self):
        return self.address
   
    def get_contact_person(self):
        return self.contact_person

    def get_latitude(self):
        return self.latitude

    def get_longitude(self):
        return self.longitude

    def get_amenities(self):
        return self.amenities
    
    def get_images(self):
        return self.images

    def get_country(self):
        return self.country

    def get_state(self):
        return self.state

    def get_locality(self):
        return self.locality

    def get_star_rating(self):
        return self.star_rating

    def get_hotel_contact_no(self):
        return self.hotel_contact_no

    def get_hotel_type(self):
        return self.hotel_type

    def get_cancellation_policy(self):
        return self.cancellation_policy

    def get_taxes(self):
        return self.taxes

    