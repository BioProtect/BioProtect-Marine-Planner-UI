export const FEATURE_PROPERTIES_CORE = [
  {
    name: "id",
    key: "ID",
    hint: "The unique identifier for the feature",
    showForOld: false,
    showForNew: false,
  },
  {
    name: "alias",
    key: "Alias",
    hint: "A human readable name for the feature",
    showForOld: false,
    showForNew: false,
  },
  {
    name: "feature_class_name",
    key: "Feature class name",
    hint: "The internal name for the feature in the PostGIS database",
    showForOld: false,
    showForNew: false,
  },
  {
    name: "description",
    key: "Description",
    hint: "Full description of the feature",
    showForOld: false,
    showForNew: false,
  },
  {
    name: "creation_date",
    key: "Creation date",
    hint: "The date the feature was created or imported",
    showForOld: false,
    showForNew: false,
  },
  {
    name: "tilesetid",
    key: "Mapbox ID",
    hint: "The unique identifier of the feature tileset in Mapbox",
    showForOld: false,
    showForNew: false,
  },
  {
    name: "target_value",
    key: "Target percent",
    hint: "The target percentage for the feature within the planning grid",
    showForOld: true,
    showForNew: true,
  },
  {
    name: "spf",
    key: "Species Penalty Factor",
    hint: "The species penalty factor is used to weight the likelihood of getting a species in the results",
    showForOld: true,
    showForNew: true,
  },
  {
    name: "preprocessed",
    key: "Preprocessed",
    hint: "Whether or not the feature has been intersected with the planning units",
    showForOld: false,
    showForNew: true,
  },
  {
    name: "pu_count",
    key: "Planning unit count",
    hint: "The number of planning units that intersect the feature (calculated during pre-processing)",
    showForOld: true,
    showForNew: true,
  },
];
//application level global constants
export const INITIAL_VARS = {
  CLIENT_VERSION: "v1.0.8",
  SERVER_VERSION: "v1.0.8",
  WDPA: {
    latest_version: "February 2023",
    downloadUrl: "http://wcmc.io/wdpa_current_release",
    tilesUrl: "https://geospatial.jrc.ec.europa.eu/geoserver/gwc/service/wmts?",
    metadataUrl:
      "https://www.protectedplanet.net/en/resources/february-2023-update-of-the-wdpa-and-wd-oecm",
  },

  NOTIFICATIONS: [
    {
      id: 1,
      html: "The <a href='https://andrewcottam.github.io/marxan-web/documentation/docs_betatest.html' target='_blank'>Beta Test Programme</a> ends at the end of October. Let us know what you think!",
      type: "News",
      expires: "10/31/2019",
      showForRoles: ["Admin", "User", "ReadOnly"],
    },
    {
      id: 2,
      html: "Tonga has achieved its marine Aichi Target 11, maybe - see <a href='http://macbio-pacific.info/updates/'' target='_blank'>here</a>",
      type: "News",
      expires: "01/01/2020",
      showForRoles: ["Admin", "User", "ReadOnly"],
    },
    {
      id: 3,
      html: "New training course for Marxan Web, maybe",
      type: "Training",
      expires: "01/01/2020",
      showForRoles: ["Admin", "User", "ReadOnly"],
    },
    {
      id: 4,
      html: "Zero draft of the <a href='https://www.cbd.int/article/2020-01-10-19-02-38' target='_blank'>Post-2020 Global Biodiversity Framework</a> published by the Convention on Biological Diversity Secretariat",
      type: "News",
      expires: "10/09/2020",
      showForRoles: ["Admin", "User", "ReadOnly"],
    },
    {
      id: 5,
      html: "<i>'Spatial action planning for biodiversity in 2020 and beyond'</i>. Marxan Web Training Session on 14/06/2020 at the World Conservation Congress in Marseille",
      type: "Training",
      expires: "14/06/2020",
      showForRoles: ["Admin", "User", "ReadOnly"],
    },
  ],
};
// H3 resolutions offered for planning grids
// areaKm2 is H3's average cell area, used to estimate cell counts
export const RESOLUTIONS = [
  { label: "Basin resolution (36 km²)", value: 6, areaKm2: 36.129 },
  { label: "Regional resolution (5 km²)", value: 7, areaKm2: 5.161 },
  { label: "Mid Regional Local resolution (0.7 km²)", value: 8, areaKm2: 0.7373 },
  { label: "Local resolution (0.1 km²)", value: 9, areaKm2: 0.1053 },
];

// New grids: suggest the finest resolution at or under SUGGEST_MAX_CELLS,
// warn above WARN_CELLS (Prioritizr with a boundary penalty gets slow)
export const SUGGEST_MAX_CELLS = 50_000;
export const WARN_CELLS = 200_000;

export const cellsAt = (areaKm2, r) => Math.round(areaKm2 / r.areaKm2);

// Finest resolution under the target, else the coarsest
export const suggestResolution = (areaKm2) =>
  [...RESOLUTIONS].reverse().find((r) => cellsAt(areaKm2, r) <= SUGGEST_MAX_CELLS)
    ?.value ?? RESOLUTIONS[0].value;

export const resolutionLabel = (res) =>
  RESOLUTIONS.find((r) => r.value === Number(res))?.label ?? "-";

// "#rrggbb" -> "rgba(r, g, b, a)"
export const hexToRgba = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

// Map palette: "Viridis and amber" from src/colourblind-palettes.examples.html.
// Both ramps change steadily in lightness, so they hold up for colour-blind
// viewers, in greyscale and in print. Ramps run low -> high.
export const PALETTE = {
  results: ["#cae11f", "#7fd34e", "#3fbc73", "#1fa287", "#24868e", "#2f6b8e", "#3e4c8a", "#482979", "#440154"],
  costs: ["#fff9c5", "#feeaa0", "#fed26d", "#feb13e", "#f88b22", "#e56910", "#c84a02", "#9b3504", "#6e2706"],
  lockedIn: "#3b528b",
  lockedOut: "#e66101",
  features: ["#4477AA", "#EE6677", "#228833", "#CCBB44", "#66CCEE", "#AA3377", "#BBBBBB"],
  protectedAreas: "#35b779",
  activities: "#e0c200",
};

export const CONSTANTS = {
  DOCS_ROOT: "https://docs.marxanweb.org/",
  ERRORS_PAGE: "https://docs.marxanweb.org/errors.html",
  // SEND_CREDENTIALS: true, //if true all post requests will send credentials
  SEND_CREDENTIALS: "include",
  TORNADO_PATH: "/server/",
  TIMEOUT: 0, //disable timeout setting
  // MAPBOX_USER: "blishten",
  MAPBOX_USER: "craicerjack",
  MAPBOX_STYLE_PREFIX: "mapbox://styles/",
  PLANNING_UNIT_STATUSES: [1, 2, 3],
  IUCN_CATEGORIES: [
    "None",
    "IUCN I-II",
    "IUCN I-IV",
    "IUCN I-V",
    "IUCN I-VI",
    "All",
  ],
  //constants for creating new planning grids
  DOMAINS: ["Marine", "Terrestrial"],
  SHAPES: ["Hexagon", "Square"],
  AREAKM2S: [10, 20, 30, 40, 50, 100],
  //layer source names
  WDPA_SOURCE_NAME: "wdpa_src",
  //layer names
  PU_LAYER_NAME: "bioprotect_pu_layer", //layer showing the planning units
  STATUS_LAYER_NAME: "bioprotect_pu_status_layer", //layer showing the status of planning units
  COSTS_LAYER_NAME: "bioprotect_pu_costs_layer", //layer showing the cost of planning units
  RESULTS_LAYER_NAME: "bioprotect_pu_results_layer", //layer for either the sum of solutions or the individual solutions
  // WDPA reference layer. Only the fill has the martin_ prefix, so it alone
  // gets a legend entry; the outline is wdpa_line.
  WDPA_LAYER_NAME: "martin_wdpa_fill",
  WDPA_LINE_LAYER_NAME: "wdpa_line",
  WDPA_COLOR: PALETTE.protectedAreas,
  LAYER_TYPE_SUMMED_SOLUTIONS: "summed_solutions",
  LAYER_TYPE_PLANNING_UNITS: "pus",
  LAYER_TYPE_PLANNING_UNITS_COST: "cost",
  LAYER_TYPE_PLANNING_UNITS_STATUS: "status",
  LAYER_TYPE_PROTECTED_AREAS: "pas",
  LAYER_TYPE_FEATURE_LAYER: "feature",
  LAYER_TYPE_FEATURE_PU_LAYER: "feature_puid",
  LAYER_TYPE_ACTIVITY: "activity",
  //planning unit statuses
  PU_STATUS_DEFAULT: {
    fillColor: "white",
    strokeColor: "gray",
    label: "Default",
  },
  PU_STATUS_LOCKED_IN: {
    fillColor: PALETTE.lockedIn,
    strokeColor: "transparent",
    label: "Locked in",
  },
  PU_STATUS_LOCKED_OUT: {
    fillColor: PALETTE.lockedOut,
    strokeColor: "transparent",
    label: "Locked out",
  },
  //layer default styles
  PU_LAYER_OPACITY: 0.6,
  PU_COSTS_LAYER_OPACITY: 0.3,
  STATUS_LAYER_LINE_WIDTH: 1.5,
  WDPA_FILL_LAYER_OPACITY: 0.15,
  WDPA_FILL_MIN_ZOOM: 5, // outline only below this - fills just turn coasts green
  FEATURE_LAYER_OPACITY: 0.9,
  FEATURE_PLANNING_GRID_LAYER_OPACITY: 0.9,
  ACTIVITY_LAYER_OPACITY: 0.55,
  RESULTS_LAYER_OPACITY: 0.8,
  COST_COLORS: PALETTE.costs.map((c) => hexToRgba(c, 0.8)),
  UNIFORM_COST_NAME: "Equal area",
  //an array of feature property information that is used in the Feature Information dialog box - showForOld sets whether that property is shown for old versions of bioprotect
  FEATURE_PROPERTIES_POLYGONS: FEATURE_PROPERTIES_CORE.concat([
    {
      name: "area",
      key: "Total area",
      hint: "The total area for the feature in Km2 (i.e. globally)",
      showForOld: false,
      showForNew: false,
    },
    {
      name: "pu_area",
      key: "Planning grid area",
      hint: "The area of the feature within the planning grid in Km2 (calculated during pre-processing)",
      showForOld: true,
      showForNew: true,
    },
    {
      name: "target_area",
      key: "Target area",
      hint: "The total area that needs to be protected to achieve the target percentage in Km2 (calculated during a Marxan Run)",
      showForOld: true,
      showForNew: true,
    },
    {
      name: "protected_area",
      key: "Area protected",
      hint: "The total area protected in the current solution in Km2 (calculated during a Marxan Run)",
      showForOld: true,
      showForNew: true,
    },
  ]),
  FEATURE_PROPERTIES_POINTS: FEATURE_PROPERTIES_CORE.concat([
    {
      name: "area",
      key: "Total",
      hint: "The total amount for the feature (i.e. globally)",
      showForOld: false,
      showForNew: false,
    },
    {
      name: "pu_area",
      key: "Planning grid amount",
      hint: "The total amount of the feature within the planning grid (calculated during pre-processing)",
      showForOld: true,
      showForNew: true,
    },
    {
      name: "target_area",
      key: "Target amount",
      hint: "The amount that needs to be protected to achieve the target percentage (calculated during a Marxan Run)",
      showForOld: true,
      showForNew: true,
    },
    {
      name: "protected_area",
      key: "Protected amount",
      hint: "The amount protected in the current solution (calculated during a Marxan Run)",
      showForOld: true,
      showForNew: true,
    },
  ]),
};
export default CONSTANTS;
