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

// Database models
const registerSchema = require('./models/register');
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
    // check user's initial authentication
    socket.on('initial-user-authentication', (data) => {
        userAuthentication.findOne({ userId: data.userId }, (err, checkedUser) => {
            if (checkedUser) {
                socket.emit('initial-navbar', {
                    firstButton: {
                        title: data.username,
                        href: `/profile/${data.userId}`
                    },

                    secondButton: {
                        title: 'Tanca sessió',
                        href: '/',
                        onclick: 'logOut()'
                    }
                });

            }
        });
    })

    // user logOut
    socket.on('user-log-out', (userId) => {
        // for some reason I have to put a function to make it work
        userAuthentication.findOne({ userId: userId }).remove().exec();
    });

    // check if the user has authentication to ask a question
    socket.on('user-check-auth', (data) => {
        // check if the user is registered in the DB
        userAuthentication.findOne({ userId: data.userId }, (err, checkedUser) => {
            // it is not
            if (checkedUser == null) {
                socket.emit('question-redirection', '/register');
            
            // it is
            } else {
                socket.emit('question-redirection', '/ask_question');
            }
        });
    });

    // upvote button
    socket.on('update-upvote', (data) => {
        registerSchema.findOne({ username: data.answeringUser }, async (err, answeringUser) => {
            // prevent from frontend hacking
            if (data.user) {
                // Add Upvote
                if (data.operation == 'add') {
                    answeringUser.upvotes = answeringUser.upvotes + 1;
                    await answeringUser.save();
                
                // subtract Upvote
                } else if (data.operation == 'subtract') {
                    answeringUser.upvotes = answeringUser.upvotes - 1;
                    await answeringUser.save();
                }
            }
        });

        // we also want to register which answers has upvoted the user, so that we can keep track of the global upvotes, preventing people from 
        // giving more than one upvote to the same answer
        registerSchema.findOne({ username: data.user }, async (err, user) => {
            var flag = false;

            // prevent breaking because of frontend hacking
            if (user) {
                for (let i = 0; i < user.upvotedAnswers.length; i++) {
                    // case where the user hasn't upvoted any other question of that page
                    if (user.upvotedAnswers[i][0] == data.questionId) {
                        if (data.operation == 'add') {
                            // we add the position of the upvoted question
                            user.upvotedAnswers[i].push(data.answerPosition);
    
                        } else if (data.operation == 'subtract') {
                            let position = user.upvotedAnswers[i].indexOf(data.answerPosition);
                            user.upvotedAnswers[i].splice(position, 1);
                        }
    
                        // we don't want to execute the following code (after the for loop)
                        flag = true;
    
                        // we need this if we want to modify an array of a db model
                        user.markModified('upvotedAnswers');
    
                        // we save the modifications and end the loop
                        await user.save();
                        break;
                    }
                }
                
                // case where the user has not upvoted any other question of that page
                if (flag == false) {
                    user.upvotedAnswers.push([data.questionId, data.answerPosition]);
                    await user.save();
                }
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
