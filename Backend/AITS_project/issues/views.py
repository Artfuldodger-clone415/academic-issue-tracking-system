from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Issue, Comment, Notification
from .serializers import IssueSerializer, CommentSerializer, NotificationSerializer

class IssueListCreateView(generics.ListCreateAPIView):
    serializer_class = IssueSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Issue.objects.filter(student=self.request.user)

class IssueDetailView(generics.RetrieveUpdateAPIView):
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Issue.objects.filter(student=self.request.user)

class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        issue_id = self.kwargs['issue_id']
        return Comment.objects.filter(issue_id=issue_id)

    def perform_create(self, serializer):
        issue_id = self.kwargs['issue_id']
        issue = Issue.objects.get(id=issue_id)
        serializer.save(user=self.request.user, issue=issue)

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user, is_read=False)

class MarkNotificationReadView(generics.UpdateAPIView):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        notification = self.get_object()
        if notification.user != request.user:
            return Response(status=status.HTTP_403_FORBIDDEN)
        notification.is_read = True
        notification.save()
        return Response(status=status.HTTP_200_OK)