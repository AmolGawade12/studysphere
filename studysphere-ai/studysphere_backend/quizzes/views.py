from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Quiz, Question, QuizResult
from .serializers import QuizSerializer, QuizResultSerializer
from subjects.models import Subject
from ai_tutor.services import get_ai_service

class QuizViewSet(viewsets.ModelViewSet):
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Quiz.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=False, methods=['post'], url_path='generate')
    def generate(self, request):
        subject_id = request.data.get('subject_id')
        topic = request.data.get('topic', 'General Learning')
        difficulty = request.data.get('difficulty', 'Medium')
        num_questions = int(request.data.get('num_questions', 5))

        subject = None
        if subject_id:
            try:
                subject = Subject.objects.get(id=subject_id, user=request.user)
            except Subject.DoesNotExist:
                return Response({'error': 'Invalid subject selected'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Title for the quiz
        title = f"{subject.name if subject else 'General'} - {topic} Quiz"

        # 2. Use AI Service to generate questions list
        ai_service = get_ai_service()
        # Find note content for this subject if possible
        text_content = ""
        if subject:
            notes = subject.notes.all()
            if notes.exists():
                text_content = "\n".join([n.extracted_text for n in notes if n.extracted_text])

        raw_questions = ai_service.generate_questions(text_content, difficulty, num_questions)

        # 3. Create Quiz model in DB
        quiz = Quiz.objects.create(
            user=request.user,
            subject=subject,
            title=title,
            topic=topic,
            difficulty=difficulty,
            total_questions=len(raw_questions)
        )

        # 4. Create Question models in DB
        for rq in raw_questions:
            Question.objects.create(
                quiz=quiz,
                question=rq['question'],
                option_a=rq['option_a'],
                option_b=rq['option_b'],
                option_c=rq['option_c'],
                option_d=rq['option_d'],
                correct_answer=rq['correct_answer'],
                explanation=rq.get('explanation', '')
            )

        serializer = self.get_serializer(quiz)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='submit')
    def submit(self, request, pk=None):
        quiz = self.get_object()
        answers = request.data.get('answers')  # Dictionary matching: {"question_id": "A/B/C/D"}

        if not isinstance(answers, dict):
            return Response({'error': 'Answers dictionary is required'}, status=status.HTTP_400_BAD_REQUEST)

        questions = quiz.questions.all()
        correct_count = 0
        wrong_count = 0
        breakdown = []

        for q in questions:
            submitted = answers.get(str(q.id))
            is_correct = (submitted == q.correct_answer)
            if is_correct:
                correct_count += 1
            else:
                wrong_count += 1
            
            breakdown.append({
                'question_id': q.id,
                'question': q.question,
                'submitted': submitted,
                'correct_answer': q.correct_answer,
                'is_correct': is_correct,
                'explanation': q.explanation
            })

        total = len(questions)
        percentage = round((correct_count / total) * 100, 1) if total > 0 else 0

        # Save result
        result = QuizResult.objects.create(
            user=request.user,
            quiz=quiz,
            score=correct_count,
            total=total,
            percentage=percentage
        )

        # If a subject is attached, increment its progress based on results
        if quiz.subject:
            subject = quiz.subject
            # Let's adjust subject progress upwards slightly if they did well!
            if percentage >= 50:
                subject.progress = min(100, subject.progress + 5)
                subject.save()

        result_serializer = QuizResultSerializer(result)
        return Response({
            'result': result_serializer.data,
            'correct_count': correct_count,
            'wrong_count': wrong_count,
            'breakdown': breakdown
        }, status=status.HTTP_201_CREATED)
