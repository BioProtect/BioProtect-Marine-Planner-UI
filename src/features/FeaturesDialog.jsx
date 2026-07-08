import {
  setAddingRemovingFeatures,
  setSelectedFeatureIds,
  toggleFeatureD,
  useDeleteFeatureMutation,
} from "@slices/featureSlice";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import BioprotectTable from "../BPComponents/BioprotectTable";
import Button from "@mui/material/Button";
import { CONSTANTS } from "../bpVars";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import FeaturesToolbar from "./FeaturesToolbar";
import MarxanDialog from "../MarxanDialog";
import { generateTableCols } from "../Helpers";
import jsonp from "jsonp-promise";
import { selectCurrentUser } from "@slices/authSlice";
import { setLoading } from "@slices/uiSlice";
import { setSelectedFeatureId } from "../slices/featureSlice";
import useAppSnackbar from "@hooks/useAppSnackbar";
import { useGetAllFeaturesQuery } from "@slices/featureSlice";

const FeaturesDialog = ({ onOk, metadata, userRole, previewFeature }) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
  const currentUser = useSelector(selectCurrentUser);
  const addingRemovingFeatures = useSelector(
    (state) => state.feature.addingRemovingFeatures,
  );
  const selectedFeatureId = useSelector(
    (state) => state.feature.selectedFeatureId,
  );
  const selectedFeatureIds = useSelector(
    (state) => state.feature.selectedFeatureIds,
  );
  const dialogIsOpen = useSelector(
    (state) => state.feature.dialogs.featuresDialogOpen,
  );

  const [previousRow, setPreviousRow] = useState(undefined);
  const [searchText, setSearchText] = useState("");
  const [filteredRows, setFilteredRows] = useState([]);
  const [newFeatureAnchor, setNewFeatureAnchor] = useState(null);
  const [importFeatureAnchor, setImportFeatureAnchor] = useState(null);
  // Row currently queued for deletion (drives the confirm dialog).
  const [featurePendingDelete, setFeaturePendingDelete] = useState(null);

  const { showMessage } = useAppSnackbar();
  const [deleteFeature, { isLoading: isDeleting }] = useDeleteFeatureMutation();

  // Per-row delete gating. A user may delete a feature if they are an Admin
  // OR they personally created it. System features (created_by === "global
  // admin") are never deletable from the UI — the backend also enforces this.
  const isAdmin = userRole === "Admin";
  const canDeleteFeature = useCallback(
    (feature) => {
      if (!feature) return false;
      if (feature.created_by === "global admin") return false;
      if (isAdmin) return true;
      return !!currentUser?.name && feature.created_by === currentUser.name;
    },
    [isAdmin, currentUser?.name],
  );

  const deleteRowReason = useCallback(
    (feature) => {
      if (!feature) return null;
      if (feature.created_by === "global admin") {
        return "System features cannot be deleted";
      }
      if (!isAdmin && feature.created_by !== currentUser?.name) {
        return "You can only delete features you created";
      }
      return null;
    },
    [isAdmin, currentUser?.name],
  );

  const closeDeleteConfirm = () => {
    if (isDeleting) return;
    setFeaturePendingDelete(null);
  };

  const handleConfirmDelete = async () => {
    const feature = featurePendingDelete;
    if (!feature) return;
    try {
      // The server returns 200 with { error: "..." } on failure, so check the
      // body rather than relying on a thrown error.
      const result = await deleteFeature(feature.feature_class_name).unwrap();
      if (result?.error) {
        showMessage(`Failed to delete feature: ${result.error}`, "error");
        return;
      }
      // Clear any references to the now-deleted row.
      dispatch(
        setSelectedFeatureIds(
          (selectedFeatureIds || []).filter((id) => id !== feature.id),
        ),
      );
      if (selectedFeatureId === feature.id) {
        dispatch(setSelectedFeatureId(null));
      }
      showMessage(`Feature "${feature.alias}" deleted`, "success");
      setFeaturePendingDelete(null);
    } catch (err) {
      const message =
        err?.data?.error || err?.error || err?.message || "Unknown error";
      showMessage(`Failed to delete feature: ${message}`, "error");
    }
  };
  const {
    data: allFeaturesResp,
    isFetching: isFetchingAllFeatures,
    isError,
    error,
  } = useGetAllFeaturesQuery(undefined, { skip: !dialogIsOpen });
  const allFeatures = allFeaturesResp?.data ?? allFeaturesResp ?? [];

  const selectedFeature = useMemo(() => {
    if (selectedFeatureId == null) return null;
    return allFeatures.find((f) => f.id === selectedFeatureId) ?? null;
  }, [allFeatures, selectedFeatureId]);

  const addOrRemoveFeature = (feature) => {
    const ids = selectedFeatureIds || [];
    // if the feature is already included remove it, otherwise add it
    if (ids.includes(feature.id)) {
      dispatch(setSelectedFeatureIds(ids.filter((id) => id !== feature.id)));
    } else {
      dispatch(setSelectedFeatureIds([...ids, feature.id]));
    }
  };

  const toggleSelectionState = (selectedIds, features, first, last) => {
    const next = [...selectedIds];
    const spanned = features.slice(first, last);
    for (const feature of spanned) {
      const i = next.indexOf(feature.id);
      if (i >= 0) next.splice(i, 1);
      else next.push(feature.id);
    }
    return next;
  };

  // Function to allow users to select multiple features using the shift key
  const getFeaturesBetweenRows = (prevRow, thisRow) => {
    const from =
      prevRow.index < thisRow.index ? prevRow.index + 1 : thisRow.index;
    const to =
      prevRow.index < thisRow.index ? thisRow.index + 1 : prevRow.index;

    const base =
      filteredRows.length < allFeatures.length ? filteredRows : allFeatures;

    return toggleSelectionState(selectedFeatureIds || [], base, from, to);
  };

  const clickRow = (event, row) => {
    if (!row || row.index === undefined) return;
    addOrRemoveFeature(row);

    if (addingRemovingFeatures) {
      if (event.shiftKey && previousRow) {
        const nextIds = getFeaturesBetweenRows(previousRow, row);
        dispatch(setSelectedFeatureIds(nextIds));
      }
      setPreviousRow(row);
    } else {
      dispatch(setSelectedFeatureId(row.id));
    }
  };

  const selectAllFeatures = () => {
    const ids =
      filteredRows.length < allFeatures.length
        ? filteredRows.map((f) => f.id)
        : allFeatures.map((f) => f.id);
    dispatch(setSelectedFeatureIds(ids));
  };

  const clearAllFeatures = () => dispatch(setSelectedFeatureIds([]));

  const handleClickOk = () => {
    if (addingRemovingFeatures) {
      onOk();
    } else {
      unselectFeature();
    }
  };

  const unselectFeature = () => {
    dispatch(setSelectedFeatureId(null));
    dispatch(
      toggleFeatureD({ dialogName: "featuresDialogOpen", isOpen: false }),
    );
  };

  const searchTextChanged = useCallback((value) => setSearchText(value), []);
  const dataFiltered = useCallback((rows) => setFilteredRows(rows), []);

  const columns = generateTableCols([
    { id: "alias", label: "alias" },
    { id: "description", label: "description" },
    { id: "source", label: "source" },
    { id: "creation_date", label: "Date" },
    { id: "created_by", label: "By" },
  ]);

  const tableData = useMemo(
    () =>
      allFeatures.map((feature, index) => ({
        ...feature,
        index,
      })),
    [allFeatures],
  );

  const closeDialog = () => {
    dispatch(
      toggleFeatureD({ dialogName: "featuresDialogOpen", isOpen: false }),
    );
    dispatch(setAddingRemovingFeatures(false));
  };

  return (
    <MarxanDialog
      open={dialogIsOpen}
      loading={uiState.loading}
      onOk={handleClickOk}
      onCancel={closeDialog}
      showCancelButton={addingRemovingFeatures}
      autoDetectWindowHeight={false}
      title="Features"
      // showSearchBox={true}
      // searchTextChanged={searchTextChanged}
      actions={<FeaturesToolbar selectAllFeatures={selectAllFeatures} />}
    >
      <div id="react-features-dialog-table">
        <BioprotectTable
          title="Features"
          data={tableData}
          tableColumns={columns}
          searchColumns={["alias", "description", "source", "created_by"]}
          dataFiltered={dataFiltered}
          selected={selectedFeatureIds}
          selectedFeatureIds={selectedFeatureIds}
          selectedFeature={selectedFeature}
          clickRow={clickRow}
          preview={(row) => previewFeature?.(row)}
          deleteRow={(row) => setFeaturePendingDelete(row)}
          canDeleteRow={canDeleteFeature}
          deleteRowReason={deleteRowReason}
        />
      </div>
      <Dialog
        open={!!featurePendingDelete}
        onClose={closeDeleteConfirm}
        aria-labelledby="delete-feature-dialog-title"
        aria-describedby="delete-feature-dialog-description"
      >
        <DialogTitle id="delete-feature-dialog-title">
          Delete feature?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-feature-dialog-description">
            <p>Are you sure you want to delete the feature</p>
            <b>
              {featurePendingDelete?.alias
                ? `${featurePendingDelete.alias}`
                : ""}
              ?
            </b>
            <p>
              This will remove the feature data and cannot be undone. Features
              that are used by existing projects cannot be deleted.
            </p>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteConfirm} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={<DeleteIcon />}
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </MarxanDialog>
  );
};

export default FeaturesDialog;
