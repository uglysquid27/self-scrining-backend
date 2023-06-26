var express = require("express");
const UserController = require("../controller/UserController");
var router = express.Router();

router.get("/", UserController.getAll);
router
  .route("/:id")
  .get(UserController.showUser)
  .put(UserController.updateUser)
  .delete(UserController.deleteUser);
router.post("/register", UserController.register);
router.post("/login", UserController.login);

module.exports = router;
