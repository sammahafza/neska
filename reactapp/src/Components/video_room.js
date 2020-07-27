import React, { Component, createRef, useEffect, useRef } from 'react';
import Header from './subcomponents/header';
import io from 'socket.io-client';

import Peer from 'simple-peer';

import './styles/video_room.css';

import styled from "styled-components";
import uuid from 'react-uuid';

const Container = styled.div`
    padding: 20px;
    display: flex;
    height: 100vh;
    width: 90%;
    margin: auto;
    flex-wrap: wrap;
`;

const StyledVideo = styled.video`
	position: relative;
    height: 100%;
    width: 100%;
    margin: 5% auto;
`;


const StyledDiv = styled.div`
	position: relative;
    height: 40%;
    width: 50%;
    margin: 5% auto;
	text-align: center;
`;



const Video = (props) => {
  const ref = useRef();

  useEffect(() => {
    props.peer.on("stream", stream => {
      ref.current.srcObject = stream;
    })
  }, []);

  return (
    <StyledVideo playsInline autoPlay ref={ref} />
  );
}


const videoConstraints = {
  height: { max: window.innerHeight / 2 },
  width: { max: window.innerWidth / 2 }
};

class VideoRoom extends Component {

  constructor(props) {
    super(props);
    this.lVideo = createRef();

  }


  state = {
    isValid: true,
    init: true,
    peers: [],
    me: {},
    peersRef: [],
    socketRef: null,
    roomFull: false,
    errorDetail: "",
  }

  componentDidMount = () => {

    let first = "";
    let last = "";
    let email = "";

    fetch("https://192.168.0.109:8000/api/user/")
      .then(response => response.json())
      .then(data => {
        first = data[0].first_name;
        last = data[0].last_name;
        email = data[0].email;
      })


    const mid = this.props.match.params.mid;






    // fetch("https://127.0.0.1:8000/api/meeting/" + mid)
    fetch("https://192.168.0.109:8000/api/meeting/" + mid)
      .then(response => {
        if (response.ok) {
          this.setState({ isValid: true, init: false });

          //TODO: additional steps...

          this.state.socketRef = io("https://192.168.0.109:25000");



          navigator.mediaDevices.getUserMedia(
            { video: true, audio: false }
          ).then(
            stream => {

              this.lVideo.current.srcObject = stream;

              this.setState({
                me:
                {
                  first_name: first,
                  last_name: last,
                  email: email,
                  id: this.state.socketRef.id,
                  room: mid
                }
              });

              this.state.socketRef.emit("join room", this.state.me);


              this.state.socketRef.on("room full", () => {
                this.setState({ roomFull: true });
              });

              this.state.socketRef.on("all users", users => {
                const peers = [];
                users.forEach(user => {
                  const peer = this.createPeer(user.id, this.state.socketRef.id, stream);
                  this.state.peersRef.push({
                    uuid: uuid(),
                    first_name: user.first_name,
                    last_name: user.last_name,
                    peerID: user.id,
                    peer,
                  });
                  peers.push(peer);
                  this.setState({ peers: peers });

                });

              });




              this.state.socketRef.on("user joined", payload => {
                const item = this.state.peersRef.find(p => p.peerID === payload.callerID);
                if (!item) {
                  const peer = this.addPeer(payload.signal, payload.callerID, stream);
                  this.state.peersRef.push({
                    uuid: uuid(),
                    first_name: payload.first_name,
                    last_name: payload.last_name,
                    peerID: payload.callerID,
                    peer,
                  })
                  this.setState({ peers: this.state.peers.concat(peer) });
                }

                console.log("a user joined..");
                console.log(this.state.peersRef);
              });

              this.state.socketRef.on("recieved returning signal", payload => {
                const item = this.state.peersRef.find(p => p.peerID === payload.id);
                item.peer.signal(payload.signal);

              });



              this.state.socketRef.on("someone left", id => {

                console.log("someone left...");

                const peer = this.state.peersRef.find(p => p.peerID === id);

                if (peer) {
                  peer.peer.destroy();
                }
                else {
                  const peer = this.state.peersRef.find(p => p.peerID === this.state.socketRef);
                  if (peer) peer.peer.destroy();
                }

                const removed_peers = this.state.peersRef.filter(p => p.peer._connected === true);
                const peers = this.state.peers.filter(p => p._connected === true);

                this.setState({ peersRef: removed_peers, peers: peers });

                console.log("elements: ");
                console.log(this.state.peersRef);

              });

            }
          ).catch(
            error => {
              if (error.name == "NotAllowedError") alert("You must allow the app to use your Camera..")
              else if (error.name == "NotFoundError") alert("Please Check your Camera or Microphone and try Again...");
              this.setState({ errorDetail: error.toString() });
              console.log(error);
            }
          );


        }
        else
          this.setState({ isValid: false, init: false });
      });


  }

  createPeer = (userToSignal, callerID, stream) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on('signal', signal => {
      this.state.socketRef.emit("sending signal", { userToSignal, callerID, signal, first_name: this.state.me.first_name, last_name: this.state.me.last_name });
      console.log("signal sended");
    });

    return peer;
  }

  addPeer = (incomingSignal, callerID, stream) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on('signal', signal => {
      this.state.socketRef.emit("returning signal", { signal, callerID });

    });

    peer.signal(incomingSignal);

    return peer;
  }


  render() {
    if (this.state.isValid && !this.state.init) {
      if (!this.state.roomFull)
        return (
          <div>
            <Header></Header>
            <h2>{this.state.errorDetail}</h2>
            <Container>
              <StyledDiv>
                <StyledVideo muted ref={this.lVideo} autoPlay playsInline />
                <p>{this.state.me.first_name + " " + this.state.me.last_name}</p>
              </StyledDiv>
              {this.state.peersRef.map((peer, index) => {
                return (
                  <StyledDiv key={peer.uuid}>
                    <Video key={peer.uuid} peer={peer.peer} />
                    <p key={peer.uuid}>{peer.first_name + " " + peer.last_name}</p>
                  </StyledDiv>
                );
              })}
            </Container>
          </div>
        );
      else
        return (
          <h2>Meeting Room is Full :(</h2>
        );
    }
    else if (!this.state.isValid && !this.state.init)
      return (
        <div>
          <h2>Meeting Room is invalid :(</h2>
        </div>
      );
    else
      return (
        <div>
        </div>
      );
  }
}

export default VideoRoom;
