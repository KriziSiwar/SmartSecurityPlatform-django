from django.contrib import admin
from django.urls import path, include
from main.views import (
    dashboard_view,
    login_view,
    logout_view,
    register_view,
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # Authentification
    path('login/', login_view, name='login'),
    path('register/', register_view, name='register'),
    path('logout/', logout_view, name='logout'),

    # Tableau de bord
    path('dashboard/', dashboard_view, name='dashboard'),

    # URLs supplémentaires du module principal
    path('', include('main.urls')),
]
