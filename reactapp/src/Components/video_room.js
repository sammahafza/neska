import React, { Component, createRef, useEffect, useRef } from 'react';
import Header from './subcomponents/header';
import io from 'socket.io-client';

import Peer from 'simple-peer';

import './styles/video_room.css';

import styled from "styled-components";

const Container = styled.div`
    padding: 20px;
    display: flex;
    height: 100vh;
    width: 90%;
    margin: auto;
    flex-wrap: wrap;
`;

const StyledVideo = styled.video`
    height: 40%;
    width: 50%;
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
  height: window.innerHeight / 16,
  width: window.innerWidth / 16
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
  }

  componentDidMount = () => {


    const mid = this.props.match.params.mid;
    const first = "Chris";
    const last = "Chris";



    // fetch("https://127.0.0.1:8000/api/meeting/" + mid)
    fetch("https://192.168.0.109:8000/api/meeting/" + mid)
      .catch(response => {
        if (!response.ok) {
          this.setState({ isValid: true, init: false });

          //TODO: additional steps...

          this.state.socketRef = io("https://192.168.0.109:25000");

          

          navigator.mediaDevices.getUserMedia(
            { video: videoConstraints, audio: false }
          ).then(
            stream => {

              this.lVideo.current.srcObject = stream;

              // this.state.socketRef.on("detailReq", () => {
              //   console.log("detail requeted from me..");
              //   this.state.socketRef.emit("detailRes", { first_name: first, last_name: last, email: "redfield78@yahoo.com", id: this.state.socketRef.id, room: mid, videoRef: createRef() });
              // });

              this.setState({me: 
                { first_name: first, 
                last_name: last, 
                email: "redfield78@yahoo.com", 
                id: this.state.socketRef.id, 
                room: mid 
              }});

              this.state.socketRef.emit("join room", this.state.me);

              this.state.socketRef.on("all users", users => {
                const peers = [];
                users.forEach(user => {
                  const peer = this.createPeer(user.id, this.state.socketRef.id, stream);
                  this.state.peersRef.push({
                    peerID: user.id,
                    peer,
                  });
                  peers.push(peer);
                  this.setState({ peers: peers });

                });
                  
              });

              // this.state.socketRef.on("user joined", payload => {
              //   const peer = this.addPeer(payload.signal, payload.callerID, stream);
              //   this.state.peersRef.push({
              //     peerID: payload.callerID,
              //     peer
              //   });

              //   this.setState({ peers: this.state.peers.concat(peer) });
              // });

              this.state.socketRef.on("user joined", payload => {
                const item = this.state.peersRef.find(p => p.peerID === payload.callerID);
                if(!item) {
                  const peer = this.addPeer(payload.signal, payload.callerID, stream);
                  this.state.peersRef.push({
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

                if(peer) { 
                  peer.peer.destroy();
                }
                else {
                  const peer = this.state.peersRef.find(p => p.peerID === this.state.socketRef);
                  if(peer) peer.peer.destroy();
                }

                //const removed_peers = this.state.peers.filter(p => p._connected === true);
                //this.setState({peers: removed_peers});

                console.log("elements: ");
                console.log(this.state.peersRef);

              });

            }
          ).catch(
            error => {
              alert("Please Check you WebCamera and try Again...");
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
      this.state.socketRef.emit("sending signal", { userToSignal, callerID, signal });
      console.log("signal sended");
    });

    // peer.on('close', () => {
    //   console.log("someone exited ya m'alem");

    //   const peer_removed = this.state.peersRef.filter(p => p.callerID === callerID);

    //   const peers = [];
      
    //   peer_removed.forEach(p => {
    //     peers.push(p.peer);
    //   });

    //   this.setState({peersRef: peer_removed, peers: peers});
    // });

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

    // peer.on('close', (err) => {

    //   const peer_removed = this.state.peersRef.filter(p => p.peer._connected === true);


    //   console.log("peers removed:");
    //   console.log(peer_removed);

    //   const peers = [];
      
    //   peer_removed.forEach(p => {
    //     peers.push(p.peer);
    //     console.log("peers: ");
    //     console.log(peers);
    //   });

    //   this.setState({peersRef: peer_removed, peers: peers});

    //   console.log("i'm closing");
    //   console.log(this.state.peersRef);
    //   console.log(this.state.peers);
    
    
    // });

    peer.signal(incomingSignal);

    return peer;
  }


  render() {
    if (this.state.isValid && !this.state.init)
      return (
        <div>
          <Header></Header>
          <Container>
            <StyledVideo muted ref={this.lVideo} autoPlay playsInline />
            {this.state.peers.map((peer, index) => {
              return (
                <Video key={peer.channelName} peer={peer} />
              );
            })}
          </Container>
        </div>
      );
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