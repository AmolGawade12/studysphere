import os
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
import pypdf
import docx
from .models import Note
from .serializers import NoteSerializer
from subjects.models import Subject

def format_file_size(size_in_bytes):
    for unit in ['B', 'KB', 'MB']:
        if size_in_bytes < 1024.0:
            return f"{size_in_bytes:.1f} {unit}"
        size_in_bytes /= 1024.0
    return f"{size_in_bytes:.1f} GB"

def extract_text(file_path, extension):
    text = ""
    try:
        ext = extension.lower()
        if ext == '.pdf':
            reader = pypdf.PdfReader(file_path)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        elif ext == '.docx':
            doc = docx.Document(file_path)
            for para in doc.paragraphs:
                text += para.text + "\n"
        elif ext == '.txt':
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                text = f.read()
    except Exception as e:
        text = f"[Text extraction failed: {str(e)}]"
    return text.strip()

class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filter by authenticated user
        queryset = Note.objects.filter(user=self.request.user).order_by('-created_at')
        # Allow filtering by subject
        subject_id = self.request.query_params.get('subject')
        if subject_id:
            queryset = queryset.filter(subject_id=subject_id)
        # Allow searching by title
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(title__icontains=search)
        return queryset

    # We map POST /api/notes/upload/ to create or custom action
    @action(detail=False, methods=['post'], url_path='upload')
    def upload(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate file size (limit to 10MB)
        max_size = 10 * 1024 * 1024  # 10 MB
        if file_obj.size > max_size:
            return Response({'error': 'File size exceeds limit of 10 MB'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate extension
        _, ext = os.path.splitext(file_obj.name)
        ext = ext.lower()
        if ext not in ['.pdf', '.docx', '.txt']:
            return Response({'error': 'Unsupported file format. Please upload PDF, DOCX, or TXT'}, status=status.HTTP_400_BAD_REQUEST)

        # Map details
        title = request.data.get('title', file_obj.name)
        subject_id = request.data.get('subject_id')
        
        subject = None
        if subject_id:
            try:
                subject = Subject.objects.get(id=subject_id, user=request.user)
            except Subject.DoesNotExist:
                return Response({'error': 'Invalid subject selected'}, status=status.HTTP_400_BAD_REQUEST)

        # Create Note Instance
        note = Note.objects.create(
            user=request.user,
            subject=subject,
            title=title,
            file=file_obj,
            file_type=ext[1:].upper(),
            file_size=format_file_size(file_obj.size)
        )

        # Extract text asynchronously or synchronously
        # We will do it synchronously for simple deployment and immediate feedback
        file_path = note.file.path
        extracted = extract_text(file_path, ext)
        note.extracted_text = extracted
        note.save()

        serializer = self.get_serializer(note)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
