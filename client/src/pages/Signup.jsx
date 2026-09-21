import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await axiosClient.post("/signup", { name, email, password });

      // Signup succeeded, but our /signup endpoint doesn't return a token —
      // only /login does. So we log them in immediately after, using the
      // same credentials they just created, for a smooth experience.
      const loginResponse = await axiosClient.post("/login", { email, password });
      const { access_token, user_id, name: userName } = loginResponse.data;

      login(access_token, { id: user_id, name: userName });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed. Please try again.");
    }
  }

  return (
    <div>
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">Sign Up</button>
      </form>
      <p>
        Already have an account? <Link to="/">Log in</Link>
      </p>
    </div>
  );
}

export default Signup;