from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AIConversationViewSet

router = DefaultRouter()
router.register(r'', AIConversationViewSet, basename='ai-conversation')

urlpatterns = [
    path('', include(router.urls)),
]
