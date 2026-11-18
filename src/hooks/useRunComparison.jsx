// Cross-project run comparison on the map (server: action=compare-runs,
// db/functions/compare_runs.sql).
//
// Each compared project's grid gets its own results fill layer, stacked
// coarse below fine, so where a fine grid sits inside a coarse one the fine
// cells (coloured by the average) cover it and the rest of the coarse cell
// shows that project alone. The loaded project reuses its own results layer.
import { useCompareRunsQuery } from '@slices/prioritizrApiSlice'
import mapboxgl from 'mapbox-gl'
import { useEffect, useMemo, useRef } from 'react'
import { useSelector } from 'react-redux'
import CONSTANTS, { PALETTE } from '../bpVars'
import { getGridTilesUrl } from '../config/api'

/** Colour for the i-th project in a comparison (server order, coarse first). */
export const projectColour = i => PALETTE.features[i % PALETTE.features.length]

function hexRgb(hex) {
  const n = Number.parseInt(hex.slice(1), 16)
  return [n >> 16, (n >> 8) & 255, n & 255]
}
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t))
const rgb = c => `rgb(${c.join(',')})`

// avg_pct 0-100 on the results ramp, as the single-project frequency map
function rampColour(pct) {
  const stops = PALETTE.results.map(hexRgb)
  const x = Math.min(Math.max(pct / 100, 0), 1) * (stops.length - 1)
  const i = Math.min(Math.floor(x), stops.length - 2)
  return rgb(mix(stops[i], stops[i + 1], x - i))
}

// one project alone: its colour, from pale (few runs) to full (every run)
function soloColour(hex, pct) {
  return rgb(mix([255, 255, 255], hexRgb(hex), 0.25 + 0.75 * pct / 100))
}

/** The run ids being compared (sorted), or [] when nothing from another project is added. */
export function useComparedRunIds() {
  const selected = useSelector(s => s.prioritizr.selectedRunIds)
  const compared = useSelector(s => s.prioritizr.comparedRunIds)
  return useMemo(
    () => compared.length
      ? [
          ...selected,
          ...compared,
        ].sort((a, b) => a - b)
      : [],
    [selected, compared],
  )
}

export default function useRunComparison(mapRef, puLayerIdsRef) {
  const projectId = useSelector(s => s.project.activeProjectId)
  const runIds = useComparedRunIds()
  // currentData: never paint the previous selection's result while this one loads
  const { currentData: data } = useCompareRunsQuery(runIds, { skip: !runIds.length })
  const addedRef = useRef({ layers: [], sources: [], off: [] })

  useEffect(() => {
    const map = mapRef.current
    const ids = puLayerIdsRef.current
    if (!map || !ids?.resultsLayerId || !map.getLayer(ids.resultsLayerId))
      return

    const clear = () => {
      addedRef.current.off.forEach(f => f())
      addedRef.current.layers.forEach(l => map.getLayer(l) && map.removeLayer(l))
      addedRef.current.sources.forEach(s => map.getSource(s) && map.removeSource(s))
      addedRef.current = { layers: [], sources: [], off: [] }
    }
    clear()
    if (!runIds.length || !data?.projects) {
      // back to the single-project map; App repaints the frequency layer
      map.setPaintProperty(ids.resultsLayerId, 'fill-opacity', CONSTANTS.RESULTS_LAYER_OPACITY)
      return
    }

    const projects = data.projects
    const names = Object.fromEntries(projects.map(p => [
      String(p.id),
      p.name,
    ]))
    const loaded = projects.find(p => p.id === projectId)
    const loadedRes = loaded?.resolution ?? Infinity
    const styleLayers = map.getStyle().layers.map(l => l.id)
    const aboveResults = styleLayers[styleLayers.indexOf(ids.resultsLayerId) + 1]
    const lookup = {} // layer id -> { h3: [avg, shares] }

    // the loaded project's layer stays put; with none of its runs chosen it is blank
    if (!loaded)
      map.setPaintProperty(ids.resultsLayerId, 'fill-color', 'rgba(0,0,0,0)')

    const colourOf = Object.fromEntries(projects.map((p, i) => [
      String(p.id),
      projectColour(i),
    ]))

    projects.forEach((p) => {
      let layerId = ids.resultsLayerId
      if (p.id !== projectId) {
        layerId = `cmp_layer_${p.id}`
        let sourceId = ids.sourceId
        if (p.grid !== ids.sourceLayerName) {
          sourceId = `cmp_src_${p.grid}`
          if (!map.getSource(sourceId)) {
            map.addSource(sourceId, {
              type: 'vector',
              url: getGridTilesUrl(p.grid),
              promoteId: 'h3_index',
            })
            addedRef.current.sources.push(sourceId)
          }
        }
        map.addLayer({
          'id': layerId,
          'type': 'fill',
          'source': sourceId,
          'source-layer': p.grid,
          'metadata': { name: `Results: ${p.name}` },
          'paint': { 'fill-color': 'rgba(0,0,0,0)' },
        }, p.resolution < loadedRes
          ? ids.resultsLayerId
          : aboveResults)
        addedRef.current.layers.push(layerId)
      }

      const cells = data.cells[String(p.id)] ?? []
      lookup[layerId] = Object.fromEntries(cells.map(([h3, avg, shares]) => [
        h3,
        [avg, shares],
      ]))
      // opaque, so a coarse layer underneath never shows through a fine one
      map.setPaintProperty(layerId, 'fill-opacity', 1)
      map.setPaintProperty(layerId, 'fill-outline-color', 'rgba(0,0,0,0)')
      if (!cells.length) {
        map.setPaintProperty(layerId, 'fill-color', 'rgba(0,0,0,0)')
        return
      }
      const match = [
        'match',
        [
          'to-string',
          ['get', 'h3_index'],
        ],
      ]
      for (const [h3, avg, shares] of cells) {
        // one project picked it (alone, or where the others covering it did
        // not): that project's colour, so "only A" and "only B" stay apart.
        // The ramp is for cells two or more projects picked.
        const picked = Object.entries(shares).filter(([, pct]) => pct > 0)
        match.push(h3, picked.length === 1
          ? soloColour(colourOf[picked[0][0]], picked[0][1])
          : rampColour(avg))
      }
      match.push('rgba(0,0,0,0)')
      map.setPaintProperty(layerId, 'fill-color', match)
    })

    // hover: each project's share of the cell under the pointer
    const popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false })
    Object.keys(lookup).forEach((layerId) => {
      const move = (e) => {
        // the topmost compared layer under the pointer
        const top = map.queryRenderedFeatures(e.point, {
          layers: Object.keys(lookup),
        })
          .find(f => lookup[f.layer.id]?.[f.properties.h3_index])
        if (!top || top.layer.id !== layerId)
          return
        const [avg, shares] = lookup[layerId][top.properties.h3_index]
        // text nodes, not setHTML: project names are user input
        const box = document.createElement('div')
        const line = (text, bold) => {
          const el = document.createElement('div')
          el.textContent = text
          if (bold)
            el.style.fontWeight = 700
          box.appendChild(el)
        }
        const entries = Object.entries(shares)
        entries.forEach(([pid, pct]) => line(`${names[pid] ?? pid}: ${pct}%`))
        if (entries.length > 1)
          line(`Average: ${avg}%`, true)
        popup.setLngLat(e.lngLat).setDOMContent(box).addTo(map)
      }
      const leave = () => popup.remove()
      map.on('mousemove', layerId, move)
      map.on('mouseleave', layerId, leave)
      addedRef.current.off.push(() => {
        map.off('mousemove', layerId, move)
        map.off('mouseleave', layerId, leave)
      })
    })
    addedRef.current.off.push(() => popup.remove())
  }, [
    data,
    runIds,
    projectId,
    mapRef,
    puLayerIdsRef,
  ])
}
