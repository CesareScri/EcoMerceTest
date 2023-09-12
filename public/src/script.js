// Corrected the $ function to use # prefix for id
const $ = (id) => document.querySelector(id);

const els = document.querySelectorAll("input");

window.onload = () => localStorage.clear();
$("#btn-send").onclick = () => {
  let email = $("#email");
  let password = $("#password");
  let error = false;

  // Reset styles and remove error messages
  els.forEach((el) => {
    el.style.border = "1px solid #ccc"; // Reset border
    const existingError = el.parentNode.querySelector(".input-error");
    if (existingError) {
      el.parentNode.removeChild(existingError);
    }
  });

  // Check individual fields
  if (!email.value || !password.value) {
    $("#message").textContent = "Please fill out all fields!"; // Display the error message at the top

    // Check each input field and apply styles and message
    els.forEach((el) => {
      if (!el.value) {
        el.style.border = "2px solid #dc3545";

        const p = document.createElement("p");
        p.textContent = "This field is required!";
        p.className = "input-error"; // So you can select it later
        p.style.color = "#dc3545";
        p.style.fontWeight = "bold";
        p.style.fontSize = "0.8rem";
        el.parentNode.appendChild(p);
        error = true;
      }
    });
  }

  if (!error) {
    // You might want to execute some code if all fields are correctly filled.
    // For instance, you could submit the form or something else.
    console.log("Evreything is fine!");
    submitUserData(email.value, password.value);
  }
};

const submitUserData = async (email, password) => {
  const dataJson = { email: email, password: password };
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dataJson),
  };

  try {
    const req = await fetch("/post", options);
    const res = await req.json();

    if (res.success) {
      localStorage.setItem("id", res.id);
      localStorage.setItem("isLogged", true);
      setTimeout(() => (window.location.href = "/index.html"), 3000);
    } else {
      $("#msg-alert").textContent = res.msg;
      $("#msg-alert").style.color = "#dc3545";
    }
  } catch (error) {
    console.log(error);
  }
};
