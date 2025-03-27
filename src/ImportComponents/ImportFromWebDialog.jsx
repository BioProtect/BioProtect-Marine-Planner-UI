import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Button from "@mui/material/Button";
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { setAddToProject } from "../slices/projectSlice";

const SOURCE_TYPES = ["Web Feature Service"];

const ImportFromWebDialog = ({
  setImportFromWebDialogOpen,
  importFeatures,
  loading: parentLoading,
}) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
  const uiDialogs = useSelector((state) => state.ui.dialogStates);
  const projState = useSelector((state) => state.project);
  const [steps] = useState(["type", "endpoint", "layer", "metadata"]);
  const [stepIndex, setStepIndex] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [srs, setSrs] = useState("");
  const [featureTypes, setFeatureTypes] = useState([]);
  const [featureType, setFeatureType] = useState("");
  const [validEndpoint, setValidEndpoint] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleNext = useCallback(() => {
    if (stepIndex === steps.length - 1) {
      importFeaturesHandler();
    } else {
      setStepIndex((prevStepIndex) => prevStepIndex + 1);
    }
  }, [stepIndex, steps.length]);

  const handlePrev = useCallback(() => {
    setStepIndex((prevStepIndex) => prevStepIndex - 1);
  }, []);

  const handleClose = useCallback(() => {
    setStepIndex(0);
    setName("");
    setDescription("");
    setSourceType("");
    setEndpoint("");
    setSrs("");
    setFeatureTypes([]);
    setFeatureType("");
    setValidEndpoint(true);
    setLoading(false);
    setImportFromWebDialogOpen(false);
  }, [setImportFromWebDialogOpen]);

  const getCapabilities = useCallback((endpoint) => {
    return new Promise((resolve, reject) => {
      if (!endpoint.startsWith("http")) {
        reject("Invalid endpoint");
        return;
      }
      fetch(endpoint)
        .then((response) => response.text())
        .then((xml) => resolve(xml))
        .catch((error) => reject(error));
    });
  }, []);

  const changeEndpoint = useCallback((event) => {
    const newValue = event.target.value;
    setEndpoint(newValue);
    setLoading(true);
    setValidEndpoint(true);

    getCapabilities(newValue)
      .then((response) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(response, "text/xml");

        const featureTypesElements = xmlDoc.getElementsByTagName("wfs:FeatureType");
        const parsedFeatureTypes = Array.from(featureTypesElements).map(
          (item) => item.getElementsByTagName("wfs:Name")[0].textContent
        );

        const parsedSrs =
          "EPSG:" + xmlDoc.getElementsByTagName("wfs:DefaultCRS")[0]?.textContent?.substr(-4);

        setFeatureTypes(parsedFeatureTypes);
        setSrs(parsedSrs);
        setLoading(false);
        setValidEndpoint(true);
      })
      .catch(() => {
        setLoading(false);
        setValidEndpoint(false);
      });
  },
    [getCapabilities]
  );

  const importFeaturesHandler = useCallback(() => {
    const getFeatureEndpoint = endpoint.split("request")[0].slice(0, -1);

    importFeatures(name, description, getFeatureEndpoint, srs, featureType)
      .then(handleClose)
      .catch(handleClose);
  }, [endpoint, name, description, srs, featureType, importFeatures, handleClose]);

  const renderStepContent = () => {
    switch (stepIndex) {
      case 0:
        return (
          <Select
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value)}
            displayEmpty
            fullWidth
          >
            {SOURCE_TYPES.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
        );
      case 1:
        return (
          <TextField
            fullWidth
            label="Enter the WFS endpoint"
            value={endpoint}
            error={!validEndpoint}
            helperText={validEndpoint ? "" : "Invalid WFS endpoint"}
            onChange={changeEndpoint}
          />
        );
      case 2:
        return (
          <Select
            value={featureType}
            onChange={(e) => setFeatureType(e.target.value)}
            displayEmpty
            fullWidth
          >
            {featureTypes.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
        );
      case 3:
        return (
          <>
            <TextField
              fullWidth
              label="Enter a name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              fullWidth
              label="Enter a description"
              multiline
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Checkbox
              checked={projState.addToProject}
              onChange={(e) => dispatch(setAddToProject(e.target.checked))}
              label="Add to project"
            />
          </>
        );
      default:
        return null;
    }
  };

  const isNextDisabled = () => {
    switch (stepIndex) {
      case 0:
        return sourceType === "";
      case 1:
        return !validEndpoint || endpoint === "" || loading;
      case 2:
        return featureType === "";
      case 3:
        return name === "" || description === "";
      default:
        return false;
    }
  };

  return (
    <Dialog open={uiDialogs.importFromWebDialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Import from Web</DialogTitle>
      <DialogContent>{renderStepContent()}</DialogContent>
      <DialogActions>
        <Button onClick={handlePrev} disabled={stepIndex === 0 || parentLoading}>
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={isNextDisabled() || parentLoading}
          color="primary"
        >
          {stepIndex === steps.length - 1 ? "Finish" : "Next"}
        </Button>
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportFromWebDialog;
