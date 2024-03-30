import React from "react";
import { Box, Typography } from "@mui/material";
import { Map, GoogleApiWrapper, Marker } from "google-maps-react";

class UIMapView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <GoogleMapView
        google={this.props.google}
        mapKey={this.props.mapKey}
        data={this.props.data}
      />
    );
  }
}

function GoogleMapView(props) {
  console.log("GoogleMap >>>>", props);

  const uiData = props.data;
  const zoomlvl = parseInt(uiData.zoom);
  const initpos = uiData.initialPosition;

  const borderWeight = 1;

  const mapStyles = {
    width: "100%",
    height: "100%",
  };
  const containerStyle = {
    position: "inherit",
    width: "100%",
    height: "100%",
  };

  return (
    <Box id="mapview" className="ui-map-view">
      <Typography style={{ display: "none" }}>{initpos}</Typography>
      <Map
        google={props.google}
        zoom={zoomlvl}
        initialCenter={{ lat: 20.5937, lng: 78.9629 }}
        style={mapStyles}
        containerStyle={containerStyle}
      >
        <Marker position={{ lat: 20.5937, lng: 78.9629 }} />
      </Map>
    </Box>
  );
}

export default GoogleApiWrapper((props) => ({
  apiKey: props.apiKey,
}))(UIMapView);
