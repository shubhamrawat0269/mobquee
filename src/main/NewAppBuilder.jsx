import React from "react";
import { connect } from "react-redux";
import "./module.css";
import AppData from "./AppData/AppData";
import ProjectsList from "./helpers/projectsList";
import ErrorBoundary from "../components/ErrorBoundary";
import { setAppConfig, setAppCredentials } from "./ServiceActions";
import { apiEndPoint } from "../utils/urlConfig";

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
    let credential = this.getURLCredential(apiEndPoint.url);

    if (credential) {
      if (credential.projectid) {
        this.setState({ showlist: false });
        // {
        //     "userid": "stagemobiloustesting90",
        //     "sessionid": "7cf0d817168b6ab583bfe2edeade4a14",
        //     "projectid": "302128",
        //     "locale": "en"
        // }

        let credentials = {
          userid: credential.userid,
          sessionid: credential.sessionid,
          projectid: credential.projectid,
          locale: credential.lang,
        };

        console.log(credentials);
        this.props.dispatch(setAppCredentials(credentials));
        this.props.dispatch({ type: "LOADAPP" });
      }
    }
  }
  getURLCredential(appURL) {
    let assoc = {};

    let searchString = appURL.split("?")[1];
    if (searchString) {
      let keyValues = searchString.split("&");
      for (let i = 0; i < keyValues.length; i++) {
        const element = keyValues[i];
        let key = element.split("=");
        if (key.length > 1) {
          assoc[key[0]] = key[1];
        }
      }
    }

    return assoc;
  }

  render() {
    const showlist = this.state.showlist;
    const { error, apiParam, loadproject } = this.props; // set via redux-mapStateToProps

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
