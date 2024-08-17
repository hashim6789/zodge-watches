document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("resetPasswordForm");
  const passwordInput = document.getElementById("newPassword");
  const confirmPasswordInput = document.getElementById("confirmPassword");

  // Validate password
  function validatePassword() {
    const password = passwordInput.value;
    if (password.length >= 6) {
      passwordInput.classList.remove("is-invalid");
      passwordInput.classList.add("is-valid");
    } else {
      passwordInput.classList.remove("is-valid");
      passwordInput.classList.add("is-invalid");
    }
  }

  // Validate confirm password
  function validateConfirmPassword() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    if (confirmPassword === password && confirmPassword.length >= 6) {
      confirmPasswordInput.classList.remove("is-invalid");
      confirmPasswordInput.classList.add("is-valid");
    } else {
      confirmPasswordInput.classList.remove("is-valid");
      confirmPasswordInput.classList.add("is-invalid");
    }
  }

  // Attach event listeners

  passwordInput.addEventListener("input", validatePassword);
  confirmPasswordInput.addEventListener("input", validateConfirmPassword);

  // Form submit validation
  form.addEventListener("submit", function (event) {
    validatePassword();
    validateConfirmPassword();

    if (
      !passwordInput.classList.contains("is-valid") ||
      !confirmPasswordInput.classList.contains("is-valid")
    ) {
      event.preventDefault();
      event.stopPropagation();
    }

    form.classList.add("was-validated");
  });
});
