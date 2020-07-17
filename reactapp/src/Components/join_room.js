import React, { Component } from 'react';
import Header from './subcomponents/header';

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
          this.setState({ error: "mid is invalid or expired, please try another one..." });
      });

  }

  render() {
    return (
      <div>
        <Header></Header>
        <input onChange={this.onChangeHandler} value={this.state.mid} ref="mid_input"></input>
        <button className='btn btn-success' onClick={this.join}>Join</button>
        <h4>{this.state.error}</h4>
      </div>
    );
  }
}

export default JoinRoom;