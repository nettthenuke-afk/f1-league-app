import React, { useEffect, useState } from "react";
import { HISTORICAL_OWNER_DRIVER_STATS } from "./ownerHistory";
import styles from "./styles";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const OWNER_ORDER = ["Travis", "Rocky", "Jake", "Tyler", "Sam", "Mike"];

const OWNER_NAME_MAP = {
  travis: "Travis",
  rocky: "Rocky",
  jake: "Jake",
  tyler: "Tyler",
  sam: "Sam",
  mike: "Mike",
};

const DRIVER_NAME_MAP = {
  leclrerc: "Leclerc",
  lecerc: "Leclerc",
  leclerc: "Leclerc",
  russel: "Russell",
  russell: "Russell",
  verstappen: "Verstappen",
  perez: "Perez",
  sainz: "Sainz",
  saint: "Sainz",
  hamilton: "Hamilton",
  norris: "Norris",
  lando: "Norris",
  piastri: "Piastri",
  alonso: "Alonso",
  stroll: "Stroll",
  bottas: "Bottas",
  zhou: "Zhou",
  guanyu: "Zhou",
  tsunoda: "Tsunoda",
  yuki: "Tsunoda",
  tsnudoa: "Tsunoda",
  tsunada: "Tsunoda",
  ricardo: "Ricciardo",
  riccardo: "Ricciardo",
  ricciardo: "Ricciardo",
  sargent: "Sargeant",
  albon: "Albon",
  gasly: "Gasly",
  gassly: "Gasly",
  gasley: "Gasly",
  ocon: "Ocon",
  magnussen: "Magnussen",
  magnussem: "Magnussen",
  magnusson: "Magnussen",
  schumacher: "Schumacher",
  schumi: "Schumacher",
  vettel: "Vettel",
  vetted: "Vettel",
  devries: "De Vries",
  hulkenberg: "Hulkenberg",
  hulksberg: "Hulkenberg",
  hulkenburg: "Hulkenberg",
  hulk: "Hulkenberg",
  lawson: "Lawson",
  hadjar: "Hadjar",
  bearman: "Bearman",
  bortoleto: "Bortoleto",
  bortoletto: "Bortoleto",
  antonelli: "Antonelli",
  colapinto: "Colapinto",
  linblad: "Lindblad",
  lindblad: "Lindblad",
  arvid: "Lindblad",
  doohan: "Doohan",
};

function cleanKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

function normalizeOwner(value) {
  const key = cleanKey(value);
  return OWNER_NAME_MAP[key] || value || "";
}

function normalizeDriver(value) {
  const raw = String(value || "").trim();

  if (!raw) {
    return "";
  }

  const key = cleanKey(raw);
  return DRIVER_NAME_MAP[key] || raw.charAt(0).toUpperCase() + raw.slice(1);
}

function createEmptyOwnerStats() {
  return {
    all: {},
    tier1: {},
    tier2: {},
  };
}

function cloneHistoricalStats() {
  const mergedStats = {};

  OWNER_ORDER.forEach((owner) => {
    mergedStats[owner] = createEmptyOwnerStats();

    ["all", "tier1", "tier2"].forEach((section) => {
      const sectionStats =
        HISTORICAL_OWNER_DRIVER_STATS?.[owner]?.[section] || {};

      Object.entries(sectionStats).forEach(([driver, stats]) => {
        mergedStats[owner][section][driver] = {
          picks: stats.picks || 0,
          points: stats.points || 0,
        };
      });
    });
  });

  return mergedStats;
}

function addDriverStat(stats, owner, tier, driver, points) {
  const normalizedOwner = normalizeOwner(owner);
  const normalizedDriver = normalizeDriver(driver);

  if (!OWNER_ORDER.includes(normalizedOwner) || !normalizedDriver) {
    return;
  }

  const numericPoints = Number(points || 0);
  const tierKey = Number(tier) === 2 ? "tier2" : "tier1";

  if (!stats[normalizedOwner]) {
    stats[normalizedOwner] = createEmptyOwnerStats();
  }

  if (!stats[normalizedOwner].all[normalizedDriver]) {
    stats[normalizedOwner].all[normalizedDriver] = {
      picks: 0,
      points: 0,
    };
  }

  if (!stats[normalizedOwner][tierKey][normalizedDriver]) {
    stats[normalizedOwner][tierKey][normalizedDriver] = {
      picks: 0,
      points: 0,
    };
  }

  stats[normalizedOwner].all[normalizedDriver].picks += 1;
  stats[normalizedOwner].all[normalizedDriver].points += numericPoints;

  stats[normalizedOwner][tierKey][normalizedDriver].picks += 1;
  stats[normalizedOwner][tierKey][normalizedDriver].points += numericPoints;
}

function getRaceKey(item) {
  return (
    item.race_id ||
    item.raceId ||
    item.race ||
    item.race_name ||
    item.raceName ||
    item.grand_prix ||
    item.grandPrix ||
    item.event ||
    ""
  );
}

function getResultDriver(item) {
  return (
    item.driver ||
    item.driver_name ||
    item.driverName ||
    item.name ||
    item.selected_driver ||
    ""
  );
}

function getResultPoints(item) {
  return (
    item.points ??
    item.total_points ??
    item.totalPoints ??
    item.score ??
    item.driver_points ??
    item.driverPoints ??
    0
  );
}

function buildResultPointsMap(results) {
  const resultMap = {};

  results.forEach((result) => {
    const raceKey = String(getRaceKey(result)).trim();
    const driver = normalizeDriver(getResultDriver(result));

    if (!raceKey || !driver) {
      return;
    }

    resultMap[`${raceKey}|${driver}`] = Number(getResultPoints(result) || 0);
  });

  return resultMap;
}

function getPickOwner(pick) {
  return (
    pick.owner ||
    pick.owner_name ||
    pick.ownerName ||
    pick.username ||
    pick.user_name ||
    pick.userName ||
    pick.user?.username ||
    pick.user?.name ||
    pick.user?.display_name ||
    pick.user?.displayName ||
    ""
  );
}

function getPickPoints(pick, fallbackPoints) {
  return (
    pick.points ??
    pick.total_points ??
    pick.totalPoints ??
    pick.score ??
    pick.driver_points ??
    pick.driverPoints ??
    fallbackPoints ??
    0
  );
}

function getLivePickEntries(pick, resultPointsMap) {
  const owner = getPickOwner(pick);
  const raceKey = String(getRaceKey(pick)).trim();

  const entries = [];

  const tier1Driver =
    pick.tier1_driver ||
    pick.tier1Driver ||
    pick.tier_1_driver ||
    pick.tierOneDriver ||
    pick.driver1 ||
    pick.pick1;

  const tier2Driver =
    pick.tier2_driver ||
    pick.tier2Driver ||
    pick.tier_2_driver ||
    pick.tierTwoDriver ||
    pick.driver2 ||
    pick.pick2;

  if (tier1Driver || tier2Driver) {
    if (tier1Driver) {
      const driver = normalizeDriver(tier1Driver);
      const fallbackPoints = resultPointsMap[`${raceKey}|${driver}`];

      entries.push({
        owner,
        tier: 1,
        driver,
        points: getPickPoints(
          {
            points:
              pick.tier1_points ??
              pick.tier1Points ??
              pick.tier_1_points,
          },
          fallbackPoints
        ),
      });
    }

    if (tier2Driver) {
      const driver = normalizeDriver(tier2Driver);
      const fallbackPoints = resultPointsMap[`${raceKey}|${driver}`];

      entries.push({
        owner,
        tier: 2,
        driver,
        points: getPickPoints(
          {
            points:
              pick.tier2_points ??
              pick.tier2Points ??
              pick.tier_2_points,
          },
          fallbackPoints
        ),
      });
    }

    return entries;
  }

  const driver =
    pick.driver ||
    pick.driver_name ||
    pick.driverName ||
    pick.selected_driver ||
    pick.selectedDriver ||
    pick.pick;

  const tier = pick.tier || pick.driver_tier || pick.driverTier || 1;
  const normalizedDriver = normalizeDriver(driver);
  const fallbackPoints = resultPointsMap[`${raceKey}|${normalizedDriver}`];

  if (normalizedDriver) {
    entries.push({
      owner,
      tier,
      driver: normalizedDriver,
      points: getPickPoints(pick, fallbackPoints),
    });
  }

  return entries;
}

function mergeLiveStatsIntoHistorical(picks, results) {
  const mergedStats = cloneHistoricalStats();
  const resultPointsMap = buildResultPointsMap(results);

  picks.forEach((pick) => {
    const entries = getLivePickEntries(pick, resultPointsMap);

    entries.forEach((entry) => {
      addDriverStat(
        mergedStats,
        entry.owner,
        entry.tier,
        entry.driver,
        entry.points
      );
    });
  });

  return mergedStats;
}

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
  const [ownerStats, setOwnerStats] = useState(() => cloneHistoricalStats());
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    async function loadLiveOwnerHistory() {
      try {
        const [picksResponse, resultsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/picks`),
          fetch(`${API_BASE_URL}/results`),
        ]);

        if (!picksResponse.ok || !resultsResponse.ok) {
          throw new Error("Unable to load live picks or results.");
        }

        const picksData = await picksResponse.json();
        const resultsData = await resultsResponse.json();

        const picks = Array.isArray(picksData)
          ? picksData
          : picksData.picks || [];

        const results = Array.isArray(resultsData)
          ? resultsData
          : resultsData.results || [];

        const mergedStats = mergeLiveStatsIntoHistorical(picks, results);

        setOwnerStats(mergedStats);
        setLoadError("");
      } catch (error) {
        console.error("Owner history live merge failed:", error);
        setOwnerStats(cloneHistoricalStats());
        setLoadError("Live database stats could not be loaded. Showing historical baseline only.");
      } finally {
        setIsLoading(false);
      }
    }

    loadLiveOwnerHistory();
  }, []);

  const ownerCards = OWNER_ORDER.map((owner) => {
    const statsForOwner = ownerStats[owner];

    if (!statsForOwner) {
      return null;
    }

    return {
      owner,
      data: buildOwnerSummary(statsForOwner),
    };
  }).filter(Boolean);

return (
  <div style={styles.ownerHistoryPage}>
    <h1 style={styles.ownerHistoryTitle}>
      🏎️ OWNER HISTORY
    </h1>

    {isLoading && (
      <p style={styles.ownerHistoryStatus}>
        Loading live owner history...
      </p>
    )}

    {loadError && (
      <p style={styles.ownerHistoryStatus}>
        {loadError}
      </p>
    )}

    {ownerCards.map(({ owner, data }) => (
      <div
        key={owner}
        style={styles.ownerHistoryCard}
      >
        <h2 style={styles.ownerHistoryOwnerName}>
          {owner}
        </h2>

        <div style={styles.ownerHistorySection}>
          <p style={styles.ownerHistoryStat}>
            <span style={styles.ownerHistoryLabel}>
              Favorite Driver:
            </span>{" "}
            {data.favoriteDriver.driver} (
            {data.favoriteDriver.picks} picks)
          </p>
        </div>

        <div style={styles.ownerHistorySection}>
          <p style={styles.ownerHistoryStat}>
            <span style={styles.ownerHistoryLabel}>
              Most Used Tier 1:
            </span>{" "}
            {data.mostUsedTier1.driver} (
            {data.mostUsedTier1.picks} picks)
          </p>
        </div>

        <div style={styles.ownerHistorySection}>
          <p style={styles.ownerHistoryStat}>
            <span style={styles.ownerHistoryLabel}>
              Most Used Tier 2:
            </span>{" "}
            {data.mostUsedTier2.driver} (
            {data.mostUsedTier2.picks} picks)
          </p>
        </div>

        <div style={styles.ownerHistorySection}>
          <p style={styles.ownerHistoryStat}>
            <span style={styles.ownerHistoryLabel}>
              Top Scoring Driver:
            </span>{" "}
            {data.topScoringDriver.driver} (
            {data.topScoringDriver.points} pts)
          </p>
        </div>

        <div style={styles.ownerHistorySection}>
          <p style={styles.ownerHistoryStat}>
            <span style={styles.ownerHistoryLabel}>
              Top Tier 1 Scorer:
            </span>{" "}
            {data.topScoringTier1.driver} (
            {data.topScoringTier1.points} pts)
          </p>
        </div>

        <div style={styles.ownerHistorySection}>
          <p style={styles.ownerHistoryStat}>
            <span style={styles.ownerHistoryLabel}>
              Top Tier 2 Scorer:
            </span>{" "}
            {data.topScoringTier2.driver} (
            {data.topScoringTier2.points} pts)
          </p>
        </div>

        <div style={styles.ownerHistorySection}>
          <p style={styles.ownerHistoryStat}>
            <span style={styles.ownerHistoryLabel}>
              Best Driver Value:
            </span>{" "}
            {data.bestValueDriver.driver}
          </p>

          <p style={styles.ownerHistoryStat}>
            {data.bestValueDriver.pointsPerPick} pts/pick
          </p>
        </div>
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