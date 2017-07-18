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

class CreateContract(APIView):
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
        contractEntity.creation_time = datetime.now()
        contractEntity.save()
        return Response('created', status=status.HTTP_201_CREATED)


class ViewContract(APIView):
    def get(self, request):
        contracts = ContractEntity.objects.filter()
        contract_list = list()
        if contracts:
            for contract in contracts:
                contract_data =  {
                    'id': str(contract.id),
                    'hotel_id': str(contract.hotel_id),
                    'hotel_name': str(contract.hotel_name),
                    'creation_time': str(contract.creation_time),
                    'created_by': str(contract.sender_info.name),
                    'note': str(contract.note),
                    'contract_type': str(ContractType.get_name(contract.contract_type)),
                    'status': str(ContractStatus.get_name(contract.status))
                }
                contract_list.append(contract_data)
            return Response(json.loads(json.dumps(contract_list)), status=status.HTTP_200_OK)
        else:
            return Response(json.loads(json.dumps(contract_list)), status=status.HTTP_200_OK)
