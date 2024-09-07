function toggleWishlist(productId) {
  const heartFilled = document.getElementById(`heart2-${productId}`);
  const heartEmpty = document.getElementById(`heart1-${productId}`);

  // Check if the product is already in the wishlist
  if (heartFilled.classList.contains("d-none")) {
    // If the heart is empty, add to wishlist
    addToWishlist(productId);
  } else {
    // If the heart is filled, remove from wishlist
    removeFromWishlist(productId);
  }
}

function toggleHeartIcon(productId, isInWishlist) {
  const heartFilled = document.getElementById(`heart2-${productId}`);
  const heartEmpty = document.getElementById(`heart1-${productId}`);

  if (!heartFilled || !heartEmpty) {
    console.error(
      `Elements with IDs heart1-${productId} or heart2-${productId} not found.`
    );
    return; // Exit the function if elements are not found
  }

  if (isInWishlist) {
    // Show filled heart and hide empty heart
    heartEmpty.classList.add("d-none");
    heartFilled.classList.remove("d-none");
  } else {
    // Show empty heart and hide filled heart
    heartEmpty.classList.remove("d-none");
    heartFilled.classList.add("d-none");
  }
}

function addToWishlist(productId) {
  axios
    .post("/wishlist/add", { productId })
    .then((response) => {
      if (response.data.data) {
        toggleHeartIcon(productId, true);
        console.log(response.data.data);

        // SweetAlert success message
        Swal.fire({
          icon: "success",
          title: "Added to Wishlist",
          text: "The product has been successfully added to your wishlist!",
          showConfirmButton: false,
          timer: 2000, // Automatically close after 2 seconds
        });
      } else {
        // SweetAlert failure message
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Failed to add product to wishlist. Please try again!",
          showConfirmButton: true,
        });
      }
    })
    .catch((error) => {
      console.error("Error adding product to wishlist:", error);

      // SweetAlert error message
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while adding the product to the wishlist. Please try again later.",
        showConfirmButton: true,
      });
    });
}

function removeFromWishlist(productId) {
  axios
    .delete(`/wishlist/${productId}/remove`)
    .then((response) => {
      if (response.data.data) {
        // Successfully removed from wishlist
        toggleHeartIcon(productId, false); // Call to handle heart icon toggling

        // SweetAlert success message
        Swal.fire({
          icon: "success",
          title: "Removed from Wishlist",
          text: "The product has been successfully removed from your wishlist!",
          showConfirmButton: false,
          timer: 2000, // Automatically close after 2 seconds
        });
      } else {
        // Failure in removing from wishlist
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Failed to remove the product from the wishlist. Please try again!",
          showConfirmButton: true,
        });
      }
    })
    .catch((error) => {
      console.error("Error removing product from wishlist:", error);

      // SweetAlert error message
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while removing the product from the wishlist. Please try again later.",
        showConfirmButton: true,
      });
    });
}
