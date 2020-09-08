var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');

var csrfProtection = csrf();
router.use(csrfProtection);

router.get('/profile', isLoggedIn,  function (req, res, next) {
    res.render('user/profile');
  });

router.use('/', notLoggedIn , function(req, res , next){ // применение notLoggedIn ко всем маршрутам , кроме тех , где указана другая функц-ия
    next();
})

router.get('/signup', function (req, res, next) {
    var messages = req.flash('error');
    res.render('user/signup', {csrfToken: req.csrfToken() ,messages: messages, hasErrors: messages.length > 0 });
  });
  
  router.post('/signup', passport.authenticate('local.signup', {
    successRedirect: '/user/profile',
    failureRedirect: '/user/signup',
    failureFlash: true
  }));
  
  router.get('/signin', (req, res, next)=>{
    var messages = req.flash('error');
    res.render('user/signin' , {csrfToken : req.csrfToken(), messages : messages , hasErrors : messages.length > 0})
  });
  
  router.post('/signin', passport.authenticate('local.signin', {
    successRedirect : '/user/profile',
    failureRedirect : '/user/signin',
    failureFlash : true
  }));

  router.get('/logout', function(req, res, next){
      req.logout();
      res.redirect('/');
  });

  
  
  function isLoggedIn(req , res , next){ // функция , где только доступен авторизированый пользователь! 
      if(req.isAuthenticated()){         // работает тогда , когда написан код выше(маршрут с logout)
         return next();
      }
      res.redirect('/');
  }

  function notLoggedIn(req , res, next){
    if(!req.isAuthenticated()){        
        return next();
     }
     res.redirect('/');
 }

 

  
  module.exports = router;