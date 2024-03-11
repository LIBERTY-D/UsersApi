
require("express");
const Constants = require("./Constants");


module.exports = function globalErrorHandler(err, req,res,next){
    const code = err.errCode||500
    
    console.log(err.name)
    const status = JSON.stringify(err.errCode)||JSON.stringify(500)

    const message =  status.startsWith("2")?"ok":status.startsWith("4")?"fail":"server error"
    if(err.errName === "InavlidImage"){
        return res.status(400).json({
            status:"403",
            message:"fail",
            error:err.message,
    
        });
    }
    if(err.name ==Constants.JsonWebTokenError){//when user provide a wrong token
        return res.status(403).json({
            status:"403",
            message:"fail",
            error:"Invalid token",
    
        });
    }
   if(err.name==Constants.TokenExpiredError){
    return res.status(403).json({
        status:"403",
        message,
        error:"Your token has expired",

    });
   }
    if(err.name==Constants.ValidationError){
     // Regular expression to match substrings starting with '[%' and ending with '%]'
     const regex = /\[%([^%]+)%\]/;
      const replacedStr = err.message.match(regex)
        return res.status(400).json({
            status:"400",
            message,
            error:replacedStr[1],
    
        });
    }
    if(err.name==Constants.MongoServerError){
        if(err.code==11000){
          for ([key,value] of Object.entries( err.keyPattern)){
             if(key=="email"){
                return res.status(400).json({
                    status:"400",
                    message,
                    error:"Email Already Exist,If this Yours login",
            
                });
                

             }
          }
        }
        
    }
    
    else{

        return res.status(code).json({
            status,
            message,
            error:err.message,
    
        });
    }
   
}