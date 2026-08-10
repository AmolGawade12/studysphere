from django.contrib import admin
from .models import Quiz, Question, QuizResult

class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1

@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'subject', 'title', 'difficulty', 'total_questions', 'created_at']
    list_filter = ['difficulty', 'created_at']
    search_fields = ['title', 'user__username', 'subject__name']
    inlines = [QuestionInline]

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['id', 'quiz', 'question', 'correct_answer']
    search_fields = ['question', 'quiz__title']

@admin.register(QuizResult)
class QuizResultAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'quiz', 'score', 'total', 'percentage', 'completed_at']
    list_filter = ['completed_at']
    search_fields = ['user__username', 'quiz__title']
