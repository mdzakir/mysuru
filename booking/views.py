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
        booking_data.reference_id = "REVKEY-"+str(datetime.now().microsecond)
        booking_data.status = 1
        booking_data.hotel_id = hotel_id
        booking_data.check_in = datetime.strptime(str(checkin_date), '%Y-%m-%d').date()
        booking_data.check_out = datetime.strptime(str(checkout_date), '%Y-%m-%d').date()
        booking_data.total_adult = int(no_of_adults)
        booking_data.total_child = int(no_of_child)
        booking_data.room_id = room_id
        booking_data.rate_id = rate_id
        booking_data.total_amount = int(total_amount)
        booking_data.total_tax = int(total_tax)
        booking_data.segment = segment
        booking_data.payment_type = payment_type
        booking_data.special_request = special_request
        booking_data.generation_time = datetime.now()
        booking_data.guest_detail = guest
        booking_data.no_of_rooms = no_of_rooms
        booking_data.save()
        return Response("Booking Created Successfully", status=status.HTTP_201_CREATED)




class ViewBookings(APIView):
    def post(self, request):
        booking_list = list()
        data = request.body.decode('utf-8')
        body = json.loads(data)
        hotel_id = body['hotel_id']
        room_status = body['status']
        start_date = body['start_date']
        end_date = body['end_date']
        start = datetime.strptime(str(start_date), '%Y-%m-%d').date()
        end = datetime.strptime(str(end_date), '%Y-%m-%d').date()
        bookings = BookingData.objects.filter(hotel_id=str(hotel_id))
        # bookings = BookingData.objects.filter(hotel_id=str(hotel_id),check_in__gte= start,check_out__lte= start)
        if bookings:
            for booking in bookings:
                booking_data =  {
                    'reference_id': str(booking.reference_id),
                    'hotel_id': str(booking.hotel_id),
                    'room_id': str(booking.room_id),
                    'rate_id': str(booking.rate_id),
                    'total_amount': str(booking.total_amount),
                    'total_tax': str(booking.total_tax),
                    'checkin_date': str(booking.check_in.strftime('%d %b %Y')),
                    'checkout_date': str(booking.check_out.strftime('%d %b %Y')),
                    'special_request': str(booking.special_request),
                    'no_of_adults': int(booking.total_adult),
                    'no_of_child': int(booking.total_child),
                    'no_of_rooms': booking.no_of_rooms,
                    'guest_name': booking.guest_detail.name,
                    'guest_mobile': booking.guest_detail.mobile,
                    'guest_email': booking.guest_detail.email,
                    'guest_address': booking.guest_detail.address,
                    'segment': str(booking.segment),
                    'payment_type': str(booking.payment_type),
                    'generation_time': str(booking.generation_time.strftime('%d %b %Y %H:%S')),
                    'status': str(booking.status)
                }
                booking_list.append(booking_data)
            return Response(json.loads(json.dumps(booking_list)), status=status.HTTP_200_OK)
        else:
            return Response('No Booking found', status=status.HTTP_200_OK)