const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userAuthentication = new Schema({
    isAuth: { type: String, required: true },
    username: { type: String, required: true }
});

module.exports = mongoose.model('userAuthentication', userAuthentication);