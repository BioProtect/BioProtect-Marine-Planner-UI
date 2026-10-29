/*
 * Copyright (c) 2020 Andrew Cottam.
 *
 * This file is part of marxanweb/marxan-client
 * (see https://github.com/marxanweb/marxan-client).
 *
 * License: European Union Public Licence V. 1.2, see https://opensource.org/licenses/EUPL-1.2
 */
import React from "react";
import wellknown from "wellknown";

// [minLng, minLat, maxLng, maxLat] from a PostGIS "BOX(minx miny,maxx maxy)"
// string (the extent column of features and activities), or null
export const boxToBounds = (box) => {
  const nums = String(box ?? "").match(/-?\d+(\.\d+)?(e-?\d+)?/gi);
  return nums?.length === 4 ? nums.map(Number) : null;
};

// [minLng, minLat, maxLng, maxLat] from a WKT MultiPolygon envelope, or null
export const envelopeToBounds = (wkt) => {
  const ring = wkt && wellknown.parse(wkt)?.coordinates?.[0]?.[0];
  if (!ring) return null;
  const lngs = ring.map((p) => p[0]);
  const lats = ring.map((p) => p[1]);
  return [
    Math.min(...lngs),
    Math.min(...lats),
    Math.max(...lngs),
    Math.max(...lats),
  ];
};
// returns a boolean if it is a valid number
export const isNumber = (str) => /^\d+$/.test(str);

export const isValidTargetValue = (value) =>
  isNumber(value) && value >= 0 && value <= 100;

export const getArea = (
  value,
  units = "Km2",
  asHtml = false,
  sf = 3,
  addCommas = true,
  sourceUnits = "m2"
) => {
  if (value == null || Number.isNaN(value))
    return asHtml ? <span>—</span> : "—";

  const u = String(units || "Km2").toLowerCase();
  const src = String(sourceUnits || "m2").toLowerCase();

  // Scale factor m² -> target unit
  const toM2 = { m2: 1, ha: 10000, km2: 1000000 };
  const fromM2 = { m2: 1, ha: 0.0001, km2: 0.000001 };

  const valueInM2 = value * (toM2[src] ?? 1);
  const scale = fromM2[u] ?? fromM2["km2"];
  const converted = valueInM2 * scale;
  const roundSig = (num, sig) => {
    if (num === 0) return 0;
    const p = Math.ceil(Math.log10(Math.abs(num)));
    const f = Math.pow(10, sig - p);
    return Math.round(num * f) / f;
  };
  const n = roundSig(converted, sf);

  // Add commas if needed
  const fmt = (num) =>
    addCommas
      ? Number(num).toLocaleString(undefined, {
          maximumFractionDigits: Math.max(0, sf),
        })
      : String(num);

  const unitLabel = u === "m2" ? "m²" : u === "ha" ? "ha" : "km²";
  const text = `${fmt(n)} ${unitLabel}`;

  if (!asHtml) return text;
  // For JSX contexts (like your Typography) return a span:
  return <span>{text}</span>;
};

//zooms the passed map to the passed bounds
export const zoomToBounds = (map, bounds) => {
  // Adjust the bounds if they span the dateline
  let minLng = bounds[0] === -180 ? 179 : bounds[0];
  let maxLng = bounds[2];

  if (bounds[0] < 0 && bounds[2] > 0) {
    // Calculate the span across the meridian vs. the dateline
    const lngSpanAcrossMeridian = bounds[2] - bounds[0];
    const lngSpanAcrossDateline = bounds[0] + 180 + (180 - bounds[2]);

    // Set the minLng and maxLng based on the smaller range
    if (lngSpanAcrossMeridian > lngSpanAcrossDateline) {
      minLng = bounds[2];
      maxLng = bounds[0] + 360;
    }
  }

  // Fit the map bounds with padding and easing
  map.current.fitBounds([minLng, bounds[1], maxLng, bounds[3]], {
    padding: { top: 10, bottom: 10, left: 10, right: 10 },
    easing: (num) => 1, // This line returns 1 for all values, indicating no easing
  });
};

export const generateTableCols = (fields, overrides = {}) => {
  // generate base table columns with default vals. If you want to override the defaults use
  // const overrides = {
  //   name: { numeric: true, disablePadding: false },
  //   source: { disablePadding: false }
  // };
  return fields.map((field) => ({
    ...field,
    numeric: overrides[field.id]?.numeric ?? false,
    disablePadding: overrides[field.id]?.disablePadding ?? true,
  }));
};
