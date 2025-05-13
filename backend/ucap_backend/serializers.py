from rest_framework import serializers
from .models import *
from django.contrib.auth.hashers import check_password

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['role_id', 'role_type']  # Use 'role_type', not 'role_name'

class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

    def validate_user_id(self, value):
        if User.objects.filter(user_id=value).exists():
            raise serializers.ValidationError("User ID already exists.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value
    
class LoginValidator:
    def __init__(self, data):
        self.data = data
        self.user = None
        self.errors = {}

    def is_valid(self):
        user_id = self.data.get("user_id")
        password = self.data.get("password")

        if not user_id or not password:
            self.errors["message"] = "Both user_id and password are required."
            return False

        try:
            user = User.objects.get(user_id=user_id)
            if not check_password(password, user.password):
                raise ValueError
            self.user = user
            return True
        except:
            self.errors["message"] = "Invalid user_id or password."
            return False

