import datetime
from collections import defaultdict
from collections import namedtuple
import json
from enum import Enum
from django.conf import settings
from mongoengine import *


class ContractType(Enum):
    ON_DEMAND = (1,"On Demand")
    INSTANT = (2,"Instant")

    def __init__(self, id, name):
        self.type_name = name
        self.type_id = id

    @classmethod
    def get_id(cls, name):
        contract_type_details = cls.__members__.values()
        for contract_type in contract_type_details:
            if contract_type.name == name:
                return contract_type.type_id

        return -1

    @classmethod
    def get_name(cls, id):
        contract_type_details = cls.__members__.values()
        for contract_type in contract_type_details:
            if contract_type.type_id == id:
                return contract_type.type_name

        return None

class ContractStatus(Enum):
    INITATIVE = (1,"Initiate")
    ACCEPTED_BY_HOTELIER = (2,"Hotelier Accepted")
    PENDING_FROM_HOTELIER = (3,"Pending from Hotelier")
    DECLINE_FROM_HOTELIER = (4,"Hotelier Declined")
    ACCEPTED_FROM_AGENT = (5,"Agent Accepted")
    DECLINE_FROM_AGENT = (6,"Agent Declined")
    

    def __init__(self, id, name):
        self.type_name = name
        self.type_id = id

    @classmethod
    def get_id(cls, name):
        contract_details = cls.__members__.values()
        for contract in contract_details:
            if contract.name == name:
                return contract.type_id

        return -1

    @classmethod
    def get_name(cls, id):
        contract_details = cls.__members__.values()
        for contract in contract_details:
            if contract.type_id == id:
                return contract.type_name

        return None


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
    hotel_name = StringField()
    valid_from = DateTimeField()
    valid_to = DateTimeField()
    creation_time = DateTimeField()
    status = IntField()
    note = StringField(default='')
    contract_type = IntField()
    sender_info = EmbeddedDocumentField(ContractorInfo)
    receiver_info = EmbeddedDocumentField(ContractorInfo)


    def get_id(self):
        return self.id

    def get_hotel_id(self):
        return self.hotel_id

    def get_hotel_name(self):
        return self.hotel_name

    def get_valid_from(self):
        return self.valid_from

    def get_valid_to(self):
        return self.valid_to

    def get_status(self):
        return self.status

    def get_contract_type(self):
        return self.contract_type

    def get_sender_info(self):
        return self.agent_info

    def get_receiver_info(self):
        return self.hotel_info




