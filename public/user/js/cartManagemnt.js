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

    // Find the product in the cart
    const productIndex = cart.products.findIndex(
      (item) => item.productId === productId
    );

    if (productIndex !== -1) {
      // Update the product quantity
      cart.products[productIndex].quantity = newQuantity;

      // Recalculate the subtotal (sum of all products' price * quantity)
      let subtotal = 0;
      cart.products.forEach((item) => {
        subtotal += item.price * item.quantity;
      });

      // If a coupon is applied, recalculate the discount
      if (cart.coupon) {
        const discountPercentage = cart.coupon.discountPercentage;
        const maxDiscountAmount = cart.coupon.maxDiscountAmount;
        let discountAmount = (discountPercentage / 100) * subtotal;
        if (maxDiscountAmount < discountAmount) {
          discountAmount = maxDiscountAmount;
        }
        cart.coupon.discountAmount = discountAmount;
        cart.totalPrice = subtotal - discountAmount;
      } else {
        // If no coupon, total price is just the subtotal
        cart.totalPrice = subtotal;
      }

      // Update the cart in local storage
      localStorage.setItem("cart", JSON.stringify(cart));

      // Update DOM elements to reflect the new subtotal and total price
      document.getElementById("subtotal").innerText = `₹ ${subtotal.toFixed(
        2
      )}`;
      if (cart.coupon) {
        document.getElementById(
          "couponDiscountAmount"
        ).innerText = `₹ ${cart.coupon.discountAmount.toFixed(2)}`;
        document.getElementById(
          "totalAmount"
        ).innerText = `₹ ${cart.totalPrice.toFixed(2)}`;
      } else {
        document.getElementById(
          "totalAmount"
        ).innerText = `₹ ${subtotal.toFixed(2)}`;
      }
    }

    console.log(cart.totalPrice);
    // Update server (if needed)
    axios
      .patch("/cart/update-quantity", {
        productId,
        changeQuantity,
        totalPrice: cart.totalPrice,
      })
      .then((response) => {
        const product = response.data.product;
        const totalPrice = response.data.cartTotal;

        console.log("total price = ", totalPrice);
        console.log("total", product);

        document.getElementById(`totalPrice-${productId}`).innerHTML = (
          product.price * product.quantity
        ).toFixed(2);
        // document.getElementById("subtotal").innerText = newSubtotal.toFixed(2);

        // Handle coupon and update total price
        // if (cart.coupon) {
        //   const newTotalWithDiscount = newSubtotal - cart.coupon.discountAmount;
        //   document.getElementById(
        //     "totalAmount"
        //   ).innerText = `₹ ${newTotalWithDiscount.toFixed(2)}`;
        // } else {
        //   document.getElementById(
        //     "totalAmount"
        //   ).innerText = `₹ ${newSubtotal.toFixed(2)}`;
        // }

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
        console.error("Error updating quantity:", error);
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
          cart.products = cart.products.filter(
            (item) => item.productId !== productId
          );

          // Recalculate the subtotal (sum of all products' price * quantity)
          let subtotal = 0;
          cart.products.forEach((item) => {
            subtotal += item.price * item.quantity;
          });

          // Handle coupon recalculation if it exists
          if (cart.coupon) {
            const discountPercentage = cart.coupon.discountPercentage;
            const maxDiscountAmount = cart.coupon.maxDiscountAmount;
            let discountAmount = (discountPercentage / 100) * subtotal;
            if (maxDiscountAmount < discountAmount) {
              discountAmount = maxDiscountAmount;
            }
            cart.coupon.discountAmount = discountAmount;
            cart.totalPrice = subtotal - discountAmount;
          } else {
            // No coupon, total price is the subtotal
            cart.totalPrice = subtotal;
          }

          // Update the cart in localStorage
          localStorage.setItem("cart", JSON.stringify(cart));

          // Update the subtotal and total price in the DOM
          document.getElementById("subtotal").innerText = `₹ ${subtotal.toFixed(
            2
          )}`;
          if (cart.coupon) {
            document.getElementById(
              "couponDiscountAmount"
            ).innerText = `₹ ${cart.coupon.discountAmount.toFixed(2)}`;
            document.getElementById(
              "totalAmount"
            ).innerText = `₹ ${cart.totalPrice.toFixed(2)}`;
          } else {
            document.getElementById(
              "totalAmount"
            ).innerText = `₹ ${subtotal.toFixed(2)}`;
          }

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
          console.error("Error removing product:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Could not remove the product. Try again.",
          });
        });
    }
  });
}
