document.addEventListener("DOMContentLoaded", function () {
  const signUpForm = document.getElementById("signUpForm");
  const loginForm = document.getElementById("loginForm");

  const firstNameInput = document.getElementById("firstName");
  const lastNameInput = document.getElementById("lastName");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");

  const loginEmailInput = document.getElementById("loginEmail");
  const loginPasswordInput = document.getElementById("loginPassword");

  // Utility function to manage feedback
  function setFeedback(inputElement, feedbackElement, isValid, message) {
    if (isValid) {
      inputElement.classList.remove("is-invalid");
      inputElement.classList.add("is-valid");
      feedbackElement.classList.remove("invalid-feedback");
      feedbackElement.classList.add("valid-feedback");
      feedbackElement.textContent = message;
    } else {
      inputElement.classList.remove("is-valid");
      inputElement.classList.add("is-invalid");
      feedbackElement.classList.remove("valid-feedback");
      feedbackElement.classList.add("invalid-feedback");
      feedbackElement.textContent = message;
    }
  }

  // Sign Up validation functions
  function validateFirstName() {
    const firstName = firstNameInput.value.trim();
    setFeedback(
      firstNameInput,
      document.getElementById("firstNameFeedback"),
      firstName,
      "Looks good!"
    );
  }

  function validateLastName() {
    const lastName = lastNameInput.value.trim();
    setFeedback(
      lastNameInput,
      document.getElementById("lastNameFeedback"),
      lastName,
      "Looks good!"
    );
  }

  function validateEmail() {
    const email = emailInput.value;
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    setFeedback(
      emailInput,
      document.getElementById("emailFeedback"),
      emailPattern.test(email),
      "Valid email address!"
    );
  }

  function validatePassword() {
    const password = passwordInput.value;
    setFeedback(
      passwordInput,
      document.getElementById("passwordFeedback"),
      password.length >= 6,
      "Password is strong!"
    );
  }

  function validateConfirmPassword() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    setFeedback(
      confirmPasswordInput,
      document.getElementById("confirmPasswordFeedback"),
      confirmPassword === password && confirmPassword.length >= 6,
      "Passwords match!"
    );
  }

  // Login validation functions
  function validateLoginEmail() {
    const email = loginEmailInput.value;
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    setFeedback(
      loginEmailInput,
      document.getElementById("loginEmailFeedback"),
      emailPattern.test(email),
      "Valid email address!"
    );
  }

  function validateLoginPassword() {
    const password = loginPasswordInput.value;
    setFeedback(
      loginPasswordInput,
      document.getElementById("loginPasswordFeedback"),
      password.length >= 6,
      "Password is strong!"
    );
  }

  // Attach event listeners for Sign Up form
  firstNameInput.addEventListener("input", validateFirstName);
  lastNameInput.addEventListener("input", validateLastName);
  emailInput.addEventListener("input", validateEmail);
  passwordInput.addEventListener("input", validatePassword);
  confirmPasswordInput.addEventListener("input", validateConfirmPassword);

  signUpForm.addEventListener("submit", function (event) {
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
      event.preventDefault(); // Prevent form submission
    }
  });

  // Attach event listeners for Login form
  loginEmailInput.addEventListener("input", validateLoginEmail);
  loginPasswordInput.addEventListener("input", validateLoginPassword);

  loginForm.addEventListener("submit", function (event) {
    validateLoginEmail();
    validateLoginPassword();

    if (
      !loginEmailInput.classList.contains("is-valid") ||
      !loginPasswordInput.classList.contains("is-valid")
    ) {
      event.preventDefault(); // Prevent form submission
    }
  });
});
