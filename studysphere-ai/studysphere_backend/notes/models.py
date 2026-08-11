from django.db import models
from django.contrib.auth.models import User
from subjects.models import Subject

class Note(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notes')
    subject = models.ForeignKey(Subject, on_delete=models.SET_NULL, null=True, blank=True, related_name='notes')
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='notes/')
    file_type = models.CharField(max_length=50, blank=True)  # PDF, DOCX, TXT
    file_size = models.CharField(max_length=50, blank=True)  # Readably formatted, e.g. "1.2 MB"
    extracted_text = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
