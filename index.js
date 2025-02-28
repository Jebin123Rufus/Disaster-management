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
        body: JSON.stringify({ phone: phoneNumber })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("OTP sent successfully!");
        } else {
            alert("Error sending OTP: " + data.message);
        }
    })
    .catch(error => console.error("Error:", error))
    .finally(() => {
        registerButton.disabled = false; 
        registerButton.innerText = "Send OTP";
    });
}



