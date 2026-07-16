import React from "react";
import { HISTORICAL_OWNER_HISTORY } from "./ownerHistory";
import {
  ownerHistoryContainer,
  ownerHistoryHeader,
  ownerHistoryTitle,
  ownerHistorySubtitle,
  ownerHistoryGrid,
  ownerHistoryCard,
  ownerHistoryOwnerName,
  ownerHistoryStatBlock,
  ownerHistoryStatLabel,
  ownerHistoryStatDriver,
  ownerHistoryStatValue,
  returnButton,
} from "./styles";

export default function OwnerHistory({ setView }) {
  return (
    <div style={ownerHistoryContainer}>
      <div style={ownerHistoryHeader}>
        <button
          style={returnButton}
          onClick={() => setView("dashboard")}
        >
          ← Dashboard
        </button>

        <h1 style={ownerHistoryTitle}>OWNER HISTORY</h1>

        <p style={ownerHistorySubtitle}>
          League trends, loyalties, and all-time driver value
        </p>
      </div>

      <div style={ownerHistoryGrid}>
        {Object.entries(HISTORICAL_OWNER_HISTORY).map(
          ([owner, data]) => (
            <div key={owner} style={ownerHistoryCard}>
              <h2 style={ownerHistoryOwnerName}>{owner}</h2>

              <div style={ownerHistoryStatBlock}>
                <div style={ownerHistoryStatLabel}>
                  Favorite Driver
                </div>
                <div style={ownerHistoryStatDriver}>
                  {data.favoriteDriver.driver || "-"}
                </div>
                <div style={ownerHistoryStatValue}>
                  {data.favoriteDriver.picks || 0} Picks
                </div>
              </div>

              <div style={ownerHistoryStatBlock}>
                <div style={ownerHistoryStatLabel}>
                  Most Used Tier 1
                </div>
                <div style={ownerHistoryStatDriver}>
                  {data.mostUsedTier1.driver || "-"}
                </div>
                <div style={ownerHistoryStatValue}>
                  {data.mostUsedTier1.picks || 0} Picks
                </div>
              </div>

              <div style={ownerHistoryStatBlock}>
                <div style={ownerHistoryStatLabel}>
                  Most Used Tier 2
                </div>
                <div style={ownerHistoryStatDriver}>
                  {data.mostUsedTier2.driver || "-"}
                </div>
                <div style={ownerHistoryStatValue}>
                  {data.mostUsedTier2.picks || 0} Picks
                </div>
              </div>

              <div style={ownerHistoryStatBlock}>
                <div style={ownerHistoryStatLabel}>
                  Top Scoring Driver
                </div>
                <div style={ownerHistoryStatDriver}>
                  {data.topScoringDriver.driver || "-"}
                </div>
                <div style={ownerHistoryStatValue}>
                  {data.topScoringDriver.points || 0} Points
                </div>
              </div>

              <div style={ownerHistoryStatBlock}>
                <div style={ownerHistoryStatLabel}>
                  Top Tier 1 Scorer
                </div>
                <div style={ownerHistoryStatDriver}>
                  {data.topScoringTier1.driver || "-"}
                </div>
                <div style={ownerHistoryStatValue}>
                  {data.topScoringTier1.points || 0} Points
                </div>
              </div>

              <div style={ownerHistoryStatBlock}>
                <div style={ownerHistoryStatLabel}>
                  Top Tier 2 Scorer
                </div>
                <div style={ownerHistoryStatDriver}>
                  {data.topScoringTier2.driver || "-"}
                </div>
                <div style={ownerHistoryStatValue}>
                  {data.topScoringTier2.points || 0} Points
                </div>
              </div>

              <div style={ownerHistoryStatBlock}>
                <div style={ownerHistoryStatLabel}>
                  Best Driver Value
                </div>
                <div style={ownerHistoryStatDriver}>
                  {data.bestValueDriver.driver || "-"}
                </div>
                <div style={ownerHistoryStatValue}>
                  {(data.bestValueDriver.pointsPerPick || 0).toFixed(
                    1
                  )}{" "}
                  Pts/Pick
                </div>
                <div style={ownerHistoryStatValue}>
                  {data.bestValueDriver.totalPoints || 0} Points
                </div>
                <div style={ownerHistoryStatValue}>
                  {data.bestValueDriver.picks || 0} Picks
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}