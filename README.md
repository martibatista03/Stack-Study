# Stack-Study
Stack Study is a web application where students from all areas can ask questions about any of their fields, and even  give an answer to other's people questions, if they have enough knowledge to do so. Stack Study is a Progressive Web Application (PWA) that can be found through the following link [https://stack-study.herokuapp.com](https://stack-study.herokuapp.com) or scanning this QR code:

<div align="center">
  <img width="160" src="https://i.imgur.com/lRGKzNL.png"/>
</div>

It can also be found in the Google Play Store: [https://play.google.com/store/apps/details?id=com.herokuapp.stack_study.twa](https://play.google.com/store/apps/details?id=com.herokuapp.stack_study.twa).

## Technologies used
Stack Study has been developed using the following technologies:

* [Node.js](https://nodejs.org/en/) - version 12.16.2
* [Express](https://expressjs.com/) - version 4.17.1
* [Socket.io](https://socket.io/) - version 3.0.4
* [EJS](https://ejs.co/) - version 3.1.5
* [Mongo DB](https://www.mongodb.com/2) - version 4.4.0

## Installation
1. Clone this repository through [Git](https://git-scm.com/) or downloading the Zip file.
2. Install [Node.js](https://nodejs.org/en/) and [Mongo DB](https://www.mongodb.com/2).
3. Access the new file and execute ```npm install```.
4. Create a ```.env``` file in the root directory and fill it with the following data:
    <br/>
    PUBLIC_VAPID_KEY = "Your generated public key" \
    PRIVATE_VAPID_KEY = "Your generated private key" \
    EMAIL = "Your email" \
    mongodb_URI = "Your Mongo DB Atlas URI (you can also use your local DB with ```'mongodb://localhost/StackStudy'``` \
    <br/>
If you don't currently have the first two parameters I suggest you checking the following repository: [https://github.com/saurabhdaware/pwainit-node-pushapi](https://github.com/saurabhdaware/pwainit-node-pushapi).
5. (Optional) If you want to use the authomatic email sender (used to notify a user that his/her question has been answered) you have to access to ```routes/index.js``` and modify the ```transporter``` variable, giving a Gmail account (the one that will send the emails) and a [Gmail App Password](https://support.google.com/accounts/answer/185833?hl=en).
6. Access to ```public/index.html``` and modify the ```publicVapidKey``` constant (line 41), giving the value generated in pass 4.
7. Execute ```npm srtart``` or ```npm run dev```(if you want to use the [nodemon](https://www.npmjs.com/package/nodemon) dependency) and access the app through any navigator following this URL: [http://localhost:3000/](http://localhost:3000/).
