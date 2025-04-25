from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Issue, Comment, Notification

class CustomUserAdmin(UserAdmin): 
    model = User
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'college', 'is_staff')
    list_filter = ('role', 'college', 'is_staff', 'is_active')
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email', 'phone_number')}),
        ('Role-specific info', {'fields': ('role', 'student_number', 'college', 'course_units')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = ( 
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'first_name', 'last_name', 'phone_number', 
                      'password1', 'password2', 'role', 'student_number', 'college', 
                      'course_units', 'is_staff', 'is_active')}
        ),
    )
    search_fields = ('username', 'email', 'first_name', 'last_name', 'student_number', 'college')
    ordering = ('username',) 

class CommentInline(admin.TabularInline): 
    model = Comment
    extra = 0

class IssueAdmin(admin.ModelAdmin): 
    list_display = ('title', 'created_by', 'assigned_to', 'status', 'created_at', 'updated_at')
    list_filter = ('status', 'created_at') 
    search_fields = ('title', 'description') 
    inlines = [CommentInline]
    date_hierarchy = 'created_at'

class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'notification_type', 'issue', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read', 'created_at')
    search_fields = ('message',)
    date_hierarchy = 'created_at'  

admin.site.register(User, CustomUserAdmin)
admin.site.register(Issue, IssueAdmin) 
admin.site.register(Comment) 
admin.site.register(Notification, NotificationAdmin) 