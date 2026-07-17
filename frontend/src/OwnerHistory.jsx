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
  sargeant: "Sargeant",

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
  calipinto: "Colapinto",

  linblad: "Lindblad",
  lindblad: "Lindblad",
  arvid: "Lindblad",

  doohan: "Doohan",

kimiantonelli: "Antonelli",
andreakimiantonelli: "Antonelli",
pierregasly: "Gasly",
charlesleclerc: "Leclerc",
maxverstappen: "Verstappen",
gabrielbortoleto: "Bortoleto",
arvidlindblad: "Lindblad",
oscarpiastri: "Piastri",
carlossainz: "Sainz",
oliverbearman: "Bearman",
georgerussell: "Russell",
landonorris: "Norris",
francocolapinto: "Colapinto",
liamlawson: "Lawson",
nicohulkenberg: "Hulkenberg",
isackhadjar: "Hadjar",
lewishamilton: "Hamilton",
yukitsunoda: "Tsunoda",
};

function cleanKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

function normalizeOwner(value) {
  const key = cleanKey(value);

  return OWNER_NAME_MAP[key] || String(value || "").trim();
}

function normalizeDriver(value) {
  const raw = String(value || "").trim();

  if (!raw) {
    return "";
  }

  const key = cleanKey(raw);

  if (DRIVER_NAME_MAP[key]) {
    return DRIVER_NAME_MAP[key];
  }

  const nameParts = raw.split(/\s+/);

  if (nameParts.length > 1) {
    const lastName = nameParts[nameParts.length - 1];
    const lastNameKey = cleanKey(lastName);

    if (DRIVER_NAME_MAP[lastNameKey]) {
      return DRIVER_NAME_MAP[lastNameKey];
    }

    return (
      lastName.charAt(0).toUpperCase() +
      lastName.slice(1)
    );
  }

  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function createEmptyOwnerStats() {
  return {
    all: {},
    tier1: {},
    tier2: {},
  };
}

function addAggregateStat(targetSection, driver, picks, points) {
  const normalizedDriver = normalizeDriver(driver);

  if (!normalizedDriver) {
    return;
  }

  if (!targetSection[normalizedDriver]) {
    targetSection[normalizedDriver] = {
      picks: 0,
      points: 0,
    };
  }

  targetSection[normalizedDriver].picks += Number(picks || 0);
  targetSection[normalizedDriver].points += Number(points || 0);
}

function cloneHistoricalStats() {
  const clonedStats = {};

  OWNER_ORDER.forEach((owner) => {
    clonedStats[owner] = createEmptyOwnerStats();

    ["all", "tier1", "tier2"].forEach((section) => {
      const sectionStats =
        HISTORICAL_OWNER_DRIVER_STATS?.[owner]?.[section] || {};

      Object.entries(sectionStats).forEach(([driver, stats]) => {
        addAggregateStat(
          clonedStats[owner][section],
          driver,
          stats?.picks,
          stats?.points
        );
      });
    });
  });

  return clonedStats;
}

function mergeLiveStatsIntoHistorical(liveOwners = {}) {
  const mergedStats = cloneHistoricalStats();

  Object.entries(liveOwners).forEach(
    ([rawOwner, liveOwnerStats]) => {
      const owner = normalizeOwner(rawOwner);

      if (!OWNER_ORDER.includes(owner)) {
        return;
      }

      if (!mergedStats[owner]) {
        mergedStats[owner] = createEmptyOwnerStats();
      }

      ["all", "tier1", "tier2"].forEach((section) => {
        const liveSection = liveOwnerStats?.[section] || {};

        Object.entries(liveSection).forEach(
          ([driver, liveStats]) => {
            addAggregateStat(
              mergedStats[owner][section],
              driver,
              liveStats?.picks,
              liveStats?.points
            );
          }
        );
      });
    }
  );

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

  const [driver, stats] = [...entries].sort((a, b) => {
    if (b[1].picks !== a[1].picks) {
      return b[1].picks - a[1].picks;
    }

    if (b[1].points !== a[1].points) {
      return b[1].points - a[1].points;
    }

    return a[0].localeCompare(b[0]);
  })[0];

  return {
    driver,
    picks: Number(stats.picks || 0),
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

  const [driver, stats] = [...entries].sort((a, b) => {
    if (b[1].points !== a[1].points) {
      return b[1].points - a[1].points;
    }

    if (b[1].picks !== a[1].picks) {
      return b[1].picks - a[1].picks;
    }

    return a[0].localeCompare(b[0]);
  })[0];

  return {
    driver,
    points: Number(stats.points || 0),
  };
}

function getBestValueDriver(driverStats = {}) {
  const entries = Object.entries(driverStats).filter(
    ([, stats]) => Number(stats?.picks || 0) > 0
  );

  if (entries.length === 0) {
    return {
      driver: "-",
      pointsPerPick: 0,
    };
  }

  const [driver, stats] = [...entries].sort((a, b) => {
    const aPicks = Number(a[1].picks || 0);
    const bPicks = Number(b[1].picks || 0);

    const aPoints = Number(a[1].points || 0);
    const bPoints = Number(b[1].points || 0);

    const aValue = aPicks > 0 ? aPoints / aPicks : 0;
    const bValue = bPicks > 0 ? bPoints / bPicks : 0;

    if (bValue !== aValue) {
      return bValue - aValue;
    }

    if (bPoints !== aPoints) {
      return bPoints - aPoints;
    }

    if (bPicks !== aPicks) {
      return bPicks - aPicks;
    }

    return a[0].localeCompare(b[0]);
  })[0];

  const picks = Number(stats.picks || 0);
  const points = Number(stats.points || 0);

  return {
    driver,
    pointsPerPick:
      picks > 0
        ? Number((points / picks).toFixed(1))
        : 0,
  };
}

function buildOwnerSummary(ownerStats = createEmptyOwnerStats()) {
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
  const [ownerStats, setOwnerStats] = useState(() =>
    cloneHistoricalStats()
  );

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadLiveOwnerHistory() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/owner-history`
        );

        if (!response.ok) {
          throw new Error(
            `Owner history request failed with status ${response.status}`
          );
        }

        const data = await response.json();

        if (
          !data ||
          typeof data !== "object" ||
          !data.owners ||
          typeof data.owners !== "object"
        ) {
          throw new Error(
            "Owner history response was not in the expected format."
          );
        }

        const mergedStats = mergeLiveStatsIntoHistorical(
          data.owners
        );

        if (isMounted) {
          setOwnerStats(mergedStats);
          setLoadError("");
        }
      } catch (error) {
        console.error(
          "Owner history live merge failed:",
          error
        );

        if (isMounted) {
          setOwnerStats(cloneHistoricalStats());

          setLoadError(
            "Live database stats could not be loaded. Showing historical baseline only."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadLiveOwnerHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  const ownerCards = OWNER_ORDER.map((owner) => {
    const statsForOwner =
      ownerStats[owner] || createEmptyOwnerStats();

    return {
      owner,
      data: buildOwnerSummary(statsForOwner),
    };
  });

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