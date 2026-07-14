import { useState, useEffect } from "react";
import styles from "./styles";
import ferrariShield from "./ferrari-shield.png";

export default function Stats({ setView }) {

  const [champions, setChampions] = useState([]);
  const [lifetimeStandings, setLifetimeStandings] = useState([]);
  const [weeklyWins, setWeeklyWins] = useState([]);
  const [weeklyLastPlaces, setWeeklyLastPlaces] = useState([]);
  const [zeroPointWeeks, setZeroPointWeeks] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/hall-of-champions")
      .then(res => res.json())
      .then(data => setChampions(data));
    fetch("http://127.0.0.1:8000/lifetime-standings")
  .then(res => res.json())
  .then(data => setLifetimeStandings(data));
   fetch("http://127.0.0.1:8000/weekly-wins")
  .then(res => res.json())
  .then(data => setWeeklyWins(data));
  fetch("http://127.0.0.1:8000/weekly-last-places")
  .then(res => res.json())
  .then(data => setWeeklyLastPlaces(data));
  fetch("http://127.0.0.1:8000/zero-point-weeks")
  .then(res => res.json())
  .then(data => setZeroPointWeeks(data));
  }, []);

  return (
    <div style={styles.statsPage}>

<div style={styles.statsHeader}>
  <img
    src={ferrariShield}
    style={styles.statsHeaderBadge}
    alt="Ferrari Shield"
  />

  League Statistics

  <img
    src={ferrariShield}
    style={styles.statsHeaderBadge}
    alt="Ferrari Shield"
  />
</div>

<div style={styles.hallOfChampionsCard}>
  <div style={styles.jpsStripeTop}></div>
<div style={styles.jpsTitleWrapper}>
  <div style={styles.jpsTitleShadow}>

  </div>

  <div style={styles.hallOfChampionsTitle}>
    Hall of Champions
  </div>
</div>
  <div style={styles.jpsStripeBottom}></div>

  <div style={styles.hallOfChampionsList}>
{champions.map(c => (
  <div
    key={c.year}
    style={styles.championRow}
  >
    {c.year} — {c.champion || "TBD"}
  </div>
))}  </div>
</div>

<div style={styles.weeklyWinsCard}>
  <div style={styles.weeklyWinsTitle}>
    🥇 Weekly Wins
  </div>

  <div style={styles.weeklyWinsDivider}></div>

{weeklyWins.map((driver, index) => (
  <div
    key={driver.username}
    style={styles.weeklyWinsRow}
  >
    {index + 1}. {driver.username} — {driver.wins}
  </div>
))}
</div>

<div style={styles.weeklyLastPlaceCard}>
  <div style={styles.weeklyLastPlaceTitle}>
    💩 Weekly Last Places
  </div>

{weeklyLastPlaces.map((driver, index) => (
  <div
    key={driver.username}
    style={styles.weeklyLastPlaceRow}
  >
    {index + 1}. {driver.username} — {driver.last_places}
  </div>
))}
</div>

<div style={styles.lifetimeStandingsCard}>
  <div style={styles.lifetimeStandingsTitle}>
    🏅 Lifetime Standings
  </div>

  <div style={styles.lifetimeStandingsDivider}></div>

  {lifetimeStandings.map((driver, index) => (
    <div
      key={driver.username}
      style={styles.lifetimeStandingsRow}
    >
      {index + 1}. {driver.username} — {driver.points}
    </div>
  ))}
</div>

<div style={styles.zeroPointWeeksCard}>
  <div style={styles.zeroPointWeeksTitle}>
    😬 Most Zero-Point Weeks
  </div>

  {zeroPointWeeks.map((driver, index) => (
    <div
      key={driver.username}
      style={styles.zeroPointWeeksRow}
    >
      {index + 1}. {driver.username} — {driver.zero_point_weeks}
    </div>
  ))}
</div>

      <button style={styles.backButton} onClick={() => setView("dashboard")}>

        <div style={styles.sennaStripeTop}></div>

        🏁 Return to Paddock

        <div style={styles.sennaStripeBottom}></div>
      </button>

    </div>
  );
}