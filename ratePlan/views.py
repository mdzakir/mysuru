import json
import collections

from rest_framework import status
from datetime import datetime,timedelta
from rest_framework.response import Response
from rest_framework.views import APIView
from ratePlan.models.rate_plan import RatePlanEntity
from ratePlan.models.prices import Price,PriceDetails

class CreateRatePlan(APIView):
    def post(self, request):
        data = request.body.decode('utf-8')
        body = json.loads(data)
        name = body['name']
        description = body['description']
        hotel_id = body['hotel_id']
        valid_from = body['valid_from']
        valid_to = body['valid_to']
        min_adult = body['min_adult']
        max_adult = body['max_adult']
        min_length_of_stay = body['min_length_of_stay']
        max_length_of_stay = body['max_length_of_stay']
        min_no_of_rooms = body['min_no_of_rooms']
        max_no_of_rooms = body['max_no_of_rooms']
        cut_of_days = body['cut_of_days']
        inclusions = body['inclusions']
        exclusions = body['exclusions']
        close_out_period = body['close_out_period']
        allow_modification = body['allow_modification']
        cancellation_policy = body['cancellation_policy']
        data_updated = ''
        ratePlanEntity = None
        if 'rate_id' in body:
            rate_id = body['rate_id']
            ratePlanEntity = RatePlanEntity.objects(id=str(rate_id)).first()
            data_updated = 'Updated'
        else:
            ratePlanEntity = RatePlanEntity()
            data_updated = 'Created'

        ratePlanEntity.name = name
        ratePlanEntity.status = 1
        ratePlanEntity.description = description
        ratePlanEntity.hotel_id = hotel_id
        ratePlanEntity.valid_from = datetime.strptime(str(valid_from), '%Y-%m-%d').date()
        ratePlanEntity.valid_to = datetime.strptime(str(valid_to), '%Y-%m-%d').date()
        ratePlanEntity.min_adult = int(min_adult)
        ratePlanEntity.max_adult = int(max_adult)
        ratePlanEntity.min_length_of_stay = int(min_length_of_stay)
        ratePlanEntity.max_length_of_stay = int(max_length_of_stay)
        ratePlanEntity.min_no_of_rooms = int(min_no_of_rooms)
        ratePlanEntity.max_no_of_rooms = int(max_no_of_rooms)
        ratePlanEntity.cut_of_days = int(cut_of_days)
        ratePlanEntity.inclusions = list()
        ratePlanEntity.exclusions = list()
        ratePlanEntity.close_out_preiod = list()
        ratePlanEntity.allow_modification = True
        ratePlanEntity.cancellation_policy = list()
        ratePlanEntity.save()
        return Response(data_updated, status=status.HTTP_201_CREATED)

class UpdateStatus(APIView):
    def get(self, request):
        hotel_id = request.GET['hotel_id']
        rate_id = request.GET['rate_id']
        rate_status = request.GET['status']

        if rate_status == 'ACTIVE':
            rate_status = 1
        elif rate_status == 'INACTIVE':
            rate_status = 2
        elif rate_status == 'DELETED':
            rate_status = 3

        ratePlanEntity = RatePlanEntity.objects(id=str(rate_status),hotel_id=str(hotel_id))
        #Inactive Status =2 , 3 for delete
        ratePlanEntity.status = int(rate_status)
        ratePlanEntity.save()
        return Response('Updated room status' + room_id, status=status.HTTP_200_OK)

class ViewRatePlan(APIView):
    def get(self, request):
    	rate_list = list()
    	hotel_id = request.GET['hotel_id']
    	rates = RatePlanEntity.objects(hotel_id=str(hotel_id))
    	if rates:
            for rate in rates:
                rate_data =  {
                    'id': str(rate.id),
                    'hotel_id': str(rate.hotel_id),
                    'name': str(rate.name),
                    'description': str(rate.description),
                }
                rate_list.append(rate_data)
            return Response(json.loads(json.dumps(rate_list)), status=status.HTTP_200_OK)
    	else:
    		return Response('created', status=status.HTTP_200_OK)


class UpdatePrice(APIView):
    def post(self, request):
        data = request.body.decode('utf-8')
        body = json.loads(data)
        hotel_id = body['hotel_id']
        room_id = body['room_id']
        rate_id = body['rate_id']
        start_date = body['start_date']
        end_date = body['end_date']
        price_details = body['price_details']

        price_detail_list = list()
        for key,value in price_details.items():
            priceDetail = PriceDetails()
            priceDetail.occupancy = int(key)
            priceDetail.price = int(value)
            price_detail_list.append(priceDetail)


        start = datetime.strptime(str(start_date), '%Y-%m-%d').date()
        end = datetime.strptime(str(end_date), '%Y-%m-%d').date()+ timedelta(1)

        for single_date in daterange(start, end):
            price = Price.objects.filter(room_id=str(room_id),date = single_date,rate_id=str(rate_id)).first()
            if price:
                price.price = price_detail_list
                price.save()
            else:
                day_price = Price()
                day_price.room_id = room_id
                day_price.rate_id = rate_id
                day_price.date = single_date
                day_price.price = price_detail_list
                day_price.save()
        return Response('price updated', status=status.HTTP_200_OK)


def daterange(start_date, end_date):
    for n in range(int ((end_date - start_date).days)):
        yield start_date + timedelta(n)
