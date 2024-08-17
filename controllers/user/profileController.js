const AddressModel = require("../../models/Address");
const UserModel = require("../../models/User");

//get the account profile page
const getProfile = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const addresses = await AddressModel.find({ userId: user._id });
    res.render("user/profile", {
      user,
      addresses,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//update the personal details
const updatePersonal = async (req, res) => {
  try {
    const userId = req.params.id;
    const { firstName, lastName } = req.body;
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { firstName, lastName },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "user not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "user updated successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error updating user filed",
    });
  }
};

//create the new address
const postAddress = async (req, res) => {
  try {
    const {
      userId,
      firstName,
      secondName,
      phoneNo,
      email,
      addressLine,
      pincode,
      state,
      country,
      city,
      flatNo,
    } = req.body;

    // console.log(req.body);

    let address = await AddressModel.findOne({ email });
    if (!address) {
      address = new AddressModel({
        userId,
        firstName,
        lastName: secondName,
        phoneNo,
        email,
        addressLine,
        pincode,
        state,
        country,
        city,
        flatNo,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      const savedAddress = await address.save();
      return res.status(201).json({
        status: "success",
        message: "user updated successfully",
        data: savedAddress,
      });
    } else {
      res.status(404).json({
        status: "Failed",
        message: "the Address is already exist!!!",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error creating the address",
    });
  }
};

//for edit the existing address
const editAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    const {
      userId,
      firstName,
      lastName,
      addressLine,
      city,
      state,
      pincode,
      country,
      phoneNo,
      flatNo,
    } = req.body;

    const address = await AddressModel.findByIdAndUpdate(
      addressId,
      {
        userId,
        firstName,
        lastName,
        addressLine,
        city,
        state,
        pincode,
        country,
        phoneNo,
        flatNo,
      },
      { new: true }
    );
    if (!address) {
      return res.status(404).json({
        status: "error",
        message: "Address is not found",
      });
    }
    return res.status(200).json({
      status: "success",
      message: "address is updated successfully",
      data: address,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Error updating address status",
    });
  }
};

module.exports = { getProfile, updatePersonal, postAddress, editAddress };
