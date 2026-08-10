from rest_framework import serializers
from .models import StudySession
from subjects.serializers import SubjectSerializer
from subjects.models import Subject

class StudySessionSerializer(serializers.ModelSerializer):
    subject_details = SubjectSerializer(source='subject', read_only=True)
    subject_id = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(),
        source='subject',
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = StudySession
        fields = ['id', 'duration', 'session_type', 'created_at', 'subject_id', 'subject_details']
        read_only_fields = ['id', 'created_at']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if request and request.user:
            self.fields['subject_id'].queryset = Subject.objects.filter(user=request.user)

    def create(self, validated_data):
        user = self.context['request'].user
        session = StudySession.objects.create(user=user, **validated_data)
        
        # Increment subject study hours
        if session.subject and session.session_type == 'study':
            subject = session.subject
            # Assuming duration is in seconds or minutes. Let's assume minutes!
            # If duration is 25 minutes, add 25/60 = 0.42 hours.
            hours_added = session.duration / 60.0
            subject.study_hours = round(subject.study_hours + hours_added, 2)
            # Also increase progress slightly as a reward for studying!
            subject.progress = min(100, subject.progress + int(session.duration // 10))
            subject.save()
            
        return session
