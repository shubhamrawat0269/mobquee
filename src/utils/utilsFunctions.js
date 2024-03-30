export const capitalizeFirstLetter = (moduleContent) => {
  return moduleContent.charAt(0).toUpperCase() + moduleContent.slice(1);
};

export const getColorValue = (colorObj) => {
  let _red = parseInt(colorObj.red * 255);
  let _green = parseInt(colorObj.green * 255);
  let _blue = parseInt(colorObj.blue * 255);
  return (
    "rgba(" + _red + "," + _green + "," + _blue + "," + colorObj.alpha + ")"
  );
};
