from .serializers import UserSerializer
from .models.product_assignment import ProductAssignment
from hotels.models.settings import Settings
from hotels.models.hotel import Hotel
from hotels.models.currency import Currency

def jwt_response_payload_handler(token, user=None, request=None):

    if not user.is_admin:

        assigned_hotels = ProductAssignment.for_user(user.id)
        first_hotel = assigned_hotels[0]
        hotel_id = first_hotel['id']
        settings = Settings.objects.filter(
            hotel_id=first_hotel['id'],
            user_name=user.get_username()
        ).first()

        hotel = Hotel.objects.filter(
            id = first_hotel['id']
        ).first()
        currency_code = Currency.get_currency_code(hotel.currency)
        currency_iso_code = Currency.get_currency_iso_code(hotel.currency)
        is_pms = hotel.is_import

        return {
            'token': token,
            'user': UserSerializer(user).data,
            'config': settings.config if settings else {},
            'hotel_config': currency_code if currency_code else "fa fa-rupee",
            'is_pms': is_pms,
            'currency_iso_code': currency_iso_code if currency_iso_code else "INR",
            'hotel_id': hotel_id,

        }
    else:
        return {
            'token': token
        }


