import React, { Component } from 'react';
import Header from './subcomponents/header'

import './styles/video_room.css'

class VideoRoom extends Component {

  
  render() {
    return (
      <div>
        <Header></Header>
        <div>
          <video id='rvideo' autoPlay="autoplay" loop={true}></video>
        </div>
      </div>
    );
  }
}

export default VideoRoom;