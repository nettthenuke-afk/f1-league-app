import { useState, useEffect } from "react";
import styles from "./styles";

export default function Picks({ user, setView, race }) {

  const [users, setUsers] = useState([]);  
  const [pickOptions, setPickOptions] = useState(null);
  const [tier1Pick, setTier1Pick] = useState(null);
  const [tier2Pick, setTier2Pick] = useState(null);
  const [tier3Pick, setTier3Pick] = useState(null);
  const [draftStatus, setDraftStatus] = useState(null);

useEffect(() => {
  const load = () => {
    fetch("https://f1-league-app.onrender.com/pick-options")
      .then(res => res.json())
      .then(data => setPickOptions(data));
  };

  load();

  const i = setInterval(load, 3000);

  return () => clearInterval(i);
}, []);

useEffect(() => {
  fetch("https://f1-league-app.onrender.com/users")
    .then(res => res.json())
    .then(data => setUsers(data));
}, []);

useEffect(() => {
  const loadDraft = () => {
    fetch("https://f1-league-app.onrender.com/draft-status")
      .then(res => res.json())
      .then(data => setDraftStatus(data));
  };

  loadDraft();

  const i = setInterval(loadDraft, 3000);

  return () => clearInterval(i);
}, []);

  const isMyTurn =
  user?.role === "admin"
    ? true
    : draftStatus?.current_user_id === user?.id;
  const [adminTargetUser, setAdminTargetUser] = useState(null);

const userLookup = Object.fromEntries(
  users.map(u => [u.id, u.username])
);

const pickOrder = draftStatus?.pick_order || [];

  // ✅ TEAM COLORS
  const teamColors = {
    Ferrari: "#dc0000",
    Mercedes: "#00d2be",
    "Red Bull": "#1e41ff",
    McLaren: "#ff8700",
    "Aston Martin": "#006f62",
    "Alpine F1 Team": "#ff3c8f",
    Haas: "#ffffff",
    Williams: "#005aff",
    Audi: "#d50000",
    "Cadillac F1 Team": "#c0c0c0",
    "RB F1 Team": "#0088ff"
  };

  // ✅ GROUP BY TEAM
  const groupByTeam = (drivers) => {
    const teams = {};
    drivers.forEach(d => {
      if (!teams[d.team]) teams[d.team] = [];
      teams[d.team].push(d);
    });
    return Object.values(teams);
  };

const save = async () => {
  try {
    const response = await fetch(
      "https://f1-league-app.onrender.com/submit-picks",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id:
  user?.role === "admin"
    ? adminTargetUser
    : user.id,
          picks: {
            tier1: tier1Pick?.id,
            tier2: tier2Pick?.id,
            tier3: tier3Pick?.id
          }
        })
      }
    );

    const result = await response.json();

    console.log("STATUS:", response.status);
    console.log("RESULT:", result);

    if (!response.ok) {
      alert("Save Failed");
      return;
    }

alert("Picks Saved");

// Refresh draft status
fetch("https://f1-league-app.onrender.com/draft-status")
  .then(res => res.json())
  .then(data => setDraftStatus(data));

// Refresh driver availability
fetch("https://f1-league-app.onrender.com/pick-options")
  .then(res => res.json())
  .then(data => setPickOptions(data));

// Clear current selections
setTier1Pick(null);
setTier2Pick(null);
setTier3Pick(null);

  } catch (err) {
    console.error(err);
    alert("Save Failed");
  }
};
  // ✅ UPDATED DRIVER TILE (THIS IS THE IMPORTANT PART)
  const renderDriver = (d, selected, setSelected) => {
    const isTaken = !!d.taken_by;
    const isSelected = selected?.id === d.id;
    const color = teamColors[d.team] || "#444";

const darkTeams = [
  "Red Bull",
  "Aston Martin",
  "Ferrari",
  "Audi",
  "RB F1 Team",
  "Alpine F1 Team"
];

const selectedTextColor = darkTeams.includes(d.team)
  ? "#fff"
  : "#000";

    return (
      <div
        key={d.id}
        style={{
          ...styles.driverTile,

          // ✅ TEAM COLOR NOW INSIDE TILE
          border: `2px solid ${color}`,
          boxShadow: `0 0 10px ${color}55`,

...(isSelected && {
  background: color,
  color: "#fff",
  textShadow: "0 1px 3px rgba(0,0,0,0.8)",
  boxShadow: `0 0 14px ${color}`
}),

...(isTaken && {
  background: "#4a1a1a",     // dark red
  border: "2px solid #ff4444",
  boxShadow: "0 0 12px #ff4444",

  opacity: 1,
  filter: "none",
  cursor: "not-allowed"
})
        }}
        onClick={() => {
          if (!isMyTurn) return;
          if (!isTaken) setSelected(d);
        }}
      >
        <div style={styles.driverName}>{d.name}</div>
        <div style={styles.driverTeam}>{d.team}</div>

        {d.taken_by && (
<div
  style={{
    marginTop: "8px",
    background: "#ff4444",
    color: "white",
    fontWeight: "900",
    fontSize: "13px",
    padding: "4px 8px",
    borderRadius: "6px",
    display: "inline-block"
  }}
>
  🔒 TAKEN BY {d.taken_by.toUpperCase()}
</div>
        )}
      </div>
    );
  };

  if (!pickOptions) {
    return <div style={styles.page}>Loading drivers...</div>;
  }

  const renderTier = (drivers, selectedPick, setSelectedPick, tierStyle) => (
    <div style={{ ...styles.tierCard, ...tierStyle }}>

      {groupByTeam(drivers || []).map((teamDrivers, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginBottom: "12px"
          }}
        >
          {teamDrivers[0] &&
            renderDriver(teamDrivers[0], selectedPick, setSelectedPick)}

          {teamDrivers[1]
            ? renderDriver(teamDrivers[1], selectedPick, setSelectedPick)
            : <div />}
        </div>
      ))}

    </div>
  );

  return (
    <div style={styles.page}>

      {/* ✅ RACE CARD */}
      <div style={styles.raceCard}>
        <div style={styles.raceRedStripe}></div>
        <div style={styles.raceStripe}></div>

        {race ? (
          <div style={{ color: "#ff1e1e", fontWeight: "900" }}>
            {race.race_name} — {race.status}
          </div>
        ) : "Loading race..."}
      </div>

{user?.role === "admin" && (
  <div
    style={{
      marginBottom: "10px",
      textAlign: "center"
    }}
  >
<select
  value={adminTargetUser || ""}
  onChange={(e) =>
    setAdminTargetUser(Number(e.target.value))
  }
  style={{
    width: "100%",
    maxWidth: "260px",
    padding: "10px 14px",
    borderRadius: "10px",
    border: "2px solid #3b82f6",
    background: "#1a1a1a",
    color: "#fff",
    fontWeight: "600",
    fontSize: "14px",
    outline: "none",
    cursor: "pointer",
    boxShadow: "0 0 8px rgba(59,130,246,0.3)"
  }}
> 
{user?.role === "admin" && (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "10px",

      background: "#111",
      border: "1px solid #333",
      borderRadius: "10px",

      padding: "10px",
      marginBottom: "10px"
    }}
  >
    <span
      style={{
        color: "#aaa",
        fontWeight: "600",
        fontSize: "13px"
      }}
    >
      Drafting For
    </span>

    <select
      value={adminTargetUser || ""}
      onChange={(e) =>
        setAdminTargetUser(Number(e.target.value))
      }
      style={{
        width: "100%",
        maxWidth: "220px",
        padding: "8px 12px",
        borderRadius: "8px",
        border: "2px solid #3b82f6",
        background: "#1a1a1a",
        color: "#fff",
        fontWeight: "600",
        fontSize: "14px",
        cursor: "pointer"
      }}
    >
      <option value="">
        Select Driver Owner
      </option>

      {users
        .filter(u => u.role !== "admin")
        .map(u => (
          <option
            key={u.id}
            value={u.id}
          >
            {u.username}
          </option>
        ))}
    </select>
  </div>
)}
     <option value="">
        Select Driver Owner
      </option>

      {users
        .filter(u => u.role !== "admin")
        .map(u => (
          <option
            key={u.id}
            value={u.id}
          >
            {u.username}
          </option>
        ))}
    </select>
  </div>
)}

      {/* ✅ TURN STATUS */}
      <div style={{
        textAlign: "center",
        marginBottom: "10px",
        fontWeight: "700",
        color: isMyTurn ? "#00ff00" : "#ffaaaa"
      }}>
        {isMyTurn ? "Your Turn to Pick" : "Waiting for next pick..."}
      </div>

<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "6px",
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
    marginBottom: "8px"
  }}
>
  {pickOrder
    .filter(userId => userLookup[userId] !== "admin")
    .map(userId => {
      const isCurrent =
        draftStatus?.current_user_id === userId;

      const isMe =
        user?.id === userId;

      return (
        <div
          key={userId}
          style={{
            minWidth: 0,
            width: "100%",
            boxSizing: "border-box",
            padding: "6px 4px",
            fontSize: "11px",
            lineHeight: "1.2",
            textAlign: "center",
            borderRadius: "8px",
            overflowWrap: "anywhere",

            background: isCurrent
              ? "#00cc66"
              : isMe
                ? "#0077ff"
                : "#333",

            color: "#fff",
            fontWeight: "700",

            border: isCurrent
              ? "2px solid #00ff88"
              : "2px solid #555"
          }}
        >
          {isMe ? "YOU" : userLookup[userId]}
        </div>
      );
    })}
</div>

      <h2 style={{ color: "#fff", textAlign: "center" }}>
        Select Picks
      </h2>

      {renderTier(pickOptions.tier1, tier1Pick, setTier1Pick, styles.tier1Card)}
      {renderTier(pickOptions.tier2, tier2Pick, setTier2Pick, styles.tier2Card)}
      {renderTier(pickOptions.tier3, tier3Pick, setTier3Pick, styles.tier3Card)}

<button
  style={{
    ...styles.mainButton,
    opacity: (!tier1Pick || !tier2Pick || !isMyTurn) ? 0.5 : 1,
    cursor: (!tier1Pick || !tier2Pick || !isMyTurn)
      ? "not-allowed"
      : "pointer"
  }}
  disabled={!tier1Pick || !tier2Pick || !isMyTurn}
  onClick={save}
>
  <span style={styles.stripe}></span>
  <span style={styles.btnText}>Save Picks</span>
</button>

      <button style={styles.backButton} onClick={() => setView("dashboard")}>

        <div style={styles.sennaStripeTop}></div>

        🏁 Return to Paddock

        <div style={styles.sennaStripeBottom}></div>
      </button>

    </div>
  );
}