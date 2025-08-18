#!/usr/bin/env python3
"""
Weather bulletin generator for Zagarolo
Generates a creative Italian weather bulletin based on data.json
"""

import json
import random
from datetime import datetime
import sys
import os

def load_weather_data():
    """Load weather data from data.json"""
    try:
        with open("data.json", encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print("Error: data.json not found")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error parsing data.json: {e}")
        sys.exit(1)

def get_tomorrow_data(data):
    """Extract tomorrow's weather data"""
    try:
        daily = data["daily"]
        tomorrow_idx = 1  # index 1 = tomorrow
        
        return {
            'date': daily["time"][tomorrow_idx],
            'tmax': daily["temperature_2m_max"][tomorrow_idx],
            'tmin': daily["temperature_2m_min"][tomorrow_idx],
            'rain': daily["precipitation_sum"][tomorrow_idx],
            'prob': daily["precipitation_probability_max"][tomorrow_idx],
            'weather_code': daily["weather_code"][tomorrow_idx]
        }
    except (KeyError, IndexError) as e:
        print(f"Error extracting weather data: {e}")
        sys.exit(1)

def format_date_italian(date_str):
    """Convert YYYY-MM-DD to Italian format"""
    try:
        date_obj = datetime.strptime(date_str, "%Y-%m-%d")
        days = ['lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica']
        months = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
                 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre']
        
        day_name = days[date_obj.weekday()]
        day_num = date_obj.day
        month_name = months[date_obj.month - 1]
        
        return f"{day_name} {day_num} {month_name}"
    except ValueError:
        return date_str

def get_weather_description(weather_code, rain, prob):
    """Get weather description based on weather code and rain data"""
    if weather_code in [0, 1]:  # Clear/sunny
        if prob < 20:
            return random.choice([
                "cielo sereno e soleggiato",
                "una giornata di sole splendente",
                "cielo limpido senza una nuvola"
            ])
        else:
            return "qualche nuvola qua e là ma prevalentemente soleggiato"
    
    elif weather_code in [2, 3]:  # Partly cloudy
        if rain > 1:
            return random.choice([
                "nuvole con qualche pioggerella",
                "cielo coperto con possibili rovesci",
                "tempo variabile con pioggia intermittente"
            ])
        else:
            return random.choice([
                "nuvole sparse nel cielo",
                "tempo nuvoloso ma asciutto",
                "cielo coperto ma senza pioggia"
            ])
    
    elif weather_code in [61, 63, 65, 80, 81, 82]:  # Rain
        if rain > 5:
            return "pioggia abbondante"
        elif rain > 1:
            return "pioggia moderata"
        else:
            return "qualche goccia di pioggia"
    
    elif weather_code in [95, 96, 99]:  # Thunderstorm
        return "temporali in arrivo"
    
    else:
        return "tempo variabile"

def generate_bulletin(weather_data):
    """Generate a creative weather bulletin in Italian"""
    
    # Format the date
    formatted_date = format_date_italian(weather_data['date'])
    
    # Get weather description
    weather_desc = get_weather_description(
        weather_data['weather_code'], 
        weather_data['rain'], 
        weather_data['prob']
    )
    
    # Opening phrases
    openings = [
        f"Buongiorno amici! Ecco le previsioni per {formatted_date}:",
        f"Ciao a tutti! Che tempo ci aspetta {formatted_date}?",
        f"Salve radioascoltatori! Vi racconto il tempo di {formatted_date}:",
        f"Buongiorno Zagarolo! Come sarà {formatted_date}?"
    ]
    
    # Temperature descriptions
    temp_descriptions = [
        f"Le temperature andranno da un freschetto {weather_data['tmin']}°C fino ai {weather_data['tmax']}°C",
        f"Minima di {weather_data['tmin']}°C e massima di {weather_data['tmax']}°C",
        f"Termometro che oscillerà tra {weather_data['tmin']}°C e {weather_data['tmax']}°C"
    ]
    
    # Rain descriptions based on probability
    if weather_data['prob'] > 70:
        rain_phrases = [
            f"Molto probabilmente pioverà (probabilità {weather_data['prob']}%)",
            f"Tenete l'ombrello a portata di mano, {weather_data['prob']}% di pioggia!",
            f"Quasi certo che pioverà, {weather_data['prob']}% di probabilità"
        ]
    elif weather_data['prob'] > 40:
        rain_phrases = [
            f"Forse qualche goccia cadrà ({weather_data['prob']}% di probabilità)",
            f"Cielo incerto, {weather_data['prob']}% di possibili piogge",
            f"Non si sa mai, {weather_data['prob']}% di pioggia"
        ]
    else:
        rain_phrases = [
            f"Poche probabilità di pioggia (solo {weather_data['prob']}%)",
            f"Dovrebbe rimanere asciutto, solo {weather_data['prob']}% di pioggia",
            f"Ombrello a casa, {weather_data['prob']}% di pioggia"
        ]
    
    # Conclusions based on weather conditions
    if weather_data['rain'] > 2:
        conclusions = [
            "Insomma, meglio non programmare picnic all'aperto!",
            "Una giornata perfetta per stare al calduccio in casa.",
            "Ideale per leggere un libro con una bella tazza di tè."
        ]
    elif weather_data['tmax'] > 30:
        conclusions = [
            "Una bella giornata per stare all'aria aperta!",
            "Perfetto per una passeggiata nel centro di Zagarolo.",
            "Tempo ideale per un gelato in piazza!"
        ]
    else:
        conclusions = [
            "Una giornata piacevole vi aspetta!",
            "Tempo gradevole per le vostre attività.",
            "Tutto sommato, una bella giornata!"
        ]
    
    # Build the bulletin
    opening = random.choice(openings)
    temp_desc = random.choice(temp_descriptions)
    rain_desc = random.choice(rain_phrases)
    conclusion = random.choice(conclusions)
    
    bulletin = f"{opening}\n\n"
    bulletin += f"Ci aspetta {weather_desc}. "
    bulletin += f"{temp_desc}. "
    bulletin += f"{rain_desc}"
    
    if weather_data['rain'] > 0:
        bulletin += f" con circa {weather_data['rain']} mm di pioggia previsti"
    
    bulletin += f".\n\n{conclusion}\n\n"
    bulletin += "Restate sintonizzati per gli aggiornamenti! 📻🌤️"
    
    return bulletin

def main():
    """Main function to generate and save the bulletin"""
    print("Generating weather bulletin for Zagarolo...")
    
    # Load weather data
    data = load_weather_data()
    tomorrow_data = get_tomorrow_data(data)
    
    print(f"Weather data loaded for {tomorrow_data['date']}")
    print(f"Temperature: {tomorrow_data['tmin']}°C - {tomorrow_data['tmax']}°C")
    print(f"Rain: {tomorrow_data['rain']} mm (probability: {tomorrow_data['prob']}%)")
    
    # Generate bulletin
    bulletin = generate_bulletin(tomorrow_data)
    
    # Save to file
    try:
        with open("bollettino.txt", "w", encoding='utf-8') as f:
            f.write(bulletin)
        print("✅ Bollettino generato con successo in bollettino.txt")
    except IOError as e:
        print(f"❌ Error writing bulletin: {e}")
        sys.exit(1)
    
    print("\n" + "=" * 50)
    print(bulletin)
    print("=" * 50)

if __name__ == "__main__":
    main()