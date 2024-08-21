// Import necessary dependencies (adjust the path as needed)
import {
  _get,
  getProjectsForPlanningGrid,
  showProjectListDialog,
} from "../App";
// adjust the import paths

export const getProjectList = async (obj, _type) => {
  try {
    let projects;

    if (_type === "feature") {
      projects = await getProjectsForFeature(obj);
    } else {
      projects = await getProjectsForPlanningGrid(obj.feature_class_name);
    }

    showProjectListDialog(
      projects,
      "Projects list",
      "The feature is used in the following projects:"
    );
  } catch (error) {
    console.error("Error fetching project list:", error);
    // Optionally: handle the error (e.g., show a user-friendly message)
  }
};

//gets a list of projects for a feature
export const getProjectsForFeature = async (feature) => {
  // Fetch the projects associated with the given feature
  const response = await this._get(
    `listProjectsForFeature?feature_class_id=${feature.id}`
  );
  return response.projects;
};
