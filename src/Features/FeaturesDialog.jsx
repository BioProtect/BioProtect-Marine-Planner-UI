import React, { useCallback, useEffect, useState } from "react";

import BioprotectTable from "../BPComponents/BioprotectTable";
import FeaturesToolbar from "./FeaturesToolbar";
import MarxanDialog from "../MarxanDialog";
import MarxanTable from "../MarxanTable";
import TableRow from "../TableRow";
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
    console.log("event ", event);
    setNewFeatureAnchor(event.currentTarget);
    props.updateState({ newFeaturePopoverOpen: true });
  };

  const showImportFeaturePopover = (event) => {
    console.log("event ", event);
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

  const preview = (feature_metadata) => {
    props.previewFeature(feature_metadata);
  };

  const searchTextChanged = (value) => {
    setSearchText(value);
  };

  const dataFiltered = (filteredRows) => {
    setFilteredRows(filteredRows);
  };

  if (!props.allFeatures) return null;

  const columns = [
    {
      id: "name",
      label: "alias",
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
      id: "source",
      label: "source",
      numeric: false,
      disablePadding: true,
    },
    {
      id: "created",
      label: "creation_date",
      numeric: false,
      disablePadding: true,
    },
    {
      id: "created by",
      label: "created_by",
      numeric: false,
      disablePadding: true,
    },
  ];

  return (
    <MarxanDialog
      {...props}
      autoDetectWindowHeight={false}
      bodyStyle={{ padding: "0px 24px 0px 24px" }}
      title="Features"
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
          <BioprotectTable
            data={props.allFeatures}
            tableColumns={columns}
            searchColumns={["alias", "description", "source", "created_by"]}
            dataFiltered={dataFiltered}
            addingRemovingFeatures={props.addingRemovingFeatures}
            selectedFeatureIds={props.selectedFeatureIds}
            selectedFeature={selectedFeature}
            clickFeature={clickFeature}
            preview={preview}
          />
          {/* <MarxanTable
            data={props.allFeatures}
            searchColumns={["alias", "description", "source", "created_by"]}
            searchText={searchText}
            dataFiltered={dataFiltered}
            addingRemovingFeatures={props.addingRemovingFeatures}
            selectedFeatureIds={props.selectedFeatureIds}
            selectedFeature={selectedFeature}
            clickFeature={clickFeature}
            preview={preview}
          /> */}
        </div>
        <FeaturesToolbar
          metadata={props.metadata}
          userRole={props.userRole}
          addingRemovingFeatures={props.addingRemovingFeatures}
          loading={props.loading}
          newFeaturePopoverOpen={props.newFeaturePopoverOpen}
          updateState={props.updateState}
          _newByDigitising={_newByDigitising}
          showImportFeaturePopover={() => showImportFeaturePopover()}
          importFeaturePopoverOpen={props.importFeaturePopoverOpen}
          showNewFeaturePopover={() => showNewFeaturePopover()}
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
