import random
import uuid
from typing import Any, Literal
from enum import StrEnum, auto

from pydantic import BaseModel, ConfigDict, computed_field, field_serializer
from sqlmodel import Field, SQLModel
from redis_om import JsonModel
from redis_om import get_redis_connection

from core.config import settings


class UserCreate(SQLModel):
    """User model to receive via API on creation."""

    name: str = Field(max_length=255)


class User(UserCreate, table=True):
    """User database model."""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)


class BaseJsonModel(JsonModel):
    # Configure default Redis connection for all models
    class Meta:
        database = get_redis_connection(url=str(settings.REDIS_DATABASE_URI))

    # Make the id field a kind of a reference to pk as I couldn't override it completely
    @property
    def id(self) -> str:
        return self.pk


class LobbyCreate(BaseJsonModel):
    """Lobby model to receive via API on creation."""

    name: str = Field(max_length=255)
    creator_id: uuid.UUID


class Lobby(LobbyCreate):
    """Lobby redis model.
    
    A group of players joins together in lobby.
    Lobby always has at least one player (creator)."""

    status: Literal["waiting", "playing", "finishing"] = "waiting"
    player_ids: list[str]


class LobbyOutput(BaseModel):
    """Lobby model for output in API, cleared of `pk` and `additionalProp1` fields created by redis-om."""

    id: str
    name: str
    creator_id: uuid.UUID
    status: Literal["waiting", "playing", "finishing"] = "waiting"
    player_ids: list[str]

    model_config = ConfigDict(extra="ignore")


class Player(BaseJsonModel):
    """Player redis model.
    
    Represents a User who has joined a Lobby. While User contains persistent data,
    Player contains session-specific data for the game."""

    user: User
    lobby_id: str | None = None


class EventType(StrEnum):
    JOIN = auto()
    LEAVE = auto()

class Event(BaseModel):
    """Model used as WebSocket API output message.
    
    Contains `event` and `data`."""

    event: EventType
    data: Any

    @field_serializer("data", mode="wrap", when_used="json")
    def _serialize_data(self, data, handler, info):
        """
        Recursively serialize:
          - BaseModel → use its .model_dump(mode="json")
          - dict      → recurse into values
          - list/tuple→ recurse into items
          - else      → leave as‑is
        """
        def recurse(v: Any) -> Any:
            if isinstance(v, BaseModel):
                # dump nested Pydantic models to JSON‑safe dict
                return v.model_dump(mode="json")
            if isinstance(v, dict):
                return {k: recurse(v2) for k, v2 in v.items()}
            if isinstance(v, (list, tuple)):
                return [recurse(i) for i in v]
            return v

        # first apply Pydantic’s normal dump to `data`
        dumped = handler(data, info)
        # then wrap/transform recursively
        return recurse(dumped)


class PlayingCard(BaseModel):
    """Model representing a playing card."""

    pass


class GeneralInfoCard(PlayingCard):
    """Model representing a general information card."""

    sex: Literal["male", "female"] = Field(
        default_factory=random.choice(["male", "female"]),
    )
    age: int = Field(
        default_factory=random.randint(12, 120),
        ge=12,
        le=120,
    )


class BodyComposition(StrEnum):
    """StrEnum representing a body composition."""
    SKINNY      = "Худое"
    SHPALA      = "Шпала"
    SLIM        = "Стройное"
    AVERAGE     = "Среднее"
    ATHLETIC    = "Атлетичное"
    STOCKY      = "Крепкое"
    PLUMP       = "Пухлое"
    FAT         = "Жирное"
    BEAR        = "Медведь"
    PUDGE       = "Пудж"


class PhysiqueCard(PlayingCard):
    """Model representing a physique card."""

    height: int = Field(
        default_factory=lambda: random.randint(130, 220),
        ge=130,
        le=220,
    )
    weight: int = Field(
        default_factory=lambda: random.randint(30, 250),
        ge=30,
        le=250,
    )

    @computed_field
    @property
    def bmi(self) -> float:
        """Calculate Body Mass Index (BMI) based on height and weight."""
        if self.weight and self.height:
            height_m = self.height / 100  # Convert height to meters
            return self.weight / (height_m ** 2)
        return 0.0

    @computed_field
    @property
    def body_composition(self) -> BodyComposition:
        if self.bmi < 18.5:
            return BodyComposition.SKINNY
        elif self.bmi < 22.5:
            if self.height > 190:
                return BodyComposition.SHPALA
            return BodyComposition.SLIM
        elif self.bmi < 25:
            return BodyComposition.AVERAGE
        elif self.bmi < 33:
            return random.choice([BodyComposition.PLUMP,
                                  BodyComposition.ATHLETIC if self.height > 175 else BodyComposition.STOCKY])
        elif self.bmi < 40:
            return random.choice([BodyComposition.FAT, BodyComposition.ATHLETIC])
        else:
            return random.choice([BodyComposition.BEAR, BodyComposition.PUDGE])


class BodySickness(StrEnum):
    """StrEnum representing body sicknesses."""
    DIABETES            = "Сахарный диабет"
    HYPERTENSION        = "Гипертония"
    ASTHMA              = "Астма"
    TUBERCULOSIS        = "Туберкулёз"
    HIV                 = "ВИЧ"
    AIDS                = "СПИД"
    HEPATITIS_A         = "Гепатит A"
    HEPATITIS_B         = "Гепатит B"
    HEPATITIS_C         = "Гепатит C"
    BRAIN_CANCER        = "Рак мозга"
    BLOOD_CANCER        = "Рак крови"
    SKIN_CANCER         = "Рак кожи"
    LUNG_CANCER         = "Рак легких"
    CANCER              = "Рак"
    ANEMIA              = "Анемия"
    ARTHRITIS           = "Артрит"
    OSTEOPOROSIS        = "Остеопороз"
    PSORIASIS           = "Псориаз"
    ECZEMA              = "Экзема"
    ALLERGY             = "Аллергия"
    GASTRITIS           = "Гастрит"
    ULCER               = "Язва желудка"
    PANCREATITIS        = "Панкреатит"
    CIRRHOSIS           = "Цирроз печени"
    CHOLELITHIASIS      = "Желчнокаменная болезнь"
    KIDNEY_STONES       = "Мочекаменная болезнь"
    CHRONIC_BRONCHITIS  = "Хронический бронхит"
    PNEUMONIA           = "Пневмония"
    SINUSITIS           = "Синусит"
    OTITIS              = "Отит"
    GLAUCOMA            = "Глаукома"
    CATARACT            = "Катаракта"
    MYOPIA              = "Близорукость"
    HYPEROPIA           = "Дальнозоркость"
    HYPOTHYROIDISM      = "Гипотиреоз"
    HYPERTHYROIDISM     = "Гипертиреоз"
    VARICOSE_VEINS      = "Варикоз"
    HEMORRHOIDS         = "Геморрой"
    PROSTATITIS         = "Простатит"
    ENDOMETRIOSIS       = "Эндометриоз"
    INFERTILITY         = "Бесплодие"
    DERMATITIS          = "Дерматит"
    SCOLIOSIS           = "Сколиоз"
    FLAT_FEET           = "Плоскостопие"
    GOUT                = "Подагра"
    MULTIPLE_SCLEROSIS  = "Рассеянный склероз"
    CROHNS_DISEASE      = "Болезнь Крона"
    ULCERATIVE_COLITIS  = "Язвенный колит"
    LUPUS               = "Волчанка"
    CYSTIC_FIBROSIS     = "Муковисцидоз"
    PSORIASIS           = "Псориаз"
    BRONCHIAL_ASTHMA    = "Бронхиальная астма"
    POLYARTHRITIS       = "Полиартрит"

    @staticmethod
    def get_random_sickness() -> "BodySickness":
        """Get a random body sickness."""
        return random.choice(list(BodySickness))


class MentalSickness(StrEnum):
    """StrEnum representing mental sicknesses."""
    DEPRESSION          = "Депрессия"
    ANXIETY             = "Тревожность"
    BIPOLAR_DISORDER    = "Биполярное расстройство"
    SCHIZOPHRENIA       = "Шизофрения"
    PTSD                = "Посттравматическое стрессовое расстройство"
    OCD                 = "Обсессивно-компульсивное расстройство"
    ADHD                = "Синдром дефицита внимания и гиперактивности"
    AUTISM              = "Аутизм"
    EATING_DISORDERS    = "Расстройства пищевого поведения"
    DEMENTIA            = "Деменция"
    ALZHEIMER           = "Болезнь Альцгеймера"
    PARKINSON           = "Болезнь Паркинсона"

    @staticmethod
    def get_random_sickness() -> "MentalSickness":
        """Get a random mental sickness."""
        return random.choice(list(MentalSickness))


class HealthCard(PlayingCard):
    """Model representing a health card."""
    body_sickness_probability: float = Field(
        default=0.33,
        ge=0.0,
        le=1.0
    )
    mental_sickness_probability: float = Field(
        default=0.25,
        ge=0.0,
        le=1.0
    )

    @computed_field
    @property
    def body_sickness(self) -> BodySickness | None:
        """Get the body sickness information."""
        if random.random() < self.body_sickness_probability:
            return BodySickness.get_random_sickness()
        return None

    @computed_field
    @property
    def mental_sickness(self) -> MentalSickness | None:
        """Get the mental sickness information."""
        if random.random() < self.mental_sickness_probability:
            return MentalSickness.get_random_sickness()
        return None


class Trait(StrEnum):
    @classmethod
    def get_k_random_traits(cls, k: int) -> list["Trait"]:
        """Get a list of k random traits.
        
        Each trait is selected from unique trait group."""
        enums = cls.__subclasses__()
        if k > len(enums):
            raise ValueError(f"k={k} is greater than the number of available traits={len(enums)}.")
        selected_enums = random.sample(enums, k)
        return [random.choice(list(enum)) for enum in selected_enums]


class Moral(Trait):
    """StrEnum representing moral traits."""
    MEANNESS      = "Подлость"
    HONESTY       = "Честность"
    CRUELTY       = "Жестокость"
    KINDNESS      = "Доброта"
    MAGNANIMITY   = "Великодушие"
    COMPASSION    = "Сострадание"


class Emotion(Trait):
    """StrEnum representing emotional traits."""
    CHEERFULNESS        = "Жизнерадостность"
    AGGRESSION          = "Склонность к агрессии"
    PASSIVE_AGGRESSION  = "Пассивная агрессия"
    SADNESS             = "Склонность к грусти"
    ANGER               = "Склонность к гневу"
    CURIOSITY           = "Любопытство"


class Social(Trait):
    """StrEnum representing social traits."""
    SOCIABILITY       = "Общительность"
    CONSCIENTIOUSNESS = "Добросовестность"
    INCREDULITY       = "Скептицизм"
    OPENNESS          = "Открытость"
    LAZINESS          = "Лень"
    DECEPTION         = "Жульничество"


class Intelligence(Trait):
    """StrEnum representing intelligence traits."""
    RATIONALITY = "Рациональность"
    WISDOM      = "Мудрость"
    STUPIDITY   = "Глупость"
    PRUDENCE    = "Рассудительность"
    CREATIVITY  = "Креативность"
    MADNESS     = "Безумие"


class Will(Trait):
    """StrEnum representing will traits."""
    DETERMINATION   = "Решительность"
    PERSEVERANCE    = "Настойчивость"
    SELF_CONTROL    = "Самоконтроль"
    IMPULSIVENESS   = "Импульсивность"
    PERFIDY         = "Вероломство"
    COWARDICE       = "Трусость"


class PersonalityCard(PlayingCard):
    """Model representing a personality card."""

    traits_number: int = Field(default=2, ge=1, le=len(Trait.__subclasses__))
    @computed_field
    @property
    def traits(self) -> list[Trait]:
        return Trait.get_k_random_traits(self.traits_number)


class Profession(StrEnum):
    """StrEnum representing professions."""
    DOCTOR          = "Врач"
    TEACHER         = "Учитель"
    ENGINEER        = "Инженер"
    LAWYER          = "Юрист"
    ACCOUNTANT      = "Бухгалтер"
    NURSE           = "Медсестра"
    POLICE_OFFICER  = "Полицейский"
    FIREFIGHTER     = "Пожарный"
    CHEF            = "Повар"
    DRIVER          = "Водитель"
    PILOT           = "Пилот"
    SCIENTIST       = "Учёный"
    PHARMACIST      = "Фармацевт"
    ARCHITECT       = "Архитектор"
    ARTIST          = "Художник"
    MUSICIAN        = "Музыкант"
    ACTOR           = "Актёр"
    JOURNALIST      = "Журналист"
    PHOTOGRAPHER    = "Фотограф"
    DENTIST         = "Стоматолог"
    VETERINARIAN    = "Ветеринар"
    PROGRAMMER      = "Программист"
    DESIGNER        = "Дизайнер"
    ELECTRICIAN     = "Электрик"
    PLUMBER         = "Сантехник"
    MECHANIC        = "Механик"
    FARMER          = "Фермер"
    BUILDER         = "Строитель"
    COOK            = "Кулинар"
    WAITER          = "Официант"
    BAKER           = "Пекарь"
    HAIRDRESSER     = "Парикмахер"
    FLORIST         = "Флорист"
    LIBRARIAN       = "Библиотекарь"
    POSTMAN         = "Почтальон"
    SECURITY_GUARD  = "Охранник"
    SALES_MANAGER   = "Менеджер по продажам"
    MARKETER        = "Маркетолог"
    ECONOMIST       = "Экономист"
    GEOLOGIST       = "Геолог"
    BIOLOGIST       = "Биолог"
    CHEMIST         = "Химик"
    PHYSICIST       = "Физик"
    PSYCHOLOGIST    = "Психолог"
    CLEANER         = "Уборщик"
    TRANSLATOR      = "Переводчик"
    TAILOR          = "Портной"
    JEWELER         = "Ювелир"
    RAPPER          = "Рэпер"
    BLOGGER         = "Блогер"
    SHIT_CLEANER    = "Говночист"


class Hobby(StrEnum):
    """StrEnum representing hobbies."""
    PAINTING        = "Живопись"
    COOKING         = "Кулинария"
    GARDENING       = "Садоводство"
    FISHING         = "Рыбалка"
    HUNTING         = "Охота"
    CAR_TUNING      = "Тюнинг автомобилей"
    HIKING          = "Походы"
    READING         = "Чтение"
    WRITING         = "Письмо"
    TRAVELING       = "Путешествия"
    PHOTOGRAPHY     = "Фотография"
    MUSIC           = "Музыка"
    POTTERY         = "Гончарное дело"


class Experience(StrEnum):
    """StrEnum representing experience levels."""
    NOVICE          = "Новичок"
    AMATEUR         = "Любитель"
    PROFESSIONAL    = "Профессионал"
    MASTER          = "Мастер"


class ProfessionCard(PlayingCard):
    """Model representing a profession card."""

    profession: str = Field(default_factory=lambda: random.choice(list(Profession)))
    experience: Experience = Field(default_factory=lambda: random.choice(list(Experience)))


class HobbyCard(PlayingCard):
    """Model representing a hobby card."""

    hobby: str = Field(default_factory=lambda: random.choice(list(Hobby)))
    experience: Experience = Field(default_factory=lambda: random.choice(list(Experience)))


class InventoryItem(StrEnum):
    """StrEnum representing inventory items."""
    @classmethod
    def get_k_random_items(cls, k: int) -> list["InventoryItem"]:
        """Get a list of k random items.

        Each item is selected from unique item group."""
        enums = cls.__subclasses__()
        if k > len(enums):
            raise ValueError(f"k={k} is greater than the number of available item groups={len(enums)}.")
        selected_enums = random.sample(enums, k)
        return [random.choice(list(enum)) for enum in selected_enums]

class SmallInventoryItem(StrEnum):
    """StrEnum representing small inventory items."""
    MEDKIT              =	"Аптечка"
    FOOD_RATION         =	"Армейский сухпаёк"
    WATER_BOTTLE        =	"Двухлитровая бутылка воды"
    FLASHLIGHT          =	"Фонарик"
    BATTERY             =	"Несколько батареек"
    ROPE                =	"Верёвка"
    MAP                 =	"Карта"
    COMPASS             =	"Компас"
    WHISTLE             =	"Свисток"
    KNIFE               =	"Нож"
    MATCHES             =	"Несколько коробков спичек"
    LIGHTER             =	"Зажигалка"
    MULTITOOL           =	"Мультитул"
    BANDAGE             =	"Бинт"
    PAINKILLERS         =	"Обезболивающее"
    ANTISEPTIC          =	"Антисептик"
    ENERGY_BAR          =	"Энергетический батончик"
    CANDLE              =	"Свеча"
    SUNSCREEN           =	"Солнцезащитный крем"
    INSECT_REPELLENT    =	"Средство от насекомых"
    HAND_WARMER         =	"Грелка для рук"
    GLOVES              =	"Перчатки"
    SOCKS               =	"Носки"
    HAT                 =	"Шапка"
    SUNGLASSES          =	"Солнечные очки"
    NOTEBOOK            =	"Блокнот"
    PEN                 =	"Ручка"
    PENCIL              =	"Карандаш"
    ERASER              =	"Ластик"
    SHARPENER           =	"Точилка"
    SEWING_KIT          =	"Швейный набор"
    NEEDLE              =	"Игла"
    THREAD              =	"Нитки"
    BUTTONS             =	"Пуговицы"
    SAFETY_PIN          =	"Булавка"
    MIRROR              =	"Зеркальце"
    TOOTHBRUSH          =	"Зубная щётка"
    TOOTHPASTE          =	"Зубная паста"
    SOAP                =	"Мыло"
    TOWEL               =	"Полотенце"
    COMB                =	"Расчёска"
    NAIL_CLIPPER        =	"Кусачки для ногтей"
    RAZOR               =	"Бритва"
    SHAVING_CREAM       =	"Крем для бритья"
    LIP_BALM            =	"Гигиеническая помада"
    DEODORANT           =	"Дезодорант"
    WET_WIPES           =	"Влажные салфетки"
    PLASTIC_BAG         =	"Пластиковый пакет"
    ZIPLOCK_BAG         =	"Пакет с застёжкой"
    RUBBER_BAND         =	"Резинка"
    PAPER_CLIP          =	"Скрепка"
    DUCT_TAPE           =	"Изолента"
    INSULATION_TAPE     =	"Изоляционная лента"
    SCISSORS            =	"Ножницы"
    SMALL_SCREWDRIVER   =	"Маленькая отвёртка"
    MINI_HAMMER         =	"Молоток"
    ALLEN_KEY           =	"Шестигранник"
    SMALL_WRENCH        =	"Маленький гаечный ключ"
    TIN_OPENER          =	"Открывалка для консервов"
    BOTTLE_OPENER       =	"Открывалка для бутылок"
    FISHING_HOOK        =	"Крючок для рыбалки"
    FISHING_LINE        =	"Леска"
    FLOAT               =	"Поплавок"
    SMALL_FIRST_AID     =	"Мини-аптечка"
    THERMOMETER         =	"Термометр"
    TOWEL               =	"Полотенце"
    MASK                =	"Маска"
    EARPLUGS            =	"Беруши"
    EYE_MASK            =	"Маска для сна"
    MINI_FLASHLIGHT     =	"Мини-фонарик"
    KEYCHAIN            =	"Брелок"
    USB_DRIVE           =	"Флешка"
    PHONE_CHARGER       =	"Зарядка для телефона"
    POWERBANK           =	"Повербанк"
    HEADPHONES          =	"Наушники"
    MINI_SPEAKER        =	"Мини-колонка"
    CARD_DECK           =	"Колода карт"
    DICE                =	"Кубики"
    COOKBOOK            =	"Кулинарная книга"
    POCKET_DICTIONARY   =	"Карманный словарь"
    CALCULATOR          =	"Калькулятор"
    POCKET_KNIFE        =	"Перочинный нож"
    PEPPER_SPRAY        =	"Перцовый баллончик"
    UMBRELLA            =	"Зонт"
    HANDKERCHIEF        =	"Носовой платок"
    FAN                 =	"Вентилятор"
    POCKET_WATCH        =	"Карманные часы"
    LIGHT_STICK         =	"Светящийся браслет"
    REFLECTOR           =	"Светоотражатель"
    COMPASS             =	"Компас"
    PADLOCK             =	"Навесной замок"
    SPARE_KEY           =	"Запасной ключ"
    ALARM               =	"Сигнализация"
    TWEEZERS            =	"Пинцет"
    MAGNIFIER           =	"Лупа"
    THERMOS             =	"Термос"
    FLASK               =	"Фляжка"
    BRUSH               =	"Щётка"
    SPONGE              =	"Губка"
    TAPE_MEASURE        =	"Рулетка"


class LargeInventoryItem(StrEnum):
    """StrEnum representing large inventory items."""
    TENT                =	"Палатка"
    SLEEPING_BAG        =	"Спальный мешок"
    FIRE_EXTINGUISHER   =	"Огнетушитель"
    GAS_CYLINDER        =	"Газовый баллон"
    GAS_STOVE           =	"Газовая плита"
    BAG_OF_CEMENT       =	"Мешок с цементом"
    WATER_FILTER        =	"Фильтр для воды"
    CHAINSAW            =	"Бензопила"
    CHAIR               =	"Стул"
    FOLDING_BED         =	"Раскладушка"
    COOLER_BOX          =	"Термобокс"
    BACKPACK            =	"Рюкзак"
    MONEY_SUITCASE      =	"Чемодан с деньгами"
    TOOLBOX             =	"Ящик с инструментами"
    GENERATOR           =	"Генератор"
    SOLAR_PANEL         =	"Солнечная панель"
    LADDER              =	"Лестница"
    AXE                 =	"Топор"
    SHOVEL              =	"Лопата"
    PICKAXE             =	"Кирка"
    SLEDGEHAMMER        =	"Кувалда"
    SNIPER_RIFLE        =	"Снайперская винтовка"
    SHOTGUN             =	"Дробовик"
    FLAMETHROWER        =	"Огнемёт"
    WHEELBARROW         =	"Тачка"
    BICYCLE             =	"Велосипед"
    KAYAK               =	"Каяк"
    INFLATABLE_BOAT     =	"Надувная лодка"
    LIFE_JACKET         =	"Спасательный жилет"
    WATER_TANK          =	"Ёмкость для воды"
    FUEL_CANISTER       =	"Канистра с топливом"
    ELECTRO_GRILL       =	"Электрический гриль"
    UMBRELLA            =	"Зонт"
    MOSQUITO_NET        =	"Москитная сетка"
    CAMPING_MATTRESS    =	"Кемпинговый матрас"
    SLEEPING_PAD        =	"Коврик для сна"
    FOLDING_TABLE       =	"Складной стол"
    FOLDING_CHAIR       =	"Складной стул"
    LOCKED_SAFE         =	"Запертый сейф"
    TOOL_SET            =	"Набор инструментов"
    FIRST_AID           =	"Аптечка"
    FRIDGE              =	"Холодильник"
    WASHER              =	"Стиральная машина"
    DRYER               =	"Сушилка"
    BATTERY             =	"Батарея"
    POWERBANK           =	"Повербанк"
    SPEAKER             =	"Колонка"
    TARP                =	"Тент"
    BLANKET             =	"Одеяло"
    PILLOW              =	"Подушка"
    AMMO_CRATE          =	"Ящик с патронами"
    CANISTER            =	"Канистра"
    BARREL              =	"Бочка"
    BUCKET              =	"Ведро"
    NET                 =	"Сеть"
    ANCHOR              =	"Якорь"
    RUG                 =	"Ковёр"
    MIRROR              =	"Зеркало"
    CLOCK               =	"Часы"
    LAMP                =	"Лампа"
    HEATER              =	"Обогреватель"
    COOKER              =	"Плита"
    MICROWAVE           =	"Микроволновка"
    OVEN                =	"Духовка"
    WARDROBE            =	"Шкаф"
    TABLE               =	"Стол"
    SOFA                =	"Диван"
    ARMCHAIR            =	"Кресло"
    BED                 =	"Кровать"
    MATTRESS            =	"Матрас"
    TV                  =	"Телевизор"
    PROJECTOR           =	"Проектор"


class InventoryCard(PlayingCard):
    """Class representing an inventory card."""
    item: InventoryItem

    items_number: int = Field(default=2, ge=1, le=len(InventoryItem.__subclasses__))
    @computed_field
    @property
    def items(self) -> list[InventoryItem]:
        return InventoryItem.get_k_random_items(self.items_number)


class Worldview(StrEnum):
    """StrEnum representing different worldviews."""
    OPTIMIST            =	"Оптимист"
    PESSIMIST           =	"Пессимист"
    SKINHEAD            =	"Скинхед"


class WorldviewCard(PlayingCard):
    """Class representing a worldview card."""
    worldview: Worldview


class AdditionalInfoCard(PlayingCard):
    """Class representing an additional info card."""
    info: str


class TimeInBunker(BaseModel):
    """Class representing time spent in the bunker."""

    years: int
    months: int
    days: int

    def __init__(self, years: int, months: int, days: int):
        while days >= 30:
            days -= 30
            months += 1
        while months >= 12:
            months -= 12
            years += 1
        super().__init__(years=years, months=months, days=days)


class CataclysmCard(PlayingCard):
    """Class representing a cataclysm card."""
    cataclysm_description: str
    people_left: int
    time_in_bunker: TimeInBunker