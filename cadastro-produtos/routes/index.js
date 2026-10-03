var express = require('express');
var router = express.Router();

/* GET home page. Leva direto para a lista de produtos. */
router.get('/', function(req, res, next) {
  res.redirect('/produtos');
});

module.exports = router;
