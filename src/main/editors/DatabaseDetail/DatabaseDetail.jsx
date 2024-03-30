import React from "react";
import "./DatabaseDetailStyle.css";
import { Collapse, List, ListItem, ListItemText } from "@mui/material";

class DatabaseDetail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      dbData: this.props.data,

      open: false,
      anchorEl: null,
    };
  }

  componentDidMount() {}

  render() {
    const { dbData } = this.state;

    return (
      <div
        id="dbdetails"
        className="horizontal-align"
        style={{ alignItems: "inherit" }}
      >
        <DBViewer data={dbData} />
      </div>
    );
  }
}

function DBViewer(props) {
  const dbData = props.data;

  const [collapseDBs, setCollapseDBs] = React.useState("");
  function handleExpandCollapseFields(event) {
    let _tablename = event.currentTarget.dataset.name;

    let strTable = collapseDBs;
    strTable = setCollapseDBTables(strTable, _tablename);
    //console.log(_tablename, "............. handleExpandCollapse ............", strTable);

    setCollapseDBs(strTable);
  }

  function setCollapseDBTables(strTable, name) {
    let _name = name + ",";
    if (strTable.indexOf(name) > -1) {
      strTable = strTable.replace(_name, "");
    } else {
      strTable += _name;
    }

    return strTable;
  }
  function strTableCollpase(strTable, name) {
    if (strTable.toString().indexOf(name) > -1) {
      return false;
    } else {
      return true;
    }
  }

  return (
    <List component="nav" dense={true} id="database-section">
      {dbData.data.map((table, index) => (
        <div key={table.name + index}>
          <ListItem
            button
            className="database-table-item"
            data-name={table.name}
            onClick={handleExpandCollapseFields}
          >
            <ListItemText
            className="lst-itm-txt"
              primary={<h4>{table.name + " (" + table.type + ")"}</h4>}
            ></ListItemText>
          </ListItem>
          <Collapse
            in={!strTableCollpase(collapseDBs, table.name)}
            timeout="auto"
            unmountOnExit
          >
            <table id="dbfields" className="tg">
              <thead>
                <tr>
                  <th width="300px">Field Name</th>
                  <th width="120px">Data Type</th>
                </tr>
              </thead>
              <tbody>
                {table.fields.map((field) => (
                  <tr key={field.fieldname}>
                    <td> {field.fieldname} </td>
                    <td> {field.dbType} </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Collapse>
        </div>
      ))}
    </List>
  );
}

export default DatabaseDetail;
