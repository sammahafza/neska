"""neska URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path, re_path, reverse_lazy
from django.views.generic import TemplateView
from django.views.generic.edit import CreateView

from accounts import views as accounts_views
from accounts.forms import RegisterForm
from django.contrib.auth.decorators import login_required



urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', accounts_views.login_view, name="login"),
    path('api/', include('video_app.urls')),
    path('', login_required(TemplateView.as_view(template_name="index.html"), 
    login_url='login'), name="index"),
    # react routings...
    re_path(r'^meeting/\d+$', login_required(TemplateView.as_view(template_name="index.html"), 
    login_url='login')),
    re_path(r'^join/?$', login_required(TemplateView.as_view(template_name="index.html"), 
    login_url='login')),

    re_path('^register/', CreateView.as_view(
        template_name='accounts/register.html',
        form_class=RegisterForm,
        success_url=reverse_lazy('index')  # note the usage of reverse_lazy here
    ), name='register'),

]
