/* Seeli storefront — all account, cart, wishlist and order data stays in this browser. */
"use strict";

const PRODUCTS = [
  { id: "hairclip", name: "Everyday Sweetheart Clips", image: "hairclip.jpg", category: "Hair clips", price: 150, originalPrice: 220, rating: 4.8, reviews: 128, collection: ["Korean fashion", "Anime inspired"], badge: "Bestseller", description: "A cheerful little set for half-up styles, loose waves and those just-one-more-clip kind of days. Lightweight, easy to wear and made for mixing your favourite colours." },
  { id: "clawclip", name: "Petal Pop Claw Clip", image: "clawclip.jpg", category: "Claw clips", price: 220, originalPrice: 299, rating: 4.7, reviews: 96, collection: ["Korean fashion"], badge: "Just lovely", description: "A pretty flower-shaped claw clip that turns a quick twist into a whole look. Its curved teeth hold hair comfortably while the soft shades bring a little colour to your day." },
  { id: "scrunchie", name: "Cloud-soft Satin Scrunchies", image: "scrunchie.jpg", category: "Scrunchies", price: 90, originalPrice: 150, rating: 4.9, reviews: 214, collection: ["Korean fashion", "K-pop inspired"], badge: "From ₹90", description: "Soft, floaty satin scrunchies that are gentle on your hair and lovely on your wrist. A pastel set for ponytails, buns and slow Sunday mornings." },
  { id: "hairband", name: "Cozy Day Twist Headband", image: "hairband.jpg", category: "Headbands", price: 120, originalPrice: 199, rating: 4.6, reviews: 73, collection: ["Korean fashion"], badge: "Easy everyday", description: "A comfy, no-fuss headband in pretty everyday colours. Slip it on to keep your fringe away or add a soft finishing touch to your outfit." },
  { id: "pearlclip", name: "Little Pearl Barrette Set", image: "pearlclip.jpg", category: "Pearl styles", price: 180, originalPrice: 249, rating: 4.8, reviews: 111, collection: ["K-pop inspired", "Korean fashion"], badge: "Sweet detail", description: "A row of pearly shine for brunch plans, celebrations and ordinary days that could use something special. The set makes a polished look feel wonderfully easy." },
  { id: "bowclip", name: "Ribbon Day Bow Clips", image: "bowclip.jpg", category: "Bow clips", price: 250, originalPrice: 349, rating: 4.7, reviews: 89, collection: ["K-pop inspired", "Korean fashion"], badge: "Trending", description: "A statement bow for your main-character entrance. Style it with a sleek ponytail or soft curls for an easy K-pop-inspired finishing touch." },
  { id: "butterflyclip", name: "Daydream Butterfly Clips", image: "butterflyclip.jpg", category: "Hair clips", price: 200, originalPrice: 279, rating: 4.8, reviews: 142, collection: ["Anime inspired", "K-pop inspired"], badge: "Fan favourite", description: "Tiny pastel butterflies for a playful, dreamy hair day. Scatter a few through braids or pin one by your temple for a little anime-inspired sparkle." },
  { id: "bananaclip", name: "Retro Rainbow Banana Clips", image: "bananaclip.jpg", category: "Hair clips", price: 170, originalPrice: 240, rating: 4.5, reviews: 61, collection: ["Korean fashion"], badge: "Retro mood", description: "A clever, easy-grip classic for gathering your hair in seconds. Pick a neutral for everyday or a bright shade when your outfit needs a happy little pop." },
  { id: "headband", name: "Glitter Day Slim Headbands", image: "headband.jpg", category: "Headbands", price: 245, originalPrice: 349, rating: 4.6, reviews: 78, collection: ["K-pop inspired", "Anime inspired"], badge: "A little sparkle", description: "Slim, twinkly headbands with a soft padded feel. Wear one with loose waves for a sweet stage-ready look or keep it close for your next dress-up day." },
  { id: "haircomb", name: "Golden Hour Hair Comb", image: "haircomb.jpg", category: "Hair combs", price: 450, originalPrice: 599, rating: 4.9, reviews: 52, collection: ["Korean fashion"], badge: "Occasion ready", description: "A delicate golden comb for special dinners, wedding parties and every lovely invitation. Tuck it into an updo for a little glimmer that catches the light." },
  { id: "hairpin", name: "Pearl Garden Hair Pins", image: "hairpin.jpg", category: "Pearl styles", price: 320, originalPrice: 450, rating: 4.5, reviews: 37, collection: ["K-pop inspired", "Korean fashion"], badge: "Pretty pairing", description: "A dainty mix of pearl and gold-tone pins for building your own little hair story. Sweep them into a bun or place them along a braid for a delicate finish." },
  { id: "tiara", name: "Dream Day Crystal Tiara", image: "tiara.jpg", category: "Bridal & occasion", price: 650, originalPrice: 899, rating: 4.9, reviews: 43, collection: ["Anime inspired", "K-pop inspired"], badge: "Special occasion", description: "A sparkling finishing touch for celebrations, dress-up and your own happily-ever-after moment. An ornate crystal look made for feeling a little extra lovely." }
];

const PRODUCT_BY_ID = new Map(PRODUCTS.map((product) => [product.id, product]));
const STORAGE_KEYS = { cart: "shoppingCart", wishlist: "seeliWishlist", orders: "seeliOrders", user: "storeUser", draft: "seeliCheckoutDraft" };

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    showToast("Your browser could not save this change. Check its storage settings.");
    return false;
  }
}

function readUser() {
  const user = readStorage(STORAGE_KEYS.user, null);
  if (user && user.email) return user;
  try {
    const legacyEmail = localStorage.getItem("loggedInUser");
    if (legacyEmail) {
      const email = legacyEmail.trim().toLowerCase();
      const name = email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
      return { name, email };
    }
  } catch (error) {
    return null;
  }
  return null;
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function money(value) {
  return Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function discountPercent(product) {
  return Math.round((1 - product.price / product.originalPrice) * 100);
}

function normalizedCart() {
  const stored = readStorage(STORAGE_KEYS.cart, []);
  if (!Array.isArray(stored)) return [];
  const result = [];
  stored.forEach((row) => {
    if (!row || typeof row !== "object") return;
    let product = PRODUCT_BY_ID.get(row.id);
    if (!product) product = PRODUCTS.find((candidate) => candidate.image === row.image || candidate.name.toLowerCase() === String(row.name || "").toLowerCase());
    if (!product && row.name && Number(row.price) >= 0) {
      product = { id: `legacy-${String(row.name).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, name: row.name, image: row.image || "", price: Number(row.price), originalPrice: Number(row.price), rating: 0, reviews: 0, category: "Hair accessories", description: "" };
    }
    if (!product) return;
    const quantity = Math.max(1, Math.min(99, Number(row.quantity) || 1));
    const previous = result.find((item) => item.id === product.id);
    if (previous) previous.quantity = Math.min(99, previous.quantity + quantity);
    else result.push({ id: product.id, name: product.name, image: product.image, price: Number(row.price) > 0 ? Number(row.price) : product.price, quantity });
  });
  return result;
}

let cart = normalizedCart();
let wishlist = readStorage(STORAGE_KEYS.wishlist, []);
if (!Array.isArray(wishlist)) wishlist = [];
wishlist = wishlist.filter((id) => PRODUCT_BY_ID.has(id));

function getCartCount(items = cart) {
  return items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
}

function getCartTotal(items = cart) {
  return items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
}

function saveCart() {
  writeStorage(STORAGE_KEYS.cart, cart);
  updateHeaderCounts();
  renderCart();
}

function showToast(message) {
  const region = document.getElementById("toast-region");
  if (!region) return;
  const toast = document.createElement("div");
  toast.className = "toast-message";
  toast.textContent = message;
  region.appendChild(toast);
  window.setTimeout(() => toast.remove(), 2700);
}

function updateHeaderCounts() {
  const count = document.getElementById("cart-count");
  const price = document.getElementById("total-price");
  const saved = document.getElementById("wishlist-count");
  const account = document.getElementById("account-label");
  if (count) count.textContent = String(getCartCount());
  if (price) price.textContent = money(getCartTotal());
  if (saved) saved.textContent = String(wishlist.length);
  if (account) {
    const user = readUser();
    account.textContent = user && user.name ? user.name.split(" ")[0] : "Sign in";
  }
}

function addToCart(id, quantity = 1) {
  const product = PRODUCT_BY_ID.get(id);
  if (!product) return;
  const item = cart.find((entry) => entry.id === id);
  if (item) item.quantity = Math.min(99, item.quantity + Number(quantity));
  else cart.push({ id: product.id, name: product.name, image: product.image, price: product.price, quantity: Math.max(1, Math.min(99, Number(quantity) || 1)) });
  saveCart();
  showToast(`${product.name} added to your cart ♡`);
}

function changeQuantity(id, delta) {
  const item = cart.find((entry) => entry.id === id);
  if (!item) return;
  item.quantity = Math.max(1, Math.min(99, item.quantity + delta));
  saveCart();
}

function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  saveCart();
  showToast("Removed from your cart.");
}

function toggleWishlist(id) {
  if (!PRODUCT_BY_ID.has(id)) return;
  if (wishlist.includes(id)) {
    wishlist = wishlist.filter((savedId) => savedId !== id);
    showToast("Removed from your wishlist.");
  } else {
    wishlist.push(id);
    showToast("Saved to your wishlist ♡");
  }
  writeStorage(STORAGE_KEYS.wishlist, wishlist);
  updateHeaderCounts();
  renderProducts();
  renderWishlist();
  renderProductDetail();
}

function productCard(product) {
  const isSaved = wishlist.includes(product.id);
  return `<article class="product-card">
    <div class="product-image-wrap"><a class="product-image-link" href="product.html?id=${encodeURIComponent(product.id)}" aria-label="View ${escapeHTML(product.name)}"><img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" loading="lazy"><span class="product-badge">${escapeHTML(product.badge)}</span></a>
      <button type="button" class="wish-button${isSaved ? " is-saved" : ""}" data-wishlist-toggle="${product.id}" aria-label="${isSaved ? "Remove from" : "Add to"} wishlist" aria-pressed="${isSaved}">${isSaved ? "♥" : "♡"}</button></div>
    <div class="product-card-info"><a class="product-title" href="product.html?id=${encodeURIComponent(product.id)}">${escapeHTML(product.name)}</a><span class="product-category">${escapeHTML(product.category)}</span>
      <div class="rating-line" title="Sample storefront rating"><span class="stars" aria-label="Sample rating: ${product.rating} out of 5">★★★★★</span><span>${product.rating.toFixed(1)} <i>${product.reviews} · sample</i></span></div>
      <div class="product-price"><strong>₹${money(product.price)}</strong><del>₹${money(product.originalPrice)}</del><span>${discountPercent(product)}% off</span></div>
      <button type="button" class="button button-card" data-add-to-cart="${product.id}">Add to cart <span>＋</span></button></div>
  </article>`;
}

function renderProducts(list = getFilteredProducts()) {
  const grid = document.getElementById("products-grid");
  if (!grid) return;
  grid.innerHTML = list.map(productCard).join("");
  const resultCount = document.getElementById("result-count");
  if (resultCount) resultCount.textContent = `${list.length} lovely ${list.length === 1 ? "find" : "finds"}`;
  const empty = document.getElementById("empty-products");
  if (empty) empty.classList.toggle("hidden", list.length > 0);
}

let activeCategory = "All accessories";
let activeCollection = "";
let activeSearch = "";

function getFilteredProducts() {
  return PRODUCTS.filter((product) => {
    const categoryMatch = activeCategory === "All accessories" || product.category === activeCategory;
    const collectionMatch = !activeCollection || product.collection.includes(activeCollection);
    const haystack = `${product.name} ${product.category} ${product.description} ${product.collection.join(" ")}`.toLowerCase();
    const searchMatch = !activeSearch || haystack.includes(activeSearch.toLowerCase());
    return categoryMatch && collectionMatch && searchMatch;
  });
}

function renderCategories() {
  const categoryList = document.getElementById("category-list");
  const filters = document.getElementById("filter-row");
  const categories = ["All accessories", ...new Set(PRODUCTS.map((product) => product.category))];
  const icons = { "All accessories": "✿", "Hair clips": "❀", "Claw clips": "✿", "Scrunchies": "〰", "Headbands": "⌒", "Pearl styles": "◌", "Bow clips": "♧", "Hair combs": "♢", "Bridal & occasion": "✧" };
  if (categoryList) categoryList.innerHTML = categories.filter((category) => category !== "All accessories").map((category) => `<button class="category-chip" data-category="${escapeHTML(category)}"><span>${icons[category] || "✦"}</span><b>${escapeHTML(category)}</b></button>`).join("");
  if (filters) filters.innerHTML = categories.map((category) => `<button class="filter-chip${category === activeCategory ? " is-active" : ""}" type="button" data-category="${escapeHTML(category)}">${escapeHTML(category)}</button>`).join("");
}

function renderCart() {
  const container = document.getElementById("cart-items");
  const summary = document.getElementById("cart-summary");
  if (!container) return;
  if (cart.length === 0) {
    container.innerHTML = `<div class="empty-cart"><span>♡</span><p>Your cart is waiting for something lovely.</p><a class="text-link" href="#products">Find a favourite →</a></div>`;
    if (summary) summary.innerHTML = `<h3>Order summary</h3><div class="summary-line"><span>Subtotal</span><strong>₹0</strong></div><div class="summary-line"><span>Delivery</span><strong>Free</strong></div><div class="summary-line grand-total"><span>Total</span><strong>₹0</strong></div><a class="button button-dark button-full is-disabled" href="checkout.html" aria-disabled="true">Proceed to checkout</a><p class="checkout-footnote">Demo checkout · no payment collected</p>`;
    return;
  }
  container.innerHTML = cart.map((item) => `<article class="cart-row"><a class="cart-thumb" href="product.html?id=${encodeURIComponent(item.id)}">${item.image ? `<img src="${escapeHTML(item.image)}" alt="">` : "✿"}</a><div class="cart-row-copy"><a href="product.html?id=${encodeURIComponent(item.id)}" class="cart-title">${escapeHTML(item.name)}</a><span>₹${money(item.price)} each</span><button type="button" class="remove-link" data-remove-cart="${escapeHTML(item.id)}">Remove</button></div><div class="quantity-control" aria-label="Quantity for ${escapeHTML(item.name)}"><button type="button" data-quantity="${escapeHTML(item.id)}" data-delta="-1" aria-label="Decrease quantity">−</button><span>${item.quantity}</span><button type="button" data-quantity="${escapeHTML(item.id)}" data-delta="1" aria-label="Increase quantity">＋</button></div><strong class="cart-row-total">₹${money(item.price * item.quantity)}</strong></article>`).join("");
  if (summary) summary.innerHTML = `<h3>Order summary</h3><div class="summary-line"><span>Subtotal · ${getCartCount()} ${getCartCount() === 1 ? "item" : "items"}</span><strong>₹${money(getCartTotal())}</strong></div><div class="summary-line"><span>Delivery</span><strong class="free-text">Free</strong></div><div class="summary-line grand-total"><span>Total</span><strong>₹${money(getCartTotal())}</strong></div><a class="button button-dark button-full" href="checkout.html">Proceed to checkout <span>→</span></a><p class="checkout-footnote">Demo checkout · no payment collected</p>`;
}

function renderWishlist() {
  const grid = document.getElementById("wishlist-grid");
  if (!grid) return;
  const saved = PRODUCTS.filter((product) => wishlist.includes(product.id));
  grid.innerHTML = saved.map(productCard).join("");
  const empty = document.getElementById("wishlist-empty");
  if (empty) empty.classList.toggle("hidden", saved.length > 0);
}

function renderProductDetail() {
  const container = document.getElementById("product-detail");
  if (!container) return null;
  const productId = new URLSearchParams(window.location.search).get("id");
  let product = PRODUCT_BY_ID.get(productId);
  if (!product && !productId) {
    try {
      const legacySelection = JSON.parse(sessionStorage.getItem("selectedProduct") || "null");
      if (legacySelection) product = PRODUCTS.find((candidate) => candidate.image === legacySelection.image || candidate.name.toLowerCase() === String(legacySelection.name || "").toLowerCase());
    } catch (error) {
      product = null;
    }
  }
  product = product || PRODUCTS[0];
  const crumb = document.getElementById("product-crumb");
  if (crumb) crumb.textContent = product.name;
  document.title = `${product.name} · Seeli`;
  const related = PRODUCTS.filter((candidate) => candidate.id !== product.id && (candidate.collection.some((name) => product.collection.includes(name)) || candidate.category === product.category)).slice(0, 2);
  const saved = wishlist.includes(product.id);
  container.innerHTML = `<div class="product-detail-grid"><div class="product-visual-column"><div class="product-visual"><img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}"></div><div class="visual-caption"><span>✿ The Seeli edit</span><p>See the colours and little details in this accessory set.</p></div>${related.length ? `<div class="style-pairings"><span class="eyebrow">A little style inspiration</span><div class="pairing-images">${related.map((item) => `<a href="product.html?id=${encodeURIComponent(item.id)}" title="Shop ${escapeHTML(item.name)}"><img src="${escapeHTML(item.image)}" alt="Style idea: ${escapeHTML(item.name)}"><span>${escapeHTML(item.name)}</span></a>`).join("")}</div></div>` : ""}</div>
    <div class="product-detail-copy"><div class="detail-badge">${escapeHTML(product.badge)}</div><span class="product-category">${escapeHTML(product.category)}</span><h1>${escapeHTML(product.name)}</h1><div class="detail-rating" title="Sample storefront rating"><span class="stars" aria-label="Sample rating: ${product.rating} out of 5">★★★★★</span><b>${product.rating.toFixed(1)}</b><a href="#reviews">${product.reviews} sample ratings</a></div><div class="detail-price"><strong>₹${money(product.price)}</strong><del>₹${money(product.originalPrice)}</del><span>${discountPercent(product)}% off</span></div><p class="tax-note">Inclusive of all taxes</p><p class="detail-description">${escapeHTML(product.description)}</p><div class="detail-perks"><span>♡ Easy everyday style</span><span>✿ Lovely gifting idea</span></div><div class="detail-quantity"><span>Quantity</span><div class="quantity-control"><button type="button" data-detail-quantity="-1" aria-label="Decrease quantity">−</button><span id="detail-quantity">1</span><button type="button" data-detail-quantity="1" aria-label="Increase quantity">＋</button></div></div><div class="detail-actions"><button class="button button-dark" type="button" data-add-to-cart="${product.id}">Add to cart <span>＋</span></button><button class="button button-outline" type="button" data-buy-now="${product.id}">Buy now</button><button class="wish-button detail-wish${saved ? " is-saved" : ""}" type="button" data-wishlist-toggle="${product.id}" aria-label="${saved ? "Remove from" : "Add to"} wishlist" aria-pressed="${saved}">${saved ? "♥" : "♡"}</button></div><div class="delivery-note"><span>⌂</span><div><b>Ready for your cart?</b><p>Free delivery in this demo · Checkout is for preview only.</p></div></div><div class="detail-collections"><span>Inspired by</span>${product.collection.map((name) => `<a href="index.html?collection=${encodeURIComponent(name)}#products">${escapeHTML(name)}</a>`).join("")}</div><div class="reviews-snippet" id="reviews"><span class="stars">★★★★★</span><p>“Such a sweet little find.” <span>— Sample review</span></p><small>Sample review preview · ${product.reviews} ratings</small></div></div></div>`;
  const recommendationGrid = document.getElementById("recommendations");
  if (recommendationGrid) recommendationGrid.innerHTML = PRODUCTS.filter((item) => item.id !== product.id).slice(0, 4).map(productCard).join("");
  return product;
}

function initHome() {
  renderCategories();
  const params = new URLSearchParams(window.location.search);
  activeSearch = params.get("q") || "";
  activeCollection = params.get("collection") || "";
  if (activeCollection) document.getElementById("product-heading-title").textContent = activeCollection;
  const searchInput = document.getElementById("site-search");
  if (searchInput) searchInput.value = activeSearch;
  renderProducts();
  const categoryList = document.getElementById("category-list");
  const filterRow = document.getElementById("filter-row");
  const applyCategory = (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    activeCategory = button.dataset.category;
    activeCollection = "";
    document.getElementById("product-heading-title").textContent = activeSearch ? `Search results for “${activeSearch}”` : "The accessory edit";
    renderCategories();
    renderProducts();
  };
  if (categoryList) categoryList.addEventListener("click", applyCategory);
  if (filterRow) filterRow.addEventListener("click", applyCategory);
  document.querySelectorAll("[data-collection]").forEach((button) => button.addEventListener("click", () => {
    window.location.href = `index.html?collection=${encodeURIComponent(button.dataset.collection)}#products`;
  }));
}

function initSearch() {
  const form = document.getElementById("search-form");
  if (!form) return;
  const input = document.getElementById("site-search");
  if (!input) return;
  const query = new URLSearchParams(window.location.search).get("q");
  if (query && !input.value) input.value = query;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    window.location.href = `index.html?q=${encodeURIComponent(input.value.trim())}#products`;
  });
}

function initAuth() {
  const tabs = document.querySelectorAll("[data-auth-mode]");
  const panels = document.querySelectorAll("[data-auth-form]");
  tabs.forEach((tab) => tab.addEventListener("click", () => {
    const mode = tab.dataset.authMode;
    tabs.forEach((item) => {
      const selected = item.dataset.authMode === mode;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-selected", String(selected));
    });
    panels.forEach((panel) => panel.classList.toggle("hidden", panel.dataset.authForm !== mode));
  }));
  const signup = document.getElementById("signup-form");
  if (signup) signup.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(signup);
    const user = { name: String(data.get("name")).trim(), email: String(data.get("email")).trim().toLowerCase() };
    writeStorage(STORAGE_KEYS.user, user);
    showToast(`Welcome to Seeli, ${user.name.split(" ")[0]} ♡`);
    window.setTimeout(() => { window.location.href = "index.html"; }, 500);
  });
  const login = document.getElementById("login-form");
  if (login) login.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = String(new FormData(login).get("email")).trim().toLowerCase();
    const previous = readUser();
    const name = previous && previous.email === email ? previous.name : email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
    writeStorage(STORAGE_KEYS.user, { name, email });
    showToast(`Welcome back, ${name.split(" ")[0]} ♡`);
    window.setTimeout(() => { window.location.href = "index.html"; }, 500);
  });
}

function initCheckout() {
  const form = document.getElementById("checkout-form");
  const storedDraft = readStorage(STORAGE_KEYS.draft, null);
  const draft = Array.isArray(storedDraft) && storedDraft.length ? storedDraft : null;
  const items = draft || cart;
  const empty = document.getElementById("checkout-empty");
  const layout = document.getElementById("checkout-layout");
  if (!items.length) {
    if (empty) empty.classList.remove("hidden");
    if (layout) layout.classList.add("hidden");
    return;
  }
  if (empty) empty.classList.add("hidden");
  if (layout) layout.classList.remove("hidden");
  const itemContainer = document.getElementById("checkout-items");
  if (itemContainer) itemContainer.innerHTML = items.map((item) => `<div class="checkout-item"><div><b>${escapeHTML(item.name)}</b><span>Qty ${item.quantity}</span></div><strong>₹${money(item.price * item.quantity)}</strong></div>`).join("");
  const total = document.getElementById("checkout-total");
  const orderTotal = getCartTotal(items);
  if (total) total.textContent = money(orderTotal);
  const user = readUser();
  if (user) {
    const name = document.getElementById("ship-name");
    const email = document.getElementById("ship-email");
    if (name) name.value = user.name || "";
    if (email) email.value = user.email || "";
  }
  if (form) form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const order = {
      id: `SL-${Date.now().toString().slice(-7)}-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString(),
      items: items.map((item) => ({ id: item.id, name: item.name, image: item.image, price: Number(item.price), quantity: Number(item.quantity) })),
      total: orderTotal,
      payment: String(data.get("payment")),
      shipping: { name: String(data.get("name")).trim(), email: String(data.get("email")).trim(), phone: String(data.get("phone")).trim(), address: String(data.get("address")).trim(), city: String(data.get("city")).trim(), pincode: String(data.get("pincode")).trim() }
    };
    const orders = readStorage(STORAGE_KEYS.orders, []);
    const savedOrders = Array.isArray(orders) ? orders : [];
    savedOrders.unshift(order);
    writeStorage(STORAGE_KEYS.orders, savedOrders);
    if (!draft) {
      cart = [];
      writeStorage(STORAGE_KEYS.cart, cart);
    }
    try { localStorage.removeItem(STORAGE_KEYS.draft); } catch (error) { /* local storage may be disabled */ }
    window.location.href = `order-confirmation.html?id=${encodeURIComponent(order.id)}`;
  });
}

function initOrders() {
  const container = document.getElementById("orders-list");
  if (!container) return;
  const orders = readStorage(STORAGE_KEYS.orders, []);
  if (!Array.isArray(orders) || !orders.length) {
    container.innerHTML = `<div class="empty-panel"><div class="empty-heart">✿</div><h2>No orders yet</h2><p>Your first little Seeli haul will show up here.</p><a class="button button-dark" href="index.html#products">Explore accessories</a></div>`;
    return;
  }
  container.innerHTML = orders.map((order) => `<article class="order-card"><div class="order-card-head"><div><span class="eyebrow">Order placed</span><b>${new Date(order.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</b></div><div><span class="eyebrow">Order number</span><b>${escapeHTML(order.id)}</b></div><div><span class="eyebrow">Total</span><b>₹${money(order.total)}</b></div><span class="order-status">Demo order</span></div><div class="order-card-items">${order.items.map((item) => `<a class="order-product" href="product.html?id=${encodeURIComponent(item.id)}">${item.image ? `<img src="${escapeHTML(item.image)}" alt="">` : ""}<span>${escapeHTML(item.name)} <small>Qty ${item.quantity}</small></span></a>`).join("")}</div><p class="demo-note">Saved on this device · No payment or shipment was processed.</p></article>`).join("");
}

function initConfirmation() {
  const orders = readStorage(STORAGE_KEYS.orders, []);
  if (!Array.isArray(orders) || !orders.length) return;
  const id = new URLSearchParams(window.location.search).get("id");
  const order = orders.find((item) => item.id === id) || orders[0];
  const orderId = document.getElementById("confirmation-id");
  const date = document.getElementById("confirmation-date");
  const items = document.getElementById("confirmation-items");
  const total = document.getElementById("confirmation-total");
  if (orderId) orderId.textContent = order.id;
  if (date) date.textContent = new Date(order.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  if (items) items.innerHTML = order.items.map((item) => `<div class="checkout-item"><div><b>${escapeHTML(item.name)}</b><span>Qty ${item.quantity}</span></div><strong>₹${money(item.price * item.quantity)}</strong></div>`).join("");
  if (total) total.textContent = money(order.total);
}

function initGlobalEvents() {
  document.addEventListener("click", (event) => {
    const cartCheckoutLink = event.target.closest("a[href='checkout.html']");
    if (cartCheckoutLink) {
      try { localStorage.removeItem(STORAGE_KEYS.draft); } catch (error) { /* local storage may be disabled */ }
    }
    const add = event.target.closest("[data-add-to-cart]");
    if (add) {
      event.preventDefault();
      const quantity = Number(document.getElementById("detail-quantity")?.textContent) || 1;
      addToCart(add.dataset.addToCart, quantity);
      return;
    }
    const wishlistButton = event.target.closest("[data-wishlist-toggle]");
    if (wishlistButton) {
      event.preventDefault();
      toggleWishlist(wishlistButton.dataset.wishlistToggle);
      return;
    }
    const quantityButton = event.target.closest("[data-quantity]");
    if (quantityButton) {
      changeQuantity(quantityButton.dataset.quantity, Number(quantityButton.dataset.delta));
      return;
    }
    const removeButton = event.target.closest("[data-remove-cart]");
    if (removeButton) {
      removeFromCart(removeButton.dataset.removeCart);
      return;
    }
    const detailQuantity = event.target.closest("[data-detail-quantity]");
    if (detailQuantity) {
      const quantity = document.getElementById("detail-quantity");
      if (quantity) quantity.textContent = String(Math.max(1, Math.min(99, Number(quantity.textContent) + Number(detailQuantity.dataset.detailQuantity))));
      return;
    }
    const buyNow = event.target.closest("[data-buy-now]");
    if (buyNow) {
      const product = PRODUCT_BY_ID.get(buyNow.dataset.buyNow);
      if (!product) return;
      const quantity = Number(document.getElementById("detail-quantity")?.textContent) || 1;
      writeStorage(STORAGE_KEYS.draft, [{ id: product.id, name: product.name, image: product.image, price: product.price, quantity }]);
      window.location.href = "checkout.html";
    }
  });
  document.querySelectorAll(".header-link[href='login.html']").forEach((link) => link.addEventListener("click", (event) => {
    const currentUser = readUser();
    if (!currentUser) return;
    if (event.metaKey || event.ctrlKey) return;
    event.preventDefault();
    if (window.confirm(`Signed in locally as ${currentUser.email}. Sign out on this device?`)) {
      try { localStorage.removeItem(STORAGE_KEYS.user); } catch (error) { /* storage may be unavailable */ }
      try { localStorage.removeItem("loggedInUser"); } catch (error) { /* local storage may be unavailable */ }
      updateHeaderCounts();
      showToast("You are signed out on this device.");
    }
  }));
}

document.addEventListener("DOMContentLoaded", () => {
  updateHeaderCounts();
  initSearch();
  const page = document.body.dataset.page;
  if (page === "home") initHome();
  if (page === "product") renderProductDetail();
  if (page === "auth") initAuth();
  if (page === "checkout") initCheckout();
  if (page === "orders") initOrders();
  if (page === "wishlist") renderWishlist();
  if (page === "confirmation") initConfirmation();
  renderCart();
  initGlobalEvents();
});
