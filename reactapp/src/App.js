import React from 'react';
import './App.css';

import VideoRoom from './Components/video_room';
import MainRoom from './Components/main_room';
import JoinRoom from './Components/join_room';

import { BrowserRouter, Route } from 'react-router-dom';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Route exact path='/' component={MainRoom} />
        <Route exact path='/join' component={JoinRoom} />
        <Route exact path='/meeting/:id' component={VideoRoom} />
      </BrowserRouter>
    </div>
  );
}

export default App;
