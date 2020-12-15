var express = require('express');
var router = express.Router();
const Redis = require("ioredis");
const bodyParser = require("body-parser");
const redis = new Redis();
const app = express();

const challenge_actions = ['tax','assassinate','steal','exchange','block'];

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/* GET home page. */
// TO DO: Remove actionTaken and turn from player objects
router.get('/getGame/:id', function(req, res, next) {
  const gameid = req.params.id;

  let game = {
    "gameId": gameid,
    "numPlayers": 6,
    "challenge": false,
    "actionTaken": "",
    "pTurnId": 0,
    "actOnId": [],
    "passed": 0,
    "activePlayers": 6,
    "players": [
      {
        "id": 0,
        "characters": [{"id": 2, "active": true}, {"id": 1, "active": true}],
        "influence": 2,
        "coins": 2,
        "turn": true,
        "challenge": false,
        "passed": false,
        "actionTaken":"",
        "blockedBy":"",
        "losePlayer": false,
        "active": true
      },
      {
        "id": 1,
        "characters": [{"id": 0, "active": true}, {"id": 1, "active": true}],
        "influence": 2,
        "coins": 2,
        "turn": false,
        "challenge": false,
        "passed": false,
        "actionTaken":"",
        "blockedBy":"",
        "losePlayer": false,
        "active": true
      },
      {
        "id": 2,
        "characters": [{"id": 3, "active": true}, {"id": 1, "active": true}],
        "influence": 2,
        "coins": 2,
        "turn": false,
        "challenge": false,
        "passed": false,
        "actionTaken":"",
        "blockedBy":"",
        "losePlayer": false,
        "active": true
      },
      {
        "id": 3,
        "characters": [{"id": 0, "active": true}, {"id": 1, "active": true}],
        "influence": 2,
        "coins": 2,
        "turn": false,
        "challenge": false,
        "passed": false,
        "actionTaken":"",
        "blockedBy":"",
        "losePlayer": false,
        "active": true
      },
      {
        "id": 4,
        "characters":[{"id": 4, "active": true}, {"id": 1, "active": true}],
        "influence": 2,
        "coins": 2,
        "turn": false,
        "challenge": false,
        "passed": false,
        "actionTaken":"",
        "blockedBy":"",
        "losePlayer": false,
        "active": true
      },
      {
        "id": 5,
        "characters": [{"id": 2, "active": true}, {"id": 0, "active": true}],
        "influence": 2,
        "coins": 2,
        "turn": false,
        "challenge": false,
        "passed": false,
        "actionTaken":"",
        "blockedBy":"",
        "losePlayer": false,
        "active": true
      }
    ],
    "characters": [
      {
        "name": "Duke",
        "action": "tax",
        "block": "aid",
        "available": 3
      },
      {
        "name": "Assassin",
        "action": "assassinate",
        "block": "",
        "available": 3
      },
      {
        "name": "Ambassador",
        "action": "exchange",
        "block": "steal",
        "available": 3
      },
      {
        "name": "Captain",
        "action": "steal",
        "block": "steal",
        "available": 3
      },
      {
        "name": "Contessa",
        "action": "",
        "block": "assassinate",
        "available": 3
      }
    ]
  };
  
  redis.get(gameid).then(function (result) {
    console.log("this is the result: " + result); 
    if (result) {
      resJSON = JSON.parse(result);
      res.json(resJSON);
    } else {
      game = shuffle(game);
      redis.set(gameid, JSON.stringify(game), "NX");
      redis.get(gameid).then(function (result) {
        resJSON = JSON.parse(result);
        res.json(resJSON);
      }).catch(function(error){
        console.log(error);
      });
    }
  }).catch(function (error) {
    console.log(error);
  });

});

router.post('/setGame', function(req, res) {
  // const gameid = req.params.id;

  const gameId = req.body.gameId;
  console.log("****** POST! GameId: ", gameId);

  redis.set(gameId, JSON.stringify(req.body));

  redis.get(gameId).then(function (result) {
    console.log("this is the result: " + result); 
    resJSON = JSON.parse(result);
    res.json(resJSON);
  }).catch(function (error) {
    console.log(error);
    res.send("There was an error.");
  });

});
 
router.post('/takeTurn', function(req, res) {
  try {
    const gameId = req.body.gameId;
    let game = {};
    const playerId = req.body.playerId;
    const action = req.body.action;
    const actOnId = req.body.actOnId;
    // const challenge = req.body.challenge;

    redis.get(gameId).then(function (result) {
      resJSON = JSON.parse(result);
      game = resJSON;
      const challenge = game.challenge;
      // console.log("takeTurn. GOT GAME FROM REDDIS: ", game)

      // allow for challenge before taking action
      if (game.pTurnId == playerId) {
        game.actionTaken = action;
        console.log("Action Taken: ", action);
        // allow for challenge before taking action
        // exchange: Challenge occurs before actOnId is filled (the card you are selecting to keep)
        // steal: must select actOnId before challenge mode
        // coop: must select actOnId before resolving action.  No challenge mode, this action cannot be challenged.
        if (!challenge && !game.passed && (action == "exchange" || action == "aid" || action == "tax" || action == "steal" || action == "coop")) {
          if (action == "steal") { 
            if (actOnId.length) {
              game.challenge = true;
              game.actOnId[0] = actOnId;
            }
          } else if (action == "coop") {
            console.log("action == coop");
            if (actOnId.length) {
              console.log("actOnId.length: ", actOnId.length);
              game.actOnId[0] = actOnId;
              game = resolveAction(game, playerId, action, actOnId);
            }
          } else {
            game.challenge = true;
          }
        } else {
          game.actOnId = actOnId;
          game = resolveAction(game, playerId, action, actOnId);
        }

        console.log("About to set game: ", game);
        redis.set(gameId, JSON.stringify(game));
        res.json(game);
      } else {
        res.send("It's not your turn.");
      }
    }).catch(function (error) {
      console.log(error);
      res.send("There was an error.", gameId);
    });

    } catch(e) {
      console.log(e);
      res.send("There was an error.", gameId);
    }

});

router.post('/challenge', function(req, res) {
  try {
    const gameId = req.body.gameId;
    let game = {};
    const playerId = req.body.playerId;
    const action = req.body.actionTaken;
    const turnPlayer = req.body.pTurnId;
    const actOnId = req.body.actOnId;

    redis.get(gameId).then(function (result) {
      resJSON = JSON.parse(result);
      game = resJSON;
    }).catch(function (error) {
      console.log(error);
      res.send("There was an error grabbbing game, gameId: ", gameId);
    });

    const c_0 = turnPlayer.characters[0]; 
    const c_1 =  turnPlayer.characters[1];
    
    game.players[playerid].challenge = true;

    
    if (challenge_actions.includes(action)) {
      if (c_0.active && c_1.active
        && game.characters[c_0.id].action != turnPlayer.actionTaken 
        && game.characters[c_1.id].action != turnPlayer.actionTaken) {
          console.log("Challenge: SUCCESS Lose Player!, both are active");
          turnPlayer.losePlayer = true;
        } else if (c_0.active && game.characters[c_0.id].action != turnPlayer.actionTaken
          && !c_1.active) {
          console.log("Challenge: SUCCESS Lose Player!, only 0 is active");
          c_0.active = false;
          turnPlayer.active = false;
          game.activePlayers -= 1;
        } else if (c_1.active && game.characters[c_1.id].action != turnPlayer.actionTaken && !c_0.active) {
          console.log("Challenge: SUCCESS Lose Player!, only 1 is active");
          c_1.active = false;
          turnPlayer.active = false;
          game.activePlayers -= 1;
          nextTurn();
        } else { // challenger loses player
          c_0 = game.players[playerId].characters[0];
          c_1 = game.players[playerId].characters[1];
          // TODO TakeAction call here.
          if (!c_1.active || !c_0.active) {
            game.players[playerId].active = false;
            game.activePlayers -= 1;
            c_0.active = false;
            c_1.active = false;
          } else {
            game.players[playerId].losePlayer = true;
          }
          action(game, playerId, action, actOnId)
        }
    }
    redis.set(gameId, JSON.stringify(game));
    redis.get(gameId).then(function (result) {
      console.log("Challenge Complete, game: " + result); 
      resJSON = JSON.parse(result);
      res.json(resJSON);
    }).catch(function (error) {
      console.log(error);
      res.send("There was an error.");
    });
  } catch {
    console.log(e);
  }

});

router.post('/pass', (req, res) => {
  let gameId = req.body.gameId;
  let playerId = req.body.playerId;

  redis.get(gameId).then(function (result) {
    console.log("Challenge Complete, game: " + result); 
    game = JSON.parse(result);
    game.passed = game.passed + 1;
    game.players[playerId].passed = true;
   
    // TODO: need to active players count
    if (game.passed == game.activePlayers - 1){ 
      game.challenge = false;
      console.log("resolving action with game: ", game)
      game = resolveAction(game, game.pTurnId, game.actionTaken, game.actOnId); 
    }
    
    redis.set(gameId, JSON.stringify(game));
    res.json(game);
  }).catch(function (error) {
    console.log(error);
    res.send("There was an error.");
  });
});
 

function resolveAction(game, playerId, action, actOnId) {
  console.log("***** in resolveAction *****")

  switch (action) {
    case "income":
      console.log("case income")
      game.players[playerId].coins += 1;
      // game.players[playerId].actionTaken = 'income';
      game = nextTurn(game, playerId); 
      break;
    case "aid":
      console.log("case aide")
      game.players[playerId].coins += 2;
      game.players[playerId].actionTaken = "aid";
      // game.challenge = true;
      game = nextTurn(game, playerId); 
      // game.waitingOnId = -1;
      break;
    case "tax":
      console.log("case tax")
      game.players[playerId].coins += 3;
      // game.players[playerId].actionTaken = "tax";
      // game.challenge = ;
      game = nextTurn(game, playerId); 
      // game.waitingOnId = -1;
      break;
    case "steal":
      console.log("case steal")
      game.players[playerId].actionTaken = "steal";
      // game = passedSet(game, playerId);
      if (actOnId.length) {
        if (game.players[actOnId].coins > 1){
          game.players[actOnId].coins -= 2;
          game.players[playerId].coins += 2;
        } else {
          game.players[actOnId].coins -= 1;
          game.players[playerId].coins += 1;
        }
        game.players[playerId].passed = true;
        game.players[actOnId].passed = false;
        // game.challenge = true;
        // game.waitingOnId = -1;
        game = nextTurn(game, playerId);
      }
      break;
    case "coop":
      console.log("case coop")
      if (actOnId.length && game.players[playerId].coins > 6) {
        game.players[playerId].actionTaken = "coop";
        game.players[playerId].coins -= 7; 
        game.challenge = true;
        if (game.players[actOnId].characters[0].active && game.players[actOnId].characters[0].active) {
          game.players[actOnId].losePlayer = true;
        } else  {
          if (!game.players[actOnId].characters[0].active) {
            game.players[actOnId].characters[1].active = false;
          } else {
            game.players[actOnId].characters[0].active = false;
          }
          game.players[actOnId].active = false
          game.activePlayers -= 1;
          // game = nextTurn(game, playerId);
        }
      } else {
        console.log("You do not have enough coins to coop! ");
        game = resetAction(game, playerId);
      }
      break;
    case "exchange":
      console.log("case exchange", action);
      if (!actOnId.length) {
        game.players[playerId].actionTaken = "exchange";
        // game.players[playerId].exchangeOptions = draw(game, 2);
        
        let exchangeOptions = draw(game, 2);
        exchangeOptions.forEach((i) => {
          console.log(i);
          game.characters[i].available -= 1;
          game.players[playerId].characters.push({"id": i, "active": true});
        });
        console.log("game.players[playerId].coins: ", game.players[playerId].coins);
        console.log(game.players[playerId].characters);
        console.log("actOnId: ", actOnId);
      } else {
        // let swapIndex = game.players[playerId].characters[0].swap? 0 : 1;
        // let putBackInDeckID = game.players[playerId].characters[swapIndex].id;
        // game.players[playerId].characters[swapIndex].id = actOnId;
        // game.players[playerId].characters[0].swap = putBackInDeckID;
        // game.characters[putBackInDeckID].available += 1;
        // game.characters[actOnId].available -= 1;
        // game.challenge = true;
        // // game.waitingOnId = -1;
        // console.log("EXCHANGED, game: ", game);
        
        //TO DO*****
        remove = 2;
        game.players[playerId].characters.forEach((p, i) => {
          if(p.active && !actOnId.includes(p.id) && remove > 0) {
            console.log("removing character: ", p.id);
            game.characters[p.id].available += 1;
            game.players[playerId].characters.splice(i,1);
            remove -= 1;
          }
        });
        game = nextTurn(game, playerId); 

        }
      break;
  }

  return game;
}

  // TODO: skip inactive players when setting next players turn.
function nextTurn(game, playerId) {
  console.log("in NextTurn, gameid: ", game.gameId);
  game.players[game.pTurnId].turn = false;
  game.players[game.pTurnId].actionTaken = "";
  game.players[playerId].actionTaken = "";
  game.players[playerId].characters[0].swap = "";
  game.players[playerId].characters[1].swap = "";

  let blockerId = game.players[game.pTurnId].blockedBy;
  if (blockerId){
    let blockingPlayer = game.players[blockerId];
    blockingPlayer.actionTaken = "";
  }

  game.players[game.pTurnId].blockedBy = "";

  game.pTurnId = (game.numPlayers == game.pTurnId+1) ? 0 : game.pTurnId+1;
  while(!game.players[game.pTurnId].active) {
    game.pTurnId = (game.numPlayers == game.pTurnId+1) ? 0 : game.pTurnId+1;
  }
  game.players[game.pTurnId].turn = true;

  game.actionTaken = "";
  game.challenge = false;
  game.actOnId = [];
  game.passed = 0;

  game.players.forEach((p, i) => {
    p.passed = false
  })
  console.log("in nextTurn, game:", game);
  
  return game;
}

function resetAction(game, id) {
  game.actionTaken = "";
  game.actOnId = [];
  game.players[id].actionTaken = "";
  return game;
}

function passedSet(game, id) {
  game.players.forEach( (p, i) => {
    if (i != id) {
      p.passed = true; // rename to pass
    } else {
      p.passed = false;
    }
  })
  game.passed = game.activePlayers - 2;
  return game;
}

function shuffle(game) {
  try {

    // gather the deck into array.
    let c = new Array;
    game.characters.forEach( (p, i) =>{
      let a = p.available
      while(a > 0){
        c.push(i);
        a -= 1;
      }
    });

    console.log(c);
    // let c = [0,0,0,1,1,1,2,2,2,3,3,3,4,4,4];

    // for (let i = c.length - 1; i > 0; i--) {
    //   let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
    //  // swap with "destructuring assignment" syntax 
    //   [c[i], c[j]] = [c[j], c[i]];
    // }

    // shuffle the deck!
    for (let i = 0; i < c.length - 1; i++) {
      let j = Math.floor(Math.random() * (c.length - i)) + i; // random index from i to c.length - 1
      // swap with "destructuring assignment" syntax 
      [c[i], c[j]] = [c[j], c[i]];
    }
    console.log(c);
  
    let i = 0;
    game.players.forEach( (p) => {
      game.characters[c[i]].available -= 1;
      p.characters[0].id = c[i];
      i += 1;
      game.characters[c[i]].available -= 1;
      p.characters[1].id = c[i];
      i += 1;
    });

} catch(e) {
  console.log(e);
}

  return game;
}

function draw(game, n) {
  try {

    // gather the deck into array.
    let c = new Array;
    game.characters.forEach( (p, i) =>{
      let a = p.available
      while(a > 0){
        c.push(i);
        a -= 1;
      }
    });

    // console.log(c);

    // shuffle the deck!
    for (let i = 0; i < n; i++) {
      let j = Math.floor(Math.random() * (c.length - i)) + i; // random index from i to c.length - 1
      // swap with "destructuring assignment" syntax 
      [c[i], c[j]] = [c[j], c[i]];
    }
    
    // console.log(c);
    console.log("DRAW output: ", c.slice(0,n))
  
    return c.slice(0,n);

} catch(e) {
  console.log(e);
}

  
}

module.exports = router;
