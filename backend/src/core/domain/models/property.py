import uuid
from dataclasses import dataclass, field

from ..common.enums import PersonalityTraitGroup


@dataclass(frozen=True)
class Property:
    """Base class for all card properties."""

    id: uuid.UUID


@dataclass(frozen=True)
class BodySicknessProperty(Property):
    """Represents a property for body sickness."""

    body_sickness: str


@dataclass(frozen=True)
class MentalSicknessProperty(Property):
    """Represents a property for mental sickness."""

    mental_sickness: str


@dataclass(frozen=True)
class PersonalityTraitProperty(Property):
    """Represents a property for personality traits."""

    group: PersonalityTraitGroup
    trait: str


@dataclass(frozen=True)
class ProfessionProperty(Property):
    """Represents a property for profession-related information."""

    profession: str


@dataclass(frozen=True)
class HobbyProperty(Property):
    """Represents a property for hobbies and interests."""

    hobby: str


@dataclass(frozen=True)
class InventoryProperty(Property):
    """Represents a property for inventory items."""

    item: str
    quantity: int


@dataclass(frozen=True)
class WorldviewProperty(Property):
    """Represents a property for worldview-related information."""

    worldview: str


@dataclass(frozen=True)
class AdditionalInfoProperty(Property):
    """Represents a property for additional information about a character."""

    additional_info: str


@dataclass(frozen=True)
class CataclysmDescriptionProperty(Property):
    """Represents a property for cataclysm description."""

    description: str