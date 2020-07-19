import React, {Component} from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";

class Player extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      gameId: "hey",
      PlayerId: 1,
     };
    
  }


  render() {

    return (
        <div>
            <h1>Player Page</h1>
        </div>
    );
  }
}

export default Player;

