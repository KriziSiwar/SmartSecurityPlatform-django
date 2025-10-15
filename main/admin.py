from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('username', 'email', 'role', 'is_active', 'is_staff', 'date_creation')
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('role', 'nom', 'date_creation', 'actif')}),
    )
