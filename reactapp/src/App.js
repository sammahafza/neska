import React from 'react';
import './App.css';

import VideoRoom from './Components/video_room';
import MainRoom from './Components/main_room';
import JoinRoom from './Components/join_room';
import Testing from './Components/testing_component'

import 'bootstrap/dist/css/bootstrap.min.css';

import { BrowserRouter, Route } from 'react-router-dom';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Route exact path='/' component={MainRoom} />
        <Route exact path='/join' component={JoinRoom} />
        <Route exact path='/meeting/:mid/:first/:last' component={Testing} />
        <Route exact path='/meeting/:mid/' component={VideoRoom} />
      </BrowserRouter>
    </div>
  );
}

export default App;
