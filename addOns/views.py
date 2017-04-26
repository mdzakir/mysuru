import json

from rest_framework import status
from rest_framework.response import Response
from users.views.user import AuthorizedView
from addOns.models.addOns import AddOnsEntity
from bson import BSON
from bson import json_util
from datetime import datetime,timedelta
from rest_framework.views import APIView

class CreateAddOns(APIView):
    def post(self, request):
        data = request.body.decode('utf-8')
        body = json.loads(data)
        hotel_id = body['hotel_id']
        name = body['name']
        description = body['description']
        valid_from = body['valid_from']
        valid_to = body['valid_to']
        days = body['days']
        cut_off = body['cut_off']
        charge_type = body['charge_type']
        charge_value = body['charge_value']
        is_mandate = body['is_mandate']
        image = body['image']

        addOnsEntity = AddOnsEntity()
        addOnsEntity.hotel_id = hotel_id
        addOnsEntity.name = name
        addOnsEntity.description = description
        addOnsEntity.valid_from = datetime.strptime(str(valid_from), '%Y-%m-%d').date()
        addOnsEntity.valid_to = datetime.strptime(str(valid_to), '%Y-%m-%d').date()
        addOnsEntity.days = list(days)
        addOnsEntity.cut_off = int(cut_off)
        addOnsEntity.charge_type = int(charge_type)
        addOnsEntity.charge_value = int(charge_value)
        addOnsEntity.is_mandate = is_mandate
        addOnsEntity.image = image
        addOnsEntity.save()
        return Response('created', status=status.HTTP_201_CREATED)

class EditAddOns(APIView):
    def post(self, request):
        detail_list = list()
        data = request.body.decode('utf-8')
        body = json.loads(data)
        hotel_id = body['hotel_id']
        add_ons_id = body['addOn_id']
        name = body['name']
        description = body['description']
        valid_from = body['valid_from']
        valid_to = body['valid_to']
        days = body['days']
        cut_off = body['cut_off']
        charge_type = body['charge_type']
        charge_value = body['charge_value']
        is_mandate = body['is_mandate']
        image = body['image']
        
        addOnsEntity = AddOnsEntity.objects(id=str(add_ons_id))[0]
        addOnsEntity.hotel_id = hotel_id
        addOnsEntity.name = name
        addOnsEntity.description = description
        addOnsEntity.valid_from = datetime.strptime(str(valid_from), '%Y-%m-%d').date()
        addOnsEntity.valid_to = datetime.strptime(str(valid_to), '%Y-%m-%d').date()
        addOnsEntity.days = list(days)
        addOnsEntity.cut_off = int(cut_off)
        addOnsEntity.charge_type = int(charge_type)
        addOnsEntity.charge_value = int(charge_value)
        addOnsEntity.is_mandate = is_mandate
        addOnsEntity.image = image
        addOnsEntity.save()
        
        return Response('Updates', status=status.HTTP_200_OK)

class ViewAddOns(APIView):
    def get(self, request):
        data = request.body.decode('utf-8')
        hotel_id = request.GET['hotel_id']
        if 'id' in request.GET:
            addOn_id = request.GET['id']
            addOnsList = AddOnsEntity.objects.filter(hotel_id=str(hotel_id),id=str(addOn_id))
        else:
            addOnsList = AddOnsEntity.objects.filter(hotel_id=str(hotel_id))
        if addOnsList is not None:
            addOns_list = list()
            for addOns in addOnsList:
                data= {
                  "id":str(addOns.id),
                  "hotel_id":addOns.hotel_id,
                  "name":addOns.name,
                  "description":addOns.description,
                  "start":addOns.valid_from.strftime('%Y-%m-%d'),
                  "end":addOns.valid_to.strftime('%d-%m-%Y'),
                  "days":addOns.days,
                  "cut_off":addOns.cut_off,
                  "mandate":addOns.is_mandate,
                  "charge_type":addOns.charge_type,
                  "charge_value":addOns.charge_value,
                  "image":addOns.image
                }
                addOns_list.append(data)

            return Response(json.loads(json.dumps(addOns_list)), status=status.HTTP_200_OK)
