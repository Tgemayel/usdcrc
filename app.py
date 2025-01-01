import os
import requests
from flask import Flask, render_template, jsonify
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "default_secret_key")

# Exchange rate API endpoint
EXCHANGE_API_URL = "https://api.exchangerate-api.com/v4/latest/USD"

@app.route('/')
def index():
    try:
        # Fetch current exchange rate
        response = requests.get(EXCHANGE_API_URL)
        response.raise_for_status()
        data = response.json()

        # Get CRC rate (Costa Rican Colón)
        rate = data['rates'].get('CRC', None)

        if rate is None:
            logging.error("CRC rate not found in API response")
            return render_template('index.html', error="Unable to fetch exchange rate")

        return render_template('index.html', rate=rate)

    except requests.RequestException as e:
        logging.error(f"API request failed: {str(e)}")
        return render_template('index.html', error="Unable to connect to exchange rate service")
    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        return render_template('index.html', error="An unexpected error occurred")

@app.route('/api/rate')
def get_rate():
    try:
        response = requests.get(EXCHANGE_API_URL)
        response.raise_for_status()
        data = response.json()
        rate = data['rates'].get('CRC')

        if rate is None:
            return jsonify({'error': 'Rate not available'}), 404

        return jsonify({'rate': rate})

    except Exception as e:
        logging.error(f"Rate API error: {str(e)}")
        return jsonify({'error': 'Failed to fetch rate'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)