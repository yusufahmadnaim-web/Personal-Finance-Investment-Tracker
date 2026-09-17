from flask import Blueprint, request, jsonify
from extensions import db, bcrypt
from models import User
from flask_jwt_extended import create_access_token 
from flask_jwt_extended import jwt_required, get_jwt_identity

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()

    # Basic validation
    if not data.get("name") or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Name, email, and password are required."}), 400

    # Check if email is already taken 
    existing_user = User.query.filter_by(email=data["email"]).first()
    if existing_user:
        return jsonify({"error": "Email is already registered."}), 409

    #Hash the password - this is the one-way s
    hashed_pw = bcrypt.generate_password_hash(data["password"]).decode("utf-8")

    new_user = User(
        name=data["name"],
        email=data["email"],
        password_hash=hashed_pw
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully", "user_id": new_user.id}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data.get("email") or not data.get("password"):
        return jsonify({"error": "email and password are required"}), 400

    user = User.query.filter_by(email=data["email"]).first()

    # Check user exists AND password matches the stored hash
    if not user or not bcrypt.check_password_hash(user.password_hash, data["password"]):
        return jsonify({"error": "Invalid email or password"}), 401

    # Create a token containing the user's id — this is what proves identity later
    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        "access_token": access_token,
        "user_id": user.id,
        "name": user.name
    }), 200

@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email
    }), 200

