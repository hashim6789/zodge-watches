document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const forgotEmailInput = document.getElementById("forgotEmail");

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

  // Attach event listeners
  emailInput.addEventListener("input", validateEmail);
  passwordInput.addEventListener("input", validatePassword);
  forgotEmailInput.addEventListener("input", validateForgotEmail);

  // Form submit validation
  form.addEventListener("submit", function (event) {
    validateEmail();
    validatePassword();

    if (
      !emailInput.classList.contains("is-valid") ||
      !passwordInput.classList.contains("is-valid")
    ) {
      event.preventDefault();
      event.stopPropagation();
    }

    form.classList.add("was-validated");
  });

  //forgot password email validation
  function validateForgotEmail() {
    const email = forgotEmailInput.value;
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    if (emailPattern.test(email)) {
      forgotEmailInput.classList.remove("is-invalid");
      forgotEmailInput.classList.add("is-valid");
    } else {
      forgotEmailInput.classList.remove("is-valid");
      forgotEmailInput.classList.add("is-invalid");
    }
  }
});

document
  .getElementById("forgotPasswordForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("forgotEmail").value;

    axios
      .post("/auth/reset-password", {
        email: email,
      })
      .then((response) => {
        // $("#forgotPasswordModal").modal("hide");
        Swal.fire({
          title: "Success!",
          text: `${response.data.message}`,
          icon: "success",
          confirmButtonText: "OK",
        });
      })
      .catch((error) => {
        console.error("There was an error resetting the password!", error);
        Swal.fire({
          title: "Error!",
          text: `${error.response.data.message}`,
          icon: "error",
          confirmButtonText: "OK",
        });
      });
  });
