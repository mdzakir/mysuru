import json
import collections

from rest_framework import status
from datetime import datetime,timedelta
from rest_framework.response import Response
from ratePlan.models.rate_plan import RatePlanEntity, RateplanInclusions, RateplanExclusions, RateplanBlackoutDates, RatePlanCancellationPolicy
from ratePlan.models.prices import Price,PriceDetails
from rest_framework.views import APIView
from room.models.room import RoomEntity
from dateutil.parser import parse

class CreateRatePlan(APIView):
    def post(self, request):
        data = request.body.decode('utf-8')
        body = json.loads(data)
        name = body['name']
        description = body['description']
        hotel_id = body['hotel_id']
        valid_from = body['rateplan_validity_start']
        valid_to = body['rateplan_validity_end']
        applicable_days = body['applicable_days']
        min_adult = body['min_adults']
        max_adult = body['max_adults']
        min_length_of_stay = body['min_los']
        max_length_of_stay = body['max_los']
        min_no_of_rooms = body['min_rooms']
        max_no_of_rooms = body['max_rooms']
        cut_of_days = body['cut_off_days']
        inclusions = body['inclusions']
        exclusions = body['exclusions']
        blackout_dates = body['blackout_dates']
        allow_modification = body['allow_modification']
        cancellation_policy = body['cancellation_policy']
        data_updated = ''
        ratePlanEntity = None
        if 'rate_id' in body:
            rate_id = body['rate_id']
            ratePlanEntity = RatePlanEntity.objects(id=str(rate_id))[0]
            data_updated = 'Updated'
        else:
            ratePlanEntity = RatePlanEntity()
            data_updated = 'Created'

        inclusionsList = list()
        for inclusion in inclusions:
            inc = RateplanInclusions()
            inc.name = inclusion['name']
            inclusionsList.append(inc)

        exclusionsList = list()
        for exclusion in exclusions:
            exc = RateplanExclusions()
            exc.name = exclusion['name']
            exclusionsList.append(exc)

        blackoutsList = list()
        for blackout in blackout_dates:
            blkout = RateplanBlackoutDates()
            blkout.start = blackout['start']
            blkout.end = blackout['end']
            blackoutsList.append(blkout)

        cpList = list()
        for canc_policy in cancellation_policy:
            cp = RatePlanCancellationPolicy()
            cp.from_checkin = canc_policy['from_checkin']
            cp.to_checkin = canc_policy['to_checkin']
            cp.amount = canc_policy['amount']
            cp.amount_type = canc_policy['amount_type']
            cpList.append(cp)

        ratePlanEntity.name = name
        ratePlanEntity.status = 1
        ratePlanEntity.description = description
        ratePlanEntity.hotel_id = hotel_id
        ratePlanEntity.valid_from = datetime.strptime(str(valid_from), '%d-%m-%Y').date()
        ratePlanEntity.valid_to = datetime.strptime(str(valid_to), '%d-%m-%Y').date()
        ratePlanEntity.min_adult = int(min_adult)
        ratePlanEntity.max_adult = int(max_adult)
        ratePlanEntity.min_length_of_stay = int(min_length_of_stay)
        ratePlanEntity.max_length_of_stay = int(max_length_of_stay)
        ratePlanEntity.min_no_of_rooms = int(min_no_of_rooms)
        ratePlanEntity.max_no_of_rooms = int(max_no_of_rooms)
        ratePlanEntity.cut_of_days = int(cut_of_days)
        ratePlanEntity.inclusions = inclusionsList
        ratePlanEntity.exclusions = exclusionsList
        ratePlanEntity.blackout_dates = blackoutsList
        ratePlanEntity.allow_modification = True
        ratePlanEntity.cancellation_policy = cpList
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

        ratePlanEntity = RatePlanEntity.objects(id=str(rate_id),hotel_id=str(hotel_id))[0]
        #Inactive Status =2 , 3 for delete
        ratePlanEntity.status = int(rate_status)
        ratePlanEntity.save()
        return Response('Updated room status : ' + rate_id, status=status.HTTP_200_OK)

class ViewRatePlan(APIView):
    def get(self, request):
    	rate_list = list()
    	hotel_id = request.GET['hotel_id']
    	rates = RatePlanEntity.objects(hotel_id=str(hotel_id),status=1)
    	if rates:
            for rate in rates:

                inclusions = list()
                for inc in rate.inclusions:
                    inclusion_data = {
                    'name':inc.name
                    }
                    inclusions.append(inclusion_data)

                exclusions = list()
                for exc in rate.exclusions:
                    exclusion_data = {
                    'name':exc.name
                    }
                    exclusions.append(exclusion_data)

                blackouts = list()
                for blk in rate.close_out_preiod:
                    blk_data = {
                    'start':blk.start,
                    'end':blk.end
                    }
                    blackouts.append(blk_data)

                canc_policies = list()
                for cp in rate.cancellation_policy:
                    cp = {
                    'from_checkin':cp.from_checkin,
                    'to_checkin':cp.to_checkin,
                    'amount_type':cp.amount_type,
                    'amount':cp.amount
                    }
                    canc_policies.append(cp)

                rate_data =  {
                    'id': str(rate.id),
                    'hotel_id': str(rate.hotel_id),
                    'name': str(rate.name),
                    'description': str(rate.description),
                    'status' : rate.status,
                    'rateplan_validity_start' : rate.valid_from.strftime('%Y-%m-%d'),
                    'rateplan_validity_end' : rate.valid_to.strftime('%Y-%m-%d'),
                    'blackout_dates' : blackouts,
                    'min_adults' : rate.min_adult,
                    'max_adults' : rate.max_adult,
                    'min_los' : rate.min_length_of_stay,
                    'max_los' : rate.max_length_of_stay,
                    'min_no_of_rooms' : rate.min_no_of_rooms,
                    'max_no_of_rooms' : rate.max_no_of_rooms,
                    'inclusions' : inclusions,
                    'exclusions' : exclusions,
                    'allow_modification' : rate.allow_modification,
                    'cancellation_policy' : canc_policies,
                    'cut_off_days' : rate.cut_of_days,
                }
                rate_list.append(rate_data)
            return Response(json.loads(json.dumps(rate_list)), status=status.HTTP_200_OK)
    	else:
    		return Response('created', status=status.HTTP_200_OK)


class UpdatePrice(APIView):
    def post(self, request):
        data = request.body.decode('utf-8')
        body = json.loads(data)
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

class ViewPricingAction(APIView):
    def get(self, request):
        price_list = list()
        data = request.body.decode('utf-8')
        hotel_id = request.GET['hotel_id']
        start_date = request.GET['start_date']
        end_date = request.GET['end_date']
        start = parse(start_date)
        end = parse(end_date)
        rooms = RoomEntity.objects.filter(hotel_id=str(hotel_id),status=1)
        ratePlans = RatePlanEntity.objects.filter(hotel_id=str(hotel_id),status=1)
        if ratePlans:
            for ratePlan in ratePlans:
                room_dict = {}
                room_dict['rate_plan_id'] = str(ratePlan.id)
                room_dict['rate_plan_name'] = str(ratePlan.name)
                if rooms:
                    for room in rooms:
                        room_dict['room_id'] = str(room.id)
                        room_dict['room_name'] = str(room.name)
                        priceList = Price.objects.filter(room_id=str(room.id),rate_id=str(ratePlan.id),date__gte = start ,date__lte = end)
                        if priceList is not None:
                            price_dict = {}
                            for prc in priceList:
                                price_data = {}
                                for price_value in prc.price:
                                    price_data[price_value.occupancy] = price_value.price

                                data =  {
                                    'room_id': str(prc.room_id),
                                    'rate_id': str(prc.rate_id),
                                    'date': str(prc.date),
                                    'price': price_data
                                }
                                price_dict[prc.date.strftime('%Y-%m-%d')] = data
                            room_dict['price_list'] = price_dict

                        price_list.append(room_dict)

        return Response(json.loads(json.dumps(price_list)), status=status.HTTP_200_OK)
