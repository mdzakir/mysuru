from rest_framework_jwt.views import obtain_jwt_token
from rest_framework_jwt.views import refresh_jwt_token
from django.conf.urls import url, include

from users.views import user

urlpatterns = [
    url(r'^createuser$', user.CreateUser.as_view()),
    url(r'^changepassword/', user.ChangePassword.as_view()),
    url(r'^changestatus/', user.ChangeStatus.as_view()),
    url(r'^assignproduct', user.AssignProducts.as_view()),
    url(r'^products', user.UserProducts.as_view()),
    url(r'^users', user.Users.as_view()),
    url(r'^auth/status', user.AuthenticationStatus.as_view()),
    url(r'^auth', obtain_jwt_token),
    url(r'^travelAgents', user.TravelAgents.as_view()),
    url(r'^hoteliers', user.Hotelier.as_view()),
    url(r'^corporates', user.Corporates.as_view()),
]
