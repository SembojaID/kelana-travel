"""
KelanaAI - Business Logic Layer
"""

def get_trip_category(budget: float) -> str:
    """Determines category based on budget."""
    if budget < 1000:
        return "Backpacker"
    elif budget <= 3000:
        return "Standard"
    else:
        return "Luxury"

def get_travel_season(month: str) -> str:
    """Determines travel season based on the month."""
    month_lower = month.strip().lower()
    if month_lower == "december":
        return "Peak Season"
    elif month_lower == "june":
        return "Holiday Season"
    else:
        return "Regular Season"

def calculate_daily_budget(budget: float, days: int) -> float:
    """Calculates the budget per day."""
    return budget / days

def get_recommended_transportation(category: str) -> str:
    """Challenge: Maps trip category to transportation type."""
    if category == "Backpacker":
        return "Bus"
    elif category == "Standard":
        return "Train"
    else:
        return "Flight"

def get_recommended_places() -> list:
    """Returns a static list of recommended places."""
    return ["Tokyo Tower", "Shibuya", "Mount Fuji"]