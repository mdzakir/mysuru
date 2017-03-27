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
from ratePlan.views import CreateRatePlan,ViewRatePlan,UpdateStatus,UpdatePrice, ViewPricing

urlpatterns = [
    url(r'^create/', CreateRatePlan.as_view()),
    url(r'^view', ViewRatePlan.as_view()),
    url(r'^edit/', CreateRatePlan.as_view()),
    url(r'^updateStatus/', UpdateStatus.as_view()),
    url(r'^price/', UpdatePrice.as_view()),
    url(r'^viewPricing/', ViewPricing.as_view())
]
