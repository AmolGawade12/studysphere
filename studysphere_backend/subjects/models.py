from django.db import models
from django.contrib.auth.models import User

class Subject(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subjects')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    progress = models.IntegerField(default=0)  # Percentage 0 to 100
    study_hours = models.FloatField(default=0.0)
    color = models.CharField(max_length=50, default='#6366f1')  # Hex code for styling (Indigo)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
