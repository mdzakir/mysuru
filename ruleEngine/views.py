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
from ruleEngine.models.ruleEngine import RuleEngineEntity,Rule,Status

class CreateRule(APIView):
    def post(self, request):
        data = request.body.decode('utf-8')
        body = json.loads(data)
        hotel_id = body['hotel_id']
        room_id = body['room_id']
        start_date = body['start_date']
        end_date = body['end_date']
        rules = body['rules']
        start = datetime.strptime(str(start_date), '%Y-%m-%d').date()
        end = datetime.strptime(str(end_date), '%Y-%m-%d').date()

        ruleEngineEntity = RuleEngineEntity()
        ruleEngineEntity.hotel_id = hotel_id
        ruleEngineEntity.room_id = room_id
        ruleEngineEntity.start_date = start
        ruleEngineEntity.end_date =end

        rule_list = list()
        for key, value in rules.items():
            rule_obj = Rule()
            rule_obj.occupancy = key
            rule_obj.price = value
            rule_obj.type = 1
            rule_list.append(rule_obj)
        ruleEngineEntity.rules = rule_list
        ruleEngineEntity.save()
        return Response('created', status=status.HTTP_201_CREATED)

class EditRule(APIView):
    def post(self, request):
        data = request.body.decode('utf-8')
        body = json.loads(data)
        id = body['id']
        hotel_id = body['hotel_id']
        room_id = body['room_id']
        start_date = body['start_date']
        end_date = body['end_date']
        rules = body['rules']
        start = datetime.strptime(str(start_date), '%Y-%m-%d').date()
        end = datetime.strptime(str(end_date), '%Y-%m-%d').date()

        ruleEngineEntity =  RuleEngineEntity.objects.filter(id=id).first()
        ruleEngineEntity.hotel_id = hotel_id
        ruleEngineEntity.room_id = room_id
        ruleEngineEntity.start_date = start
        ruleEngineEntity.end_date =end

        rule_list = list()
        for key, value in rules.items():
            rule_obj = Rule()
            rule_obj.occupancy = key
            rule_obj.price = value
            rule_obj.type = 1
            rule_list.append(rule_obj)
        ruleEngineEntity.rules = rule_list
        ruleEngineEntity.save()
        return Response('Updated', status=status.HTTP_200_OK)

class ChangeStatus(APIView):
    def get(self, request):
        rule_id = request.GET['rule_id']
        ruleEngineEntity =  RuleEngineEntity.objects.filter(id=rule_id).first()
        if ruleEngineEntity and ruleEngineEntity.status == Status.ACTIVE.type_id:
            ruleEngineEntity.status = Status.IN_ACTIVE.type_id
        elif ruleEngineEntity:
            ruleEngineEntity.status = Status.ACTIVE.type_id
        ruleEngineEntity.save()
        return Response('Status Changed Successfully', status=status.HTTP_200_OK)



class ViewRules(APIView):
    def get(self, request):
        hotel_id = request.GET['hotel_id']
        rules_data = RuleEngineEntity.objects.all()
        rule_list = list()
        if rules_data:
            for rule in rules_data:
                price_dict ={}
                for occupancy_price in rule.rules:
                    price_dict[occupancy_price.occupancy] = occupancy_price.price

                rule_data =  {
                    'id': str(rule.id),
                    'hotel_id': str(rule.hotel_id),
                    'room_id': str(rule.room_id),
                    'start_date': str(rule.start_date.strftime('%Y-%m-%d')),
                    'end_date': str(rule.start_date.strftime('%Y-%m-%d')),
                    'rules': str(price_dict)
                }
                rule_list.append(rule_data)
            return Response(json.loads(json.dumps(rule_list)), status=status.HTTP_200_OK)
        else:
            return Response(json.loads(json.dumps(rule_list)), status=status.HTTP_200_OK)
