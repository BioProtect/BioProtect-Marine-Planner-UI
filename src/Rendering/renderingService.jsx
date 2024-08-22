import {
  dialogsState,
  renderSolution,
  setDialogsState,
  updateProjectParameter,
} from "../App";
import { getMaxNumberOfClasses, zoomToBounds } from "../Helpers";

import { getSsolnSample } from "../Solutions/solutionsService";

// Gets the classification and colorbrewer object for doing the rendering
export const classifyData = (data, numClasses, colorCode, classification) => {
  //get a sample of the data to make the renderer classification
  const sample = getSsolnSample(data, 1000); //samples dont work
  // let sample = this.getSsolnData(data); //get all the ssoln data
  dialogsState.brew.setSeries(sample);
  const brew = dialogsState.brew;
  const renderer = dialogsState.renderer;
  // If the colorCode is opacity then calculate the rgba values dynamically and add them to the color schemes
  if (colorCode === "opacity") {
    const { opacity } = brew.colorSchemes;

    //see if we have already created a brew color scheme for opacity with NUMCLASSES
    if (!opacity || !opacity[renderer.NUMCLASSES]) {
      const newBrewColorScheme = Array.from(
        { length: renderer.NUMCLASSES },
        (_, index) =>
          `rgba(255,0,136,${(1 / renderer.NUMCLASSES) * (index + 1)})`
      );
      //add the new color scheme
      if (brew.colorSchemes.opacity === undefined) {
        brew.colorSchemes.opacity = [];
      }
      // Update the Brew color schemes state
      setDialogsState((prevState) => ({
        ...prevState,
        brew: {
          ...brew,
          colorSchemes: {
            ...brew.colorSchemes,
            opacity: {
              ...opacity,
              [renderer.NUMCLASSES]: newBrewColorScheme,
            },
          },
        },
      }));
    }
  }
  // Set the color code - see the color theory section on Joshua Tanners page here https://github.com/tannerjt/classybrew - for all the available colour codes
  dialogsState.brew.setColorCode(colorCode);
  //get the maximum number of colors in this scheme
  const colorSchemeLength = getMaxNumberOfClasses(dialogsState.brew, colorCode);
  //check the color scheme supports the passed number of classes
  if (numClasses > colorSchemeLength) {
    //set the numClasses to the max for the color scheme
    numClasses = colorSchemeLength;
    //reset the renderer
    setDialogsState((prevState) => ({
      ...prevState,
      renderer: {
        ...renderer,
        NUMCLASSES: finalNumClasses,
      },
    }));
  }
  //set the number of classes
  dialogsState.brew.setNumClasses(numClasses);
  //set the classification method - one of equal_interval, quantile, std_deviation, jenks (default)
  dialogsState.brew.classify(classification);
  setDialogsState((prevState) => ({
    ...prevState,
    dataBreaks: dialogsState.brew.getBreaks(),
  }));
};

//called when the renderer state has been updated - renders the solution and saves the renderer back to the server
export const rendererStateUpdated = async (parameter, value) => {
  renderSolution(this.runMarxanResponse.ssoln, true);
  if (dialogsState.userData.ROLE !== "ReadOnly")
    await updateProjectParameter(parameter, value);
};

//change the renderer, e.g. jenks, natural_breaks etc.
export const changeRenderer = async (renderer) => {
  // Update state and wait for the update to complete
  await new Promise((resolve) => {
    setDialogsState((prevState) => {
      const newState = {
        ...prevState,
        renderer: {
          ...prevState.renderer,
          CLASSIFICATION: renderer,
        },
      };
      resolve(newState); // Resolve the promise with the new state
      return newState; // Return the new state to update the state
    });
  });
  // Call the async function after the state has been updated
  await rendererStateUpdated("CLASSIFICATION", renderer);
};

//change the number of classes of the renderer
export const changeNumClasses = async (numClasses) => {
  // Update state
  await new Promise((resolve) => {
    setDialogsState((prevState) => {
      const newState = {
        ...prevState,
        renderer: {
          ...dialogsState.renderer,
          NUMCLASSES: numClasses,
        },
      };
      resolve(newState); // Resolve the promise with the new state
      return newState; // Return the new state to update the state
    });
  });

  // Call the async function after the state has been updated
  await rendererStateUpdated("NUMCLASSES", numClasses);
};

export const changeColorCode = async (colorCode) => {
  // Ensure NUMCLASSES is not greater than the max allowed by brew
  if (dialogsState.renderer.NUMCLASSES > dialogsState.brew.getNumClasses()) {
    await new Promise((resolve) => {
      setDialogsState((prevState) => {
        const newState = {
          ...prevState,
          renderer: {
            ...prevState.renderer,
            NUMCLASSES: dialogsState.brew.getNumClasses(),
          },
        };
        resolve(newState); // Resolve the promise with the new state
        return newState; // Return the new state to update the state
      });
    });
  }

  // Update colorCode in the state
  await new Promise((resolve) => {
    setDialogsState((prevState) => {
      const newState = {
        ...prevState,
        renderer: {
          ...prevState.renderer,
          COLORCODE: colorCode,
        },
      };
      resolve(newState); // Resolve the promise with the new state
      return newState; // Return the new state to update the state
    });
  });

  // Call the async function after the state has been updated
  await rendererStateUpdated("COLORCODE", colorCode);
};

//change how many of the top classes only to show
export const changeShowTopClasses = async (numClasses) => {
  // Update TOPCLASSES in the state
  await new Promise((resolve) => {
    setDialogsState((prevState) => {
      const newState = {
        ...prevState,
        renderer: {
          ...prevState.renderer,
          TOPCLASSES: numClasses,
        },
      };
      resolve(newState); // Resolve the promise with the new state
      return newState; // Return the new state to update the state
    });
  });

  // Call the async function after the state has been updated
  await rendererStateUpdated("TOPCLASSES", numClasses);
};
