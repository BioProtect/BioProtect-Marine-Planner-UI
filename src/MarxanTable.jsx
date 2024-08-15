/*
 * Copyright (c) 2020 Andrew Cottam.
 *
 * This file is part of marxanweb/marxan-client
 * (see https://github.com/marxanweb/marxan-client).
 *
 * License: European Union Public Licence V. 1.2, see https://opensource.org/licenses/EUPL-1.2
 */

import React, { useMemo } from "react";

import { Table } from "@mui/material";

const MarxanTable = (props) => {
  console.log("props ", props);
  const filterData = () => {
    if (!props.searchText) {
      return props.data;
    }

    return props.data.filter((item) => {
      const searchTextLower = props.searchText.toLowerCase();

      if (searchTextLower.startsWith("!")) {
        return !Object.keys(item).some(
          (key) =>
            props.searchColumns.includes(key) &&
            item[key] &&
            item[key].toLowerCase().includes(searchTextLower.substring(1))
        );
      } else {
        return Object.keys(item).some(
          (key) =>
            props.searchColumns.includes(key) &&
            item[key] &&
            item[key].toLowerCase().includes(searchTextLower)
        );
      }
    });
  };

  const filteredData = useMemo(
    () => filterData(),
    [props.data, props.searchText, props.searchColumns]
  );
  console.log("filterData ", filterData);
  console.log("filteredData ", filteredData);

  if (props.dataFiltered) {
    props.dataFiltered(filteredData);
  }

  return (
    <Table
      {...props}
      data={filteredData}
      className="projectsReactTable noselect"
    />
  );
};

export default MarxanTable;
