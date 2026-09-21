 import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

function Dashboard() {
  const [portfolio, setPortfolio] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, logout } = useAuth();

  useEffect(() => {
    async function fetchData() {
      try {
        const [portfolioRes, transactionsRes] = await Promise.all([
          axiosClient.get("/portfolio"),
          axiosClient.get("/transactions"),
        ]);
        setPortfolio(portfolioRes.data);
        setTransactions(transactionsRes.data);
      } catch (err) {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Derived totals — calculated from portfolio data, not stored anywhere
  const totalInvested = portfolio.reduce((sum, p) => sum + p.total_invested, 0);
  const totalHoldings = portfolio.length;

  if (loading) return <div className="dashboard-loading">Loading dashboard...</div>;
  if (error) return <div className="dashboard-error">{error}</div>;

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2 className="logo">InvestTrack</h2>
        <nav>
          <Link to="/dashboard" className="nav-link active">Dashboard</Link>
          <Link to="/add-transaction" className="nav-link">Add Transaction</Link>
        </nav>
        <button className="logout-btn" onClick={logout}>Log Out</button>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <h1>Overview</h1>
          <p className="welcome-text">Welcome back, {user?.name || "Investor"}</p>
        </header>

        <section className="summary-cards">
          <div className="card highlight-card">
            <p className="card-label">Total Invested</p>
            <h2 className="card-value">${totalInvested.toFixed(2)}</h2>
          </div>
          <div className="card">
            <p className="card-label">Assets Held</p>
            <h2 className="card-value">{totalHoldings}</h2>
          </div>
          <div className="card">
            <p className="card-label">Total Transactions</p>
            <h2 className="card-value">{transactions.length}</h2>
          </div>
        </section>

        <section className="portfolio-section">
          <h3>Your Holdings</h3>
          {portfolio.length === 0 ? (
            <p className="empty-state">No holdings yet. Add your first transaction to get started.</p>
          ) : (
            <div className="holdings-grid">
              {portfolio.map((p) => (
                <div className="holding-card" key={p.asset_id}>
                  <div className="holding-header">
                    <span className="ticker">{p.ticker_symbol}</span>
                    <span className="asset-name">{p.asset_name}</span>
                  </div>
                  <div className="holding-details">
                    <div>
                      <p className="detail-label">Quantity</p>
                      <p className="detail-value">{p.quantity_held}</p>
                    </div>
                    <div>
                      <p className="detail-label">Avg Cost</p>
                      <p className="detail-value">${p.average_cost_per_unit}</p>
                    </div>
                    <div>
                      <p className="detail-label">Invested</p>
                      <p className="detail-value">${p.total_invested}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="transactions-section">
          <h3>Recent Activity</h3>
          {transactions.length === 0 ? (
            <p className="empty-state">No transactions yet.</p>
          ) : (
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td>{t.ticker_symbol}</td>
                    <td>
                      <span className={`badge ${t.type}`}>{t.type}</span>
                    </td>
                    <td>{t.quantity}</td>
                    <td>${t.price_per_unit}</td>
                    <td>{new Date(t.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;