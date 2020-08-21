var express = require('express');
var router = express.Router();
const Redis = require("ioredis");
const redis = new Redis();

/* GET home page. */
router.get('/game/:id', function(req, res, next) {
  const gameid = req.params.id;
  console.log("grabbed from request parameter: " + gameid);

  const game = {
    "gameId": "gameid",
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

router.post('/game/:id', function(req, res) {
  res.send('Received a POST HTTP method');
});
 
router.put('/', (req, res) => {
  res.send('Received a PUT HTTP method');
});
 
router.delete('/', (req, res) => {
  res.send('Received a DELETE HTTP method');
});

module.exports = router;
