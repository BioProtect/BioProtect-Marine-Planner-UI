import React, { useCallback, useState } from "react";

import MarxanDialog from "../MarxanDialog";
import PlanningGridsToolbar from "./PlanningGridsToolbar";
import ProjectsDialogTable from "../ProjectsDialogTable";

const PlanningGridsDialog = (props) => {
  const [searchText, setSearchText] = useState("");
  const [selectedPlanningGrid, setSelectedPlanningGrid] = useState(undefined);

  const closeDialog = useCallback(() => {
    setSelectedPlanningGrid(undefined);
    props.updateState({ planningGridsDialogOpen: false });
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
    props.updateState({ NewMarinePlanningGridDialogOpen: true });
    closeDialog();
  }, [props, closeDialog]);

  const openImportDialog = useCallback(() => {
    props.updateState({ importPlanningGridDialogOpen: true });
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
      console.log("planning_grid_metadata ", planning_grid_metadata);
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

  const renderRow = useCallback((alias, name) => {
    const title = name ? `${alias} (${name})` : alias;
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#dadada",
          borderRadius: "2px",
        }}
        title={title}
      >
        {alias}
      </div>
    );
  }, []);

  const renderName = useCallback(
    (row) => renderRow(row.original.alias, row.original.feature_class_name),
    [renderRow]
  );

  const renderTitle = useCallback(
    (row) => renderRow(row.original.description, null),
    [renderRow]
  );

  const renderDate = useCallback((row) => {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#dadada",
          borderRadius: "2px",
        }}
        title={row.original.creation_date}
      >
        {row.original.creation_date.substr(0, 8)}
      </div>
    );
  }, []);

  const renderCreatedBy = useCallback(
    (row) => renderRow(row.original.created_by, null),
    [renderRow]
  );

  const renderCountry = useCallback(
    (row) => renderRow(row.original.country, null),
    [renderRow]
  );

  const renderArea = useCallback((row) => {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#dadada",
          borderRadius: "2px",
        }}
      >
        {isNaN(row.original._area) ? "" : row.original._area}
      </div>
    );
  }, []);

  const renderPreview = useCallback((row) => {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#dadada",
          borderRadius: "2px",
        }}
        title="Click to preview"
      >
        ..
      </div>
    );
  }, []);

  const searchTextChanged = useCallback((value) => {
    setSearchText(value);
  }, []);

  const columns = [
    {
      id: "name",
      accessor: "alias",
      width: 274,
    },
    {
      id: "description",
      accessor: "description",
      width: 269,
    },
    {
      id: "created",
      accessor: "creation_date",
      width: 70,
      sortMethod: sortDate,
    },
    {
      id: "created by",
      accessor: "created_by",
      width: 70,
    },
    {
      id: "",
      width: 8,
    },
  ];

  return (
    <MarxanDialog
      {...props}
      onOk={closeDialog}
      showCancelButton={false}
      helpLink={"user.html#the-planning-grids-window"}
      autoDetectWindowHeight={false}
      bodyStyle={{ padding: "0px 24px 0px 24px" }}
      title="Planning grids"
      showSearchBox={true}
      searchTextChanged={searchTextChanged}
    >
      <React.Fragment key="k2">
        <div id="projectsTable">
          <ProjectsDialogTable
            data={props.planningGrids}
            columns={columns}
            searchColumns={[
              "country",
              "domain",
              "alias",
              "description",
              "created_by",
            ]}
            searchText={searchText}
            selectedPlanningGrid={selectedPlanningGrid}
            changePlanningGrid={changePlanningGrid}
            getTrProps={(state, rowInfo) => {
              return {
                style: {
                  background:
                    rowInfo.original.alias ===
                    (state.selectedPlanningGrid &&
                      state.selectedPlanningGrid.alias)
                      ? "aliceblue"
                      : "",
                },
                onClick: (e) => {
                  state.changePlanningGrid(e, rowInfo.original);
                },
              };
            }}
            getTdProps={(state, rowInfo, column) => {
              return {
                onClick: (e) => {
                  if (column.Header === "") preview(rowInfo.original);
                },
              };
            }}
          />
        </div>
        <PlanningGridsToolbar
          {...props}
          userRole={props.userRole}
          unauthorisedMethods={props.unauthorisedMethods}
          handleNew={() => handleNew()}
          handleNewMarine={() => handleNewMarine()}
          openImportDialog={() => openImportDialog()}
          loading={props.loading}
          exportPlanningGrid={() => exportPlanningGrid()}
          handleDelete={() => handleDelete()}
          updateState={() => props.updateState()}
          selectedPlanningGrid={selectedPlanningGrid}
        />
      </React.Fragment>
    </MarxanDialog>
  );
};

export default PlanningGridsDialog;
