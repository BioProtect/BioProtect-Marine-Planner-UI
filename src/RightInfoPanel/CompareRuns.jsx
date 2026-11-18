// "Add runs from another project…": picks runs from other projects to
// overlay on the loaded one (hooks/useRunComparison.jsx draws them).
import { projectColour, useComparedRunIds } from '@hooks/useRunComparison'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import {
  useCompareRunsQuery,
  useGetFeatureRepresentationQuery,
  useListComparableProjectsQuery,
  useListPrioritizrRunsQuery,
} from '@slices/prioritizrApiSlice'
import { toggleComparedRun } from '@slices/prioritizrSlice'
import { Fragment, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { PALETTE } from '../bpVars'

const FINISHED = new Set(['done', 'Finished'])
const runName = run => run.label?.trim() || `Run ${run.id}`

// One project's features for its chosen runs, as the loaded project's
// feature list shows them; one request per project (the server rejects a mix).
function ProjectFeatures({ runIds }) {
  const { data, isFetching } = useGetFeatureRepresentationQuery(runIds)
  if (isFetching && !data)
    return <Typography variant="caption" color="text.secondary">Loading features…</Typography>
  const rows = data?.data ?? []
  if (!rows.length)
    return <Typography variant="caption" color="text.secondary">No features</Typography>
  return rows.map(f => (
    <Box key={f.feature_unique_id} sx={{ display: 'flex', gap: 1, pl: 2.5 }}>
      <Typography variant="caption" noWrap title={f.feature_name} sx={{ flex: 1, minWidth: 0 }}>
        {String(f.feature_name ?? '').replace(/_/g, ' ')}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          fontFamily: 'monospace',
          color: Number(f.represented_percent) >= Number(f.target_value ?? 0)
            ? 'success.main'
            : 'error.main',
        }}
      >
        {Number(f.represented_percent).toFixed(1)}
        % /
        {' '}
        {f.target_value ?? '–'}
        %
      </Typography>
    </Box>
  ))
}

function ComparisonLegend() {
  const loadedId = useSelector(s => s.project.activeProjectId)
  const [featuresFor, setFeaturesFor] = useState(null)
  const runIds = useComparedRunIds()
  const { currentData, isFetching } = useCompareRunsQuery(runIds, { skip: !runIds.length })
  if (!runIds.length)
    return null
  return (
    <Box sx={{
      px: 1.5,
      py: 1,
      borderBottom: 1,
      borderColor: 'brand.border',
    }}
    >
      <Typography variant="caption" fontWeight={700} sx={{ display: 'block', letterSpacing: '0.06em' }}>
        COMPARING PROJECTS
      </Typography>
      {isFetching && !currentData && (
        <Typography variant="caption" color="text.secondary">Comparing runs…</Typography>
      )}
      {currentData?.projects.map((p, i) => (
        <Fragment key={p.id}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mt: 0.5,
            }}
          >
            <Box sx={{
              width: 12,
              height: 12,
              borderRadius: 0.5,
              flex: 'none',
              backgroundColor: projectColour(i),
            }}
            />
            <Typography variant="caption" noWrap title={p.name} sx={{ flex: 1, minWidth: 0 }}>
              {p.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
              {p.run_ids.length}
              {' '}
              run
              {p.run_ids.length === 1
                ? ''
                : 's'}
            </Typography>
            {p.id !== loadedId && (
              <Button
                size="small"
                sx={{ fontSize: '0.65rem', minWidth: 0, p: 0 }}
                onClick={() => setFeaturesFor(featuresFor === p.id
                  ? null
                  : p.id)}
              >
                {featuresFor === p.id
                  ? 'Hide features'
                  : 'Features'}
              </Button>
            )}
          </Box>
          {featuresFor === p.id && <ProjectFeatures runIds={p.run_ids} />}
        </Fragment>
      ))}
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        Picked by one project: its colour. Picked by more than one: average share of runs
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography variant="caption" color="text.secondary">0%</Typography>
        <Box sx={{
          flex: 1,
          height: 14,
          borderRadius: 1,
          border: '1px solid #ccd6db',
          background: `linear-gradient(to right, ${PALETTE.results.join(', ')})`,
        }}
        />
        <Typography variant="caption" color="text.secondary">100%</Typography>
      </Box>
    </Box>
  )
}

function OtherProjectRuns({ projectId }) {
  const dispatch = useDispatch()
  const compared = useSelector(s => s.prioritizr.comparedRunIds)
  const { data, isFetching } = useListPrioritizrRunsQuery(projectId)
  const runs = (data?.data ?? []).filter(r => FINISHED.has(r.status))
  if (isFetching && !data)
    return <Typography variant="caption" sx={{ px: 1.5 }}>Loading runs…</Typography>
  return runs.map(run => (
    <Box
      key={run.id}
      onClick={() => dispatch(toggleComparedRun(run.id))}
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 1,
        cursor: 'pointer',
        borderBottom: '1px solid #edf1f4',
      }}
    >
      <Checkbox size="small" checked={compared.includes(run.id)} sx={{ p: 0.5 }} />
      <Typography noWrap title={runName(run)} sx={{ fontSize: '0.78rem', flex: 1, minWidth: 0 }}>
        {runName(run)}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
        {new Date(run.created_at).toLocaleDateString('en-GB')}
      </Typography>
    </Box>
  ))
}

export default function CompareRuns() {
  const projectId = useSelector(s => s.project.activeProjectId)
  const [open, setOpen] = useState(false)
  const [otherId, setOtherId] = useState('')
  const { data, isFetching } = useListComparableProjectsQuery(projectId, { skip: !open || !projectId })
  const projects = data?.data ?? []

  return (
    <Box>
      <ComparisonLegend />
      <Box sx={{
        px: 1,
        py: 0.5,
        borderBottom: 1,
        borderColor: 'brand.border',
      }}
      >
        <Button size="small" onClick={() => setOpen(o => !o)} sx={{ fontSize: '0.7rem' }}>
          {open ? 'Hide other projects' : 'Add runs from another project…'}
        </Button>
        {open && (
          <TextField
            select
            size="small"
            fullWidth
            label={isFetching && !data
              ? 'Loading projects…'
              : 'Project'}
            value={otherId}
            onChange={e => setOtherId(e.target.value)}
            sx={{ my: 1 }}
          >
            {!projects.length && <MenuItem disabled value="">No other projects with finished runs</MenuItem>}
            {projects.map(p => (
              <MenuItem key={p.id} value={p.id} sx={{ fontSize: '0.8rem' }}>
                {p.name}
                {' '}
                (
                {p.finished_runs}
                {p.overlapping ? ', overlaps this project' : ''}
                )
              </MenuItem>
            ))}
          </TextField>
        )}
      </Box>
      {open && otherId !== '' && <OtherProjectRuns projectId={otherId} />}
    </Box>
  )
}
