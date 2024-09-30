const form = document.getElementById("editProfileForm");
const firstNameInput = form.profileFirstName;
const lastNameInput = form.profileLastName;

// Function to validate an input field
function validateNameField(input) {
  const feedback = input.nextElementSibling; // Get the invalid feedback div
  if (!input.value.trim()) {
    input.classList.add("is-invalid");
    input.classList.remove("is-valid");
    feedback.style.display = "block"; // Show feedback
  } else {
    input.classList.add("is-valid");
    input.classList.remove("is-invalid");
    feedback.style.display = "none"; // Hide feedback
  }
}

// Real-time validation
firstNameInput.addEventListener("input", () =>
  validateNameField(firstNameInput)
);
lastNameInput.addEventListener("input", () => validateNameField(lastNameInput));

// Form submission with final validation
form.addEventListener("submit", async function (event) {
  event.preventDefault(); // Prevent the default form submission

  // Reset validity state
  validateNameField(firstNameInput);
  validateNameField(lastNameInput);

  // Proceed with Axios request if the form is valid
  if (
    firstNameInput.classList.contains("is-valid") &&
    lastNameInput.classList.contains("is-valid")
  ) {
    const userId = document.getElementById("editUserId").value;
    const data = {
      firstName: firstNameInput.value,
      lastName: lastNameInput.value,
    };

    console.log("data = ", data);

    try {
      const response = await axios.patch(`/profile/personal/${userId}`, data);
      if (response.status === 200) {
        Swal.fire("Success", response.data.message, "success").then(() => {
          window.location.reload();
        });
      } else {
        Swal.fire("Error", "Failed to update profile", "error");
      }
    } catch (error) {
      Swal.fire("Error", error.response.data.message, "error");
    }
  }
});

//create address
// Function to handle address creation
const createAddressForm = document.getElementById("createAddress");
const addressFirstnameInput = document.getElementById("addressFirstname");
const addressLastNameInput = document.getElementById("addressLastName");
const phoneNoInput = document.getElementById("phoneNo");
const emailInput = document.getElementById("addressEmail");
const addressLineInput = document.getElementById("addressLine");
const pincodeInput = document.getElementById("pincode");
const stateInput = document.getElementById("state");
const countryInput = document.getElementById("country");
const cityInput = document.getElementById("city");
const flatNoInput = document.getElementById("flatNo");
// Add more input fields as necessary...

// Define regex patterns and error messages for each field
const patterns = {
  addressFirstname: {
    regex: /^[a-zA-Z\s]+$/,
    errorMessage: "First name can only contain letters and spaces.",
  },
  addressLastName: {
    regex: /^[a-zA-Z\s]*$/, // Optional
    errorMessage: "Last name can only contain letters and spaces.",
  },
  phoneNo: {
    regex: /^[0-9]{10}$/, // 10 digits
    errorMessage: "Phone number must be exactly 10 digits.",
  },
  addressEmail: {
    regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    errorMessage: "Please enter a valid email address.",
  },
  addressLine: {
    regex: /.+/,
    errorMessage: "Address line is required.",
  },
  pincode: {
    regex: /^[0-9]{6}$/, // Assuming 6 digits
    errorMessage: "Pincode must be exactly 6 digits.",
  },
  state: {
    regex: /.+/,
    errorMessage: "State is required.",
  },
  country: {
    regex: /.+/,
    errorMessage: "Country is required.",
  },
  city: {
    regex: /^[a-zA-Z\s]+$/,
    errorMessage: "City can only contain letters and spaces.",
  },
};

// Function to validate an input field
function validateField(input, regex, errorMessage) {
  if (!input.value.trim() || !regex.test(input.value.trim())) {
    input.classList.add("is-invalid");
    input.classList.remove("is-valid");
    input.setCustomValidity(errorMessage); // Set the custom error message
  } else {
    input.classList.add("is-valid");
    input.classList.remove("is-invalid");
    input.setCustomValidity(""); // Clear any custom error message
  }
}

// Real-time validation
[
  addressFirstnameInput,
  addressLastNameInput,
  phoneNoInput,
  emailInput,
  addressLineInput,
  pincodeInput,
  stateInput,
  countryInput,
  cityInput,
].forEach((input) => {
  input.addEventListener("input", () => {
    // Validate the field based on its ID
    const fieldName = input.id;
    console.log(input.id);
    if (patterns[fieldName]) {
      validateField(
        input,
        patterns[fieldName].regex,
        patterns[fieldName].errorMessage
      );
    }
  });
});

// Form submission with final validation
createAddressForm.addEventListener("submit", async function (event) {
  event.preventDefault(); // Prevent the default form submission

  // Validate all fields before submission
  [
    addressFirstnameInput,
    addressLastNameInput,
    phoneNoInput,
    emailInput,
    addressLineInput,
    pincodeInput,
    stateInput,
    countryInput,
    cityInput,
  ].forEach((input) => {
    const fieldName = input.id;
    if (patterns[fieldName]) {
      validateField(
        input,
        patterns[fieldName].regex,
        patterns[fieldName].errorMessage
      );
    }
  });

  // Proceed with Axios request if all fields are valid
  const allValid = [
    addressFirstnameInput,
    addressLastNameInput,
    phoneNoInput,
    emailInput,
    addressLineInput,
    pincodeInput,
    stateInput,
    countryInput,
    cityInput,
  ].every((input) => input.classList.contains("is-valid"));

  if (allValid) {
    const userId = document.getElementById("editUserId").value;
    const data = {
      userId,
      firstName: addressFirstnameInput.value,
      lastName: addressLastNameInput.value,
      phoneNo: phoneNoInput.value,
      email: emailInput.value,
      addressLine: addressLineInput.value,
      pincode: pincodeInput.value,
      state: stateInput.value,
      country: countryInput.value,
      city: cityInput.value,
      flatNo: flatNoInput.value,
      // Add additional fields here...
    };

    try {
      const response = await axios.post("/profile/address", data);
      if (response.status === 201) {
        Swal.fire("Success", response.data.message, "success").then(() => {
          location.reload();
        });
      } else {
        Swal.fire("Error", "Failed to create address", "error");
      }
    } catch (error) {
      Swal.fire("Error", error.response.data.message, "error");
    }
  }
});

//edit address part
function populateEditAddressForm(button) {
  // Get data from the button's data-* attributes
  const addressId = button.getAttribute("data-address-id");
  const firstName = button.getAttribute("data-first-name");
  const lastName = button.getAttribute("data-last-name");
  const phoneNo = button.getAttribute("data-phone-no");
  const email = button.getAttribute("data-email");
  const addressLine = button.getAttribute("data-address-line");
  const pincode = button.getAttribute("data-pincode");
  const state = button.getAttribute("data-state");
  const country = button.getAttribute("data-country");
  const city = button.getAttribute("data-city");
  const flatNo = button.getAttribute("data-flat-no");

  // Populate form fields with the data
  document.getElementById("addressId").value = addressId;
  document.getElementById("editFirstName").value = firstName;
  document.getElementById("editLastName").value = lastName;
  document.getElementById("editPhoneNo").value = phoneNo;
  document.getElementById("editAddressEmail").value = email;
  document.getElementById("editAddressLine").value = addressLine;
  document.getElementById("editPincode").value = pincode;
  document.getElementById("editState").value = state;
  document.getElementById("editCountry").value = country;
  document.getElementById("editCity").value = city;
  document.getElementById("editFlatNo").value = flatNo || "";
}

// Define regex patterns and error messages for edit address fields
const editPatterns = {
  editFirstName: {
    regex: /^[a-zA-Z\s]+$/,
    errorMessage: "First name can only contain letters and spaces.",
  },
  editLastName: {
    regex: /^[a-zA-Z\s]*$/, // Optional
    errorMessage: "Last name can only contain letters and spaces.",
  },
  editPhoneNo: {
    regex: /^[0-9]{10}$/, // 10 digits
    errorMessage: "Phone number must be exactly 10 digits.",
  },
  editAddressEmail: {
    regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    errorMessage: "Please enter a valid email address.",
  },
  editAddressLine: {
    regex: /.+/,
    errorMessage: "Address line is required.",
  },
  editPincode: {
    regex: /^[0-9]{6}$/, // Assuming 6 digits
    errorMessage: "Pincode must be exactly 6 digits.",
  },
  editState: {
    regex: /.+/,
    errorMessage: "State is required.",
  },
  editCountry: {
    regex: /.+/,
    errorMessage: "Country is required.",
  },
  editCity: {
    regex: /^[a-zA-Z\s]+$/,
    errorMessage: "City can only contain letters and spaces.",
  },
};

// Function to validate an input field (same as in create address)
function validateEditField(input, regex, errorMessage) {
  if (!input.value.trim() || !regex.test(input.value.trim())) {
    input.classList.add("is-invalid");
    input.classList.remove("is-valid");
    input.setCustomValidity(errorMessage); // Set the custom error message
  } else {
    input.classList.add("is-valid");
    input.classList.remove("is-invalid");
    input.setCustomValidity(""); // Clear any custom error message
  }
}

// Real-time validation for edit address
[
  "editFirstName",
  "editLastName",
  "editPhoneNo",
  "editAddressEmail",
  "editAddressLine",
  "editPincode",
  "editState",
  "editCountry",
  "editCity",
].forEach((id) => {
  const input = document.getElementById(id);
  input.addEventListener("input", () => {
    // Validate the field based on its ID
    if (editPatterns[id]) {
      validateEditField(
        input,
        editPatterns[id].regex,
        editPatterns[id].errorMessage
      );
    }
  });
});

// Form submission with final validation
document
  .getElementById("editAddress")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    // Validate all fields before submission
    [
      "editFirstName",
      "editLastName",
      "editPhoneNo",
      "editAddressEmail",
      "editAddressLine",
      "editPincode",
      "editState",
      "editCountry",
      "editCity",
    ].forEach((id) => {
      const input = document.getElementById(id);
      if (editPatterns[id]) {
        validateEditField(
          input,
          editPatterns[id].regex,
          editPatterns[id].errorMessage
        );
      }
    });

    // Proceed with Axios request if all fields are valid
    const allValid = [
      "editFirstName",
      "editLastName",
      "editPhoneNo",
      "editAddressEmail",
      "editAddressLine",
      "editPincode",
      "editState",
      "editCountry",
      "editCity",
    ].every((id) => document.getElementById(id).classList.contains("is-valid"));

    if (allValid) {
      const addressId = document.getElementById("addressId").value;
      const userId = document.getElementById("editUserId").value;
      const data = {
        userId,
        firstName: document.getElementById("editFirstName").value,
        lastName: document.getElementById("editLastName").value,
        phoneNo: document.getElementById("editPhoneNo").value,
        email: document.getElementById("editAddressEmail").value,
        addressLine: document.getElementById("editAddressLine").value,
        pincode: document.getElementById("editPincode").value,
        state: document.getElementById("editState").value,
        country: document.getElementById("editCountry").value,
        city: document.getElementById("editCity").value,
        flatNo: document.getElementById("editFlatNo").value,
      };

      try {
        const response = await axios.put(`/profile/address/${addressId}`, data);
        if (response.status === 200) {
          Swal.fire("Success", response.data.message, "success").then(() => {
            location.reload();
          });
        } else {
          Swal.fire("Error", "Failed to update address", "error");
        }
      } catch (error) {
        Swal.fire("Error", error.response.data.message, "error");
      }
    }
  });

//delete address part
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
        .then((response) => {
          console.log(response.data.success);
          if (response.data.success) {
            Swal.fire("Deleted!", response.data.message, "success").then(() => {
              location.reload();
            });
          } else {
            Swal.fire("Error", "Failed to delete the address", "error");
          }
        })
        .catch((error) => {
          Swal.fire("Error", error.response.data.message, "error");
        });
    }
  });
}
