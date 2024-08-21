// Import necessary dependencies (adjust the path as needed)
import {
  _get,
  _post,
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

// Helper function to prepare form data
const prepareFormDataNewProject = (project, user) => {
  const formData = new FormData();
  formData.append("user", user);
  formData.append("project", project.name);
  formData.append("description", project.description);
  formData.append("planning_grid_name", project.planning_grid_name);
  formData.append(
    "interest_features",
    project.features.map((item) => item.id).join(",")
  );
  formData.append("target_values", project.features.map(() => 17).join(","));
  formData.append("spf_values", project.features.map(() => 40).join(","));

  return formData;
};

//REST call to create a new import project from the wizard
const createImportProject = async (project) => {
  const formData = new FormData();
  formData.append("user", dialogsState.user);
  formData.append("project", project);
  return await _post("createImportProject", formData);
};
