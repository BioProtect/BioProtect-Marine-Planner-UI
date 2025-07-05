import { useDispatch, useSelector } from "react-redux";

import React from "react";
import { switchProject } from "@slices/projectSlice"; // or your thunk to reload project

const availableResolutions = [6, 7, 8]; // or full range: [1, 2, ..., 9]

const ResolutionSelector = ({ currentResolution }) => {
  const dispatch = useDispatch();
  const projectId = useSelector((state) => state.project.projectData.project.id);

  const handleChange = async (e) => {
    const newRes = parseInt(e.target.value, 10);
    // Reload the project with the new resolution
    dispatch(switchProject({ projectId, resolution: newRes }));
  };

  return (
    <div>
      <label>Scale: </label>
      <select value={currentResolution} onChange={handleChange}>
        {availableResolutions.map((res) => (
          <option key={res} value={res}>
            Resolution {res}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ResolutionSelector;
