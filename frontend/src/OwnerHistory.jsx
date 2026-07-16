import React from "react";
import { HISTORICAL_OWNER_HISTORY } from "./ownerHistory";

export default function OwnerHistory({ setView }) {
  return (
    <div>
      <button onClick={() => setView("dashboard")}>
        Dashboard
      </button>

      <h1>Owner History</h1>

      {Object.keys(HISTORICAL_OWNER_HISTORY).map((owner) => (
        <div key={owner}>
          {owner}
        </div>
      ))}
    </div>
  );
}