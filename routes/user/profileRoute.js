const express = require("express");
const {
  getAccountPage,
  updatePersonalInfo,
  createAddress,
  updateAddress,
  deleteAddress,
  cancelOrder,
  viewOrderDetail,
  sendReturnRequest,
} = require("../../controllers/user/profileController");

const router = express.Router();
//<-------------------------personal information routes ------------------------------>

//for get the account page
router.get("/:userId", getAccountPage);

//for update the user information
router.patch("/personal/:userId", updatePersonalInfo);

//<-------------------------address management routes ------------------------------>
//for creating new address
router.post("/address", createAddress);

//for update the existing address
router.put("/address/:addressId", updateAddress);

//for deleting the existing address
router.delete("/address/:addressId", deleteAddress);

//<-------------------------address management routes ------------------------------>

//for cancel the order
router.patch("/orders/:orderId/cancel", cancelOrder);

//view the order details page
router.get("/orders/:orderId/view", viewOrderDetail);

//return the delivered order
router.patch("/orders/:orderId/return", sendReturnRequest);

module.exports = router;
