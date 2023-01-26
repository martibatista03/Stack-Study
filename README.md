# Stack-Study
Stack Study is a web application where students from all areas can ask questions about any of their fields, and even  give an answer to other's people questions, if they have enough knowledge to do so. Stack Study is a Progressive Web Application (PWA) that can be found through the following link [https://stack-study.onrender.com/](https://stack-study.onrender.com/) or scanning this QR code:

<div align="center">
  <img width="200" src="https://user-images.githubusercontent.com/71564709/214890915-ba13a8ed-efad-4bdc-ab2d-4f1cadd1ff85.png"/>
</div>

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
4. Create a ```.env``` file in the root directory and fill it with the following data: \
    <br/>
    &nbsp;&nbsp; ```PUBLIC_VAPID_KEY = "Your generated public key"``` \
    &nbsp;&nbsp; ```PRIVATE_VAPID_KEY = "Your generated private key"``` \
    &nbsp;&nbsp; ```EMAIL = "Your email"``` \
    &nbsp;&nbsp; ```mongodb_URI = "Your Mongo DB Atlas URI" (you can also use your local DB with 'mongodb://localhost/StackStudy')``` \
    <br/>
If you don't currently have the first two parameters I suggest you checking the following repository: [https://github.com/saurabhdaware/pwainit-node-pushapi](https://github.com/saurabhdaware/pwainit-node-pushapi).
5. (Optional) If you want to use the authomatic email sender (used to notify a user that his/her question has been answered) you have to access to ```routes/index.js``` and modify the ```transporter``` variable, giving a Gmail account (the one that will send the emails) and a [Gmail App Password](https://support.google.com/accounts/answer/185833?hl=en).
6. Access to ```public/index.html``` and modify the ```publicVapidKey``` constant (line 41), giving the value generated in pass 4.
7. Execute ```npm start``` or ```npm run dev```(if you want to use the [nodemon](https://www.npmjs.com/package/nodemon) dependency) and access the app through any navigator following this URL: [http://localhost:3000/](http://localhost:3000/).

## Usage
If you want to try out a user's experience in your cloned app, you can follow the next steps:

1. Create an account in the register page, introducing a ```username```, a ```password``` and your ```email```.
2. Ask a new question by pressing the <i> Fes una nova pregunta </i> in the main page. It will redirect you to a page where you can give your question a title, a body (where you can expand the information), a scope of study and a key concept (used both of them for the internal search engine). You also have the option of using the <img src="https://latex.codecogs.com/gif.latex?\LaTeX" /> software system (more information [here](https://www.latex-project.org/)), if you need to insert mathematical expressions.
3. You can try to give youserlf an answer, accessing to your question page by searching it in the beginning of the main page (you can search your question title or even your key concept) or by filtering it in the bottom part of the main page. Once you are in, you can see the full question, other answers given (this part will obviously be empty right now) and a textarea where you can write your personal answer (where you can use <img src="https://latex.codecogs.com/gif.latex?\LaTeX" /> too).
4. Once you have published your answer, if you access again to your question page, you will see the original question you asked and the answer you have just given. 
<br/>
<div align="center">
  <img width="230" src="https://i.imgur.com/D7nom3J.png"/>
</div>

## Author
Copyright © 2021 Martí Batista Obiols \
You can contact the author of this project via the following email address: [martibatista03@gmail.com](mailto:martibatista03@gmail.com).

