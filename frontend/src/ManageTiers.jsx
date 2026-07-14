import { useEffect, useState } from "react";
import styles from "./styles";

export default function ManageTiers({ user, setView }) {

  const [teams, setTeams] = useState([]);
  const [localTiers, setLocalTiers] = useState({});

  const teamColors = {
    Ferrari: "#dc0000",
    Mercedes: "#00d2be",
    "Red Bull": "#1e41ff",
    McLaren: "#ff8700",
    "Aston Martin": "#006f62",
    "Alpine F1 Team": "#ff3c8f",
    "Haas F1 Team": "#ffffff",
    Williams: "#005aff",
    Audi: "#d50000",
    "Cadillac F1 Team": "#d4d4d4",
    "RB F1 Team": "#0088ff",
  };

  // ✅ LOAD TEAMS
  useEffect(() => {
    fetch("https://f1-league-app.onrender.com/teams")
      .then(res => res.json())
      .then(data => {
        setTeams(data);

        const tierMap = {};
        data.forEach(t => {
          tierMap[t.team_id] = t.tier;
        });

        setLocalTiers(tierMap);
      })
      .catch(() => console.log("Failed to load teams"));
  }, []);

  // ✅ SET LOCAL TIER
  const setTier = (team_id, tier) => {
    setLocalTiers({
      ...localTiers,
      [team_id]: tier
    });
  };

  // ✅ SAVE TIERS
  const save = async () => {
    for (const team_id in localTiers) {
      await fetch("https://f1-league-app.onrender.com/set-team-tier", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          team_id: parseInt(team_id),
          tier: localTiers[team_id]
        })
      });
    }

    alert("Tiers updated");
  };

  return (
    <div style={styles.page}>

      <h2 style={{
        color: "#fff",
        textAlign: "center",
        marginBottom: "12px"
      }}>
        Manage Team Tiers
      </h2>

      {/* ✅ TEAM LIST */}
      {teams.map(team => {

        const selected = localTiers[team.team_id];
        const color = teamColors[team.name] || "#444";

        return (
          <div
            key={team.team_id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              margin: "8px 0",
              padding: "10px",
              borderRadius: "8px",

              // ✅ FULL ROW COLOR (clean)
background: `linear-gradient(90deg, ${color}80, #111 80%)`,
border: `3px solid ${color}`,
boxShadow: `0 0 10px ${color}40`
            }}
          >
            {/* Team name */}
            <div style={{
              color: "#fff",
              fontWeight: "700"
            }}>
              {team.name}
            </div>

            {/* Tier buttons */}
            <div>
              {[1, 2, 3].map(t => (
                <button
                  key={t}
                  onClick={() => setTier(team.team_id, t)}
                  style={{
                    margin: "0 4px",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: "1px solid #555",

                    background:
                      selected === t ? "#39ff14" : "#111",

                    color:
                      selected === t ? "#000" : "#ccc",

                    fontWeight: "700",
                    cursor: "pointer"
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {/* ✅ SAVE BUTTON */}
      <button style={styles.mainButton} onClick={save}>
        Save Tiers
      </button>

      {/* ✅ BACK BUTTON */}
      <button
        style={styles.backButton}
        onClick={() => setView("dashboard")}
      >
        Back
      </button>

    </div>
  );
}
