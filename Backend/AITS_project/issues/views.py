from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.db.models import Count
from .models import Issue, Comment, User, Notification
from .serializers import (
    UserSerializer,  
    UserProfileSerializer, 
    UserListSerializer, 
    IssueSerializer,  
    CommentSerializer, 
    NotificationSerializer 
)
from .permissions import IsAdminUser, IsAcademicRegistrar, IsLecturer, IsOwnerOrReadOnly, IsLecturerAssignedToIssue


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,) 
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Additional validation for role-specific fields
        role = serializer.validated_data.get('role')
        if role == User.STUDENT and not serializer.validated_data.get('student_number'):
            return Response(
                {"student_number": "Student number is required for students."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not serializer.validated_data.get('college'):
            if role == User.STUDENT:
                return Response(
                    {"college": "College is required for students."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            elif role in [User.LECTURER, User.ACADEMIC_REGISTRAR]:
                return Response(
                    {"college": "College is required."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = (permissions.IsAuthenticated,)
    
    def get_object(self):
        return self.request.user

class UserListView(generics.ListAPIView):
    serializer_class = UserListSerializer
    permission_classes = (permissions.IsAuthenticated,)
    
    def get_queryset(self):
        role = self.kwargs.get('role') or self.request.query_params.get('role')
        if role:
            return User.objects.filter(role=role)
        return User.objects.all()

class IssueViewSet(viewsets.ModelViewSet):
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer
    
    def get_permissions(self):
        if self.action in ['create']:
            permission_classes = [permissions.IsAuthenticated]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsOwnerOrReadOnly | IsAdminUser | IsAcademicRegistrar]
        elif self.action in ['request_info']:
            permission_classes = [permissions.IsAuthenticated, IsLecturerAssignedToIssue]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == User.ADMIN or user.role == User.ACADEMIC_REGISTRAR:
            return Issue.objects.all()
        elif user.role == User.LECTURER:
            return Issue.objects.filter(assigned_to=user) | Issue.objects.filter(created_by=user)
        else:  # Student
            return Issue.objects.filter(created_by=user)
    
    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        issue = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response({"error": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(id=user_id)
            if user.role not in [User.LECTURER, User.ACADEMIC_REGISTRAR, User.ADMIN]:
                return Response({"error": "Can only assign to staff members"}, status=status.HTTP_400_BAD_REQUEST)
            
            issue.assigned_to = user
            issue.save(update_fields=['assigned_to'])
            
            Notification.objects.create(
                user=user,
                notification_type=Notification.ASSIGNED,
                issue=issue,
                message=f"Issue '{issue.title}' has been assigned to you by {request.user.get_full_name()}"
            )
            
            return Response(IssueSerializer(issue).data)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get statistics about issues for dashboard"""
        user = request.user
        
        # Base queryset depends on user role
        if user.role == User.ADMIN or user.role == User.ACADEMIC_REGISTRAR:
            queryset = Issue.objects.all()
        elif user.role == User.LECTURER:
            queryset = Issue.objects.filter(assigned_to=user) | Issue.objects.filter(created_by=user)
        else:  # Student
            queryset = Issue.objects.filter(created_by=user)
        
        # Count issues by status
        status_counts = queryset.values('status').annotate(count=Count('status'))
        
        # Format the response
        stats = {
            'total': queryset.count(),
            'by_status': {item['status']: item['count'] for item in status_counts},
        }
        
        # Add college stats for academic registrar
        if user.role == User.ACADEMIC_REGISTRAR:
            college_counts = queryset.values('created_by__college').annotate(count=Count('created_by__college'))
            stats['by_college'] = {item['created_by__college'] or 'Unknown': item['count'] for item in college_counts}
        
        return Response(stats)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsLecturerAssignedToIssue])
    def request_info(self, request, pk=None):
        """Request more information from a student about an issue"""
        issue = self.get_object()
        message = request.data.get('message', 'More information is needed to resolve this issue.')
        
        # Create a comment with the request for more information
        comment = Comment.objects.create(
            issue=issue,
            content=message,
            created_by=request.user
        )
        
        # Notify the student who created the issue
        Notification.objects.create(
            user=issue.created_by,
            notification_type=Notification.COMMENT_ADDED,
            issue=issue,
            message=f"A lecturer has requested more information on your issue '{issue.title}'"
        )
        
        # Update the issue status to in_progress if it's pending
        if issue.status == Issue.PENDING:
            issue.status = Issue.IN_PROGRESS
            issue.save(update_fields=['status'])
        
        return Response({
            'success': True,
            'comment': CommentSerializer(comment).data,
            'issue': IssueSerializer(issue).data
        })

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Comment.objects.filter(issue_id=self.kwargs.get('issue_pk'))
    
    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsOwnerOrReadOnly | IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        notifications = Notification.objects.filter(user=request.user, is_read=False)
        notifications.update(is_read=True)
        return Response({"status": "All notifications marked as read"})
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({"status": "Notification marked as read"})

class CollegesView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        colleges = [
            "College of Computing and Information Sciences",
            "College of Engineering",
            "College of Business and Management Sciences",
            "College of Education and External Studies"
        ]
        return Response(colleges)

class CourseUnitsView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        course_units = [
            "Introduction to Programming",
            "Data Structures and Algorithms",
            "Database Systems",
            "Software Engineering",
            "Computer Networks"
        ]
        return Response(course_units)

class RoleFieldsView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        role = request.query_params.get('role', None)
        
        if not role:
            return Response({"error": "Role parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        if role == User.STUDENT:
            return Response({
                "required_fields": ["student_number", "college", "phone_number"],
                "optional_fields": []
            })
        elif role in [User.LECTURER, User.ACADEMIC_REGISTRAR]:
            return Response({
                "required_fields": ["college", "phone_number"],
                "optional_fields": []
            })
        else:
            return Response({"error": "Invalid role"}, status=status.HTTP_400_BAD_REQUEST)

class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Base data for all users
        data = {
            'user': {
                'id': user.id,
                'name': user.get_full_name(),
                'role': user.role,
                'college': user.college
            }
        }
        
        # Role-specific data  
        if user.role == User.STUDENT:
            # Get student's issues  
            issues = Issue.objects.filter(created_by=user)
            data['issues'] = {
                'total': issues.count(),
                'pending': issues.filter(status=Issue.PENDING).count(),
                'in_progress': issues.filter(status=Issue.IN_PROGRESS).count(),
                'resolved': issues.filter(status=Issue.RESOLVED).count(),
                'closed': issues.filter(status=Issue.CLOSED).count(),
            }
            
            # Get recent issues
            recent_issues = issues.order_by('-created_at')[:5]
            data['recent_issues'] = IssueSerializer(recent_issues, many=True).data
            
        elif user.role == User.LECTURER:
            # Get assigned issues
            assigned_issues = Issue.objects.filter(assigned_to=user)
            data['assigned_issues'] = {
                'total': assigned_issues.count(),
                'pending': assigned_issues.filter(status=Issue.PENDING).count(),
                'in_progress': assigned_issues.filter(status=Issue.IN_PROGRESS).count(),
                'resolved': assigned_issues.filter(status=Issue.RESOLVED).count(),
                'closed': assigned_issues.filter(status=Issue.CLOSED).count(),
            }
            
            # Get recent assigned issues
            recent_assigned = assigned_issues.order_by('-created_at')[:5]
            data['recent_assigned'] = IssueSerializer(recent_assigned, many=True).data
            
        elif user.role == User.ACADEMIC_REGISTRAR:
            # Get all issues
            all_issues = Issue.objects.all()
            data['all_issues'] = {
                'total': all_issues.count(),
                'pending': all_issues.filter(status=Issue.PENDING).count(),
                'in_progress': all_issues.filter(status=Issue.IN_PROGRESS).count(),
                'resolved': all_issues.filter(status=Issue.RESOLVED).count(),
                'closed': all_issues.filter(status=Issue.CLOSED).count(),
            }
            
            # Get issues by college
            college_stats = []
            colleges = User.objects.values_list('college', flat=True).distinct()
            for college in colleges:
                if college:  # Skip None values
                    count = Issue.objects.filter(created_by__college=college).count()
                    college_stats.append({'college': college, 'count': count})
            
            data['college_stats'] = college_stats
            
            # Get unassigned issues
            unassigned = Issue.objects.filter(assigned_to__isnull=True).order_by('-created_at')[:5]
            data['unassigned_issues'] = IssueSerializer(unassigned, many=True).data
        
        # Get unread notifications count
        data['unread_notifications'] = Notification.objects.filter(user=user, is_read=False).count()
        
        return Response(data)
