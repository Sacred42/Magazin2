var express = require('express');
var router = express.Router();
var Product = require('../models/product');
var Cart = require('../models/cart');

/* GET home page. */
router.get('/' , async (req, res)=>{
  const products = await Product.find({}).lean();
  res.render('shop/index' , {products : products});
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

router.get('/shopping-cart' , (req, res, next)=>{
  if(!req.session.cart){
    return res.render('shop/shopping-cart', {products: null});
  }
   var cart = new Cart(req.session.cart);
   res.render('shop/shopping-cart', {products : cart.generateArray(), totalPrice : cart.totalprice});
});

router.get('/checkouts' , (req, res, next)=>{
  if(!req.session.cart){
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);
  res.render('shop/checkouts' , {total : cart.totalprice});
})



module.exports = router;