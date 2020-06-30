import React, { Component } from 'react';

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
    fetch("https://127.0.0.1:8000/api/meeting/" + mid)
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
        <input onChange={this.onChangeHandler} value={this.state.mid} ref="mid_input"></input>
        <button onClick={this.join}>Join</button>
        <h2>{this.state.error}</h2>
      </div>
    );
  }
}

export default JoinRoom;