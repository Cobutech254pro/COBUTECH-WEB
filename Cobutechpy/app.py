from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_mail import Mail
from flask_cors import CORS
from config import Config
from routes.auth import auth_bp
import os

db = SQLAlchemy()
ma = Marshmallow()
mail = Mail()

def create_app(config_class=Config):
    app = Flask(__name__, static_folder=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))) # Serve static files from the root
    app.config.from_object(config_class)

    db.init_app(app)
    ma.init_app(app)
    mail.init_app(app)

    CORS(app)  # Enable CORS for all routes
    app.register_blueprint(auth_bp, url_prefix='/api/auth') # Keep the /api prefix for backend routes

    @app.route('/')
    def serve_index():
        return send_from_directory(app.static_folder, 'index.html')

    @app.route('/Cobutechcss/<path:path>')
    def serve_css(path):
        return send_from_directory(app.static_folder, os.path.join('Cobutechcss', path))

    @app.route('/Cobutechjs/<path:path>')
    def serve_js(path):
         return send_from_directory(app.static_folder, os.path.join('Cobutechjs', path))

    @app.route('/Cobutechimages/<path:path>')
    def serve_images(path):
        return send_from_directory(app.static_folder, os.path.join('Cobutechimages', path))

    return app

if __name__ == '__main__':
        app = create_app()
        app.run(debug=True)

