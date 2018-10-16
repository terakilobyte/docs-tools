import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './manual/mongodb-docs.css'

import { Stitch, RemoteMongoClient, AnonymousCredential } from "mongodb-stitch-browser-sdk";

const fetchDetails = (path, docs = {}) => {
  var details = [];
  console.log("fetch details");
  docs.map(name=>{
        if (name._id === path) {
            console.log(name.className);
            details.push(name);
            
        }
    })
  return details;
};


class ParameterRow extends React.Component {

  constructor(props) {
    console.log("call constructor");
    super(props);
  }

  componentDidUpdate() {
    console.log("Parameters component updated");
  }


  render() {
    console.log("render");
    if (this.props.value===null) return;
    return <div className="tablerow">{this.props.value}</div>;
  }
}

class FailIcon extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidUpdate() {
    console.log("FailIcon component updated");
  }


  render() {
    console.log("render");
    if (this.props.value===null) return;
    return <div className="parameters">{this.props.value}</div>

  }
}

class Parameters extends React.Component {

  constructor(props) {
    console.log("call constructor");
    super(props);
  }

  componentDidUpdate() {
    console.log("Parameters component updated");
  }


  render() {
    console.log("render");
    if (this.props.value === undefined) return null;
    var rows = [];
    for (var i = 0; i < this.props.value.length; i++) {
    // note: we add a key prop here to allow react to uniquely identify each
    // element in this array. see: https://reactjs.org/docs/lists-and-keys.html
      rows.push(<ParameterRow key={i} value={this.props.value[i]} />);
    }
    return <div className="parameters">
            <div className="subheader">PARAMETERS</div>
            <div className="table">{rows}</div>
            </div>
  }
}

class Formatted extends React.Component {

  constructor(props) {
    console.log("call constructor");

    super(props);
  }

  componentDidUpdate() {
    console.log("Formatted component updated");
  }


  render() {
    console.log("render");
    if (this.props.value===null) return;
    return <div className="formatted">
            <div className="table"><div><pre className="pre">{this.props.value}</pre></div></div>
            </div>
  }
}

class API extends React.Component {
  
  constructor(props) {
    console.log("call constructor");
    super(props);
    this.state = { 
      documents: [],
      currentDetails: [],
    }
  }

  setupStitch() {
    const appName = 'ref_data-bnbxq';
    this.stitchClient = Stitch.hasAppClient(appName) ? Stitch.defaultAppClient : Stitch.initializeDefaultAppClient(appName);
    this.stitchClient.auth.loginWithCredential(new AnonymousCredential()).then((user) => {
      console.log('logged into stitch');
    });
  }

  componentDidMount() {
    this.setupStitch();
    this.stitchClient.callFunction('fetchDocuments', ['ref_data/atlas_api', {path: { $regex: /^\/api\/atlas/}}]).then((response) => {
      this.setState({
        documents: response,
        currentDetails: [],
      })
    });

  }

  componentDidUpdate() {
    console.log("component updated");
  }

  renderDetailsFromState() {
    return this.state.currentDetails;

  }

  handleUsageClick(object) {
    console.log("usage");
    console.log(object);
  }

  renderDeets() {
    console.log("render deets");
    if (this.state.currentDetails === 'undefined' ||
      this.state.currentDetails === null ||
      this.state.currentDetails.length === 0) return;
    console.log(this.state.currentDetails);
    return (
      <div>
        <div className="method">
          <div className="subheader">ENDPOINT</div> {this.state.currentDetails[0].path}
        </div>
        <div className="method">
          <div className="subheader">METHOD</div> {this.state.currentDetails[0].method} 
        </div>
        <div className="class">
          <div className="subheader">CLASS</div> {this.state.currentDetails[0].className}
        </div>
        <div>Url Parameters</div>
        <Parameters value={this.state.currentDetails[0].parameters}/>
        <div>Post Parameters</div>
        <Parameters value={this.state.currentDetails[0].parametersPost}/>
      </div>
    )
  }

  renderDeetsUsage() {
    console.log("render deets");
    if (this.state.currentDetails === 'undefined' ||
      this.state.currentDetails === null ||
      this.state.currentDetails.length === 0) return;
    console.log(this.state.currentDetails);
    if (this.state.currentDetails[0].returnJsonDoc === null) return;
    var resultString = JSON.stringify(this.state.currentDetails[0].returnJsonDoc, null, 2);
  
    return (
      <div>
        <div className="response">
          <div className="subheader">Response</div><Formatted value={resultString}
          />
        </div>
      </div>
    )
  }

  renderDeetsRequestUsage() {
    if (this.state.currentDetails === 'undefined' ||
      this.state.currentDetails === null ||
      this.state.currentDetails.length === 0) return;
    console.log(this.state.currentDetails);
    var request = JSON.stringify(this.state.currentDetails[0].inputJson);
    if (request === "{}") {
      var requestString = "NO INPUT JSON";
    } else {
      var requestString = JSON.stringify(this.state.currentDetails[0].inputJson, null, 2);
    }
    return (
      <div>
        <div className="response">
          <div className="subheader">Request</div>
          <Formatted value={this.state.currentDetails[0].executedPath}/>
          <Formatted value={requestString}
          />
        </div>
      </div>
    )
  }

  handleClick(pathToExplore) {
 
    const details = [];//this.state.currentDetails.slice();
    details[0] = fetchDetails(pathToExplore, this.state.documents);
    console.log("details");
    this.setState({
                documents: this.state.documents,
                currentDetails: details[0]
              }, function () {
                console.log(this.state.currentDetails);
              });
    this.renderDeets();
    this.renderDeetsUsage();
  }

  render() {
    var apiList = this.state.documents.map((name, index)=>{
        var editedPath = name.path.replace("/api/atlas/v1.0", "");
        return (
          <div key={index}>
          <a className="locallink" key={name._id} onClick={() => this.handleClick(name._id)}> {editedPath} [{name.method}]</a>
          <br></br> 
          </div>
        )
    })
    return (
      <div className="row">
        <div className="pageTitle">Atlas Public API 1.0</div>
        <div className="sidebarColumn">
          <div className="headerTitle">
            <h3>Endpoints</h3>
          </div>
          <div className="api">
            {apiList}
          </div>
        </div>
        <div className="detailsColumn">
        <div className="headerTitle">
          <h3>DetailsView</h3>
        </div>
        <div className="details">
           {this.renderDeets()}
        </div>
        </div>
        <div className="usageColumn">
        <div className="headerTitle">
           <h3>Code View</h3>
           {this.renderDeetsRequestUsage()}
           {this.renderDeetsUsage()}
        </div>
        </div>
      </div>
    )
  }
}

// ========================================

  ReactDOM.render(
  <API />,
  document.getElementById('root')
);


