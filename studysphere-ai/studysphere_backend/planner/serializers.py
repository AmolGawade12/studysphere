from rest_framework import serializers
from .models import Task
from subjects.serializers import SubjectSerializer
from subjects.models import Subject

class TaskSerializer(serializers.ModelSerializer):
    subject_details = SubjectSerializer(source='subject', read_only=True)
    subject_id = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(),
        source='subject',
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'due_date', 'duration', 'priority', 'completed', 'created_at', 'subject_id', 'subject_details']
        read_only_fields = ['id', 'created_at']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if request and request.user:
            self.fields['subject_id'].queryset = Subject.objects.filter(user=request.user)

    def create(self, validated_data):
        user = self.context['request'].user
        return Task.objects.create(user=user, **validated_data)
