"""mysore URL Configuration
"""
from django.conf.urls import url,include
# from django.contrib import admin
from django.conf.urls.static import static
from django.conf import settings


urlpatterns = [
    # url(r'^admin/', admin.site.urls),
    url(r'^admin/', include('admin.urls')),
    url(r'^hotel/', include('hotel.urls')),
    url(r'^user/', include('users.urls')),
    url(r'^room/', include('room.urls')),
    url(r'^ratePlan/', include('ratePlan.urls')),
    url(r'^booking/', include('booking.urls')),
    url(r'^deal/', include('deals.urls')),
    url(r'^search/', include('search.urls')),
    url(r'^promotion/', include('promotion.urls')),
    url(r'^tax/', include('taxes.urls'))
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
