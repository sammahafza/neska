from django.shortcuts import render, redirect
from django.contrib import messages
from .forms import UserLoginForm, RegisterForm
from video_app.models import User
from django.contrib.auth import authenticate, get_user_model, login, logout

def register_view(request):
    if request.method == "POST":
        form = RegisterForm(request.POST)
        if form.is_valid():
            x = form.save()
    else: # if GET
            form = RegisterForm()
    return render(request, "accounts/register.html", {'form': form})


def login_view(request):
    next = request.GET.get('next')
    form = UserLoginForm(request.POST or None)
    if form.is_valid():
        email = form.cleaned_data.get('email')
        password = form.cleaned_data.get('password')
        user = authenticate(email=email, password=password)
        login(request, user)
        if next:
            return redirect(next)
        return redirect('/') # here must go to the react app

    return render(request, 'accounts/login.html', {'form': form})

    