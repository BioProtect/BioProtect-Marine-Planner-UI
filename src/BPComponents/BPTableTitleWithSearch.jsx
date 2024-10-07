import React, { useCallback, useEffect, useMemo, useState } from "react";

import Grid from "@mui/material/Grid";
import SearchIcon from "@mui/icons-material/Search";
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

const BPTableTitleWithSearch = ({
  title,
  numSelected,
  showSearchBox,
  setSearchQuery,
}) => {
  const handleSearchTextChange = (e) => {
    setSearchQuery(e.target.value);
  };
  return (
    <Toolbar>
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        <Grid item xs={3} key={`itemTitle${title}`}>
          {numSelected > 0 ? (
            <Typography variant="h6" component="div">
              {title} ({numSelected} selected)
            </Typography>
          ) : (
            <Typography variant="h6" id="tableTitle" component="div">
              {title}
            </Typography>
          )}
        </Grid>
        <Grid item xs={9} key={`searchbox${title}`}>
          {showSearchBox ? (
            <TextField
              key={`searchKey${title}`}
              size="small"
              id="outlined-start-adornment"
              style={{ width: "100%", padding: 0 }}
              InputProps={{
                startAdornment: <SearchIcon />,
                padding: 0,
              }}
              onChange={(evt) => handleSearchTextChange(evt)}
            />
          ) : null}
        </Grid>
      </Grid>
    </Toolbar>
  );
};

export default BPTableTitleWithSearch;
