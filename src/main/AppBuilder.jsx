import React from "react";
import { connect } from "react-redux";
import "./module.css";
import AppData from "./AppData/AppData";
import { setAppConfig, setAppCredentials } from "./ServiceActions";

class AppBuilder extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      showlist: false,
      loadproject: false,

      hostname: "",
      port: "",
      userid: "",
      sessionid: "",
      projectid: "",
      locale: "",
    };
  }

  componentDidMount() {
    this.clearSessionStorage();
    this.fetchConfig().then((response) => this.getAppCredential());
  }

  clearSessionStorage() {
    sessionStorage.clear();
  }

  fetchConfig() {
    return fetch("././config/builder.xml")
      .then((res) => res.text())
      .then(
        (result) => {
          var parser = new DOMParser();
          var xmlDoc = parser.parseFromString(result, "text/xml");
          const servername =
            xmlDoc.getElementsByTagName("server")[0].childNodes[0].nodeValue;
          const port =
            xmlDoc.getElementsByTagName("port")[0].childNodes[0].nodeValue;
          // console.log("servername >>", servername, port);

          let _apiUrl = "https://" + servername + ":" + port + "/appexe/api/";

          let configresult = {
            hostname: servername,
            port: port,
            apiURL: _apiUrl,
          };
          this.props.dispatch(setAppConfig(configresult));
          return;
        },
        (error) => {
          console.log("config error >>>", error);
          this.setState({
            error,
          });
        }
      );
  }

  getAppCredential() {
    this.props.dispatch(
      setAppCredentials({
        userid: "stagemobiloustesting90",
        sessionid: "7cf0d817168b6ab583bfe2edeade4a14",
        projectid: "302128",
        locale: "en",
      })
    );
    this.props.dispatch({ type: "LOADAPP" });
  }

  render() {
    const { error, apiParam, loadproject } = this.props;

    return loadproject && <AppData show={loadproject} appconfig={apiParam} />;
  }
}

function mapStateToProps(state) {
  return {
    error: state.appParam.error,
    apiParam: state.appParam.params,
    loadproject: state.appParam.loadapp,
  };
}
export default connect(mapStateToProps)(AppBuilder);
