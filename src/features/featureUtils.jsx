//adds the required attributes for the features to work in the marxan web app - these are the default values
const addFeatureAttributes = (item) => {
  const defaultAttributes = {
    selected: false, // if the feature is currently selected (i.e. in the current project)
    preprocessed: false, // has the feature already been intersected with the planning grid to populate the puvspr.dat file
    pu_area: -1, // the area of the feature within the planning grid
    pu_count: -1, // the number of planning units that the feature intersects with
    spf: 40, // species penalty factor
    target_value: 17, // the target value for the feature to protect as a percentage
    target_area: -1, // the area of the feature that must be protected to meet the targets percentage
    protected_area: -1, // the area of the feature that is protected
    feature_layer_loaded: false, // is the feature's distribution currently visible on the map
    feature_puid_layer_loaded: false, // are the planning units that intersect the feature currently visible on the map
    occurs_in_planning_grid: false, // does the feature occur in the planning grid
    // color: window.colors[item.id % window.colors.length], // color for the map layer and analysis outputs
    in_filter: true, // true if the feature is currently visible in the features dialog
  };
  return { ...item, ...defaultAttributes };
};

export { addFeatureAttributes };
