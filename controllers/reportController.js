const OrderModel = require("../models/Order");

const getSalesReport = async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.query;

    // Prepare date range for custom reports
    let start = new Date(startDate);
    let end = new Date(endDate);

    // Fetch data based on the report type
    let ordersData;
    switch (reportType) {
      case "yearly":
        ordersData = await getYearlySales();
        break;
      case "monthly":
        ordersData = await getMonthlySales();
        break;
      case "weekly":
        ordersData = await getWeeklySales();
        break;
      case "daily":
        ordersData = await getDailySales();
        break;
      case "custom":
        ordersData = await getCustomSales(start, end);
        break;
      default:
        return res
          .status(400)
          .json({ success: false, message: "Invalid report type" });
    }
    console.log("data", ordersData);

    res.json({
      success: true,
      message: "The report is generated successfully",
      ordersData,
    });
  } catch (error) {
    res.status(500).send("Error generating report");
  }
};

// Function to get yearly sales data
async function getYearlySales() {
  // Example: Aggregate sales by year
  const result = await OrderModel.aggregate([
    {
      $group: {
        _id: { $year: "$createdAt" },
        totalSales: { $sum: "$totalPrice" },
        totalOrders: { $count: {} },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // Format the result for the chart
  return formatReportData(result);
}

// Function to get monthly sales data
async function getMonthlySales() {
  // Example: Aggregate sales by month
  const result = await OrderModel.aggregate([
    {
      $group: {
        _id: { $month: "$createdAt" },
        totalSales: { $sum: "$totalPrice" },
        totalOrders: { $count: {} },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // Format the result for the chart
  return formatReportData(result);
}

// Function to get weekly sales data
async function getWeeklySales() {
  // Example: Aggregate sales by week
  const result = await OrderModel.aggregate([
    {
      $group: {
        _id: {
          year: { $isoWeekYear: "$createdAt" },
          week: { $isoWeek: "$createdAt" },
        },
        totalSales: { $sum: "$totalPrice" },
        totalOrders: { $count: {} },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.week": 1 },
    },
  ]);

  // Format the result for the chart
  return formatReportData(result);
}

// Function to get daily sales data
async function getDailySales() {
  // Example: Aggregate sales by day
  const result = await OrderModel.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        totalSales: { $sum: "$totalPrice" },
        totalOrders: { $count: {} },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // Format the result for the chart
  return formatReportData(result);
}

// Function to get custom range sales data
async function getCustomSales(startDate, endDate) {
  // Example: Aggregate sales within a custom date range
  const result = await OrderModel.aggregate([
    {
      $match: {
        orderDate: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } },
        totalSales: { $sum: "$totalPrice" },
        totalOrders: { $count: {} },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // Format the result for the chart
  return formatReportData(result);
}

// Helper function to format report data for charts
function formatReportData(data) {
  const salesData = {
    labels: [],
    values: [],
  };
  const ordersData = {
    labels: [],
    values: [],
  };

  data.forEach((item) => {
    salesData.labels.push(item._id);
    salesData.values.push(item.totalSales);
    ordersData.labels.push(item._id);
    ordersData.values.push(item.totalOrders);
  });

  return {
    sales: salesData,
    orders: ordersData,
  };
}

module.exports = { getSalesReport };
