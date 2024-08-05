// public/js/userFunctions.js
async function toggleBlock(userId, isBlocked) {
  console.log(userId, isBlocked);
  try {
    const response = await axios.patch(`/${userId}/block`, {
      isBlocked: !isBlocked,
    });
    if (response.status === 200) {
      window.location.reload(); // Reload the page to see the updated status
    }
  } catch (error) {
    console.error("Error updating user status:", error);
  }
}
