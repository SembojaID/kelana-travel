"""
KelanaAI - Session 02: Recommendation Engine
"""
from services.trip_service import (
    get_trip_category, 
    get_travel_season, 
    calculate_daily_budget,
    get_recommended_transportation,
    get_recommended_places
)

def main():
    print("--- Welcome to KelanaAI Trip Planner ---")
    
    # Challenge: Multiple Destinations using a list and while loop
    destinations = []
    while True:
        dest = input("Enter a destination (or type 'done' to finish): ").strip()
        if dest.lower() == 'done':
            if not destinations:
                print("Please enter at least one destination.")
                continue
            break
        destinations.append(dest)

    days = int(input("Days (e.g. 5): "))
    budget = float(input("Total Budget (USD): "))
    travel_month = input("Travel Month (e.g. December): ")

    # Process Data through Business Logic Layer
    category = get_trip_category(budget)
    season = get_travel_season(travel_month)
    daily_budget = calculate_daily_budget(budget, days)
    transportation = get_recommended_transportation(category)
    places = get_recommended_places()

    # Display Output
    print("\n==================================")
    print("             KelanaAI             ")
    print("==================================")
    print("Your Destinations:")
    for i, dest in enumerate(destinations, 1):
        print(f" {i}. {dest}")
    print(f"Days            : {days}")
    print(f"Budget          : {budget:,.0f} USD")
    print(f"Category        : {category}")
    print(f"Daily Budget    : {daily_budget:,.0f} USD/Day")
    print(f"Travel Month    : {travel_month.capitalize()}")
    print(f"Season          : {season}")
    print(f"Transportation  : {transportation}")
    print("\nRecommended Places:")
    for place in places:
        print(f"- {place}")
    print("==================================\n")

if __name__ == "__main__":
    main()