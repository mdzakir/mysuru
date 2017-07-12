import json

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from hotel.models.amenities import Amenities
from hotel.models.hotel import HotelEntity

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


class HotelBasicDetails(APIView):
	def get(self, request):
		hotel_id = request.GET['hotel_id']
		hotel = HotelEntity.objects().first()
		hotel_dict = {}
		if hotel:
			hotel_dict['id'] = str(hotel.id)
			hotel_dict['name'] = hotel.name
			hotel_dict['description'] = hotel.description
			hotel_dict['country'] = hotel.country
			hotel_dict['state'] = hotel.state
			hotel_dict['city'] = hotel.city
			hotel_dict['locality'] = hotel.locality
			hotel_dict['zipcode'] = hotel.pincode
			hotel_dict['start_rating'] = hotel.star_rating
			hotel_dict['hotel_type'] = hotel.hotel_type
		return Response(json.loads(json.dumps(hotel_dict)), status=status.HTTP_200_OK)

class ContactDetails(APIView):
	def get(self, request):
		hotel_id = request.GET['hotel_id']
		hotel = HotelEntity.objects().first()
		contact_list = list()
		if hotel:
			for detail in hotel.contact_person:
				contact_detail = {}
				contact_detail['name'] = detail.name
				contact_detail['phone'] = detail.phone
				contact_detail['email'] = detail.email
				contact_list.append(contact_detail)
		return Response(json.loads(json.dumps(contact_list)), status=status.HTTP_200_OK)

class BankDetails(APIView):
	def get(self, request):
		hotel_id = request.GET['hotel_id']
		hotel = HotelEntity.objects().first()
		bank_list = list()
		if hotel:
			for detail in hotel.bank_detail:
				bank_detail = {}
				bank_detail['bank_name'] = detail.name
				bank_detail['branch_name'] = detail.branch_name
				bank_detail['account_number'] = detail.account_number
				bank_detail['account_name'] = detail.account_name
				bank_detail['ifsc_code'] = detail.ifsc_code
				bank_list.append(bank_detail)
		return Response(json.loads(json.dumps(bank_list)), status=status.HTTP_200_OK)
