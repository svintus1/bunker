from typing import Protocol, Type, TypeVar

import src.core.domain.models.property as p

class PropertyRepository(Protocol):
    """Interface for property repository operations."""

    T = TypeVar("T", bound=p.Property)
    async def get_all_properties_by_category(self, property_type: Type[T]) -> list[T]:
        """Retrieve all properties of a specific type.
        
        Returns empty list if no properties are found."""
        raise NotImplementedError

    async def get_by_id_and_category(self, id: str, property_type: Type[T]) -> T | None:
        """Retrieve a property by its ID and type."""
        raise NotImplementedError