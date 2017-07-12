from .serializers import UserSerializer
from .models.product_assignment import ProductAssignment
from hotel.models.hotel import HotelEntity

def jwt_response_payload_handler(token, user=None, request=None):

    if not user.is_admin:

        assigned_hotels = ProductAssignment.for_user(user.id)
        if assigned_hotels:
           first_hotel = assigned_hotels[0]
           hotel_id = first_hotel['id']
           hotel = HotelEntity.objects.filter(id = first_hotel['id']).first()
        return {
            'token': token,
        }
    else:
        return {
            'token': token
        }


