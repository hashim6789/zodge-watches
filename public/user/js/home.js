function fetchProducts(categoryId) {
  axios
    .get(`/user/shop/filter/category/${categoryId}`)
    .then((response) => {
      const products = response.data.data;

      // Clear the existing content in the product-list div
      document.getElementById("product-list").innerHTML = "";

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

        // Insert the new product HTML into the product-list div
        document
          .getElementById("product-list")
          .insertAdjacentHTML("beforeend", productHtml);
      });
    })
    .catch((error) => {
      console.error("There was an error searching products!", error);
      alert("Error updating products");
    });
}

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
function sortByPrice(sortMethod) {
  const endpoint = `/user/shop/filter/products`; // Assuming this endpoint fetches all products

  axios
    .get(endpoint)
    .then((response) => {
      let products = response.data.data;

      if (sortMethod === "lowToHigh") {
        products.sort((a, b) => a.price - b.price);
      } else if (sortMethod === "highToLow") {
        products.sort((a, b) => b.price - a.price);
      }

      // Clear the existing content in the product-list div
      document.getElementById("product-list").innerHTML = "";

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

        // Insert the new product HTML into the product-list div
        document
          .getElementById("product-list")
          .insertAdjacentHTML("beforeend", productHtml);
      });
    })
    .catch((error) => {
      console.error("There was an error fetching and sorting products!", error);
      alert("Error fetching and sorting products");
    });
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
$(".js-addwish-b2").on("click", function (e) {
  e.preventDefault();
});

$(".js-addwish-b2").each(function () {
  var nameProduct = $(this).parent().parent().find(".js-name-b2").html();
  $(this).on("click", function () {
    swal(nameProduct, "is added to wishlist !", "success");

    $(this).addClass("js-addedwish-b2");
    $(this).off("click");
  });
});

$(".js-addwish-detail").each(function () {
  var nameProduct = $(this)
    .parent()
    .parent()
    .parent()
    .find(".js-name-detail")
    .html();

  $(this).on("click", function () {
    swal(nameProduct, "is added to wishlist !", "success");

    $(this).addClass("js-addedwish-detail");
    $(this).off("click");
  });
});

/*---------------------------------------------*/

$(".js-addcart-detail").each(function () {
  var nameProduct = $(this)
    .parent()
    .parent()
    .parent()
    .parent()
    .find(".js-name-detail")
    .html();
  $(this).on("click", function () {
    swal(nameProduct, "is added to cart !", "success");
  });
});
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
