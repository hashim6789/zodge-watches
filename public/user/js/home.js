document.addEventListener("DOMContentLoaded", function () {
  // Fetch all products on page load with default category, page 1, and default sorting
  let selectedCategory = "all"; // Default to 'all' category
  let selectedSort = "newArrivals"; // Default to 'newArrivals' sorting
  fetchProducts("all", 1, "newArrivals");
});

// Fetch products based on category, page, and sorting
function fetchProducts(category = "all", page = 1, sort = "newArrivals") {
  console.log(category, page, sort);
  selectedCategory = category; // Set the current selected category
  selectedSort = sort; // Set the current selected sort method

  const url = `/api/products?category=${category}&page=${page}&sort=${sort}`;

  axios
    .get(url)
    .then((response) => {
      const { products, current, pages, currentCategory } = response.data;
      renderProducts(products);
      updatePagination(current, pages, currentCategory);
    })
    .catch((error) => console.error("Error fetching products:", error));
}

function filterProducts(category, page) {
  fetchProducts(category, page); // Invoke fetchProducts with category, page, and selected sort
}

// Render products onto the page
function renderProducts(products) {
  const productList = document.getElementById("product-list");
  productList.innerHTML = products
    .map(
      (product) => `
      <div class="col-sm-6 col-md-4 col-lg-3 p-b-35 isotope-item ${product.categoryId}">
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
              <a href="#" class="stext-104 cl4 hov-cl1 trans-04 js-name-b2 p-b-6">${product.name}</a>
              <span class="stext-105 cl3">${product.price}</span>
            </div>
          </div>
        </div>
      </div>
    `
    )
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
          }, '${selectedSort}')">&laquo;</a></li>`
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
      }, '${selectedSort}')">${i + 1}</a>
      </li>
    `
    ).join("")}
    ${
      current < pages
        ? `<li class="page-item"><a class="page-link" data-page="${
            current + 1
          }" aria-label="Next" onclick="fetchProducts('${currentCategory}', ${
            current + 1
          }, '${selectedSort}')">&raquo;</a></li>`
        : ""
    }
  `;
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
// function fetchProducts(categoryId) {
//   axios
//     .get(`/user/shop/filter/categories/${categoryId}`)
//     .then((response) => {
//       let products = response.data.data;

//       // Clear the existing content in the product-list div
//       document.getElementById("product-list").innerHTML = "";

//       products.forEach(function (product) {
//         const productHtml = `
//         <div class="col-sm-6 col-md-4 col-lg-3 p-b-35 isotope-item ${product.categoryId}">
//           <div class="block2">
//             <div class="block2-pic hov-img0">
//               <img src="/public/uploads/${product.images[0]}" alt="IMG-PRODUCT" />
//               <form action="/user/shop/quickview/${product._id}">
//                 <button class="block2-btn flex-c-m stext-103 cl2 size-102 bg0 bor2 hov-btn1 p-lr-15 trans-04" type="submit">
//                   Quick View
//                 </button>
//               </form>
//             </div>
//             <div class="block2-txt flex-w flex-t p-t-14">
//               <div class="block2-txt-child1 flex-col-l">
//                 <a href="#" class="stext-104 cl4 hov-cl1 trans-04 js-name-b2 p-b-6">
//                   ${product.name}
//                 </a>
//                 <span class="stext-105 cl3">${product.price}</span>
//               </div>
//               <div class="block2-txt-child2 flex-r p-t-3">
//                 <a href="#" class="btn-addwish-b2 dis-block pos-relative js-addwish-b2" data-id="${product._id}">
//                   <img class="icon-heart1 dis-block trans-04" src="/public/user/images/icons/icon-heart-01.png" alt="ICON" />
//                   <img class="icon-heart2 dis-block trans-04 ab-t-l" src="/public/user/images/icons/icon-heart-02.png" alt="ICON" />
//                 </a>
//               </div>
//             </div>
//           </div>
//         </div>
//       `;

//         // Insert the new product HTML into the product-list div
//         document
//           .getElementById("product-list")
//           .insertAdjacentHTML("beforeend", productHtml);
//       });
//     })
//     .catch((error) => {
//       console.error("There was an error searching products!", error);
//       alert("Error updating products");
//     });
// }

function searchProducts(event) {
  // Check if the Enter key is pressed or the search button is clicked
  if (event.key === "Enter" || event.type === "click") {
    const query = document.getElementById("search-input").value.trim();
    console.log(query);

    if (query) {
      // If there is a query, make a GET request to the server to search products
      axios
        .get(`/user/shop/search?query=${encodeURIComponent(query)}`)
        .then((response) => {
          const products = response.data.data;

          // Clear the current product list
          document.getElementById("product-list").innerHTML = "";

          // Loop through the products and generate HTML for each product
          products.forEach(function (product) {
            const productHtml = `
                    <div class="col-sm-6 col-md-4 col-lg-3 p-b-35 isotope-item ${product.categoryId}">
                      <div class="block2">
                        <div class="block2-pic hov-img0">
                          <img src="/public/uploads/${product.images[0]}" alt="IMG-PRODUCT" />
                          <form action="/user/shop/quickview/${product._id}">
                            <button class="block2-btn flex-c-m stext-103 cl2 size-102 bg0 bor2 hov-btn1 p-lr-15 trans-04" type="submit">
                              Quick View
                            </button>
                          </form>
                        </div>
                        <div class="block2-txt flex-w flex-t p-t-14">
                          <div class="block2-txt-child1 flex-col-l">
                            <a href="#" class="stext-104 cl4 hov-cl1 trans-04 js-name-b2 p-b-6">
                              ${product.name}
                            </a>
                            <span class="stext-105 cl3">${product.price}</span>
                          </div>
                          <div class="block2-txt-child2 flex-r p-t-3">
                            <a href="#" class="btn-addwish-b2 dis-block pos-relative js-addwish-b2" data-id="${product._id}">
                              <img class="icon-heart1 dis-block trans-04" src="/public/user/images/icons/icon-heart-01.png" alt="ICON" />
                              <img class="icon-heart2 dis-block trans-04 ab-t-l" src="/public/user/images/icons/icon-heart-02.png" alt="ICON" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  `;

            // Append each product's HTML to the product-list div
            document
              .getElementById("product-list")
              .insertAdjacentHTML("beforeend", productHtml);
          });
        })
        .catch((error) => {
          console.error("There was an error searching for products!", error);
          alert("Error loading products");
        });
    }
  }
}

//for sort by price
// function sortBy(sortMethod) {
//   const endpoint = `/user/shop/filter/products`; // Assuming this endpoint fetches all products

//   axios
//     .get(`${endpoint}?method=${sortMethod}`)
//     .then((response) => {
//       const products = response.data.data.products;
//       const wishlist = response.data.data.wishlist;
//       console.log(products);

//       // Clear the existing content in the product-list div
//       document.getElementById("product-list").innerHTML = "";

//       products.forEach(function (product) {
//         // Determine the display message for product availability
//         let availabilityMessage = "";
//         if (!product.isListed) {
//           availabilityMessage = `<div class="product-unavailable text-danger mt-2">Currently unavailable</div>`;
//         } else if (product.stock === 0) {
//           availabilityMessage = `<div class="out-of-stock text-danger mt-2">Out of Stock</div>`;
//         }

//         // Determine the wishlist icon status
//         let wishlistIcons = `
//           <img
//             id="heart1-${product._id}"
//             class="icon-heart1 dis-block trans-04"
//             src="/public/user/images/icons/icon-heart-01.png"
//             alt="ICON"
//             onclick="toggleWishlist('${product._id}', false)"
//           />
//           <img
//             id="heart2-${product._id}"
//             class="icon-heart2 dis-block trans-04 d-none"
//             src="/public/user/images/icons/icon-heart-02.png"
//             alt="ICON"
//             onclick="toggleWishlist('${product._id}', true)"
//           />
//         `;
//         if (wishlist?.productIds.includes(product._id)) {
//           wishlistIcons = `
//             <img
//               id="heart1-${product._id}"
//               class="icon-heart1 dis-block trans-04 d-none"
//               src="/public/user/images/icons/icon-heart-01.png"
//               alt="ICON"
//               onclick="toggleWishlist('${product._id}', false)"
//             />
//             <img
//               id="heart2-${product._id}"
//               class="icon-heart2 dis-block trans-04"
//               src="/public/user/images/icons/icon-heart-02.png"
//               alt="ICON"
//               onclick="toggleWishlist('${product._id}', true)"
//             />
//           `;
//         }

//         // Build the product HTML
//         const productHtml = `
//           <div class="col-sm-6 col-md-4 col-lg-3 p-b-35 isotope-item ${product.categoryId}">
//             <div class="block2">
//               <div class="block2-pic hov-img0">
//                 <img src="/public/uploads/${product.images[0]}" alt="IMG-PRODUCT" />
//                 <form action="/user/shop/quickview/${product._id}">
//                   <button class="block2-btn flex-c-m stext-103 cl2 size-102 bg0 bor2 hov-btn1 p-lr-15 trans-04" type="submit">
//                     Quick View
//                   </button>
//                 </form>
//               </div>
//               <div class="block2-txt flex-w flex-t p-t-14">
//                 <div class="block2-txt-child1 flex-col-l">
//                   <a href="#" class="stext-104 cl4 hov-cl1 trans-04 js-name-b2 p-b-6">
//                     ${product.name}
//                   </a>
//                   <span class="stext-105 cl3">${product.price}</span>
//                   ${availabilityMessage}
//                 </div>
//                 <div class="block2-txt-child2 flex-r p-t-3">
//                   <div class="btn-addwish-b2 dis-block pos-relative js-addwish-b2" data-id="${product._id}">
//                     ${wishlistIcons}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         `;

//         // Insert the new product HTML into the product-list div
//         document
//           .getElementById("product-list")
//           .insertAdjacentHTML("beforeend", productHtml);
//       });
//     })
//     .catch((error) => {
//       console.error("There was an error fetching and sorting products!", error);
//       alert("Error fetching and sorting products");
//     });
// }

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
