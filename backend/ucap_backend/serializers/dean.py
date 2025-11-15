

from ucap_backend.models import Section
from .base import BaseCourseDetailsSerializer, BaseLoadedCourseSerializer, BaseSectionSerializer

# ====================================================
# Dean
# ====================================================
class DeanLoadedCourseSerializer(BaseLoadedCourseSerializer):
    class Meta(BaseLoadedCourseSerializer.Meta):
        fields = BaseLoadedCourseSerializer.Meta.fields

class DeanSectionSerializer(BaseSectionSerializer):
    class Meta(BaseSectionSerializer.Meta):
        model = Section
        fields = [
            "section_id",
            "year_and_section",
            "instructor_assigned",
            "instructor_id",
        ]

class DeanCourseDetailsSerializer(BaseCourseDetailsSerializer):
    class Meta(BaseCourseDetailsSerializer.Meta):
        model = Section
        fields = BaseCourseDetailsSerializer.Meta.fields