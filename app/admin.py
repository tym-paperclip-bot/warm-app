from sqladmin import Admin, ModelView

from app.models import BodyPart, Equipment, Exercise, WarmupSession


class EquipmentAdmin(ModelView, model=Equipment):
    column_list = [Equipment.id, Equipment.name]
    name = "Equipment"
    name_plural = "Equipment"
    icon = "fa-solid fa-dumbbell"


class BodyPartAdmin(ModelView, model=BodyPart):
    column_list = [BodyPart.id, BodyPart.name]
    name = "Body Part"
    name_plural = "Body Parts"
    icon = "fa-solid fa-person"


class ExerciseAdmin(ModelView, model=Exercise):
    column_list = [Exercise.id, Exercise.name, Exercise.body_part, Exercise.equipment, Exercise.video_provider]
    column_searchable_list = [Exercise.name]
    column_sortable_list = [Exercise.id, Exercise.name]
    form_include_pk = False
    name = "Exercise"
    name_plural = "Exercises"
    icon = "fa-solid fa-list"


class WarmupSessionAdmin(ModelView, model=WarmupSession):
    column_list = [WarmupSession.id, WarmupSession.created_at]
    can_create = False
    can_edit = False
    name = "Session"
    name_plural = "Sessions"
    icon = "fa-solid fa-calendar"


def setup_admin(app, engine):
    admin = Admin(app, engine, title="Warm-Up Manager")
    admin.add_view(ExerciseAdmin)
    admin.add_view(BodyPartAdmin)
    admin.add_view(EquipmentAdmin)
    admin.add_view(WarmupSessionAdmin)
