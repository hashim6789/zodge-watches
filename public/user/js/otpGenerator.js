document.addEventListener("DOMContentLoaded", function () {
  const otpInputs = document.querySelectorAll(".otp-input");
  const timerElement = document.getElementById("timer");
  let timeLeft = 60;

  otpInputs.forEach((input, index) => {
    input.addEventListener("input", function () {
      if (this.value.length === 1 && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
    });
  });

  function startTimer() {
    const interval = setInterval(() => {
      timeLeft -= 1;
      timerElement.textContent = `Resend OTP in ${timeLeft}s`;
      if (timeLeft <= 0) {
        clearInterval(interval);
        timerElement.innerHTML = '<a href="#" id="resendLink">Resend OTP</a>';
        document
          .getElementById("resendLink")
          .addEventListener("click", function (e) {
            e.preventDefault();
            resendOTP();
          });
      }
    }, 1000);
  }

  function resendOTP() {
    const email = document.getElementById("current-email").value;
    const id = document.getElementById("current-id").value;
    console.log(email);
    axios
      .post("/auth/otp/resend", {
        email: email,
        _id: id,
      })
      .then((response) => {
        if (response.data) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "OTP resend successfully!",
          }).then(() => {
            timeLeft = 60; // Reset the timer
            startTimer(); // Restart the timer
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Failed",
            text: "Failed to resend OTP. Please try again.",
          });
        }
      })
      .catch((error) => {
        console.error("Error resending OTP:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred. Please try again.",
        });
      });
  }

  startTimer();
});
