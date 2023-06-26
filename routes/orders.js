var express = require("express");
const OrderController = require("../controller/OrderController");

var router = express.Router();

router.get("/", OrderController.index);
// router
//   .route("/:id")
//   .get(UserController.showUser)
//   .put(UserController.updateUser)
//   .delete(UserController.deleteUser);
// router.post("/register", UserController.register);
// router.post("/login", UserController.login);

module.exports = router;
