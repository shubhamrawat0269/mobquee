import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Typography } from "@mui/material";

import "../module.css";
import AppData from "../AppData/AppData";
import { setAppCredentials } from "../ServiceActions";

class ProjectsList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      show: this.props.show,

      error: null,
      isLoaded: false,
      projects: [],
      selectedPrjID: "",
    };

    this.handleProjectItemClick = this.handleProjectItemClick.bind(this);
  }

  abortController = new window.AbortController();

  componentDidMount() {
    //console.log("ProjectsList componentDidMount", this.props.show);
    this.props.show && this.fetchProjectsList();
  }

  componentWillUnmount() {
    //this._isMounted = false;
    this.abortController.abort();
  }

  fetchProjectsList() {
    let project_list_api =
      this.props.appconfig.apiURL +
      "service.json?command=projectlist&userid=" +
      this.props.appconfig.userid +
      "&sessionid=" +
      this.props.appconfig.sessionid;
    let api_options = { method: "POST", signal: this.abortController.signal };
    fetch(project_list_api, api_options)
      .then((res) => res.json())
      .then(
        (result) => {
          // {
          //   projects: [ ],
          //   response: "ACK",
          //   count: 0,
          //   command: "projectlist"
          //   }
          if (result.response === "NACK") {
            var _err = { message: result.error };
            this.setState({
              isLoaded: true,
              error: _err,
            });
          } else
            this.setState({
              isLoaded: true,
              projects: result.projects,
            });
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error,
          });
        }
      )
      .catch((error) => {
        if (error.name === "AbortError") {
          console.log("abort");
          return; // expected, this is the abort, so just return
        }
        this.setState({
          isLoaded: true,
          error,
        });
      });
  }

  handleProjectItemClick(e) {
    let _pid = e.currentTarget.dataset.projectid;
    //console.log("ProjectId is: " +_pid);

    let credentials = { projectid: _pid };
    this.props.dispatch(setAppCredentials(credentials));
  }

  render() {
    const { error, isLoaded, projects, show } = this.state;
    //const apiParam = {apiURL: this.props.appconfig.apiURL, userid: this.props.appconfig.userid, sessionid : this.props.appconfig.sessionid, projectid : this.state.selectedPrjID};

    const { apiParam } = this.props;
    const selectedPid = apiParam["projectid"];

    if (!show) {
      return null;
    }

    if (error) {
      return (
        <div className="backdropStyle">
          Projects List Error: {error.message}
        </div>
      );
    } else if (!isLoaded) {
      return <div className="backdropStyle">Loading...</div>;
    } else {
      return (
        <div>
          {apiParam.projectid.length === 0 && (
            <div>
              <div className="backdropStyle">
                <div className="modalStyle">
                  <Typography
                    variant="h6"
                    color="inherit"
                    style={{ marginBottom: 8 }}
                  >
                    {" "}
                    Projects List{" "}
                  </Typography>
                  <div
                    style={{
                      maxHeight: 300,
                      overflow: "hidden auto",
                      paddingRight: 6,
                    }}
                  >
                    <table id="list" className="tg" width="400px">
                      <thead>
                        <tr>
                          <th className="tg-0lax" width="20%">
                            Project Id
                          </th>
                          <th className="tg-0lax" width="60%">
                            Title
                          </th>
                          <th className="tg-0lax" width="20%">
                            Version
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {projects.map((item) => (
                          <tr
                            key={item.projectid}
                            data-projectid={item.projectid}
                            onClick={this.handleProjectItemClick}
                          >
                            {/* onClick={() => this.handleProjectItemClick(item.projectid)} */}
                            <td> {item.projectid} </td>
                            <td> {item.Title} </td>
                            <td> {item.version} </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
          {selectedPid > 0 && <AppData show={true} appconfig={apiParam} />}
        </div>
      );
    }
  }
}

ProjectsList.propTypes = {
  //onClose: PropTypes.func.isRequired,
  show: PropTypes.bool,
  children: PropTypes.node,
};

//export default ProjectsList;

function mapStateToProps(state) {
  return {
    apiParam: state.appParam.params,
  };
}
export default connect(mapStateToProps)(ProjectsList);
