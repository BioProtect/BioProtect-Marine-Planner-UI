import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

class AppBarIcon extends React.Component {
  render() {
    return (
      <FontAwesomeIcon
        icon={this.props.icon}
        onClick={this.props.onClick}
        title={this.props.title}
        className={"appBarIcon"}
        style={{ fontSize: this.props.style ? this.props.style : "20px" }}
      />
    );
  }
}

export default AppBarIcon;
