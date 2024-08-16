import React, { useCallback, useEffect, useState } from "react";
import {
  faCircle,
  faPlayCircle,
  faPlusCircle,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";

import CumulativeImpactsToolbar from "./CumulativeImpactsToolbar";
import MarxanDialog from "../MarxanDialog";
import MarxanTable from "../MarxanTable";

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
    onOk();
    props.initialiseDigitising();
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

  const onOk = useCallback(() => {
    props.onOk();
  }, [props]);

  const preview = useCallback(
    (impact_metadata) => {
      props.previewImpact(impact_metadata);
    },
    [props]
  );

  const renderTitle = (row) => {
    return <TableRow title={row.original.description} />;
  };

  const renderActivity = (row) => {
    return <TableRow title={row.original.activity} />;
  };

  const renderSource = (row) => {
    return <TableRow title={row.original.source} />;
  };

  const renderCategory = (row) => {
    return <TableRow title={row.original.category} />;
  };

  const renderCreatedBy = (row) => {
    return <TableRow title={row.original.created_by} />;
  };

  const renderDate = (row) => {
    return (
      <TableRow
        title={row.original.creation_date}
        htmlContent={row.original.creation_date.substr(0, 8)}
      />
    );
  };

  const dataFiltered = (filteredRows) => {
    setFilteredRows(filteredRows);
  };

  const columns = [
    {
      id: "name",
      accessor: "alias",
      width: 193,
    },
    {
      id: "description",
      accessor: "description",
      width: 246,
      Cell: renderTitle,
    },
    {
      id: "source",
      accessor: "source",
      width: 120,
      Cell: renderSource,
    },
    {
      id: "created by",
      accessor: "created_by",
      width: 70,
      Cell: renderCreatedBy,
    },
    {
      id: "creation Date",
      accessor: "created_date",
      width: 70,
      Cell: renderDate,
    },
  ];

  return (
    <MarxanDialog
      {...props}
      autoDetectWindowHeight={false}
      bodyStyle={{ padding: "0px 24px 0px 24px" }}
      title="Impacts"
      onOk={onOk}
      showSearchBox={true}
      searchText={searchText}
      searchTextChanged={setSearchText}
    >
      <React.Fragment key="k10">
        <div id="projectsTable">
          <MarxanTable
            data={props.allImpacts}
            searchColumns={["alias", "description", "source", "created_by"]}
            searchText={searchText}
            dataFiltered={dataFiltered}
            selectedImpactIds={props.selectedImpactIds}
            clickImpact={clickImpact}
            preview={preview}
            columns={tableColumns}
            getTrProps={(state, rowInfo) => ({
              style: {
                background:
                  state.selectedImpactIds.includes(rowInfo.original.id) ||
                  (state.selectedImpact &&
                    state.selectedImpact.id === rowInfo.original.id)
                    ? "aliceblue"
                    : "",
              },
              onClick: (e) => {
                clickImpact(e, rowInfo);
              },
            })}
            getTdProps={(state, rowInfo, column) => ({
              onClick: (e) => {
                if (column.Header === "") preview(rowInfo.original);
              },
            })}
          />
        </div>
        <CumulativeImpactsToolbar
          {...props}
          openHumanActivitiesDialog={openHumanActivitiesDialog}
          deleteImpact={deleteImpact}
          selectedImpact={selectedImpact}
          clea
        />
      </React.Fragment>
    </MarxanDialog>
  );
};

export default CumulativeImpactDialog;
