"""hotel URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.9/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url,include
from room.views import CreateRoom,ViewRoom,UpdateInventory,ViewInventory

urlpatterns = [
    url(r'^create/', CreateRoom.as_view()),
    url(r'^view/', ViewRoom.as_view()),
    url(r'^edit/', CreateRoom.as_view()),
    url(r'^inventory/', UpdateInventory.as_view()),
    url(r'^viewInventory/', ViewInventory.as_view()),
]
