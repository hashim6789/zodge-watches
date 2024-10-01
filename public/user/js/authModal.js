document.addEventListener("DOMContentLoaded", function () {
  initializeForms();
  //   initializeOtpInputs();
});

// function initializeForms() {
// Handle Login Form Submission
//   const loginForm = document.getElementById("loginForm");
//   if (loginForm) {
//     loginForm.addEventListener("submit", async function (event) {
//       event.preventDefault();
//       const email = document.getElementById("loginEmail").value;
//       const password = document.getElementById("loginPassword").value;
//       try {
//         const response = await axios.post("/auth/login", { email, password });
//         alert("Login Successful: " + response.data.message);
//         window.location.href = "/"; // Redirect on success
//       } catch (error) {
//         const feedbackDiv = document.getElementById("loginEmailFeedback");
//         feedbackDiv.textContent =
//           error.response?.data.message || "An unexpected error occurred.";
//       }
//     });
//   }
//   // Handle Sign Up Form Submission
//   const signUpForm = document.getElementById("signUpForm");
//   if (signUpForm) {
//     signUpForm.addEventListener("submit", async function (event) {
//       event.preventDefault();
//       const firstName = document.getElementById("firstName").value;
//       const lastName = document.getElementById("lastName").value;
//       const email = document.getElementById("email").value;
//       const password = document.getElementById("password").value;
//       const confirmPassword = document.getElementById("confirmPassword").value;
//       try {
//         const response = await axios.post("/auth/signup", {
//           firstName,
//           lastName,
//           email,
//           password,
//           confirmPassword,
//         });
//         alert("Sign Up Successful: " + response.data.message);
//         $("#otpModal").modal("show"); // Show OTP modal on success
//       } catch (error) {
//         const feedbackDiv = document.getElementById("emailFeedback");
//         feedbackDiv.textContent =
//           error.response?.data.message || "An unexpected error occurred.";
//       }
//     });
//   }
// Handle Forgot Password Form Submission
//   const forgotPasswordForm = document.getElementById("forgotPasswordForm");
//   if (forgotPasswordForm) {
//     forgotPasswordForm.addEventListener("submit", async function (event) {
//       event.preventDefault();
//       const email = document.getElementById("forgotPasswordEmail").value;
//       try {
//         const response = await axios.post("/auth/forgot-password", { email });
//         alert("Reset link sent to your email: " + response.data.message);
//       } catch (error) {
//         const feedbackDiv = document.getElementById("forgotPasswordFeedback");
//         feedbackDiv.textContent =
//           error.response?.data.message || "An unexpected error occurred.";
//       }
//     });
//   }
// }

const otpInputs = document.querySelectorAll(".otp-input");
const otpForm = document.getElementById("otpForm");
const resendLink = document.getElementById("resendOtpLink");
const countdownSpan = document.getElementById("countdown");
let countdownInterval;
// Timer Function
function startTimer(duration) {
  let timer = duration;
  countdownInterval = setInterval(() => {
    countdownSpan.textContent = timer;
    if (--timer < 0) {
      clearInterval(countdownInterval);
      resendLink.style.display = "inline"; // Show Resend OTP link
    }
  }, 1000);
}
function initializeOtpInputs() {
  // OTP Input Focus Handling
  otpInputs.forEach((input, index) => {
    input.addEventListener("input", (e) =>
      handleOtpInputChange(e, index, otpInputs)
    );
    input.addEventListener("keydown", (e) =>
      handleOtpBackspace(e, index, otpInputs)
    );
  });
  // Initialize timer
  startTimer(60);

  // OTP Form Submission
  otpForm.addEventListener("submit", handleOtpFormSubmit);
  resendLink.addEventListener("click", handleResendOtp);
}

function handleOtpInputChange(e, index, otpInputs) {
  if (e.inputType === "deleteContentBackward" && index > 0) {
    otpInputs[index - 1].focus();
  } else if (
    otpInputs[index].value.length === 1 &&
    index < otpInputs.length - 1
  ) {
    otpInputs[index + 1].focus();
  }
}

function handleOtpBackspace(e, index, otpInputs) {
  if (
    e.key === "Backspace" &&
    otpInputs[index].value.length === 0 &&
    index > 0
  ) {
    otpInputs[index - 1].focus();
  }
}

async function handleOtpFormSubmit(e) {
  e.preventDefault();
  const otpValue = Array.from(document.querySelectorAll(".otp-input"))
    .map((input) => input.value)
    .join("");

  if (otpValue.length === 6) {
    try {
      const response = await axios.post("/auth/api/verify-otp", {
        otp: otpValue,
      });
      alert("OTP verified successfully!");
      document.getElementById("otpModal").style.display = "none";
      // Redirect or perform next action
    } catch (error) {
      alert("OTP verification failed. Please try again.");
    }
  } else {
    alert("Please enter a valid 6-digit OTP");
  }
}

async function handleResendOtp(e) {
  e.preventDefault();
  try {
    const response = await axios.post("/auth/api/resend-otp");
    alert("OTP resent successfully!");
    document.getElementById("resendOtpLink").style.display = "none"; // Hide Resend link
    startTimer(60); // Restart timer
  } catch (error) {
    alert("Failed to resend OTP. Please try again.");
  }
}

function initializeForms() {
  const loginForm = document.getElementById("loginForm");
  const signUpForm = document.getElementById("signUpForm");

  signUpForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    console.log("testing");
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const signupButton = event.target.querySelector('button[type="submit"]');
    signupButton.disabled = true;

    try {
      const response = await axios.post("/auth/signup", {
        firstName,
        lastName,
        email,
        password,
      });

      // Check and initialize localStorage with wishlist and cart if not already initialized
      const wishlistFromDB = response.data.wishlist || [];
      const cartFromDB = response.data.cart || {};

      console.log("wishlist = ", wishlistFromDB);
      console.log("cart = ", cartFromDB);

      if (!localStorage.getItem("wishlist")) {
        localStorage.setItem("wishlist", JSON.stringify(wishlistFromDB));
      }

      if (!localStorage.getItem("cart")) {
        localStorage.setItem("cart", JSON.stringify(cartFromDB));
      }

      Swal.fire({
        icon: "success",
        title: "Sign Up Successful",
        text: response.data.message,
        showConfirmButton: true,
      }).then(() => {
        $(".modal").modal("hide");
        $(".modal-backdrop").remove();

        // Show the OTP modal
        setTimeout(() => {
          $("#otpModal").modal("show");
          initializeOtpInputs();
        }, 300);
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Sign Up Failed",
        text:
          error.response?.data?.message ||
          "An unexpected error occurred. Please try again later.",
        showConfirmButton: true,
      }).then(() => {
        signupButton.disabled = false;
      });
    } finally {
      signupButton.disabled = false;
    }
  });

  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      const response = await axios.post("/auth/login", { email, password });

      // Check and initialize localStorage with wishlist and cart if not already initialized
      const wishlistFromDB = response.data.wishlist || [];
      const cartFromDB = response.data.cart || [];

      console.log("wishlist = ", wishlistFromDB);
      console.log("cart = ", cartFromDB);

      if (!localStorage.getItem("wishlist")) {
        localStorage.setItem("wishlist", JSON.stringify(wishlistFromDB));
      }

      if (!localStorage.getItem("cart")) {
        localStorage.setItem("cart", JSON.stringify(cartFromDB));
      }

      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: response.data.message,
        showConfirmButton: true,
      }).then(() => {
        window.location.href = "/"; // Redirect on success
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text:
          error.response?.data?.message ||
          "An unexpected error occurred. Please try again later.",
        showConfirmButton: true,
      });
    }
  });

  // Handle Signup Form Submission
  // signUpForm.addEventListener("submit", async function (event) {
  //   event.preventDefault();
  //   $("#signupModal").modal("hide");

  //   const firstName = document.getElementById("firstName").value;
  //   const lastName = document.getElementById("lastName").value;
  //   const email = document.getElementById("email").value;
  //   const password = document.getElementById("password").value;
  //   const confirmPassword = document.getElementById("confirmPassword").value;

  //   // Disable the signup button to prevent duplicate submissions
  //   const signupButton = event.target.querySelector('button[type="submit"]');
  //   signupButton.disabled = true;

  //   try {
  //     const response = await axios.post("/auth/signup", {
  //       firstName,
  //       lastName,
  //       email,
  //       password,
  //     });

  //     Swal.fire({
  //       icon: "success",
  //       title: "Sign Up Successful",
  //       text: response.data.message,
  //       showConfirmButton: true,
  //     }).then(() => {
  //       $(".modal").modal("hide");
  //       $(".modal-backdrop").remove();

  //       // Show the OTP modal
  //       setTimeout(() => {
  //         $("#otpModal").modal("show");
  //         initializeOtpInputs();
  //       }, 300);
  //     });
  //   } catch (error) {
  //     Swal.fire({
  //       icon: "error",
  //       title: "Sign Up Failed",
  //       text:
  //         error.response.data.message ||
  //         "An unexpected error occurred. Please try again later.",
  //       showConfirmButton: true,
  //     }).then(() => {
  //       // Optionally re-enable the button if needed
  //       signupButton.disabled = false;
  //       window.location.href = "/";
  //     });
  //   } finally {
  //     // Re-enable the button if it wasn't already
  //     signupButton.disabled = false;
  //   }
  // });

  // // Handle Login Form Submission
  // loginForm.addEventListener("submit", async function (event) {
  //   event.preventDefault();
  //   const email = document.getElementById("loginEmail").value;
  //   const password = document.getElementById("loginPassword").value;

  //   try {
  //     const response = await axios.post("/auth/login", { email, password });

  //     Swal.fire({
  //       icon: "success",
  //       title: "Login Successful",
  //       text: response.data.message,
  //       showConfirmButton: true,
  //     }).then(() => {
  //       window.location.href = "/"; // Redirect on success
  //     });
  //   } catch (error) {
  //     Swal.fire({
  //       icon: "error",
  //       title: error.response.data.message,
  //       text:
  //         error.response.data.message ||
  //         "An unexpected error occurred. Please try again later.",
  //       showConfirmButton: true,
  //     });
  //   }
  // });
}

// <!-- Include SweetAlert2 library -->
//   <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

// <!-- Include SweetAlert2 library -->
//   <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

// <!-- Include SweetAlert2 library -->
//   <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

// <!-- Include SweetAlert2 library -->
//   <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

// <!-- Include SweetAlert2 library -->
//   <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

// <!-- Include SweetAlert2 library -->
//   <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

document.addEventListener("DOMContentLoaded", function () {
  //error message like login failed
  const urlParams = new URLSearchParams(window.location.search);
  const error = urlParams.get("error");
  const message = urlParams.get("message");
  console.log(error, message);

  if (error !== null) {
    Swal.fire({
      toast: true,
      icon: "error",
      title: decodeURIComponent(error),
      position: "top",
      showConfirmButton: false,
      timer: 3000,
    });
  } else if (message !== null) {
    Swal.fire({
      toast: true,
      icon: "success",
      title: decodeURIComponent(message),
      position: "top",
      showConfirmButton: false,
      timer: 3000,
    });
  }

  const loginForm = document.getElementById("loginForm");
  const signUpForm = document.getElementById("signUpForm");
  const forgotPasswordLink = document.getElementById("forgotPasswordLink");
  const forgotPasswordForm = document.getElementById("forgotPasswordForm");
});

document.addEventListener("DOMContentLoaded", function () {
  const forgotPasswordForm = document.getElementById("forgotPasswordForm");
  const forgotPasswordLink = document.getElementById("forgotPasswordLink");

  // Handle Forgot Password link click
  forgotPasswordLink.addEventListener("click", function (event) {
    event.preventDefault();
    $("#loginModal").modal("hide"); // Hide the login modal
    $("#forgotPasswordModal").modal("show"); // Show the forgot password modal
  });

  // Handle Forgot Password form submission
  forgotPasswordForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const emailInput = document.getElementById("forgotPasswordEmail");
    const emailFeedback = document.getElementById("forgotEmailFeedback");

    // Basic email validation pattern
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    const email = emailInput.value;

    if (emailPattern.test(email)) {
      // Valid email: Show valid feedback
      emailInput.classList.remove("is-invalid");
      emailInput.classList.add("is-valid");
      emailFeedback.classList.remove("invalid-feedback");
      emailFeedback.classList.add("valid-feedback");
      emailFeedback.textContent = "Email looks good!";

      // Proceed with AJAX request (replace with actual request)
      $("#forgotPasswordModal").modal("hide"); // Hide the forgot password modal
      axios
        .post("/auth/forgot-password", { email })
        .then((response) => {
          console.log(response.data);
          if (response.data.success) {
            Swal.fire({
              title: "Success!",
              text: "Password reset link has been sent to your email.",
              icon: "success",
              confirmButtonText: "OK",
            }).then(() => {
              $("#loginModal").modal("show"); // Show the login modal again
            });
          }
        })
        .catch((err) => {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: `${err.response.data.message}`,
          }).then(() => {
            $("#loginModal").modal("show"); // Show the login modal again
          });
        });
    } else {
      // Invalid email: Show invalid feedback
      emailInput.classList.remove("is-valid");
      emailInput.classList.add("is-invalid");
      emailFeedback.classList.remove("valid-feedback");
      emailFeedback.classList.add("invalid-feedback");
      emailFeedback.textContent = "Please enter a valid email address.";
    }
  });
});

//   <!-- jQuery -->
//   <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
//   <!-- Bootstrap JS -->
//   <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>

document.addEventListener("DOMContentLoaded", () => {
  const logoutLink = document.getElementById("logoutLink");

  if (logoutLink) {
    logoutLink.addEventListener("click", (event) => {
      // Clear localStorage
      localStorage.clear();

      // Optionally, clear sessionStorage as well
      sessionStorage.clear();

      // Note: The default behavior of the link will still occur
      // which means it will navigate to /auth/logout
    });
  }
});

$(document).ready(function () {
  $(".overlay .btn").click(function () {
    var currentModal = $(this).closest(".modal");
    var targetModal =
      currentModal.attr("id") === "loginModal" ? "#signupModal" : "#loginModal";
    currentModal.modal("hide");
    $(targetModal).modal("show");
  });
});

// Function to show the signup modal and hide the login modal
function showSignupModal() {
  $("#loginModal").modal("hide"); // Hide login modal
  $("#signupModal").modal("show"); // Show signup modal
}

// Function to show the login modal and hide the signup modal
function showLoginModal() {
  $("#signupModal").modal("hide"); // Hide signup modal
  $("#loginModal").modal("show"); // Show login modal
}

// Attach event listeners to buttons
document.addEventListener("DOMContentLoaded", () => {
  // Attach event listener to the "Sign Up" button in the login modal
  document
    .querySelector("#loginModal .btn-outline-light")
    .addEventListener("click", showSignupModal);

  // Attach event listener to the "Login" button in the signup modal
  document
    .querySelector("#signupModal .btn-outline-light")
    .addEventListener("click", showLoginModal);
});
