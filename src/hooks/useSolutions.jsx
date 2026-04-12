//calls the marxan executeable and runs it getting the output streamed through websockets
const startMarxanJob = async (user, proj) => {
  try {
    // Make the request to get the Marxan data
    return await handleWebSocket(`runMarxan?user=${user}&project=${proj}`);
  } catch (error) {
    console.error("Error starting Marxan job:", error);
    throw error; // Re-throw the error to handle it further up the call stack if needed
  }
};

//gets the results for a project
const getResults = async (user, proj) => {
  user = user || userData.username;
  try {
    const response = await _get(`getResults?user=${user}&project=${proj.name}`);
    runCompleted(response);
    return "Results retrieved";
  } catch (error) {
    console.error("Unable to get results:", error);
    throw new Error("Unable to get results"); // Optionally re-throw the error for further handling
  }
};

//run completed
const runCompleted = (response) => {
  setRunMarxanResponse(response);

  // Check if solutions are present
  if (response.ssoln?.length > 0) {
    showMessage(response.info, "success");
    renderSolution(response.ssoln, true);

    // Map the solutions to the required format
    const solutions = response.summary.map((item) => {
      return {
        Run_Number: item[0],
        Score: Number(item[1]).toFixed(1),
        Cost: Number(item[2]).toFixed(1),
        Planning_Units: item[3],
        Missing_Values: item[12],
      };
    });

    // Add the summed solution row
    solutions.unshift({
      Run_Number: "Sum",
      Score: "",
      Cost: "",
      Planning_Units: "",
      Missing_Values: "",
    });

    updateProtectedAmount(response.mvbest);
    setSolutions(solutions);
  } else {
    // No solutions available
    setSolutions([]);
  }
};

// Get the protected area information in m2 from marxan run and populate interest features with the values
const updateProtectedAmount = (mvData) => {
  // Create a map for quick lookup of mvData by feature ID
  const mvDataMap = new Map(
    mvData.map(([id, , targetArea, protectedArea]) => [
      id,
      { targetArea, protectedArea },
    ]),
  );

  // Update features with corresponding data from mvData
  const updatedFeatures = featureState.allFeatures.map((feature) => {
    const mvItem = mvDataMap.get(feature.id);
    if (mvItem) {
      return {
        ...feature,
        target_area: mvItem.targetArea,
        protected_area: mvItem.protectedArea,
      };
    }
    return feature;
  });

  // Update state with the updated features
  dispatch(setAllFeatures(updatedFeatures));
  dispatch(setProjectFeatures(updatedFeatures.filter((item) => item.selected)));
};

//updates the planning unit file with any changes - not implemented yet
const updatePuFile = () => {};

const updatePuvsprFile = async () => {
  try {
    // Preprocess features to create the puvspr.dat file on the server
    // Done on demand when the project is run because the user may add/remove Conservation features dynamically
    await preprocessAllFeatures();
  } catch (error) {
    throw error; // Rethrow the error to be handled by the caller if necessary
  }
};

//run a marxan job on the server
const runMarxan = async (event) => {
  startLogging(); // start the logging
  setRunMarxanResponse({});
  setSolutions([]); // reset the run results

  try {
    //update the spec.dat file with any that have been added or removed or changed target or spf
    await updateProjectFeatures();
    updatePuFile(); // when the species file has been updated, update the planning unit file
  } catch (error) {
    console.error(error);
  }

  try {
    await updatePuvsprFile(); // update the PuVSpr file - preprocessing using websockets
  } catch (error) {
    console.error(error);
  }

  try {
    const response = await startMarxanJob(uiState.owner, projState.project); //start the marxan job
    await getRunLogs(); //update the run log

    if (!checkForErrors(response)) {
      await getResults(response.user, response.project); //run completed - get the results
      setPUTabInactive(); //switch to the features tab
    } else {
      setSolutions([]); //set state with no solutions
    }
  } catch (error) {
    marxanStopped(error);
  }
};

//stops a process running on the server
const stopProcess = async (pid) => {
  try {
    await _get(`stopProcess?pid=${pid}`, 10000);
  } catch (error) {
    console.log(error);
  }
  await getRunLogs();
};

//ui feedback when marxan is stopped by the user
const marxanStopped = async () => await getRunLogs();

// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// CLASSIFICATION AND RENDERING
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------- //
//gets the total number of planning units in the ssoln and outputs the statistics of the distribution to state, e.g. 2 PUs with a value of 1, 3 with a value of 2 etc.
const getssolncount = (data) => {
  let total = 0;
  const summaryStats = data.map((item) => {
    const count = item[1].length;
    total += count;
    return { number: item[0], count };
  });

  setSummaryStats(summaryStats);
  return total;
};

//gets a sample of the data to be able to do a classification, e.g. natural breaks, jenks etc.
const getSsolnSample = (data, sampleSize) => {
  const ssolnLength = getssolncount(data);
  // Use the ceiling function to force outliers to be in the classification, i.e. those planning units that were only selected in 1 solution
  return data.flatMap((item) => {
    const num = Math.ceil((item[1].length / ssolnLength) * sampleSize);
    return Array(num).fill(item[0]);
  });
};

//get all data from the ssoln arrays
const getSsolnData = (data) => data.flatMap((item) => item[1]);

// Gets the classification and colorbrewer object for doing the rendering
const classifyData = (data, numClasses, colorCode, classification) => {
  //get a sample of the data to make the renderer classification
  const sample = getSsolnSample(data, 1000); //samples dont work
  // let sample = this.getSsolnData(data); //get all the ssoln data
  brew.setSeries(sample);
  const brew = brew;
  // If the colorCode is opacity then calculate the rgba values dynamically and add them to the color schemes
  if (colorCode === "opacity") {
    const { opacity } = brew.colorSchemes;

    //see if we have already created a brew color scheme for opacity with NUMCLASSES
    if (!opacity || !opacity[projState.renderer.NUMCLASSES]) {
      const newBrewColorScheme = Array.from(
        { length: projState.renderer.NUMCLASSES },
        (_, index) =>
          `rgba(255,0,136,${(1 / projState.renderer.NUMCLASSES) * (index + 1)})`,
      );
      //add the new color scheme
      if (brew.colorSchemes.opacity === undefined) {
        brew.colorSchemes.opacity = [];
      }
      // Update the Brew color schemes state
      setBrew((prevState) => ({
        ...prevState, // Spread the existing state
        colorSchemes: {
          ...prevState.colorSchemes, // Use prevState to maintain the existing colorSchemes
          opacity: {
            ...prevState.colorSchemes.opacity, // Preserve existing opacity settings
            [projState.renderer.NUMCLASSES]: newBrewColorScheme, // Add or update the NUMCLASSES key
          },
        },
      }));
    }
  }
  // Set the color code - see the color theory section on Joshua Tanners page here https://github.com/tannerjt/classybrew - for all the available colour codes
  brew.setColorCode(colorCode);
  //get the maximum number of colors in this scheme
  const colorSchemeLength = getMaxNumberOfClasses(brew, colorCode);
  //check the color scheme supports the passed number of classes
  if (numClasses > colorSchemeLength) {
    //set the numClasses to the max for the color scheme
    numClasses = colorSchemeLength;
    //reset the renderer
    dispatch(
      setRenderer((prevState) => ({
        ...prevState,
        NUMCLASSES: finalNumClasses, // Update or add the NUMCLASSES property
      })),
    );
  }
  //set the number of classes
  brew.setNumClasses(numClasses);
  //set the classification method - one of equal_interval, quantile, std_deviation, jenks (default)
  brew.classify(classification);
};

//called when the renderer state has been updated - renders the solution and saves the renderer back to the server
const rendererStateUpdated = async (parameter, value) => {
  renderSolution(runMarxanResponse.ssoln, true);
  if (userData?.role !== "ReadOnly")
    await updateProjectParameter(parameter, value);
};

//change the renderer, e.g. jenks, natural_breaks etc.
const changeRenderer = async (renderer) => {
  // Update state and wait for the update to complete
  dispatch(
    setRenderer((prevState) => ({
      ...prevState,
      CLASSIFICATION: renderer,
    })),
  );

  // Call the async function after the state has been updated
  await rendererStateUpdated("CLASSIFICATION", renderer);
};

//change the number of classes of the renderer
const changeNumClasses = async (numClasses) => {
  setRenderer((prevState) => ({
    ...prevState,
    NUMCLASSES: numClasses,
  }));
  // Call the async function after the state has been updated
  await rendererStateUpdated("NUMCLASSES", numClasses);
};

const changeColorCode = async (colorCode) => {
  // Ensure NUMCLASSES is not greater than the max allowed by brew
  const newState = { COLORCODE: colorCode };
  if (renderer.NUMCLASSES > brew.getNumClasses()) {
    newState[NUMCLASSES] = brew.getNumClasses();
  }
  setRenderer((prevState) => ({
    ...prevState,
    ...newState,
  }));
  await rendererStateUpdated("COLORCODE", colorCode);
};

//change how many of the top classes only to show
const changeShowTopClasses = async (numClasses) => {
  setRenderer((prevState) => ({
    ...prevState,
    TOPCLASSES: numClasses,
  }));
  await rendererStateUpdated("TOPCLASSES", numClasses);
};

// Helper function to get visible value based on renderer settings
const getVisibleValue = (renderer, brew) => {
  if (renderer.TOPCLASSES < renderer.NUMCLASSES) {
    const breaks = brew.getBreaks();
    return breaks[renderer.NUMCLASSES - renderer.TOPCLASSES + 1];
  }
  return 0;
};

// Helper function to update expressions based on value
const updateExpressions = (row, value, color, visibleValue, expressions) => {
  const [fillColorExpr, fillOutlineColorExpr] = expressions;
  if (value >= visibleValue) {
    fillColorExpr.push(row[1], color);
    fillOutlineColorExpr.push(row[1], "rgba(150, 150, 150, 0.6)"); // gray outline
  } else {
    fillColorExpr.push(row[1], "rgba(0, 0, 0, 0)");
    fillOutlineColorExpr.push(row[1], "rgba(0, 0, 0, 0)");
  }
};

//initialises the fill color expression for matching on attributes values
const initialiseFillColorExpression = (attribute) => [
  "match",
  ["get", attribute],
];

//renders the solution - data is the REST response and sum is a flag to indicate if the data is the summed solution (true) or an individual solution (false)
const renderSolution = (data, sum) => {
  if (!data) return;
  const paintProperties = getPaintProperties(data, sum, true);
  //set the render paint property
  map.current.setPaintProperty(
    CONSTANTS.RESULTS_LAYER_NAME,
    "fill-color",
    paintProperties.fillColor,
  );
  map.current.setPaintProperty(
    CONSTANTS.RESULTS_LAYER_NAME,
    "fill-outline-color",
    paintProperties.oulineColor,
  );
};
