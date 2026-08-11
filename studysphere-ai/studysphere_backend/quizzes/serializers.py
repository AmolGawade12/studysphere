from rest_framework import serializers
from .models import Quiz, Question, QuizResult
from subjects.serializers import SubjectSerializer
from subjects.models import Subject

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'question', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer', 'explanation']
        # Hide correct answer from takers during get if they aren't authorized, 
        # but in a study system it can be visible on demand or after submission. 
        # Let's keep it visible since the client needs it for checking or feedback.

class QuizResultSerializer(serializers.ModelSerializer):
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)

    class Meta:
        model = QuizResult
        fields = ['id', 'quiz', 'quiz_title', 'score', 'total', 'percentage', 'completed_at']
        read_only_fields = ['id', 'completed_at']

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    results = QuizResultSerializer(many=True, read_only=True)
    subject_details = SubjectSerializer(source='subject', read_only=True)
    subject_id = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(),
        source='subject',
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = Quiz
        fields = ['id', 'title', 'topic', 'difficulty', 'total_questions', 'created_at', 'questions', 'results', 'subject_id', 'subject_details']
        read_only_fields = ['id', 'created_at', 'total_questions']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if request and request.user:
            self.fields['subject_id'].queryset = Subject.objects.filter(user=request.user)

    def create(self, validated_data):
        user = self.context['request'].user
        return Quiz.objects.create(user=user, **validated_data)
