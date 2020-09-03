import React, { 
    useState,
    useEffect,
    createContext,
} from 'react';
import './App.css';
import { 
    useParams,
} from "react-router-dom";

export const GameContext = createContext();

export const GameProvider = props => {

  const [game, setGame] = useState({});

  return (
    <GameContext.Provider value={[game, setGame]}>{props.children}</GameContext.Provider>
  );

}