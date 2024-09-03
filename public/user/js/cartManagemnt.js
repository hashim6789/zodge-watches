//for update the quantity of the product in the cart

function updateQuantity(productId, changeQuantity, stock) {
  const inputField = document.querySelector(
    `input[name="num-product${productId}"]`
  );
  const currentQuantity = parseInt(inputField.value);
  const newQuantity = currentQuantity + changeQuantity;
  const feedback = document.getElementById(`feedback-${productId}`);
  const maxQuantityPerPerson = 3;

  if (newQuantity > stock) {
    // Display feedback and prevent quantity change
    feedback.style.display = "block";
    inputField.value = stock;
  } else if (newQuantity > maxQuantityPerPerson) {
    feedback.textContent = "You can purchase a maximum of 3 units per product.";
    feedback.style.display = "block";
    inputField.value = maxQuantityPerPerson;
  } else if (newQuantity <= 0) {
    // Ensure quantity doesn't go below 1
    inputField.value = 1;
    feedback.style.display = "none";
  } else {
    // Update quantity and hide feedback
    inputField.value = newQuantity;
    feedback.style.display = "none";

    // Update local storage
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const productIndex = cart.findIndex((item) => item.productId === productId);

    if (productIndex !== -1) {
      cart[productIndex].quantity = newQuantity;
      localStorage.setItem("cart", JSON.stringify(cart));
    }

    // Send the updated quantity to the server
    axios
      .patch("/cart/update-quantity", {
        productId,
        changeQuantity,
      })
      .then((response) => {
        const product = response.data.product;
        console.log("Quantity updated:", product);

        // Update the product total price and cart subtotal in the UI
        document.getElementById(`totalPrice-${productId}`).innerText = (
          product.price * product.quantity
        ).toFixed(2);
        document.getElementById("subtotal").innerHTML =
          response.data.cartTotal.toFixed(2);

        // SweetAlert2 Toast notification for success
        Swal.fire({
          toast: true, // Enables Toast mode
          icon: "success", // Shows a success icon
          title: "Quantity updated successfully", // Message displayed in the toast
          position: "bottom", // Position at the bottom right
          showConfirmButton: false, // Hides the confirm button
          timer: 2000, // Display for 2 seconds
          timerProgressBar: true, // Shows a progress bar for the timer
          didOpen: (toast) => {
            toast.addEventListener("mouseenter", Swal.stopTimer); // Stops the timer when mouse is over the toast
            toast.addEventListener("mouseleave", Swal.resumeTimer); // Resumes the timer when mouse leaves the toast
          },
        });
      })
      .catch((error) => {
        console.error("Error updating quantity:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while updating the quantity. Please try again.",
          confirmButtonText: "OK",
        });
      });
  }
}

//   for remove the product from the cart

function removeFromCart(productId) {
  event.preventDefault(); // Prevent form submission

  // Use SweetAlert2 to create a confirmation dialog
  Swal.fire({
    title: "Are you sure?", // The title of the alert
    text: "You won't be able to revert this!", // Additional text to show in the alert
    icon: "warning", // The icon type (warning, error, success, info)
    showCancelButton: true, // Display the cancel button
    confirmButtonColor: "#3085d6", // The color of the confirm button
    cancelButtonColor: "#d33", // The color of the cancel button
    confirmButtonText: "Yes, delete it!", // The text of the confirm button
    cancelButtonText: "Cancel", // The text of the cancel button
  }).then((result) => {
    if (result.isConfirmed) {
      // If the user confirms, proceed with the deletion
      axios
        .delete(`/cart/product/${productId}`)
        .then((response) => {
          console.log("Product deleted from the cart", response.data);

          // Remove the row of the deleted product from the table
          const productRow = document.querySelector(
            `tr[data-product-id='${productId}']`
          );
          if (productRow) {
            productRow.remove();
          }

          // Update subtotal in the UI
          document.getElementById("subtotal").innerHTML =
            response.data.cart.totalPrice.toFixed(2);

          // Remove the product from local storage
          const cart = JSON.parse(localStorage.getItem("cart")) || [];
          const updatedCart = cart.filter(
            (item) => item.productId !== productId
          );
          localStorage.setItem("cart", JSON.stringify(updatedCart));

          // SweetAlert2 Toast notification for product removal
          Swal.fire({
            toast: true,
            icon: "success",
            title: "Product removed from the cart successfully",
            position: "bottom",
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener("mouseenter", Swal.stopTimer);
              toast.addEventListener("mouseleave", Swal.resumeTimer);
            },
          });
        })
        .catch((err) => {
          console.error("Error deleting product from the cart:", err);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "An error occurred while removing the product from the cart. Please try again.",
            confirmButtonText: "OK",
          });
        });
    }
  });
}
