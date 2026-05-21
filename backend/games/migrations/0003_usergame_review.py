from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('games', '0002_usergame_is_favourite_usergame_updated_at'),
    ]

    operations = [
        migrations.AddField(
            model_name='usergame',
            name='review_text',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='usergame',
            name='review_visibility',
            field=models.CharField(
                choices=[('global', 'Global'), ('friends', 'Friends')],
                default='global',
                max_length=10,
            ),
        ),
    ]
