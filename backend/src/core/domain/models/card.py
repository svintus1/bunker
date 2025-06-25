import random
from typing import Literal
from abc import ABC
from dataclasses import dataclass, field

from ..common.enums import BodyComposition, ExperienceLevel
from ..models.property import (
    BodySicknessProperty,
    MentalSicknessProperty,
    PersonalityTraitProperty,
    ProfessionProperty,
    HobbyProperty,
    InventoryProperty,
    WorldviewProperty,
    AdditionalInfoProperty,
    CataclysmDescriptionProperty,
)

@dataclass
class Card(ABC):
    """Abstract base class representing any category of Bunker playing card."""


@dataclass
class GeneralInfoCard(Card):
    """Represents a card containing general information about a character."""

    sex: Literal["male", "female"] = field(
        default_factory=lambda: random.choice(["male", "female"])
        )
    age: int = field(default_factory=lambda: random.randint(12, 120))


@dataclass
class PhysiqueCard(Card):
    """Represents a card containing physical attributes of a character."""

    height: int = field(default_factory=lambda: random.randint(130, 230))
    weight: int = field(default_factory=lambda: random.randint(30, 400))
    bmi: float = field(init=False)
    body_composition: BodyComposition = field(init=False)
    def __post_init__(self):
        """Calculate BMI and body composition after initialization."""
        self.bmi = round(self.weight / ((self.height / 100) ** 2), 2)

        if self.bmi < 18.5:
            self.body_composition = BodyComposition.SKINNY
        elif self.bmi < 22.5:
            if self.height > 190:
                self.body_composition = BodyComposition.SHPALA
            else:
                self.body_composition = BodyComposition.SKINNY
        elif self.bmi < 25:
            self.body_composition = BodyComposition.NORMAL
        elif self.bmi < 33:
            self.body_composition = random.choice(
                [BodyComposition.PLUMP,
                BodyComposition.ATHLETIC if self.height > 175 else BodyComposition.STOCKY]
                )
        elif self.bmi < 40:
            self.body_composition = random.choice(
                [BodyComposition.FAT, BodyComposition.ATHLETIC]
                )
        else:
            self.body_composition = random.choice(
                [BodyComposition.BEAR, BodyComposition.PUDGE]
                )


@dataclass
class HealthCard(Card):
    """Represents a card containing health-related information of a character."""

    # Sicknesses would be retrieved if the probability is met, else would be None
    body_sickness: BodySicknessProperty | None
    mental_sickness: MentalSicknessProperty | None
    _body_sickness_probability: float = 0.33
    _mental_sickness_probability: float = 0.25


@dataclass
class PersonalityCard(Card):
    """Represents a card containing personality traits of a character."""

    personality_traits: list[PersonalityTraitProperty] = field(default_factory=list)


@dataclass
class ProfessionCard(Card):
    """Represents a card containing profession-related information of a character."""

    profession: ProfessionProperty
    experience: ExperienceLevel = field(default_factory=lambda: random.choice(list(ExperienceLevel)))


@dataclass
class HobbyCard(Card):
    """Represents a card containing hobbies and interests of a character."""

    hobby: HobbyProperty
    experience: ExperienceLevel = field(default_factory=lambda: random.choice(list(ExperienceLevel)))


@dataclass
class InventoryCard(Card):
    """Represents a card containing inventory items of a character."""

    items: list[InventoryProperty] = field(default_factory=list)


@dataclass
class WorldviewCard(Card):
    """Represents a card containing worldview-related information of a character."""

    worldview: WorldviewProperty | None = None


@dataclass
class AdditionalInfoCard(Card):
    """Represents a card containing additional information about a character."""

    additional_info: AdditionalInfoProperty


@dataclass
class TimeInBunker:
    """Represents a card containing time to spend in a bunker."""

    years: int = field(default_factory=lambda: random.randint(3, 10))
    months: int = field(default_factory=lambda: random.randint(0, 11))
    days: int = field(default_factory=lambda: random.randint(0, 30))


@dataclass
class CataclysmCard(Card):
    """Represents a card containing information about the cataclysm."""

    description: CataclysmDescriptionProperty
    people_left: int = field(
        # Approx. [0; 1000_000_000]
        default_factory=lambda: int(random.expovariate(10e-9))
        )
    time_in_bunker: TimeInBunker = field(default_factory=TimeInBunker)