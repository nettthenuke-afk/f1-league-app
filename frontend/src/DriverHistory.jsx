import React, { useEffect, useState } from "react";
import styles from "./styles";
import {
  HISTORICAL_DRIVER_PICK_HISTORY,
  combineDriverPickHistory,
} from "./driverHistory";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export default function DriverHistory({ setView }) {
  const [driverHistory, setDriverHistory] = useState(
    HISTORICAL_DRIVER_PICK_HISTORY
  );

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDriverHistory() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/driver-history`
        );

        if (!response.ok) {
          throw new Error(
            `Driver history request failed with status ${response.status}`
          );
        }

        const data = await response.json();

        const liveRows = Array.isArray(data?.rows)
          ? data.rows
          : [];

        const liveRaceCount = Number(
          data?.liveRaceCount || 0
        );

        const combinedHistory = combineDriverPickHistory(
          liveRows,
          liveRaceCount
        );

        if (isMounted) {
          setDriverHistory(combinedHistory);
          setLoadError("");
        }
      } catch (error) {
        console.error(
          "Driver history live merge failed:",
          error
        );

        if (isMounted) {
          setDriverHistory(
            HISTORICAL_DRIVER_PICK_HISTORY
          );

          setLoadError(
            "Live driver history could not be loaded. Showing historical baseline only."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDriverHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.driverHistoryCard}>
        <h1 style={styles.driverHistoryTitle}>
          🐪 Pick History
        </h1>

        {isLoading && (
          <p style={styles.ownerHistoryStatus}>
            Loading live driver history...
          </p>
        )}

        {loadError && (
          <p style={styles.ownerHistoryStatus}>
            {loadError}
          </p>
        )}

        {driverHistory.map((driver, index) => (
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
              {driver.picks} Picks •{" "}
              {Number(driver.percentage || 0).toFixed(1)}%
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