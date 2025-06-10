import React, { useCallback, useEffect, useState } from "react";
import { setActivities, toggleDialog } from "../slices/uiSlice";
import { useDispatch, useSelector } from "react-redux";

import BioprotectTable from "../BPComponents/BioprotectTable";
import CumulativeImpactsToolbar from "./CumulativeImpactsToolbar";
import Loading from "../Loading";
import MarxanDialog from "../MarxanDialog";

const CumulativeImpactDialog = ({
  loading,
  _get,
  metadata,
  clickImpact,
  initialiseDigitising,
  selectedImpactIds,
  openImportedActivitesDialog,
  userRole
}) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
  const dialogStates = useSelector((state) => state.ui.dialogStates);
  const projState = useSelector((state) => state.project);
  const featureState = useSelector((state) => state.feature)
  const puState = useSelector((state) => state.planningUnit)

  const [searchText, setSearchText] = useState("");
  const [selectedImpact, setSelectedImpact] = useState(undefined);
  const [filteredRows, setFilteredRows] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(undefined);

  // const handleDeleteImpact = useCallback(() => {
  //   deleteImpact(selectedImpact);
  //   setSelectedImpact(undefined);
  // }, [selectedImpact, deleteImpact]);

  const openHumanActivitiesDialog = async () => {
    if (uiState.activities.length < 1) {
      const response = await _get("getActivities");
      const data = await JSON.parse(response.data);
      dispatch(setActivities(data));
    }
    dispatch(
      toggleDialog({ dialogName: "humanActivitiesDialogOpen", isOpen: true })
    );
  };


  const handleOpenHumanActivitiesDialog = useCallback(() => {
    // closeDialog();
    openHumanActivitiesDialog();
  }, [openHumanActivitiesDialog]);

  const _openImportImpactsDialog = useCallback(() => {
    dispatch(
      toggleDialog({ dialogName: "cumulativeImpactDialogOpen", isOpen: false })
    );
    dispatch(
      toggleDialog({ dialogName: "importImpactPopoverOpen", isOpen: false })
    );
    dispatch(
      toggleDialog({ dialogName: "openImportImpactsDialog", isOpen: true })
    );
  }, []);

  const _newByDigitising = useCallback(() => {
    initialiseDigitising();
    onOk();
  }, [initialiseDigitising]);

  const handleClickImpact = useCallback(
    (event, rowInfo) => {
      clickImpact(rowInfo.original, event.shiftKey, selectedImpact);
      setSelectedImpact(rowInfo.original);
    },
    [selectedImpact, clickImpact]
  );

  const toggleSelectionState = (selectedIds, features, first, last) => {
    const spannedImpacts = features.slice(first, last);
    spannedImpacts.forEach((feature) => {
      const index = selectedIds.indexOf(feature.id);
      if (index !== -1) {
        selectedIds.splice(index, 1);
      } else {
        selectedIds.push(feature.id);
      }
    });
    return selectedIds;
  };

  const getImpactsBetweenRows = useCallback(
    (previousRow, thisRow) => {
      let selectedIds;
      const idx1 =
        previousRow.index < thisRow.index
          ? previousRow.index + 1
          : thisRow.index;
      const idx2 =
        previousRow.index < thisRow.index
          ? thisRow.index + 1
          : previousRow.index;

      if (filteredRows.length < uiState.allImpacts.length) {
        selectedIds = toggleSelectionState(
          selectedImpactIds,
          filteredRows,
          idx1,
          idx2
        );
      } else {
        selectedIds = toggleSelectionState(
          selectedImpactIds,
          uiState.allImpacts,
          idx1,
          idx2
        );
      }
      return selectedIds;
    },
    [filteredRows, toggleSelectionState]
  );



  // const preview = useCallback(
  //   (impact_metadata) => {
  //     previewImpact(impact_metadata);
  //   },
  //   [previewImpact]
  // );

  const dataFiltered = (filteredRows) => {
    console.log("filteredRows ", filteredRows);
    setFilteredRows(filteredRows);
    return filteredRows;
  };

  const columns = [
    {
      id: "name",
      numeric: false,
      disablePadding: true,
      label: "name",
    },
    {
      id: "description",
      numeric: false,
      disablePadding: true,
      label: "description",
    },
    {
      id: "source",
      numeric: false,
      disablePadding: true,
      label: "source",
    },
    {
      id: "created by",
      numeric: false,
      disablePadding: true,
      label: "created by",
    },
    {
      id: "creation Date",
      numeric: false,
      disablePadding: true,
      label: "creation date",
    },
  ];

  const closeDialog = () => {
    setSelectedActivity(undefined);
    dispatch(
      toggleDialog({ dialogName: "cumulativeImpactDialogOpen", isOpen: false })
    );
  };

  return (
    <MarxanDialog
      open={dialogStates.cumulativeImpactDialogOpen}
      onOk={() => closeDialog()}
      onCancel={() => closeDialog()}
      loading={loading}
      autoDetectWindowHeight={false}
      title="Impacts"
      showSearchBox={true}
      searchText={searchText}
      searchTextChanged={setSearchText}
      fullWidth={true}
    >
      <React.Fragment key="k10">
        <div id="projectsTable">
          {uiState.allImpacts ? (
            <BioprotectTable
              data={uiState.allImpacts}
              tableColumns={columns}
              ableToSelectAll={false}
              searchColumns={["alias", "description", "source", "created_by"]}
              searchText={searchText}
              dataFiltered={dataFiltered}
              selected={selectedImpactIds}
              clickImpact={handleClickImpact}
            // preview={preview}
            />
          ) : (
            <Loading />
          )}
        </div>
        <CumulativeImpactsToolbar
          loading={loading}
          metadataOV={metadata.OLDVERSION}
          userRole={userRole}
          openImportedActivitesDialog={openImportedActivitesDialog}
          openHumanActivitiesDialog={handleOpenHumanActivitiesDialog}
          // deleteImpact={handleDeleteImpact}
          selectedImpact={selectedImpact}
          selectedProject={projState.project}
        />
      </React.Fragment>
    </MarxanDialog>
  );
};

export default CumulativeImpactDialog;
