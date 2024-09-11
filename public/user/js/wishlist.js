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
        Swal.fire({
          icon: "success",
          title: "Added to Wishlist",
          text: "The product has been successfully added to your wishlist!",
          showConfirmButton: false,
          timer: 2000,
        });
        fetchWishlist(); // Update wishlist UI
      } else {
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
        toggleHeartIcon(productId, false);
        Swal.fire({
          icon: "success",
          title: "Removed from Wishlist",
          text: "The product has been successfully removed from your wishlist!",
          showConfirmButton: false,
          timer: 2000,
        });
        fetchWishlist(); // Update wishlist UI
      } else {
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
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while removing the product from the wishlist. Please try again later.",
        showConfirmButton: true,
      });
    });
}

function updateWishlistUI(wishlist) {
  const wishlistContainer = document.getElementById("wishlistItems");
  const wishlistTotal = document.getElementById("wishlistTotal");

  // Clear the current wishlist items
  wishlistContainer.innerHTML = "";

  if (wishlist && wishlist.length > 0) {
    wishlist.forEach((item) => {
      const listItem = document.createElement("li");
      listItem.className = "header-cart-item flex-w flex-t m-b-12";
      listItem.innerHTML = `
        <div class="header-cart-item-img">
          <img src="/public/uploads/${item.images[0]}" alt="IMG" />
        </div>
        <div class="header-cart-item-txt p-t-8">
          <a href="#" class="header-cart-item-name m-b-18 hov-cl1 trans-04">
            ${item.name}
          </a>
          <span class="header-cart-item-info">1 x $${item.price}</span>
        </div>
        <div class="header-cart-item-remove p-t-8">
          <a href="#" class="cl2 p-lr-5 pointer hov-cl1 trans-04" onclick="removeFromWishlist('${item._id}')">
            <i class="zmdi zmdi-delete"></i>
          </a>
        </div>
      `;
      wishlistContainer.appendChild(listItem);
    });

    // Update total
    const total = wishlist
      .reduce((sum, item) => sum + item.price * (item.quantity || 1), 0)
      .toFixed(2);
    wishlistTotal.textContent = `Total: $${total}`;
  } else {
    // Display empty message
    wishlistContainer.innerHTML = `
      <li class="header-cart-item flex-w flex-t m-b-12">
        <div class="header-cart-item-txt p-t-8">
          <span class="header-cart-item-name m-b-18">Your wishlist is empty.</span>
        </div>
      </li>
    `;
    wishlistTotal.textContent = "";
  }
}

function fetchWishlist() {
  axios
    .get("/wishlist")
    .then((response) => {
      if (response.data && response.data.wishlist) {
        updateWishlistUI(response.data.wishlist.productIds);
      }
    })
    .catch((error) => {
      console.error("Error fetching wishlist:", error);
    });
}

// Call this function on page load or when the wishlist is updated
document.addEventListener("DOMContentLoaded", fetchWishlist);
