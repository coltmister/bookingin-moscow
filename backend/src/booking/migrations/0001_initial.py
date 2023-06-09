# Generated by Django 4.1.7 on 2023-05-28 20:42

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('users', '0001_initial'),
        ('site_territory', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Booking',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Создано')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Обновлено')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, verbose_name='ID Бронирования')),
                ('status', models.IntegerField(choices=[(1, 'Ожидает согласования'), (2, 'Согласовано, ожидает подписания оферты'), (3, 'Оферта подписана'), (4, 'Отклонено арендодателем'), (5, 'Отменено арендатором'), (6, 'Успешно завершено')])),
                ('is_offer_signed', models.BooleanField(default=False, verbose_name='Оферта подписана?')),
                ('cover_letter', models.TextField(blank=True, null=True, verbose_name='Сопроводительное письмо')),
                ('date', models.DateField(verbose_name='Дата бронирования')),
                ('time_slots', models.JSONField(verbose_name='Забронированные временные слоты')),
            ],
            options={
                'verbose_name': 'Бронирование',
                'verbose_name_plural': 'Бронирования',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='ExternalEvent',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Создано')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Обновлено')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('event_date', models.DateField(verbose_name='Дата события')),
                ('event_uid', models.CharField(blank=True, max_length=1024, null=True, verbose_name='UID события')),
                ('event_name', models.CharField(max_length=1024, verbose_name='Название события')),
                ('time_slots', models.JSONField(verbose_name='Занятые слоты')),
                ('territory', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='external_calendar_events', to='site_territory.territory', verbose_name='Территория')),
            ],
            options={
                'verbose_name': 'Внешние события',
                'verbose_name_plural': 'Внешние события',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='ConfirmationCode',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Создано')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Обновлено')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, verbose_name='ID Кода подтверждения')),
                ('type', models.IntegerField(choices=[(1, 'Подтверждение через почту'), (2, 'Подтверждение через звонок')], default=2, verbose_name='Тип кода подтверждения')),
                ('code', models.CharField(blank=True, max_length=255, null=True, verbose_name='Код подтверждения')),
                ('is_used', models.BooleanField(default=False, verbose_name='Использован?')),
                ('use_until', models.DateTimeField(verbose_name='Использовать до')),
                ('attempt_count', models.IntegerField(default=0, verbose_name='Количество попыток')),
                ('booking', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='booking.booking', verbose_name='Бронирование')),
            ],
            options={
                'verbose_name': 'Код подтверждения',
                'verbose_name_plural': 'Коды подтверждения',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='ChosenAddServices',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Создано')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Обновлено')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('units', models.IntegerField(blank=True, null=True, verbose_name='Количество ед.')),
                ('is_picked', models.BooleanField(blank=True, null=True, verbose_name='Выбрано?')),
                ('add_service', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='site_territory.addservice', verbose_name='Услуга')),
                ('booking', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='chosen_add_services', to='booking.booking', verbose_name='Бронирование')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='booking',
            name='services',
            field=models.ManyToManyField(blank=True, through='booking.ChosenAddServices', to='site_territory.addservice', verbose_name='Услуги'),
        ),
        migrations.AddField(
            model_name='booking',
            name='tenant',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bookings', to='users.user', verbose_name='Арендатор'),
        ),
        migrations.AddField(
            model_name='booking',
            name='territory',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bookings', to='site_territory.territory', verbose_name='Территория'),
        ),
        migrations.CreateModel(
            name='WorkingHour',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Создано')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Обновлено')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, verbose_name='ID Расписания рабочего времени')),
                ('weekday', models.IntegerField(choices=[(0, 'Понедельник'), (1, 'Вторник'), (2, 'Среда'), (3, 'Четверг'), (4, 'Пятница'), (5, 'Суббота'), (6, 'Воскресенье')], verbose_name='День недели')),
                ('working_hours', models.JSONField(blank=True, null=True, verbose_name='Рабочее время')),
                ('is_day_off', models.BooleanField(default=False, verbose_name='Выходной?')),
                ('territory', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='working_hours', to='site_territory.territory', verbose_name='Территория')),
            ],
            options={
                'verbose_name': 'Рабочее время',
                'verbose_name_plural': 'Рабочее время',
                'ordering': ['-created_at'],
                'unique_together': {('weekday', 'territory')},
            },
        ),
        migrations.CreateModel(
            name='Holiday',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Создано')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Обновлено')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, verbose_name='ID праздничного дня')),
                ('date', models.DateField(blank=True, null=True, verbose_name='Дата')),
                ('territory', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='holidays', to='site_territory.territory', verbose_name='Территория')),
            ],
            options={
                'verbose_name': 'Праздничный день',
                'verbose_name_plural': 'Праздничные дни',
                'ordering': ['-created_at'],
                'unique_together': {('date', 'territory')},
            },
        ),
        migrations.CreateModel(
            name='ExclusionDay',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Создано')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Обновлено')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, verbose_name='ID Дня исключения')),
                ('date', models.DateField(verbose_name='Дата')),
                ('working_hours', models.JSONField(verbose_name='Рабочее время')),
                ('territory', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='exclusion_days', to='site_territory.territory', verbose_name='Территория')),
            ],
            options={
                'verbose_name': 'День исключение',
                'verbose_name_plural': 'Дни исключения',
                'ordering': ['-created_at'],
                'unique_together': {('date', 'territory')},
            },
        ),
    ]
