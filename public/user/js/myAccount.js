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
  email: {
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
].forEach((input) => {
  input.addEventListener("input", () => {
    // Validate the field based on its ID
    const fieldName = input.id;
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
  ].every((input) => input.classList.contains("is-valid"));

  if (allValid) {
    const userId = document.getElementById("editUserId").value;
    const data = {
      userId,
      addressFirstname: addressFirstnameInput.value,
      addressLastName: addressLastNameInput.value,
      phoneNo: phoneNoInput.value,
      email: emailInput.value,
      addressLine: addressLineInput.value,
      pincode: pincodeInput.value,
      state: stateInput.value,
      country: countryInput.value,
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
