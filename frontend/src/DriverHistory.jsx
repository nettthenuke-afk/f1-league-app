import styles from "./styles";
import {
  HISTORICAL_DRIVER_PICK_HISTORY
} from "./driverHistory";

export default function DriverHistory({ setView }) {
  return (
    <div style={styles.page}>
      <div style={styles.driverHistoryCard}>
        <h1 style={styles.driverHistoryTitle}>
          🐪 Driver History
        </h1>

        {HISTORICAL_DRIVER_PICK_HISTORY.map((driver, index) => (
          <div
            key={driver.driver}
            style={styles.driverHistoryRow}
          >
            <div style={styles.driverHistoryRank}>
              {index + 1}
            </div>

            <div style={styles.driverHistoryDriver}>
              {driver.driver}
            </div>

            <div style={styles.driverHistoryStats}>
              {driver.picks} Picks
            </div>

            <div style={styles.driverHistoryPercentage}>
              {driver.percentage.toFixed(1)}%
            </div>
          </div>
        ))}
      </div>

      <button
        style={styles.statsButton}
        onClick={() => setView("dashboard")}
      >
        Return to Paddock
      </button>
    </div>
  );
}