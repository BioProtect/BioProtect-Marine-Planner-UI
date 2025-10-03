import {
  Box,
  Button,
  Checkbox,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { setSelectedFeatureIds } from "@slices/featureSlice";
import { useMemo } from "react";

function ProjectFeaturesTable() {
  const dispatch = useDispatch();
  const featureState = useSelector((state) => state.feature);

  // const { allFeatures = [], selectedFeatureIds = [] } = useSelector((s) => s.feature);

  const selected = useMemo(
    () => featureState.allFeatures.filter((f) => featureState.selectedFeatureIds.includes(f.id)),
    [featureState.allFeatures, featureState.selectedFeatureIds]
  );
  const toggleOne = (id) => {
    const next = featureState.selectedFeatureIds.includes(id)
      ? featureState.selectedFeatureIds.filter((x) => x !== id)
      : [...featureState.selectedFeatureIds, id];
    dispatch(setSelectedFeatureIds(next));
  };

  const removeOne = (id) => {
    dispatch(setSelectedFeatureIds(featureState.selectedFeatureIds.filter((x) => x !== id)));
  };

  const clearAll = () => dispatch(setSelectedFeatureIds([]));

  if (selected.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No features selected yet. Click “+/-” to choose features.
      </Typography>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 600 }}>
          Selected features
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {selected.length} selected
          </Typography>
          <Button size="small" onClick={clearAll}>Clear all</Button>
        </Box>
      </Box>
      <Divider sx={{ mb: 1 }} />

      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Alias</TableCell>
            <TableCell>Description</TableCell>
            <TableCell width={56} align="right">Remove</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {selected.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell sx={{ maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.alias}</TableCell>
              <TableCell sx={{ textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {row.description}
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Remove from selection">
                  <IconButton size="small" onClick={() => removeOne(row.id)}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

export default ProjectFeaturesTable;