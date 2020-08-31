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
  console.log("grabbed from request parameter: " + gameid);

  const game = {
    "gameId": gameid,
    "numPlayers": 6,
    "challenge": false,
    "players": [
      {
        "id": 1,
        "character": [{"name": "duke", "active": true}, {"name": "captain", "active": true}],
        "coins": 2,
        "turn": true
      },
      {
        "id": 2,
        "character": [{"name": "duke", "active": true}, {"name": "captain", "active": true}],
        "coins": 2,
        "turn": false
      },
      {
        "id": 3,
        "character": [{"name": "duke", "active": true}, {"name": "captain", "active": true}],
        "coins": 2,
        "turn": false
      },
      {
        "id": 4,
        "character": [{"name": "duke", "active": true}, {"name": "captain", "active": true}],
        "coins": 2,
        "turn": false
      },
      {
        "id": 5,
        "character":[{"name": "duke", "active": true}, {"name": "captain", "active": true}],
        "coins": 2,
        "turn": false
      },
      {
        "id": 6,
        "character": [{"name": "duke", "active": true}, {"name": "captain", "active": true}],
        "coins": 2,
        "turn": false
      }
    ],
    "characters": [
      {
        "name": "duke",
        "action": "tax",
        "block": "foreignAid",
        "available": 3
      },
      {
        "name": "assassin",
        "action": "assassinate",
        "block": "",
        "available": 3
      },
      {
        "name": "ambassador",
        "action": "exchange",
        "block": "stealing",
        "available": 3
      },
      {
        "name": "captain",
        "action": "steal",
        "block": "stealing",
        "available": 3
      },
      {
        "name": "contessa",
        "action": "",
        "block": "assassination",
        "available": 3
      }
    ]
  };
  
  redis.set(gameid, JSON.stringify(game), "NX");

  redis.get(gameid).then(function (result) {
    console.log("this is the result: " + result); 
    resJSON = JSON.parse(result);
    res.json(resJSON);
  }).catch(function (error) {
    console.log(error);
  });

});

router.post('/setGame', function(req, res) {
  // const gameid = req.params.id;

  const gameId = req.body.gameId;
  console.log("POST! GameId: ", gameId);

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
 
router.put('/', (req, res) => {
  res.send('Received a PUT HTTP method');
});
 
router.delete('/', (req, res) => {
  res.send('Received a DELETE HTTP method');
});

module.exports = router;
