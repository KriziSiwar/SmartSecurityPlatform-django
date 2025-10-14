from django.contrib import admin
from django.urls import path
from django.contrib.auth import views as auth_views
from main.views import (
    DashboardView,
    ButtonsView,
    CardsView,
    FrontendIndexView,
    FrontendGenericView,
    FrontendElementsView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('buttons/', ButtonsView.as_view(), name='buttons'),
    path('cards/', CardsView.as_view(), name='cards'),
    path('', FrontendIndexView.as_view(), name='frontend_index'),
    path('generic/', FrontendGenericView.as_view(), name='frontend_generic'),
    path('elements/', FrontendElementsView.as_view(), name='frontend_elements'),
    path('login/', auth_views.LoginView.as_view(template_name='backend/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
]