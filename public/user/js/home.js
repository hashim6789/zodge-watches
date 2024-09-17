document.addEventListener("DOMContentLoaded", function () {
  // Fetch all products on page load with default category, page 1, sorting, and no search query
  let selectedCategory = "all"; // Default to 'all' category
  let selectedSort = "newArrivals"; // Default to 'newArrivals' sorting
  let currentPage = 1; // Default to page 1
  let searchQuery = ""; // Default to no search query

  fetchProducts(selectedCategory, currentPage, selectedSort, searchQuery);

  // Attach event listeners for search functionality
  document
    .getElementById("search-input")
    .addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        searchProducts();
      }
    });
  // document
  //   .getElementById("search-button")
  //   .addEventListener("click", searchProducts);
});

// Fetch products based on category, page, sorting, and search query
function fetchProducts(
  category = "all",
  page = 1,
  sort = "newArrivals",
  query = ""
) {
  console.log(category, page, sort, query);
  selectedCategory = category; // Set the current selected category
  selectedSort = sort; // Set the current selected sort method
  searchQuery = query; // Set the current search query

  const url = `/api/products?category=${category}&page=${page}&sort=${sort}&search=${encodeURIComponent(
    query
  )}`;

  axios
    .get(url)
    .then((response) => {
      const { products, current, pages, wishlist, currentCategory } =
        response.data;
      renderProducts(products, wishlist);
      updatePagination(current, pages, currentCategory);
    })
    .catch((error) => console.error("Error fetching products:", error));
}

function filterProducts(category, page) {
  fetchProducts(category, page, selectedSort, searchQuery); // Invoke fetchProducts with category, page, selected sort, and current search query
}

function renderProducts(products, wishlist = { productIds: [] }) {
  // console.log(wishlist);
  const productList = document.getElementById("product-list");
  productList.style.height = "756.575px";
  productList.innerHTML = products
    .map((product) => {
      // Check if wishlist is null or undefined, and default to an empty object if so
      const wishlistProductIds =
        wishlist && wishlist.productIds ? wishlist.productIds : [];

      const isInWishlist = wishlistProductIds.some(
        (productId) => productId.toString() === product._id.toString()
      );

      // console.log(isInWishlist);

      // Determine if the product is out of stock
      const isOutOfStock = product.stock < 1;

      // Calculate the discounted price and original price
      const hasDiscount =
        product.discountedPrice !== 0 &&
        product.price !== product.discountedPrice;
      // console.log("discount = ", hasDiscount);
      const originalPrice = product.price.toFixed(2);
      const discountedPrice = product.discountedPrice.toFixed(2);

      // Generate HTML for the product
      return `
      <div class="col-sm-6 col-md-4 col-lg-3 p-b-35 isotope-item ${
        product.categoryId
      }">
        <div class="block2">
          <div class="block2-pic hov-img0">
            <img src="/public/uploads/${product.images[0]}" alt="IMG-PRODUCT" />
            <form action="/shop/products/${product._id}">
              <button class="block2-btn flex-c-m stext-103 cl2 size-102 bg0 bor2 hov-btn1 p-lr-15 trans-04" type="submit">
                Quick View
              </button>
            </form>
          </div>
          <div class="block2-txt flex-w flex-t p-t-14">
            <div class="block2-txt-child1 flex-col-l">
              <a href="#" class="stext-104 cl4 hov-cl1 trans-04 js-name-b2 p-b-6">${
                product.name
              }</a>

              <!-- Price Section -->
              ${
                hasDiscount
                  ? `<span class="stext-105 cl3"><del>₹${originalPrice}</del> ₹${discountedPrice}</span>`
                  : `<span class="stext-105 cl3">₹${originalPrice}</span>`
              }
              
              <!-- Out of Stock Message -->
              ${
                isOutOfStock
                  ? '<p class="text-danger mt-2">Out of Stock</p>'
                  : ""
              }
            </div>
            <!-- Wishlist button -->
            <div class="block2-txt-child2 flex-r p-t-3">
              <div class="btn-addwish-b2 dis-block pos-relative js-addwish-b2" data-id="${
                product._id
              }">
                <!-- Add to Wishlist Icon -->
                <img 
                  id="heart1-${product._id}" 
                  class="icon-heart1 dis-block trans-04 ${
                    isInWishlist ? "d-none" : ""
                  }" 
                  src="/public/user/images/icons/icon-heart-01.png" 
                  alt="Add to Wishlist" 
                  onclick="toggleWishlist('${product._id}')"
                />
                <!-- Remove from Wishlist Icon -->
                <img 
                  id="heart2-${product._id}" 
                  class="icon-heart2 dis-block trans-04 ${
                    isInWishlist ? "" : "d-none"
                  }" 
                  src="/public/user/images/icons/icon-heart-02.png" 
                  alt="Remove from Wishlist" 
                  onclick="toggleWishlist('${product._id}')"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    })
    .join("");
}

// Update pagination based on current page and total pages
function updatePagination(current, pages, currentCategory) {
  const paginationContainer = document.querySelector(".pagination");
  paginationContainer.innerHTML = `
    ${
      current > 1
        ? `<li class="page-item"><a class="page-link" data-page="${
            current - 1
          }" aria-label="Previous" onclick="fetchProducts('${currentCategory}', ${
            current - 1
          }, '${selectedSort}', '${searchQuery}')">&laquo;</a></li>`
        : ""
    }
    ${Array.from(
      { length: pages },
      (_, i) => `
      <li class="page-item ${current === i + 1 ? "active" : ""}">
        <a class="page-link" data-page="${
          i + 1
        }" onclick="fetchProducts('${currentCategory}', ${
        i + 1
      }, '${selectedSort}', '${searchQuery}')">${i + 1}</a>
      </li>
    `
    ).join("")}
    ${
      current < pages
        ? `<li class="page-item"><a class="page-link" data-page="${
            current + 1
          }" aria-label="Next" onclick="fetchProducts('${currentCategory}', ${
            current + 1
          }, '${selectedSort}', '${searchQuery}')">&raquo;</a></li>`
        : ""
    }
  `;
}

function searchProducts() {
  const query = document.getElementById("search-input").value.trim();
  fetchProducts(selectedCategory, 1, selectedSort, query); // Fetch products with the current search query
}

// Handle sorting method selection and fetch products accordingly
function sortBy(sortMethod) {
  selectedSort = sortMethod; // Update the sorting method
  fetchProducts(selectedCategory, 1, selectedSort); // Fetch products using new sort method, reset to page 1
}

function toggleHeartIcon(productId, isAdded) {
  const heart1 = document.getElementById(`heart1-${productId}`);
  const heart2 = document.getElementById(`heart2-${productId}`);

  if (isAdded) {
    heart1.classList.add("d-none");
    heart2.classList.remove("d-none");
  } else {
    heart1.classList.remove("d-none");
    heart2.classList.add("d-none");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Reinitialize Slick carousel in the modal
  $(".slick3").slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    fade: true,
    arrows: false,
    dots: true,
  });
});

/*---------------------------------------------*/
$(".js-select2").each(function () {
  $(this).select2({
    minimumResultsForSearch: 20,
    dropdownParent: $(this).next(".dropDownSelect2"),
  });
});

/*---------------------------------------------*/
$(".parallax100").parallax100();
/*---------------------------------------------*/

$(".gallery-lb").each(function () {
  // the containers for all your galleries
  $(this).magnificPopup({
    delegate: "a", // the selector for gallery item
    type: "image",
    gallery: {
      enabled: true,
    },
    mainClass: "mfp-fade",
  });
});

/*---------------------------------------------*/
// function toggleWishlist(productId, isRemoving) {
//   var nameProduct = $("#heart1-" + productId)
//     .closest(".block2-txt-child2")
//     .find(".js-name-b2, .js-name-detail")
//     .html();

//   if (isRemoving) {
//     // Show the remove from wishlist notification
//     Swal.fire({
//       title: nameProduct,
//       text: "is removed from wishlist!",
//       icon: "warning",
//     });

//     // Toggle icons for removal
//     $("#heart1-" + productId).removeClass("d-none");
//     $("#heart2-" + productId).addClass("d-none");

//     // Make an AJAX request to remove from wishlist (if needed)
//     removeFromWishlist(productId);
//   } else {
//     // Show the add to wishlist notification
//     Swal.fire({
//       title: nameProduct,
//       text: "is added to wishlist!",
//       icon: "success",
//     });

//     // Toggle icons for addition
//     $("#heart1-" + productId).addClass("d-none");
//     $("#heart2-" + productId).removeClass("d-none");

//     // Make an AJAX request to add to wishlist (if needed)
//     addToWishlist(productId);
//   }
// }

/*---------------------------------------------*/

// $(".js-addcart-detail").each(function () {
//   var nameProduct = $(this)
//     .parent()
//     .parent()
//     .parent()
//     .parent()
//     .find(".js-name-detail")
//     .html();
//   $(this).on("click", function () {
//     swal(nameProduct, "is added to cart!", "success");
//   });
// });

/*---------------------------------------------*/

$(".js-pscroll").each(function () {
  $(this).css("position", "relative");
  $(this).css("overflow", "hidden");
  var ps = new PerfectScrollbar(this, {
    wheelSpeed: 1,
    scrollingThreshold: 1000,
    wheelPropagation: false,
  });

  $(window).on("resize", function () {
    ps.update();
  });
});
