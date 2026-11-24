import { getApiBaseUrl } from '@config/api'
import useAppSnackbar from '@hooks/useAppSnackbar'
import { projectColour, useComparedRunIds } from '@hooks/useRunComparison'

import DownloadIcon from '@mui/icons-material/Download'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Tooltip from '@mui/material/Tooltip'
import { useGetAllFeaturesQuery } from '@slices/featureSlice'
import {
  prioritizrApiSlice,
  useCompareRunsQuery,
  useGetFeatureRepresentationQuery,
  useListPrioritizrRunsQuery,
} from '@slices/prioritizrApiSlice'
import { setActiveResultsTab } from '@slices/uiSlice'
import { generatePdfReport } from '@utils/generatePdfReport'
import { useCallback, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PanelHeader from '../BPComponents/PanelHeader'
import Log from './Log'
import MapLegend from './MapLegend'
import RunsTab from './RunsTab'

const TAB_VALUES = ['legend', 'runs', 'log']

// achieved % and how many of the runs met the target, from a
// get-feature-representation row
function featureResult(row, target) {
  if (!row)
    return { achieved: null, metCount: 0, runCount: 0 }
  const perRun = Array.isArray(row.per_run) && row.per_run.length > 0
    ? row.per_run.map(p => p.represented_percent)
    : [row.represented_percent]
  return {
    achieved: row.represented_percent,
    metCount: perRun.filter(p => p >= target).length,
    runCount: perRun.length,
  }
}

function ResultsPanel(props) {
  const { map, project, projectFeatures, metadata } = props
  const { showMessage } = useAppSnackbar()

  const dispatch = useDispatch()
  const { dialogStates, importLog, activeResultsTab, uploadedActivities }
    = useSelector(state => state.ui)
  const projectId = useSelector(s => s.project.activeProjectId)
  const selectedRunIds = useSelector(s => s.prioritizr.selectedRunIds)
  const comparedIds = useComparedRunIds()
  const { currentData: comparison } = useCompareRunsQuery(comparedIds, {
    skip: !comparedIds.length,
  })

  const { data: runsResp } = useListPrioritizrRunsQuery(projectId, {
    skip: !projectId,
  })
  const runs = useMemo(() => runsResp?.data ?? [], [runsResp?.data])

  // Feature name lookup (project features may not carry `name`)
  const { data: allFeaturesResp } = useGetAllFeaturesQuery()
  const allFeatures = useMemo(() => allFeaturesResp?.data ?? [], [allFeaturesResp?.data])

  // Per-feature achieved % from the selected Prioritizr runs (mirrors
  // FeaturesList.jsx - same stable sort so the RTK Query cache hits).
  const sortedRunIds = useMemo(
    () => [...selectedRunIds].sort((a, b) => a - b),
    [selectedRunIds],
  )
  const { data: reprResp } = useGetFeatureRepresentationQuery(sortedRunIds, {
    skip: sortedRunIds.length === 0,
  })
  const reprByFeatureUniqueId = useMemo(() => {
    if (sortedRunIds.length === 0 || !reprResp?.data)
      return {}
    return Object.fromEntries(reprResp.data.map(r => [r.feature_unique_id, r]))
  }, [reprResp, sortedRunIds])

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // PDF report download
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const [pdfLoading, setPdfLoading] = useState(false)

  const handleDownloadPdf = useCallback(async () => {
    const comparing = comparedIds.length > 0
    if (selectedRunIds.length === 0 && !comparing) {
      showMessage(
        'Please select at least one run to include in the report.',
        'error',
      )
      return
    }
    if (comparing && !comparison) {
      showMessage('The comparison is still loading - try again in a moment.', 'warning')
      return
    }
    setPdfLoading(true)

    // one-off fetch through the RTK Query cache, for the compared projects
    const fetchOnce = async (endpoint, arg) => {
      const q = dispatch(endpoint.initiate(arg))
      try {
        return await q.unwrap()
      }
      finally {
        q.unsubscribe()
      }
    }

    try {
      // Capture map canvas (requires preserveDrawingBuffer: true on the map)
      let mapImageDataUrl = null
      if (map?.current) {
        map.current.triggerRepaint()
        await new Promise(resolve => map.current.once('render', resolve))
        mapImageDataUrl = map.current.getCanvas().toDataURL('image/png')
      }

      // alias from getAllFeatures - `name` is the auto-generated table name
      const featureAliasById = new Map(
        allFeatures.map(f => [f.id ?? f.feature_unique_id, f.alias]),
      )
      const prettify = s => (s
        ? String(s).replace(/_/g, ' ')
        : s)

      // the loaded project: all its features, results from its selected runs
      const loaded = {
        id: projectId,
        name: project?.name ?? 'This project',
        grid: metadata?.pu_alias,
        runs: runs.filter(r => selectedRunIds.includes(r.id)),
        features: (projectFeatures ?? []).map((f) => {
          const uid = f.feature_unique_id ?? f.id
          const tgt = Number(f.target_value ?? 0)
          return {
            uid,
            name: prettify(f.alias ?? featureAliasById.get(uid) ?? `Feature ${uid}`),
            target: f.target_value ?? null,
            ...featureResult(reprByFeatureUniqueId[uid], tgt),
          }
        }),
      }

      // comparing: every project on the map, in the map's colour order
      const projects = comparing
        ? await Promise.all(comparison.projects.map(async (cp, i) => {
            const colour = projectColour(i)
            if (cp.id === projectId) {
              return {
                ...loaded,
                colour,
                grid: loaded.grid ?? cp.grid_alias,
                resolution: cp.resolution,
              }
            }
            const [runsData, reprData] = await Promise.all([
              fetchOnce(prioritizrApiSlice.endpoints.listPrioritizrRuns, cp.id),
              fetchOnce(prioritizrApiSlice.endpoints.getFeatureRepresentation, cp.run_ids),
            ])
            return {
              id: cp.id,
              name: cp.name,
              grid: cp.grid_alias ?? cp.grid,
              resolution: cp.resolution,
              colour,
              runs: (runsData?.data ?? []).filter(r => cp.run_ids.includes(r.id)),
              features: (reprData?.data ?? []).map(r => ({
                uid: r.feature_unique_id,
                name: prettify(featureAliasById.get(r.feature_unique_id) ?? r.feature_name),
                target: r.target_value ?? null,
                ...featureResult(r, Number(r.target_value ?? 0)),
              })),
            }
          }))
        : [loaded]

      await generatePdfReport({
        project,
        metadata,
        activities: uploadedActivities ?? [],
        projects,
        comparing,
        mapImageDataUrl,
      })
    }
    catch (err) {
      console.error('PDF report failed:', err)
      showMessage(`Could not build the report: ${err?.message ?? err}`, 'error')
    }
    finally {
      setPdfLoading(false)
    }
  }, [
    showMessage,
    dispatch,
    map,
    project,
    projectId,
    metadata,
    projectFeatures,
    allFeatures,
    reprByFeatureUniqueId,
    uploadedActivities,
    runs,
    selectedRunIds,
    comparedIds,
    comparison,
  ])

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // GIS data download (shapefile or geopackage, zipped with sidecar CSVs)
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const [gisLoading, setGisLoading] = useState(false)
  const [gisAnchor, setGisAnchor] = useState(null)
  const authToken = useSelector(s => s.auth?.token)

  const handleDownloadGis = useCallback(
    async (fmt) => {
      setGisAnchor(null)
      if (selectedRunIds.length === 0) {
        showMessage(
          'Please select at least one run to include in the export.',
          'error',
        )
        return
      }
      if (!projectId)
        return

      setGisLoading(true)
      try {
        const url
          = `${getApiBaseUrl()}prioritizr?action=export-runs`
            + `&project-id=${projectId}`
            + `&run-ids=${selectedRunIds.join(',')}`
            + `&format=${fmt}`

        const headers = {}
        if (authToken)
          headers.Authorization = `Bearer ${authToken}`

        const resp = await fetch(url, {
          method: 'GET',
          credentials: 'include',
          headers,
        })
        if (!resp.ok) {
          // Server sends JSON on error
          let msg = `Download failed (${resp.status})`
          try {
            const j = await resp.json()
            if (j?.error)
              msg = j.error
          }
          catch {
            /* not JSON - keep generic message */
          }
          throw new Error(msg)
        }
        const blob = await resp.blob()

        // Prefer the filename the server sent in Content-Disposition;
        // fall back to a sensible default if the header is missing.
        const cd = resp.headers.get('Content-Disposition') || ''
        const match = cd.match(/filename="?([^"]+)"?/)
        const filename = match?.[1] || `project_${projectId}_runs_${fmt}.zip`

        const blobUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = filename
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(blobUrl)
      }
      catch (err) {
        showMessage(err.message || 'Download failed', 'error')
      }
      finally {
        setGisLoading(false)
      }
    },
    [
      projectId,
      selectedRunIds,
      authToken,
      showMessage,
    ],
  )
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const currentTabIndex = Math.max(0, TAB_VALUES.indexOf(activeResultsTab))
  const handleTabChange = (_e, idx) =>
    dispatch(setActiveResultsTab(TAB_VALUES[idx] ?? 'legend'))

  const conditionalEndIcon = (loading) => {
    return loading
      ? (
          <CircularProgress size={18} sx={{ color: 'white' }} />
        )
      : (
          <DownloadIcon fontSize="small" />
        )
  }

  if (!dialogStates.resultsPanelOpen)
    return null

  return (
    <div
      className="resultsPanel"
      style={{
        position: 'absolute',
        right: '60px',
        top: '80px',
        width: '400px',
        maxHeight: 'calc(100vh - 120px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Paper
        elevation={2}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '100%',
          overflow: 'hidden',
        }}
      >
        <PanelHeader
          actions={(
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Download PDF report">
                <span>
                  <Button
                    size="small"
                    onClick={handleDownloadPdf}
                    disabled={pdfLoading}
                    sx={{
                      'color': 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.15)',
                      },
                    }}
                    endIcon={conditionalEndIcon(pdfLoading)}
                  >
                    PDF
                  </Button>
                </span>
              </Tooltip>
              <Tooltip title="Download GIS data (shapefile or geopackage) for the selected runs">
                <span>
                  <Button
                    size="small"
                    onClick={e => setGisAnchor(e.currentTarget)}
                    disabled={gisLoading}
                    sx={{
                      'color': 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.15)',
                      },
                    }}
                    endIcon={conditionalEndIcon(gisLoading)}
                  >
                    GIS
                  </Button>
                </span>
              </Tooltip>
              <Menu
                anchorEl={gisAnchor}
                open={Boolean(gisAnchor)}
                onClose={() => setGisAnchor(null)}
              >
                <MenuItem onClick={() => handleDownloadGis('shp')}>
                  Shapefile (.zip)
                </MenuItem>
                <MenuItem onClick={() => handleDownloadGis('gpkg')}>
                  GeoPackage (.gpkg in .zip)
                </MenuItem>
              </Menu>
            </Box>
          )}
        >
          Results
        </PanelHeader>

        <Tabs
          value={currentTabIndex}
          onChange={handleTabChange}
          sx={{
            'px': 2,
            'minHeight': 40,
            'borderBottom': 1,
            'borderColor': 'brand.border',
            '& .MuiTabs-flexContainer': { gap: 2.5 },
            '& .MuiTabs-indicator': { height: 2 },
            '& .MuiTab-root': {
              textTransform: 'none',
              minWidth: 0,
              minHeight: 40,
              px: 0,
              fontSize: 14,
              fontWeight: 600,
              color: 'brand.muted',
            },
            '& .MuiTab-root.Mui-selected': { color: 'primary.main' },
          }}
        >
          <Tab label="Legend" />
          <Tab label="Runs" />
          <Tab label="Log" />
        </Tabs>

        <div style={{ overflow: 'auto', flex: 1 }}>
          {currentTabIndex === 0 && (
            <MapLegend
              changeOpacity={props.changeOpacity}
              visibleLayers={props.visibleLayers}
              costsLoading={props.costsLoading}
              brew={props.brew}
            />
          )}

          {currentTabIndex === 1 && <RunsTab />}

          {currentTabIndex === 2 && <Log messages={importLog} />}
        </div>
      </Paper>
    </div>
  )
}

export default ResultsPanel
