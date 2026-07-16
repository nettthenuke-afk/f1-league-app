import React from "react";
import { HISTORICAL_OWNER_DRIVER_STATS } from "./ownerHistory";
import styles from "./styles";

const OWNER_ORDER = ["Travis", "Rocky", "Jake", "Tyler", "Sam", "Mike"];

function getTopByPicks(driverStats = {}) {
  const entries = Object.entries(driverStats);

  if (entries.length === 0) {
    return {
      driver: "-",
      picks: 0,
    };
  }

  const [driver, stats] = entries.sort((a, b) => {
    if (b[1].picks !== a[1].picks) {
      return b[1].picks - a[1].picks;
    }

    return a[0].localeCompare(b[0]);
  })[0];

  return {
    driver,
    picks: stats.picks,
  };
}

function getTopByPoints(driverStats = {}) {
  const entries = Object.entries(driverStats);

  if (entries.length === 0) {
    return {
      driver: "-",
      points: 0,
    };
  }

  const [driver, stats] = entries.sort((a, b) => {
    if (b[1].points !== a[1].points) {
      return b[1].points - a[1].points;
    }

    return a[0].localeCompare(b[0]);
  })[0];

  return {
    driver,
    points: stats.points,
  };
}

function getBestValueDriver(driverStats = {}) {
  const entries = Object.entries(driverStats).filter(
    ([, stats]) => stats.picks > 0
  );

  if (entries.length === 0) {
    return {
      driver: "-",
      pointsPerPick: 0,
    };
  }

  const [driver, stats] = entries.sort((a, b) => {
    const aValue = a[1].points / a[1].picks;
    const bValue = b[1].points / b[1].picks;

    if (bValue !== aValue) {
      return bValue - aValue;
    }

    if (b[1].points !== a[1].points) {
      return b[1].points - a[1].points;
    }

    return a[0].localeCompare(b[0]);
  })[0];

  return {
    driver,
    pointsPerPick: Number((stats.points / stats.picks).toFixed(1)),
  };
}

function buildOwnerSummary(ownerStats) {
  return {
    favoriteDriver: getTopByPicks(ownerStats.all),
    mostUsedTier1: getTopByPicks(ownerStats.tier1),
    mostUsedTier2: getTopByPicks(ownerStats.tier2),
    topScoringDriver: getTopByPoints(ownerStats.all),
    topScoringTier1: getTopByPoints(ownerStats.tier1),
    topScoringTier2: getTopByPoints(ownerStats.tier2),
    bestValueDriver: getBestValueDriver(ownerStats.all),
  };
}

export default function OwnerHistory({ setView }) {
  const ownerCards = OWNER_ORDER.map((owner) => {
    const ownerStats = HISTORICAL_OWNER_DRIVER_STATS[owner];

    if (!ownerStats) {
      return null;
    }

    return {
      owner,
      data: buildOwnerSummary(ownerStats),
    };
  }).filter(Boolean);

  return (
    <div>
      <h1>OWNER HISTORY</h1>

      {ownerCards.map(({ owner, data }) => (
        <div
          key={owner}
          style={{
            border: "1px solid #666",
            padding: "16px",
            marginBottom: "20px",
            borderRadius: "10px",
          }}
        >
          <h2>{owner}</h2>

          <p>
            <strong>Favorite Driver:</strong>{" "}
            {data.favoriteDriver.driver} ({data.favoriteDriver.picks} picks)
          </p>

          <p>
            <strong>Most Used Tier 1:</strong>{" "}
            {data.mostUsedTier1.driver} ({data.mostUsedTier1.picks} picks)
          </p>

          <p>
            <strong>Most Used Tier 2:</strong>{" "}
            {data.mostUsedTier2.driver} ({data.mostUsedTier2.picks} picks)
          </p>

          <p>
            <strong>Top Scoring Driver:</strong>{" "}
            {data.topScoringDriver.driver} ({data.topScoringDriver.points} pts)
          </p>

          <p>
            <strong>Top Tier 1 Scorer:</strong>{" "}
            {data.topScoringTier1.driver} ({data.topScoringTier1.points} pts)
          </p>

          <p>
            <strong>Top Tier 2 Scorer:</strong>{" "}
            {data.topScoringTier2.driver} ({data.topScoringTier2.points} pts)
          </p>

          <p>
            <strong>Best Driver Value:</strong>{" "}
            {data.bestValueDriver.driver}
          </p>

          <p>{data.bestValueDriver.pointsPerPick} pts/pick</p>
        </div>
      ))}

      <div style={{ marginTop: "30px" }}>
        <button
          style={styles.backButton}
          onClick={() => setView("dashboard")}
        >
          <div style={styles.sennaStripeTop}></div>

          🏁 Return to Paddock

          <div style={styles.sennaStripeBottom}></div>
        </button>
      </div>
    </div>
  );
}