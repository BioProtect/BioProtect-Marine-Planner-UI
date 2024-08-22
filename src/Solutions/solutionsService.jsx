import { setDialogsState } from "../App";

//gets the total number of planning units in the ssoln and outputs the statistics of the distribution to state, e.g. 2 PUs with a value of 1, 3 with a value of 2 etc.
const getssolncount = (data) => {
  let total = 0;
  const summaryStats = data.map((item) => {
    const count = item[1].length;
    total += count;
    return { number: item[0], count };
  });

  setDialogsState((prevState) => ({ ...prevState, summaryStats }));
  return total;
};

//gets a sample of the data to be able to do a classification, e.g. natural breaks, jenks etc.
export const getSsolnSample = (data, sampleSize) => {
  const ssolnLength = getssolncount(data);
  // Use the ceiling function to force outliers to be in the classification, i.e. those planning units that were only selected in 1 solution
  return data.flatMap((item) => {
    const num = Math.ceil((item[1].length / ssolnLength) * sampleSize);
    return Array(num).fill(item[0]);
  });
};

//get all data from the ssoln arrays
export const getSsolnData = (data) => data.flatMap((item) => item[1]);

if (colorCode === "opacity") {
  const { brew, renderer } = this.state;

  // Check if the opacity color scheme exists for the current number of classes
  
    const newBrewColorScheme = Array.from(
      { length: renderer.NUMCLASSES },
      (_, index) => {
        return `rgba(255,0,136,${(1 / renderer.NUMCLASSES) * (index + 1)})`;
      }
    );

    // Update the brew color schemes
    const updatedBrew = {
      ...brew,
      colorSchemes: {
        ...brew.colorSchemes,
        opacity: {
          ...brew.colorSchemes.opacity,
          [renderer.NUMCLASSES]: newBrewColorScheme,
        },
      },
    };

    // Set the updated state
    setDialogsState((prevState) => ({ ...prevState, brew: updatedBrew }));
  }
}
