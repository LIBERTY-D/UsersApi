const {locationModel} = require("../Schemas/user_location_schema")
const userModel = require("../Schemas/user_schema")
module.exports = class ClassModel{
    static userModel =  userModel
    static  locationModel = locationModel

}