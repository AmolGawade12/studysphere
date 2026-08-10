from django.contrib import admin
from .models import Profile

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'name', 'email', 'college', 'course', 'year', 'created_at']
    search_fields = ['user__username', 'name', 'email', 'college']
    list_filter = ['year', 'created_at']
