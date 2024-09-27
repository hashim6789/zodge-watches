const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../../index"); // Import your Express app

describe("Admin User Management Routes", () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect("mongodb://localhost:27017/test_db", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    // Close database connection after tests
    await mongoose.connection.close();
  });

  it("GET /admin/users should return all users", async () => {
    const res = await request(app).get("/admin/users");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true); // Check if body is an array
  });
});
