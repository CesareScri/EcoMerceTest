const $ = (id) => document.querySelector(id);

const els = document.querySelectorAll("input");

$("#btn-sendForm").onclick = () => {
  let name = $("#name");
  let email = $("#email");
  let password = $("#password");
  let lastName = $("#last");
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
  if (!name.value || !email.value || !password.value || !lastName.value) {
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
    submitUserData(name.value, email.value, password.value, lastName.value);
  }
};

const submitUserData = async (name, email, password, lastName) => {
  const dataJson = {
    name: name,
    lastName: lastName,
    email: email,
    password: password,
  };
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dataJson),
  };

  try {
    const req = await fetch("/signup", options);
    const res = await req.json();

    if (res.success) {
      $(".login-form").style.display = "none";
      $(".success-registration").style.display = "flex";
      setTimeout(() => (window.location.href = "/login.html"), 3000);
    } else {
      $("#msg-alert").textContent = res.error.msg;
      $("#msg-alert").style.color = "#dc3545";
    }
  } catch (error) {
    console.log(error);
  }
};
