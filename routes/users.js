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
    res.sendStatus(res.user)
})

// create user
router.post("/signup", async (req, res) => {  
    //check username and email are available
    console.log("Checking email and Username")
    const UnameCheck = await User.findOne({UserName:req.body.UserName})
    const EmailCheck = await User.findOne({Email:req.body.Email})

    if(EmailCheck == null && UnameCheck == null)
    {
        console.log("Creating User")
        let password = req.body.Password
        
        let user = req.body
        user.Token = await newToken()
        
        
        user.LastSignIn = Date.now()
        user.LastRequest = Date.now()
        bcrypt.genSalt(10, function(err,salt){
            bcrypt.hash(password, salt, async function(err, hash) {
                user.Password = hash
                
                newUser = new User(user)
                console.log(newUser)
                try {
                    
                    const SavedUser = await newUser.save()
                    console.log("User Created")
                    res.status(201).json(SavedUser)
                } catch (err) {
                    console.log(err)
                    res.status(400).json({message: err.message})
                }
            })
        })
    }
    else if (EmailCheck != null & UnameCheck == null){
        console.log("Creation Failed ")
        res.status(400).json({message: "Email already exists", state: false})
    }
    else if (UnameCheck != null & EmailCheck == null){
        console.log("Creation Failed ")
        res.status(400).json({message: "Username already exists", state: false})
    }
    else {
        console.log("Creation Failed ")
        res.status(400).json({message: "Username and email already exist", state: false})
    }

})

// login
router.post("/signin", async (req, res) => {

    console.log("Finding user...")
    const UnameCheck = await User.findOne({UserName:req.body.UorE})
    const EmailCheck = await User.findOne({Email:req.body.UorE})
   
    if (UnameCheck == null && EmailCheck == null)
    {
        console.log("No user")
        res.status(404).json({message: "no user"})
    } else if (UnameCheck != null ) {
        const input = req.body.Password
        let match = await bcrypt.compare(input, UnameCheck.Password)
        if (match)
        {
            UnameCheck.Token = newToken()
            UnameCheck.LastSignIn = Date.now()
            UnameCheck.LastRequest = Date.now()

            console.log("logged in")
            await UnameCheck.save()
            return res.status(200).json({message: "signed in", state: true})
        } else {
            res.status(400).json({mesasge: "Incorrect password", state: false})
        }
    } else {
        const input = req.body.Password
        let match = await bcrypt.compare(input, EmailCheck.Password)
        if (match)
        {
            EmailCheck.Token = newToken() 
            EmailCheck.LastSignIn = Date.now()
            EmailCheck.LastRequest = Date.now()

            console.log("logged in")
            await EmailCheck.save()
            return res.status(200).json({message: "signed in", state: true})
        } else {
            res.status(400).json({mesasge: "Incorrect password", state: false})
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
    if (req.body.Token !=null){
        res.user.Token = newToken()
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

// Functions
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

async function newToken(){
    let currentdate = String(Date.now())
    return new Promise((resolve)=>{
        bcrypt.genSalt(10, async function(err,salt){
            bcrypt.hash(currentdate, salt, async function(err, hash) {
                resolve(hash)
            })
        })
    })
}

async function checkToken(token){
    let found = User.findOne({Token: token})
    if (found != null){
        return true
    } else {
        return false
    }
}

function TimeOutSinIn(token){
    if(user.LastSignIn + 14400000 >= Date.now()){
        signoutUser(user)
    }
}

function TimeOutRequest(user){
    if(user.LastRequest + 600000 >= Date.now()){
        signoutUser(user)
    }
}

async function signoutUser(user){
    user.Token = await newToken()
    await user.save()
}
module.exports = router