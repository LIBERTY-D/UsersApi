const express =  require("express")
const UserController = require("../Controllers/UserController")
const filterInputs =require("../Middlewares/filterInputs")
const authorization =  require("../Middlewares/Authorization")
const upload = require("../Middlewares/multer")
const router =  express.Router()


//GET ALL USERS
router.get("/users",authorization,UserController.getUsers)

// GET SINGLE USER

router.get("/users/:id",authorization,UserController.getUser)

//createrUser route
router.post("/users",filterInputs,UserController.postUser)

//login user
router.post("/users/login",UserController.loginUser)

//update user
router.patch("/users",filterInputs,authorization,upload.single("profileImage"),UserController.updateUser)


// delete user 
router.delete("/users/:id",authorization,UserController.deleteUser)








module.exports =  router