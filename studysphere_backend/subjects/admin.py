from django.contrib import admin
from .models import Subject

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'name', 'progress', 'study_hours', 'created_at']
    search_fields = ['name', 'user__username']
    list_filter = ['created_at']
