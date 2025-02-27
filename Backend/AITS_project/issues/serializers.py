from rest_framework import serializers
from .models import Issue, Comment, Notification
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'user', 'content', 'created_at']
        read_only_fields = ['id', 'created_at']

class IssueSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Issue
        fields = ['id', 'title', 'description', 'issue_type', 'course_code', 'status', 'student', 'created_at', 'updated_at', 'comments']
        read_only_fields = ['id', 'status', 'student', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['student'] = self.context['request'].user
        return super().create(validated_data)

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'issue', 'message', 'is_read', 'created_at']
        read_only_fields = ['id', 'created_at']