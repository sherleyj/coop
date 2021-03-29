var express = require('express');
var router = express.Router();
const Redis = require("ioredis");
const bodyParser = require("body-parser");
const redis = new Redis();
const app = express();
const path = require('path')

const challenge_actions = ['tax','assassinate','steal','exchange','block'];

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

console.log("TEST");
/* GET home page. */
// TO DO: Remove actionTaken and turn from player objects
router.get('/api/getGame/:id', function(req, res, next) {
  const gameid = req.params.id;
  console.log("** In GetGame **");
  let game = {
    "gameId": gameid,
    "numPlayers": 6,
    "addPlayers": false,
    "challenge": false,
    "blockedBy": "",
    "actionTaken": "",
    "pTurnId": 0,
    "actOnId": [],
    "passed": 0,
    "activePlayers": 6,
    "losePlayer": false,
    "winner": "",
    "players": [
      {
        "id": 0,
        "characters": [{"id": 2, "active": true}, {"id": 1, "active": true}],
        "influence": 2,
        "playerName": "",
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
        "playerName": "",
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
        "playerName": "",
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
        "playerName": "",
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
        "playerName": "",
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
        "playerName": "",
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
        "name": "Hen", // chickens/ Hen - Duke
        "action": "tax",
        "block": "aid",
        "available": 3
      },
      {
        "name": "Fox", // fox - assassin 
        "action": "assassinate",
        "block": "",
        "available": 3
      },
      {
        "name": "Chick", // chicks - ambasador
        "action": "exchange",
        "block": "steal",
        "available": 3
      },
      {
        "name": "Rooster", // rooster - captain
        "action": "steal",
        "block": "steal",
        "available": 3
      },
      {
        "name": "Dog", // dog - contessa 
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

router.post('/api/setGame', function(req, res) {
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

router.post('/api/updatePlayerName', function(req, res) {
  // const gameid = req.params.id;

  const gameId = req.body.gameId;
  const playerId = req.body.playerId;
  const playerName = req.body.playerName;
  console.log("****** POST updatePlayerName! GameId: ", gameId);

  redis.get(gameId).then(function (result) {
    console.log("this is the result: " + result); 
    game = JSON.parse(result);
    game.players[playerId].playerName = playerName;

    redis.set(gameId, JSON.stringify(game));
    res.json(game);
  }).catch(function (error) {
    console.log(error);
    res.send("There was an error.");
  });

});

router.post('/api/createGame', function(req, res) {
  // const gameid = req.params.id;
  const gameId = req.body.gameId;
  // let numPlayers = parseInt(req.body.numPlayers);
  const playerName = req.body.playerName;
  console.log("** In createGame **");
  
  redis.get(gameId).then(function (result) {
    if (result) {
      console.log("game already exists");
      resJSON = JSON.parse(result);
      if (!resJSON.addPlayers) {
        res.status(418).json({ error: 'You cannot enter, the game has already started.' });
        return;
      }
      if (resJSON.numPlayers < 6) {
        resJSON.players.push(
        {
          "id": resJSON.numPlayers,
          "characters": [{"id": 0, "active": true}, {"id": 0, "active": true}],
          "influence": 2,
          "playerName": playerName,
          "coins": 2,
          "turn": false,
          "challenge": false,
          "passed": false,
          "actionTaken":"",
          "blockedBy":"",
          "losePlayer": false,
          "active": true
        });

        console.log("Added a player to the game", resJSON);
        let drawnCards = draw(resJSON, 2);
        if (drawnCards == undefined) {
          console.log("Draw returned undefined")
        }

        resJSON.players[resJSON.numPlayers].characters[0].id = drawnCards[0];
        resJSON.players[resJSON.numPlayers].characters[1].id = drawnCards[1];
        resJSON.characters[drawnCards[0]].available -= 1;
        resJSON.characters[drawnCards[1]].available -= 1;
        resJSON.numPlayers = resJSON.numPlayers + 1;
        resJSON.activePlayers = resJSON.activePlayers + 1;

        redis.set(gameId, JSON.stringify(resJSON));
    
        redis.get(gameId).then(function (result) {
          console.log("this is the result: " + result); 
          resJSON = JSON.parse(result);
          response = {"gameId" : gameId, "playerId" : resJSON.numPlayers - 1};
          res.json(response);
        }).catch(function (error) {
          console.log(error);
          res.status(500).json({ error: 'There was an error.' });
        });
      } else {
        res.status(418).json({ error: 'Game must be 2-6 players.  Max players reached.' });
        return;
      }
    } else {
        let game = {
          "gameId": gameId,
          "numPlayers": 1,
          "addPlayers": true,
          "challenge": false,
          "blockedBy": "",
          "actionTaken": "",
          "pTurnId": 0,
          "actOnId": [],
          "passed": 0,
          "activePlayers": 1,
          "losePlayer": false,
          "players": [],
          "winner": "",
          "characters": [
            {
              "name": "Hen", // chickens
              "action": "tax",
              "block": "aid",
              "available": 3
            },
            {
              "name": "Fox", // fox 
              "action": "assassinate",
              "block": "",
              "available": 3
            },
            {
              "name": "Chick", // chicks
              "action": "exchange",
              "block": "steal",
              "available": 3
            },
            {
              "name": "Rooster", // rooster
              "action": "steal",
              "block": "steal",
              "available": 3
            },
            {
              "name": "Dog", // dog
              "action": "",
              "block": "assassinate",
              "available": 3
            }
          ]
        };
    
        console.log("Game so far:", game);
        
        game.players.push(
        {
          "id": 0,
          "characters": [{"id": 0, "active": true}, {"id": 0, "active": true}],
          "influence": 2,
          "playerName": playerName,
          "coins": 2,
          "turn": true,
          "challenge": false,
          "passed": false,
          "actionTaken":"",
          "blockedBy":"",
          "losePlayer": false,
          "active": true
        });
    
        console.log("added players: ", game);
    
        // game = shuffle(game);

        let drawnCards = draw(game, 2);
        if (drawnCards == undefined) {
          console.log("Draw returned undefined")
        }
        game.players[0].characters[0].id = drawnCards[0];
        game.players[0].characters[1].id = drawnCards[1];
        game.characters[drawnCards[0]].available -= 1;
        game.characters[drawnCards[1]].available -= 1;
    
        console.log("created game: ", game);
    
        redis.set(gameId, JSON.stringify(game));
    
        redis.get(gameId).then(function (result) {
          console.log("this is the result: " + result); 
          resJSON = JSON.parse(result);
          response = {"gameId" : gameId, "playerId" : resJSON.numPlayers - 1};
          res.json(response);
        }).catch(function (error) {
          console.log(error);
          res.status(500).json({ error: 'There was an error.' });
        });
 
    }
  }).catch(function (error) {
    console.log(error);
    res.status(500).json({ error: 'There was an error.' });
  });


  

});

router.post('/api/takeTurn', function(req, res) {
  try {
    const gameId = req.body.gameId;
    let game = {};
    const playerId = req.body.playerId;
    const action = req.body.action;
    const actOnId = req.body.actOnId;
    // const challenge = req.body.challenge;
    const can_challenge = (action == "exchange" || action == "steal" || action == "assassinate" || action == "aid" || action == "tax")? true : false;

    redis.get(gameId).then(function (result) {
      resJSON = JSON.parse(result);
      game = resJSON;

      if (game.numPlayers < 2) {
        res.status(418).json({ error: 'Game must be at least 2 players.' });
        return;
      }
      const challenge = game.challenge;
      // console.log("takeTurn. GOT GAME FROM REDDIS: ", game)

      // no more players can be added to game.
      if(game.addPlayers) {
        game.addPlayers = false;
      }

      // allow for challenge before taking action
      if (game.pTurnId == playerId) {
        game.actionTaken = action;
        console.log("Action Taken: ", action);
        game.players[playerId].actionTaken = action;
        // allow for challenge before taking action
        // exchange: Challenge occurs before actOnId is filled (the card you are selecting to keep)
        // steal & assassinate: must select actOnId before challenge mode. (You should know who is being assassinated or stolen from, which influences if you want to challenge or not)
        // coop: must select actOnId before resolving action.  No challenge mode, this action cannot be challenged.
        // if (!challenge && !game.passed && (action == "exchange" || action == "aid" || action == "tax" || action == "steal" || action == "coop" || action == "assassinate")) {
        // if (!challenge && !game.passed && !(action == "income")) {
        //   console.log("a");
        //   if (action == "steal" || action == "assassinate") { 
        //     if (actOnId.length) {
        //       game.challenge = true;
        //       game.actOnId[0] = actOnId;
        //     }
        //   } else if (action == "coop") {
        //     console.log("action == coop");
        //     if (actOnId.length) {
        //       console.log("actOnId.length: ", actOnId.length);
        //       game.actOnId[0] = actOnId;
        //       game = resolveAction(game, playerId, action, actOnId);
        //     }
        //   } else {
        //     console.log("b");
        //     game.challenge = true;
        //   }
        // } else {
        //   console.log("c");
        //   game.actOnId = actOnId;
        //   game = resolveAction(game, playerId, action, actOnId);
        // }


        /////////////////////////////
        if (!challenge && !game.passed) {
          if (can_challenge) {
            if (action == "exchange" && actOnId.length){
              // only instance in which two players are prompted for input at once.  Exchange action in which challenger looses a character and both were active.  One player is choosing which card to loose and the other is choosing wich cards to keep for the exchange action.  If "card to loose" is chosen first, then challenge = false, but we need to resolve action anyway.
              game.actOnId = actOnId;
              game = resolveAction(game, playerId, action, actOnId);
            }
            else if (action == "steal" || action == "assassinate") {
              if (actOnId.length) {
                game.challenge = true;
                game.actOnId[0] = actOnId;
              }
            } else {
              game.challenge = true;
            }
          } else {
            if (action == "coop" && actOnId.length) {
              game.actOnId = actOnId;
              game = resolveAction(game, playerId, action, actOnId);
            }
            if (action == "income") {
              game = resolveAction(game, playerId, action, actOnId);
            }
          }
        } else {
          console.log("c");
          // game.actOnId = actOnId;
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

router.post('/api/challenge', function(req, res) {
  console.log("CHALLENGE!");
  const challenge_actions = ['tax','assassinate','steal','exchange','block'];
  
    const gameId = req.body.gameId;
    let game = {};
    const playerId = req.body.playerId;

    redis.get(gameId).then(function (result) {
      resJSON = JSON.parse(result);
      game = resJSON;
      console.log("got game: ", game);
      let c_0 = game.players[game.pTurnId].characters[0]; 
      let c_1 =  game.players[game.pTurnId].characters[1];
      game.players[playerId].challenge = true;
      
      if (challenge_actions.includes(game.actionTaken)) {
        if (c_0.active && c_1.active
          && game.characters[c_0.id].action != game.actionTaken 
          && game.characters[c_1.id].action != game.actionTaken) {
            console.log("Challenge: SUCCESS Lose Player!, both are active");
            // game.players[game.pTurnId].losePlayer = true;
            // game.losePlayer = true;
            game = loseInfluence(game, game.pTurnId, false);
            game.challenge = false;
        } else if (c_0.active && game.characters[c_0.id].action != game.actionTaken && !c_1.active) {
            console.log("Challenge: SUCCESS Lose Player!, only 0 is active");
            // c_0.active = false;
            // game.players[game.pTurnId].active = false;
            // game.activePlayers -= 1;
            // game = nextTurn(game); // no action id challenge successful
            game = loseInfluence(game, game.pTurnId, true);
        } else if (c_1.active && game.characters[c_1.id].action != game.actionTaken && !c_0.active) {
            console.log("Challenge: SUCCESS Lose Player!, only 1 is active");
            // c_1.active = false;
            // game.players[game.pTurnId].active = false;
            // game.activePlayers -= 1;
            // game = nextTurn(game); // no action id challenge successful
            game = loseInfluence(game, game.pTurnId, true);
        } else { // challenger loses player
            console.log("Challenger loses player")
            c_0 = game.players[playerId].characters[0]; 
            c_1 =  game.players[playerId].characters[1];

            // if (!c_1.active || !c_0.active) {
            //   game.players[playerId].active = false;
            //   game.activePlayers -= 1;
            //   c_0.active = false;
            //   c_1.active = false;
            //   console.log("Player DEAD: ", playerId);
            // } else {
            //   game.players[playerId].losePlayer = true;
            //   game.losePlayer = true;
            // }
            game = loseInfluence(game, playerId, false);
            game.challenge = false;
            // Challenge unsuccful so action is resolved. NextTurn is called at resolveAction.
            game = resolveAction(game, game.pTurnId, game.actionTaken, game.actOnId);
        }
      }
      redis.set(gameId, JSON.stringify(game));
      redis.get(gameId).then(function (result) {
        console.log("Challenge Complete, game: " + result); 
        resJSON = JSON.parse(result);
        res.json(resJSON);
      }).catch(function (error) {
        console.log(error);
        res.status(500).json({ error: 'There was an error.' });
      });
    }).catch(function (error) {
      console.log("ERROR");
      console.log(error);
      res.send("There was an error grabbbing game, gameId: ", gameId);
    });

});

router.post('/api/challengeBlock', function(req, res) {
  console.log("CHALLENGE BLOCK!");
  const challenge_actions = ['tax','assassinate','steal','exchange','block'];
  
    const gameId = req.body.gameId;
    let game = {};
    const playerId = req.body.playerId;

    redis.get(gameId).then(function (result) {
      resJSON = JSON.parse(result);
      game = resJSON;
      console.log("got game: ", game);
      let c_0 = game.players[game.blockedBy].characters[0]; 
      let c_1 =  game.players[game.blockedBy].characters[1];
      game.players[playerId].challenge = true;
      
      console.log(game.characters[c_0.id].block);
      console.log(game.characters[c_1.id].block);
      // if (challenge_actions.includes(game.actionTaken)) {
        if (c_0.active && c_1.active
          && game.characters[c_0.id].block != game.actionTaken 
          && game.characters[c_1.id].block != game.actionTaken) {
            console.log("Challenge: SUCCESS Lose Player!, both are active");
            // game.players[game.blockedBy].losePlayer = true;
            // game.losePlayer = true;
            game = loseInfluence(game, game.blockedBy, false); /////////////////////////////////////
            game.challenge = false;
            game = resolveAction(game, game.pTurnId, game.actionTaken, game.actOnId);
        } else if (c_0.active && game.characters[c_0.id].block != game.actionTaken && !c_1.active) {
            console.log("Challenge: SUCCESS Lose Player!, only 0 is active");
            // c_0.active = false;
            // game.players[game.blockedBy].active = false;
            // game.activePlayers -= 1;
            game = loseInfluence(game, game.blockedBy, false); /////////////////////////////////////
            game.challenge = false;
            game = resolveAction(game, game.pTurnId, game.actionTaken, game.actOnId);
        } else if (c_1.active && game.characters[c_1.id].block != game.actionTaken && !c_0.active) {
            console.log("Challenge: SUCCESS Lose Player!, only 1 is active");
            // c_1.active = false;
            // game.players[game.blockedBy].active = false;
            // game.activePlayers -= 1;
            game = loseInfluence(game, game.blockedBy, false); /////////////////////////////////////
            game.challenge = false;
            game = resolveAction(game, game.pTurnId, game.actionTaken, game.actOnId);
        } else { // challenger loses player
            console.log("Challenger of block (pTurnId player) loses player")
            // c_0 = game.players[game.pTurnId].characters[0]; 
            // c_1 =  game.players[game.pTurnId].characters[1];
            // if (!c_1.active || !c_0.active) {
            //   console.log("Player DEAD.")
            //   game.players[game.pTurnId].active = false;
            //   game.activePlayers -= 1;
            //   c_0.active = false;
            //   c_1.active = false;
            //   game = nextTurn(game); 
            // } else {
            //   console.log("Player loses card.")
            //   game.players[game.pTurnId].losePlayer = true;
            //   game.losePlayer = true;
            //   game.challenge = false;
            // }
            game = loseInfluence(game, game.pTurnId, true); /////////////////////////////////////

        }
      // }
      redis.set(gameId, JSON.stringify(game));
      redis.get(gameId).then(function (result) {
        console.log("Challenge Complete, game: " + result); 
        resJSON = JSON.parse(result);
        res.json(resJSON);
      }).catch(function (error) {
        console.log(error);
        res.status(500).json({ error: 'There was an error.' });
      });
    }).catch(function (error) {
      console.log("ERROR");
      console.log(error);
      res.send("There was an error grabbbing game, gameId: ", gameId);
    });
});

router.post('/api/block', (req, res) => {
  let gameId = req.body.gameId;
  let playerId = req.body.playerId;

  redis.get(gameId).then(function (result) { 
    game = JSON.parse(result);

    if (game.challenge && game.actionTaken && ['aid','steal','assassinate'].includes(game.actionTaken)) {
      game.players[playerId].actionTaken = 'block';
      // game.players[game.pTurnId].blockedBy = playerId;
      game.blockedBy = playerId;
      game.challenge = true;
      game = passedSet(game, game.pTurnId);

      redis.set(gameId, JSON.stringify(game));
      res.json(game);
    }
  }).catch(function (error) {
    console.log(error);
    res.status(500).json({ error: 'There was an error.' });
  });
});

router.post('/api/pass', (req, res) => {
  let gameId = req.body.gameId;
  let playerId = req.body.playerId;

  redis.get(gameId).then(function (result) {
    console.log("Challenge Complete, game: " + result); 
    game = JSON.parse(result);

    if (!game.players[playerId].passed) {
      game.passed = game.passed + 1;
      game.players[playerId].passed = true;
    
      if (game.passed == game.activePlayers - 1 && !game.blockedBy){ 
        game.challenge = false;
        console.log("resolving action with game: ", game)
        game = resolveAction(game, game.pTurnId, game.actionTaken, game.actOnId); 
      }

      if (game.passed == game.activePlayers - 1 && game.blockedBy) {
        game = nextTurn(game);
      }
      
      redis.set(gameId, JSON.stringify(game));
      res.json(game);
    }
  }).catch(function (error) {
    console.log(error);
    res.status(500).json({ error: 'There was an error.' });
  });
});

router.post('/api/loseCharacter', (req, res) => {
  let gameId = req.body.gameId;
  let playerId = req.body.playerId;
  let characterToLose = req.body.characterToLose;

  redis.get(gameId).then(function (result) {
    console.log("Challenge Complete, game: " + result); 
    game = JSON.parse(result);
    
    if (game.players[playerId].losePlayer) {
      game.players[playerId].characters[parseInt(characterToLose)].active = false;
      game.players[playerId].losePlayer = false;
      game.players[playerId].influence -= 1;

      // only instance in which two players are prompted for input at once.  Exchange action in which challenger looses a character and had both were active.  One player is choosing which card to loose and the other is choosing wich cards to keep for the exchange action.
      if (game.actionTaken != "exchange" && !game.actOnId.length) { 
        game = nextTurn(game);
      } else {
        game.losePlayer = false;
      }
      
      redis.set(gameId, JSON.stringify(game));
      res.json(game);
    } else {
      res.send("You did not lose a player");
    }
  }).catch(function (error) {
    console.log(error);
    res.status(500).json({ error: 'There was an error.' });
  });
});

function resolveAction(game, playerId, action, actOnId) {
  console.log("***** in resolveAction *****")

  switch (action) {
    case "income":
      console.log("case income")
      game.players[playerId].coins += 1;
      // game.players[playerId].actionTaken = 'income';  
      game = nextTurn(game); 
      break;
    case "aid":
      console.log("case aide")
      game.players[playerId].coins += 2;
      game.players[playerId].actionTaken = "aid";
      // game.challenge = true;  
      if (!game.losePlayer) { 
        game = nextTurn(game); 
      }
      // game.waitingOnId = -1;
      break;
    case "tax":
      console.log("case tax")
      game.players[playerId].coins += 3;
      if (!game.challenge && !game.losePlayer) { //If challenge was lost and losePlayer is set, challenger needs to choose which card to lose.  NextTurn is called from losePlayer.
        game = nextTurn(game);
      } 
      break;
    case "steal":
      console.log("case steal")
      game.players[playerId].actionTaken = "steal";
      // game = passedSet(game, playerId);
      if (actOnId.length) {
        if (game.players[actOnId].coins > 1){
          game.players[actOnId].coins -= 2;
          game.players[playerId].coins += 2;
        } else if (game.players[actOnId].coins > 0) {
          game.players[actOnId].coins -= 1;
          game.players[playerId].coins += 1;
        }
        game.players[playerId].passed = true;
        game.players[actOnId].passed = false;
        // game.challenge = true;
        // game.waitingOnId = -1;
        if (!game.challenge && !game.losePlayer) {
          game = nextTurn(game);
        } 
      }
      break;
    case "coop":
      console.log("case coop")
      if (actOnId.length && game.players[playerId].coins > 6) {
        game.players[playerId].actionTaken = "coop";
        game.players[playerId].coins -= 7; 
        // if (game.players[actOnId].characters[0].active && game.players[actOnId].characters[0].active) {
        //   console.log("player (actOnId) needs to choose which card they lose.")
        //   game.players[actOnId].losePlayer = true;
        //   game.losePlayer = true;
        // } else  {
        //   console.log("player (actOnId) is now DEAD, next turn.")
        //   game.players[actOnId].characters[1].active = false;
        //   game.players[actOnId].characters[0].active = false;
        //   game.players[actOnId].active = false
        //   game.activePlayers -= 1;
        //   game = nextTurn(game);
        // }
        game = loseInfluence(game, actOnId, true);
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
        if (exchangeOptions == undefined) {
          console.log("Draw returned undefined")
        }
        exchangeOptions.forEach((i) => {
          console.log(i);
          game.characters[i].available -= 1;
          game.players[playerId].characters.push({"id": i, "active": true});
        });
        console.log("game.players[playerId].coins: ", game.players[playerId].coins);
        console.log(game.players[playerId].characters);
        console.log("actOnId: ", actOnId);
      } else {
        if (actOnId.length == game.players[playerId].influence) {
          game.players[playerId].characters = game.players[playerId].characters.filter((c) => {
            if(c.active) {
              console.log("removing character: ", c.id);
              game.characters[c.id].available += 1;
              return false;
            }
            return true;
          });

          console.log("removed all active cards: ", game.players[playerId].characters);
          actOnId.forEach((c) => {
            game.players[playerId].characters.push({"id": c, "active": true});
            game.characters[c].available -= 1;
          })
          console.log("added selected cards: ", game.players[playerId].characters);
          if (!game.challenge && !game.losePlayer) {
            game = nextTurn(game);
          } 
        }
      }
      break;
    case "assassinate" :
      console.log("case assassinate")
      game.players[playerId].actionTaken = "assassinate";
      if (actOnId.length && !game.blockedBy) {
        game = loseInfluence(game, actOnId[0], true)
      } 
        
      break;
  }

  return game;
}

function loseInfluence(game, playerId, goToNextTurn) {
  if (game.players[playerId].characters[0].active && game.players[playerId].characters[1].active
    && !game.players[playerId].losePlayer) { 
    console.log("player needs to choose which card they lose.")
    game.players[playerId].losePlayer = true;
    game.losePlayer = true;
  } else  {
    console.log("player is now DEAD");
    game.players[playerId].characters[1].active = false;
    game.players[playerId].characters[0].active = false;
    game.players[playerId].active = false;
    game.activePlayers -= 1;

    // check for winner
    game = checkWinner(game);
    if (goToNextTurn && game.activePlayers > 1) {
      game = nextTurn(game);
    }
    
  }

  return game;
}

function checkWinner(game) {
  if (game.activePlayers == 1) {
    game.players.forEach((p) => {
      if (p.active) {
        console.log("WINNER!!");
        game.winner = p.id;
      }
    });
  } 
  return game;
}

  // TODO: skip inactive players when setting next players turn.
function nextTurn(game) {
  console.log("in NextTurn, gameid: ", game.gameId);
  game.players[game.pTurnId].turn = false;

  // game.players[game.pTurnId].blockedBy = "";
  game.blockedBy = "";
  game.losePlayer = false;

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
    p.passed = false;
    p.challenge = false;
    p.actionTaken = "";
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
    // ex: [0,0,0,1,1,1,2,2,2,3,3,3,4,4,4]
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

    let totalAvailable = 0;
    game.characters.forEach( (p, i) =>{
      totalAvailable += p.available;
    });

    if (totalAvailable >= n) {
      // gather the deck into array.
      let c = new Array;
      game.characters.forEach( (p, i) => {
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
  } else {
    console.log("There are not enough cards to draw: ", n);
    console.log("available cards: ", totalAvailable);
    return undefined;
  }

} catch(e) {
  console.log(e);
}

  
}

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname,'..', 'build')));
// Anything that doesn't match the above, send back index.html
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname,'..', 'build', 'index.html'));
  //res.sendFile(path.join(__dirname + '../build/index.html'))
});

module.exports = router;
