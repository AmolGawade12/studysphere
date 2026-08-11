from django.contrib import admin
from .models import StudySession

@admin.register(StudySession)
class StudySessionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'subject', 'duration', 'session_type', 'created_at']
    list_filter = ['session_type', 'created_at']
    search_fields = ['user__username', 'subject__name']
