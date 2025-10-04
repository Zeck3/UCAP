from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Section
from .services import *

@receiver(post_save, sender=Section)
def initialize_class_record(sender, instance, created, **kwargs):
    if created:
        create_class_record_service(instance)
