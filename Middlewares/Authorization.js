const functions =  require("../Functions/Reuse")
const JWT = require("../JWT/JWT")
const { userModel } = require("../Models/ClassModel")
module.exports =  functions.handleErrors(async (req,res,next)=>{
    let header =  req.headers
    let token = ""
    // check if theres authorization header
    if(!header.authorization&&!req.cookies.jwt){
        throw new functions.getCustomError("authorization is required","Invalid",400)
    }else{
         //using althorizattio  token
         if(header.authorization && header.authorization.startsWith("Bearer")){
            token = header.authorization.split(" ")[1]// get the authorization token 
    
         }
         if(req.cookies.jwt){
            token =  req.cookies.jwt
         }


    // check if token is valid
    let decoded =  JWT.verifyJwt(token,next)

    if(decoded !=null){   //check if the token hasn't expired yet
        const expirationTime = new Date(decoded.exp * 1000).getTime()
        const currentTime =  Date.now()
        if(currentTime>=expirationTime){
            throw new functions.getCustomError("Token expired",null,403)
        }
            // else get user
            let user =  await userModel.findById({_id:decoded.userId}).
            select('+locations +userLocation +password')
            req.user =  user
    }

    }
   
  
    next()

})

