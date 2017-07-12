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
from contract.models.contract import ContractType, ContractStatus,ContractorInfo,ContractEntity

class CreateRule(APIView):
    def post(self, request):
        data = request.body.decode('utf-8')
        body = json.loads(data)
        hotel_id = body['hotel_id']
        hotel_name = body['hotel_name']
        sender_id = body['sender_id']
        reciever_id = body['reciever_id']
        note = body['note']
        contract_type = body['contract_type']
        #commission_proposal = body['commission_proposal']
        contract_from = User.objects.get(id=body['sender_id'])
        contract_to = User.objects.get(id=body['reciever_id'])
        contractEntity = ContractEntity()

        if contract_from:
            contractorSenderInfo = ContractorInfo()
            contractorSenderInfo.name = contract_from.first_name
            contractorSenderInfo.company_name = contract_from.company_name
            contractorSenderInfo.mobile = contract_from.phone
            contractorSenderInfo.email = contract_from.email
            contractEntity.sender_info = contractorSenderInfo

        if contract_to:
            contractorReceiverInfo = ContractorInfo()
            contractorReceiverInfo.name = contract_to.first_name
            contractorReceiverInfo.company_name = contract_to.company_name
            contractorReceiverInfo.mobile = contract_to.phone
            contractorReceiverInfo.email = contract_to.email
            contractEntity.receiver_info = contractorReceiverInfo

        contractEntity.contract_type = ContractType.get_id(contract_type)
        contractEntity.status = ContractStatus.INITATIVE.type_id
        contractEntity.hotel_id = hotel_id
        contractEntity.hotel_name = hotel_name
        contractEntity.note = note
        contractEntity.save()
        return Response('created', status=status.HTTP_201_CREATED)


class ViewRules(APIView):
    def get(self, request):
        contracts = ContractEntity.objects.filter()
        contract_list = list()
        if contracts:
            for contract in contracts:
                contract_data =  {
                    'id': str(contract.id),
                    'hotel_id': str(contract.hotel_id),
                    'hotel_name': str(contract.hotel_name),
                    'note': str(contract.note),
                    'contract_type': str(ContractType.get_name(contract.contract_type)),
                    'status': str(ContractStatus.get_name(contract.status))
                }
                contract_list.append(contract_data)
            return Response(json.loads(json.dumps(contract_list)), status=status.HTTP_200_OK)
        else:
            return Response(json.loads(json.dumps(contract_list)), status=status.HTTP_200_OK)



class UpdateInventory(APIView):
    def post(self, request):
        data = request.body.decode('utf-8')
        body = json.loads(data)
        room_id = body['room_id']
        availability = body['availability']
        start_date = body['start_date']
        end_date = body['end_date']
        days = body['days']
        start = datetime.strptime(str(start_date), '%Y-%m-%d').date()
        end = datetime.strptime(str(end_date), '%Y-%m-%d').date()+ timedelta(1)
        for single_date in daterange(start, end):
            if days[single_date.weekday()]:
                inventory = Inventory.objects.filter(room_id=str(room_id),date = single_date).first()
                if inventory:
                    inventory.available = availability
                    inventory.save()
                else:
                    day_inventory = Inventory()
                    day_inventory.room_id = room_id
                    day_inventory.booked = 0
                    day_inventory.available = availability
                    day_inventory.date = single_date
                    day_inventory.sold_out = False
                    day_inventory.save()
        return Response('created', status=status.HTTP_200_OK)


def daterange(start_date, end_date):
	for n in range(int ((end_date - start_date).days)):
		yield start_date + timedelta(n)


class ViewInventory(APIView):
    def get(self, request):
        inventory_list = list()
        data = request.body.decode('utf-8')
        hotel_id = request.GET['hotel_id']
        start_date = request.GET['start_date']
        end_date = request.GET['end_date']
        start = datetime.strptime(str(start_date), '%Y-%m-%d').date()
        end = datetime.strptime(str(end_date), '%Y-%m-%d').date()
        rooms = RoomEntity.objects.filter(hotel_id=str(hotel_id),status=1)
        if rooms:
            for room in rooms:
                room_dict = {}
                room_dict['room_id'] = str(room.id)
                room_dict['room_name'] = str(room.name)
                inventoryList = Inventory.objects.filter(room_id=str(room.id),date__gte = start ,date__lte = end)
                if inventoryList is not None:
                    inv_dict = {}
                    for inv in inventoryList:
                        data = {
                            'date': str(inv.date.strftime('%Y-%m-%d')),
                            'available': inv.available,
                            'booked': inv.booked,
                            'blocked': inv.sold_out
                        }
                        inv_dict[inv.date.strftime('%Y-%m-%d')] = data
                    room_dict['inventory_list'] = inv_dict

                inventory_list.append(room_dict)

        return Response(json.loads(json.dumps(inventory_list)), status=status.HTTP_200_OK)
