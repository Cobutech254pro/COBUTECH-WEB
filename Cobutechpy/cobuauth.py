from app import db, mail
from models import User
from utils.security import generate_password_hash, check_password_hash, generate_verification_token
from flask_mail import Message
from flask import current_app

class AuthService:
    @staticmethod
    def create_user(username, email, password):
        hashed_password = generate_password_hash(password)
        new_user = User(username=username, email=email, password_hash=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        return new_user

    @staticmethod
    def generate_verification_token(user_id):
        return generate_verification_token(user_id)

    @staticmethod
    def save_verification_token(user, token):
        user.verification_token = token
        db.session.commit()

    @staticmethod
    def send_verification_email(email, token):
        msg = Message('Verify your email address',
                      sender=current_app.config['MAIL_DEFAULT_SENDER'],
                      recipients=[email])
        msg.body = f'''Please click the following link to verify your email address:
{current_app.config.get('FRONTEND_URL')}/verify?token={token}
If you did not request this, please ignore this email.
'''
        mail.send(msg)

    @staticmethod
    def verify_token(token):
        try:
            user_id = AuthService.decode_verification_token(token)
            user = User.query.get(user_id)
            if user and not user.is_verified:
                user.is_verified = True
                user.verification_token = None
                db.session.commit()
                return True
            return False
        except Exception:
            return False

    @staticmethod
    def decode_verification_token(token):
        # This will be implemented using a secure token generation library
        # like itsdangerous in the utils/security.py file.
        # For now, we'll leave it as a placeholder.
        pass
