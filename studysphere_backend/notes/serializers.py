from rest_framework import serializers
from .models import Note
from subjects.models import Subject
from subjects.serializers import SubjectSerializer

class NoteSerializer(serializers.ModelSerializer):
    subject_details = SubjectSerializer(source='subject', read_only=True)
    subject_id = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(),
        source='subject',
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = Note
        fields = [
            'id', 'title', 'file', 'file_type', 'file_size', 
            'extracted_text', 'created_at', 'subject_id', 'subject_details'
        ]
        read_only_fields = ['id', 'file_type', 'file_size', 'extracted_text', 'created_at']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Filter subject queryset by requesting user
        request = self.context.get('request')
        if request and request.user:
            self.fields['subject_id'].queryset = Subject.objects.filter(user=request.user)

    def create(self, validated_data):
        user = self.context['request'].user
        return Note.objects.create(user=user, **validated_data)
