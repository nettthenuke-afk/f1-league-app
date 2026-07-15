import styles from "./styles";
import {
  HISTORICAL_DRIVER_PICK_HISTORY
} from "./driverHistory";

export default function DriverHistory({ setView }) {
  return (
    <div style={styles.page}>
      <div style={styles.driverHistoryCard}>
        <h1 style={styles.driverHistoryTitle}>
          🐪 Pick History
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