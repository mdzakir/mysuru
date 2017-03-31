# -*- coding: utf-8 -*-
from django.db import models


def get_file_path(instance, filename):
    return 'upload/%s/%s' % (instance.file_path,filename)

class Document(models.Model):
    file_path = models.TextField()
    docfile = models.FileField(upload_to= get_file_path)
