const Wallet = require("../../models/Wallet");
const User = require("../../models/User");
const mongoose = require("mongoose");

// Get wallet balance
const getWalletBalance = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    res.status(200).json({ balance: wallet.balance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add funds to wallet (after successful payment integration)
const addFundsToWallet = async (req, res) => {
  try {
    const { amount } = req.body;
    if (amount <= 0) return res.status(400).json({ message: "Invalid amount" });

    const wallet = await Wallet.findOne({ user: req.user._id });
    wallet.balance += amount;

    wallet.transactions.push({
      type: "credit",
      amount: amount,
      description: "Funds added",
    });

    await wallet.save();
    res
      .status(200)
      .json({ message: "Funds added successfully", balance: wallet.balance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deduct wallet balance during purchase
const deductFromWallet = async (req, res) => {
  try {
    const { amount } = req.body;

    const wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ message: "Insufficient wallet balance" });
    }

    wallet.balance -= amount;

    wallet.transactions.push({
      type: "debit",
      amount: amount,
      description: "Purchase",
    });

    await wallet.save();
    res
      .status(200)
      .json({ message: "Purchase successful", balance: wallet.balance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get wallet transaction history
const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const wallet = await WalletModel.aggregate([
      {
        $match: { userId: mongoose.Types.ObjectId(userId) },
      },
      {
        $project: {
          userId: 1,
          balance: 1,
          transactions: {
            $sortArray: {
              input: "$transactions",
              sortBy: { date: -1 },
            },
          },
        },
      },
    ]);

    console.log(wallet);
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    res.status(200).json(wallet.transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getWalletBalance,
  addFundsToWallet,
  deductFromWallet,
  getTransactionHistory,
};
