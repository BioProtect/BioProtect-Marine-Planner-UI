import { selectCurrentUser } from '@slices/authSlice'
import {
  setPlanningUnitGrids,
  togglePUD,
  useListPlanningUnitGridsQuery,
} from '@slices/planningUnitSlice'
import { useGetProjectQuery } from '@slices/projectSlice'

import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import BioprotectTable from '../BPComponents/BioprotectTable'
import ConfirmDeleteDialog from '../BPComponents/ConfirmDeleteDialog'
import BPDialog from '../BPDialog'
import PlanningGridsToolbar from './PlanningGridsToolbar'

const SEARCH_COLUMNS = [
  'domain',
  'alias',
  'description',
  'created_by',
]

function PlanningGridsDialog(props) {
  const dispatch = useDispatch()
  const puState = useSelector(state => state.planningUnit)
  const [pickedPlanningGrid, setPickedPlanningGrid] = useState(undefined)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const currentUser = useSelector(selectCurrentUser)
  const { data: planningUnitsData }
    = useListPlanningUnitGridsQuery()
  const activeProjectId = useSelector(state => state.project.activeProjectId)
  const { data: projectResp } = useGetProjectQuery(activeProjectId, {
    skip: activeProjectId == null,
  })
  const activeGridAlias = projectResp?.metadata?.PLANNING_UNIT_NAME
  // the project's own grid is preselected until the user picks another
  const selectedPlanningGrid = pickedPlanningGrid
    ?? puState.planningUnitGrids.find(g => g.alias === activeGridAlias)
  // only the user who created a grid may delete it - the server enforces this too
  const canDelete
    = !!currentUser?.username
      && selectedPlanningGrid?.created_by === currentUser.username

  useEffect(() => {
    if (planningUnitsData) {
      dispatch(
        setPlanningUnitGrids(planningUnitsData.planning_unit_grids || []),
      )
    }
  }, [dispatch, planningUnitsData])

  const closeDialog = useCallback(() => {
    setPickedPlanningGrid(undefined)
    dispatch(
      togglePUD({
        dialogName: 'planningGridsDialogOpen',
        isOpen: false,
      }),
    )
  }, [dispatch])

  const handleDelete = useCallback(() => {
    setConfirmDeleteOpen(false)
    // the list rows carry the grid's name as tilesetid
    props.deletePlanningGrid(selectedPlanningGrid.tilesetid)
    setPickedPlanningGrid(undefined)
  }, [props, selectedPlanningGrid])

  const exportPlanningGrid = useCallback(() => {
    // the list rows carry the grid's name as tilesetid
    props.exportPlanningGrid(selectedPlanningGrid.tilesetid).then((url) => {
      if (url)
        window.location = url
    })
    closeDialog()
  }, [props, selectedPlanningGrid, closeDialog])

  const changePlanningGrid = useCallback((event, planningGrid) => {
    setPickedPlanningGrid(planningGrid)
  }, [])

  // the table passes the clicked row itself
  const clickRow = (event, row) => {
    changePlanningGrid(event, row)
  }

  const columns = [
    {
      id: 'alias',
      label: 'alias',
      numeric: false,
      disablePadding: true,
    },
    {
      id: 'domain',
      label: 'domain',
      numeric: false,
      disablePadding: true,
    },
    {
      id: 'description',
      label: 'description',
      numeric: false,
      disablePadding: true,
    },
    {
      id: 'created_by',
      label: 'created_by',
      numeric: false,
      disablePadding: true,
    },
    {
      id: 'creation_date',
      label: 'creation_date',
      numeric: false,
      disablePadding: true,
    },
  ]

  return (
    <BPDialog
      open={puState.dialogs.planningGridsDialogOpen}
      loading={props.loading}
      fullWidth={props.fullWidth}
      maxWidth={props.maxWidth}
      onOk={closeDialog}
      showCancelButton={false}
      helpLink="user.html#the-planning-grids-window"
      title="Planning grids"
      actions={(
        <PlanningGridsToolbar
          userRole={props.userRole}
          unauthorisedMethods={props.unauthorisedMethods}
          loading={props.loading}
          exportPlanningGrid={() => exportPlanningGrid()}
          handleDelete={() => setConfirmDeleteOpen(true)}
          canDelete={canDelete}
          selectedPlanningGrid={selectedPlanningGrid}
        />
      )}
    >
      <div id="react-planning-grids-table">
        <BioprotectTable
          title="Planning Grids"
          data={puState.planningUnitGrids}
          tableColumns={columns}
          searchColumns={SEARCH_COLUMNS}
          selected={selectedPlanningGrid
            ? [selectedPlanningGrid]
            : []}
          updateSelection={changePlanningGrid}
          clickRow={clickRow}
        />
      </div>
      <ConfirmDeleteDialog
        open={confirmDeleteOpen && !!selectedPlanningGrid}
        title="Delete planning grid?"
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
      >
        <p>Are you sure you want to delete the planning grid</p>
        <b>
          {selectedPlanningGrid?.alias}
          ?
        </b>
        <p>
          This removes the grid and its cells and cannot be undone. A grid that
          is used by a project cannot be deleted.
        </p>
      </ConfirmDeleteDialog>
    </BPDialog>
  )
}

export default PlanningGridsDialog
