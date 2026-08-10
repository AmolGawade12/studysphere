from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['name', 'email', 'college', 'course', 'year', 'profile_image', 'created_at']
        read_only_fields = ['created_at']

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'profile']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', {})
        # Create User
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        # Update/Save Profile
        profile = user.profile
        profile.name = profile_data.get('name', user.get_full_name() or user.username)
        profile.email = profile_data.get('email', user.email)
        profile.college = profile_data.get('college', '')
        profile.course = profile_data.get('course', '')
        profile.year = profile_data.get('year', '')
        profile.save()
        return user
