from django.urls import path, include
from . import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register('meeting', views.MeetingView, basename='Meeting')
router.register('user', views.UserView, basename='User')

urlpatterns = [
    path('', include(router.urls)),
    path('logout/', views.Logout.as_view()),
]