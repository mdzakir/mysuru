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
from hotel.views import AmenitiesView,HotelBasicDetails,ContactDetails,BankDetails,HotelMap

urlpatterns = [
    url(r'^amenities', AmenitiesView.as_view()),
    url(r'^basic', HotelBasicDetails.as_view()),
    url(r'^contacts', ContactDetails.as_view()),
    url(r'^bank_details', BankDetails.as_view()),
    url(r'^hotel_map', HotelMap.as_view()),
]
