import CastForEducationIcon from "@mui/icons-material/CastForEducation";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import React from "react";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
class Notification extends React.Component {
  render() {
    var icon;
    switch (this.props.type) {
      case "Hardware Issue":
        icon = (
          <ReportProblemIcon
            style={{ color: "red", paddingRight: "5px", fontSize: "18px" }}
          />
        );
        break;
      case "Data Update":
      case "Software Update":
        icon = (
          <CloudOffIcon
            style={{
              color: "rgba(255,0,0,0.7)",
              paddingRight: "5px",
              fontSize: "18px",
            }}
          />
        );
        break;
      case "Training":
        icon = (
          <CastForEducationIcon
            style={{ paddingRight: "5px", fontSize: "18px" }}
          />
        );
        break;
      case "News":
        icon = (
          <NewspaperIcon style={{ paddingRight: "5px", fontSize: "18px" }} />
        );
        break;
      default:
        icon = null;
      // code
    }
    return (
      <div className={"notification"}>
        <div className={"notificationType"} title={this.props.type}>
          {icon}
          <span
            dangerouslySetInnerHTML={{ __html: this.props.html }}
            className={"notificationText"}
          ></span>
          <span
            className={"removeNotification"}
            onClick={this.props.removeNotification}
            title={"Dismiss"}
          >
            x
          </span>
        </div>
      </div>
    );
  }
}

export default Notification;
