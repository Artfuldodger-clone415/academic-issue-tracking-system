from django.urls import path
from .views import IssueListCreateView, IssueDetailView, CommentListCreateView, NotificationListView, MarkNotificationReadView

urlpatterns = [
    path('issues/', IssueListCreateView.as_view(), name='issue-list-create'),
    path('issues/<int:pk>/', IssueDetailView.as_view(), name='issue-detail'),
    path('issues/<int:issue_id>/comments/', CommentListCreateView.as_view(), name='comment-list-create'),
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/mark-read/', MarkNotificationReadView.as_view(), name='mark-notification-read'),
]
