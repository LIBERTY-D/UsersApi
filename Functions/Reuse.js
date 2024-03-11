
module.exports = class Reuse{

    static sendResource(status,data,message){
    
      if(status==200){
        return {
            staus:"ok",
            message,
            length:data.length,
            data:data
        }
      }
      if(status==400){
        return {
            staus:"ok",
            message,
            length:data.length,
            data:data
        }
      }
    
    }
   

    static  handleErrors(callback) {
        return async function(req, res, next) {
          try {
            await callback(req, res, next);
          } catch (error) {
            // adds this to the clobal error
            next(error)
          }
         
        };
      }
// get the class statically
      static get getCustomError(){
       return class  CustomError extends Error {
          constructor(message,errName,errCode) {
            super(message);
            this.errName =  errName
            this.errCode =  errCode
            this.name = this.constructor.name;
            this.message = message;

            Error.captureStackTrace(this, this.constructor);
          }
        }
      }
      
      
}