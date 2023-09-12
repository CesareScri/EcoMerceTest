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
  getGiftCards();
  window.addEventListener("resize", logScreenWidth);

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

const getGiftCards = async () => {
  const parent = $(".giftcart-holder");
  try {
    const req = await fetch("/giftcard");
    const res = await req.json();
    const gifts = res.gift_cards;

    gifts.forEach((gift) => {
      const giftCard = document.createElement("div");
      giftCard.className = "giftcard-card";
      const giftCardImg = document.createElement("img");
      giftCardImg.src = gift.img_url;
      const pGift = document.createElement("p");
      pGift.textContent = gift.name;
      // add to DOM
      giftCard.append(giftCardImg, pGift);
      parent.append(giftCard);

      giftCard.onclick = () => {
        $("#hide-container").style.display = "none";
        const element = createGiftCardElement(gift);
        document.body.appendChild(element);
        attachQuantityEventListeners();
        handleGoback();
        handleClickOrder();
      };
    });
  } catch (error) {
    console.log(error);
  }
};

const createGiftCardElement = (data) => {
  // Main container
  const storeContainer = document.createElement("div");
  storeContainer.classList.add("store-container");

  // Gift card info container
  const giftCardInfo = document.createElement("div");
  giftCardInfo.classList.add("giftCard-info");
  storeContainer.appendChild(giftCardInfo);
  giftCardInfo.id = data.id;
  // Go back button
  const goBack = document.createElement("div");
  goBack.classList.add("go-back");
  const goBackBtn = document.createElement("button");
  goBack.appendChild(goBackBtn);
  goBackBtn.id = "btn-goback";
  const svgElem = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgElem.setAttribute("width", "16");
  svgElem.setAttribute("height", "16");
  svgElem.setAttribute("fill", "currentColor");
  svgElem.setAttribute("viewBox", "0 0 16 16");
  const pathElem = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  pathElem.setAttribute("fill-rule", "evenodd");
  pathElem.setAttribute(
    "d",
    "M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"
  );
  svgElem.appendChild(pathElem);
  goBackBtn.appendChild(svgElem);
  const goBackText = document.createElement("p");
  goBackText.textContent = "Go back";
  goBackBtn.appendChild(goBackText);
  giftCardInfo.appendChild(goBack);

  // Image
  const imgElem = document.createElement("img");
  imgElem.setAttribute("src", data.img_url);
  giftCardInfo.appendChild(imgElem);

  // h3 title
  const h3Elem = document.createElement("h3");
  h3Elem.textContent = data.name;
  giftCardInfo.appendChild(h3Elem);

  // span
  const spanElem = document.createElement("span");
  spanElem.textContent = `Da ${data.price.amount[0]}€ A ${
    data.price.amount[data.price.amount.length - 1]
  }€`;
  giftCardInfo.appendChild(spanElem);

  // p description
  const pElem = document.createElement("p");
  pElem.textContent = data.description;
  giftCardInfo.appendChild(pElem);

  // Price gift div
  const priceGift = document.createElement("div");
  priceGift.classList.add("price-gift");
  const selectBox = document.createElement("div");
  selectBox.classList.add("select-box", "same-width");
  const selectElem = document.createElement("select");
  data.price.amount.forEach((amount) => {
    const optionElem = document.createElement("option");
    optionElem.textContent = `${amount}€`;
    optionElem.value = Math.floor(amount);
    selectElem.appendChild(optionElem);
  });
  selectBox.appendChild(selectElem);
  priceGift.appendChild(selectBox);
  const quantitaBox = document.createElement("div");
  quantitaBox.classList.add("quantita-box", "same-width");
  ["-", "1", "+"].forEach((text) => {
    const btnOrLabel =
      text === "1"
        ? document.createElement("label")
        : document.createElement("button");
    btnOrLabel.textContent = text;

    if (text === "-") {
      btnOrLabel.id = "decrease-quantity";
    } else if (text === "1") {
      btnOrLabel.id = "quantity-label";
    } else if (text === "+") {
      btnOrLabel.id = "increase-quantity";
    }

    quantitaBox.appendChild(btnOrLabel);
  });
  priceGift.appendChild(quantitaBox);
  giftCardInfo.appendChild(priceGift);

  // Add to cart button
  const buttonAdd = document.createElement("div");
  buttonAdd.classList.add("button-add");
  const addButton = document.createElement("button");
  addButton.textContent = "Aggiungi al carello.";
  addButton.id = "submit-order";
  buttonAdd.appendChild(addButton);
  giftCardInfo.appendChild(buttonAdd);

  return storeContainer;
};

let maxQuantity = 10;

const addOne = () => {
  let currentNumber = parseInt($("#quantity-label").textContent);
  $("#quantity-label").textContent = (currentNumber + 1).toString();
};

const subtractOne = () => {
  let currentNumber = parseInt($("#quantity-label").textContent);
  $("#quantity-label").textContent = (currentNumber - 1).toString();
};

function attachQuantityEventListeners() {
  $("#increase-quantity").onclick = () => {
    if (parseInt($("#quantity-label").textContent) < maxQuantity) {
      addOne();
    }
  };

  $("#decrease-quantity").onclick = () => {
    if (parseInt($("#quantity-label").textContent) > 1) {
      subtractOne();
    }
  };
}

function getCurrentPriceSelection() {
  const selectElement = document.querySelector("select");
  const selectedPrice = parseFloat(selectElement.value);
  return selectedPrice;
}

const handleGoback = () => {
  $("#btn-goback").onclick = () => {
    window.location.reload();
  };
};

$("#profile").onclick = () => {
  if (
    !localStorage.getItem("isLogged") ||
    localStorage.getItem("isLogged") === "false"
  ) {
    console.log("You are currently not signed in.");
    window.open("/login.html", "_self");
  } else {
    console.log("You are currently signed in.");
    window.open("/profile.html", "_self");
  }
};

const handleClickOrder = () => {
  $("#submit-order").onclick = () => submitOrder();
};

const submitOrder = () => {
  // Get all form data from the page and store it into an object called formData
  // (You mentioned this in a comment, but the actual code isn't provided)

  if (
    !localStorage.getItem("isLogged") ||
    localStorage.getItem("isLogged") === "false"
  ) {
    return window.open("/login.html", "_self");
  }

  const price = getCurrentPriceSelection();
  const quantity = parseInt($("#quantity-label").textContent, 10);

  console.log(
    `Current cart price ${price} & quantity ${quantity} totale = ${
      price * quantity
    } euro`
  );

  addItemsToCart();
};

const addItemsToCart = () => {
  // Fetch existing cart items from localStorage
  const existingCart = JSON.parse(localStorage.getItem("cart")) || [];

  const giftCardInfo = document.querySelector(".giftCard-info");

  // Get the details from the DOM
  const productId = giftCardInfo.getAttribute("id");
  const productName = giftCardInfo.querySelector("h3").textContent;
  const productImage = giftCardInfo.querySelector("img").getAttribute("src");
  const price = parseFloat(document.querySelector(".select-box select").value);
  const quantity = parseInt(
    document.getElementById("quantity-label").textContent,
    10
  );

  const cartItem = {
    product_id: productId,
    product_name: productName,
    product_image: productImage,
    price: price * quantity,
    quantity: quantity,
    categoryID: 1, // Assuming categoryID is always 1
  };

  // Add the new item to the existing cart items
  existingCart.push(cartItem);

  // Save the updated cart to localStorage
  localStorage.setItem("cart", JSON.stringify(existingCart));
  document.querySelector(".item-added").style.display = "block";
  updateItemNameInNotification();
};

const closeNotification = () => {
  document.querySelector(".item-added").style.display = "none";
};

const getItemName = () => {
  const cartItems = JSON.parse(localStorage.getItem("cart"));
  const currentItem = cartItems[cartItems.length - 1];
  return currentItem.product_name;
};

const updateItemNameInNotification = () => {
  document.querySelector(".success-prompt-prompt span").textContent =
    getItemName();
};
