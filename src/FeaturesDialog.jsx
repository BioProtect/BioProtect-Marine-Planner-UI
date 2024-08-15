import React, { useCallback, useEffect, useState } from "react";

import FeaturesToolbar from "./FeaturesToolbar";
import MarxanDialog from "./MarxanDialog";
import MarxanTable from "./MarxanTable";
import TableRow from "./TableRow";
import { faAnchor } from "@fortawesome/free-solid-svg-icons";

const FeaturesDialog = (props) => {
  const [selectedFeature, setSelectedFeature] = useState(undefined);
  const [previousRow, setPreviousRow] = useState(undefined);
  const [searchText, setSearchText] = useState("");
  const [filteredRows, setFilteredRows] = useState([]);
  const [newFeatureAnchor, setNewFeatureAnchor] = useState(null);
  const [importFeatureAnchor, setImportFeatureAnchor] = useState(null);

  const _delete = () => {
    props.deleteFeature(selectedFeature);
    setSelectedFeature(undefined);
  };

  const showNewFeaturePopover = (event) => {
    setNewFeatureAnchor(event.currentTarget);
    props.updateState({ newFeaturePopoverOpen: true });
  };

  const showImportFeaturePopover = (event) => {
    setImportFeatureAnchor(event.currentTarget);
    props.updateState({ importFeaturePopoverOpen: true });
  };

  const _openImportFeaturesDialog = () => {
    props.updateState({
      featuresDialogOpen: false,
      newFeaturePopoverOpen: false,
      importFeaturePopoverOpen: false,
      importFeaturesDialogOpen: true,
    });
  };

  const _openImportFromWebDialog = () => {
    props.updateState({
      featuresDialogOpen: false,
      newFeaturePopoverOpen: false,
      importFeaturePopoverOpen: false,
      importFromWebDialogOpen: true,
    });
  };

  const _newByDigitising = () => {
    onOk();
    props.initialiseDigitising();
  };

  const openImportGBIFDialog = () => {
    props.updateState({
      importGBIFDialogOpen: true,
      featuresDialogOpen: false,
      newFeaturePopoverOpen: false,
      importFeaturePopoverOpen: false,
    });
  };

  const clickFeature = (event, rowInfo) => {
    if (props.addingRemovingFeatures) {
      if (event.shiftKey) {
        const selectedIds = getFeaturesBetweenRows(previousRow, rowInfo);
        props.update(selectedIds);
      } else {
        props.clickFeature(rowInfo.original, event.shiftKey, previousRow);
      }
      setPreviousRow(rowInfo);
    } else {
      setSelectedFeature(rowInfo.original);
    }
  };

  const toggleSelectionState = (selectedIds, features, first, last) => {
    const spannedFeatures = features.slice(first, last);
    spannedFeatures.forEach((feature) => {
      if (selectedIds.includes(feature.id)) {
        selectedIds.splice(selectedIds.indexOf(feature.id), 1);
      } else {
        selectedIds.push(feature.id);
      }
    });
    return selectedIds;
  };

  const getFeaturesBetweenRows = (previousRow, thisRow) => {
    const idx1 =
      previousRow.index < thisRow.index ? previousRow.index + 1 : thisRow.index;
    const idx2 =
      previousRow.index < thisRow.index ? thisRow.index + 1 : previousRow.index;

    if (filteredRows.length < props.allFeatures.length) {
      return toggleSelectionState(
        props.selectedFeatureIds,
        filteredRows,
        idx1,
        idx2
      );
    } else {
      return toggleSelectionState(
        props.selectedFeatureIds,
        props.allFeatures,
        idx1,
        idx2
      );
    }
  };

  const selectAllFeatures = () => {
    if (filteredRows.length < props.allFeatures.length) {
      const selectedIds = filteredRows.map((feature) => feature.id);
      props.updateState({ selectedFeatureIds: selectedIds });
    } else {
      props.selectAllFeatures();
    }
  };

  const onOk = () => {
    if (props.addingRemovingFeatures) {
      props.onOk();
    } else {
      unselectFeature();
    }
  };

  const unselectFeature = () => {
    setSelectedFeature(undefined);
    props.updateState({
      featuresDialogOpen: false,
      newFeaturePopoverOpen: false,
      importFeaturePopoverOpen: false,
    });
  };

  const sortDate = useCallback((a, b) => {
    return new Date(
      a.slice(6, 8),
      a.slice(3, 5) - 1,
      a.slice(0, 2),
      a.slice(9, 11),
      a.slice(12, 14),
      a.slice(15, 17)
    ) >
      new Date(
        b.slice(6, 8),
        b.slice(3, 5) - 1,
        b.slice(0, 2),
        b.slice(9, 11),
        b.slice(12, 14),
        b.slice(15, 17)
      )
      ? 1
      : -1;
  }, []);

  const preview = (feature_metadata) => {
    props.previewFeature(feature_metadata);
  };

  const renderTitle = (row) => {
    return <TableRow title={row.original.description} />;
  };

  const renderSource = (row) => {
    return <TableRow title={row.original.source} />;
  };

  const renderDate = (row) => {
    return (
      <TableRow
        title={row.original.creation_date}
        htmlContent={row.original.creation_date.substr(0, 8)}
      />
    );
  };

  const renderCreatedBy = (row) => {
    return <TableRow title={row.original.created_by} />;
  };

  const renderPreview = (row) => {
    return <TableRow title="Click to preview" htmlContent=".." />;
  };

  const searchTextChanged = (value) => {
    setSearchText(value);
  };

  const dataFiltered = (filteredRows) => {
    setFilteredRows(filteredRows);
  };

  if (!props.allFeatures) return null;

  return (
    <MarxanDialog
      {...props}
      autoDetectWindowHeight={false}
      bodyStyle={{ padding: "0px 24px 0px 24px" }}
      title="Features - ETO:LN:JL"
      onOk={onOk}
      showCancelButton={props.addingRemovingFeatures}
      helpLink={
        props.addingRemovingFeatures
          ? "user.html#adding-and-removing-features"
          : "user.html#the-features-window"
      }
      showSearchBox={true}
      searchTextChanged={searchTextChanged}
    >
      <React.Fragment key="k10">
        <div id="projectsTable">
          <MarxanTable
            data={props.allFeatures}
            searchColumns={["alias", "description", "source", "created_by"]}
            searchText={searchText}
            dataFiltered={dataFiltered}
            addingRemovingFeatures={props.addingRemovingFeatures}
            selectedFeatureIds={props.selectedFeatureIds}
            selectedFeature={selectedFeature}
            clickFeature={clickFeature}
            preview={preview}
            columns={[
              {
                Header: "Name",
                accessor: "alias",
                width: 193,
                headerStyle: { textAlign: "left" },
              },
              {
                Header: "Description",
                accessor: "description",
                width: 246,
                headerStyle: { textAlign: "left" },
                Cell: renderTitle,
              },
              {
                Header: "Source",
                accessor: "source",
                width: 120,
                headerStyle: { textAlign: "left" },
                Cell: renderSource,
              },
              {
                Header: "Created",
                accessor: "creation_date",
                width: 70,
                headerStyle: { textAlign: "left" },
                Cell: renderDate,
                sortMethod: sortDate,
              },
              {
                Header: "Created by",
                accessor: "created_by",
                width: 70,
                headerStyle: { textAlign: "left" },
                Cell: renderCreatedBy,
              },
              {
                Header: "",
                width: 8,
                headerStyle: { textAlign: "center" },
                Cell: renderPreview,
              },
            ]}
            getTrProps={(state, rowInfo) => ({
              style: {
                background:
                  (props.addingRemovingFeatures &&
                    props.selectedFeatureIds.includes(rowInfo.original.id)) ||
                  (!props.addingRemovingFeatures &&
                    selectedFeature &&
                    selectedFeature.id === rowInfo.original.id)
                    ? "aliceblue"
                    : "",
              },
              onClick: (e) => {
                clickFeature(e, rowInfo);
              },
            })}
            getTdProps={(state, rowInfo, column) => ({
              onClick: (e) => {
                if (column.Header === "") preview(rowInfo.original);
              },
            })}
          />
        </div>
        <FeaturesToolbar
          props={props}
          showNewFeaturePopover={() => showImportFeaturePopover()}
          anchorEl={newFeatureAnchor}
          _newByDigitising={() => _newByDigitising()}
          showImportFeaturePopover={() => showImportFeaturePopover()}
          importFeatureAnchor={importFeatureAnchor}
          _openImportFeaturesDialog={() => _openImportFeaturesDialog()}
          _openImportFromWebDialog={() => _openImportFromWebDialog()}
          openImportGBIFDialog={() => openImportGBIFDialog()}
          selectedFeature={selectedFeature}
          _delete={() => _delete()}
          selectAllFeatures={() => selectAllFeatures()}
        />
      </React.Fragment>
    </MarxanDialog>
  );
};

export default FeaturesDialog;
