import json

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from bson import BSON
from bson import json_util
from datetime import datetime,timedelta
from room.models.room import RoomEntity,RoomImage
from ratePlan.models.rate_plan import RatePlanEntity

class Search(APIView):
    def get(self, request):
        data = request.body.decode('utf-8')
        body = json.loads(data)
        hotel_id = body['hotel_id']
        start_date = body['start_date']
        end_date = body['end_date']
        rooms = body['rooms']
        adults = body['adults']
        child = body['child']
        #getting rooms
        rooms = RoomEntity.objects(hotel_id=str(hotel_id))

        #getting ratePlans
        ratePlans = RatePlanEntity.objects(hotel_id=str(hotel_id))

        data =  {
            'id': str(deal.id),
            'hotel_id': str(deal.hotel_id),
            'name': str(deal.name),
            'check_in_period': {
                                  'start_date':deal.checkIn.start.strftime('%d-%m-%Y'),
                                  'end_date':deal.checkIn.end.strftime('%d-%m-%Y'),
                                  'days':deal.checkIn.days,
                                  'blackout_date':check_in_blackout,
                                },
            'booking_period': {
                                  'start_date':deal.booking.start.strftime('%d-%m-%Y'),
                                  'end_date':deal.booking.end.strftime('%d-%m-%Y'),
                                  'days':deal.booking.days,
                                  'blackout_date':booking_blackout,
                                },
            'description': str(deal.description),
            'deal_status': deal.status,
            'type': str(deal.type),
            'ratePlans': deal.rate_types,
            'rooms': deal.room_types,
            'discount_type': str(deal.discount_type),
            'discount_value': str(deal.discount_value)
            
        }
            return Response(json.loads(json.dumps(deal_list)), status=status.HTTP_200_OK)
        else:
            return Response('No deal Created', status=status.HTTP_200_OK)
