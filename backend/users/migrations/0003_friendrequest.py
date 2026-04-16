from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0002_friendship"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="FriendRequest",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("status", models.CharField(choices=[("pending", "Pending"), ("accepted", "Accepted"), ("declined", "Declined")], default="pending", max_length=10)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("from_user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="requests_sent", to=settings.AUTH_USER_MODEL)),
                ("to_user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="requests_received", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "unique_together": {("from_user", "to_user")},
            },
        ),
    ]
