import React from "react";
import { makeStyles } from "@mui/styles";
import { Box } from "@mui/material";
import { Map, GoogleApiWrapper } from "google-maps-react";
export function UIHeatMap(props) {
  const uiData = props.data;
  const mapKey = props.mapKey;
  const defaultZoom = parseInt(uiData.zoom);
  const defaultCenter = { lat: 20.5937, lng: 78.9629 };
  const containerX = uiData.frame.x;
  const containerY = uiData.frame.y;
  const containerWidth = parseInt(uiData.frame.width);
  const containerHeight = parseInt(uiData.frame.height);
  const paddingTop = uiData.padding ? parseInt(uiData.padding.top) : 0;
  const paddingBottom = uiData.padding ? parseInt(uiData.padding.bottom) : 0;
  const paddingLeft = uiData.padding ? parseInt(uiData.padding.left) : 0;
  const paddingRight = uiData.padding ? parseInt(uiData.padding.right) : 0;

  let chartW = containerWidth - (paddingLeft + paddingRight);
  let chartH = containerHeight - (paddingTop + paddingBottom);
  console.log(props, ".....HeatMap >>>>", chartW, chartH);
  const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    baselayout: {
      left: `calc(${containerX}px)`,
      top: `calc(${containerY}px)`,
      width: `calc(${containerWidth}px)`,
      height: `calc(${containerHeight}px)`,
      borderWidth: `calc(${uiData.borderWeight}px)`,
      borderStyle: "solid",
      paddingTop: `calc(${paddingTop}px)`,
      paddingBottom: `calc(${paddingBottom}px)`,
      paddingLeft: `calc(${paddingLeft}px)`,
      paddingRight: `calc(${paddingRight}px)`,
      boxSizing: "border-box",
    },
    mapdiv: {
      width: chartW,
      height: chartH,
      boxSizing: "border-box",
    },
  }));
  const classes = useStyles();
  return (
    <Box id="heapmapview" className={classes.baselayout}>
      <div id="mapdiv" className={classes.mapdiv}>
        <MyMap
          mapKey={mapKey}
          location={defaultCenter}
          zoomLevel={defaultZoom}
          google={props.google}
        ></MyMap>
      </div>
    </Box>
  );
}
const AnyReactComponent = ({ text }) => <div>{text}</div>;
const MyMap = ({ google, mapKey, location, zoomLevel }) => (
  <div className="map">
    <div className="google-map">
      <Map
        google={google}
        bootstrapURLKeys={{ key: mapKey }}
        defaultCenter={location}
        defaultZoom={zoomLevel}
        yesIWantToUseGoogleMapApiInternals
      >
        <AnyReactComponent lat={59.955413} lng={30.337844} text="" />
      </Map>
    </div>
  </div>
);
export default GoogleApiWrapper((props) => ({
  apiKey: props.apiKey,
}))(UIHeatMap);
