const express = require("express");
const {
  getWalletBalance,
  addFundsToWallet,
  deductFromWallet,
  getTransactionHistory,
} = require("../../controllers/user/walletController");
//for Authentication
const {
  isAuthenticatedUser,
  redirectIfAuthenticated,
  checkBlocked,
} = require("../../middlewares/authenticationMiddlewares");

//for Authorization
const { authorizeUser } = require("../../middlewares/authorizationMiddlewares");
const router = express.Router();

// Get wallet balance
router.get("/balance", isAuthenticatedUser, authorizeUser, getWalletBalance);

// Add funds to wallet (to be used after successful payment integration)
router.post("/add-funds", isAuthenticatedUser, authorizeUser, addFundsToWallet);

// Deduct funds for a purchase
router.post("/deduct", isAuthenticatedUser, authorizeUser, deductFromWallet);

// Get wallet transaction history
router.get(
  "/transactions",
  isAuthenticatedUser,
  authorizeUser,
  getTransactionHistory
);

module.exports = router;
