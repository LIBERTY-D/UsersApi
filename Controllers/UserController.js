const ClassModel = require("../Models/ClassModel");
const functions = require("../Functions/Reuse");
const jwt = require("jsonwebtoken");
const JWT = require("../JWT/JWT");
const bcrypt = require("bcrypt");

module.exports = class UserController {
  static signUpFields = ["username", "email", "password", "confirmPassword"];
  static loginFields = ["email", "password"];
  static checkRequire(newUser, fields) {
    let allFields = true;
    // Check if all required fields are present
    for (const field of fields) {
      if (!(field in newUser)) {
        allFields = false;
        break; // Exit the loop early if a required field is missing
      }
    }

    return allFields;
  }
  /**\
   * returns all users
   * @param {*} req
   * @param {*} res
   * @param {*} next
   *
   */
  static getUsers = functions.handleErrors(async (req, res, next) => {
    const isAdmin = req.user.isAdmin;
    let users = ClassModel.userModel.find({});
    //if is admin then show everything
    if (isAdmin) {
      users = await users
        .select("+locations +userLocation +password -__v")
        .exec();
    } else {
      users = await users;
    }
    //console.log(req.user)
    return res
      .status(200)
      .json(functions.sendResource(200, users, "users retrieved"));
  });

  /**\
   * returns a user
   * @param {*} req
   * @param {*} res
   * @param {*} next
   *
   */
  static getUser = functions.handleErrors(async (req, res, next) => {
    let id = req.params.id;
    if (!id) {
      throw new functions.getCustomError("Invalid Id", "InvalidId", 400);
    } else {
      const user = await ClassModel.userModel.findOne({ _id: id });
      if (!user) {
        throw new functions.getCustomError(
          "User does not exist",
          "InvalidUser",
          400
        );
      } else {
        return res
          .status(200)
          .json(functions.sendResource(200, [user], "user found"));
      }
    }
  });
  /**
   * delete user
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */

  static deleteUser = functions.handleErrors(async (req, res, next) => {
    let user = req.user;
    let id = req.params.id;
    if (user._id == id) {
      //delete for a regular user whoses logged in
      await ClassModel.userModel.findByIdAndDelete({ _id: id });
      return res.status(204).json({
        status: "ok",
        message: "Your account was deleted successfully",
      });
    } else if (user.isAdmin) {
      //check if user trynna be deleted exists
      let user = await ClassModel.userModel.findById({ _id: id });
      if (user == null) {
        throw new functions.getCustomError(
          "User you trying to delete does not exist",
          null,
          400
        );
      } else {
        //delete action for an admin
        await ClassModel.userModel.findByIdAndDelete({ _id: id });
        return res.status(204).json({
          status: "ok",
          message: `user deleted`,
        });
      }
    } else {
      throw new functions.getCustomError(
        "Something went Wrong trying to delete a user",
        null,
        400
      );
    }
  });
  /**\
   * returns all users
   * @param {*} req
   * @param {*} res
   * @param {*} next
   *
   */
  static postUser = functions.handleErrors(async (req, res, next) => {
    let newUser = { ...req.body };
    if (this.checkRequire(newUser, this.signUpFields) == false) {
      throw new functions.getCustomError(
        "fill in  required fields",
        "Validation",
        400
      );
    } else {
      let user = ClassModel.userModel(newUser);
      await user.save();
      return res
        .status(201)
        .json(functions.sendResource(201, [user], "user created"));
    }
  });

  /**
   * Login user
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static loginUser = functions.handleErrors(async (req, res, next) => {
    let newUser = { ...req.body };

    let isfilled = this.checkRequire(newUser, this.loginFields);
    // check required fields
    if (isfilled == false) {
      throw new functions.getCustomError(
        "Fill In Required Fields",
        "Invalid",
        400
      );
    }
    // check if email or password is correct
    let user = await ClassModel.userModel
      .findOne({ email: newUser.email })
      .select("+locations +userLocation +password");
    if (!user || !(await user.loginModelMethod(newUser.password))) {
      throw new functions.getCustomError(
        "incorrect email or password",
        "Invalid",
        400
      );
    }

    // send JWT
    let token = JWT.sendJwt(user);
    sendCookie(res,token)
    
    return res.status(200).json({
      
      status: "success",
      message: "Use the token on every request you make",
      token,
    });
  });

  /**
   * Login user
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static updateUser = functions.handleErrors(async (req, res, next) => {
    const httpUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    const newUser = { ...req.body };
    let email = newUser.email;
    let username = newUser.username;
    let profileImage = newUser.profileImage;
    let password = newUser.password;
    let confirmPassword = newUser.confirmPassword;
    let oldPassword = newUser.oldPassword;
    let dataSaved = {};
    if (newUser.email) dataSaved["email"] = email;
    if (newUser.username) dataSaved["username"] = username;
    if (newUser.profileImage) dataSaved["profileImage"] = profileImage;
    if (newUser.password) dataSaved["password"] = password;
    if (newUser.confirmPassword) dataSaved["confirmPassword"] = confirmPassword;
    if (newUser.oldPassword) dataSaved["oldPassword"] = oldPassword;
    if (req.file) dataSaved["profileImage"] = httpUrl + "/" + req.file.filename;

    //check if old password equals the one in database
    if (
      dataSaved.password &&
      dataSaved.confirmPassword &&
      dataSaved.oldPassword
    ) {
      //check if the fields exist
      let check = await checkPassword(dataSaved.oldPassword, req.user);

      if (!check) {
        throw new functions.getCustomError(
          "current Password does not match the one in db".toUpperCase(),
          null,
          403
        );
      } else {
        encryptPassword(dataSaved, req);
      }
    }
    //regular update without password
    else {
      await ClassModel.userModel.findByIdAndUpdate(
        { _id: req.user._id },
        dataSaved,
        {
          runValidators: true,
          new: true,
        }
      );
    }

    return res.status(200).json({
      status: "ok",
      message: "updated",
    });
  });
};

/**
 *
 * @param {*} oldPassword
 * @param {*} user
 * @returns
 */
async function checkPassword(oldPassword, user) {
  let currentUser = await ClassModel.userModel
    .findById(user._id)
    .select("+locations +userLocation +password");
  let isequal = await currentUser.loginModelMethod(oldPassword);
  return isequal;
}

async function encryptPassword(dataSaved, req) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(dataSaved.password, salt);
  dataSaved["password"] = hashedPassword;
  delete dataSaved["confirmPassword"];
  await ClassModel.userModel.findByIdAndUpdate(
    { _id: req.user._id },
    dataSaved,
    {
      runValidators: true,
      new: true,
    }
  );
}
//TODO SEND COOKIES 

/**
 * send cookie to a user
 * @param {*} res 
 */
function sendCookie(res,jwt){

  return res.cookie('jwt', jwt, { 
      maxAge: 60*60*1000, 
      httpOnly: true 
    });
    
}
