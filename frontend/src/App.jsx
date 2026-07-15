import { useState, useEffect } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Picks from "./Picks";
import ManageTiers from "./ManageTiers";   // ✅ IMPORTANT
import Stats from "./Stats";
import DriverHistory from "./DriverHistory";

function App() {
  const [view, setView] = useState("login");
  const [user, setUser] = useState(null);
  const [race, setRace] = useState(null);

  useEffect(() => {
    fetch("https://f1-league-app.onrender.com/current-race")
      .then(res => res.json())
      .then(data => setRace(data))
      .catch(() => {});
  }, []);

  // ✅ LOGIN
  if (view === "login") {
    return <Login setUser={setUser} setView={setView} />;
  }

  // ✅ DASHBOARD
  if (view === "dashboard") {
    return <Dashboard user={user} race={race} setView={setView} />;
  }

  // ✅ PICKS
  if (view === "picks") {
    return <Picks user={user} setView={setView} race={race} />;
  }

  // ✅ MANAGE TIERS (THIS WAS BROKEN BEFORE)
  if (view === "manageTiers") {
    return <ManageTiers user={user} setView={setView} />;
  }

// ✅ STATS
if (view === "stats") {
  return <Stats user={user} setView={setView} />;
}

if (view === "driverHistory") {
  return (
    <DriverHistory
      user={user}
      setView={setView}
    />
  );
}

  return null;
}

export default App;
