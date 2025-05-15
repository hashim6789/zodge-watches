const OrderModel = require("../../models/Order");
const UserModel = require("../../models/User");

const getSalesReport = async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.query;

    let matchStage = {
      orderStatus: { $in: ["placed", "shipped", "delivered"] },
    };
    if (reportType === "custom" && startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else {
      const today = new Date();
      switch (reportType) {
        case "daily":
          matchStage.createdAt = { $gte: new Date(today.setHours(0, 0, 0, 0)) };
          break;
        case "weekly":
          matchStage.createdAt = {
            $gte: new Date(today.setDate(today.getDate() - 7)),
          };
          break;
        case "monthly":
          matchStage.createdAt = {
            $gte: new Date(today.setMonth(today.getMonth() - 1)),
          };
          break;
        case "yearly":
          matchStage.createdAt = {
            $gte: new Date(today.setFullYear(today.getFullYear() - 1)),
          };
          break;
      }
    }
    console.log("match = ", matchStage);

    const aggregationPipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          salesCount: { $sum: 1 },
          totalAmount: { $sum: "$totalPrice" },
          totalDiscount: {
            $sum: {
              $subtract: [
                {
                  $sum: {
                    $map: {
                      input: "$products",
                      as: "prod",
                      in: { $multiply: ["$$prod.price", "$$prod.quantity"] },
                    },
                  },
                },
                "$totalPrice",
              ],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ];

    //for aggregated result
    const results = await OrderModel.aggregate(aggregationPipeline);
    console.log(results);

    const salesData = {
      labels: results.map((r) => r._id),
      values: results.map((r) => r.totalAmount),
    };

    const ordersData = {
      labels: results.map((r) => r._id),
      values: results.map((r) => r.salesCount),
    };

    const discountData = {
      labels: results.map((r) => r._id),
      values: results.map((r) => r.totalDiscount),
    };

    const overallSalesCount = results.reduce((sum, r) => sum + r.salesCount, 0);
    const overallOrderAmount = results.reduce(
      (sum, r) => sum + r.totalAmount,
      0
    );
    const overallDiscount = results.reduce(
      (sum, r) => sum + r.totalDiscount,
      0
    );

    res.json({
      success: true,
      ordersData: {
        sales: salesData,
        orders: ordersData,
        discounts: discountData,
        overall: {
          salesCount: overallSalesCount,
          orderAmount: overallOrderAmount,
          discount: overallDiscount,
        },
      },
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res
      .status(500)
      .json({ success: false, message: "Error generating report" });
  }
};

//for generating the customize sales charts
const getSalesChart = async (req, res) => {
  try {
    const { range } = req.query;
    console.log("range = ", range);
    let startDate, groupBy, dateFormat;

    switch (range) {
      case "daily":
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        dateFormat = "%Y-%m-%d";
        break;
      case "weekly":
        startDate = new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000); // Last 12 weeks
        groupBy = { $week: "$createdAt" };
        dateFormat = "%Y-W%V";
        break;
      case "yearly":
        startDate = new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000); // Last 5 years
        groupBy = { $year: "$createdAt" };
        dateFormat = "%Y";
        break;
      case "monthly":
      default:
        startDate = new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000); // Last 12 months
        groupBy = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
        dateFormat = "%Y-%m";
    }

    const salesData = await OrderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          orderStatus: { $in: ["placed", "shipped", "delivered"] },
        },
      },
      {
        $group: {
          _id: groupBy,
          totalSales: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: "$_id",
          sales: "$totalSales",
          _id: 0,
        },
      },
    ]);

    const labels = salesData.map((item) => item.date);
    const values = salesData.map((item) => item.sales);
    console.log("axis = ", { labels, values });

    res.json({ labels, values });
  } catch (error) {
    console.error("Error fetching sales data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getOrdersStatusChart = async (req, res) => {
  try {
    const orderStatusData = await OrderModel.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    const labels = orderStatusData.map((item) => item._id);
    const values = orderStatusData.map((item) => item.count);

    res.json({ labels, values });
  } catch (error) {
    console.error("Error fetching order status data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUserGrowth = async (req, res) => {
  try {
    const { range } = req.query;
    let startDate, groupBy, dateFormat;

    switch (range) {
      case "daily":
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        dateFormat = "%Y-%m-%d";
        break;
      case "weekly":
        startDate = new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000); // Last 12 weeks
        groupBy = { $dateToString: { format: "%Y-%U", date: "$createdAt" } };
        dateFormat = "%Y-W%V";
        break;
      case "yearly":
        startDate = new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000); // Last 5 years
        groupBy = { $dateToString: { format: "%Y", date: "$createdAt" } };
        dateFormat = "%Y";
        break;
      case "monthly":
      default:
        startDate = new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000); // Last 12 months
        groupBy = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
        dateFormat = "%Y-%m";
    }

    const userCountData = await UserModel.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $group: {
          _id: null,
          data: { $push: { date: "$_id", count: "$count" } },
          totalCount: { $sum: "$count" },
        },
      },
      {
        $project: {
          data: 1,
          totalCount: 1,
          _id: 0,
        },
      },
    ]);

    if (userCountData.length === 0) {
      return res.json({ labels: [], values: [] });
    }

    let cumulativeCount = 0;
    const labels = [];
    const values = [];

    userCountData[0].data.forEach((item) => {
      labels.push(item.date);
      cumulativeCount += item.count;
      values.push(cumulativeCount);
    });

    console.log("user = ", { labels, values });

    res.json({ labels, values });
  } catch (error) {
    console.error("Error fetching user count data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getSalesReport,
  getSalesChart,
  getOrdersStatusChart,
  getUserGrowth,
};
