// Server Router
const express = require('express');
const bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');
var ObjectId = require('mongodb').ObjectId;
const router = express.Router();

// Mail transporter+
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'Your Gmail',
      pass: 'Your generated Gmail App password'
    },
    tls: { rejectUnauthorized: false }
});

// Database model => Register Schema
const registerSchema = require('../models/register');

// Database model => User Authentication Schema
const userAuthentication = require('../models/user_auth');

// Database model => Questions
const questionSchema = require('../models/question');

// Initial route
router.get('/index', async (req, res) => {
    // get some sample questions (by order of oldness)
    questionSchema.find({}, (err, questions) => {
        // questions titles - id
        let questionTitles = [];
        let questionId = [];

        // we just want 10 elements
        if (questions.length < 10) {
            // get the question titles - id
            for (let i = 0; i < questions.length; i++) {
                questionTitles.push(questions[i].questionTitle);
                questionId.push(questions[i]._id);
                var arrowsNeeded = false;
            }

        } else {
            // get the question titles - id
            for (let i = 0; i < 10; i++) {
                questionTitles.push(questions[i].questionTitle);
                questionId.push(questions[i]._id);
                var arrowsNeeded = true;
            }
        }

        // render the main page
        res.render('index', { questionTitle: questionTitles, questionId: questionId, arrowsNeeded: arrowsNeeded });
    });
});

// Login (Inicia sessió)
router.get('/login', async (req, res) => {
    res.render('login', { invalidCredentials : ' ', backgroundColor : 'rgba(255, 255, 255, 0' });
});

// Register (Crea un compte)
router.get('/register', async (req, res) => {
    res.render('register');
});

// Ask question (Fes una nova pregunta)
router.get('/ask_question', async (req, res) => {
    res.render('ask_question');
});

// Answer question (Veure llistat de preguntes)
router.get('/answer_question', async (req, res) => {
    res.render('answer_question');
});

// Resgister POST
router.post('/register/data', async (req, res) => {
    // password encryption
    req.body.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));

    // Parameters to be saved
    const registerForm = new registerSchema(req.body);

    // Preparing the log in authentication
    const userLogIn = new userAuthentication({
        isAuth: true,
        username: req.body.username
    });

    // saving the register values
    await registerForm.save();

    // saving the log in values
    await userLogIn.save();

    res.redirect('/index');
});

// Login POST
router.post('/login/data', async (req, res) => {
    // check if the user exists in the database
    registerSchema.findOne({ mail: req.body.mail, username: req.body.username}, async (err, user) => {
        if (user) {
            // password comparation, if user found
            if (bcrypt.compareSync(req.body.password, user.password) == false) {
                // Invalid credentials message
                res.render('login', { invalidCredentials : "Credencials Invàlides", backgroundColor : "#fd8181a1" });
            } else {
                // Preparing the log in authentication
                const userLoggedIn = new userAuthentication({
                    isAuth: true,
                    username: user.username
                });

                // Checking if the user is already logged in
                userAuthentication.findOne({ username: user.username }, async (err, loggedUser) => {
                    if (loggedUser == null) {
                        await userLoggedIn.save();
                    } 
                });

                // render the main page again
                res.redirect('/index');
            }
        } else {
            // Invalid credentials when user not found
            res.render('login', { invalidCredentials : "Credencials Invàlides", backgroundColor : "#fd8181a1" }); 
        }
    });
});

// ask question POST
router.post('/ask-question', async (req, res) => {
    // to make it easier for the users when they search questions we need to pass both question title and keyConcept to lowercase, in new variables
    let questionTitleLowercase = req.body.questionTitle.toLowerCase();
    let keyConceptLowercase = req.body.keyConcept.toLowerCase();

    // DB model
    const questionRegister = new questionSchema({
        username: req.body.username,
        questionTitle: req.body.questionTitle,
        questionTitleLowercase: questionTitleLowercase,
        question: req.body.question,
        latexOnOff: req.body.latexOnOff,
        subject: req.body.subject,
        keyConcept: req.body.keyConcept,
        keyConceptLowercase: keyConceptLowercase
    });

    // save the model to DB
    await questionRegister.save();

    res.redirect('/index');
});

// search a question POST
router.post('/question', (req, res) => {
    // we pass the searched input to lowercase
    let searchedInput = req.body.questionSearch.toLowerCase();

    // we search the question in the DB
    questionSchema.find({ $or: [{ "questionTitleLowercase": {$regex: `.*${searchedInput}.*` } }, { "keyConceptLowercase": {$regex: `.*${searchedInput}.*` } }  ] }, (err, question) => {
        // we have to get all the matches
        questionsTitlesArray = [];
        questionsIdArray = [];

        // we just want the first ten elements, so we have to check
        if (question.length < 10) {
            for(let i = 0; i < question.length; i++) {
                questionsTitlesArray.push(question[i].questionTitle);
                questionsIdArray.push(question[i]._id);
                var arrowsNeeded = false;
            }

        } else {
            for(let i = 0; i < 10; i++) {
                questionsTitlesArray.push(question[i].questionTitle);
                questionsIdArray.push(question[i]._id);
                var arrowsNeeded = true;
            }
        }

        if (question.length > 0) {
            res.render('choose_question', { questionTitle: questionsTitlesArray, questionId: questionsIdArray, arrowsNeeded: arrowsNeeded });

        } else {
            res.redirect('/index');
        }
    });
});

// see the question 
router.get('/question/:questionId', (req, res) => {
    // Question Id, gotten from the possible choices
    let { questionId } = req.params;

    // we search the specific question and render it
    questionSchema.findOne({ "_id": new ObjectId(questionId) }, (err, question) => {
        res.render('question_model', { username: question.username, questionTitle: question.questionTitle, question: question.question, questionId: questionId, answers: question.questionAnswer, answerUsers: question.questionAnswerUsers, latexOnOffAnswer: question.latexOnOffAnswer, latexOnOff: question.latexOnOff, subject: question.subject, keyConcept: question.keyConcept });
    });
});

// answer question POST
router.post('/answer-question/:questionId/', async (req, res) => {
    // Question Id, so that we can match the answer with the correct question
    let { questionId } = req.params;

    // check if the user has authentication
    userAuthentication.findOne({ username: req.body.username }, (err, checkedUser) => {
        // case where it is not
        if (checkedUser == null) {
            res.redirect('/register');

        } else {
            questionSchema.findOne({ "_id": new ObjectId(questionId) }, (err, question) => {
                // add that if there's not a latexOnOffAnswer value it means that it is off
                if (!req.body.latexOnOffAnswer) {
                    req.body.latexOnOffAnswer = 'off';
                }

                // we get the actual array
                let questionAnswerArray = question.questionAnswer;
                let questionAnswerUserArray = question.questionAnswerUsers;
                let latexOnOffAnswerArray = question.latexOnOffAnswer;


                // send email if this is the first answer
                if (questionAnswerArray.length == 0) {
                    // getting the user email
                    registerSchema.findOne({ "username": question.username }, (err, user) => {
                        console.log(user.mail);
                        var mailOptions = {
                            from: 'stackstudy3@gmail.com',
                            to: user.mail,
                            subject: 'La teva pregunta ha rebut la seva primera resposta!',
                            html: '<!-- Bootstrap --> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" integrity="sha384-JcKb8q3iqJ61gNV9KGb8thSsNjpSL0n8PARn9HuZOnIxN0hoP+VmmDGMN5t9UJ0Z" crossorigin="anonymous"><body style="background-color: #188efc41;"><center><br><br><br><div style="width: 900px; height: 220px; background-color:white; border-radius: 10px; color:black"><div><br><img src="https://i.imgur.com/RjZOMts.jpg" style="width: 170px; vertical-align: middle;" /><span style="font-size: 27px; vertical-align: middle; padding-left: 20px;"> <b> <i> La teva pregunta ha rebut la primera resposta! </i> </b></span></div><p style="text-align: center; font-size: 18px; margin-top: 17px;"> Hola ' + question.username + '!</span> Entra a <a href="https://stack-study.herokuapp.com/question/' + questionId + '">Stack Study</a> i consulta-la.</div></center><br><br><br></body>',                          
                        };
                        
                        transporter.sendMail(mailOptions, function(error, info){
                            if (error) {
                              console.log(error);
                            } else {
                              console.log('Email sent: ' + info.response);
                            }
                            transporter.close();
                        });
                    })
                }

        
                // we add the new answer
                questionAnswerArray.push(req.body.questionAnswer);
                questionAnswerUserArray.push(req.body.username);
                latexOnOffAnswerArray.push(req.body.latexOnOffAnswer);
        
                // We update the array of answers (again, we need to add a function for some reason)
                questionSchema.findOneAndUpdate( {"_id": new ObjectId(questionId) }, { questionAnswer : questionAnswerArray, questionAnswerUsers : questionAnswerUserArray, latexOnOffAnswer: latexOnOffAnswerArray }, () => {});
        
                // redirect to the main page
                res.redirect('/index');
            });
        }
    })
});

// filter question POST
router.post('/filter-question', (req, res) => {
    if (req.body.keyConcept && req.body.subject) {
        questionSchema.find({ "keyConceptLowercase": {$regex: `.*${req.body.keyConcept.toLowerCase()}.*` }, subject: req.body.subject }, (err, questions) => { 
            // questions titles - id
            let questionTitles = [];
            let questionId = [];
    
            // get the question titles - id
            for (let i = 0; i < questions.length; i++) {
                // if we want just questions without answer
                if (req.body.questionWithWithoutAnswer == 'without' && questions[i].questionAnswer.length == 0) {
                    questionTitles.push(questions[i].questionTitle);
                    questionId.push(questions[i]._id);
                
                // if we want all sort of questions
                } else if(req.body.questionWithWithoutAnswer == 'with') {
                    questionTitles.push(questions[i].questionTitle);
                    questionId.push(questions[i]._id);
                }
            }

            var arrowsNeeded = false;
    
            // render the main page
            res.render('index', { questionTitle: questionTitles, questionId: questionId, arrowsNeeded: arrowsNeeded });
        });

    } else if(req.body.subject) {
        questionSchema.find({ subject: req.body.subject }, (err, questions) => {
            // questions titles - id
            let questionTitles = [];
            let questionId = [];

            for (let i = 0; i < questions.length; i++) {
                // if we want just questions without answer
                if (req.body.questionWithWithoutAnswer == 'without' && questions[i].questionAnswer.length == 0) {
                    questionTitles.push(questions[i].questionTitle);
                    questionId.push(questions[i]._id);
                    
                // if we want all sort of questions
                } else if(req.body.questionWithWithoutAnswer == 'with') {
                    questionTitles.push(questions[i].questionTitle);
                    questionId.push(questions[i]._id);
                }
            }

            var arrowsNeeded = false;
    
            // render the main page
            res.render('index', { questionTitle: questionTitles, questionId: questionId, arrowsNeeded: arrowsNeeded });
        });

    } else if (req.body.keyConcept) {
        questionSchema.find({ "keyConceptLowercase": {$regex: `.*${req.body.keyConcept.toLowerCase()}.*` } }, (err, questions) => {
            // questions titles - id
            let questionTitles = [];
            let questionId = [];

            for (let i = 0; i < questions.length; i++) {
                // if we want just questions without answer
                if (req.body.questionWithWithoutAnswer == 'without' && questions[i].questionAnswer.length == 0) {
                    questionTitles.push(questions[i].questionTitle);
                    questionId.push(questions[i]._id);
                    
                // if we want all sort of questions
                } else if(req.body.questionWithWithoutAnswer == 'with') {
                    questionTitles.push(questions[i].questionTitle);
                    questionId.push(questions[i]._id);
                }
            }

            var arrowsNeeded = false;
    
            // render the main page
            res.render('index', { questionTitle: questionTitles, questionId: questionId, arrowsNeeded: arrowsNeeded });
        });
    }
});

// pass page in the choose_question file POST
router.post('/pass-page', (req, res) => {
    // we search the last item of the shown ones
    questionSchema.findOne({ questionTitle: req.body.questionItem }, (err, question) => {
        // we need the ID in first place, so that we can get the next question
        let questionId = question._id;

        // go to the next page
        if (req.body.arrowStatus == 'right') {
            // we get the next questions
            questionSchema.find({ _id: {$gt: questionId} }, (err, nextQuestions) => {
                // new array of question titles
                let nextQuestionTitles = [];
                let nextQuestionId = [];

                // we get the next question titles
                for (let i = 0; i < nextQuestions.length; i++) {
                    nextQuestionTitles.push(nextQuestions[i].questionTitle);
                    nextQuestionId.push(nextQuestions[i]._id);
                }

                // just accept passing the page if there are pages to show
                if (nextQuestionTitles.length != 0) {
                    res.render('choose_question', { questionTitle: nextQuestionTitles, questionId: nextQuestionId, arrowsNeeded: true });

                } else {
                    res.status(204).send()
                }
            }).sort({_id: 1}).limit(10);
        
        // go to the previous pages
        } else {
            // we get the next questions
            questionSchema.find({ _id: {$lt: questionId} }, (err, nextQuestions) => {
                // new array of question titles
                let nextQuestionTitles = [];
                let nextQuestionId = [];

                // we get the next question titles
                for (let i = 0; i < nextQuestions.length; i++) {
                    nextQuestionTitles.push(nextQuestions[i].questionTitle);
                    nextQuestionId.push(nextQuestions[i]._id);
                }

                // we need to revert the order
                nextQuestionTitles.reverse();
                nextQuestionId.reverse();

                // just accept passing the page if there are pages to show
                if (nextQuestionTitles.length != 0) {
                    res.render('choose_question', { questionTitle: nextQuestionTitles, questionId: nextQuestionId, arrowsNeeded: true });

                } else {
                    res.status(204).send()
                }
                
            }).sort({_id: -1}).limit(10);
        }
    });
});



// pass page in the choose_question file POST
router.post('/pass-page-index', (req, res) => {
    // we search the last item of the shown ones
    questionSchema.findOne({ questionTitle: req.body.questionItem }, (err, question) => {
        // we need the ID in first place, so that we can get the next question
        let questionId = question._id;

        // go to the next page
        if (req.body.arrowStatus == 'right') {
            // we get the next questions
            questionSchema.find({ _id: {$gt: questionId} }, (err, nextQuestions) => {
                // new array of question titles
                let nextQuestionTitles = [];
                let nextQuestionId = [];

                // we get the next question titles
                for (let i = 0; i < nextQuestions.length; i++) {
                    nextQuestionTitles.push(nextQuestions[i].questionTitle);
                    nextQuestionId.push(nextQuestions[i]._id);
                }

                // just accept passing the page if there are pages to show
                if (nextQuestionTitles.length != 0) {
                    res.render('index', { questionTitle: nextQuestionTitles, questionId: nextQuestionId, arrowsNeeded: true });

                } else {
                    res.status(204).send()
                }
            }).sort({_id: 1}).limit(10);
        
        // go to the previous pages
        } else {
            // we get the next questions
            questionSchema.find({ _id: {$lt: questionId} }, (err, nextQuestions) => {
                // new array of question titles
                let nextQuestionTitles = [];
                let nextQuestionId = [];

                // we get the next question titles
                for (let i = 0; i < nextQuestions.length; i++) {
                    nextQuestionTitles.push(nextQuestions[i].questionTitle);
                    nextQuestionId.push(nextQuestions[i]._id);
                }

                // we need to revert the order
                nextQuestionTitles.reverse();
                nextQuestionId.reverse();

                // just accept passing the page if there are pages to show
                if (nextQuestionTitles.length != 0) {
                    res.render('index', { questionTitle: nextQuestionTitles, questionId: nextQuestionId, arrowsNeeded: true });

                } else {
                    res.status(204).send()
                }
                
            }).sort({_id: -1}).limit(10);
        }
    });
});

// Exporing this document to the main one
module.exports = router;
