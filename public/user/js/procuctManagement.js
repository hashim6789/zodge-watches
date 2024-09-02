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

// Handle form submission
document
  .getElementById("createProductForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

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
    formData.append(
      "price",
      document.getElementById("createProductPrice").value
    );
    formData.append(
      "stock",
      document.getElementById("createProductStock").value
    );

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
          const newProduct = response.data.data.newProduct; // Assuming the new product data is returned in this format
          const category = response.data.data.category;
          // Extract product details from the response
          const productName = newProduct.name;
          const productCategory = category ? category.name : "Unknown"; // Ensure category is handled correctly
          const productPrice = newProduct.price;
          const productStock = newProduct.stock;
          const productId = newProduct._id;
          const isListed = newProduct.isListed;
          const productDescription = newProduct.description;

          // Calculate the current SI number (always 1 for the new product at the top)
          const currentRowNumber = 1;

          // Create a new row element
          const newRow = document.createElement("tr");
          newRow.innerHTML = `
        <td>${currentRowNumber}</td>
        <td>${productName}</td>
        <td>${productCategory}</td>
        <td>${productPrice}</td>
        <td>${productStock}</td>
        <td>
          <button
            id="editClick"
            class="btn btn-primary"
            data-toggle="modal"
            data-target="#editProductModal"
            data-id="${productId}"
            data-name="${productName}"
            data-description="${productDescription}"
            data-category="${newProduct.categoryId}"
            data-price="${productPrice}"
            data-stock="${productStock}"
            onclick="populateEditProductModal('${productId}', '${productName}', '${productDescription}', '${
            newProduct.categoryId
          }', '${productPrice}', '${productStock}')"
          >
            Edit
          </button>
          <button
            id="listButton-${productId}"
            class="btn ${isListed ? "btn-danger" : "btn-success"}"
            onclick="confirmAndToggleListProduct('${productId}', ${isListed})"
          >
            ${isListed ? "Unlist" : "List"}
          </button>
        </td>
      `;

          // Insert the new row at the top of the table body
          const tableBody = document.querySelector(".table tbody");
          tableBody.insertBefore(newRow, tableBody.firstChild);

          // Optional: Recalculate the SI numbers for all rows if needed
          updateSINumbers();

          // Use SweetAlert to show a success message
          Swal.fire({
            title: "Success!",
            text: "Product created successfully!",
            icon: "success",
            confirmButtonText: "OK",
          });

          // // Clear form input fields or close modal as necessary
          // document.getElementById("createProductForm").reset();
          $("#createProductModal").modal("hide");

          submitButton.disabled = false;
        } else {
          Swal.fire({
            title: "Error!",
            text: "Failed to create product.",
            icon: "error",
            confirmButtonText: "OK",
          });
          submitButton.disabled = false; // Re-enable the submit button even if there's an error
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
      });
  });

//for edit the product
document.addEventListener("DOMContentLoaded", () => {
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
        document.getElementById("editProductCategory").value =
          product.categoryId;
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
      const cropperContainers = document.getElementById(
        "editCropperContainers"
      );
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

  // Handle form submission
  document
    .getElementById("editProductForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();

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
      formData.append(
        "price",
        document.getElementById("editProductPrice").value
      );
      formData.append(
        "stock",
        document.getElementById("editProductStock").value
      );

      editCroppedImages.forEach((image, index) => {
        formData.append("images", image, `croppedImage${index + 1}.png`);
      });

      axios
        .put(
          `/admin/products/edit/${
            document.getElementById("editProductId").value
          }`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .then((response) => {
          if (response.status === 200) {
            location.reload();
          } else {
            alert("Failed to update product");
          }
        })
        .catch((error) => {
          console.error("Error updating product:", error);
          alert("Product update failed");
        });
    });
});

//for unlist and list product
function confirmAndToggleListProduct(productId, isListed) {
  const action = isListed === "true" ? "unlist" : "list";
  const confirmAction = confirm(
    `Are you sure you want to ${action} this product?`
  );
  if (confirmAction) {
    toggleListProduct(productId, isListed);
  }
}

function toggleListProduct(productId, isListed) {
  const newStatus = isListed === "true" ? false : true;
  axios
    .patch(`/admin/products/${productId}/unlist`, { isListed: newStatus })
    .then((response) => {
      if (response.status === 200) {
        const data = response.data.data;
        const buttonElement = document.getElementById(`listButton-${data._id}`);
        const result = data.isListed ? "Unlist" : "List";
        const buttonClass = !data.isListed ? "btn-success" : "btn-danger";

        buttonElement.className = `btn ${buttonClass}`;
        buttonElement.innerHTML = result;
        buttonElement.setAttribute(
          "onclick",
          `confirmAndToggleListProduct("${data._id}", "${data.isListed}")`
        );

        Swal.fire({
          title: "Success!",
          text: "Product updated successfully!",
          icon: "success",
          confirmButtonText: "OK",
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: "Failed to update product status.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    })
    .catch((error) => {
      console.error("There was an error updating the status!", error);
      Swal.fire({
        title: "Error!",
        text: "Error updating product status.",
        icon: "error",
        confirmButtonText: "OK",
      });
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
