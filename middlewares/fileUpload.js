const multer = require('multer')

const storage = multer.diskStorage({
    destination: function(req, file, callback){
        callback(null, 'uploads')
    },
    filename: function(req, file, callback){
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        callback(null, uniqueSuffix+ '-' + file.originalname)
    }
})

const upload = multer({storage})

module.exports = upload