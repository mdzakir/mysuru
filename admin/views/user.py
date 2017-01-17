import io
import json
import os
import time
from datetime import datetime
from datetime import timedelta

import requests
from django.conf import settings
from django.contrib.auth import authenticate
from users.models.user import User
from django.http import HttpResponse
from django.shortcuts import redirect
from django.shortcuts import render_to_response

from django.http import HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.contrib import messages
from django.contrib.messages import get_messages
from hotel.models.amenities import Amenities
from hotel.models.hotel import HotelEntity,HotelBankDetail,HotelContactPerson
from users.models.product_assignment import ProductAssignment

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def login(request):
    if "session_id" in request.session:
        return redirect('/admin/home')
    else:
        auth = request.GET['auth'] if "auth" in request else ""
        return render_to_response('adminlogin.html', {'messages': get_messages(request)})

def unassigned_hotel(request):
    user_id = request.POST['user_id']
    hotel_id = request.POST['hotel_id']
    user = User.objects.get(id=user_id)
    ProductAssignment.objects.filter(user_id=user_id, hotel_id=hotel_id).delete()
    return redirect('/admin/details?id=' + str(user.email))

def assign_hotel(request):
    if request.POST:
        user_id = request.POST['userId']
        user_name = request.POST['userName']
        products = str(request.POST['hotels']).split(",")
        for product in products:
            hotel_product = HotelEntity.objects(id=str(product)).first()
            assign = ProductAssignment(user_id=str(user_id))
            assign.hotel_id = hotel_product.id
            assign.hotel_name = hotel_product.name
            assign.save()
        return redirect('/admin/details?id=' + str(user_name))

def createHotel(request):
    if request.POST:
        name = request.POST['name']
        check_in_time = request.POST['check_in_time']
        check_out_time = request.POST['check_out_time']
        description = request.POST['description']
        address = request.POST['address']
        latitude = request.POST['latitude']
        longitude = request.POST['longitude']
        websiteUrl = request.POST['websiteUrl']
        country = request.POST['country']
        state = request.POST['state']
        city = request.POST['city']
        locality = request.POST['locality']
        star_rating = request.POST['star_rating']
        hotel_type = request.POST['property_type']
        pincode = request.POST['pincode']
        hotel_id = request.POST['hotel_id']
        contact_person_name = request.POST['contactPersonName']
        contact_person_email = request.POST['contactPersonEmail']
        contact_person_phone = request.POST['contactPersonMobile']

        bank_name = request.POST['bank_name']
        bank_branch_name = request.POST['bank_branch_name']
        bank_account_name = request.POST['bank_account_name']
        bank_account_id = request.POST['bank_account_id']
        bank_ifsc_code = request.POST['bank_ifsc_code']
        

        if hotel_id != None and hotel_id != '':
            hotelEntity = HotelEntity.objects(id=str(hotel_id)).first()
        else:
            hotelEntity = HotelEntity()

        hotelContactPerson = HotelContactPerson()
        hotelContactPerson.name = contact_person_name
        hotelContactPerson.email = contact_person_email
        hotelContactPerson.phone = contact_person_phone

        contact_person_details = list()
        contact_person_details.append(hotelContactPerson)


        hotelBankDetail = HotelBankDetail()
        hotelBankDetail.name = bank_name
        hotelBankDetail.branch_name = bank_branch_name
        hotelBankDetail.account_number = bank_account_id
        hotelBankDetail.account_name = bank_account_name
        hotelBankDetail.ifsc_code = bank_ifsc_code

        bank_detail = list()
        bank_detail.append(hotelBankDetail)

        hotelEntity.contact_person = contact_person_details
        hotelEntity.bank_detail = bank_detail

        hotelEntity.name = name
        hotelEntity.check_in_time = check_in_time
        hotelEntity.check_out_time = check_out_time
        hotelEntity.description = description
        hotelEntity.address = address
        hotelEntity.latitude = latitude
        hotelEntity.longitude = longitude
        hotelEntity.websiteUrl = websiteUrl
        hotelEntity.country = country
        hotelEntity.state = state
        hotelEntity.city = city
        hotelEntity.locality = locality
        hotelEntity.star_rating = star_rating
        hotelEntity.hotel_type = hotel_type
        hotelEntity.pincode = pincode
        hotelEntity.save()
        return redirect('/admin/hotel-list')

    else:
        return render_to_response('create_hotel.html', {'Amenities': Amenities.__members__.values()})

def edit_hotel(request):
    hotel_id = request.POST['hotel_id']
    hotel_product = HotelEntity.objects(id=str(hotel_id)).first()
    return render_to_response('create_hotel.html', { 'hotel':hotel_product})


def logOut(request):
    del request.session["session_id"]
    return redirect('/admin/login')


def home(request):
    if request.POST:
        email = request.POST['email']
        password = request.POST['password']
        user = authenticate(email=email, password=password)
        if user is not None:
            if user.is_admin:
                request.session["session_id"] = user.id
                users_list = User.objects.filter(is_admin=False)
                return render_to_response('suppliers-list_new.html', {'users': users_list})
            else:
                messages.error(request, 'Invalid Email Id or Password')
                return redirect('/admin/login')
        else:
            messages.error(request, 'Invalid Email Id or Password')
            return redirect('/admin/login', kwargs={'auth': False})

    else:
        users_list = User.objects.filter(is_admin=False)
        return render_to_response('suppliers-list_new.html', {'users': users_list})

def userList(request):
    users_list = User.objects.filter(is_admin=False)
    return render_to_response('suppliers-list_new.html', {'users': users_list})


def hotelList(request):
    hotel_list = HotelEntity.objects().all()
    return render_to_response('hotel-list.html', {'hotels': hotel_list})


def addUser(request):
    if request.POST:
        password = request.POST['password']
        first_name = request.POST['first_name']
        last_name = request.POST['last_name']
        phone = request.POST['phone']
        email = request.POST['email']
        id = request.POST['id']
        user = None
        if id != "":
            user = User.objects.get(id=id)
        if user is not None:
            try:
                user = user.update_user(first_name=first_name, last_name=last_name, phone=phone, email=email,
                                        password=password)
            except:
                return render_to_response('create_user_new.html', {'message': 'User already exist with ' + email})

            return redirect('/admin/home')
        else:
            try:
                User.objects.create_user(first_name=first_name, last_name=last_name, phone=phone,
                                         email=email,
                                         password=password)
            except:
                return render_to_response('create_user_new.html', {'message': 'User already exist with ' + email})

            return redirect('/admin/home')
    else:
        return render_to_response('create_user_new.html')


def editUser(request, id):
    if "session_id" in request.session:
        email = request.GET['id']
        user = User.objects.get(email=email)
        return render_to_response('create_user_new.html', {'user': user})
    else:
        return redirect('/admin/login')


def details(request, id):
    if "session_id" in request.session:
        email = request.GET['id']
        user = User.objects.get(email=email)
        hotel_list = HotelEntity.objects().all()
        assigned_products = ProductAssignment.objects.filter(user_id=user.id)
        assigned_hotel_ids = [ah.hotel_id for ah in assigned_products]
        assigned_hotels = [hotel for hotel in hotel_list() if str(
            hotel.id) in assigned_hotel_ids]
        non_assigned_hotels = [hotel for hotel in hotel_list() if str(
            hotel.id) not in assigned_hotel_ids]
        return render_to_response('supplier-details_new.html',
                                  {'hotels': non_assigned_hotels, 'user': user, 'assigned_hotel_list': assigned_hotels})
    else:
        return redirect('/admin/login')
