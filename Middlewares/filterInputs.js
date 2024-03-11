
module.exports = function filterInputs(req,res,next){

    
    if(req.body.isAdmin){
        delete req.body.isAdmin
    }
   next()
}