import React, { useCallback, useEffect, useState } from "react";
import {
  setActiveResultsTab,
  setActiveTab,
  toggleDialog,
  toggleProjectDialog,
} from "@slices/uiSlice";
import { setPlanningUnitGrids, togglePUD, useListPlanningUnitsQuery } from "@slices/planningUnitSlice";
import { useDispatch, useSelector } from "react-redux";

import BioprotectTable from "../BPComponents/BioprotectTable";
import MarxanDialog from "../MarxanDialog";
import PlanningGridsToolbar from "./PlanningGridsToolbar";

const PlanningGridsDialog = (props) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
  const puState = useSelector((state) => state.planningUnit)
  const dialogStates = useSelector((state) => state.ui.dialogStates);
  const [searchText, setSearchText] = useState("");
  const [selectedPlanningGrid, setSelectedPlanningGrid] = useState(undefined);
  const { data: planningUnitsData, isLoading: isPUsLoading } = useListPlanningUnitsQuery();

  useEffect(() => {
    if (planningUnitsData) {
      dispatch(setPlanningUnitGrids(planningUnitsData.planning_unit_grids || []));
    }
  }, [dispatch, planningUnitsData]);


  const closeDialog = useCallback(() => {
    setSelectedPlanningGrid(undefined);
    dispatch(
      togglePUD({
        dialogName: "planningGridsDialogOpen",
        isOpen: false,
      })
    );
  }, []);

  const handleDelete = useCallback(() => {
    props.deletePlanningGrid(selectedPlanningGrid.feature_class_name);
    setSelectedPlanningGrid(undefined);
  }, [props, selectedPlanningGrid]);

  const handleNew = useCallback(() => {
    props.openNewPlanningGridDialog();
    closeDialog();
  }, [props, closeDialog]);

  const handleNewMarine = useCallback(() => {
    dispatch(
      togglePUD({
        dialogName: "newMarinePlanningGridDialogOpen",
        isOpen: true,
      })
    );
    closeDialog();
  }, [closeDialog]);

  const openImportDialog = useCallback(() => {
    dispatch(
      togglePUD({
        dialogName: "importPlanningGridDialogOpen",
        isOpen: true,
      })
    );
    closeDialog();
  }, [props, closeDialog]);

  const exportPlanningGrid = useCallback(() => {
    props
      .exportPlanningGrid(selectedPlanningGrid.feature_class_name)
      .then((url) => {
        window.location = url;
      });
    closeDialog();
  }, [props, selectedPlanningGrid, closeDialog]);

  const changePlanningGrid = useCallback((event, planningGrid) => {
    setSelectedPlanningGrid(planningGrid);
  }, []);

  const preview = useCallback(
    (planning_grid_metadata) => {
      props.previewPlanningGrid(planning_grid_metadata);
    },
    [props]
  );

  const sortDate = useCallback((a, b, desc) => {
    const dateA = new Date(
      a.slice(6, 8),
      a.slice(3, 5) - 1,
      a.slice(0, 2),
      a.slice(9, 11),
      a.slice(12, 14),
      a.slice(15, 17)
    );
    const dateB = new Date(
      b.slice(6, 8),
      b.slice(3, 5) - 1,
      b.slice(0, 2),
      b.slice(9, 11),
      b.slice(12, 14),
      b.slice(15, 17)
    );
    return dateA > dateB ? 1 : -1;
  }, []);

  const searchTextChanged = useCallback((value) => {
    setSearchText(value);
  }, []);

  const clickRow = (event, rowInfo) => {
    changePlanningGrid(event, rowInfo.planningGrid);
  };

  const columns = [
    {
      id: "alias",
      label: "alias",
      numeric: false,
      disablePadding: true,
    },
    {
      id: "domain",
      label: "domain",
      numeric: false,
      disablePadding: true,
    },
    {
      id: "description",
      label: "description",
      numeric: false,
      disablePadding: true,
    },
    {
      id: "created_by",
      label: "created_by",
      numeric: false,
      disablePadding: true,
    },
    {
      id: "creation_date",
      label: "creation_date",
      numeric: false,
      disablePadding: true,
    },
  ];

  return (
    <MarxanDialog
      open={puState.dialogs.planningGridsDialogOpen}
      loading={props.loading}
      fullWidth={props.fullWidth}
      maxWidth={props.maxWidth}
      onOk={closeDialog}
      showCancelButton={false}
      helpLink={"user.html#the-planning-grids-window"}
      title="Planning grids"
      showSearchBox={true}
      searchTextChanged={searchTextChanged}
      actions={
        <PlanningGridsToolbar
          userRole={props.userRole}
          unauthorisedMethods={props.unauthorisedMethods}
          handleNew={() => handleNew()}
          handleNewMarine={() => handleNewMarine()}
          openImportDialog={() => openImportDialog()}
          loading={props.loading}
          exportPlanningGrid={() => exportPlanningGrid()}
          handleDelete={() => handleDelete()}
          selectedPlanningGrid={selectedPlanningGrid}
        />
      }
    >
      <div id="react-planning-grids-table">
        <BioprotectTable
          title="Planning Grids"
          data={puState.planningUnitGrids}
          tableColumns={columns}
          searchColumns={[
            "country",
            "domain",
            "alias",
            "description",
            "created_by",
          ]}
          selected={[selectedPlanningGrid] || []}
          updateSelection={changePlanningGrid}
          clickRow={clickRow}
        />
      </div>
    </MarxanDialog>
  );
};

export default PlanningGridsDialog;
