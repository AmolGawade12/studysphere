from rest_framework import viewsets, permissions
from .models import StudySession
from .serializers import StudySessionSerializer

class StudySessionViewSet(viewsets.ModelViewSet):
    serializer_class = StudySessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return StudySession.objects.filter(user=self.request.user).order_by('-created_at')
