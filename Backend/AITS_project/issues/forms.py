from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import User, Issue, Comment

class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'role', 'phone_number', 
                  'student_number', 'college', 'course_units')
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['student_number'].required = False
        
    def clean(self):
        cleaned_data = super().clean()
        role = cleaned_data.get('role')
        
        if role == User.STUDENT:
            if not cleaned_data.get('student_number'):
                self.add_error('student_number', 'Student number is required for students')
            if not cleaned_data.get('college'):
                self.add_error('college', 'College is required for students')
        else:
            # Clear student_number for non-students
            cleaned_data['student_number'] = None
            if role in [User.LECTURER, User.ACADEMIC_REGISTRAR]:
                if not cleaned_data.get('college'):
                    self.add_error('college', 'College is required')
                
        return cleaned_data
    
class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'role', 'phone_number', 
                  'student_number', 'college', 'course_units')
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['student_number'].required = False
        self.fields['college'].required = False
        self.fields['course_units'].required = False
        
    def clean(self):
        cleaned_data = super().clean()
        role = cleaned_data.get('role')
        
        if role == User.STUDENT:
            if not cleaned_data.get('student_number'):
                self.add_error('student_number', 'Student number is required for students')
            if not cleaned_data.get('college'):
                self.add_error('college', 'College is required for students')
        elif role in [User.LECTURER, User.ACADEMIC_REGISTRAR]:
            if not cleaned_data.get('college'):
                self.add_error('college', 'College is required')
                
        return cleaned_data

class IssueForm(forms.ModelForm):
    class Meta:
        model = Issue
        fields = ('title', 'description', 'assigned_to', 'status')
        widgets = {
            'description': forms.Textarea(attrs={'rows': 4}),
        }

class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ('content',)
        widgets = {
            'content': forms.Textarea(attrs={'rows': 3}),
        }