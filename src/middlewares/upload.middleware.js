const multer = require('multer')

const imageFilter = (req, file, cb) => {
  if ((file.mimetype.startsWith("image/jpeg") && file.originalname.endsWith(".jpg")) ||
      (file.mimetype.startsWith("image/png") && file.originalname.endsWith(".png"))) {
    cb(null, true)
  } else {
    cb("Solo se permiten imágenes con extensión JPG o PNG.", false)
  }
}

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})

var uploadFile = multer({ storage: storage, fileFilter: imageFilter, limits: { fileSize: 102400 } })

module.exports = uploadFile