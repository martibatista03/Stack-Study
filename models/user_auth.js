const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userAuthentication = new Schema({
    username: { type: String, required: true },
    userId: { type: String, required: true }
});

module.exports = mongoose.model('userAuthentication', userAuthentication);
