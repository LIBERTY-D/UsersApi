const multer  = require('multer')
const { getCustomError } = require('../Functions/Reuse')
// Define storage for uploaded files
 function storage(){
    return multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, 'uploads/') // Uploads will be stored in 'uploads/' directory
        },
        filename: function (req, file, cb) {
            if(!file.mimetype.startsWith("image")){
                cb(new getCustomError("please select a proper image","InavlidImage",400),null)
            }else{
                cb(null, file.originalname) // Keep original filename
            }
        
        }
      });
}
const upload = multer({ storage: storage() });

module.exports =  upload
 