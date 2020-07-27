import React, { useEffect, useRef, Component } from 'react';
import Cookies from 'js-cookie';

import '../styles/header.css';

class Header extends Component {


  state = {
    first_name: "",
    last_name: "",
    email: "",
  }

  nextPath = (path) => {
    this.props.history.push(path);
  }

  componentDidMount = () => {

    const info = {
      credentials: 'include',
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'X-CSRFToken': Cookies.get('csrftoken') },
    };
    fetch("https://192.168.0.109:8000/api/user/", info)
      .then(response => response.json())
      .then(data => this.setState({ first_name: data[0].first_name, last_name: data[0].last_name, email: data[0].email }))

    //this.setState({ first_name: "Samer", last_name: "Mahafza", email: "sam@yahoo.com" });


  }

  logout = () => {

    const info = {
      credentials: 'include',
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'X-CSRFToken': Cookies.get('csrftoken') },
    };
    fetch("https://192.168.0.109:8000/api/logout/", info)
    .then(response => window.location.reload(false));

  }


  render() {
    return (
      <nav className="header">
        <div className="topheader">
          <div className="branding">
            <a href="/" className="navbar-brand"><h2>Neska</h2></a>
            <h5 className="mini_text">the mini video app</h5>
          </div>
          <div className="right">
            <span className="h5 p-3">Hello, {this.state.first_name}</span>
            <button className="btn btn-success mb-1" onClick={this.logout}>Log out</button>
          </div>
        </div>
      </nav>
    );
  }
}

export default Header;