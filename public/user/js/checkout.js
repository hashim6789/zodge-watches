// Function to fetch pincode details
function fetchPincodeDetails(pincode) {
  if (pincode.length !== 6) {
    alert("Please enter a valid 6-digit pincode.");
    return;
  }

  // Make a request to the Pincode API
  axios
    .get(`https://api.postalpincode.in/pincode/${pincode}`)
    .then((response) => {
      const data = response.data;
      if (data[0].Status === "Success") {
        const postOffice = data[0].PostOffice[0];

        // Update the form fields with the API data
        document.getElementById("country").value = postOffice.Country || "";
        document.getElementById("city").value = postOffice.District || "";
        document.getElementById("state").value = postOffice.State || "";
      } else {
        alert("Invalid pincode or data not available.");
      }
    })
    .catch((error) => {
      console.error("Error fetching pincode details:", error);
    });
}

// Event listener to call the function when the pincode input reaches 6 digits
document.addEventListener("DOMContentLoaded", function () {
  const pincodeInput = document.getElementById("pincode");

  // Add input event listener to the pincode field
  pincodeInput.addEventListener("input", function () {
    if (pincodeInput.value.length === 6) {
      fetchPincodeDetails(pincodeInput.value);
    }
  });
});

function checkAddressFields() {
  const firstName = document.getElementById("firstName").value.trim();
  const email = document.getElementById("email").value.trim();
  const phoneNo = document.getElementById("phoneNo").value.trim();
  const addressLine = document.getElementById("addressLine").value.trim();
  const pincode = document.getElementById("pincode").value.trim();
  const city = document.getElementById("city").value.trim();
  const state = document.getElementById("state").value.trim();
  const country = document.getElementById("country").value.trim();

  if (
    firstName &&
    email &&
    phoneNo &&
    addressLine &&
    pincode &&
    city &&
    state &&
    country
  ) {
    document.getElementById("confirmAddress").disabled = false;
  } else {
    document.getElementById("confirmAddress").disabled = true;
  }
}

function togglePaymentOptions(checkbox) {
  // Get all payment method radio buttons
  const paymentMethods = document.querySelectorAll(
    'input[name="paymentMethod"]'
  );

  // Enable or disable payment options based on checkbox state
  paymentMethods.forEach((paymentMethod) => {
    paymentMethod.disabled = !checkbox.checked;
  });
}

// Add event listener to the address dropdown to call checkAddressFields
document.getElementById("savedAddress").addEventListener("change", function () {
  populateAddress(this); // Assuming populateAddress fills in the address fields
  checkAddressFields();
});

function populateAddress(select) {
  const index = select.value;

  if (index === "") {
    // Clear form fields if no address is selected
    document.getElementById("firstName").value = "";
    document.getElementById("lastName").value = "";
    document.getElementById("email").value = "";
    document.getElementById("phoneNo").value = "";
    document.getElementById("addressLine").value = "";
    document.getElementById("flatNo").value = "";

    document.getElementById("city").value = "";
    document.getElementById("state").value = "";
    document.getElementById("pincode").value = "";
    document.getElementById("country").value = "";
    return;
  }

  // Make an Axios request to get the selected address
  axios
    .get(`/checkout/address/${index}`)
    .then((response) => {
      const address = response.data;

      document.getElementById("lastName").value = address.lastName || "";
      document.getElementById("firstName").value = address.firstName || "";
      document.getElementById("email").value = address.email || "";
      document.getElementById("phoneNo").value = address.phoneNo || "";
      document.getElementById("addressLine").value = address.addressLine || "";
      document.getElementById("city").value = address.city || "";
      document.getElementById("state").value = address.state || "";
      document.getElementById("pincode").value = address.pincode || "";
      document.getElementById("country").value = address.country || "";
      document.getElementById("flatNo").value = address.flatNo || "";

      checkAddressFields();
    })
    .catch((error) => {
      console.error("Error fetching address:", error);
    });
}

function submitCheckout(event) {
  event.preventDefault(); // Prevent form from submitting the default way

  // Gather data from the form
  const userId = document.getElementById("userId").value;
  const address = {
    addressLine: document.getElementById("addressLine").value,
    city: document.getElementById("city").value,
    state: document.getElementById("state").value,
    country: document.getElementById("country").value,
    email: document.getElementById("email").value,
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    phoneNo: document.getElementById("phoneNo").value,
    pincode: parseInt(document.getElementById("pincode").value),
    flatNo: document.getElementById("flatNo").value,
  };
  const selectedPaymentMethod = document.querySelector(
    'input[name="paymentMethod"]:checked'
  ).value;
  if (selectedPaymentMethod === "cod") {
    // COD Confirmation
    Swal.fire({
      title: "Confirm Order",
      text: "Are you sure you want to place this order with Cash on Delivery?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, place order!",
    }).then((result) => {
      if (result.isConfirmed) {
        // Handle COD order placement
        handleOrderPlacement("cod", address, userId);
      }
    });
  } else if (selectedPaymentMethod === "wallet") {
    // Wallet Confirmation
    Swal.fire({
      title: "Confirm Wallet Payment",
      text: "Are you sure you want to pay using your wallet balance?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, pay with wallet!",
    }).then((result) => {
      if (result.isConfirmed) {
        // Handle Wallet payment
        handleOrderPlacement("wallet", address, userId);
      }
    });
  } else if (selectedPaymentMethod === "onlinePayment") {
    const products = JSON.parse(localStorage.getItem("cart")) || []; // Assuming cart data is stored in local storage

    // Online Payment with Razorpay
    axios
      .post("/checkout", {
        userId,
        products,
        address,
        paymentMethod: "onlinePayment",
      })
      .then((response) => {
        const data = response.data;
        if (data.message === "Proceed to payment") {
          initiateRazorpayPayment(
            data.orderId,
            data.razorpayOrderId,
            data.amount,
            data.currency,
            data.key_id
          );
        } else {
          Swal.fire("Error", data.message, "error");
        }
      })
      .catch((error) => {
        Swal.fire("Error", "A server error occurred.", "error");
      });
  }
}

function handleOrderPlacement(paymentMethod, address, userId) {
  const products = JSON.parse(localStorage.getItem("cart")) || []; // Assuming cart data is stored in local storage

  // Example function to handle order placement logic
  axios
    .post("/checkout", {
      userId,
      products,
      address,
      paymentMethod,
    })
    .then((response) => {
      const data = response.data;
      console.log(data);
      if (data.order) {
        console.log(localStorage.getItem("cart"));
        localStorage.removeItem("cart");
        console.log(localStorage.getItem("cart"));
        Swal.fire(
          "Order Placed",
          "Your order has been placed successfully.",
          "success"
        ).then(() => {
          window.location.href = "/checkout/confirmation";
        });
      } else {
        Swal.fire(
          "Error",
          "An error occurred while placing your order.",
          "error"
        );
      }
    })
    .catch((error) => {
      Swal.fire("Error", "A server error occurred.", "error");
    });
}

function initiateRazorpayPayment(
  orderId,
  razorpayOrderId,
  amount,
  currency,
  key_id
) {
  var options = {
    key: key_id,
    amount: amount,
    currency: currency,
    name: "Zodge Premium Watches",
    description: "Order Payment",
    order_id: razorpayOrderId,
    handler: function (response) {
      // Call your backend to verify payment
      axios
        .post("/checkout/verify-payment", {
          orderId: orderId,
          razorpayOrderId: razorpayOrderId,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        })
        .then((response) => {
          const data = response.data;
          if (data.message === "Payment verified successfully.") {
            Swal.fire("Success", "Payment successful!", "success").then(() => {
              console.log(localStorage.getItem("cart"));
              localStorage.removeItem("cart");
              console.log(localStorage.getItem("cart"));
              window.location.href = "/checkout/confirmation";
            });
          } else {
            Swal.fire("Error", "Payment verification failed.", "error");
          }
        })
        .catch((error) => {
          Swal.fire(
            "Error",
            "Server error occurred during payment verification.",
            "error"
          );
        });
    },
    prefill: {
      name: "<%= user.name %>",
      email: "<%= user.email %>",
      contact: "<%= user.contact %>",
    },
    theme: {
      color: "#3399cc",
    },
  };

  var paymentObject = new Razorpay(options);
  paymentObject.open();
}
