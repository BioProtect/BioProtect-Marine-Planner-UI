import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

const AppBarIcon = ({ icon, onClick, title, style }) => {
  return (
    <FontAwesomeIcon
      icon={icon}
      onClick={onClick}
      title={title}
      className={"appBarIcon"}
      style={{ fontSize: style ? style : "20px" }}
    />
  );
};

export default AppBarIcon;
