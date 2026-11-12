const isLocalDev = ['localhost', '127.0.0.1'].includes(
  window.location.hostname,
)

export function getApiBaseUrl() {
  return isLocalDev
    ? 'http://localhost:8080/server/'
    : `${window.location.origin}/server/`
}

export function getWsBaseUrl() {
  if (isLocalDev) {
    return `ws://localhost:8080/server/`
  }

  const wsProtocol = window.location.protocol === 'https:'
    ? 'wss:'
    : 'ws:'
  return `${wsProtocol}//${window.location.host}/server/`
}

function getTilesBaseUrl() {
  // Martin tileserver
  return isLocalDev
    ? 'http://localhost:3000/' // dev: talk to Martin directly
    : `${window.location.origin}/tiles/` // prod: Nginx proxy
}

/**
 * One Martin function source serves every feature and activity table
 * (server/db/functions/layer_tiles.sql)
 */
export function getLayerTilesUrl(tableName) {
  return `${getTilesBaseUrl()}layer_tiles?layer=${encodeURIComponent(tableName)}`
}

/**
 * WDPA reference layer (server/db/functions/wdpa_tiles.sql). A tiles template
 * rather than a TileJSON url, so the source can carry the WDPA attribution.
 */
export function getWdpaTilesTemplate() {
  return `${getTilesBaseUrl()}wdpa_tiles/{z}/{x}/{y}`
}

/** A user-uploaded reference layer (server/db/functions/reference_layers.sql) */
export function getReferenceTilesTemplate(layerId) {
  return `${getTilesBaseUrl()}reference_tiles/{z}/{x}/{y}?layer=${layerId}`
}

/** One Martin function source serves every planning grid (server/db/functions/grid_tiles.sql) */
export function getGridTilesUrl(gridName) {
  return `${getTilesBaseUrl()}grid_tiles?layer=${encodeURIComponent(gridName)}`
}
