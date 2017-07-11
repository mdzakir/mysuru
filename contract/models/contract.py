import datetime
from collections import defaultdict
from collections import namedtuple
import json

from django.conf import settings

from mongoengine import *


class ContractType(Enum):
    ON_DEMAND = (1,"On Demand")
    INSTANT = (2,"Instant")

    def __init__(self, id, name):
        self.name = name
        self.id = id

class ContractStatus(Enum):
    ACCEPTED_BY_HOTELIER = (1,"Hotelier Accepted")
    PENDING_FROM_HOTELIER = (2,"Pending from Hotelier")
    DECLINE_FROM_HOTELIER = (3,"Hotelier Declined")
    ACCEPTED_FROM_AGENT = (4,"Agent Accepted")
    DECLINE_FROM_AGENT = (5,"Agent Declined")
    

    def __init__(self, id, name):
        self.name = name
        self.id = id


class ContractorInfo(EmbeddedDocument):
    name = StringField()
    company_name = StringField()
    mobile = StringField()
    email = StringField()
    city = IntField()
    state = IntField()
    country = IntField()

    def get_name(self):
        return self.name

    def get_comapany_name(self):
        return self.company_name

    def get_city(self):
        return self.city

    def get_state(self):
        return self.state

    def get_country(self):
        return self.country

    def get_email(self):
        return self.email

    def get_mobile(self):
        return self.mobile


class ContractEntity(Document):
    hotel_id = StringField()
    name = StringField()
    valid_from = DateTimeField()
    valid_to = DateTimeField()
    status = IntField()
    contract_type = IntField()
    agent_info = EmbeddedDocumentField(ContractorInfo)
    hotel_info = EmbeddedDocumentField(ContractorInfo)


    def get_id(self):
        return self.id

    def get_hotel_id(self):
        return self.hotel_id

    def get_name(self):
        return self.id

    def get_valid_from(self):
        return self.valid_from

    def get_valid_to(self):
        return self.valid_to

    def get_status(self):
        return self.status

    def get_contract_type(self):
        return self.contract_type

    def get_agent_info(self):
        return self.agent_info

    def get_hotel_info(self):
        return self.hotel_info




