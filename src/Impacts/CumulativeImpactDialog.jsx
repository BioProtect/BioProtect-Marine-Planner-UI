import React, { useCallback, useEffect, useState } from "react";

import BioprotectTable from "../BPComponents/BioprotectTable";
import CumulativeImpactsToolbar from "./CumulativeImpactsToolbar";
import LoadingDialog from "../LoadingDialog";
import MarxanDialog from "../MarxanDialog";

const CumulativeImpactDialog = (props) => {
  const [searchText, setSearchText] = useState("");
  const [selectedImpact, setSelectedImpact] = useState(undefined);
  const [filteredRows, setFilteredRows] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(undefined);

  const deleteImpact = useCallback(() => {
    props.deleteImpact(selectedImpact);
    setSelectedImpact(undefined);
  }, [selectedImpact, props]);

  const openHumanActivitiesDialog = useCallback(() => {
    props.onCancel();
    props.openHumanActivitiesDialog();
  }, [props]);

  const _openImportImpactsDialog = useCallback(() => {
    props.updateState({
      cumulativeImpactDialogOpen: false,
      importImpactPopoverOpen: false,
    });
    props.openImportImpactsDialog("import");
  }, [props]);

  const _newByDigitising = useCallback(() => {
    props.initialiseDigitising();
    props.onOk();
  }, [props]);

  const clickImpact = useCallback(
    (event, rowInfo) => {
      props.clickImpact(rowInfo.original, event.shiftKey, selectedImpact);
      setSelectedImpact(rowInfo.original);
    },
    [selectedImpact, props]
  );

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

      if (filteredRows.length < props.allImpacts.length) {
        selectedIds = toggleSelectionState(
          props.selectedImpactIds,
          filteredRows,
          idx1,
          idx2
        );
      } else {
        selectedIds = toggleSelectionState(
          props.selectedImpactIds,
          props.allImpacts,
          idx1,
          idx2
        );
      }
      return selectedIds;
    },
    [filteredRows, props]
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

  const closeDialog = () => {
    setSelectedActivity(undefined);
    props.onOk();
  };

  const preview = useCallback(
    (impact_metadata) => {
      props.previewImpact(impact_metadata);
    },
    [props]
  );

  const dataFiltered = (filteredRows) => {
    setFilteredRows(filteredRows);
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

  return (
    <MarxanDialog
      open={props.open}
      loading={props.loading}
      onOk={props.onOk}
      onCancel={props.onCancel}
      autoDetectWindowHeight={false}
      bodyStyle={{ padding: "0px 24px 0px 24px" }}
      title="Impacts"
      showSearchBox={true}
      searchText={searchText}
      searchTextChanged={setSearchText}
      fullWidth={true}
    >
      <React.Fragment key="k10">
        <div id="projectsTable">
          {props.allImpacts ? (
            <BioprotectTable
              data={props.allImpacts}
              tableColumns={columns}
              ableToSelectAll={false}
              searchColumns={["alias", "description", "source", "created_by"]}
              searchText={searchText}
              dataFiltered={dataFiltered}
              selectedImpactIds={props.selectedImpactIds}
              clickImpact={clickImpact}
              preview={preview}
            />
          ) : (
            <LoadingDialog />
          )}
        </div>
        <CumulativeImpactsToolbar
          loading={props.loading}
          metadataOV={props.metadata.OLDVERSION}
          userRole={props.userRole}
          openImportedActivitesDialog={props.openImportedActivitesDialog}
          openHumanActivitiesDialog={openHumanActivitiesDialog}
          deleteImpact={deleteImpact}
          selectedImpact={selectedImpact}
          selectedProject={props.selectedProject}
        />
      </React.Fragment>
    </MarxanDialog>
  );
};

export default CumulativeImpactDialog;
