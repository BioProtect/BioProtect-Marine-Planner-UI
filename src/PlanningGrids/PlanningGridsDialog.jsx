import React, { useCallback, useState } from "react";

import BioprotectTable from "../BPComponents/BioprotectTable";
import MarxanDialog from "../MarxanDialog";
import PlanningGridsToolbar from "./PlanningGridsToolbar";

const PlanningGridsDialog = (props) => {
  const [searchText, setSearchText] = useState("");
  const [selectedPlanningGrid, setSelectedPlanningGrid] = useState(undefined);

  const closeDialog = useCallback(() => {
    setSelectedPlanningGrid(undefined);
    props.setPlanningGridsDialogOpen(false);
  }, [props]);

  const handleDelete = useCallback(() => {
    props.deletePlanningGrid(selectedPlanningGrid.feature_class_name);
    setSelectedPlanningGrid(undefined);
  }, [props, selectedPlanningGrid]);

  const handleNew = useCallback(() => {
    props.openNewPlanningGridDialog();
    closeDialog();
  }, [props, closeDialog]);

  const handleNewMarine = useCallback(() => {
    props.setNewMarinePlanningGridDialogOpen(true);
    closeDialog();
  }, [props, closeDialog]);

  const openImportDialog = useCallback(() => {
    props.setImportPlanningGridDialogOpen(true);
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
      open={props.open}
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
          data={props.planningGrids}
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
