from django.db import models
from django.contrib.auth.hashers import make_password


class role_tbl(models.Model):
    role_id = models.AutoField(serialize=True, primary_key=True)
    role_type = models.CharField(max_length=255) 

    def __str__(self):
        return self.role_type

class user_tbl(models.Model):
    user_id = models.CharField(max_length=10, primary_key=True)
    role_id = models.ForeignKey(role_tbl, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=255)
    middle_name = models.CharField(max_length=255, blank=True, null=True)
    last_name = models.CharField(max_length=255)
    suffix = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(max_length=255, unique=True)
    password = models.CharField(max_length=255)
    
    def save(self, *args, **kwargs):
        if not self.pk or not user_tbl.objects.filter(pk=self.pk, password=self.password).exists():
            self.password = make_password(self.password)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"