import React, { Component } from 'react';
import Header from './subcomponents/header';

import "./styles/main.css"

class JoinRoom extends Component {

  state = {
    mid: null,
    error: null,
  }

  nextPath = (path) => {
    this.props.history.push(path);
  }


  onChangeHandler = (e) => {
    this.setState({ mid: e.target.value });
  }

  join = () => {
    const mid = this.state.mid;
    fetch("https://192.168.0.109:8000/api/meeting/" + mid)
      .then(response => response.json())
      .then(data => {
        if (data.meeting_mid === mid) {
          this.setState({ error: null });
          this.nextPath('/meeting/' + mid);
        }
        else
          this.setState({ error: "Error: mid is invalid or expired, please try another one..." });
      })
      .catch(() => {
        this.setState({ error: "Error: could not connect to the server, please try again after a while..." });
      
      
      });

  }

  render() {
    return (
      <div>
        <Header></Header>
        <div className= "content_join">
        <div>
          Enter the MID of the room to join.
        </div>
          <div className="pt-2">
        <input type="number" className="w-50" onChange={this.onChangeHandler} value={this.state.mid} ref="mid_input"></input>
        <button className='btn btn-success ml-2 w-25' onClick={this.join}>Join</button>
        </div>
        </div>
        <h6 className="error">{this.state.error}</h6>
      </div>
    );
  }
}

export default JoinRoom;