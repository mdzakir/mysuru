import json

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from room.models.room import RoomEntity,RoomImage
from room.models.inventory import Inventory
from bson import BSON
from bson import json_util
from datetime import datetime,timedelta

class CreateRoom(APIView):
    def post(self, request):

        data = request.body.decode('utf-8')
        body = json.loads(data)
        name = body['name']
        description = body['description']
        hotel_id = body['hotel_id']
        type = body['type']
        is_smoking = body['is_smoking']
        max_adult = body['max_adult']
        amenities = body['amenities']
        images = body['images']
        roomEntity = None
        if 'room_id' in body:
            room_id = body['room_id']
            roomEntity = RoomEntity.objects(id=str(room_id))[0]
        else:
            roomEntity = RoomEntity()

        imageList = list()
        for image in images:
            img = RoomImage()
            img.name = 'name'
            img.url = image['url']
            img.order = 1
            imageList.append(img)

        roomEntity.name = name
        roomEntity.images = imageList
        #Active Status =2
        roomEntity.status = 1
        roomEntity.description = description
        roomEntity.hotel_id = hotel_id
        roomEntity.type = type
        roomEntity.is_smoking = is_smoking
        roomEntity.max_adult = max_adult
        roomEntity.amenities = amenities
        roomEntity.save()
        return Response('created', status=status.HTTP_201_CREATED)

class UpdateStatus(APIView):
    def get(self, request):
        hotel_id = request.GET['hotel_id']
        room_id = request.GET['room_id']
        room_status = request.GET['status']
        if room_status == "ACTIVE":
            room_status = 1
        elif room_status == "INACTIVE":
            room_status = 2
        elif room_status == "DELETED":
            room_status = 3

        roomEntity = RoomEntity.objects(id=str(room_id),hotel_id=str(hotel_id))[0]

        roomEntity.status = int(room_status)
        roomEntity.save()
        return Response('Updated room status' + room_id, status=status.HTTP_200_OK)

class ViewRoom(APIView):
    def get(self, request):
        room_list = list()
        hotel_id = request.GET['hotel_id']
        if 'room_id' in request.GET:
            room_id = request.GET['room_id']
            rooms = RoomEntity.objects.filter(hotel_id=str(hotel_id),id=str(room_id),status=1)
        else:
            rooms = RoomEntity.objects.filter(hotel_id=str(hotel_id),status=1)
        if rooms:
            for room in rooms:
                images = list()
                for img in room.images:
                    image_data = {
                    'name':img.name,
                    'url':img.url,
                    'order':img.order
                    }
                    images.append(image_data)

                room_data =  {
                    'id': str(room.id),
                    'hotel_id': str(room.hotel_id),
                    'name': str(room.name),
                    'description': str(room.description),
                    'is_smoking': str(room.is_smoking),
                    'amenities': room.amenities,
                    'images': images,
                    'status': str(room.status),
                    'max_adult': str(room.max_adult),
                    'type': str(room.type)
                }
                room_list.append(room_data)
            return Response(json.loads(json.dumps(room_list)), status=status.HTTP_200_OK)
        else:
            return Response('created', status=status.HTTP_200_OK)



class UpdateInventory(APIView):
    def post(self, request):
    	data = request.body.decode('utf-8')
    	body = json.loads(data)
    	room_id = body['room_id']
    	availablity = body['availablity']
    	start_date = body['start_date']
    	end_date = body['end_date']

    	start = datetime.strptime(str(start_date), '%Y-%m-%d').date()
    	end = datetime.strptime(str(end_date), '%Y-%m-%d').date()+ timedelta(1)

    	for single_date in daterange(start, end):
    		inventory = Inventory.objects.filter(room_id=str(room_id),date = single_date).first()
    		if inventory:
    			inventory.available = availablity
    			inventory.save()
    		else:
    			day_inventory = Inventory()
    			day_inventory.room_id = room_id
    			day_inventory.booked = 0
    			day_inventory.available = availablity
    			day_inventory.date = single_date
    			day_inventory.sold_out = False
    			day_inventory.save()
    	return Response('created', status=status.HTTP_200_OK)


def daterange(start_date, end_date):
	for n in range(int ((end_date - start_date).days)):
		yield start_date + timedelta(n)


class ViewInventory(APIView):
    def post(self, request):
    	data = request.body.decode('utf-8')
    	body = json.loads(data)
    	room_id = body['room_id']
    	start_date = body['start_date']
    	end_date = body['end_date']

    	start = datetime.strptime(str(start_date), '%Y-%m-%d').date()
    	end = datetime.strptime(str(end_date), '%Y-%m-%d').date()

    	for single_date in daterange(start, end):
    		inventory = Inventory.objects.filter(room_id=str(room_id),date = single_date).first()
