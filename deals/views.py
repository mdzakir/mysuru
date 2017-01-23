import json

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from deals.models.deals import DealEntity
from bson import BSON
from bson import json_util
from datetime import datetime,timedelta

class CreateDeal(APIView):
    def post(self, request):
        data = request.body.decode('utf-8')
        body = json.loads(data)
        name = body['name']
        description = body['description']
        hotel_id = body['hotel_id']
        type = body['type']
        discount_type = body['discount_type']
        discount_value = body['discount_value']
        rooms = body['rooms']
        rate_plans = body['rate_plans']
        booking_period = body['booking_period']
        check_in_period = body['check_in_period']
        deal_status = body['status']

        dealEntity = None
        if 'deal_id' in body:
            deal_id = body['deal_id']
            dealEntity = DealEntity.objects(id=str(deal_id))
        else:
            dealEntity = DealEntity()

        dealEntity.name = name
        dealEntity.status = 1
        dealEntity.description = description
        dealEntity.hotel_id = hotel_id
        dealEntity.type = type
        dealEntity.rate_plans = rate_plans
        dealEntity.rooms = rooms
        dealEntity.discount_type = discount_type
        dealEntity.discount_value = discount_value
        dealEntity.save()
        return Response('created', status=status.HTTP_201_CREATED)

class ViewDeal(APIView):
    def get(self, request):
    	deal_list = list()
    	hotel_id = request.GET['hotel_id']
    	deal_status = request.GET['status']
    	deals = DealEntity.objects.filter(hotel_id=str(hotel_id))
    	if deals:
    		for deal in deals:
    			deal_data =  {
	                'id': str(deal.id),
	                'hotel_id': str(deal.hotel_id),
	                'name': str(deal.name),
	                'description': str(deal.description),
                    'deal_status': deal.status,
                    'type': str(deal.type),
                    'ratePlans': deal.rate_types,
                    'rooms': deal.room_types,
                    'discount_type': str(deal.discount_type),
                    'discount_value': str(deal.discount_value),
                    'check_in_period': str(deal.check_in_period),
                    'booking_period': str(deal.booking_period)
            	}
    			deal_list.append(deal_data)
    		return Response(json.loads(json.dumps(deal_list)), status=status.HTTP_200_OK)
    	else:
    		return Response('No deal Created', status=status.HTTP_200_OK)
