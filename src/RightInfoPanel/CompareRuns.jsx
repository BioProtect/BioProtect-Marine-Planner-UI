// "Add runs from another project…": picks runs from other projects to
// overlay on the loaded one (hooks/useRunComparison.jsx draws them). Each
// added project gets a group here listing its finished runs, so any of them
// can be switched on and off; the loaded project's runs stay in the run list.
import { projectColour, useComparedRunIds } from '@hooks/useRunComparison'
import CloseIcon from '@mui/icons-material/Close'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import {
  useCompareRunsQuery,
  useGetFeatureRepresentationQuery,
  useListComparableProjectsQuery,
  useListPrioritizrRunsQuery,
} from '@slices/prioritizrApiSlice'
import {
  addComparedProject,
  removeComparedProject,
  toggleComparedRun,
} from '@slices/prioritizrSlice'
import { useGetProjectQuery } from '@slices/projectSlice'
import { useState } from 'react'
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

// One project in the comparison: an accordion whose header is the project
// (colour, name, runs on) and whose body is a checkbox per finished run.
function ProjectGroup({ projectId, name, colour, checkedIds, onToggle, onRemove }) {
  const [showFeatures, setShowFeatures] = useState(false)
  const { data, isFetching } = useListPrioritizrRunsQuery(projectId)
  const runs = (data?.data ?? []).filter(r => FINISHED.has(r.status))
  const on = runs.filter(r => checkedIds.includes(r.id)).map(r => r.id)

  return (
    <Accordion
      disableGutters
      defaultExpanded
      sx={{
        '&:before': { display: 'none' },
        'boxShadow': 'none',
        'mt': 0.75,
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />}
        sx={{
          'backgroundColor': 'brand.surfaceTint',
          'minHeight': 32,
          'px': 1,
          '& .MuiAccordionSummary-content': {
            margin: '2px 0',
            alignItems: 'center',
            gap: 1,
            minWidth: 0,
          },
        }}
      >
        <Box sx={{
          width: 12,
          height: 12,
          borderRadius: 0.5,
          flex: 'none',
          border: colour ? 'none' : '1px solid #ccd6db',
          backgroundColor: colour ?? 'transparent',
        }}
        />
        <Typography variant="caption" fontWeight={600} noWrap title={name} sx={{ flex: 1, minWidth: 0 }}>
          {name}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
          {on.length}
          /
          {runs.length}
          {' '}
          on
        </Typography>
        {on.length > 0 && (
          <Button
            size="small"
            sx={{ fontSize: '0.65rem', minWidth: 0, p: 0 }}
            onClick={(e) => {
              e.stopPropagation()
              setShowFeatures(s => !s)
            }}
          >
            {showFeatures ? 'Hide features' : 'Features'}
          </Button>
        )}
        <IconButton
          size="small"
          title="Remove this project from the comparison"
          aria-label={`Remove ${name} from the comparison`}
          onClick={(e) => {
            e.stopPropagation()
            onRemove(runs.map(r => r.id))
          }}
          sx={{ p: 0.25 }}
        >
          <CloseIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        {showFeatures && on.length > 0 && <ProjectFeatures runIds={[...on].sort((a, b) => a - b)} />}
        {isFetching && !data && (
          <Typography variant="caption" color="text.secondary" sx={{ pl: 2.5 }}>Loading runs…</Typography>
        )}
        {runs.map(run => (
          <Box
            key={run.id}
            onClick={() => onToggle(run.id)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              pl: 1,
              cursor: 'pointer',
            }}
          >
            <Checkbox
              size="small"
              checked={checkedIds.includes(run.id)}
              inputProps={{
                'aria-label': runName(run),
              }}
              sx={{ p: 0.5 }}
            />
            <Typography noWrap title={runName(run)} sx={{ fontSize: '0.75rem', flex: 1, minWidth: 0 }}>
              {runName(run)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
              {new Date(run.created_at).toLocaleDateString('en-GB')}
            </Typography>
          </Box>
        ))}
      </AccordionDetails>
    </Accordion>
  )
}

function ComparisonGroups() {
  const dispatch = useDispatch()
  const loadedId = useSelector(s => s.project.activeProjectId)
  const { data: projectResp } = useGetProjectQuery(loadedId, { skip: loadedId == null })
  const compared = useSelector(s => s.prioritizr.comparedRunIds)
  const others = useSelector(s => s.prioritizr.comparedProjects)
  const runIds = useComparedRunIds()
  const { currentData } = useCompareRunsQuery(runIds, { skip: !runIds.length })
  if (!others.length)
    return null

  // colours follow the server's order, as on the map; none while not on the map
  const colourOf = (id) => {
    const i = currentData?.projects.findIndex(p => p.id === id) ?? -1
    return i === -1
      ? null
      : projectColour(i)
  }

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
      {colourOf(loadedId) && (
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mt: 0.75,
        }}
        >
          <Box sx={{
            width: 12,
            height: 12,
            borderRadius: 0.5,
            flex: 'none',
            backgroundColor: colourOf(loadedId),
          }}
          />
          <Typography variant="caption" fontWeight={600} noWrap title={projectResp?.project?.name} sx={{ flex: 1, minWidth: 0 }}>
            {projectResp?.project?.name}
          </Typography>
        </Box>
      )}
      {others.map(p => (
        <ProjectGroup
          key={p.id}
          projectId={p.id}
          name={p.name}
          colour={colourOf(p.id)}
          checkedIds={compared}
          onToggle={id => dispatch(toggleComparedRun(id))}
          onRemove={ids => dispatch(removeComparedProject({ id: p.id, runIds: ids }))}
        />
      ))}
      {currentData && (
        <>
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
        </>
      )}
    </Box>
  )
}

export default function CompareRuns() {
  const dispatch = useDispatch()
  const projectId = useSelector(s => s.project.activeProjectId)
  const added = useSelector(s => s.prioritizr.comparedProjects)
  const [open, setOpen] = useState(false)
  const { data, isFetching } = useListComparableProjectsQuery(projectId, { skip: !open || !projectId })
  const projects = (data?.data ?? []).filter(p => !added.some(a => a.id === p.id))

  const add = (id) => {
    const p = projects.find(x => x.id === id)
    if (p)
      dispatch(addComparedProject({ id: p.id, name: p.name }))
    setOpen(false)
  }

  return (
    <Box>
      <ComparisonGroups />
      <Box sx={{
        px: 1,
        py: 0.5,
        borderBottom: 1,
        borderColor: 'brand.border',
      }}
      >
        <Button size="small" onClick={() => setOpen(o => !o)} sx={{ fontSize: '0.7rem' }}>
          {open ? 'Cancel' : 'Add runs from another project…'}
        </Button>
        {open && (
          <TextField
            select
            size="small"
            fullWidth
            label={isFetching && !data
              ? 'Loading projects…'
              : 'Project'}
            value=""
            onChange={e => add(e.target.value)}
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
    </Box>
  )
}
