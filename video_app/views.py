from django.shortcuts import render
from rest_framework import viewsets
from .models import Meeting, User
from .serializer import MeetingSerializer, UserSerializer
from rest_framework.decorators import action

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import logout

import logging
logger = logging.getLogger(__name__)

class MeetingView(viewsets.ModelViewSet):
    serializer_class = MeetingSerializer
    lookup_field = 'meeting_mid'
  
    def get_queryset(self):
        #if self.request.user.is_authenticated:
            #user = self.request.user
        return Meeting.objects.filter() #old #creator=user)
        #else:
            #return None

class UserView(viewsets.ModelViewSet):
    serializer_class = UserSerializer

    def get_queryset(self):
        if self.request.user.is_authenticated:
            user = self.request.user
            return User.objects.filter(email=user.email)

class Logout(APIView):
    def get(self, request, format=None):
        logout(request)
        return Response(status=status.HTTP_200_OK)