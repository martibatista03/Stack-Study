const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const registerSchema = new Schema({
    username: { type: String, required: true },
    mail: { type: String, required: true },
    password: { type: String, required: true },
    studyScope: { type: String, required: false },
    speciality: { type: String, required: false },
    description: { type: String, required: false },
    upvotes: { type: Number, default: 0, required: false },
    upvotedAnswers: { type: Array, required: false }
});

module.exports = mongoose.model('registerForm', registerSchema);
