import React, {Component} from 'react';
import './App.css';
// import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";

class Player extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      gameId: "hey",
      playerId: 1,
      coins: 2,
     };
    this.income = this.income.bind(this);
    this.aide = this.aide.bind(this);
    this.coop = this.coop.bind(this);
  }

  income(event) {
    event.preventDefault();
    this.setState({
      coins : this.state.coins += 1,
    });
  }

  aide()  {
    this.setState({
      coins : this.state.coins += 2,
    });
  }

  coop()  {
    if (this.state.coins >= 7) {
      this.setState({
        coins : this.state.coins -= 7,
      });
    } 
  }


  render() {
    return (
        <div>
            <h1>Player Page {this.state.playerId}</h1>
            <span>coins {this.state.coins}</span>
            <button onClick={this.income}>Collect Income</button>
            <button onClick={this.aide}>Collect Foreign Aide</button>
            <button onClick={this.coop}>Coop!</button>
        </div>
    );
  }
}

export default Player;

