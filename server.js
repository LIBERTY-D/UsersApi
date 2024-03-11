 require("dotenv").config()

const express =  require("express")
const Constants = require("./Constants")
const user_router =  require("./Routers/router_user")
const path =  require("path")

const app =  express()
const start =  require("./db_connection")
const functions = require("./Functions/Reuse")
const globalErrorHandler = require("./globalErrorHandler")
const cookieParser = require('cookie-parser');
app.use(cookieParser())
//formdata
app.use(express.json({limit:"10mb"}))
//serve images

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
//user router
app.use("/api/v1",user_router)




//handles other routes not defined
app.all("*",(req,res,next)=>{
  const error =  new functions.getCustomError(`invalid ${ req.originalUrl}`,"InvalidUrl",404)

   next(error)

})

//handles all errors
app.use(globalErrorHandler)

const port =  process.env.PORT||Constants.PORT
app.listen(port,()=>{
console.log(`Server Listening on port: ${port}`)
   start()
})





