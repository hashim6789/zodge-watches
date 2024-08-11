function confirmAndToggleBlock(userId, isBlocked) {
  const action = isBlocked === "true" ? "unblock" : "block";
  const confirmAction = confirm(
    `Are you sure you want to ${action} this user?`
  );
  if (confirmAction) {
    toggleBlock(userId, isBlocked);
  }
}

function toggleBlock(userId, isBlocked) {
  const newStatus = isBlocked === "true" ? false : true;
  axios
    .patch(`/admin/users/block/${userId}`, { isBlocked: newStatus })
    .then((response) => {
      if (response.status === 200) {
        location.reload(); // Reload the page to reflect changes
      } else {
        alert("Failed to update status");
      }
    })
    .catch((error) => {
      console.error("There was an error updating the status!", error);
      alert("Error updating status");
    });
}
