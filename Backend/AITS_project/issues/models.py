from django.db import models

class Issue(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    issue_type = models.CharField(max_length=100)
    course_code = models.CharField(max_length=20)

    def __str__(self):
        return self.title
