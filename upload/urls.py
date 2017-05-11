# -*- coding: utf-8 -*-
from django.conf.urls import patterns, url
from upload.views import UploadFile

urlpatterns = [
    url(r'^upload/', UploadFile.as_view()),
]