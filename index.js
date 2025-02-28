function otpcheck() {
  const button = document.querySelector(".active");
  const Inputs = document.querySelectorAll("input:not(.input)");
  const otpForm = document.querySelector(".container");
  const FormContainer = document.querySelector(".formcontainer");

  FormContainer.style.display = "none";
  otpForm.style.display = "block";

  window.addEventListener("load", () => Inputs[0].focus());

  Inputs.forEach((input) => {
    input.addEventListener("input", () => {
      const currentInput = input;
      const nextInput = input.nextElementSibling;

      if (currentInput.value.length > 1) {
        currentInput.value = currentInput.value.slice(1);
      }

      if (
        nextInput !== null &&
        nextInput.hasAttribute("disabled") &&
        currentInput.value !== ""
      ) {
        nextInput.removeAttribute("disabled");
        nextInput.focus();
      }

      if (
        !Inputs[Inputs.length - 1].disabled &&
        Inputs[Inputs.length - 1].value !== ""
      ) {
        button.classList.add("active");
      }

      input.addEventListener("keyup", (e) => {
        if (e.key === "Backspace") {
          if (input.previousElementSibling !== null) {
            e.target.value = "";
            e.target.setAttribute("disabled", true);
            input.previousElementSibling.focus();
          }
        }
      });
    });
  });
}

function sendOTP() {
  let phoneNumberInput = document.getElementById("phone");
  let registerButton = document.querySelector(".create");
  let phoneNumber = phoneNumberInput.value;

  if (!phoneNumber.match(/^\d{10}$/)) {
    alert("Please enter a valid 10-digit phone number.");
    return;
  }

  registerButton.disabled = true;
  registerButton.innerText = "Sending...";

  fetch("http://localhost:5000/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: phoneNumber }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        otpcheck();
        alert("OTP sent successfully!");
      } else {
        alert("Error sending OTP: " + data.message);
      }
    })
    .catch((error) => console.error("Error:", error))
    .finally(() => {
      registerButton.disabled = false;
      registerButton.innerText = "Send OTP";
    });
}
