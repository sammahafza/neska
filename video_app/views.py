from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from rest_framework import viewsets
from .models import Meeting
from .serializer import MeetingSerializer
from rest_framework.decorators import action

import logging
logger = logging.getLogger(__name__)


@login_required
def home(request):
    return


class MeetingView(viewsets.ModelViewSet):
    serializer_class = MeetingSerializer
    lookup_field = 'meeting_mid'
  
    def get_queryset(self):
        #if self.request.user.is_authenticated:
            #user = self.request.user
        return Meeting.objects.filter() #old #creator=user)
        #else:
            #return None