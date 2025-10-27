from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from main.views import (
    dashboard_view,
    login_view,
    logout_view,
    register_view,
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # API URLs
    path('api/', include('main.api_urls')),

    # Template URLs (for backward compatibility)
    path('', include('main.urls')),

    # React app - catch all for frontend
    re_path(r'^(?!api/).*$', TemplateView.as_view(template_name='index.html'), name='react_app'),
]
