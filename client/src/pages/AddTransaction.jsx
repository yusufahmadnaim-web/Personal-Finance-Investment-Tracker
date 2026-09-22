 import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import "./AddTransaction.css";

function AddTransaction() {
  const [assets, setAssets] = useState([]);
  const [assetId, setAssetId] = useState("");
  const [type, setType] = useState("buy");
  const [quantity, setQuantity] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // New asset form state
  const [showNewAsset, setShowNewAsset] = useState(false);
  const [newAssetName, setNewAssetName] = useState("");
  const [newAssetTicker, setNewAssetTicker] = useState("");
  const [newAssetType, setNewAssetType] = useState("stock");

  const navigate = useNavigate();

  useEffect(() => {
    loadAssets();
  }, []);

  async function loadAssets() {
    try {
      const res = await axiosClient.get("/assets");
      setAssets(res.data);
      if (res.data.length > 0) setAssetId(res.data[0].id);
    } catch (err) {
      setError("Failed to load assets.");
    }
  }

  async function handleCreateAsset(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await axiosClient.post("/assets", {
        name: newAssetName,
        ticker_symbol: newAssetTicker.toUpperCase(),
        asset_type: newAssetType,
      });
      // Refresh the asset list, then select the newly created one
      await loadAssets();
      setAssetId(res.data.id);
      setShowNewAsset(false);
      setNewAssetName("");
      setNewAssetTicker("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create asset.");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await axiosClient.post("/transactions", {
        asset_id: Number(assetId),
        type,
        quantity: Number(quantity),
        price_per_unit: Number(pricePerUnit),
      });
      setSuccess("Transaction recorded successfully!");
      setQuantity("");
      setPricePerUnit("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to record transaction.");
    }
  }

  return (
    <div className="add-transaction-page">
      <div className="add-transaction-card">
        <Link to="/dashboard" className="back-link">&larr; Back to Dashboard</Link>
        <h1>Add Transaction</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Asset</label>
            {assets.length === 0 ? (
              <p className="empty-state">No assets yet — create one below.</p>
            ) : (
              <select value={assetId} onChange={(e) => setAssetId(e.target.value)}>
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.ticker_symbol})
                  </option>
                ))}
              </select>
            )}
            <button
              type="button"
              className="link-btn"
              onClick={() => setShowNewAsset(!showNewAsset)}
            >
              {showNewAsset ? "Cancel" : "+ Add a new asset"}
            </button>
          </div>

          {showNewAsset && (
            <div className="new-asset-form">
              <div className="form-group">
                <label>Asset Name</label>
                <input
                  type="text"
                  placeholder="e.g. Bitcoin"
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Ticker Symbol</label>
                <input
                  type="text"
                  placeholder="e.g. BTC"
                  value={newAssetTicker}
                  onChange={(e) => setNewAssetTicker(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select value={newAssetType} onChange={(e) => setNewAssetType(e.target.value)}>
                  <option value="stock">Stock</option>
                  <option value="crypto">Crypto</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <button className="secondary-btn" onClick={handleCreateAsset}>
                Save Asset
              </button>
            </div>
          )}

          <div className="form-group">
            <label>Transaction Type</label>
            <div className="toggle-group">
              <button
                type="button"
                className={`toggle-btn ${type === "buy" ? "active buy" : ""}`}
                onClick={() => setType("buy")}
              >
                Buy
              </button>
              <button
                type="button"
                className={`toggle-btn ${type === "sell" ? "active sell" : ""}`}
                onClick={() => setType("sell")}
              >
                Sell
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Price per Unit ($)</label>
            <input
              type="number"
              step="any"
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(e.target.value)}
              required
            />
          </div>

          {error && <p className="error-text">{error}</p>}
          {success && <p className="success-text">{success}</p>}

          <button type="submit" className="submit-btn" disabled={assets.length === 0}>
            Record Transaction
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddTransaction;