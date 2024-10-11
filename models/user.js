const mongoose = require("mongoose")


const UserSchema = new mongoose.Schema({
    UserName:{
        type: String,
        required: true
    },
    Email:{
        type: String,
        required: true
    },
    Password:{
        type: String,
        required: true
    },
    Token:{
        type: String,
        required: true
    },
    LastSignIn:{
        type: Number,
        required: true
    },
    LastRequest:{
        type: Number,
        required: true
    }
})

module.exports = mongoose.model("user", UserSchema)