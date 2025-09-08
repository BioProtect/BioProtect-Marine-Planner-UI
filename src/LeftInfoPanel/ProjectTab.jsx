import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { selectCurrentUser } from "@slices/authSlice";
import { useSelector } from "react-redux";
import { useState } from "react";

const ProjectTabContent = ({
  toggleProjectPrivacy,
  owner,
  updateDetails
}) => {
  const userData = useSelector(selectCurrentUser);
  const projState = useSelector((state) => state.project);
  const metadata = projState.projectData.metadata
  const project = projState.projectData.project
  const [editing, setEditing] = useState(false);
  const handleChange = (e) => {
    setEditing(false);
    updateDetails(e);
  };
  return (
    <div>
      <Card sx={{ minWidth: 275 }}>
        <CardContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

            <Typography variant="h5" component="div">
              Description
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {editing ? (
                <TextField
                  id="descriptionEdit"
                  variant="standard"               // clean underline style
                  value={project.description}
                  autoFocus
                  onChange={(e) => handleChange(e.target.value)}
                  onBlur={() => setEditing(false)} // leave edit mode on blur
                  InputProps={{ disableUnderline: false }}
                  fullWidth
                />
              ) : (
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() => setEditing(true)}
                >
                  {project.description || "Click to add a description"}
                </span>
              )}
            </Typography>
            <Typography variant="h5" component="div">
              Created
            </Typography>

            <Typography variant="body2">
              <span className="createDate">  {new Date(metadata.createdate.split(".")[0] + "Z").toLocaleString()}</span>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {userData.username !== owner && (
                <span className="tabTitle tabTitleTopMargin">Created by</span>
              )}
              <br />
              {userData.username !== owner && (
                <span className="createDate">{owner || userData.username}</span>
              )}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectTabContent;
