var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/game/:id', function(req, res, next) {
  const gameid = req.params.id;
  res.json({gameid});
  // res.send('Received a GET HTTP method for game');
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
