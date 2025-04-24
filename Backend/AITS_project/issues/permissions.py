from rest_framework import permissions 
from .models import User

class IsAdminUser(permissions.BasePermission): 
    def has_permission(self, request, view): 
        return request.user and request.user.role == User.ADMIN 

class IsAcademicRegistrar(permissions.BasePermission):  
    def has_permission(self, request, view):
        return request.user and request.user.role == User.ACADEMIC_REGISTRAR  

class IsLecturer(permissions.BasePermission):  
    def has_permission(self, request, view):
        return request.user and request.user.role == User.LECTURER 
       
class IsStudent(permissions.BasePermission): 
    def has_permission(self, request, view):
        return request.user and request.user.role == User.STUDENT 
                    
class IsOwnerOrReadOnly(permissions.BasePermission): 
    def has_object_permission(self, request, view, obj): 
        if request.method in permissions.SAFE_METHODS: 
            return True
        return obj.created_by == request.user 

class IsLecturerAssignedToIssue(permissions.BasePermission): 
    """
    Custom permission to only allow lecturers assigned to an issue to perform actions.
    """
    
    def has_object_permission(self, request, view, obj): 
        # Check if user is a lecturer and is assigned to this issue
        return (request.user.role == User.LECTURER and 
                obj.assigned_to == request.user) 
