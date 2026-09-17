from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions import db
from models import Asset

asset_bp = Blueprint("assets", __name__)

@asset_bp.route("/assets", methods=["POST"])
@jwt_required()
def create_asset():
    data = request.get_json()

    if not data.get("name") or not data.get("ticker_symbol") or not data.get("asset_type"):
        return jsonify({"error": "name, ticker_symbol, and asset_type are required"}), 400

    existing = Asset.query.filter_by(ticker_symbol=data["ticker_symbol"]).first()
    if existing:
        return jsonify({"error": "Asset with this ticker already exists", "asset_id": existing.id}), 409

    new_asset = Asset(
        name=data["name"],
        ticker_symbol=data["ticker_symbol"],
        asset_type=data["asset_type"]
    )
    db.session.add(new_asset)
    db.session.commit()

    return jsonify({
        "id": new_asset.id,
        "name": new_asset.name,
        "ticker_symbol": new_asset.ticker_symbol,
        "asset_type": new_asset.asset_type
    }), 201


@asset_bp.route("/assets", methods=["GET"])
@jwt_required()
def list_assets():
    assets = Asset.query.all()
    return jsonify([
        {
            "id": a.id,
            "name": a.name,
            "ticker_symbol": a.ticker_symbol,
            "asset_type": a.asset_type
        } for a in assets
    ]), 200