import { useState } from "react";
import styles from "./styles";

export default function Login({ setUser, setView }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

const handleLogin = async () => {
  alert("Button clicked");
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