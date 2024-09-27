// productManagement.js
import validationUtils from "./validationUtils.js";
// Function to submit the product form

function submitProductForm() {
  const submitButton = document.querySelector(
    '#createProductForm button[type="submit"]'
  );
  submitButton.disabled = true;

  const formData = new FormData();
  formData.append("name", document.getElementById("createProductName").value);
  formData.append(
    "description",
    document.getElementById("createProductDescription").value
  );
  formData.append(
    "categoryId",
    document.getElementById("createProductCategory").value
  );
  formData.append("price", document.getElementById("createProductPrice").value);
  formData.append("stock", document.getElementById("createProductStock").value);

  croppedImages.forEach((image, index) => {
    formData.append("images", image, `croppedImage${index + 1}.png`);
  });

  axios
    .post("/admin/products/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((response) => {
      if (response.status === 200) {
        // Show success message
        Swal.fire({
          title: "Success!",
          text: "Product created successfully!",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          // Reload the page after success
          window.location.reload();
        });

        $("#createProductModal").modal("hide");
      } else {
        Swal.fire({
          title: "Error!",
          text: "Failed to create product.",
          icon: "error",
          confirmButtonText: "OK",
        });
        submitButton.disabled = false;
      }
    })
    .catch((error) => {
      console.error("Error creating product:", error);
      Swal.fire({
        title: "Error!",
        text: "Product creation failed.",
        icon: "error",
        confirmButtonText: "OK",
      });
      submitButton.disabled = false;
    });
}

// Form validation and submission
// Real-time validation for product creation form fields
document
  .getElementById("createProductName")
  .addEventListener("input", function () {
    validationUtils.validateRequiredField(this, "Product name is required.");
  });

document
  .getElementById("createProductDescription")
  .addEventListener("input", function () {
    validationUtils.validateRequiredField(
      this,
      "Product description is required."
    );
  });

document
  .getElementById("createProductCategory")
  .addEventListener("change", function () {
    validationUtils.validateSelect(this, "Please select a category.");
  });

document
  .getElementById("createProductPrice")
  .addEventListener("input", function () {
    validationUtils.validateNumber(this, "Price must be greater than zero.");
  });

document
  .getElementById("createProductStock")
  .addEventListener("input", function () {
    validationUtils.validateNumber(this, "Stock must be greater than zero.");
  });

// Real-time validation for product images
document
  .getElementById("createProductImages")
  .addEventListener("change", function () {
    validationUtils.validateImageCount(
      this,
      3,
      "Please upload at least 3 images."
    );
  });

// Form validation on submit
document
  .getElementById("createProductForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const isValid = validationUtils.validateForm("createProductForm", [
      {
        id: "createProductName",
        type: "required",
        message: "Product name is required.",
      },
      {
        id: "createProductDescription",
        type: "required",
        message: "Product description is required.",
      },
      {
        id: "createProductCategory",
        type: "select",
        message: "Please select a category.",
      },
      {
        id: "createProductPrice",
        type: "required",
        message: "Price is required.",
      },
      {
        id: "createProductStock",
        type: "required",
        message: "Stock is required.",
      },
      {
        id: "createProductImages",
        type: "imageCount",
        minCount: 3,
        message: "Please upload at least 3 images.",
      },
    ]);

    if (isValid) {
      // Form is valid, proceed to submit or further actions
      submitProductForm(); // Example function for submitting the form
    } else {
      Swal.fire({
        title: "Error!",
        text: "Please correct the highlighted errors.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  });

//for create product and image cropping
const cropperInstances = [];
const croppedImages = [];

// Handle file input and initialize croppers
document
  .getElementById("createProductImages")
  .addEventListener("change", function (event) {
    const files = event.target.files;
    const cropperContainers = document.getElementById("cropperContainers");
    cropperContainers.innerHTML = ""; // Clear previous croppers

    if (files.length < 3) {
      document.getElementById("imageError").textContent =
        "Please select at least 3 images.";
      document.querySelector(
        '#createProductForm button[type="submit"]'
      ).disabled = true;
      return;
    }
    document.getElementById("imageError").textContent = "";
    document.querySelector(
      '#createProductForm button[type="submit"]'
    ).disabled = false;

    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      const cropperContainerId = `cropper-container-${i + 1}`;
      const cropperImgId = `imageCrop${i + 1}`;
      const cropBtnId = `cropImageBtn${i + 1}`;

      // Create cropper container
      const cropperContainer = document.createElement("div");
      cropperContainer.className = "col-md-4 mb-3";
      cropperContainer.id = cropperContainerId;
      cropperContainer.innerHTML = `
      <label for="${cropperImgId}">Image ${i + 1}</label>
      <img id="${cropperImgId}" style="max-width: 100%;" />
      <button type="button" class="btn btn-primary mt-2" id="${cropBtnId}">Crop</button>
    `;
      cropperContainers.appendChild(cropperContainer);

      reader.onload = function (e) {
        document.getElementById(cropperImgId).src = e.target.result;

        const cropper = new Cropper(document.getElementById(cropperImgId), {
          aspectRatio: 1, // Change the aspect ratio as needed
          viewMode: 2,
        });

        cropperInstances.push(cropper);
      };
      reader.readAsDataURL(files[i]);

      // Handle cropping for each image
      document.getElementById(cropBtnId).addEventListener("click", function () {
        const cropper = cropperInstances[i];
        const canvas = cropper.getCroppedCanvas();

        canvas.toBlob(function (blob) {
          croppedImages[i] = blob;
          alert(`Image ${i + 1} cropped and saved!`);
        }, "image/png");
      });
    }
  });

//for edit the product
const editCropperInstances = [];
const editCroppedImages = [];

// Fetch and display product details when edit button is clicked
function openEditProductModal(productId) {
  axios
    .get(`/admin/products/details/${productId}`)
    .then((response) => {
      const product = response.data;
      document.getElementById("editProductId").value = product._id;
      document.getElementById("editProductName").value = product.name;
      document.getElementById("editProductDescription").value =
        product.description;
      document.getElementById("editProductCategory").value = product.categoryId;
      document.getElementById("editProductPrice").value = product.price;
      document.getElementById("editProductStock").value = product.stock;

      // Display existing images
      const existingImagesContainer = document.getElementById(
        "existingImagesContainer"
      );
      existingImagesContainer.innerHTML = "";
      product.images.forEach((image) => {
        const imgElement = document.createElement("img");
        imgElement.src = `/public/uploads/${image}`;
        imgElement.style.maxWidth = "100px";
        imgElement.className = "mr-2 mb-2";
        existingImagesContainer.appendChild(imgElement);
      });

      // Clear previous croppers
      editCropperInstances.length = 0;
      editCroppedImages.length = 0;
      document.getElementById("editCropperContainers").innerHTML = "";
      document.getElementById("imageError").textContent = "";
      document.querySelector(
        '#editProductForm button[type="submit"]'
      ).disabled = false;

      // Open the modal
      $("#editProductModal").modal("show");
    })
    .catch((error) => {
      console.error("Error fetching product details:", error);
    });
}

// Event listener for edit buttons
document.querySelectorAll("#editClick").forEach((button) => {
  button.addEventListener("click", function () {
    const productId = this.getAttribute("data-id");
    openEditProductModal(productId);
  });
});

// Handle new file input and initialize croppers
document
  .getElementById("editProductImages")
  .addEventListener("change", function (event) {
    const files = event.target.files;
    const cropperContainers = document.getElementById("editCropperContainers");
    cropperContainers.innerHTML = ""; // Clear previous croppers

    if (files.length > 0) {
      document.getElementById("imageError").textContent = "";
      document.querySelector(
        '#editProductForm button[type="submit"]'
      ).disabled = false;

      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        const cropperContainerId = `edit-cropper-container-${i + 1}`;
        const cropperImgId = `editImageCrop${i + 1}`;
        const cropBtnId = `editCropImageBtn${i + 1}`;

        // Create cropper container
        const cropperContainer = document.createElement("div");
        cropperContainer.className = "col-md-4 mb-3";
        cropperContainer.id = cropperContainerId;
        cropperContainer.innerHTML = `
          <label for="${cropperImgId}">Image ${i + 1}</label>
          <img id="${cropperImgId}" style="max-width: 100%;" />
          <button type="button" class="btn btn-primary mt-2" id="${cropBtnId}">Crop</button>
        `;
        cropperContainers.appendChild(cropperContainer);

        reader.onload = function (e) {
          document.getElementById(cropperImgId).src = e.target.result;

          const cropper = new Cropper(document.getElementById(cropperImgId), {
            aspectRatio: 1, // Change the aspect ratio as needed
            viewMode: 2,
          });

          editCropperInstances.push(cropper);
        };
        reader.readAsDataURL(files[i]);

        // Handle cropping for each image
        document
          .getElementById(cropBtnId)
          .addEventListener("click", function () {
            const cropper = editCropperInstances[i];
            const canvas = cropper.getCroppedCanvas();

            canvas.toBlob(function (blob) {
              editCroppedImages[i] = blob;
              alert(`Image ${i + 1} cropped and saved!`);
            }, "image/png");
          });
      }
    }
  });

// Function to validate edit product form
// Real-time validation for input fields
document
  .getElementById("editProductName")
  .addEventListener("input", function () {
    validationUtils.validateRequiredField(this, "Product name is required.");
  });

document
  .getElementById("editProductDescription")
  .addEventListener("input", function () {
    validationUtils.validateRequiredField(
      this,
      "Product description is required."
    );
  });

document
  .getElementById("editProductCategory")
  .addEventListener("change", function () {
    validationUtils.validateSelect(this, "Please select a category.");
  });

document
  .getElementById("editProductPrice")
  .addEventListener("input", function () {
    validationUtils.validateNumber(this, "Price must be greater than zero.");
  });

document
  .getElementById("editProductStock")
  .addEventListener("input", function () {
    validationUtils.validateNumber(this, "Stock must be greater than zero.");
  });

// Real-time validation for product images
// document
//   .getElementById("editProductImages")
//   .addEventListener("change", function () {
//     validationUtils.validateImageCount(
//       this,
//       3,
//       "Please upload at least 3 images."
//     );
// });

// Form validation on submit for edit product form
document
  .getElementById("editProductForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const isValid = validationUtils.validateForm("editProductForm", [
      {
        id: "editProductName",
        type: "required",
        message: "Product name is required.",
      },
      {
        id: "editProductDescription",
        type: "required",
        message: "Product description is required.",
      },
      {
        id: "editProductCategory",
        type: "select",
        message: "Please select a category.",
      },
      {
        id: "editProductPrice",
        type: "required",
        message: "Price is required.",
      },
      {
        id: "editProductStock",
        type: "required",
        message: "Stock is required.",
      },
      // {
      //   id: "editProductImages",
      //   type: "imageCount",
      //   minCount: 3,
      //   message: "Please upload at least 3 images.",
      // },
    ]);

    if (isValid) {
      // If valid, proceed to submit
      submitEditProductForm(); // Example function for submitting the form
    } else {
      Swal.fire({
        title: "Error!",
        text: "Please correct the highlighted errors.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  });

// Function to handle form submission
function submitEditProductForm() {
  // // Validate form fields
  // if (!validateEditProductForm()) {
  //   return; // Stop the submission if validation fails
  // }

  const formData = new FormData();
  formData.append("name", document.getElementById("editProductName").value);
  formData.append(
    "description",
    document.getElementById("editProductDescription").value
  );
  formData.append(
    "categoryId",
    document.getElementById("editProductCategory").value
  );
  formData.append("price", document.getElementById("editProductPrice").value);
  formData.append("stock", document.getElementById("editProductStock").value);

  editCroppedImages.forEach((image, index) => {
    formData.append("images", image, `croppedImage${index + 1}.png`);
  });

  axios
    .put(
      `/admin/products/edit/${document.getElementById("editProductId").value}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
    .then((response) => {
      if (response.status === 200) {
        // $("#editProductModal").modal("hide");
        Swal.fire({
          title: "Updated",
          text: "The Product is updated successfully",
          icon: "success",
          confirmButtonText: "OK",
        });
      } else {
        alert("Failed to update product");
      }
    })
    .catch((error) => {
      console.error("Error updating product:", error);
      alert("Product update failed");
    });
}

// Handle edit product modal
$("#editProductModal").on("show.bs.modal", function (event) {
  const button = $(event.relatedTarget);
  const id = button.data("id");
  const name = button.data("name");
  const description = button.data("description");
  const category = button.data("category");
  const price = button.data("price");
  const stock = button.data("stock");
  const images = button.data("images");

  const modal = $(this);
  modal.find("#editProductId").val(id);
  modal.find("#editProductName").val(name);
  modal.find("#editProductDescription").val(description);
  modal.find("#editProductCategory").val(category);
  modal.find("#editProductPrice").val(price);
  modal.find("#editProductStock").val(stock);
  modal.find("#editProductImages").val(images);
});

// Function to update the serial numbers of the categories
function updateSINumbers() {
  const rows = document.querySelectorAll(".table tbody tr");
  rows.forEach((row, index) => {
    row.cells[0].innerText = index + 1;
  });
}
