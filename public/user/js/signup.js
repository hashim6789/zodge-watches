document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("signUpForm");
  const firstNameInput = document.getElementById("firstName");
  const lastNameInput = document.getElementById("lastName");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");

  // Validate first name
  function validateFirstName() {
    const firstName = firstNameInput.value.trim();
    if (firstName) {
      firstNameInput.classList.remove("is-invalid");
      firstNameInput.classList.add("is-valid");
    } else {
      firstNameInput.classList.remove("is-valid");
      firstNameInput.classList.add("is-invalid");
    }
  }

  // Validate last name
  function validateLastName() {
    const lastName = lastNameInput.value.trim();
    if (lastName) {
      lastNameInput.classList.remove("is-invalid");
      lastNameInput.classList.add("is-valid");
    } else {
      lastNameInput.classList.remove("is-valid");
      lastNameInput.classList.add("is-invalid");
    }
  }

  // Validate email
  function validateEmail() {
    const email = emailInput.value;
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    if (emailPattern.test(email)) {
      emailInput.classList.remove("is-invalid");
      emailInput.classList.add("is-valid");
    } else {
      emailInput.classList.remove("is-valid");
      emailInput.classList.add("is-invalid");
    }
  }

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
  firstNameInput.addEventListener("input", validateFirstName);
  lastNameInput.addEventListener("input", validateLastName);
  emailInput.addEventListener("input", validateEmail);

  passwordInput.addEventListener("input", validatePassword);
  confirmPasswordInput.addEventListener("input", validateConfirmPassword);

  // Form submit validation
  form.addEventListener("submit", function (event) {
    validateFirstName();
    validateLastName();
    validateEmail();

    validatePassword();
    validateConfirmPassword();

    if (
      !firstNameInput.classList.contains("is-valid") ||
      !lastNameInput.classList.contains("is-valid") ||
      !emailInput.classList.contains("is-valid") ||
      !passwordInput.classList.contains("is-valid") ||
      !confirmPasswordInput.classList.contains("is-valid")
    ) {
      event.preventDefault();
      event.stopPropagation();
    }

    form.classList.add("was-validated");
  });
});
