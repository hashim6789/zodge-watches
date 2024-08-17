//for create category
document
  .getElementById("createCategoryForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const categoryName = document.getElementById("newCategoryName").value;
    console.log(categoryName);

    axios
      .post("/admin/categories/create", {
        categoryName: categoryName,
      })
      .then((response) => {
        console.log(response);
        alert("Category created successfully!");
        location.reload();
      })
      .catch((error) => {
        // console.error(error);
        alert(error.response.data.message);
      });
  });

// <!-- for edit the category -->
document
  .getElementById("editCategoryForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const categoryId = document.getElementById("editCategoryId").value;
    const categoryName = document.getElementById("editCategoryName").value;

    axios
      .put(`/admin/categories/edit/${categoryId}`, {
        categoryName: categoryName,
      })
      .then((response) => {
        console.log(response);
        alert("Category updated successfully!");
        location.reload();
      })
      .catch((error) => {
        console.error(error);
        alert("An error occurred while updating the category.");
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
    .patch(`/admin/categories/unlist/${categoryId}`, {
      isListed: newStatus,
    })
    .then((response) => {
      if (response.status === 200) {
        location.reload();
      } else {
        alert("Failed to update status");
      }
    })
    .catch((error) => {
      console.error("There was an error updating the status!", error);
      alert("Error updating status");
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
