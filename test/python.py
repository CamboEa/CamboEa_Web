import requests

url = "https://www.forexfactory.com/ff_calendar_thisweek.xml"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
}

response = requests.get(url, headers=headers)

print(response.text)