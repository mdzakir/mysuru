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

        for room in rooms:
            for rate in ratePlans:




        return Response('', status=status.HTTP_200_OK)


