import React, { useState, useEffect } from 'react';
import { channelNames, EEGReading, MuseClient } from 'muse-js';
import io from 'socket.io-client';

class MuseControlsView extends React.Component {

  constructor(...args) {
    super(...args);
    this.socket = io('http://localhost:5000/');
    this.museClient = new MuseClient();
    this.state = {startedConnection: false}
  }
  
  static defaultProps = {
    onKeyDown: () => {},
    onKeyUp: () => {},
  };

  startMuseConnection = async () => {
    console.log("created muse client")
    await this.museClient.connect();
    await this.museClient.start();
    this.setState({startedConnection: true})
  }

  startReading = () => {
    console.log("starting to read!!!")
    this.museClient.eegReadings.subscribe(reading => {
      switch(reading.electrode) {
        case channelNames.indexOf('TP9'):
          reading.electrode = 'TP9'
          break;
        case channelNames.indexOf('AF7'):
          reading.electrode = 'AF7'
          break;
        case channelNames.indexOf('AF8'):
          reading.electrode = 'AF8'
          break;
        case channelNames.indexOf('TP10'):
          reading.electrode = 'TP10'
          break;
      }
      this.socket.emit('eeg-stream', JSON.stringify(reading))
    });

    this.socket.on('connect', (msg) => {
      console.log("Connected!")
      this.setState({startedConnection: true})
    });

    this.socket.on('jaw-state', (msg) => {
      if (msg == 'clenched') {
        console.log("clench")
        var e = new KeyboardEvent('keydown', {code: 'Space'});
        this.onKeyDown(e);
      } else {
        // console.log("relax")
        // this.props.onKeyUp('Space');
      }
    });
  }

  componentDidMount() {
    window.addEventListener('keydown', this.onKeyDown, false);
    window.addEventListener('keyup', this.onKeyUp, false);
    // this.startMuseConnection();
  }

  componentWillUnmount() {
    // this.museClient.close()
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  onKeyDown = e => {
    this.props.onKeyDown(e);
  };

  onKeyUp = e => {
    this.props.onKeyUp(e);
  };

  render() {
    if (this.state.startedConnection) {
      this.startReading();
      return this.props.children;
    } else {
      return (
        // <button onClick={this.startMuseConnection} style={{color: 'blue', textAlign: 'center'}}>
        //   Connect!
        // </button>
        <button onClick={this.startMuseConnection} style={{fontSize: 30, color: "white", backgroundColor: "#33AFFF", border:"blue", textAlign: "center", width:500}}>
          Connect Muse Headset
        </button>
      );
    }
  }
}

export default MuseControlsView;