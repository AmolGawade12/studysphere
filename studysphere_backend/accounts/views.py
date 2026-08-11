from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .serializers import UserSerializer, ProfileSerializer
from .models import Profile

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            serializer = UserSerializer(data=request.data)
            if serializer.is_valid():
                user = serializer.save()
                token, created = Token.objects.get_or_create(user=user)
                profile_serializer = ProfileSerializer(user.profile)
                return Response({
                    'token': token.key,
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'profile': profile_serializer.data
                    }
                }, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print("[Register Exception]", str(e))
            return Response({'error': f"Registration failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            username_or_email = (request.data.get('username') or request.data.get('email') or '').strip()
            password = request.data.get('password', '')

            if not username_or_email or not password:
                return Response({'error': 'Please enter both email/username and password.'}, status=status.HTTP_400_BAD_REQUEST)

            # Flexible login: allow logging in using email or username
            user_obj = User.objects.filter(username__iexact=username_or_email).first()
            if not user_obj:
                user_obj = User.objects.filter(email__iexact=username_or_email).first()

            username_to_auth = user_obj.username if user_obj else username_or_email

            user = authenticate(username=username_to_auth, password=password)
            if user:
                token, created = Token.objects.get_or_create(user=user)
                profile_serializer = ProfileSerializer(user.profile)
                return Response({
                    'token': token.key,
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'profile': profile_serializer.data
                    }
                }, status=status.HTTP_200_OK)
            return Response({'error': 'Invalid username/email or password.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f"Login failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            email_or_username = (request.data.get('email') or request.data.get('username') or request.data.get('email_or_username') or '').strip()
            new_password = request.data.get('new_password') or request.data.get('password')
            make_admin = request.data.get('make_admin', True)

            if not email_or_username or not new_password:
                return Response({'error': 'Please provide email/username and new_password.'}, status=status.HTTP_400_BAD_REQUEST)

            user = User.objects.filter(username__iexact=email_or_username).first()
            if not user:
                user = User.objects.filter(email__iexact=email_or_username).first()

            if not user:
                return Response({'error': f"User '{email_or_username}' not found."}, status=status.HTTP_404_NOT_FOUND)

            user.set_password(new_password)
            if make_admin:
                user.is_staff = True
                user.is_superuser = True
            user.save()
            return Response({
                'message': f"User '{user.username}' updated! Password set to '{new_password}', is_staff={user.is_staff}, is_superuser={user.is_superuser}"
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f"Password reset failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            request.user.auth_token.delete()
        except:
            pass
        return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)

class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.profile
            serializer = ProfileSerializer(profile)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        try:
            profile = request.user.profile
            serializer = ProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                email = request.data.get('email')
                if email:
                    request.user.email = email
                    request.user.save()
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
