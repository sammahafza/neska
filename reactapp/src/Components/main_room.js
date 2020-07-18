import React, { Component } from 'react';
import Cookies from 'js-cookie';
import { withRouter } from 'react-router-dom';
import Header from './subcomponents/header';
import { Button } from 'react-bootstrap';

import "./styles/main.css";

class MainRoom extends Component {

  state = {
    mid: '000000'
  };

  nextPath = (path) => {
    this.props.history.push(path);
  }

  // create a meeting handler
  create = () => {

    const random_mid = (Math.floor(Math.random() * (999999999 - 100000000)) + 100000000).toString();
    const info = {
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRFToken': Cookies.get('csrftoken') },
      body: JSON.stringify({ 'meeting_mid': random_mid })
    };
    //fetch("https://127.0.0.1:8000/api/meeting/", info)
    fetch("https://192.168.0.109:8000/api/meeting/", info)
      .then(response => response.json())

    this.nextPath('/meeting/' + random_mid);
  }

  render() {
    return (
      <div>
        <Header></Header>
        <div className="content_main">
        <Button className='btn btn-primary' onClick={this.create}>Create Meeting</Button>
        <h5 className="d-inline"> Or </h5>
        <Button className='btn btn-secondary' onClick={() => this.nextPath('/join')}>Join Meeting</Button>
        </div>
      </div>
    );
  }
}

export default withRouter(MainRoom);