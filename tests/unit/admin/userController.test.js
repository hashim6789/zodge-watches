const UserModel = require("../../../models/User"); // Model import
const { getAllUsers } = require("../../../controllers/admin/userController"); // Controller import

describe("Admin User Controller - getAllUsers", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("should return all users", async () => {
    // Mock the find method of the User model
    UserModel.find = jest
      .fn()
      .mockResolvedValue([{ name: "John" }, { name: "Jane" }]);

    await getAllUsers(req, res);

    // Check if status and json were called correctly
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ name: "John" }, { name: "Jane" }]);
  });

  it("should return 500 on error", async () => {
    // Mock an error scenario
    UserModel.find = jest.fn().mockRejectedValue(new Error("Database error"));

    await getAllUsers(req, res);

    // Check if status and json were called correctly
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
  });
});
