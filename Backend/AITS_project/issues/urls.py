from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from rest_framework_simplejwt.views import TokenRefreshView
# In issues/urls.py
from .token_views import CustomTokenObtainPairView
from .token_views import CustomTokenObtainPairView
from .views import (
    RegisterView, 
    UserProfileView, 
    UserListView,
    IssueViewSet, 
    CommentViewSet,
    NotificationViewSet,
    CollegesView,
    CourseUnitsView,
    RoleFieldsView,
    DashboardView
)
from .models import User

router = DefaultRouter()
router.register(r'issues', IssueViewSet)
router.register(r'notifications', NotificationViewSet, basename='notifications')

# Nested router for comments
issues_router = routers.NestedSimpleRouter(router, r'issues', lookup='issue')
issues_router.register(r'comments', CommentViewSet, basename='issue-comments')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(issues_router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('users/', UserListView.as_view(), name='user-list'),
    
    # Use custom token views
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Dashboard endpoint
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    
    # Registration data endpoints
    path('colleges/', CollegesView.as_view(), name='colleges'),
    path('course-units/', CourseUnitsView.as_view(), name='course-units'),
    path('role-fields/', RoleFieldsView.as_view(), name='role-fields'),
    
    # Filter users by role
    path('lecturers/', UserListView.as_view(), {'role': User.LECTURER}, name='lecturers'),
    path('students/', UserListView.as_view(), {'role': User.STUDENT}, name='students'),
    path('registrars/', UserListView.as_view(), {'role': User.ACADEMIC_REGISTRAR}, name='registrars'),
]

