import json

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from hotel.models.amenities import Amenities

class AmenitiesView(APIView):
    def get(self, request):
        amenities_list = list()
        for ame in Amenities.get_amenities():
            ame_dict = {}
            ame_dict['name'] = ame.ame_name
            ame_dict['icon'] = ame.ame_icon
            ame_dict['id'] = ame.id
            amenities_list.append(ame_dict)
        return Response(json.loads(json.dumps(amenities_list)), status=status.HTTP_200_OK)
