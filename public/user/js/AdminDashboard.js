import validationUtils from "./validationUtils.js";

document.addEventListener("DOMContentLoaded", function () {
  const reportType = document.getElementById("reportType");
  const startDate = document.getElementById("startDate");
  const endDate = document.getElementById("endDate");
  const customDateRange = document.getElementById("customDateRange");
  const generateReportButton = document.getElementById("generateReportButton");
  const generateExcelReportButton = document.getElementById(
    "generateExcelReportButton"
  );

  // Event listener for when the report type changes
  reportType.addEventListener("change", function () {
    validationUtils.validateReportType(reportType); // Use the validation utility for report type
    toggleCustomDateRange(); // Toggle custom date range visibility based on report type
  });

  // Event listener for validating start date
  startDate.addEventListener("input", function () {
    if (reportType.value === "custom") {
      validationUtils.validateDateRange(startDate, endDate); // Validate date range if custom report is selected
    }
  });

  // Event listener for validating end date
  endDate.addEventListener("input", function () {
    if (reportType.value === "custom") {
      validationUtils.validateDateRange(startDate, endDate); // Validate date range if custom report is selected
    }
  });

  // PDF Report Generation Button Click
  generateReportButton.addEventListener("click", function (e) {
    const validationRules = [
      {
        id: "reportType",
        type: "select",
        message: "Please select a report type.",
      },
    ];

    // Add date range validation rules only if report type is 'custom'
    if (reportType.value === "custom") {
      validationRules.push(
        {
          id: "startDate",
          type: "required",
          message: "Start date is required.",
        },
        {
          id: "endDate",
          type: "required",
          message: "End date is required.",
        },
        {
          id: "startDate",
          type: "dateRange",
          endId: "endDate",
          message: "Start date cannot be later than end date.",
        }
      );
    }

    // Use the `validateForm` utility to validate the entire form
    if (validationUtils.validateForm("reportForm", validationRules)) {
      // If valid, proceed to generate the PDF report
      generatePDFReport();
    } else {
      e.preventDefault();
      alert(
        "Please fill out all required fields correctly before generating the report."
      );
    }
  });

  // Excel Report Generation Button Click
  generateExcelReportButton.addEventListener("click", function (e) {
    const validationRules = [
      {
        id: "reportType",
        type: "select",
        message: "Please select a report type.",
      },
    ];

    // Add date range validation rules only if report type is 'custom'
    if (reportType.value === "custom") {
      validationRules.push(
        {
          id: "startDate",
          type: "required",
          message: "Start date is required.",
        },
        {
          id: "endDate",
          type: "required",
          message: "End date is required.",
        },
        {
          id: "startDate",
          type: "dateRange",
          endId: "endDate",
          message: "Start date cannot be later than end date.",
        }
      );
    }

    // Use the `validateForm` utility to validate the entire form
    if (validationUtils.validateForm("reportForm", validationRules)) {
      // If valid, proceed to generate the Excel report
      generateExcelReport();
    } else {
      e.preventDefault();
      alert(
        "Please fill out all required fields correctly before generating the report."
      );
    }
  });

  // Function to show or hide the custom date range fields
  function toggleCustomDateRange() {
    if (reportType.value === "custom") {
      customDateRange.style.display = "block";
    } else {
      customDateRange.style.display = "none";
      resetDateFields(); // Reset date fields when a non-custom report type is selected
    }
  }

  // Function to reset date fields
  function resetDateFields() {
    startDate.value = "";
    endDate.value = "";
    startDate.classList.remove("is-invalid", "is-valid");
    endDate.classList.remove("is-invalid", "is-valid");
  }

  // Placeholder for actual PDF report generation logic
  async function generatePDFReport() {
    console.log("Generating PDF report...");
    // Add your PDF generation logic here
    try {
      const reportType = document.getElementById("reportType").value;
      const startDate = document.getElementById("startDate").value;
      const endDate = document.getElementById("endDate").value;

      // Send GET request to the server to fetch report data
      const response = await axios.get("/admin/reports", {
        params: {
          reportType: reportType, // Can be "daily", "weekly", "monthly", "yearly", or "custom"
          startDate: startDate,
          endDate: endDate,
        },
      });

      if (response.data.success) {
        const { sales, orders, discounts, overall } = response.data.ordersData;

        // Initialize jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(
          `Sales Report - ${
            reportType.charAt(0).toUpperCase() + reportType.slice(1)
          }`,
          14,
          22
        );

        let salesTableData = [];
        let ordersTableData = [];

        // Function to format the data based on the report type
        const formatDataByType = (type) => {
          if (type === "daily") {
            salesTableData = sales.labels.map((label, index) => {
              const totalSales = sales.values[index];
              const discount = discounts.values[index];
              const netSales = totalSales - discount;
              return [
                label, // Date-wise data for daily report
                `$${totalSales.toFixed(2)}`,
                `$${discount.toFixed(2)}`,
                `$${netSales.toFixed(2)}`,
              ];
            });

            ordersTableData = orders.labels.map((label, index) => {
              return [label, `${orders.values[index]} orders`];
            });
          } else if (type === "weekly") {
            salesTableData = sales.labels.map((label, index) => {
              const totalSales = sales.values[index];
              const discount = discounts.values[index];
              const netSales = totalSales - discount;
              return [
                `Week of ${label}`, // Week-wise data for weekly report
                `$${totalSales.toFixed(2)}`,
                `$${discount.toFixed(2)}`,
                `$${netSales.toFixed(2)}`,
              ];
            });

            ordersTableData = orders.labels.map((label, index) => {
              return [`Week of ${label}`, `${orders.values[index]} orders`];
            });
          } else if (type === "monthly") {
            salesTableData = sales.labels.map((label, index) => {
              const totalSales = sales.values[index];
              const discount = discounts.values[index];
              const netSales = totalSales - discount;
              return [
                `Month of ${label}`, // Month-wise data for monthly report
                `$${totalSales.toFixed(2)}`,
                `$${discount.toFixed(2)}`,
                `$${netSales.toFixed(2)}`,
              ];
            });

            ordersTableData = orders.labels.map((label, index) => {
              return [`Month of ${label}`, `${orders.values[index]} orders`];
            });
          } else if (type === "yearly") {
            salesTableData = sales.labels.map((label, index) => {
              const totalSales = sales.values[index];
              const discount = discounts.values[index];
              const netSales = totalSales - discount;
              return [
                `Year ${label}`, // Year-wise data for yearly report
                `$${totalSales.toFixed(2)}`,
                `$${discount.toFixed(2)}`,
                `$${netSales.toFixed(2)}`,
              ];
            });

            ordersTableData = orders.labels.map((label, index) => {
              return [`Year ${label}`, `${orders.values[index]} orders`];
            });
          } else if (type === "custom") {
            salesTableData = sales.labels.map((label, index) => {
              const totalSales = sales.values[index];
              const discount = discounts.values[index];
              const netSales = totalSales - discount;
              return [
                label, // Custom date range
                `$${totalSales.toFixed(2)}`,
                `$${discount.toFixed(2)}`,
                `$${netSales.toFixed(2)}`,
              ];
            });

            ordersTableData = orders.labels.map((label, index) => {
              return [label, `${orders.values[index]} orders`];
            });
          }
        };

        // Format the data based on the selected reportType
        formatDataByType(reportType);

        // Create sales data table with discounts and net sales
        doc.autoTable({
          head: [["Date/Period", "Sales", "Discount", "Net Sales"]],
          body: salesTableData,
          startY: 30,
        });

        // Create orders data table
        doc.autoTable({
          head: [["Date/Period", "Orders"]],
          body: ordersTableData,
          startY: doc.previousAutoTable.finalY + 10, // Set the start Y position after the previous table
        });

        // Add overall sales, order amount, and discount info
        doc.text(
          `Overall Sales Count: ${overall.salesCount}`,
          14,
          doc.previousAutoTable.finalY + 30
        );
        doc.text(
          `Overall Order Amount: $${overall.orderAmount.toFixed(2)}`,
          14,
          doc.previousAutoTable.finalY + 40
        );
        doc.text(
          `Overall Discount: $${overall.discount.toFixed(2)}`,
          14,
          doc.previousAutoTable.finalY + 50
        );

        // Convert PDF to Base64 and display it in the modal
        const pdfDataUri = doc.output("datauristring");
        document.getElementById("pdfIframe").src = pdfDataUri;

        // Show the modal
        document.getElementById("pdfModal").style.display = "flex";

        // Download button event listener
        document.getElementById("downloadPdf").addEventListener("click", () => {
          doc.save("sales-report.pdf");
        });
      } else {
        console.error("Failed to generate report:", response.statusText);
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error generating report:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        alert(error.response.data.message);
      } else {
        alert("An unknown error occurred.");
      }
    }
  }

  // Placeholder for actual Excel report generation logic
  async function generateExcelReport() {
    console.log("Generating Excel report...");
    // Add your Excel generation logic here
    try {
      const reportType = document.getElementById("reportType").value;
      const startDate = document.getElementById("startDate").value;
      const endDate = document.getElementById("endDate").value;

      // Send GET request to the server to fetch report data
      const response = await axios.get("/admin/reports", {
        params: {
          reportType: reportType, // Can be "1-day", "1-week", "1-month", or "custom"
          startDate: startDate,
          endDate: endDate,
        },
      });

      if (response.data.success) {
        const { sales, orders, discounts, overall } = response.data.ordersData;

        // Create a new workbook
        const workbook = XLSX.utils.book_new();

        // Prepare the header row
        const reportData = [
          [
            "Date",
            "Total Sales ($)",
            "Discount ($)",
            "Net Sales ($)",
            "Total Orders",
          ],
        ];

        // Prepare sales and orders data with discounts and net sales
        sales.labels.forEach((label, index) => {
          const totalSales = sales.values[index].toFixed(2);
          const discount = discounts.values[index].toFixed(2);
          const netSales = (
            sales.values[index] - discounts.values[index]
          ).toFixed(2);
          const totalOrders = orders.values[index];

          reportData.push([label, totalSales, discount, netSales, totalOrders]);
        });

        // Create a sheet for sales and orders data
        const reportSheet = XLSX.utils.aoa_to_sheet(reportData);

        // Append the sheet to the workbook
        XLSX.utils.book_append_sheet(
          workbook,
          reportSheet,
          "Sales and Orders Data"
        );

        // Add overall sales count, order amount, and discount info at the end
        const overallData = [
          ["Overall Sales Count", overall.salesCount],
          ["Overall Order Amount ($)", overall.orderAmount.toFixed(2)],
          ["Overall Discount ($)", overall.discount.toFixed(2)],
        ];
        const overallSheet = XLSX.utils.aoa_to_sheet(overallData);
        XLSX.utils.book_append_sheet(workbook, overallSheet, "Overall Report");

        // Download the Excel file
        XLSX.writeFile(workbook, "sales-orders-report.xlsx");
      } else {
        console.error("Failed to generate report:", response.statusText);
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error generating Excel report:", error);
      alert("An error occurred while generating the Excel report.");
    }
    document
      .getElementById("reportType")
      .addEventListener("change", function () {
        const customRange = document.getElementById("customDateRange");
        if (this.value === "custom") {
          customRange.style.display = "block";
        } else {
          customRange.style.display = "none";
        }
      });
  }
});

document.getElementById("pdfClose").addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("pdfModal").style.display = "none";
});

//order status part
let salesChart;

function initChart(data) {
  const ctx = document.getElementById("salesChart").getContext("2d");
  salesChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: data.labels,
      datasets: [
        {
          label: "Sales",
          data: data.values,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value, index, values) {
              return "₹" + value.toLocaleString(); // Assuming Indian Rupees
            },
          },
        },
      },
      tooltips: {
        callbacks: {
          label: function (tooltipItem, data) {
            let label = data.datasets[tooltipItem.datasetIndex].label || "";
            if (label) {
              label += ": ";
            }
            label += "₹" + tooltipItem.yLabel.toLocaleString();
            return label;
          },
        },
      },
    },
  });
}

function updateChart(data) {
  salesChart.data.labels = data.labels;
  salesChart.data.datasets[0].data = data.values;
  salesChart.update();
}

function fetchChartData(timeRange) {
  axios
    .get(`/admin/reports/api/sales-data?range=${timeRange}`)
    .then((response) => {
      const data = response.data;
      if (salesChart) {
        updateChart(data);
      } else {
        initChart(data);
      }
    })
    .catch((error) => console.error("Error fetching chart data:", error));
}

document.getElementById("timeRange").addEventListener("change", function () {
  fetchChartData(this.value);
});

// Initial chart load
fetchChartData("monthly");

function initOrderStatusChart(data) {
  const ctx = document.getElementById("orderStatusChart").getContext("2d");
  new Chart(ctx, {
    type: "pie",
    data: {
      labels: data.labels,
      datasets: [
        {
          data: data.values,
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
            "#FF9F40",
            "#FF6384",
          ],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "right",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.label || "";
              if (label) {
                label += ": ";
              }
              if (context.parsed !== null) {
                label += context.parsed + " orders";
              }
              return label;
            },
          },
        },
      },
    },
  });
}

function fetchOrderStatusData() {
  fetch("/admin/reports/api/order-status-data")
    .then((response) => response.json())
    .then((data) => {
      initOrderStatusChart(data);
    })
    .catch((error) =>
      console.error("Error fetching order status data:", error)
    );
}

// Load order status data when the page loads
document.addEventListener("DOMContentLoaded", fetchOrderStatusData);

//user growth chart
function initUserGrowthChart(data) {
  const ctx = document.getElementById("userGrowthChart").getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: data.labels,
      datasets: [
        {
          label: "New Users",
          data: data.values,
          borderColor: "#36A2EB",
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || "";
              if (label) {
                label += ": ";
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y + " new users";
              }
              return label;
            },
          },
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "Date",
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: "Number of New Users",
          },
          suggestedMin: 0,
        },
      },
    },
  });
}

function fetchUserGrowthData() {
  fetch("/admin/reports/api/user-growth-data")
    .then((response) => response.json())
    .then((data) => {
      initUserGrowthChart(data);
    })
    .catch((error) => console.error("Error fetching user growth data:", error));
}

// Load user growth data when the page loads
document.addEventListener("DOMContentLoaded", fetchUserGrowthData);
