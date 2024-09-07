// Function to handle address creation
document
  .getElementById("createAddress")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const userId = document.getElementById("userId").value;
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("secondName").value;
    const phoneNo = document.getElementById("phoneNo").value;
    const email = document.getElementById("AddressEmail").value;
    const addressLine = document.getElementById("addressLine").value;
    const pincode = document.getElementById("pincode").value;
    const state = document.getElementById("state").value;
    const country = document.getElementById("country").value;
    const city = document.getElementById("city").value;
    const flatNo = document.getElementById("flatNo").value;
    const data = {
      userId,
      firstName,
      lastName,
      phoneNo,
      email,
      addressLine,
      pincode,
      state,
      country,
      city,
      flatNo,
    };

    axios
      .post("/profile/address", data)
      .then((response) => {
        if (response.status === 201) {
          Swal.fire("Success", "Address created successfully!", "success").then(
            () => {
              location.reload();
            }
          );
        } else {
          Swal.fire("Error", "Failed to create address", "error");
        }
      })
      .catch((error) => {
        Swal.fire("Error", "Address creation failed", "error");
      });
  });

// Function to handle profile editing
document
  .getElementById("editProfileForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    const userId = document.getElementById("userId").value;

    const data = {
      firstName: document.getElementById("profileFirstName").value,
      lastName: document.getElementById("profileLastName").value,
    };

    try {
      const response = await axios.patch(`/profile/personal/${userId}`, data);
      if (response.status === 200) {
        Swal.fire("Success", "Profile updated successfully!", "success").then(
          () => {
            window.location.reload();
          }
        );
      } else {
        Swal.fire("Error", "Failed to update profile", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Profile update failed", "error");
    }
  });

// Function to handle address editing
document
  .getElementById("editAddress")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const addressId = document.getElementById("addressId").value;
    const userId = document.getElementById("userId").value;
    const firstName = document.getElementById("editFirstName").value;
    const lastName = document.getElementById("editLastName").value;
    const addressLine = document.getElementById("editAddressLine").value;
    const city = document.getElementById("editCity").value;
    const state = document.getElementById("editState").value;
    const pincode = document.getElementById("editZipCode").value;
    const country = document.getElementById("editCountry").value;
    const phoneNo = document.getElementById("editPhone").value;
    const flatNo = document.getElementById("editFlatNo").value;
    console.log("address = ", addressId);

    const addressData = {
      userId,
      firstName,
      lastName,
      addressLine,
      city,
      state,
      pincode,
      phoneNo,
      country,
      flatNo,
    };

    try {
      const response = await axios.put(
        `/profile/address/${addressId}`,
        addressData
      );
      Swal.fire("Success", "Address updated successfully!", "success").then(
        () => {
          location.reload();
        }
      );
    } catch (error) {
      Swal.fire("Error", "Address update failed", "error");
    }
  });

// Function to delete the address with confirmation
function deleteAddress(addressId) {
  Swal.fire({
    title: "Are you sure?",
    text: "You will not be able to recover this address!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "No, cancel",
  }).then((result) => {
    if (result.isConfirmed) {
      axios
        .delete(`/profile/address/${addressId}`)
        .then(() => {
          document
            .querySelector(`[data-address-id='${addressId}']`)
            .closest(".list-group-item")
            .remove();
          Swal.fire("Deleted!", "Your address has been deleted.", "success");
        })
        .catch(() => {
          Swal.fire("Error", "Failed to delete the address", "error");
        });
    }
  });
}

// Function to cancel order with confirmation
function cancelOrder(orderId) {
  Swal.fire({
    title: "Are you sure?",
    text: "You will not be able to undo this action!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, cancel it!",
    cancelButtonText: "No, keep it",
  }).then((result) => {
    if (result.isConfirmed) {
      axios
        .patch(`/profile/orders/${orderId}/cancel`)
        .then((response) => {
          const updatedStatus = response.data.order.orderStatus;
          if (updatedStatus === "cancelled") {
            document.getElementById("cancelButton").style.display = "none";
            Swal.fire(
              "Cancelled!",
              "Your order has been cancelled.",
              "success"
            );
          }
        })
        .catch((error) => {
          Swal.fire("Error", "Failed to cancel the order", "error");
        });
    }
  });
}

// Function to handle the return order process
function openReturnModal(orderId) {
  document.getElementById("orderIdForReturn").value = orderId;
}

function submitReturn() {
  const orderId = document.getElementById("orderIdForReturn").value;
  const returnReason = document.getElementById("returnReason").value;

  if (!returnReason) {
    Swal.fire("Warning", "Please enter a return reason.", "warning");
    return;
  }

  axios
    .patch(`/profile/orders/${orderId}/return`, { returnReason })
    .then((response) => {
      const updatedStatus = response.data.order.returnDetails.returnStatus;
      if (updatedStatus === "requested") {
        document.getElementById("returnButton").style.display = "none";
      }
      Swal.fire(
        "Success",
        "Return request submitted successfully!",
        "success"
      ).then(() => {
        var returnReasonModal = new bootstrap.Modal(
          document.getElementById("returnReasonModal")
        );
        returnReasonModal.hide();
      });
    })
    .catch(() => {
      Swal.fire("Error", "Failed to submit return request", "error");
    });
}

// Function to reset password
document
  .getElementById("resetPassword")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const email = document.getElementById("email").value;

    axios
      .post("/auth/reset-password", { email })
      .then((response) => {
        Swal.fire("Success", response.data.message, "success");
      })
      .catch((error) => {
        Swal.fire(
          "Error",
          error.response.data.message || "Error resetting password",
          "error"
        );
      });
  });

// Sidebar navigation functionality
document.addEventListener("DOMContentLoaded", function () {
  const personalDetailsLink = document.getElementById("personal-details-link");
  const addressesLink = document.getElementById("addresses-link");
  const ordersLink = document.getElementById("orders-link");
  const forgotPasswordLink = document.getElementById("forgot-password-link");

  const personalDetailsSection = document.getElementById("personal-details");
  const addressesSection = document.getElementById("addresses");
  const ordersSection = document.getElementById("orders");
  const forgotPasswordSection = document.getElementById("forgot-password");

  personalDetailsLink.addEventListener("click", function () {
    personalDetailsSection.classList.remove("d-none");
    addressesSection.classList.add("d-none");
    ordersSection.classList.add("d-none");
    forgotPasswordSection.classList.add("d-none");
    updateActiveNavLink(personalDetailsLink);
  });

  addressesLink.addEventListener("click", function () {
    personalDetailsSection.classList.add("d-none");
    addressesSection.classList.remove("d-none");
    ordersSection.classList.add("d-none");
    forgotPasswordSection.classList.add("d-none");
    updateActiveNavLink(addressesLink);
  });

  ordersLink.addEventListener("click", function () {
    personalDetailsSection.classList.add("d-none");
    addressesSection.classList.add("d-none");
    ordersSection.classList.remove("d-none");
    forgotPasswordSection.classList.add("d-none");
    updateActiveNavLink(ordersLink);
  });

  forgotPasswordLink.addEventListener("click", function () {
    personalDetailsSection.classList.add("d-none");
    addressesSection.classList.add("d-none");
    ordersSection.classList.add("d-none");
    forgotPasswordSection.classList.remove("d-none");
    updateActiveNavLink(forgotPasswordLink);
  });

  function updateActiveNavLink(activeLink) {
    document.querySelectorAll(".nav-link").forEach(function (link) {
      link.classList.remove("active");
    });
    activeLink.classList.add("active");
  }
});

// Populate modal fields with address data
var addressModal = document.getElementById("editAddressModal");
addressModal.addEventListener("show.bs.modal", function (event) {
  var button = event.relatedTarget;
  var addressId = button.getAttribute("data-address-id");
  var firstName = button.getAttribute("data-address-first-name");
  var lastName = button.getAttribute("data-address-last-name");
  var addressLine = button.getAttribute("data-address-line1");
  var city = button.getAttribute("data-address-city");
  var state = button.getAttribute("data-address-state");
  var zipCode = button.getAttribute("data-address-zip");
  var country = button.getAttribute("data-address-country");
  var phone = button.getAttribute("data-address-phone");
  var flat = button.getAttribute("data-address-flat");

  var modal = addressModal.querySelector("form");
  modal.querySelector("#addressId").value = addressId;
  modal.querySelector("#editFirstName").value = firstName;
  modal.querySelector("#editLastName").value = lastName;
  modal.querySelector("#editAddressLine").value = addressLine;
  modal.querySelector("#editCity").value = city;
  modal.querySelector("#editState").value = state;
  modal.querySelector("#editZipCode").value = zipCode;
  modal.querySelector("#editCountry").value = country;
  modal.querySelector("#editPhone").value = phone;
  modal.querySelector("#editFlatNo").value = flat;
});

var personalDetailsModal = document.getElementById("editPersonalDetailsModal");
personalDetailsModal.addEventListener("show.bs.modal", function (event) {
  var button = event.relatedTarget;
  var userId = button.getAttribute("data-user-id");
  var firstName = button.getAttribute("data-user-first-name");
  var lastName = button.getAttribute("data-user-last-name");

  var modal = personalDetailsModal.querySelector("form");
  modal.querySelector("#editUserId").value = userId;
  modal.querySelector("#profileFirstName").value = firstName;
  modal.querySelector("#profileLastName").value = lastName;
});
