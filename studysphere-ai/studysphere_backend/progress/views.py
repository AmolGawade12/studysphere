from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum, Avg
from subjects.models import Subject
from study_sessions.models import StudySession
from quizzes.models import QuizResult
from planner.models import Task

class ProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # 1. Total Study Hours across all subjects
        total_study_hours = Subject.objects.filter(user=user).aggregate(total=Sum('study_hours'))['total'] or 0.0
        # Round it
        total_study_hours = round(total_study_hours, 1)

        # 2. Quiz Average
        quiz_avg = QuizResult.objects.filter(user=user).aggregate(avg=Avg('percentage'))['avg'] or 0.0
        quiz_avg = round(quiz_avg, 1)

        # 3. Tasks Completed percentage
        total_tasks = Task.objects.filter(user=user).count()
        completed_tasks = Task.objects.filter(user=user, completed=True).count()
        tasks_completed_pct = round((completed_tasks / total_tasks) * 100, 1) if total_tasks > 0 else 0.0

        # 4. Study Streak
        # Get dates of all study sessions
        sessions = StudySession.objects.filter(
            user=user, session_type='study'
        ).order_by('-created_at')
        
        streak = 0
        if sessions.exists():
            study_dates = sorted(list(set([s.created_at.date() for s in sessions])), reverse=True)
            today = timezone.now().date()
            yesterday = today - timedelta(days=1)
            
            # Check if user studied today or yesterday to start counting
            if study_dates[0] in [today, yesterday]:
                streak = 1
                current_date = study_dates[0]
                for date in study_dates[1:]:
                    if current_date - date == timedelta(days=1):
                        streak += 1
                        current_date = date
                    elif current_date - date == timedelta(days=0):
                        continue
                    else:
                        break
        
        # 5. Weekly Study Time (last 7 days including today)
        weekly_data = []
        today = timezone.now().date()
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            day_name = day.strftime('%a')  # Mon, Tue, etc.
            # Sum duration of sessions on this day
            day_start = timezone.make_aware(timezone.datetime.combine(day, timezone.datetime.min.time()))
            day_end = timezone.make_aware(timezone.datetime.combine(day, timezone.datetime.max.time()))
            
            # Duration in minutes, convert to hours
            minutes = StudySession.objects.filter(
                user=user, session_type='study', created_at__range=(day_start, day_end)
            ).aggregate(total=Sum('duration'))['total'] or 0
            
            weekly_data.append({
                'day': day_name,
                'hours': round(minutes / 60.0, 1)
            })

        # 6. Subject Progress
        subjects_query = Subject.objects.filter(user=user).order_by('-created_at')
        subject_progress = []
        for s in subjects_query:
            subject_progress.append({
                'id': s.id,
                'name': s.name,
                'progress': s.progress,
                'study_hours': s.study_hours,
                'color': s.color
            })

        # 7. Quiz Performance
        results_query = QuizResult.objects.filter(user=user).order_by('-completed_at')[:5]
        quiz_performance = []
        for r in results_query:
            quiz_performance.append({
                'id': r.id,
                'title': r.quiz.title,
                'percentage': r.percentage,
                'completed_at': r.completed_at.strftime('%b %d')
            })

        return Response({
            'stats': {
                'total_study_hours': total_study_hours,
                'quiz_average': quiz_avg,
                'tasks_completed': tasks_completed_pct,
                'study_streak': streak
            },
            'weekly_study_time': weekly_data,
            'subject_progress': subject_progress,
            'quiz_performance': quiz_performance
        })
