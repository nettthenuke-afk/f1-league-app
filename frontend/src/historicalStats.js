export const HISTORICAL_CHAMPIONS = [
  { year: 2022, champion: "Sam", points: 140 },
  { year: 2023, champion: "Jake", points: 334 },
  { year: 2024, champion: "Mike", points: 386 },
  { year: 2025, champion: "Tyler", points: 381 },
];

export const HISTORICAL_LIFETIME_POINTS = {
  Mike: 1214,
  Travis: 1181,
  Sam: 1166,
  Jake: 1111,
  Rocky: 1049,
  Tyler: 710,
};

export const HISTORICAL_WEEKLY_WINS = {
  Travis: 28,
  Sam: 23,
  Jake: 21,
  Mike: 21,
  Rocky: 17,
  Tyler: 8,
};

export const HISTORICAL_WEEKLY_LAST_PLACES = {
  Rocky: 25,
  Sam: 24,
  Travis: 22,
  Mike: 21,
  Jake: 17,
  Tyler: 8,
};

export const HISTORICAL_ZERO_POINT_WEEKS = {
  Rocky: 8,
  Sam: 7,
  Mike: 6,
  Travis: 6,
  Jake: 5,
  Tyler: 4,
};

export function combineChampions(liveChampions = []) {
  const championMap = {};

  HISTORICAL_CHAMPIONS.forEach((season) => {
    championMap[season.year] = season;
  });

  liveChampions.forEach((season) => {
    const year = Number(season.year);

    if (!championMap[year]) {
      championMap[year] = {
        year,
        champion: season.champion,
        points: season.points,
      };
    }
  });

  return Object.values(championMap).sort(
    (a, b) => a.year - b.year
  );
}

export function combineBaselineWithLive(
  liveRows = [],
  baseline = {},
  valueKey
) {
  const totals = { ...baseline };

  liveRows.forEach((row) => {
    const username = row.username;
    const liveValue = Number(row[valueKey]) || 0;

    totals[username] = (totals[username] || 0) + liveValue;
  });

  return Object.entries(totals)
    .map(([username, value]) => ({
      username,
      value,
    }))
    .sort((a, b) => {
      const diff = b[valueKey] - a[valueKey];

      if (diff !== 0) {
        return diff;
      }

      return a.username.localeCompare(b.username);
    });
}