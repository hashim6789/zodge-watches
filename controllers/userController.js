const UserModel = require("../models/User");

//get all users
const getUsers = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const perPage = 6;
    const usersList = await UserModel.find()
      .skip((page - 1) * perPage)
      .limit(perPage);
    if (!usersList) {
      return res.status(404).json({
        status: "success",
        message: "the users are not found...",
      });
    }
    const count = await UserModel.countDocuments();
    return res.status(200).render("admin/userManagementPage", {
      users: usersList,
      current: page,
      perPage,
      pages: Math.ceil(count / 6),
    });
    // return res.status(200).json({
    //   status: "Success",
    //   message: "The page rendered successfully",
    //   data: usersList,
    // });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Error get all user status",
    });
  }
};

//block or unblock the user
const blockUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { isBlocked } = req.body;
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { isBlocked },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "User status updated successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error updating user status",
    });
  }
};

module.exports = { getUsers, blockUser };
