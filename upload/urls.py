# -*- coding: utf-8 -*-
from django.conf.urls import patterns, url
from upload.views import UploadFile

urlpatterns = [
    url(r'^list/', UploadFile.as_view()),
]