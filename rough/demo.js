// let user = {
//   name: "hashim",
//   age: 20,
//   address: {
//     place: "calicut",
//     pincode: 23213123,
//   },
// };

// // let shallow = { ...user };
// // shallow.address.pincode = 123456;
// // console.log(user.address.pincode);

// const deep = JSON.parse(JSON.stringify(originalObject));
// deep.

const products = [
  {
    name: "Premium Watch A",
    description: "A luxury watch with a sleek design.",
    categoryId: 1,
    price: 299.99,
    stock: 50,
    images: ["image1.jpg", "image2.jpg"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    name: "Premium Watch B",
    description: "A stylish watch perfect for any occasion.",
    categoryId: 2,
    price: 199.99,
    stock: 30,
    images: ["image3.jpg", "image4.jpg"],
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: "2024-02-01T00:00:00Z",
  },
  {
    name: "Premium Watch C",
    description: "A watch with cutting-edge technology.",
    categoryId: 3,
    price: 399.99,
    stock: 20,
    images: ["image5.jpg", "image6.jpg"],
    createdAt: "2024-03-01T00:00:00Z",
    updatedAt: "2024-03-01T00:00:00Z",
  },
  {
    name: "Premium Watch D",
    description: "An elegant watch for special occasions.",
    categoryId: 1,
    price: 249.99,
    stock: 40,
    images: ["image7.jpg", "image8.jpg"],
    createdAt: "2024-04-01T00:00:00Z",
    updatedAt: "2024-04-01T00:00:00Z",
  },
  {
    name: "Premium Watch E",
    description: "A rugged watch for outdoor adventures.",
    categoryId: 2,
    price: 149.99,
    stock: 60,
    images: ["image9.jpg", "image10.jpg"],
    createdAt: "2024-05-01T00:00:00Z",
    updatedAt: "2024-05-01T00:00:00Z",
  },
];


<!-- Block2 -->
<!-- <div id="product-list" class="row isotope-grid">
  <% products.forEach(function(product) { %>
  <div
    class="col-sm-6 col-md-4 col-lg-3 p-b-35 isotope-item <%= product.category %>"
  >
    <div class="block2">
      <div class="block2-pic hov-img0">
        <img src="<%= product.imgSrc %>" alt="IMG-PRODUCT" />

        <a
          href="#"
          class="block2-btn flex-c-m stext-103 cl2 size-102 bg0 bor2 hov-btn1 p-lr-15 trans-04 js-show-modal1"
        >
          Quick View
        </a>
      </div>

      <div class="block2-txt flex-w flex-t p-t-14">
        <div class="block2-txt-child1 flex-col-l">
          <a
            href="<%= product.detailPage %>"
            class="stext-104 cl4 hov-cl1 trans-04 js-name-b2 p-b-6"
          >
            <%= product.name %>
          </a>

          <span class="stext-105 cl3"> <%= product.price %> </span>
        </div>

        <div class="block2-txt-child2 flex-r p-t-3">
          <a
            href="#"
            class="btn-addwish-b2 dis-block pos-relative js-addwish-b2"
            data-id="<%= product.id %>"
          >
            <img
              class="icon-heart1 dis-block trans-04"
              src="<%= product.wishListIcon.default %>"
              alt="ICON"
            />
            <img
              class="icon-heart2 dis-block trans-04 ab-t-l"
              src="<%= product.wishListIcon.active %>"
              alt="ICON"
            />
          </a>
        </div>
      </div>
    </div>
  </div>
  <% }); %>
</div> -->