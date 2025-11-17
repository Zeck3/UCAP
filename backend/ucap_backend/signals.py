from django.db.models.signals import post_save, post_migrate
from django.dispatch import receiver
from ucap_backend.models import Section
from ucap_backend.services.class_record_data_population import create_class_record_service
from ucap_backend.services.data_population import populate_default_data

@receiver(post_migrate)
def seed_defaults(sender, **kwargs):
    if sender.name != "ucap_backend":
        return
    try:
        populate_default_data()
    except Exception as e:
        print("Seeding skipped:", e)

@receiver(post_save, sender=Section)
def initialize_class_record(sender, instance, created, **kwargs):
    if created:
        create_class_record_service(instance)