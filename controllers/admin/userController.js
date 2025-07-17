const HttpResponseMessage = require("../../constants/httpResponseMessage");
const HttpStatus = require("../../constants/httpStatus");
const HttpStatusCode = require("../../constants/httpStatusCode");
const UserModel = require("../../models/User");

//for get all users with pagination
const getUsers = async (req, res) => {
  try {
    const query = req.query.query || "";
    const page = req.query.page || 1;
    const perPage = 6;
    let usersList = [];
    usersList = await UserModel.find({ firstName: new RegExp(query, "i") })
      .skip((page - 1) * perPage)
      .limit(perPage);
    if (!usersList) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        status: HttpStatus.ERROR,
        message: HttpResponseMessage.ERROR.USERS_NOT_FOUND,
      });
    }
    const count = await UserModel.countDocuments();
    return res.status(200).render("admin/userManagementPage", {
      users: usersList,
      current: page,
      perPage,
      pages: Math.ceil(count / 6),
    });
  } catch (err) {
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.ERROR,
      message: HttpResponseMessage.ERROR.USERS_STATUSES,
    });
  }
};

//block or unblock the user
const blockUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { isBlocked } = req.body;
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { isBlocked },
      { new: true }
    );

    if (!user) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        status: HttpStatus.ERROR,
        message: HttpResponseMessage.ERROR.USER_NOT_FOUND,
      });
    }

    return res.status(HttpStatusCode.OK).json({
      status: HttpStatus.SUCCESS,
      message: HttpResponseMessage.SUCCESS.USER_STATUS_UPDATE,
      data: {
        userId: user._id,
        isBlocked: user.isBlocked,
      },
    });
  } catch (error) {
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.ERROR,
      message: HttpResponseMessage.ERROR.USER_STATUS_UPDATE,
    });
  }
};

//for search users by their names
const searchUsers = (req, res) => {
  const query = req.query.query;
  // console.log(query);
  res.redirect(`/admin/users?query=${query}`);
};

module.exports = { getUsers, blockUser, searchUsers };
