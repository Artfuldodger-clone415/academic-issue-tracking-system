from django.urls import path
from .views import IssueListCreateView

urlpatterns = [
    path("issues/", IssueListCreateView.as_view(), name="issue-list"),
]
