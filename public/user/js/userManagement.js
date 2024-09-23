function confirmAndToggleBlock(userId, isBlocked) {
  const action = isBlocked === "true" ? "unblock" : "block";

  // Use SweetAlert2 for confirmation
  Swal.fire({
    icon: "warning",
    showCancelButton: true,
    text: `Are you sure you want to ${action} this user?`,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: `Yes, ${action}`,
    cancelButtonText: "Cancel",
    customClass: {
      title: "swal-custom-title",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      // If confirmed, proceed to toggle block/unblock action
      toggleBlock(userId, isBlocked);
      Swal.fire({
        toast: true,
        icon: "success",
        title: `User ${action}ed!`,
        position: "bottom",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  });
}

function toggleBlock(userId, isBlocked) {
  const newStatus = isBlocked === "true" ? false : true;
  axios
    .patch(`/admin/users/${userId}/block`, { isBlocked: newStatus })
    .then((response) => {
      if (response.status === 200) {
        const data = response.data.data;
        const buttonElement = document.getElementById(
          `blockButton-${data.userId}`
        );
        const result = data.isBlocked ? "Unblock" : "Block";
        const buttonClass = data.isBlocked ? "btn-success" : "btn-danger";

        buttonElement.className = `btn ${buttonClass}`;
        buttonElement.innerHTML = result;
        buttonElement.setAttribute(
          "onclick",
          `confirmAndToggleBlock("${data.userId}", "${data.isBlocked}")`
        );
      } else {
        alert("Failed to update status");
      }
    })
    .catch((error) => {
      console.error("There was an error updating the status!", error);
      alert("Error updating status");
    });
}
