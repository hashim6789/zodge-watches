//for create category
document
  .getElementById("createCategoryForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const categoryName = document.getElementById("newCategoryName").value;

    axios
      .post("/admin/categories", {
        categoryName: categoryName,
      })
      .then((response) => {
        // Extract the new category from the response
        const newCategory = response.data.data.category;
        console.log(newCategory);
        const isListedClass = newCategory.isListed
          ? "btn-danger"
          : "btn-success";
        const listAction = newCategory.isListed ? "Unlist" : "List";
        const currentRowNumber = 1; // The new category will always be at the top of the list

        // Insert the new row at the top of the table body
        const tableBody = document.querySelector(".table tbody");
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
          <td>${currentRowNumber}</td>
          <td>${newCategory.name}</td>
          <td>
            <button
              class="btn btn-primary"
              data-toggle="modal"
              data-target="#editCategoryModal"
              data-id="${newCategory._id}"
              data-name="${newCategory.name}"
              onclick="populateEditCategoryModal('${newCategory._id}', '${newCategory.name}')"
            >
              Edit
            </button>
            <button
              class="btn ${isListedClass}"
              onclick="confirmAndToggleListCategory('${newCategory._id}', '${newCategory.isListed}')"
            >
              ${listAction}
            </button>
          </td>
        `;
        tableBody.insertBefore(newRow, tableBody.firstChild);

        // Clear the form input field
        document.getElementById("newCategoryName").value = "";

        // Optional: Recalculate the SI numbers for all rows
        updateSINumbers();

        // Hide the modal after SweetAlert confirmation
        $("#createCategoryModal").modal("hide");
        // Use SweetAlert to show a success message and hide the modal
        Swal.fire({
          title: "Success!",
          text: "Category created successfully!",
          icon: "success",
          confirmButtonText: "OK",
        });
      })
      .catch((error) => {
        console.log(error);
        // Use SweetAlert to show an error message
        Swal.fire({
          title: "Error!",
          text: error.response.data.message,
          icon: "error",
          confirmButtonText: "OK",
        });
      });
  });

// Function to update the serial numbers of the categories
function updateSINumbers() {
  const rows = document.querySelectorAll(".table tbody tr");
  rows.forEach((row, index) => {
    row.cells[0].innerText = index + 1;
  });
}

// <!-- for edit the category -->
document
  .getElementById("editCategoryForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const categoryId = document.getElementById("editCategoryId").value;
    const categoryName = document.getElementById("editCategoryName").value;

    axios
      .put(`/admin/categories/${categoryId}`, {
        categoryName: categoryName.toUpperCase(),
      })
      .then((response) => {
        const category = response.data.data;
        // Clear the form input field
        document.getElementById(
          `categoryName-${category._id}`
        ).innerHTML = `${category.name}`;

        // Hide the modal after SweetAlert confirmation
        $("#editCategoryModal").modal("hide");
        Swal.fire({
          title: "Success!",
          text: "Category updated successfully!",
          icon: "success",
          confirmButtonText: "OK",
        });
      })
      .catch((error) => {
        Swal.fire({
          title: "Error!",
          text: error.response.data.message,
          icon: "error",
          confirmButtonText: "OK",
        });
      });
  });

// Function to dropdown the categories to  the modal
function populateEditCategoryModal(categoryId, categoryName) {
  document.getElementById("editCategoryId").value = categoryId;
  document.getElementById("editCategoryName").value = categoryName;
}

//for confirm the list and unlist categories
function confirmAndToggleListCategory(categoryId, isListed) {
  const action = isListed === "true" ? "unlist" : "list";
  const confirmAction = confirm(
    `Are you sure you want to ${action} this category?`
  );
  if (confirmAction) {
    toggleListCategory(categoryId, isListed);
  }
}

//for convert the listed categories to unlist and viseversa
function toggleListCategory(categoryId, isListed) {
  const newStatus = isListed === "true" ? false : true;
  axios
    .patch(`/admin/categories/${categoryId}/unlist`, { isListed: newStatus })
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
          `confirmAndToggleListCategory("${data._id}", "${data.isListed}")`
        );

        Swal.fire({
          title: "Success!",
          text: "Category updated successfully!",
          icon: "success",
          confirmButtonText: "OK",
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: "Failed to update category status.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    })
    .catch((error) => {
      console.error("There was an error updating the status!", error);
      Swal.fire({
        title: "Error!",
        text: "Error updating category status.",
        icon: "error",
        confirmButtonText: "OK",
      });
    });
}

//for edit modal
$("#editCategoryModal").on("show.bs.modal", function (event) {
  var button = $(event.relatedTarget);
  var categoryId = button.data("id");
  var categoryName = button.data("name");
  var modal = $(this);
  modal.find("#editCategoryId").val(categoryId);
  modal.find("#editCategoryName").val(categoryName);
});
