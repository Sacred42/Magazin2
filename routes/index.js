var express = require('express');
var router = express.Router();
var Product = require('../models/product');
var Cart = require('../models/cart');
const cart = require('../models/cart');
var Order = require('../models/order');

/* GET home page. */
router.get('/' , async (req, res)=>{
  var successMsg = req.flash('success')[0];
  const products = await Product.find({}).lean();
  res.render('shop/index' , {products : products , successMsg : successMsg , noMessages : !successMsg});
});

router.get('/add-to-cart/:id' , (req ,res , next)=>{
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  
  Product.findById(productId , function(err, product) {
    if (err){
      return res.redirect('/');
    }
    cart.add(product, product.id);
    req.session.cart = cart;
    console.log(req.session.cart);
    res.redirect('/');

  })
});
router.get('/reduce/:id', function(req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.reduceByOne(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/remove/:id', function(req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.removeItem(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/shopping-cart' , (req, res, next)=>{
  if(!req.session.cart){
    return res.render('shop/shopping-cart', {products: null});
  }
   var cart = new Cart(req.session.cart);
   res.render('shop/shopping-cart', {products : cart.generateArray(), totalPrice : cart.totalprice});
});

router.get('/checkouts' ,isLoggedIn ,  (req, res, next)=>{
  if(!req.session.cart){
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);
  var errMsg = req.flash('error')[0];
  res.render('shop/checkouts' , {total : cart.totalprice , errMsg : errMsg, noError : !errMsg});
});

router.post('/checkouts', function(req, res, next){
 if(!req.session.cart){
  //  var error = req.flash('error')
   return res.render('shop/shopping-cart');
 }
 var cart = new Cart(req.session.cart);
 const stripe = require('stripe')('sk_test_51HP3AGKIW5JeEp10AhIYB8X3YPTK2w30n1buZhQj3RWbLc4iXVfI4xqlkIG3sdx6kq1CVnfAEC3mluFUcuhF8H6N00CrUcaSXX');
 var doneNumb = Math.round(cart.totalprice * 100)
// `source` is obtained with Stripe.js; see https://stripe.com/docs/payments/accept-a-payment-charges#web-create-token
 stripe.charges.create({ // - вещь , благодаря которой проходит оплата ! путем создания объекта charge!
  amount: doneNumb ,
  currency: 'usd',
  source: req.body.stripeToken,
  description: 'My First Test Charge ',
}, function(err, charge){
  if(err){
    req.flash('error', err.message);
    return res.redirect('/checkouts');
    
  }
  var order = new Order({
    user: req.user,
    cart: cart,
    address: req.body.address,
    name: req.body.name,
    paymentId: charge.id
  });
  order.save(function(err, result) {
    req.flash('success', 'Successfully bought product!');
    req.session.cart = null;
    res.redirect('/');
    });
  }); 
});

module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
      return next();
  }
  req.session.oldUrl = req.url;
  res.redirect('/user/signin');
  
}