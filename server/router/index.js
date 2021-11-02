const express = require('express');

const router = express.Router();

router.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next()
});

router.get('/', (req, res) => {
  res.send('Server is up and running');
})

module.exports = router;