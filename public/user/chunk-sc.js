const $ = (selector) => document.querySelector(selector);

let isLoading = true;

const logScreenWidth = () => {
  var screenWidth =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;

  if (screenWidth <= 600) {
    $("#desktop-nav").style.display = "none";
    $("#mobile-nav").style.display = "flex";
  } else {
    $("#desktop-nav").style.display = "flex";
    $("#mobile-nav").style.display = "none";
  }
};

// Add the event listener for the 'resize' event
logScreenWidth();
window.addEventListener("resize", logScreenWidth);
window.onload = () => {
  logScreenWidth();
  if (
    !localStorage.getItem("isLogged") ||
    localStorage.getItem("isLogged") === "false"
  ) {
    console.log("You are currently not signed in.");
  } else {
    console.log("You are currently signed in.");
  }
};

$("#show-nav").onclick = () => {
  $(".nav-search").style.display = "flex";
  $("#mobile-nav").style.display = "none";
};

$("#close-nav").onclick = () => {
  $(".nav-search").style.display = "none";
  $("#mobile-nav").style.display = "flex";
};

window.onload = () => {
  // Display a loading state
  if (!localStorage.getItem("id") || localStorage.getItem("id") === "") {
    console.log("You are currently not signed in.");
    window.open("/login.html", "_self");
  } else {
    console.log("You are currently signed in.");
    // displayLoadingState();
    getUserProfile();
  }
};

const displayLoadingState = () => {
  if (isLoading) {
    // Assuming you have some loading UI to display, you can trigger it here
    console.log("Loading...");
  } else {
    // Hide your loader when data is ready or error occurs
    $(".loading-container").style.display = "none";
    $(".container").style.display = "flex";
  }
};

const getUserProfile = async () => {
  try {
    const req = await fetch("/userinfo", {
      method: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("id"),
      },
    });

    const res = await req.json();

    $("#name").value = res.name;
    $("#last").value = res.lastName;
    $("#email").value = res.email;
    $("#changeEmail").value = res.email;
    $("#phone").value = res.phone === null ? "" : res.phone;
    // Update loading state
    isLoading = false;
    displayLoadingState();

    console.log(res);
  } catch (error) {
    console.log(error);
  }
};

$("#btn-logout").onclick = () => {
  localStorage.removeItem("id");
  localStorage.clear();
  window.reload;
  window.location.href = "/index.html";
};

document
  .getElementById("submitChange")
  .addEventListener("click", function (event) {
    event.preventDefault();
    validateBeforeUserData();
    $("#submitChange").textContent = "Loading...";
    $("#submitChange").disabled = true;
    setTimeout(() => {
      $("#submitChange").textContent = "Submit";
      $("#submitChange").disabled = false;
    }, 3000);
  });

function validateBeforeUserData() {
  let valid = true;
  let errorMessage = "";

  // Name and Last Name validation
  let name = document.getElementById("name").value;
  let lastName = document.getElementById("last").value;

  if (!name.trim()) {
    errorMessage = "Name is required.";
    valid = false;
  } else if (!lastName.trim()) {
    errorMessage = "Last Name is required.";
    valid = false;
  }

  // Email validation
  if (valid) {
    let email = document.getElementById("email").value;
    let confirmEmail = document.getElementById("changeEmail").value;
    let emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    if (!emailRegex.test(email)) {
      errorMessage = "Please enter a valid email.";
      valid = false;
    } else if (email !== confirmEmail) {
      errorMessage = "Email and Confirm Email must match.";
      valid = false;
    }
  }

  // Password validation
  if (valid) {
    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("changePass").value;

    if (!password || password.length < 6) {
      errorMessage = "Password must be at least 6 characters long.";
      valid = false;
    } else if (password !== confirmPassword) {
      errorMessage = "Password and Repeat Password must match.";
      valid = false;
    }
  }

  // Phone number validation
  if (valid) {
    let phone = document.getElementById("phone").value;
    let phoneRegex = /^\+\d{10,15}$/;

    if (!phoneRegex.test(phone)) {
      errorMessage =
        "Please enter a valid phone number starting with + followed by 10 to 15 digits.";
      valid = false;
    }
  }

  // Display error message
  if (!valid) {
    $(".alert-error").textContent = errorMessage;
    $(".alert-error").style.display = "flex";
    $("#submitChange").textContent = "Submit";
    $("#submitChange").disabled = false;
  } else {
    $(".alert-error").textContent = "";
    $(".alert-error").style.display = "none";
    sendUpdateUser();
  }
}

const sendUpdateUser = async () => {
  try {
    const data = {
      name: $("#name").value,
      password: $("#password").value,
      phone_number: $("#phone").value,
      email: $("#email").value,
      lastname: $("#last").value,
    };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id"),
      },
      body: JSON.stringify(data),
    };
    const req = await fetch("/updateUser", options);
    const responseData = await req.json();

    if (responseData.success) {
      $(".alert-error").textContent = responseData.msg;
      $(".alert-error").style.display = "flex";
      $(".alert-error").style.backgroundColor = "#20c997";

      setTimeout(() => {
        $(".alert-error").style.backgroundColor = "#dc3545";
        $(".alert-error").style.display = "none";
      }, 3000);
      $("#submitChange").textContent = "Submit";
      $("#submitChange").disabled = false;
    } else {
      $(".alert-error").textContent = responseData.error;
      $(".alert-error").style.display = "flex";
      $(".alert-error").style.backgroundColor = "#dc3545";

      setTimeout(() => {
        $(".alert-error").style.backgroundColor = "#dc3545";
        $(".alert-error").style.display = "none";
      }, 3000);
      $("#submitChange").textContent = "Submit";
      $("#submitChange").disabled = false;
    }
  } catch (error) {
    console.log(error);
  }
};
