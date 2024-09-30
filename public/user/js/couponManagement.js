import validationUtils from "./validationUtils.js";

// Input event listeners for real-time validation
document.getElementById("couponCode").addEventListener("input", function () {
  validationUtils.validateRequiredField(this, "Coupon code is required.");
});

document.getElementById("description").addEventListener("input", function () {
  validationUtils.validateRequiredField(this, "Description is required.");
});

document
  .getElementById("discountPercentage")
  .addEventListener("input", function () {
    validationUtils.validateNumber(
      this,
      "Discount percentage must be greater than zero.",
      { min: 1 }
    );
  });

// document.getElementById("expiryDate").addEventListener("input", function () {
//   validationUtils.validateRequiredField(
//     this,
//     "Coupon expiry date is required."
//   );
// });

document.getElementById("expiryDate").addEventListener("input", function () {
  validationUtils.validateFutureDate(
    this,
    "The date must be greater than today."
  );
});

document
  .getElementById("minimumPurchase")
  .addEventListener("input", function () {
    validationUtils.validateNumber(
      this,
      "Minimum purchase amount must be zero or greater.",
      { min: 0 }
    );
  });

document
  .getElementById("maximumDiscount")
  .addEventListener("input", function () {
    validationUtils.validateNumber(
      this,
      "Maximum discount amount must be zero or greater.",
      { min: 0 }
    );
  });

document.getElementById("usageLimit").addEventListener("input", function () {
  validationUtils.validateNumber(
    this,
    "Usage limit must be greater than zero.",
    { min: 1 }
  );
});

// Form validation on submit
document
  .getElementById("createCouponForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const isValid = validationUtils.validateForm("createCouponForm", [
      {
        id: "couponCode",
        type: "required",
        message: "Coupon code is required.",
      },
      {
        id: "description",
        type: "required",
        message: "Description is required.",
      },
      {
        id: "discountPercentage",
        type: "nonNegative",
        message: "Discount percentage must be greater than zero.",
        options: { min: 1 },
      },
      {
        id: "expiryDate",
        type: "futureDate",
        message: "Expiry date is required.",
      },
      {
        id: "minimumPurchase",
        type: "nonNegative",
        message: "Minimum purchase amount must be zero or greater.",
        options: { min: 0 },
      },
      {
        id: "maximumDiscount",
        type: "nonNegative",
        message: "Maximum discount amount must be zero or greater.",
        options: { min: 0 },
      },
      {
        id: "usageLimit",
        type: "nonNegative",
        message: "Usage limit must be greater than zero.",
        options: { min: 1 },
      },
    ]);

    if (isValid) {
      // Axios POST request
      const code = document
        .getElementById("couponCode")
        .value.trim()
        .toUpperCase();
      const expiryDate = document.getElementById("expiryDate").value;
      const description = document.getElementById("description").value.trim();
      const discountPercentage = document
        .getElementById("discountPercentage")
        .value.trim();
      const minPurchaseAmount = document
        .getElementById("minimumPurchase")
        .value.trim();
      const maxDiscountAmount = document
        .getElementById("maximumDiscount")
        .value.trim();
      const usageLimit = document.getElementById("usageLimit").value.trim();

      axios
        .post("/admin/coupons", {
          code,
          expiryDate,
          description,
          discountPercentage,
          minPurchaseAmount,
          maxDiscountAmount,
          usageLimit,
        })
        .then((response) => {
          if (response.data.success) {
            Swal.fire(
              "Coupon Created",
              "The coupon has been created successfully.",
              "success"
            ).then(() => {
              $("#createCouponModal").modal("hide");
              document.getElementById("createCouponForm").reset();
              window.location.reload(); // Reload the page to see the edit coupon
            });
          } else {
            Swal.fire(
              "Error",
              "There was a problem creating the coupon.",
              "error"
            );
          }
        })
        .catch((error) => {
          Swal.fire("Error", "A server error occurred.", "error");
        });
    } else {
      Swal.fire({
        title: "Validation Errors!",
        text: "Please correct the highlighted errors.",
        icon: "error",
        confirmButtonText: "Okay",
      });
    }
  });

//edit coupon part

document
  .getElementById("editCouponCode")
  .addEventListener("input", function () {
    validationUtils.validateRequiredField(this, "Coupon code is required.");
  });

document
  .getElementById("editCouponDescription")
  .addEventListener("input", function () {
    validationUtils.validateRequiredField(this, "Description is required.");
  });

document
  .getElementById("editCouponDiscount")
  .addEventListener("input", function () {
    validationUtils.validateNumber(
      this,
      "Discount percentage must be greater than zero.",
      { min: 1 }
    );
  });

document
  .getElementById("editCouponExpiry")
  .addEventListener("input", function () {
    validationUtils.validateRequiredField(
      this,
      "Coupon expiry date is required."
    );
  });

document
  .getElementById("editCouponExpiry")
  .addEventListener("input", function () {
    validationUtils.validateFutureDate(
      this,
      "The date must be greater than today."
    );
  });

document
  .getElementById("editCouponMinPurchase")
  .addEventListener("input", function () {
    validationUtils.validateNumber(
      this,
      "Minimum purchase amount must be zero or greater.",
      { min: 0 }
    );
  });

document
  .getElementById("editMaximumDiscount")
  .addEventListener("input", function () {
    validationUtils.validateNumber(
      this,
      "Maximum discount amount must be zero or greater.",
      { min: 0 }
    );
  });

document
  .getElementById("editCouponUsageLimit")
  .addEventListener("input", function () {
    validationUtils.validateNumber(
      this,
      "Usage limit must be greater than zero.",
      { min: 1 }
    );
  });

// Form validation on submit
document
  .getElementById("editCouponForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const isValid = validationUtils.validateForm("editCouponForm", [
      {
        id: "editCouponCode",
        type: "required",
        message: "Coupon code is required.",
      },
      {
        id: "editCouponDescription",
        type: "required",
        message: "Description is required.",
      },
      {
        id: "editCouponDiscount",
        type: "nonNegative",
        message: "Discount percentage must be greater than zero.",
        options: { min: 1 },
      },
      {
        id: "editCouponExpiry",
        type: "required",
        message: "Coupon expiry date is required.",
      },
      {
        id: "editCouponExpiry",
        type: "futureDate",
        message: "The date must be greater than today.",
      },
      {
        id: "editCouponMinPurchase",
        type: "nonNegative",
        message: "Minimum purchase amount must be zero or greater.",
        options: { min: 0 },
      },
      {
        id: "editMaximumDiscount",
        type: "nonNegative",
        message: "Maximum discount amount must be zero or greater.",
        options: { min: 0 },
      },
      {
        id: "editCouponUsageLimit",
        type: "nonNegative",
        message: "Usage limit must be greater than zero.",
        options: { min: 1 },
      },
    ]);

    if (isValid) {
      // Axios PUT request to update the coupon
      const couponId = document.getElementById("editCouponId").value;
      const updatedCouponCode = document
        .getElementById("editCouponCode")
        .value.trim()
        .toUpperCase();
      const updatedCouponExpiry =
        document.getElementById("editCouponExpiry").value;
      const updatedCouponDescription = document
        .getElementById("editCouponDescription")
        .value.trim();
      const updatedCouponDiscount = document
        .getElementById("editCouponDiscount")
        .value.trim();
      const updatedCouponMinPurchase = document
        .getElementById("editCouponMinPurchase")
        .value.trim();
      const updatedCouponUsageLimit = document
        .getElementById("editCouponUsageLimit")
        .value.trim();
      const updatedCouponMaxDiscount = document
        .getElementById("editMaximumDiscount")
        .value.trim();

      axios
        .put("/admin/coupons/" + couponId, {
          code: updatedCouponCode,
          expiryDate: updatedCouponExpiry,
          description: updatedCouponDescription,
          discountPercentage: updatedCouponDiscount,
          minimumPurchase: updatedCouponMinPurchase,
          usageLimit: updatedCouponUsageLimit,
          maximumDiscount: updatedCouponMaxDiscount,
        })
        .then((response) => {
          if (response.data.updatedCoupon) {
            Swal.fire(
              "Coupon Updated",
              "The coupon has been updated successfully.",
              "success"
            ).then(() => {
              $("#editCouponModal").modal("hide");
              window.location.reload();
            });
          } else {
            Swal.fire(
              "Error",
              "There was a problem updating the coupon.",
              "error"
            );
          }
        })
        .catch((error) => {
          Swal.fire("Error", "A server error occurred.", "error");
        });
    } else {
      Swal.fire({
        title: "Validation Errors!",
        text: "Please correct the highlighted errors.",
        icon: "error",
        confirmButtonText: "Okay",
      });
    }
  });
