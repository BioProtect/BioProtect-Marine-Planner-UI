import {
  _get,
  _post,
  appendToFormData,
  dialogsState,
  loadProject,
  setDialogsState,
  setSnackBar,
} from "../App";

const removeKeys = (obj, keys) => {
  // Create a shallow copy of the object to avoid mutating the original
  const newObj = { ...obj };
  // Iterate over the keys and delete each key from the new object
  keys.forEach((key) => {
    delete newObj[key];
  });
  return newObj;
};

//deletes all of the projects belonging to the passed user from the state
const deleteProjectsForUser = (user) => {
  const updatedProjects = dialogsState.projects.filter(
    (project) => project.user !== user
  );
  setDialogsState((prevState) => ({ ...prevState, projects: updatedProjects }));
};

export const createNewUser = async (user, password, name, email) => {
  const formData = new FormData();
  formData.append("user", user);
  formData.append("password", password);
  formData.append("fullname", name);
  formData.append("email", email);

  try {
    const response = await _post("createUser", formData);
    // UI feedback
    setSnackBar(response.info);
    // Update state to reflect user registration
    setDialogsState((prevState) => ({
      ...prevState,
      registerDialogOpen: false,
      user: user,
      password: "",
    }));
  } catch (error) {
    console.error("Error creating user:", error);
  }
};

export const updateUser = async (parameters, user = dialogsState.user) => {
  try {
    // Remove keys that are not part of the user's information
    const filteredParameters = removeKeys(parameters, [
      "updated",
      "validEmail",
    ]);
    const formData = new FormData();
    formData.append("user", user);
    appendToFormData(formData, filteredParameters);

    const response = await _post("updateUserParameters", formData);
    // If successful, update the state if the current user is being updated
    if (dialogsState.user === user) {
      // Update local user data
      const newUserData = { ...dialogsState.userData, ...filteredParameters };
      // Update state
      setDialogsState((prevState) => ({
        ...prevState,
        userData: newUserData,
      }));
    }
    return newUserData; // Optionally return response if needed elsewhere
  } catch (error) {
    console.error("Error updating user:", error);
    throw error; // Optional: rethrow error if you want to handle it further up the call stack
  }
};

export const deleteUser = async (user) => {
  try {
    // Send request to delete the user
    await _get(`deleteUser?user=${user}`);
    setSnackBar("User deleted");

    // Update local state to remove the deleted user
    const usersCopy = dialogsState.users.filter((item) => item.user !== user);
    setDialogsState((prevState) => ({
      ...prevState,
      users: usersCopy,
    }));

    // Check if the current project belongs to the deleted user
    if (dialogsState.owner === user) {
      setSnackBar("Current project no longer exists. Loading next available.");

      // Load the next available project
      const nextProject = dialogsState.projects.find(
        (project) => project.user !== user
      );
      if (nextProject) {
        // Import loadProject from the appropriate file if necessary
        await loadProject(nextProject.name, nextProject.user);
      }

      // Import deleteProjectsForUser from the appropriate file if necessary
      deleteProjectsForUser(user);
    }
  } catch (error) {
    // Handle errors
    console.error("Failed to delete user:", error);
    setSnackBar("Failed to delete user");
  }
};

export const getUsers = async () => {
  try {
    const response = await _get("getUsers");
    setDialogsState((prevState) => ({ ...prevState, users: response.users }));
  } catch (error) {
    setDialogsState((prevState) => ({ ...prevState, users: [] }));
  }
};
