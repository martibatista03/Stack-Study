const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
    username: { type: String, required: true },
    questionTitle: { type: String, required: true },
    questionTitleLowercase: { type: String, required: false },
    question: { type: String, required: true },
    latexOnOff: { type: String, required: false },
    subject: { type: String, required: true },
    keyConcept: { type: String, required: false },
    keyConceptLowercase: { type: String, required: false },
    questionAnswer: { type: Array, required: false },
    questionAnswerUsers: {type: Array, required: false},
    latexOnOffAnswer: { type: Array, required: false }
});

module.exports = mongoose.model('questionSchema', questionSchema);