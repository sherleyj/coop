import React, {Component} from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";

class Coop extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      gameId: "hey",
     };
    
  }


  render() {

    return (
        <div>
            <h1>Game Page</h1>
        </div>
    );
  }
}

export default Coop;

