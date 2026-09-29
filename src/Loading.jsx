import BioProtectLogo from "./images/bioprotect_logo.gif";
import CardMedia from "@mui/material/CardMedia";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";

const Loading = ({ open }) => {
  return (
    <Dialog
      fullWidth={false}
      maxWidth="sm"
      component="form"
      noValidate
      open={Boolean(open)}
    >
      <DialogTitle>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <CardMedia>
            <img
              srcSet={`${BioProtectLogo}`}
              src={`${BioProtectLogo}`}
              alt="bioprotect logo"
              loading="lazy"
            />
          </CardMedia>
        </div>
      </DialogTitle>
    </Dialog>
  );
};

export default Loading;
