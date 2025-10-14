from django.shortcuts import render
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin

class DashboardView(LoginRequiredMixin, View):
    def get(self, request):
        return render(request, 'backend/dashboard.html')

class ButtonsView(View):
    def get(self, request):
        return render(request, 'backend/buttons.html')

class CardsView(View):
    def get(self, request):
        return render(request, 'backend/cards.html')


class FrontendIndexView(View):
    def get(self, request):
        return render(request, 'frontend/index.html')


class FrontendGenericView(View):
    def get(self, request):
        return render(request, 'frontend/generic.html')


class FrontendElementsView(View):
    def get(self, request):
        return render(request, 'frontend/elements.html')