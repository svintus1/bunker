from enum import StrEnum, auto


class LobbyStatus(StrEnum):
    WAITING = auto()
    IN_GAME = auto()
    FINISHED = auto()


class EventType(StrEnum):
    JOIN = auto()
    LEAVE = auto()


class BodyComposition(StrEnum):
    SKINNY      = "Худое"
    SHPALA      = "Шпала"
    SLIM        = "Стройное"
    NORMAL      = "Среднее"
    ATHLETIC    = "Атлетичное"
    STOCKY      = "Крепкое"
    PLUMP       = "Пухлое"
    FAT         = "Жирное"
    BEAR        = "Медведь"
    PUDGE       = "Пудж"


class ExperienceLevel(StrEnum):
    BEGINNER        = "Новичок"
    AMATEUR         = "Любитель"
    ADVANCED        = "Продвинутый"
    PROFESSIONAL    = "Профессионал"
    MASTER          = "Мастер"


class PersonalityTraitGroup(StrEnum):
    MORAL           = auto()
    SOCIAL          = auto()
    EMOTIONAL       = auto()
    INTELLECTUAL    = auto()
    WILLPOWER       = auto()