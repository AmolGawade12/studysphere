from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from .models import AIConversation, AIMessage
from .serializers import AIConversationSerializer, AIMessageSerializer
from .services import get_ai_service
from notes.models import Note

class AIConversationViewSet(viewsets.ModelViewSet):
    serializer_class = AIConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AIConversation.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=False, methods=['post'], url_path='chat')
    def chat(self, request):
        conversation_id = request.data.get('conversation_id')
        prompt = request.data.get('prompt')

        if not prompt:
            return Response({'error': 'Prompt is required'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Fetch or create conversation
        if conversation_id:
            try:
                conversation = AIConversation.objects.get(id=conversation_id, user=request.user)
            except AIConversation.DoesNotExist:
                return Response({'error': 'Invalid conversation ID'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Create a default conversation using the prompt as a title preview
            title = prompt[:30] + "..." if len(prompt) > 30 else prompt
            conversation = AIConversation.objects.create(user=request.user, title=title)

        # 2. Save user message
        AIMessage.objects.create(
            conversation=conversation,
            role='user',
            content=prompt
        )

        # 3. Retrieve conversation history
        history_msgs = conversation.messages.all().order_by('created_at')
        history_list = [{'role': m.role, 'content': m.content} for m in history_msgs]

        # 4. Get response from AI Service
        ai_service = get_ai_service()
        response_text = ai_service.get_chat_response(history_list, prompt)

        # 5. Save AI response
        ai_msg = AIMessage.objects.create(
            conversation=conversation,
            role='assistant',
            content=response_text
        )

        return Response({
            'conversation_id': conversation.id,
            'title': conversation.title,
            'message': AIMessageSerializer(ai_msg).data,
            'history': AIMessageSerializer(conversation.messages.all().order_by('created_at'), many=True).data
        })

    @action(detail=False, methods=['post'], url_path='summarize')
    def summarize(self, request):
        note_id = request.data.get('note_id')
        text = request.data.get('text')

        if note_id:
            try:
                note = Note.objects.get(id=note_id, user=request.user)
                text = note.extracted_text or f"Note details for {note.title}"
            except Note.DoesNotExist:
                return Response({'error': 'Note not found'}, status=status.HTTP_404_NOT_FOUND)

        if not text:
            return Response({'error': 'No text provided for summarization'}, status=status.HTTP_400_BAD_REQUEST)

        ai_service = get_ai_service()
        summary = ai_service.get_summary(text)
        return Response({'summary': summary})

    @action(detail=False, methods=['post'], url_path='generate-questions')
    def generate_questions(self, request):
        note_id = request.data.get('note_id')
        text = request.data.get('text')
        difficulty = request.data.get('difficulty', 'Medium')
        num_questions = int(request.data.get('num_questions', 5))

        if note_id:
            try:
                note = Note.objects.get(id=note_id, user=request.user)
                text = note.extracted_text or f"Note details for {note.title}"
            except Note.DoesNotExist:
                return Response({'error': 'Note not found'}, status=status.HTTP_404_NOT_FOUND)

        if not text:
            text = "General science, computer coding, database architecture, or math subjects."

        ai_service = get_ai_service()
        questions = ai_service.generate_questions(text, difficulty, num_questions)
        return Response({'questions': questions})
