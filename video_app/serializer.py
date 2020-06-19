from rest_framework import serializers
from .models import Meeting, User

import logging
logger = logging.getLogger(__name__)

import datetime
class MeetingSerializer(serializers.ModelSerializer):
    creator = serializers.SerializerMethodField()
    creator_name = serializers.SerializerMethodField()
    class Meta:
        model = Meeting
        fields = ('id', 'creator', 'creator_name', 'meeting_mid')

    def create(self, validated_data):
        validated_data['creator'] = User.objects.get(pk=self.context['request'].user.id)
        meeting = Meeting(**validated_data)
        meeting.save()
        return meeting

    def get_creator(self, obj):
        return str(obj.creator.email)

    def get_creator_name(self, obj):
        return str(obj.creator.first_name) + ' ' + str(obj.creator.last_name)