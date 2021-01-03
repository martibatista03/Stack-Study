require('dotenv').config()
const webpush = require('web-push');
const express = require('express');
const app = express();
const path = require('path');
const morgan = require('morgan');
const mongoose = require('mongoose');
app.use(require('body-parser').json());

// Importing routes
const indexRoutes = require('./routes/index');

// Database model => User Authentication Schema
const userAuthentication = require('./models/user_auth');

// Connecting to database
mongoose.connect(process.env.mongodb_URI) 
    .then(db => console.log('DB connected'))       
    .catch(err => console.log(err))                
                                                   

// settings
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.static(__dirname + '/public'));

// routes
app.use('/', indexRoutes);

// start server
const server = app.listen(app.get('port'), () => {
    console.log(`Server on port ${app.get('port')}`);
});

// Websocket configuration
const SocketIO = require('socket.io');
const io = SocketIO(server);

// websockets things
io.on('connection', (socket) => {
    // user logOut
    socket.on('user-log-out', (username) => {
        // for some reason I have to put a function to make it work
        userAuthentication.deleteOne({ username: username }, () => {});
    });

    // check if the user has authentication to ask a question
    socket.on('user-check-auth', (username) => {
        // check if the user is registered in the DB
        userAuthentication.findOne({ username: username }, (err, checkedUser) => {
            // it is not
            if (checkedUser == null) {
                socket.emit('question-redirection', '/register');
            
            // it is
            } else {
                socket.emit('question-redirection', '/ask_question');
            }
        });
    });
});

// TO generate vapid keys type './node_modules/.bin/web-push generate-vapid-keys' after 'npm install'
const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

// Replace with your email
webpush.setVapidDetails('mailto:'+process.env.EMAIL, publicVapidKey, privateVapidKey);

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.post('/subscribe', (req, res) => {
    const subscription = req.body; // You should be storing this in database so that you can send notifications later

    const payload = JSON.stringify({
        title: 'Title Comming from backend!', 
        body: "Body coming from backend!!"
    });

    webpush.sendNotification(subscription, payload)
        .then(() => {
            res.json({success:true})
        })
        .catch(error => {
            console.error(error.stack);
        });
});
