import json

from rest_framework import status
from datetime import datetime
from rest_framework.response import Response
from rest_framework.views import APIView
from booking.models.booking import BookingData,GuestDetails

class CreateBooking(APIView):
    def post(self, request):
        data = request.body.decode('utf-8')
        body = json.loads(data)
        refrence_id = body['refrence_id']
        hotel_id = body['hotel_id']
        checkin_date = body['checkin_date']
        checkout_date = body['checkout_date']
        no_of_adults = body['no_of_adults']
        no_of_child = body['no_of_child']
        room_id = body['room_id']
        rate_id = body['rate_id']
        total_amount = body['total_amount']
        total_tax = body['total_tax']
        guest_name = body['guest_name']
        guest_mobile = body['guest_mobile']
        guest_email = body['guest_email']
        guest_address = body['guest_address']
        no_of_rooms = body['no_of_rooms']
        special_request = body['special_request']
        payment_type = body['payment_type']
        segment = body['segment']

        guest = GuestDetails()
        guest.name = guest_name
        guest.mobile = guest_mobile
        guest.email = guest_email
        guest.address = guest_address

        booking_data = BookingData()
        booking_data.reference_id = refrence_id
        booking_data.status = 1
        booking_data.hotel_id = hotel_id
        booking_data.checkin_date = datetime.strptime(str(checkin_date), '%Y-%m-%d').date()
        booking_data.checkout_date = datetime.strptime(str(checkout_date), '%Y-%m-%d').date()
        booking_data.no_of_adults = int(no_of_adults)
        booking_data.no_of_child = int(no_of_child)
        booking_data.room_id = room_id
        booking_data.rate_id = rate_id
        booking_data.total_amount = int(total_amount)
        booking_data.total_tax = int(total_tax)
        booking_data.segment = segment
        booking_data.payment_type = payment_type
        booking_data.special_request = special_request
        booking_data.save()
        return Response("Booking Created Successfully", status=status.HTTP_201_CREATED)


