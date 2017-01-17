# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2016-08-09 06:58
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_auto_20160805_1829'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='username',
        ),
        migrations.AddField(
            model_name='user',
            name='first_name',
            field=models.TextField(default='', max_length=255, verbose_name='first_name'),
        ),
        migrations.AddField(
            model_name='user',
            name='last_name',
            field=models.TextField(default='', max_length=255, verbose_name='last_name'),
        ),
        migrations.AddField(
            model_name='user',
            name='phone',
            field=models.IntegerField(default=0),
        ),
    ]