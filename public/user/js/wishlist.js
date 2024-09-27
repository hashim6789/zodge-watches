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
      // console.log("response = ", response.data);
      const data = response.data.data;
      const success = response.data.success;
      if (success) {
        // const wishlist = response.data.wishlist;
        toggleHeartIcon(productId, true);
        Swal.fire({
          icon: "success",
          title: "Added to Wishlist",
          text: "The product has been successfully added to your wishlist!",
          showConfirmButton: false,
          timer: 2000,
        });
        fetchWishlist(); // Update wishlist UI
        const wishlistIcon = document.getElementById("wishlistIcon");
        if (wishlistIcon) {
          wishlistIcon.setAttribute("data-notify", data.wishlistLength);
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Yes",
          showConfirmButton: true,
        });
      }
    })
    .catch((error) => {
      console.error("Error adding product to wishlist:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response.data.message,
        showConfirmButton: true,
      });
    });
}

function removeFromWishlist(productId) {
  axios
    .delete(`/wishlist/${productId}/remove`, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      // const wishlist = response.data.data;
      const data = response.data.data;
      const success = response.data.success;
      if (success) {
        toggleHeartIcon(productId, false);
        Swal.fire({
          icon: "success",
          title: "Removed from Wishlist",
          text: "The product has been successfully removed from your wishlist!",
          showConfirmButton: false,
          timer: 2000,
        });
        fetchWishlist(); // Update wishlist UI
        const wishlistIcon = document.getElementById("wishlistIcon");
        if (wishlistIcon) {
          wishlistIcon.setAttribute("data-notify", data.wishlistLength);
        }
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
        text: error.response.data.message,
        showConfirmButton: true,
      });
    });
}

function addToCartFromWishlist(productId) {
  let quantity = 1;

  axios
    .put(`/wishlist/${productId}/cart`, { quantity, productId })
    .then((response) => {
      const product = response.data.product;
      const originalCart = response.data.cart;
      const productPrice = product.discountedPrice || product.price;

      // Retrieve the cart from local storage or initialize it
      let cart = JSON.parse(localStorage.getItem("cart")) || {
        products: [],
        totalPrice: 0,
        coupon: null,
        address: null,
      };

      // Check if the product already exists in the cart
      const existingProductIndex = cart.products.findIndex(
        (item) => item.productId === productId
      );

      if (existingProductIndex !== -1) {
        // Update the quantity of the existing product in localStorage
        cart.products[existingProductIndex].quantity = quantity;
      } else {
        // Add the new product to the cart
        cart.products.push({
          productId: product._id,
          price: productPrice,
          quantity: quantity,
        });
      }

      // Update total price in the local storage cart from backend response
      cart.totalPrice = originalCart.totalPrice;

      // Save the updated cart to local storage
      localStorage.setItem("cart", JSON.stringify(cart));

      // SweetAlert for success message
      Swal.fire({
        icon: "success",
        title: "Added to Cart",
        text: `${product.name} added to cart successfully!`,
        showConfirmButton: false,
        timer: 2000,
      }).then(() => {
        const cartIcon = document.getElementById("cartIcon");
        if (cartIcon) {
          cartIcon.setAttribute("data-notify", cart.products.length);
        }

        const wishlistIcon = document.getElementById("wishlistIcon");
        if (wishlistIcon) {
          wishlistIcon.setAttribute("data-notify", data.wishlistLength);
        }
      });
    })
    .catch((error) => {
      console.error("Error adding product to cart:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response.data.message,
        showConfirmButton: true,
      });
    });
}

function updateWishlistUI(wishlist) {
  console.log("wishlist", wishlist);
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
          <span class="header-cart-item-info">1 x $${item.discountedPrice}</span>
        </div>
        <div class="header-cart-item-actions p-t-8">
          <a href="#" class="cl2 p-lr-5 pointer hov-cl1 trans-04" onclick="removeFromWishlist('${item.productId}')">
            <i class="zmdi zmdi-delete"></i>
          </a>
          <button class="add-to-cart-btn" onclick="addToCartFromWishlist('${item.productId}')">
            Add to Cart
          </button>
        </div>
      `;
      wishlistContainer.appendChild(listItem);
    });

    // Update total
    const total = wishlist
      .reduce(
        (sum, item) => sum + item.discountedPrice * (item.quantity || 1),
        0
      )
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
      console.log(response.data.wishlist);
      if (response.data && response.data.wishlist) {
        updateWishlistUI(response.data.wishlist);
      }
    })
    .catch((error) => {
      console.error("Error fetching wishlist:", error);
    });
}

// Call this function on page load or when the wishlist is updated
document.addEventListener("DOMContentLoaded", fetchWishlist);
