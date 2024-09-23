function updateQuantity(productId, changeQuantity, stock) {
  const inputField = document.querySelector(
    `input[name="num-product${productId}"]`
  );
  const currentQuantity = parseInt(inputField.value);
  const newQuantity = currentQuantity + changeQuantity;
  const feedback = document.getElementById(`feedback-${productId}`);
  const maxQuantityPerPerson = 3;

  if (newQuantity > stock) {
    feedback.style.display = "block";
    feedback.textContent = "Stock limit exceeded!";
    inputField.value = stock;
  } else if (newQuantity > maxQuantityPerPerson) {
    feedback.textContent = "Maximum 3 units per product.";
    feedback.style.display = "block";
    inputField.value = maxQuantityPerPerson;
  } else if (newQuantity <= 0) {
    inputField.value = 1;
    feedback.style.display = "none";
  } else {
    inputField.value = newQuantity;
    feedback.style.display = "none";

    // Update local storage
    const cart = JSON.parse(localStorage.getItem("cart")) || {
      products: [],
      totalPrice: 0,
      coupon: null,
    };

    const productIndex = cart.products.findIndex(
      (item) => item.productId === productId
    );

    if (productIndex !== -1) {
      cart.products[productIndex].quantity = newQuantity;

      let subtotal = 0;
      cart.products.forEach((item) => {
        subtotal += item.price * item.quantity;
      });

      cart.totalPrice = subtotal;
      localStorage.setItem("cart", JSON.stringify(cart));

      document.getElementById("subtotal").innerText = `₹ ${subtotal.toFixed(
        2
      )}`;
      document.getElementById("totalAmount").innerText = `₹ ${subtotal.toFixed(
        2
      )}`;
    }

    axios
      .patch("/cart/update-quantity", {
        productId,
        changeQuantity,
        totalPrice: cart.totalPrice,
      })
      .then((response) => {
        const product = response.data.product;
        const totalPrice = response.data.cartTotal;

        document.getElementById(`totalPrice-${productId}`).innerHTML = (
          product.price * product.quantity
        ).toFixed(2);

        Swal.fire({
          toast: true,
          icon: "success",
          title: "Quantity updated",
          position: "bottom",
          showConfirmButton: false,
          timer: 2000,
        });
      })
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error updating quantity. Try again.",
        });
      });
  }
}

function removeFromCart(productId) {
  event.preventDefault();

  Swal.fire({
    title: "Are you sure?",
    text: "You can't revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      axios
        .delete(`/cart/product/${productId}`)
        .then((response) => {
          // Remove the product row from the DOM
          document.querySelector(`tr[data-product-id='${productId}']`).remove();

          // Get the current cart from localStorage
          const cart = JSON.parse(localStorage.getItem("cart")) || {
            products: [],
            totalPrice: 0,
            coupon: null,
          };

          // Filter out the removed product
          const removedProduct = cart.products.find(
            (item) => item.productId === productId
          );
          cart.products = cart.products.filter(
            (item) => item.productId !== productId
          );

          // Recalculate the subtotal (sum of all products' price * quantity)
          let subtotal = 0;
          cart.products.forEach((item) => {
            subtotal += item.price * item.quantity; // Assuming item.price is available in the cart
          });

          // Handle coupon recalculation if it exists
          // if (cart.coupon) {
          //   const discountPercentage = cart.coupon.discountPercentage;
          //   const maxDiscountAmount = cart.coupon.maxDiscountAmount;
          //   let discountAmount = (discountPercentage / 100) * subtotal;
          //   if (maxDiscountAmount < discountAmount) {
          //     discountAmount = maxDiscountAmount;
          //   }
          //   cart.coupon.discountAmount = discountAmount;
          //   cart.totalPrice = subtotal - discountAmount;
          // } else {
          // No coupon, total price is the subtotal
          cart.totalPrice = subtotal;
          // }

          // Update the cart in localStorage
          localStorage.setItem("cart", JSON.stringify(cart));

          // Update the subtotal and total price in the DOM
          document.getElementById("subtotal").innerText = `₹ ${subtotal.toFixed(
            2
          )}`;
          // if (cart.coupon) {
          //   document.getElementById(
          //     "couponDiscountAmount"
          //   ).innerText = `₹ ${cart.coupon.discountAmount.toFixed(2)}`;
          //   document.getElementById(
          //     "totalAmount"
          //   ).innerText = `₹ ${cart.totalPrice.toFixed(2)}`;
          // } else {
          document.getElementById(
            "totalAmount"
          ).innerText = `₹ ${subtotal.toFixed(2)}`;
          // }

          // Display success message
          Swal.fire({
            toast: true,
            icon: "success",
            title: "Product removed",
            position: "bottom",
            showConfirmButton: false,
            timer: 2000,
          }).then(() => {
            const cartIcon = document.getElementById("cartIcon");
            if (cartIcon) {
              cartIcon.setAttribute("data-notify", cart.products.length);
            }
          });
        })
        .catch((error) => {
          console.error("Error removing product from cart:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error.response.data.message,
            showConfirmButton: true,
          });
        });
    }
  });
}
