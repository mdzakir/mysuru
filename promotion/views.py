import json

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from promotion.models.promotion import PromotionEntity,Period
from bson import BSON
from bson import json_util
from datetime import datetime,timedelta

class CreatePromotion(APIView):
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
        code = body['code']

        promotionEntity = None
        if 'deal_id' in body:
            deal_id = body['deal_id']
            promotionEntity = PromotionEntity.objects(id=str(deal_id))
        else:
            promotionEntity = PromotionEntity()

        #booking period

        bookingPeriod = Period()
        booking_black_out_dates = list()
        for date in booking_period['blackout_date']:
            booking_black_out_dates.append(datetime.strptime(str(date), '%d-%m-%Y').date())

        bookingPeriod.start = datetime.strptime(str(booking_period['start_date']), '%d-%m-%Y').date()
        bookingPeriod.end = datetime.strptime(str(booking_period['end_date']), '%d-%m-%Y').date()
        bookingPeriod.days = list(booking_period['days'])
        bookingPeriod.black_out_dates = booking_black_out_dates

        #checkin period
        checkinPeriod = Period()
        checkin_black_out_dates = list()
        for date in check_in_period['blackout_date']:
            checkin_black_out_dates.append(datetime.strptime(str(date), '%d-%m-%Y').date())

        checkinPeriod.start = datetime.strptime(str(check_in_period['start_date']), '%d-%m-%Y').date()
        checkinPeriod.end = datetime.strptime(str(check_in_period['end_date']), '%d-%m-%Y').date()
        checkinPeriod.days = list(check_in_period['days'])
        checkinPeriod.black_out_dates = checkin_black_out_dates

        promotionEntity.name = name
        promotionEntity.status = 1
        promotionEntity.description = description
        promotionEntity.hotel_id = hotel_id
        promotionEntity.type = type
        promotionEntity.rate_types = list(rate_plans)
        promotionEntity.room_types = list(rooms)
        promotionEntity.discount_type = discount_type
        promotionEntity.discount_value = discount_value
        promotionEntity.checkIn = checkinPeriod
        promotionEntity.booking = bookingPeriod
        promotionEntity.code = code
        promotionEntity.save()
        return Response('created', status=status.HTTP_201_CREATED)

class ViewPromotion(APIView):
    def get(self, request):
        promotion_list = list()
        hotel_id = request.GET['hotel_id']
        deal_status = request.GET['status']
        if 'promotion_id' in request.GET:
            promotion_id = request.GET['promotion_id']
            promotions = PromotionEntity.objects.filter(hotel_id=str(hotel_id),id=str(promotion_id))
        else:
            promotions = PromotionEntity.objects.filter(hotel_id=str(hotel_id))

        if promotion:
            for promotion in promotions:
                check_in_blackout = list()
                booking_blackout = list()
                for chBod in promotion.checkIn.black_out_dates:
                    check_in_blackout.append(chBod.strftime('%d-%m-%Y'))

                for bookingBod in promotion.booking.black_out_dates:
                    booking_blackout.append(bookingBod.strftime('%d-%m-%Y'))

                promotion_data =  {
                    'id': str(promotion.id),
                    'hotel_id': str(promotion.hotel_id),
                    'name': str(promotion.name),
                    'check_in_period': {
                                          'start_date':promotion.checkIn.start.strftime('%d-%m-%Y'),
                                          'end_date':promotion.checkIn.end.strftime('%d-%m-%Y'),
                                          'days':promotion.checkIn.days,
                                          'blackout_date':check_in_blackout,
                                        },
                    'booking_period': {
                                          'start_date':promotion.booking.start.strftime('%d-%m-%Y'),
                                          'end_date':promotion.booking.end.strftime('%d-%m-%Y'),
                                          'days':promotion.booking.days,
                                          'blackout_date':booking_blackout,
                                        },
                    'description': str(promotion.description),
                    'deal_status': promotion.status,
                    'type': str(promotion.type),
                    'ratePlans': promotion.rate_types,
                    'rooms': promotion.room_types,
                    'discount_type': str(promotion.discount_type),
                    'discount_value': str(promotion.discount_value)
                    
                }
                promotion_list.append(promotion_data)
            return Response(json.loads(json.dumps(promotion_list)), status=status.HTTP_200_OK)
        else:
            return Response('No promotion Created', status=status.HTTP_200_OK)
