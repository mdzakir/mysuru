import json

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from users.views.user import AuthorizedView
from room.models.inventory import Inventory
from bson import BSON
from bson import json_util
from datetime import datetime,timedelta
from users.models.user import User, UserType
from activity.models.activity import ActivityEntity,InventoryActivity
from django.core import serializers

class ViewActivity(APIView):
    def post(self, request):
        data = request.body.decode('utf-8')
        body = json.loads(data)
        hotel_id = body['hotel_id']
        activity = body['activity']
        start_date = body['start_date']
        end_date = body['end_date']
        start = datetime.strptime(str(start_date), '%Y-%m-%d').date()
        end = datetime.strptime(str(end_date), '%Y-%m-%d').date()
        activities = ActivityEntity.objects.filter(hotel_id=str(hotel_id),creation_time__gte = start ,creation_time__lte = end)
        activity_list = list()
        if activities:
            for activity in activities:
                day_update = list()
                for inventory in activity.inventory:
                    day_update_data =  {
                        "date":str(inventory.date.strftime('%Y-%m-%d')),
                        "old_inventory":inventory.new_inventory,
                        "new_inventory":inventory.old_inventory

                    }
                    day_update.append(day_update_data)
                day_update_data = {} 
                if activity.price:
                    day_update_data['old_price'] =  activity.price.old_price
                    day_update_data['new_price'] =  activity.price.new_price

                activity_data =  {
                    'creation_date':str(activity.creation_time.strftime('%Y-%m-%d')),
                    'id': str(activity.id),
                    'hotel_id': str(activity.hotel_id),
                    'start_date': str(activity.start_date.strftime('%Y-%m-%d')),
                    'end_date': str(activity.end_date.strftime('%Y-%m-%d')),
                    'updatedBy': str(activity.user_id),
                    'room_id': str(activity.user_id),
                    'activity_type': str(activity.activity),
                    'inventory_detail': json.loads(json.dumps(day_update)),
                    'price_detail': json.loads(json.dumps(day_update_data))
                }
                activity_list.append(activity_data)
            return Response(json.loads(json.dumps(activity_list)), status=status.HTTP_200_OK)
        else:
            return Response(json.loads(json.dumps(activity_list)), status=status.HTTP_200_OK)
