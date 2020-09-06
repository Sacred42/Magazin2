var express = require('express');
var router = express.Router();
var Product = require('../models/product');
var csrf = require('csurf');
var passport = require('passport');

var csrfProtection = csrf();
router.use(csrfProtection);

/* GET home page. */
router.get('/' , async (req, res)=>{
  const products = await Product.find({}).lean();
  res.render('shop/index' , {products : products});
});

router.get('/user/signup', function (req, res, next) {
  var messages = req.flash('error');
  res.render('user/signup', {csrfToken: req.csrfToken() ,messages: messages, hasErrors: messages.length > 0 });
});

router.post('/user/signup', passport.authenticate('local.signup', {
  successRedirect: '/user/profile',
  failureRedirect: '/user/signup',
  failureFlash: true
}));

router.get('/user/profile', function (req, res, next) {
  res.render('user/profile');
});

router.get('/user/signin', (req, res)=>{
  var messages = req.flash('error');
  res.render('user/signin' , {csrfToken : req.csrfToken(), messages : messages , hasErrors : messages.length > 0})
});

router.post('/user/signin', passport.authenticate('local.signin', {
  successRedirect : '/user/profile',
  failureRedirect : '/user/signin',
  failureFlash : true
}));


module.exports = router;