var express = require('express');
var router = express.Router();
const Redis = require("ioredis");
const bodyParser = require("body-parser");
const redis = new Redis();
const app = express();

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/* GET home page. */
router.get('/getGame/:id', function(req, res, next) {
  const gameid = req.params.id;

  let game = {
    "gameId": gameid,
    "numPlayers": 6,
    "challenge": false,
    "pTurnId": 0,
    "passed": 0,
    "activePlayers": 6,
    "players": [
      {
        "id": 0,
        "characters": [{"id": 2, "active": true}, {"id": 1, "active": true}],
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
    let game = req.body.game;
    const playerId = req.body.playerId;
    const action = req.body.action;
    const actOnPlayer = req.body.actOnPlayer;

    console.log("in takeTurn POST call for gameid: " + req.body.gameId);

    switch (action) {
      case "income":
        game.players[playerId].coins += 1;
        game.players[playerId].actionTaken = 'income';
        game = nextTurn(game, playerId); 
        break;
      case "aid":
        game.players[playerId].coins += 2;
        game.players[playerId].actionTaken = "aid";
        game.challenge = true;
        break;
      case "tax":
        game.players[playerId].coins += 3;
        game.players[playerId].actionTaken = "tax";
        game.challenge = true;
        break;
      case "steal":
        game.players[playerId].actionTaken = "steal";
        game = passedSet(game, playerId);
        if (actOnPlayer) {
          game.players[actOnPlayer].coins -= 2;
          game.players[playerId].coins += 2;
          game.players[playerId].passed = true;
          game.players[actOnPlayer].passed = false;
          game.challenge = true;
        }
        break;
      case "coop":
        game.players[playerId].actionTaken = "coop";
        if (actOnPlayer) {
          game.players[playerId].coins -= 7; 
          game.challenge = true;
          if (game.players[actOnPlayer].characters[0].active && game.players[actOnPlayer].characters[0].active) {
            game.players[actOnPlayer].losePlayer = true;
          } else  {
            if (!game.players[actOnPlayer].characters[0].active) {
              game.players[actOnPlayer].characters[1].active = false;
            } else {
              game.players[actOnPlayer].characters[0].active = false;
            }
            game.players[actOnPlayer].active = false
            game.activePlayers -= 1;
            game = nextTurn(game, playerId);
          }
        }

        console.log("game.players[playerId].coins: ", game.players[playerId].coins);
        console.log(game);
        break;
    }
    
    redis.set(gameId, JSON.stringify(game));

    redis.get(gameId).then(function (result) {
      console.log("this is the result: " + result); 
      resJSON = JSON.parse(result);
      res.json(resJSON);
    }).catch(function (error) {
      console.log(error);
      res.send("There was an error.");
    });
  } catch(e) {
    console.log(e);
  }


});

router.put('/', (req, res) => {
  res.send('Received a PUT HTTP method');
});
 
router.delete('/', (req, res) => {
  res.send('Received a DELETE HTTP method');
});

  // TODO: skip inactive players when setting next players turn.
function nextTurn(game, playerId) {
  console.log("in NextTurn, gameid: ", game.gameId);
  game.players[game.pTurnId].turn = false;
  game.players[game.pTurnId].actionTaken = "";
  game.players[playerId].actionTaken = "";

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


  game.challenge = false;

  game.passed = 0;

  game.players.forEach((p, i) => {
    p.passed = false
  })
  
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

  for (let i = 0; i < c.length - 1; i++) {
    let j = Math.floor(Math.random() * (c.length - i)) + i; // random index from i to c.length - 1
   // swap with "destructuring assignment" syntax 
   let p = (c.length) - i;
   console.log( " (c.length) - i: " +p +" i: " + i + " j: " + j);
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


module.exports = router;
