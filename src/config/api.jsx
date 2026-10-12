const isLocalDev = ["localhost", "127.0.0.1"].includes(
  window.location.hostname,
);

export function getApiBaseUrl() {
  return isLocalDev
    ? "http://localhost:8080/server/"
    : window.location.origin + "/server/";
}

export function getWsBaseUrl() {
  if (isLocalDev) {
    return `ws://localhost:8080/server/`;
  }

  const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${wsProtocol}//${window.location.host}/server/`;
}

export function getTilesBaseUrl() {
  // Martin tileserver
  return isLocalDev
    ? "http://localhost:3000/" // dev: talk to Martin directly
    : window.location.origin + "/tiles/"; // prod: Nginx proxy
}

// One Martin function source serves every feature and activity table
// (server/db/functions/layer_tiles.sql)
export function getLayerTilesUrl(tableName) {
  return `${getTilesBaseUrl()}layer_tiles?layer=${encodeURIComponent(tableName)}`;
}

// One Martin function source serves every planning grid (server/db/functions/grid_tiles.sql)
export function getGridTilesUrl(gridName) {
  return `${getTilesBaseUrl()}grid_tiles?layer=${encodeURIComponent(gridName)}`;
}
