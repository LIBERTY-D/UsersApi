const mongoose = require("mongoose")
const {locationSchema} = require("./user_location_schema")
const bcrypt =  require("bcrypt")


const userSchema = new  mongoose.Schema({
    username:{
        type:String,
        required:true,
        
    },
    email:{
        type:String,
        unique:true,
        required:true,
        lowercase:true,
    },
    isAdmin:{
        type:Boolean,
        default:false,
    

    },

    password:{
        required:true,
        type:String,
        select:false,
        validate:{
            validator:function(password){
                // runs only if password is greater than or equal 6
                return password.length>=6
            },
            message:"[%PASSWORD MUST BE ATLEAST 6 CHARACTERS LONG%]"
        }

    },
    confirmPassword:{
        required:true,
        type:String,
        validate:{
            validator:function(value){
                // runs only if password matches
                return this.password && value === this.password;
            },
            message:"[%PASSWORDS DO NOT MATCH%]"
        }

    },
    isActive:{
      type:Boolean,
      default:true
     
    },
 
    userLocation:{
        select:false,
          type:[{
            lat: {
              type: Number,
              required: false
            },
            long: {
              type: Number,
              required: false
            }
          }],
          default:[{lat:0},{long:0}]
    },
    
    locations:{
        type:[locationSchema],
        default:[],
        select:false,
    },
    followers:[String],
    following:[String],
    profileImage:{
        type:String,
        default:null
    }
    

},{timestamps:true})

userSchema.pre("save", async function(next) {
       
    if (!this.isModified("password")) {
        return next();
    }
    try {
     
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.password, salt);
        this.confirmPassword =undefined
        this.password = hashedPassword;
    
        next();
    } catch (error) {
        next(error); 
    }
    next()
});

userSchema.methods.loginModelMethod = async function(password) {
        const result = await bcrypt.compare( password,this.password)
        return result;
    
};


const userModel = mongoose.model('User',userSchema)

module.exports =userModel;

