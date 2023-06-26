var express = require("express");
const DriverController = require("../controller/DriverController");
var router = express.Router();

const multer = require("multer");
const moment = require("moment");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, moment().format("YYYYMMDDHHmm") + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

router.get("/", DriverController.index);
router
  .route("/:id")
  .get(DriverController.show)
  .put(upload.single("carPicture"), DriverController.update)
  .delete(DriverController.destroy);
router.post("/", upload.single("carPicture"), DriverController.store);


module.exports = router;
