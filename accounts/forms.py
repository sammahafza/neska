from django import forms
from django.contrib.auth import authenticate
from django.contrib.auth.forms import UserCreationForm
from video_app.models import User


class UserLoginForm(forms.Form):
    email = forms.EmailField()
    password = forms.CharField(widget=forms.PasswordInput)

    def clean(self, *args, **kwargs):
        email = self.cleaned_data.get("email")
        password = self.cleaned_data.get("password")

        if email and password:
            user = authenticate(email=email, password=password)
            if not user:
                raise forms.ValidationError("This user does not exist")

        return super(UserLoginForm, self).clean(*args, **kwargs)


class RegisterForm(UserCreationForm):

    email = forms.EmailField(required=True)
    first_name = forms.CharField()
    last_name = forms.CharField()

    def clean_first_name(self):
        first_name = self.cleaned_data.get("first_name").capitalize()
        return first_name

    def clean_last_name(self):
        last_name = self.cleaned_data.get("last_name").capitalize()
        return last_name

    class Meta:
        model = User
        fields = ["first_name", "last_name", "email", "password1", "password2"]