"""
KelanaAI - Session 01: Trip Summary Generator
Author: KelanaAI Developer
"""

def print_trip_summary(
    destination: str,
    country: str,
    days: int,
    budget: float,
    currency: str,
    travel_month: str,
    travel_style: str,
    hotel_cost: float,
    food_cost: float,
    transportation_cost: float,
    misc_cost: float
) -> None:
    """
    Displays a formatted summary of the trip details, including travel style, 
    a cost breakdown, and a budget exceeded alert.
    """
    # Calculate total estimated cost
    total_estimated_cost = hotel_cost + food_cost + transportation_cost + misc_cost
    
    print("\n==========================================")
    print("                KelanaAI                  ")
    print("==========================================")
    print(f"Destination     : {destination}")
    print(f"Country         : {country}")
    print(f"Days            : {days}")
    print(f"Travel Month    : {travel_month}")
    print(f"Travel Style    : {travel_style}")
    print("------------------------------------------")
    print(f"Budget          : {budget:,.2f} {currency}")
    print(f"Hotel Cost      : {hotel_cost:,.2f} {currency}")
    print(f"Food Cost       : {food_cost:,.2f} {currency}")
    print(f"Transport Cost  : {transportation_cost:,.2f} {currency}")
    print(f"Misc Cost       : {misc_cost:,.2f} {currency}")
    print("------------------------------------------")
    print(f"Total Estimated : {total_estimated_cost:,.2f} {currency}")
    
    # Challenge: Budget exceeded alert
    if total_estimated_cost > budget:
        print("\n⚠️ WARNING: Budget exceeded.")
        
    print("==========================================\n")


def main():
    print("--- Welcome to KelanaAI Trip Planner ---")
    print("Please enter your travel details below:\n")

    # Basic Trip Inputs
    destination = input("Destination (e.g. Kyoto): ")
    country = input("Country (e.g. Japan): ")
    days = int(input("Days (e.g. 5): "))
    currency = input("Currency (e.g. USD, IDR): ").upper()
    travel_month = input("Travel Month (e.g. December): ")
    travel_style = input("Travel Style (e.g. Family, Backpacker): ")
    
    # Budget and Cost Breakdown Inputs
    budget = float(input(f"Total Budget ({currency}): "))
    hotel_cost = float(input(f"Hotel Cost ({currency}): "))
    food_cost = float(input(f"Food Cost ({currency}): "))
    transportation_cost = float(input(f"Transportation Cost ({currency}): "))
    misc_cost = float(input(f"Miscellaneous Cost ({currency}): "))

    # Call the print summary function
    print_trip_summary(
        destination=destination,
        country=country,
        days=days,
        budget=budget,
        currency=currency,
        travel_month=travel_month,
        travel_style=travel_style,
        hotel_cost=hotel_cost,
        food_cost=food_cost,
        transportation_cost=transportation_cost,
        misc_cost=misc_cost
    )


if __name__ == "__main__":
    main()