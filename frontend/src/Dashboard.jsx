import { useState, useEffect } from "react";
import styles from "./styles";

export default function Dashboard({ user, race, setView }) {

  const [standings, setStandings] = useState([]);
  const DASHBOARD_SPACING = "16px";

  useEffect(() => {
    fetch("https://f1-league-app.onrender.com/standings")
      .then(res => res.json())
      .then(data => setStandings(data));
  }, []);

  return (
    <div style={styles.page}>
      
<div style={styles.card}>

  <div style={styles.leftPanel}>
    🏁 F1 League
  </div>

  <div style={styles.gulfRoundel}>
    {new Date().getFullYear().toString().slice(-2)}
  </div>

  <div style={styles.rightPanel}>
    {user?.username?.charAt(0).toUpperCase() +
    user?.username?.slice(1).toLowerCase()}

  <span style={styles.raceCar}>
    🏎️
  </span>
</div>

</div>


      {/* ✅ RACE CARD */}
      <div style={styles.raceCard}>
        <div style={styles.raceRedStripe}></div>
        <div style={styles.raceStripe}></div>

        {race ? (
          <>
            <div style={{
              color: "#ff1e1e",
              fontWeight: "900",
              fontSize: "18px",
              letterSpacing: "0.5px"
            }}>
              {race.race_name || race.name || "Next Race"} — {race.status || ""}
            </div>

            <div style={{
              color: "#ff1e1e",
              fontWeight: "800"
            }}>
              {race?.race_time && !isNaN(new Date(race.race_time))
                ? new Date(race.race_time)
                    .toLocaleString("en-US", { timeZone: "America/Chicago" })
                : "Time TBD"}
            </div>
          </>
        ) : "Loading race..."}
      </div>

      {/* ✅ LEADERBOARD */}
      <div style={styles.leaderboardCard}>
        <h3>🏆 Leaderboard</h3>

{standings.map((p,i)=>(

          <div key={i} style={styles.leaderRow}>

            <div style={{ display:"flex", alignItems:"center" }}>
              <span style={{
                fontSize: (i < 3 || i === 5) ? "20px" : "14px",
                marginRight:"8px"
              }}>
                {["🥇","🥈","🥉","","","💩"][i]}
              </span>

              <span>
                {i+1}. {p.username}
              </span>
            </div>

            <span>
              {p.points}
            </span>

          </div>
        ))}
      </div>

      {/* ✅ MAKE PICKS */}
      <div style={{ marginTop: "40px" }}>
        <button style={styles.mainButton} onClick={() => setView("picks")}>
          <span style={styles.stripe}></span>
          <span style={styles.btnText}>Make Picks</span>
        </button>
      </div>


<div style={{ marginTop: "16px" }}>
  <button
    style={styles.statsButton}
    onClick={() => setView("stats")}
  >
    <span style={styles.statsButtonText}>
      Statistics
    </span>
  </button>

  <button
    style={styles.driverHistoryButton}
    onClick={() => setView("driverHistory")}
  >
    Pick History
  </button>

  <button
    style={styles.ownerHistoryButton}
    onClick={() => setView("ownerHistory")}
  >
    Owner History
  </button>
</div>

{user?.role === "admin" && (
  <div style={{ marginTop: "30px" }}>
    <button
      style={styles.mclarenButton}
      onClick={() => setView("manageTiers")}
    >
      Manage Tiers
      <span style={styles.mclarenStripe}></span>
    </button>
  </div>
)}

</div>
);
}