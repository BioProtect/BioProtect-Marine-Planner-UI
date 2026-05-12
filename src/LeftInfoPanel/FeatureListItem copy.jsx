const content = (
  <ListItem
    key={"feature" + id}
    sx={{
      borderLeft: item.preprocessed
        ? "4px solid #1990FF"
        : "4px solid transparent",
      pl: 1,
      bgcolor: isActive
        ? "rgba(25, 144, 255, 0.18)" // highlight when active
        : item.preprocessed
          ? "rgba(32, 129, 35, 0.06)" // preprocessed only
          : "transparent",
      borderRadius: 1,
    }}
    secondaryAction={
      <IconButton
        edge="end"
        onClick={(evt) => handleIconClick(evt, id)}
        sx={{ ml: 1 }}
      >
        <MoreVertIcon sx={{ color: grey[400] }} />
      </IconButton>
    }
  >
    {/* Goal */}
    <ListItemAvatar>
      <TargetAvatar
        target_value={target_value}
        updateTargetValue={handleTargetChange}
        feature={item}
        // targetStatus={
        //   area === 0
        //     ? "Does not occur in planning area"
        //     : protectedPercent === -1
        //       ? "Unknown"
        //       : protected_area >= item.target_area
        //         ? "Target achieved"
        //         : "Target missed"
        // }
        visible={area !== 0}
      />
    </ListItemAvatar>

    <ListItemText
      onClick={(evt) => handleItemClick(evt, item)}
      primary={item.alias.replaceAll("_", " ")}
      primaryTypographyProps={{ variant: "body2" }}
      sx={{ flex: 1 }}
      secondaryTypographyProps={{ component: "div" }}
      secondary={<LinearGauge value={target_value} achieved={achieved} />}
    />
  </ListItem>
);
