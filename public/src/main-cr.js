const $ = (id) => document.querySelector(id);

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
  window.addEventListener("resize", logScreenWidth);

  if (
    !localStorage.getItem("isLogged") ||
    localStorage.getItem("isLogged") === "false"
  ) {
    console.log("You are currently not signed in.");
  } else {
    console.log("You are currently signed in.");
  }

  CheckIfCartHaveitems();
};

const CheckIfCartHaveitems = () => {
  if (
    !localStorage.getItem("cart") ||
    localStorage.getItem("cart").length === 0
  ) {
    console.log("Theres no cart here");
    return;
  }

  $("#totale-items-length").textContent = `${
    JSON.parse(localStorage.getItem("cart")).length > 1
      ? JSON.parse(localStorage.getItem("cart")).length + " items"
      : JSON.parse(localStorage.getItem("cart")).length + " item"
  } `;
  const cartItems = JSON.parse(localStorage.getItem("cart"));
  const existingContainer = document.querySelector(".items-card");

  // Clear the existing items before appending new ones
  existingContainer.innerHTML = "";

  let totalQuantity = 0;
  let totalPrice = 0;

  cartItems.forEach((item, index) => {
    totalQuantity += item.quantity;
    totalPrice += item.quantity * item.price; // multiplying with individual item price

    const itemCard = document.createElement("div");
    itemCard.classList.add("item-card");

    const img = document.createElement("img");
    img.setAttribute("src", item.product_image);
    img.setAttribute("alt", "product logo");

    const h4 = document.createElement("h4");
    h4.textContent = item.product_name;

    const itemQuantity = document.createElement("div");
    itemQuantity.classList.add("item-quantity");

    const decrementButton = document.createElement("button");
    decrementButton.textContent = "-";
    decrementButton.addEventListener("click", () => {
      if (item.quantity > 0) {
        item.quantity--;
        if (item.quantity === 0) {
          // Remove the item from cartItems array
          cartItems.splice(index, 1);
          // Remove itemCard from the DOM
          existingContainer.removeChild(itemCard);
        } else {
          quantitySpan.textContent = item.quantity;
        }
        updateLocalStorage(cartItems);
      }
    });

    const incrementButton = document.createElement("button");
    incrementButton.textContent = "+";
    incrementButton.addEventListener("click", () => {
      item.quantity++;
      quantitySpan.textContent = item.quantity;
      updateLocalStorage(cartItems);
    });

    const quantitySpan = document.createElement("span");
    quantitySpan.textContent = item.quantity;

    itemQuantity.appendChild(decrementButton);
    itemQuantity.appendChild(quantitySpan);
    itemQuantity.appendChild(incrementButton);

    const priceP = document.createElement("p");
    priceP.textContent = `${item.price} €`;

    itemCard.appendChild(img);
    itemCard.appendChild(h4);
    itemCard.appendChild(itemQuantity);
    itemCard.appendChild(priceP);

    existingContainer.appendChild(itemCard);
  });

  // Update total items and total price in the DOM
  document.querySelector(
    ".price-tot p:first-child"
  ).textContent = `Totale items: ${totalQuantity}`;
  const taxAmount = (5 / 100) * totalPrice; // Calculate 20% tax
  const finalTotal = totalPrice + taxAmount;
  document.querySelector(".price-tot h4 span").textContent =
    finalTotal.toFixed(2); // To get the value up to two decimal places
};

const updateLocalStorage = (cartItems) => {
  localStorage.setItem("cart", JSON.stringify(cartItems));
  CheckIfCartHaveitems(); // re-render items and update totals
};
