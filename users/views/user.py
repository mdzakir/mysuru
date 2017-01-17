import json

from django.core import serializers
from django.views.generic import RedirectView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_jwt.authentication import JSONWebTokenAuthentication
from users.models.product_assignment import ProductAssignment
from users.models.user import User
from django.contrib.auth import authenticate


class AuthorizedView(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JSONWebTokenAuthentication,)


class CreateUser(APIView):
    def post(self, request):
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)
        user = User.objects.create_superuser(first_name=body['first_name'],last_name=body['last_name'],phone=body['phone'],
                                             email=body['email'],
                                             password=body['password'])
        return Response('User Created Successfully', status=status.HTTP_200_OK)


class AuthenticationStatus(AuthorizedView):
    def get(self, request):
        if request.user:
            return Response({'status': 'valid', 'username': request.user.username}, status=status.HTTP_200_OK)
        else:
            return Response({'status': 'invalid'}, status=status.HTTP_200_OK)


class Users(AuthorizedView):
    def get(self, request):
        user = User.objects.all()
        return Response(serializers.serialize("json", user), status=status.HTTP_200_OK)


class AssignProducts(AuthorizedView):
    def post(self, request):
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)
        user = User.objects.get(username__exact=body['username'])
        count = 0
        for product in list(body['product_list']):
            assign = ProductAssignment(user_id=user.id)
            assign.user_id = user.id
            assign.hotel_id = json.loads(json.dumps(product)).get('id')
            assign.hotel_name = json.loads(json.dumps(product)).get('name')
            assign.save()
            count = count + 1
        return Response(str(count) + "product assigend", status=status.HTTP_200_OK)


class UserProducts(AuthorizedView):
    def get(self, request):
        product = ProductAssignment.for_user(request.user.id)
        return Response(product, status=status.HTTP_200_OK)


class ChangePassword(AuthorizedView):
    def post(self, request):
        if request.method == 'POST':
            body_unicode = request.body.decode('utf-8')
            body = json.loads(body_unicode)
            try:
                user = User.objects.get(username__exact=body['username'])
            except User.DoesNotExist:
                user = None
            if user:
                user.set_password(body['password'])
                user.save()
            return Response('password Update Successfully', status=status.HTTP_200_OK)

