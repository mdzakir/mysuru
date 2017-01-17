from __future__ import unicode_literals

from django.db import models


# Create your models here.

class ProductAssignment(models.Model):
    user_id = models.IntegerField()
    hotel_id = models.CharField(max_length=30)
    hotel_name = models.CharField(max_length=100)

    @classmethod
    def for_user(cls, user_id):
        assignments = cls.objects.filter(user_id=user_id).order_by('hotel_name')
        return [{'name': assign.hotel_name, 'id': assign.hotel_id} for assign in assignments]

