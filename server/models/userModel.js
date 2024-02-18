const mongoose = require('mongoose')


const userSchema = mongoose.Schema({
    username: {
        type: "string",
        reqired: true
    },
    email: {
        type: "string",
        reqired: true
    },
    password: {
        type: "string",
        reqired: true
    },
    
})

module.exports = mongoose.model("usrModel", userSchema)
