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
    for (let key in sessionStorage) {
      if (!sessionStorage.hasOwnProperty(key)) {
        continue; // skip keys like "setItem", "getItem" etc
      }
    }
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
    // let credential = this.getURLCredential(window.location.href);
    let credential = this.getURLCredential(apiEndPoint.url);
    if (credential) {
      if (credential.projectid) {
        this.setState({ showlist: false });

        let credentials = {
          userid: credential.userid,
          sessionid: credential.sessionid,
          projectid: credential.projectid,
          locale: credential.lang,
        };
        this.props.dispatch(setAppCredentials(credentials));
        this.props.dispatch({ type: "LOADAPP" });
      } else {
        let localcredentials = {
          userid: "stagetivauser1",
          sessionid: "bd14da9c0f954c9a4f7395c21df386b1",
          projectid: "",
          locale: "en",
        };
        this.props.dispatch(setAppCredentials(localcredentials));

        this.setState({ showlist: true });
        this.setState({ loadproject: false });
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

    if (error) {
      return (
        <div className="backdropStyle">App Loading Error: {error.message}</div>
      );
    } else if (showlist) {
      return <ProjectsList show={showlist} appconfig={apiParam} />;
    } else if (loadproject) {
      return (
        <ErrorBoundary>
          <AppData show={loadproject} appconfig={apiParam} />
        </ErrorBoundary>
      );
    }
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
