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
    displayLoadingState();
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
