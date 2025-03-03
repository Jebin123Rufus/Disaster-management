document.addEventListener("DOMContentLoaded", () => {
  const verifyButton = document.querySelector(".active");
  if (verifyButton) {
    verifyButton.addEventListener("click", verifyOTP);
  }
});

function otpcheck() {
  const button = document.querySelector(".verify");
  const inputs = document.querySelectorAll("input:not(.input)");
  const otpForm = document.querySelector(".container");
  const formContainer = document.querySelector(".formcontainer");

  formContainer.style.display = "none";
  otpForm.style.display = "block";

  inputs.forEach((input, index) => {
    input.addEventListener("input", (event) => {
      let currentInput = event.target;
      let nextInput = inputs[index + 1];

      if (currentInput.value.length > 1) {
        currentInput.value = currentInput.value.slice(0, 1);
      }

      if (nextInput && currentInput.value !== "") {
        nextInput.removeAttribute("disabled");
        nextInput.focus();
      }

      // Enable verify button only when all fields are filled
      if ([...inputs].every((inp) => inp.value.trim() !== "")) {
        button.classList.add("active");
        button.disabled = false;
      } else {
        button.classList.remove("active");
        button.disabled = true;
      }
    });
  });
}

async function verifyOTP() {
  const phoneNumber = document.getElementById("phone").value;
  const otpInputs = document.querySelectorAll("input:not(.input)");
  const otp = [...otpInputs].map((input) => input.value.trim()).join("");

  if (otp.length !== otpInputs.length) {
    alert("Please enter the full OTP.");
    return;
  }

  try {
    console.log("🟢 Sending OTP verification request:", {
      phone: phoneNumber,
      otp,
    });
    const response = await fetch("http://localhost:5001/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phoneNumber, otp }),
    });

    const data = await response.json();
    console.log("🟢 Response from server:", data);

    if (data.success) {
      alert("✅ OTP verified! Your phone number is now registered.");
      window.location.href = "dashboard.html";
    } else {
      alert("❌ Invalid OTP. Please try again.");
    }
  } catch (error) {
    console.error("🔴 Error verifying OTP:", error);
    alert("❌ An error occurred. Please try again later.");
  }
}

async function sendOTP() {
  const phoneNumberInput = document.getElementById("phone");
  const registerButton = document.querySelector(".create");
  const phoneNumber = phoneNumberInput.value.trim();

  if (!/^[0-9]{10}$/.test(phoneNumber)) {
    alert("Please enter a valid 10-digit phone number.");
    return;
  }

  registerButton.disabled = true;
  registerButton.innerText = "Sending...";

  try {
    const response = await fetch("http://localhost:5001/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phoneNumber }),
    });

    const data = await response.json();

    if (data.success) {
      otpcheck();
      alert("✅ OTP sent successfully!");
    } else {
      alert("❌ Error sending OTP: " + data.message);
    }
  } catch (error) {
    console.error("🔴 Error sending OTP:", error);
    alert("❌ An error occurred. Please try again later.");
  } finally {
    registerButton.disabled = false;
    registerButton.innerText = "Send OTP";
  }
}
