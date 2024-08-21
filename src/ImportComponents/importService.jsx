import { _post, dialogsState, messageLogger, setDialogsState } from "../App";

// Uploads a single file to a specific folder - value is the filename
export const uploadFileToFolder = async (value, filename, destFolder) => {
  setDialogsState((prevState) => ({ ...prevState, loading: true }));

  const formData = new FormData();
  formData.append("value", value); // The binary data for the file
  formData.append("filename", filename); // The filename
  formData.append("destFolder", destFolder); // The folder to upload to

  try {
    return await _post("uploadFileToFolder", formData);
  } catch (error) {
    throw new Error("Failed to upload file to folder");
  }
};

//uploads a list of files to the current project
export const uploadFiles = async (files, project) => {
  for (const file of files) {
    if (file.name.endsWith(".dat")) {
      const formData = new FormData();
      formData.append("user", dialogsState.owner); // Updated reference to dialogsState
      formData.append("project", project);

      const filepath = file.webkitRelativePath.split("/").slice(1).join("/");
      formData.append("filename", filepath);
      formData.append("value", file);

      messageLogger({
        method: "uploadFiles",
        status: "Uploading",
        info: `Uploading: ${file.webkitRelativePath}`,
      });

      await _post("uploadFile", formData);
    }
  }
};

//uploads a single file to the current projects input folder
export const uploadFileToProject = async (value, filename) => {
  const formData = new FormData();
  formData.append("user", dialogsState.owner);
  formData.append("project", dialogsState.project);
  formData.append("filename", `input/${filename}`);
  formData.append("value", value);

  try {
    return await _post("uploadFile", formData);
  } catch (error) {
    throw new Error("Failed to upload file");
  }
};
