from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Transaction, Asset
from datetime import datetime

transaction_bp = Blueprint("transactions", __name__)

@transaction_bp.route("/transactions", methods=["POST"])
@jwt_required()
def create_transaction():
    user_id = get_jwt_identity()
    data = request.get_json()

    # Validate required fields
    required_fields = ["asset_id", "type", "quantity", "price_per_unit"]
    for field in required_fields:
        if data.get(field) is None:
            return jsonify({"error": f"{field} is required"}), 400

    # Validate type is one of the two allowed values
    if data["type"] not in ("buy", "sell"):
        return jsonify({"error": "type must be 'buy' or 'sell'"}), 400

    # Confirm the asset actually exists
    asset = Asset.query.get(data["asset_id"])
    if not asset:
        return jsonify({"error": "Asset not found"}), 404

    # Parse date if provided, otherwise default to now
    tx_date = datetime.utcnow()
    if data.get("date"):
        tx_date = datetime.fromisoformat(data["date"])

    new_tx = Transaction(
        user_id=user_id,
        asset_id=data["asset_id"],
        type=data["type"],
        quantity=data["quantity"],
        price_per_unit=data["price_per_unit"],
        date=tx_date
    )
    db.session.add(new_tx)
    db.session.commit()

    return jsonify({
        "id": new_tx.id,
        "asset_id": new_tx.asset_id,
        "type": new_tx.type,
        "quantity": new_tx.quantity,
        "price_per_unit": new_tx.price_per_unit,
        "date": new_tx.date.isoformat()
    }), 201

@transaction_bp.route("/transactions", methods=["GET"])
@jwt_required()
def list_transactions():
    user_id = get_jwt_identity()
    transactions = Transaction.query.filter_by(user_id=user_id).order_by(Transaction.date.desc()).all()

    return jsonify([
        {
            "id": t.id,
            "asset_id": t.asset_id,
            "asset_name": t.asset.name,
            "ticker_symbol": t.asset.ticker_symbol,
            "type": t.type,
            "quantity": t.quantity,
            "price_per_unit": t.price_per_unit,
            "date": t.date.isoformat()
        } for t in transactions
    ]), 200

@transaction_bp.route("/portfolio", methods=["GET"])
@jwt_required()
def get_portfolio():
    user_id = get_jwt_identity()
    transactions = Transaction.query.filter_by(user_id=user_id).all()

    # Group transactions by asset_id
    holdings = {}

    for t in transactions:
        if t.asset_id not in holdings:
            holdings[t.asset_id] = {
                "asset_id": t.asset_id,
                "asset_name": t.asset.name,
                "ticker_symbol": t.asset.ticker_symbol,
                "total_bought_qty": 0,
                "total_bought_cost": 0,
                "total_sold_qty": 0
            }

        h = holdings[t.asset_id]

        if t.type == "buy":
            h["total_bought_qty"] += t.quantity
            h["total_bought_cost"] += t.quantity * t.price_per_unit
        elif t.type == "sell":
            h["total_sold_qty"] += t.quantity

    # Now calculate derived values for each asset
    portfolio = []
    for h in holdings.values():
        avg_cost = h["total_bought_cost"] / h["total_bought_qty"] if h["total_bought_qty"] > 0 else 0
        current_qty = h["total_bought_qty"] - h["total_sold_qty"]
        total_invested = current_qty * avg_cost

        portfolio.append({
            "asset_id": h["asset_id"],
            "asset_name": h["asset_name"],
            "ticker_symbol": h["ticker_symbol"],
            "quantity_held": round(current_qty, 4),
            "average_cost_per_unit": round(avg_cost, 2),
            "total_invested": round(total_invested, 2)
        })

    return jsonify(portfolio), 200