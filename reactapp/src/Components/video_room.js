import React, { Component, createRef } from 'react';
import Header from './subcomponents/header'
import io from 'socket.io-client'

import './styles/video_room.css'

class VideoRoom extends Component {

  constructor(props) {
    super(props);
    this.lVideo = createRef();
    this.rVideo = createRef();
  }


  state = {
    isValid: true,
    init: true,
    users: [],
    userStream: "hold",
    peerRef: "hold",
    socketRef: "hold",
    otherUser: "hold",
  }

  componentDidMount = () => {


    const mid = this.props.match.params.mid;
    const first = "Chris";
    const last = "Chris";

    fetch("https://127.0.0.1:8000/api/meeting/" + mid)
      .then(response => {
        if (response.ok) {
          this.setState({ isValid: true, init: false });

          //TODO: additional steps...
          this.state.socketRef = io("http://localhost:25000");

          this.state.socketRef.on("detailReq", () => {
            console.log("detail requeted from me..");
            this.state.socketRef.emit("detailRes", { first_name: first, last_name: last, email: "redfield78@yahoo.com", id: this.state.socketRef.id, room: mid, videoRef: createRef() });
          });

          this.state.socketRef.on("join room", lists => { // the joining client will have this

            this.setState({ users: lists, otherUser: lists[0].id });


          });

          this.state.socketRef.on("newEntry", person => { // when someone new joins 
            //setUsers(old => [old,person]);
            this.setState({ users: this.state.users.concat(person) });

            this.callUser(person.id);

            this.setState({ otherUser: person.id });


          });



          this.state.socketRef.on("offer", this.handleReciveCall);

          this.state.socketRef.on("answer", this.handleAnswer);

          this.state.socketRef.on("ice-candidate", this.handleNewICECandidateMsg);



          this.state.socketRef.on("update-list", list => { // when someone disconnect
            this.setState({ users: list });
          });



          navigator.mediaDevices.getUserMedia(
            { video: true, audio: false }
          ).then(
            stream => {

              this.state.users[0].videoRef.current.srcObject = stream;
              this.setState({ userStream: stream });

            }
          ).catch(
            error => {
              alert("Please Check you WebCamera and try Again...");
            }
          );


        }
        else
          this.setState({ isValid: false, init: false });
      });


  }

  callUser = (userID) => {
    const peer = this.createPeer(userID);
    this.setState({ peerRef: peer });
    this.state.userStream.getTracks().forEach(track => this.state.peerRef.addTrack(track, this.state.userStream));
  }

  createPeer = (userID) => {
    const ICE_config = {
      'iceServers': [
        {
          urls: 'stun:stun1.l.google.com:19302'
        },
        {
          urls: 'turn:numb.viagenie.ca',
          credential: 'muazkh',
          username: 'webrtc@live.com'
        }
      ]
    }

    const peer = new RTCPeerConnection(ICE_config);
    peer.onicecandidate = this.handleICEcandidateEvent;
    peer.ontrack = this.handleTrackEvent;
    peer.onnegotiationneeded = () => this.handleNegotiationonNeededEvent(userID);

    return peer;

  }


  handleNegotiationonNeededEvent = (userID) => {
    this.state.peerRef.createOffer().then(offer => {
      console.log("I created the ofer...");
      return this.state.peerRef.setLocalDescription(offer);
    }).then(() => {
      const payload = {
        target: userID,
        caller: this.state.socketRef.id,
        sdp: this.state.peerRef.localDescription
      };
      this.state.socketRef.emit("offer", payload);
    }).catch(e => console.log(e));
  }

  handleReciveCall = (incoming) => {
    const peer = this.createPeer();
    this.setState({ peerRef: peer });
    const desc = new RTCSessionDescription(incoming.sdp);
    this.state.peerRef.setRemoteDescription(desc).then(() => {
      this.state.userStream.getTracks().forEach(track => this.state.peerRef.addTrack(track, this.state.userStream));
    }).then(() => {
      return this.state.peerRef.createAnswer();
    }).then(answer => {
      return this.state.peerRef.setLocalDescription(answer);
    }).then(() => {
      const payload = {
        target: incoming.caller,
        caller: this.state.socketRef.id,
        sdp: this.state.peerRef.localDescription

      }
      this.state.socketRef.emit("answer", payload);
    })
  }

  handleAnswer = (messege) => {
    const desc = new RTCSessionDescription(messege.sdp);
    this.state.peerRef.setRemoteDescription(desc).catch(e => console.log(e));
  }

  handleICEcandidateEvent = (e) => {
    if (e.candidate) {
      const payload = {
        target: this.state.otherUser, // TODO: need to look at
        candidate: e.candidate
      }

      this.state.socketRef.emit("ice-candidate", payload);
    }
  }

  handleNewICECandidateMsg = (incoming) => {

    let candidate = null
    if (incoming.sdpMid != null) {
      candidate = new RTCIceCandidate(incoming);
    }

    this.state.peerRef.addIceCandidate(candidate);

  }

  handleTrackEvent = (e) => {
    console.log(this.state.users);
    this.state.users[1].videoRef.current.srcObject = e.streams[0];
  }


  render() {
    if (this.state.isValid && !this.state.init)
      return (
        <div>
          <Header></Header>
          <div>
            {this.state.users.map(tag => <video className='video_element' width="320" height="240" autoPlay loop={true} ref={tag.videoRef} key={tag.id}></video>)}
          </div>
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