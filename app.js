var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const cors = require('cors');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var productsRouter = require('./routes/products');
var searchRouter = require('./routes/search');
var reviewsRouter = require('./routes/reviews');
var chatsRouter = require('./routes/chats');
var orderRouter = require('./routes/orders');
var notifications = require('./routes/notifications');
var recommendation = require('./routes/recommendation');
var analytics = require('./routes/analytics');
var cart = require('./routes/cart');
const stripe = require('stripe')('sk_test_51NkkxsJ4k2mWY9E8FTqUbLfPQep9klRbNyXkTlm82lzEaC5a14bex4i3qLfXoo8kvA0fkfxkJdZ63474RaVagqF400eLhKwqtq');
var app = express();

// view engine setup


app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
mongoose.connect('mongodb://localhost:27017/decoar', {
  useNewUrlParser: true,
});
app.post('/create-payment-intent', paymentIntent);
app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/products', productsRouter);
app.use('/search', searchRouter);
app.use('/reviews', reviewsRouter);
app.use('/chats', chatsRouter);
app.use('/orders', orderRouter);
app.use('/notifications', notifications);
app.use('/recommendation', recommendation);
app.use('/cart', cart);
app.use('/analytics', analytics);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

async function paymentIntent (req,res){ 
  try {
    const { amount, currency } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
    });
    console.log(paymentIntent)
    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Error creating payment intent:', err.message);
    res.status(500).json({ error: err.message });
  }
}

module.exports = app;
