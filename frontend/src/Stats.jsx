import { useState, useEffect } from "react";
import styles from "./styles";
import ferrariShield from "./ferrari-shield.png";

import {
  HISTORICAL_LIFETIME_POINTS,
  HISTORICAL_WEEKLY_WINS,
  HISTORICAL_WEEKLY_LAST_PLACES,
  HISTORICAL_ZERO_POINT_WEEKS,
  combineChampions,
  combineBaselineWithLive,
} from "./historicalStats";

export default function Stats({ setView }) {

  const [champions, setChampions] = useState([]);
  const [lifetimeStandings, setLifetimeStandings] = useState([]);
  const [weeklyWins, setWeeklyWins] = useState([]);
  const [weeklyLastPlaces, setWeeklyLastPlaces] = useState([]);
  const [zeroPointWeeks, setZeroPointWeeks] = useState([]);
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    fetch("https://f1-league-app.onrender.com/hall-of-champions")
      .then(res => res.json())
      .then(data => setChampions(data));
    fetch("https://f1-league-app.onrender.com/lifetime-standings")
  .then(res => res.json())
  .then(data => setLifetimeStandings(data));
   fetch("https://f1-league-app.onrender.com/weekly-wins")
  .then(res => res.json())
  .then(data => setWeeklyWins(data));
  fetch("https://f1-league-app.onrender.com/weekly-last-places")
  .then(res => res.json())
  .then(data => setWeeklyLastPlaces(data));
  fetch("https://f1-league-app.onrender.com/zero-point-weeks")
  .then(res => res.json())
  .then(data => setZeroPointWeeks(data));
  }, []);

const displayedChampions = combineChampions(champions);

const displayedLifetimeStandings = combineBaselineWithLive(
  lifetimeStandings,
  HISTORICAL_LIFETIME_POINTS,
  "points"
);

const displayedWeeklyWins = combineBaselineWithLive(
  weeklyWins,
  HISTORICAL_WEEKLY_WINS,
  "wins"
);

const displayedWeeklyLastPlaces = combineBaselineWithLive(
  weeklyLastPlaces,
  HISTORICAL_WEEKLY_LAST_PLACES,
  "last_places"
);

const displayedZeroPointWeeks = combineBaselineWithLive(
  zeroPointWeeks,
  HISTORICAL_ZERO_POINT_WEEKS,
  "zero_point_weeks"
);

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
{displayedChampions.map(c => (
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

{displayedWeeklyWins.map((driver, index) => (
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

{displayedWeeklyLastPlaces.map((driver, index) => (
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

  {displayedLifetimeStandings.map((driver, index) => (
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

  {displayedZeroPointWeeks.map((driver, index) => (
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