import React from "react";
import { HISTORICAL_OWNER_HISTORY } from "./ownerHistory";
import * as styles from "./styles";

export default function OwnerHistory({ setView }) {
  return (
    <div>
      <h1>OWNER HISTORY</h1>

      {Object.entries(HISTORICAL_OWNER_HISTORY).map(
        ([owner, data]) => (
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
              {data.favoriteDriver.driver} (
              {data.favoriteDriver.picks} picks)
            </p>

            <p>
              <strong>Most Used Tier 1:</strong>{" "}
              {data.mostUsedTier1.driver} (
              {data.mostUsedTier1.picks} picks)
            </p>

            <p>
              <strong>Most Used Tier 2:</strong>{" "}
              {data.mostUsedTier2.driver} (
              {data.mostUsedTier2.picks} picks)
            </p>

            <p>
              <strong>Top Scoring Driver:</strong>{" "}
              {data.topScoringDriver.driver} (
              {data.topScoringDriver.points} pts)
            </p>

            <p>
              <strong>Top Tier 1 Scorer:</strong>{" "}
              {data.topScoringTier1.driver} (
              {data.topScoringTier1.points} pts)
            </p>

            <p>
              <strong>Top Tier 2 Scorer:</strong>{" "}
              {data.topScoringTier2.driver} (
              {data.topScoringTier2.points} pts)
            </p>

            <p>
              <strong>Best Driver Value:</strong>{" "}
              {data.bestValueDriver.driver}
            </p>

            <p>
              {data.bestValueDriver.pointsPerPick} pts/pick
            </p>
          </div>
        )
      )}

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