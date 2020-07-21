import React, {Component} from 'react';
import './App.css';
import { 
    useParams,
    useState
} from "react-router-dom";

function Coop() {
    let { gameid } = useParams();
    return (
        <div>
            <h1>Game Page, {gameid}</h1>
        </div>
    );

}



export default Coop;

