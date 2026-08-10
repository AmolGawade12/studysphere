from django.db import models
from django.contrib.auth.models import User
from subjects.models import Subject

class StudySession(models.Model):
    SESSION_TYPE_CHOICES = [
        ('study', 'Study'),
        ('break', 'Break'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='study_sessions')
    subject = models.ForeignKey(Subject, on_delete=models.SET_NULL, null=True, blank=True, related_name='study_sessions')
    duration = models.IntegerField()  # in minutes or seconds (standardize to seconds or minutes, let's say minutes)
    session_type = models.CharField(max_length=10, choices=SESSION_TYPE_CHOICES, default='study')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.session_type} ({self.duration}m) on {self.created_at.date()}"
