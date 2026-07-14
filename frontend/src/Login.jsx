import { useState } from "react";
import styles from "./styles";

export default function Login({ setUser, setView }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

const handleLogin = async () => {
  alert("1 - Button clicked");

  try {
    const res = await fetch(
      "https://f1-league-app.onrender.com/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      }
    );

    alert("2 - Got response: " + res.status);

    const data = await res.json();

    alert("3 - " + JSON.stringify(data));

    if (res.ok) {
      alert("4 - Login successful");

      setUser(data.user);
      setView("dashboard");
    } else {
      alert("Login failed");
    }
  } catch (err) {
    alert("ERROR: " + err.message);
  }
};

  return (
    <div style={styles.loginWrapper}>
      <div style={styles.loginCard}>

        <h2 style={styles.loginTitle}>F1 League Login</h2>

        <input
          style={styles.input}
          placeholder="Username"
          onChange={e => setUsername(e.target.value)}
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          onChange={e => setPassword(e.target.value)}
        />

<button style={styles.loginButton} onClick={handleLogin}>
  Login
  <span style={styles.loginButtonAccent}></span>
</button>

      </div>
    </div>
  );
}