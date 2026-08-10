from django.contrib import admin
from .models import Note

@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'subject', 'title', 'file_type', 'file_size', 'created_at']
    search_fields = ['title', 'user__username', 'subject__name']
    list_filter = ['file_type', 'created_at']
