# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("assignments", "0007_auto_20250921_1022"),
    ]

    operations = [
        migrations.AddField(
            model_name="rubricitem",
            name="is_active",
            field=models.BooleanField(default=True),
        ),
    ]
