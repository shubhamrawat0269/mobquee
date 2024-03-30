import React from "react";
import { makeStyles } from "@mui/styles";
import { Box, Typography } from "@mui/material";

export default function UIImage(props) {
  const appConfig = props.appconfig;
  const uiData = props.data;

  const uiVisibility = uiData.hidden ? "hidden" : "visible";
  const uititle = uiData.title ? uiData.title : "Image";

  const containerX = uiData.frame.x;
  const containerY = uiData.frame.y;
  const containerWidth = uiData.frame.width;
  const containerHeight = uiData.frame.height;

  const borderWeight = uiData.borderWeight;
  const borderColor = getColorValue(uiData.borderColor);

  const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    uilayout: {
      display: "flex",
      //visibility: uiVisibility,
      minWidth: 1,
      minHeight: 1,
      left: `calc(${containerX}px)`,
      top: `calc(${containerY}px)`,
      width: `calc(${containerWidth}px)`,
      height: `calc(${containerHeight}px)`,
      borderWidth: `calc(${borderWeight}px)`,
      borderStyle: "solid",
      borderColor: borderColor,
      //backgroundColor: theme.palette.common.white,
    },
    uiimage: {
      textTransform: "none",
      height: "100%",
      width: "100%",
      backgroundColor: "rgba(255, 255, 255, 0)",
      color: "rgba(0, 0, 0, 0.6)",
      fontSize: 14,
    },
    imglayout: {
      width: "100%",
      height: "auto",
      display: "inline-block",
    },
    hidden: {
      display: "flex",
      alignItems: "center",
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(189, 189, 189, 0.5)",
      //cursor: 'not-allowed',
    },
    visible: {
      display: "flex",
      alignItems: "center",
      width: "100%",
      height: "100%",
    },
    imgAspectFit: {
      width: "100%",
      maxHeight: "100%",
      objectFit: "scale-down",
    },
    imgScaleFill: {
      width: "100%",
      height: "100%",
      display: "inline-block",
    },
    imgSvg: {
      position: "absolute",
      top: `calc(${borderWeight}px)`,
    },
    imgSvgDiv: {
      width: "100%",
      height: "100%",
      position: "absolute",
      top: 0,
    },
  }));
  const classes = useStyles();

  const imageSrc = getImagePath(
    uiData.image,
    appConfig.apiURL,
    appConfig.projectid
  );
  const altText =
    uiData.altText && uiData.altText.length > 0 ? uiData.altText : "image";

  let imgTag = <Typography className={classes.uiimage}>{uititle}</Typography>;
  const imgScale = (
    <img src={imageSrc} alt={altText} className={classes.imgScaleFill} />
  );
  const imgAspect = (
    <img src={imageSrc} alt={altText} className={classes.imgAspectFit} />
  );

  if (uiData["scaleMode"] === "ScaleToFill") {
    imgTag = imgScale;
  } else if (uiData["scaleMode"] === "AspectFit") {
    imgTag = imgAspect;
  }

  if (!uiData.hasOwnProperty("pinchZoom")) {
    uiData["pinchZoom"] = false;
  }

  /* let isSVGImage = (imageSrc.indexOf(".svg") > -1 || uiData.image['fileext'] === "svg") ? true : false;
  if(imageSrc.length > 0){
    if(isSVGImage) {
      const _key = new Date().getTime();
      const imgSvg = [<div key={_key}><object data={imageSrc} type="image/svg+xml" width={uiData.frame.width} height={uiData.frame.height} className={classes.imgSvg}><img alt="svg not supported" src={imageSrc}/></object><div className={classes.imgSvgDiv}></div></div>];
      imgTag = imgSvg;
    }else {
      if(uiData['scaleMode'] === 'ScaleToFill'){
        imgTag = imgScale;
      }else if(uiData['scaleMode'] === 'AspectFit'){
        imgTag = imgAspect;
      }
    }
  } */

  return (
    <Box id="imageview" className={classes.uilayout}>
      {uiVisibility === "hidden" && (
        <div className={classes.hidden}>{imgTag}</div>
      )}
      {uiVisibility === "visible" && (
        <div className={classes.visible}>{imgTag}</div>
      )}
    </Box>
  );
}

function getColorValue(colorObj) {
  let _red = parseInt(colorObj.red * 255);
  let _green = parseInt(colorObj.green * 255);
  let _blue = parseInt(colorObj.blue * 255);

  return (
    "rgba(" + _red + "," + _green + "," + _blue + "," + colorObj.alpha + ")"
  );
}

function getImagePath(imageObj, _url, _pid) {
  let imagepath = "";

  if (imageObj["srcLocation"] === "bundle") {
    if (imageObj["filename"] !== "" && imageObj["fileext"] !== "") {
      /*if(imageObj['fileext'] === "svg") {
        imagepath = _url + "download/image/" + _pid +"/" + imageObj['filename'] +"."+ imageObj['fileext'];
      }else {
        imagepath = _url + "download/image/" + _pid +"/" + imageObj['filename'] +"."+ imageObj['fileext'] + '?ts=' + new Date().getTime();
      }*/
      imagepath =
        _url +
        "download/image/" +
        _pid +
        "/" +
        imageObj["filename"] +
        "." +
        imageObj["fileext"];
    } else {
      if (imageObj["filename"] !== "") {
        imagepath =
          _url + "download/image/" + _pid + "/" + imageObj["filename"];
      } else {
        imagepath = "";
      }
    }
  } else if (imageObj["srcLocation"] === "url") {
    imagepath = imageObj["imageName"];
    setURLImage_FileAndExt(imageObj);
  } else if (imageObj["srcLocation"] === "remoteFile")
    imagepath = imageObj["url"] + imageObj["filename"];
  else imagepath = imageObj["filename"];

  return imagepath;
}

function setURLImage_FileAndExt(imageObj) {
  if (imageObj.hasOwnProperty("imageName")) {
    const strVal = imageObj["imageName"];
    if (strVal.length > 0) {
      const refStartIndex = strVal.indexOf("[");
      const refEndIndex = strVal.indexOf("]");
      if (refStartIndex > -1) {
        if (refEndIndex > -1 && refEndIndex > refStartIndex) {
          imageObj["url"] = imageObj["filename"] = imageObj["fileext"] = "";
        }
      } else {
        imageObj["url"] = strVal.substring(0, strVal.lastIndexOf("/"));
        let strImageName = strVal.substring(strVal.lastIndexOf("/") + 1);
        if (strImageName.indexOf(".") > -1) {
          imageObj["filename"] = strImageName.substring(
            strImageName.lastIndexOf("/") + 1,
            strImageName.lastIndexOf(".")
          );
          imageObj["fileext"] = strImageName.substr(
            strImageName.lastIndexOf(".") + 1,
            strImageName.length
          );
        } else {
          imageObj["filename"] = strImageName.substring(
            strImageName.lastIndexOf("/") + 1,
            strImageName.length
          );
          imageObj["fileext"] = "";
        }
      }
    } else {
      imageObj["url"] = imageObj["filename"] = imageObj["fileext"] = "";
    }
  } else {
    if (imageObj["fileext"] !== "") {
      imageObj["imageName"] =
        imageObj["url"] +
        "/" +
        imageObj["filename"] +
        "." +
        imageObj["fileext"];
    } else {
      imageObj["imageName"] = imageObj["url"] + "/" + imageObj["filename"];
    }
  }

  //console.log('url >>>', imageObj);
}
