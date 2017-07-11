from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser
from enum import Enum

class UserManager(BaseUserManager):
    def create_user(self, email, first_name, last_name, phone, password=None):
        if not email:
            raise ValueError('Users must have an email address')
        user = self.model(email=self.normalize_email(email), first_name=first_name, last_name=last_name, phone=phone)
        user.username = first_name
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, first_name, last_name, phone, password, user_type):
        user = self.create_user(email, password=password, first_name=first_name, last_name=last_name, phone=phone)
        user.username = first_name
        user.user_type = user_type
        user.save(using=self._db)
        return user


class User(AbstractBaseUser):
    email = models.EmailField(verbose_name='email address', max_length=255, unique=True)
    username = models.TextField(verbose_name='username', max_length=255, default='')
    first_name = models.TextField(verbose_name='first_name', max_length=255, default='')
    last_name = models.TextField(verbose_name='last_name', max_length=255, default='')
    user_type = models.IntegerField(default=1)
    phone = models.TextField(default='')
    is_active = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def get_full_name(self):
        return self.email

    def get_short_name(self):
        return self.username

    def __str__(self):
        return self.email

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True

    @property
    def is_staff(self):
        return self.is_admin

    def update_user(self, email, first_name, last_name, phone, password=None):
        if not email:
            raise ValueError('Users must have an email address')
        self.first_name = first_name
        self.username = first_name
        self.last_name = last_name
        self.phone = phone
        self.email = email
        self.save()
        return self


class UserType(Enum):
    HOTELIER = (1,"Hotelier")
    TRAVEL_AGENT = (2,"Travel Agent")
    CORPORATE = (3,"Corporate")
    SUPPORT = (4,"Support")

    def __init__(self, id, name):
        self.type_name = name
        self.type_id = id

    @classmethod
    def get_id(cls, name):
        user_types_details = cls.__members__.values()
        for user_type in user_types_details:
            if user_type.name == name:
                return user_type.type_id

        return -1

    @classmethod
    def get_name(cls, id):
        user_types_details = cls.__members__.values()
        for user_type in user_types_details:
            if user_type.type_id == id:
                return user_type.type_name

        return None
