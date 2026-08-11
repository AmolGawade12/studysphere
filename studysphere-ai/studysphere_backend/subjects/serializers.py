from rest_framework import serializers
from .models import Subject

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'description', 'progress', 'study_hours', 'color', 'created_at']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        # Set user from context
        user = self.context['request'].user
        return Subject.objects.create(user=user, **validated_data)
