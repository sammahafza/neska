import React from 'react';

import '../styles/header.css';

function Header() {
  return (
    <nav className="header">
      <div className="topheader">
        <div className="branding">
          <a href="/" className="navbar-brand"><h2 className="name">Neska</h2></a>
          <h5 className="mini_text">the mini video app</h5>
        </div>
      </div>
    </nav>
  );
}

export default Header;