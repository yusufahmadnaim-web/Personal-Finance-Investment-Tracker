from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config
from extensions import db, migrate, bcrypt

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
migrate.init_app(app, db)
jwt = JWTManager(app)
bcrypt.init_app(app)
CORS(app)

from asset_routes import asset_bp
from models import User, Asset, Transaction
from auth_routes import auth_bp
from transaction_routes import transaction_bp
app.register_blueprint(transaction_bp, url_prefix="/api")
app.register_blueprint(auth_bp, url_prefix="/api")
app.register_blueprint(asset_bp, url_prefix="/api")

if __name__ == "__main__":
    app.run(debug=True)