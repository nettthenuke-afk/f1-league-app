import {
  HISTORICAL_DRIVER_PICK_HISTORY
} from "./driverHistory";

export const HISTORICAL_DRIVER_PICK_HISTORY_TOTAL_RACES = 99;

export const HISTORICAL_DRIVER_PICK_HISTORY = [
  { driver: "Verstappen", picks: 98, pickedRaces: 97, percentage: 98.0 },
  { driver: "Leclerc", picks: 83, pickedRaces: 82, percentage: 82.8 },
  { driver: "Norris", picks: 74, pickedRaces: 74, percentage: 74.7 },
  { driver: "Gasly", picks: 71, pickedRaces: 70, percentage: 70.7 },
  { driver: "Russell", picks: 67, pickedRaces: 66, percentage: 66.7 },
  { driver: "Hulkenberg", picks: 58, pickedRaces: 58, percentage: 58.6 },
  { driver: "Piastri", picks: 57, pickedRaces: 57, percentage: 57.6 },
  { driver: "Ocon", picks: 56, pickedRaces: 56, percentage: 56.6 },
  { driver: "Perez", picks: 54, pickedRaces: 53, percentage: 53.5 },
  { driver: "Hamilton", picks: 49, pickedRaces: 49, percentage: 49.5 },
  { driver: "Sainz", picks: 48, pickedRaces: 48, percentage: 48.5 },
  { driver: "Tsunoda", picks: 44, pickedRaces: 44, percentage: 44.4 },
  { driver: "Bottas", picks: 42, pickedRaces: 41, percentage: 41.4 },
  { driver: "Alonso", picks: 41, pickedRaces: 41, percentage: 41.4 },
  { driver: "Albon", picks: 39, pickedRaces: 39, percentage: 39.4 },
  { driver: "Magnussen", picks: 39, pickedRaces: 39, percentage: 39.4 },
  { driver: "Lawson", picks: 25, pickedRaces: 25, percentage: 25.3 },
  { driver: "Hadjar", picks: 24, pickedRaces: 24, percentage: 24.2 },
  { driver: "Stroll", picks: 23, pickedRaces: 23, percentage: 23.2 },
  { driver: "Bearman", picks: 21, pickedRaces: 21, percentage: 21.2 },
  { driver: "Ricciardo", picks: 21, pickedRaces: 21, percentage: 21.2 },
  { driver: "Antonelli", picks: 16, pickedRaces: 16, percentage: 16.2 },
  { driver: "Vettel", picks: 15, pickedRaces: 15, percentage: 15.2 },
  { driver: "Zhou", picks: 15, pickedRaces: 15, percentage: 15.2 },
  { driver: "Colapinto", picks: 9, pickedRaces: 9, percentage: 9.1 },
  { driver: "Bortoleto", picks: 6, pickedRaces: 6, percentage: 6.1 },
  { driver: "Schumacher", picks: 6, pickedRaces: 6, percentage: 6.1 },
  { driver: "Lindblad", picks: 5, pickedRaces: 5, percentage: 5.1 },
  { driver: "Sargeant", picks: 2, pickedRaces: 2, percentage: 2.0 },
  { driver: "De Vries", picks: 1, pickedRaces: 1, percentage: 1.0 },
];

export function combineDriverPickHistory(
  liveRows = [],
  liveRaceCount = 0
) {
  const totals = {};

  HISTORICAL_DRIVER_PICK_HISTORY.forEach((row) => {
    totals[row.driver] = {
      driver: row.driver,
      picks: row.picks,
      pickedRaces: row.pickedRaces,
    };
  });

  liveRows.forEach((row) => {
    const driver = row.driver;

    if (!totals[driver]) {
      totals[driver] = {
        driver,
        picks: 0,
        pickedRaces: 0,
      };
    }

    totals[driver].picks += Number(row.picks) || 0;
    totals[driver].pickedRaces += Number(row.pickedRaces) || 0;
  });

  const totalRaceCount =
    HISTORICAL_DRIVER_PICK_HISTORY_TOTAL_RACES + liveRaceCount;

  return Object.values(totals)
    .map((row) => ({
      ...row,
      percentage:
        totalRaceCount > 0
          ? Number(
              (
                (row.pickedRaces / totalRaceCount) *
                100
              ).toFixed(1)
            )
          : 0,
    }))
    .sort((a, b) => {
      if (b.picks !== a.picks) {
        return b.picks - a.picks;
      }

      return a.driver.localeCompare(b.driver);
    });
}