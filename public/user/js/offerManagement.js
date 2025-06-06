import validationUtils from "./validationUtils.js";

function createOffer() {
  const applicableType = document.getElementById("applicableType").value;

  // Create a FormData object
  const formData = new FormData();
  formData.append("name", document.getElementById("offerName").value.trim()); // Append offer name
  formData.append(
    "description",
    document.getElementById("offerDescription").value.trim()
  ); // Append description
  formData.append(
    "discountValue",
    document.getElementById("discountValue").value.trim()
  ); // Append discount value
  formData.append("applicableType", applicableType); // Append applicable type
  formData.append("isActive", true); // Append active status

  // Append the selected image file
  const offerImage = document.getElementById("offerImage").files[0];
  if (offerImage) {
    formData.append("offerImage", offerImage); // Append the image file
  } else {
    alert("Please select an offer image."); // Alert if no image is selected
    return; // Prevent submission if no image is selected
  }

  // Collect selected IDs
  Array.from(
    document.querySelectorAll("#applicableItems input:checked")
  ).forEach((input) => {
    if (applicableType === "category") {
      formData.append("categoryIds[]", input.value); // Append category IDs
    } else {
      formData.append("productIds[]", input.value); // Append product IDs
    }
  });

  axios
    .post("/admin/offers", formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Set content type for file upload
      },
    })
    .then(function (response) {
      if (response.data.success) {
        $("#createOfferModal").modal("hide");

        // Use SweetAlert for success notification
        Swal.fire({
          title: "Success!",
          text: "Offer created successfully.",
          icon: "success",
          confirmButtonText: "Okay",
        }).then(() => {
          window.location.reload(); // Refresh the table or data after closing the alert
        });
      } else {
        // Use SweetAlert for error notification
        Swal.fire({
          title: "Error!",
          text: "Failed to create offer: " + response.data.message,
          icon: "error",
          confirmButtonText: "Okay",
        });
      }
    })
    .catch(function (error) {
      console.error("Error creating offer:", error);

      // Use SweetAlert for server error notification
      Swal.fire({
        title: "Server Error!",
        text: "There was an error while creating the offer.",
        icon: "error",
        confirmButtonText: "Okay",
      });
    });
}

document.getElementById("offerName").addEventListener("input", function () {
  validationUtils.validateRequiredField(this, "Offer name is required.");
});

document
  .getElementById("offerDescription")
  .addEventListener("input", function () {
    validationUtils.validateRequiredField(
      this,
      "Offer description is required."
    );
  });

document.getElementById("discountValue").addEventListener("input", function () {
  validationUtils.validateNumber(
    this,
    "Discount value must be greater than zero."
  );
});

document
  .getElementById("applicableType")
  .addEventListener("change", function () {
    validationUtils.validateSelect(this, "Please select an applicable type.");
  });

// Form validation on submit
document.getElementById("offerForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const isValid = validationUtils.validateForm("offerForm", [
    {
      id: "offerName",
      type: "required",
      message: "Offer name is required.",
    },
    {
      id: "offerDescription",
      type: "required",
      message: "Offer description is required.",
    },
    {
      id: "discountValue",
      type: "required",
      message: "Discount value is required.",
    },
    {
      id: "discountValue",
      type: "nonNegative",
      message: "Discount value is required.",
    },
    {
      id: "applicableType",
      type: "select",
      message: "Please select an applicable type.",
    },
  ]);

  if (isValid) {
    // Form is valid, proceed to submit or further actions
    createOffer(); // Example function for submitting the form
  } else {
    Swal.fire({
      title: "Error!",
      text: "Please correct the highlighted errors.",
      icon: "error",
      confirmButtonText: "OK",
    });
  }
});

document
  .getElementById("applicableType")
  .addEventListener("change", function () {
    const selectedType = this.value;
    console.log(selectedType);
    populateApplicableItemsCreate(selectedType);
  });

function populateApplicableItemsCreate(type) {
  console.log("type = ", type);
  axios
    .get(`/admin/offers/api/applicable-items?type=${type}`)
    .then((response) => {
      const container = document.getElementById("applicableItems");
      container.innerHTML = ""; // Clear previous items

      response.data.items.forEach((item) => {
        const checkbox = document.createElement("div");
        checkbox.classList.add("form-check");
        checkbox.innerHTML = `
        <input class="form-check-input" type="checkbox" value="${item._id}" id="${item._id}">
        <label class="form-check-label" for="${item._id}">${item.name}</label>
      `;
        container.appendChild(checkbox);
      });
    })
    .catch((error) => {
      console.error("Error fetching applicable items:", error);
    });
}

// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", function () {
  // Select the edit buttons
  const editButtons = document.querySelectorAll("#editButton");

  // Add click event listener to each edit button
  editButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Extract data attributes from the clicked button
      const offerId = this.dataset.offerid;
      const offerImage = this.dataset.offerimage;
      const offerName = this.dataset.offername;
      const offerDescription = this.dataset.offerdescription;
      const discountValue = this.dataset.discountvalue;
      const applicableType = this.dataset.offerapplicabletype;

      // Populate the modal fields
      document.getElementById("offerId").value = offerId;
      document.getElementById("editOfferName").value = offerName;
      document.getElementById("editOfferDescription").value = offerDescription;
      document.getElementById("editOfferDiscountValue").value = discountValue;
      document.getElementById("editOfferApplicableType").value = applicableType;

      // Fetch offer data to populate the modal
      axios.get(`/admin/offers/api/offers/${offerId}`).then((response) => {
        const { offer, categories, products } = response.data;

        // Populate the form with the offer details
        document.getElementById("offerId").value = offer._id;
        document
          .getElementById("existingOfferImage")
          .setAttribute("src", `/public/user/offers/${offer.image}`);
        document.getElementById("editOfferDescription").value =
          offer.description;
        document.getElementById("editOfferDiscountValue").value =
          offer.discountValue;

        // Populate the applicable items (categories/products)
        populateApplicableItems(
          offer.applicableType,
          categories,
          products,
          offer
        );

        // Show the modal
        $("#editOfferModal").modal("show");
      });

      function populateApplicableItems(
        applicableType,
        categories,
        products,
        offer
      ) {
        const container = document.getElementById("editApplicableItems");
        container.innerHTML = ""; // Clear previous items

        const items = applicableType === "category" ? categories : products;
        const selectedIds =
          applicableType === "category"
            ? offer.categoryIds.map((cat) => cat._id)
            : offer.productIds.map((prod) => prod._id);

        items.forEach((item) => {
          const isChecked = selectedIds.includes(item._id);
          const checkbox = document.createElement("div");
          checkbox.classList.add("form-check");
          checkbox.innerHTML = `
            <input class="form-check-input" type="checkbox" value="${
              item._id
            }" id="${item._id}" ${isChecked ? "checked" : ""}>
            <label class="form-check-label" for="${item._id}">${
            item.name
          }</label>
          `;
          container.appendChild(checkbox);
        });
      }
    });
  });

  // Real-time validation
  const validationUtils = {
    validateField: function (input) {
      const id = input.id;
      const value = input.value.trim();
      let valid = true;
      let message = "";

      // Basic validation rules
      if (id === "editOfferName" || id === "editOfferDescription") {
        if (!value) {
          valid = false;
          message = `${input.placeholder} is required.`;
        }
      } else if (id === "editOfferDiscountValue") {
        if (!value || isNaN(value) || value <= 0) {
          valid = false;
          message = "Discount value must be a positive number.";
        }
      }

      // Set validation feedback
      if (valid) {
        input.classList.remove("is-invalid");
        input.classList.add("is-valid");
      } else {
        input.classList.remove("is-valid");
        input.classList.add("is-invalid");
      }

      const feedbackElement = document.getElementById(`${id}Feedback`);
      if (feedbackElement) {
        feedbackElement.innerText = message;
      }
    },
  };

  // Attach real-time validation to input fields
  const inputFields = [
    "editOfferName",
    "editOfferDescription",
    "editOfferDiscountValue",
  ];

  inputFields.forEach((fieldId) => {
    const input = document.getElementById(fieldId);
    input.addEventListener("input", function () {
      validationUtils.validateField(this);
    });
  });

  // Event listener for the save changes button
  document
    .getElementById("saveEditOfferButton")
    .addEventListener("click", function () {
      // Validate all fields before submission
      inputFields.forEach((fieldId) => {
        validationUtils.validateField(document.getElementById(fieldId));
      });

      // Check for any invalid fields
      const isFormValid = inputFields.every((fieldId) => {
        return !document
          .getElementById(fieldId)
          .classList.contains("is-invalid");
      });

      if (isFormValid) {
        editOffer(); // Call the edit offer function if all fields are valid
      } else {
        Swal.fire({
          title: "Error!",
          text: "Please correct the highlighted errors.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    });

  // Edit offer function for submission
  function editOffer() {
    const offerId = document.getElementById("offerId").value; // Get the offer ID

    // Create a FormData object
    const formData = new FormData();
    formData.append(
      "name",
      document.getElementById("editOfferName").value.trim()
    ); // Append offer name
    formData.append(
      "description",
      document.getElementById("editOfferDescription").value.trim()
    ); // Append description
    formData.append(
      "discountValue",
      document.getElementById("editOfferDiscountValue").value.trim()
    ); // Append discount value
    formData.append(
      "applicableType",
      document.getElementById("editOfferApplicableType").value
    ); // Append applicable type

    // Append the selected image file if a new image is selected
    const offerImage = document.getElementById("editOfferImage").files[0];
    if (offerImage) {
      formData.append("offerImage", offerImage); // Append the new image file
    }

    // Collect selected IDs based on the applicable type
    Array.from(
      document.querySelectorAll("#editApplicableItems input:checked")
    ).forEach((input) => {
      if (
        document.getElementById("editOfferApplicableType").value === "category"
      ) {
        formData.append("categoryIds[]", input.value); // Append category IDs
      } else {
        formData.append("productIds[]", input.value); // Append product IDs
      }
    });

    // Send a PUT request to update the offer using Axios
    axios
      .patch(`/admin/offers/${offerId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Set content type for file upload
        },
      })
      .then(function (response) {
        if (response.data.success) {
          $("#editOfferModal").modal("hide");

          // Use SweetAlert for success notification
          Swal.fire({
            title: "Success!",
            text: "Offer updated successfully.",
            icon: "success",
            confirmButtonText: "Okay",
          }).then(() => {
            window.location.reload(); // Refresh the page after closing the alert
          });
        } else {
          // Use SweetAlert for error notification
          Swal.fire({
            title: "Error!",
            text: "Failed to update offer: " + response.data.message,
            icon: "error",
            confirmButtonText: "Okay",
          });
        }
      })
      .catch(function (error) {
        console.error("Error updating offer:", error);

        // Use SweetAlert for server error notification
        Swal.fire({
          title: "Server Error!",
          text: "There was an error while updating the offer.",
          icon: "error",
          confirmButtonText: "Okay",
        });
      });
  }
});
