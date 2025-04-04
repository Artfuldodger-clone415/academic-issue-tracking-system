from django.urls import path
from .views import IssueListCreateView, IssueDetailView, CommentListCreateView, NotificationListView, MarkNotificationReadView

urlpatterns = [
    path('issues/', IssueListCreateView.as_view(), name='issue-list-create'),
    
    path('notifications/<int:pk>/mark-read/', MarkNotificationReadView.as_view(), name='mark-notification-read'),
]
