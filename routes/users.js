const express = require("express")
const router = express.Router()
const User = require("../models/user")

const bcrypt = require('bcrypt');

// get all users
router.get("/", async (req, res) => {
    console.log("Getting all users")
    try {
        const users = await User.find()
        res.json({"Users":users, "Date": Date.now()})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

// get individual user
router.get("/:id", findUser, (req, res) => {
    console.log("user found")
    res.send(res.user)
})

// create user
router.post("/", async (req, res) => {  
    //check username and email are available
    const UnameCheck = await User.findOne({UserName:req.body.UserName})
    const EmailCheck = await User.findOne({Email:req.body.Email})

    if(EmailCheck == null && UnameCheck == null)
    {
        let password = req.body.Password
        
        let user = req.body
        
        bcrypt.genSalt(10, function(err,salt){
            bcrypt.hash(password, salt, async function(err, hash) {
                user.Password = hash
                newUser = new User(user)

                try {
                    const SavedUser = await newUser.save()
                    res.status(201).json(SavedUser)
                } catch (err) {
                    res.status(400).json({message: err.message})
                }
            })
        })
    }
    else if (EmailCheck != null & UnameCheck == null){
        res.status(400).json({message: "Email already exists", status: false})
    }
    else if (UnameCheck != null & EmailCheck == null){
        res.status(400).json({message: "Username already exists", status: false})
    }
    else {
        res.status(400).json({message: "Username and email already exist", status: false})
    }

})

// login
router.post("/signin", async (req, res) => {
    const UnameCheck = await User.findOne({UserName:req.body.UorE})
    const EmailCheck = await User.findOne({Email:req.body.UorE})
    
    if (UnameCheck == null && EmailCheck == null)
    {
        res.send(404).json({message: "No user found"})
    } else if (UnameCheck != null ) {
        const input = req.body.Password
        let match = await bcrypt.compare(input, UnameCheck.Password)
        if (match)
        {
            return res.status(200).json({message: "signed in", status: true})
        } else {
            res.status(400).json({mesasge: "Incorrect password", status: false})
        }
    } else {
        const input = req.body.Password
        let match = await bcrypt.compare(input, EmailCheck.Password)
        if (match)
        {
            return res.status(200).json({message: "signed in", status: true})
        } else {
            res.status(400).json({mesasge: "Incorrect password", status: false})
        }
    }
})

// update user
router.patch("/:id", findUser, async (req, res) => {
    console.log("updating User ...")
    
    if (req.body.UserName != null){
        res.user.UserName = req.body.UserName
    }
    if (req.body.Password != null){
        res.user.Password = req.body.Password
    }
    if (req.body.Email != null){
        res.user.Email = req.body.Email
    }
    try {
        const uptatedUser = await res.user.save()
        console.log("user updated")
        res.status(200).json(uptatedUser)
    } catch (err) {
        console.log("User update failed")
        res.status(400).json({mesasge: err})
    }
})

// delete user
router.delete("/:id", findUser, async (req, res) => {
    console.log("deleting user ...")
    try {
        await (res.user).deleteOne()
    } catch (err) {
        console.log("deletion failed")
        return res.status(500).json({message: err})
    }
    res.status(200).json({message:"deleted"})
    console.log("deleted")
})

async function findUser(req, res, next){
    console.log("Finding user...")
    try {
        userToFind = await User.findById(req.params.id)
        if (userToFind == null){
            return res.status(404).json({message: "No user found."})
        }
    } catch (err) {
        console.log(`ERROR: ${err}`)
        return res.status(500).json({message: err.message})
    }
    
    res.user = userToFind
    next()
}

module.exports = router