const OrderModel = require("../models/Order");

// const getSalesReport = async (req, res) => {
//   try {
//     const { reportType, startDate, endDate } = req.query;

//     // Prepare date range for custom reports
//     let start = new Date(startDate);
//     let end = new Date(endDate);

//     // Fetch data based on the report type
//     let ordersData;
//     switch (reportType) {
//       case "yearly":
//         ordersData = await getYearlySales();
//         break;
//       case "monthly":
//         ordersData = await getMonthlySales();
//         break;
//       case "weekly":
//         ordersData = await getWeeklySales();
//         break;
//       case "daily":
//         ordersData = await getDailySales();
//         break;
//       case "custom":
//         ordersData = await getCustomSales(start, end);
//         break;
//       default:
//         return res
//           .status(400)
//           .json({ success: false, message: "Invalid report type" });
//     }
//     console.log("data", ordersData);

//     res.json({
//       success: true,
//       message: "The report is generated successfully",
//       ordersData,
//     });
//   } catch (error) {
//     res.status(500).send("Error generating report");
//   }
// };

// // Function to get yearly sales data
// async function getYearlySales() {
//   // Example: Aggregate sales by year
//   const result = await OrderModel.aggregate([
//     {
//       $group: {
//         _id: { $year: "$createdAt" },
//         totalSales: { $sum: "$totalPrice" },
//         totalOrders: { $count: {} },
//       },
//     },
//     {
//       $sort: { _id: 1 },
//     },
//   ]);

//   // Format the result for the chart
//   return formatReportData(result);
// }

// // Function to get monthly sales data
// async function getMonthlySales() {
//   // Example: Aggregate sales by month
//   const result = await OrderModel.aggregate([
//     {
//       $group: {
//         _id: { $month: "$createdAt" },
//         totalSales: { $sum: "$totalPrice" },
//         totalOrders: { $count: {} },
//       },
//     },
//     {
//       $sort: { _id: 1 },
//     },
//   ]);

//   // Format the result for the chart
//   return formatReportData(result);
// }

// // Function to get weekly sales data
// async function getWeeklySales() {
//   // Example: Aggregate sales by week
//   const result = await OrderModel.aggregate([
//     {
//       $group: {
//         _id: {
//           year: { $isoWeekYear: "$createdAt" },
//           week: { $isoWeek: "$createdAt" },
//         },
//         totalSales: { $sum: "$totalPrice" },
//         totalOrders: { $count: {} },
//       },
//     },
//     {
//       $sort: { "_id.year": 1, "_id.week": 1 },
//     },
//   ]);

//   // Format the result for the chart
//   return formatReportData(result);
// }

// // Function to get daily sales data
// async function getDailySales() {
//   // Example: Aggregate sales by day
//   const result = await OrderModel.aggregate([
//     {
//       $group: {
//         _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
//         totalSales: { $sum: "$totalPrice" },
//         totalOrders: { $count: {} },
//       },
//     },
//     {
//       $sort: { _id: 1 },
//     },
//   ]);

//   // Format the result for the chart
//   return formatReportData(result);
// }

// // Function to get custom range sales data
// async function getCustomSales(startDate, endDate) {
//   // Example: Aggregate sales within a custom date range
//   const result = await OrderModel.aggregate([
//     {
//       $match: {
//         orderDate: { $gte: startDate, $lte: endDate },
//       },
//     },
//     {
//       $group: {
//         _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } },
//         totalSales: { $sum: "$totalPrice" },
//         totalOrders: { $count: {} },
//       },
//     },
//     {
//       $sort: { _id: 1 },
//     },
//   ]);

//   // Format the result for the chart
//   return formatReportData(result);
// }

// // Helper function to format report data for charts
// function formatReportData(data) {
//   const salesData = {
//     labels: [],
//     values: [],
//   };
//   const ordersData = {
//     labels: [],
//     values: [],
//   };

//   data.forEach((item) => {
//     salesData.labels.push(item._id);
//     salesData.values.push(item.totalSales);
//     ordersData.labels.push(item._id);
//     ordersData.values.push(item.totalOrders);
//   });

//   return {
//     sales: salesData,
//     orders: ordersData,
//   };
// }

const getSalesReport = async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.query;

    //match stage setting matchStage = {orderStatus , createdAt}
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

    //for setting the aggregation pipeline
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

    console.log("pipeline = ", aggregationPipeline);

    // const orders = await OrderModel.find({ createdAt: { $exists: true } });
    // console.log(orders);

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

module.exports = {
  getSalesReport,
};
