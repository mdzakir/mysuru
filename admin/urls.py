from django.conf.urls import url

from admin.views import user

urlpatterns = [
    url(r'login', user.login,name="login"),
    url(r'logout', user.logOut),
    url(r'home', user.home),
    url(r'addUser', user.addUser),
    url(r'editUser(?P<id>.*)$', user.editUser),
    url(r'deleteUser(?P<id>.*)$', user.editUser),
    url(r'details(?P<id>.*)$', user.details),
    url(r'create-hotel', user.createHotel),
    url(r'hotel-list', user.hotelList),
    url(r'user-list', user.userList),
    url(r'assignHotel', user.assign_hotel),
    url(r'unassignedhotel', user.unassigned_hotel),
    url(r'editHotel', user.edit_hotel),
]
