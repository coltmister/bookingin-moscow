# Generated by Django 4.1.7 on 2023-05-28 20:42

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='LogoutUser',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Создано')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Обновлено')),
                ('id', models.AutoField(primary_key=True, serialize=False, verbose_name='ID')),
                ('session_id', models.UUIDField(blank=True, null=True, verbose_name='ID сессии')),
                ('iat_before', models.DateTimeField(verbose_name='Время выхода из системы')),
                ('logout_type', models.IntegerField(choices=[(0, 'Обновление токена'), (1, 'Выход из системы')], default=0, verbose_name='Тип выхода из системы')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.user', verbose_name='Пользователь')),
            ],
            options={
                'verbose_name': 'Logout пользователь',
                'verbose_name_plural': 'Logout пользователи',
            },
        ),
        migrations.AddIndex(
            model_name='logoutuser',
            index=models.Index(fields=['user', 'iat_before', 'logout_type'], name='iam_logoutu_user_id_addaf7_idx'),
        ),
        migrations.AddIndex(
            model_name='logoutuser',
            index=models.Index(fields=['user', 'session_id'], name='iam_logoutu_user_id_8525da_idx'),
        ),
    ]
