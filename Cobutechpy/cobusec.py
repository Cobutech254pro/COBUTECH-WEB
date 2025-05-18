from bcrypt import hashpw, checkpw, gensalt
from itsdangerous import URLSafeTimedSerializer
from flask import current_app

def generate_password_hash(password):
    salt = gensalt()
    hashed_password = hashpw(password.encode('utf-8'), salt)
    return hashed_password.decode('utf-8')

def check_password_hash(password, password_hash):
    return checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))

def generate_verification_token(user_id):
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    return serializer.dumps(user_id)

def decode_verification_token(token):
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    try:
        return serializer.loads(token, max_age=3600)  # Token valid for 1 hour (adjust as needed)
    except Exception:
        return None
