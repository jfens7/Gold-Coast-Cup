import os
import stripe
import logging
import webbrowser
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

load_dotenv()

# Match your ThunderThighsV2 structure: 
# Server in root, HTML/JS in frontend/
app = Flask(__name__, static_folder='frontend')
CORS(app)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - GCC_SYS - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

# Firebase Database Initialization
# Using your specific filename from the GitHub sidebar
try:
    cred = credentials.Certificate("gold-coast-cup-firebase-adminsdk-fbsvc-9492d1d89b.json")
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    logger.info("Firebase Firestore initialized successfully.")
except Exception as e:
    logger.critical(f"Database initialization failed: {e}")

# --- FRONTEND ROUTING (MATCHING YOUR GITHUB STRUCTURE) ---

@app.route('/')
def index():
    """Serves index.html from the frontend folder."""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serves lux_engine.js and assets from the frontend folder."""
    return send_from_directory(app.static_folder, path)

# --- BACKEND API ---

@app.route('/api/register', methods=['POST'])
def register_player():
    try:
        data = request.json
        player_data = {
            "first_name": data.get('firstName'),
            "last_name": data.get('lastName'),
            "national_id": data.get('natId'),
            "rc_id": data.get('rcId'),
            "rc_points": int(data.get('rcPoints', 0)),
            "club": data.get('club'),
            "email": data.get('email'),
            "mobile": data.get('mobile'),
            "payment_status": "pending",
            "timestamp": firestore.SERVER_TIMESTAMP
        }

        if firebase_admin._apps:
            player_doc_ref = db.collection('gcc_2026_roster').document()
            player_doc_ref.set(player_data)
        
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'aud',
                    'product_data': {'name': '2026 Gold Coast Cup Entry'},
                    'unit_amount': 6000,
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url='http://localhost:8080/',
            cancel_url='http://localhost:8080/',
            customer_email=data.get('email')
        )

        return jsonify({"status": "checkout", "url": checkout_session.url})
    except Exception as e:
        logger.error(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = 8080
    url = f"http://127.0.0.1:{port}"
    
    print("\n" + "="*50)
    print("GOLD COAST CUP TITANIUM ENGINE: ONLINE")
    print(f"LAUNCHING BROWSER AT: {url}")
    print("="*50 + "\n")
    
    # Auto-launch browser like your other tools
    webbrowser.open(url)
    app.run(host='0.0.0.0', port=port, debug=False)