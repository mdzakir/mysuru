import datetime
from collections import defaultdict
from collections import namedtuple
import json

from django.conf import settings

from mongoengine import *


class RatePlanTaxDetails(EmbeddedDocument):
    tax_type = FloatField()
    tax_value = FloatField()
    rate_id = StringField()

    def get_tax_type(self):
        return self.tax_type

    def get_tax_value(self):
        return self.tax_value

    def get_rate_id(self):
        return self.rate_id

class DateRangeTaxDetails(EmbeddedDocument):
    tax_type = FloatField()
    tax_value = FloatField()
    rate_id = StringField()
    start = DateTimeField()
    end = DateTimeField()

    def get_tax_type(self):
        return self.tax_type

    def get_tax_value(self):
        return self.tax_value

    def get_rate_id(self):
        return self.rate_id

    def get_start(self):
        return self.start

    def get_end(self):
        return self.end


class TaxEntity(Document):
    product_id = StringField()
    rate_tax = ListField(EmbeddedDocumentField(RatePlanTaxDetails))
    date_tax = ListField(EmbeddedDocumentField(DateRangeTaxDetails))
    


    