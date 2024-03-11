const jwt =  require("jsonwebtoken")
module.exports = class JWT{
    /**
 * send a jwt token to user
 * @param {*} user 
 * @returns 
 */
   static sendJwt = (user) =>{
    return  jwt.sign({userId:user._id},process.env.JWT_PRIVATE,{
        expiresIn:process.env.JWT_EXPIRE
      })
   }

   static verifyJwt(token,next){
    return jwt.verify(token, process.env.JWT_PRIVATE, function(err, decoded) {
        if(!err){
            return decoded
        }else{
            next(err)
        }
      });
   }
}