// ============================================================
// XN-KODASSY
// Firebase version
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-storage.js";


// ============================================================
// FIREBASE CONFIG
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyDSKK_yyGQvuUumDesEhNKS0ss7I3dYzqc",
  authDomain: "xn-kodassy.firebaseapp.com",
  projectId: "xn-kodassy",
  storageBucket: "xn-kodassy.firebasestorage.app",
  messagingSenderId: "587033328645",
  appId: "1:587033328645:web:f707f0e3c858342b3d706c",
  measurementId: "G-966SCVK8DH"
};


// ============================================================
// INITIALIZE FIREBASE
// ============================================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);


// ============================================================
// SETTINGS
// ============================================================

const WHATSAPP_NUMBER = "212600000000";

let products = [];
let activeFilter = "Tous";
let currentUser = null;
let editingImageData = null;


// ============================================================
// DOM
// ============================================================

const productGrid = document.getElementById("productGrid");
const emptyState = document.getElementById("emptyState");
const collectionFilters = document.getElementById("collectionFilters");

const adminPanel = document.getElementById("adminPanel");
const adminList = document.getElementById("adminList");

const productForm = document.getElementById("productForm");

const pName = document.getElementById("pName");
const pPrice = document.getElementById("pPrice");
const pCategory = document.getElementById("pCategory");
const pSizes = document.getElementById("pSizes");
const pImageFile = document.getElementById("pImageFile");
const pImage = document.getElementById("pImage");
const pDesc = document.getElementById("pDesc");

const imagePreview = document.getElementById("imagePreview");
const imagePreviewRow = document.getElementById("imagePreviewRow");
const removeImage = document.getElementById("removeImage");

const exportCatalog = document.getElementById("exportCatalog");

const adminToggleLink = document.getElementById("adminToggleLink");
const closeAdmin = document.getElementById("closeAdmin");

const oName = document.getElementById("oName");
const oPhone = document.getElementById("oPhone");
const oArticle = document.getElementById("oArticle");
const oSize = document.getElementById("oSize");
const oQty = document.getElementById("oQty");
const oCity = document.getElementById("oCity");
const oAddress = document.getElementById("oAddress");
const oMessage = document.getElementById("oMessage");

const whatsappBtn = document.getElementById("whatsappBtn");
const orderConfirm = document.getElementById("orderConfirm");


// ============================================================
// HELPERS
// ============================================================

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function formatPrice(price) {
  const number = Number(price);

  if (Number.isNaN(number)) {
    return "0 DH";
  }

  return `${number.toLocaleString("fr-FR")} DH`;
}


function generateStorageName(file) {
  const safeName = file.name
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .substring(0, 100);

  const unique =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).substring(2)}`;

  return `products/${unique}-${safeName}`;
}


// ============================================================
// FIRESTORE - REAL TIME PRODUCTS
// ============================================================

const productsRef = collection(db, "products");

onSnapshot(
  productsRef,
  (snapshot) => {

    products = snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data()
    }));

    products.sort((a, b) => {

      const dateA =
        a.createdAt?.seconds
          ? a.createdAt.seconds
          : 0;

      const dateB =
        b.createdAt?.seconds
          ? b.createdAt.seconds
          : 0;

      return dateB - dateA;
    });

    renderFilters();
    renderProducts();
    renderOrderOptions();
    renderAdminList();
  },

  (error) => {

    console.error("Firestore error:", error);

    if (emptyState) {
      emptyState.hidden = false;
      emptyState.textContent =
        "Impossible de charger les produits.";
    }
  }
);


// ============================================================
// FILTERS
// ============================================================

function renderFilters() {

  if (!collectionFilters) return;

  const categories = [
    "Tous",
    ...new Set(
      products
        .map((product) => product.category)
        .filter(Boolean)
    )
  ];

  if (!categories.includes(activeFilter)) {
    activeFilter = "Tous";
  }

  collectionFilters.innerHTML = "";

  categories.forEach((category) => {

    const button = document.createElement("button");

    button.type = "button";
    button.className =
      category === activeFilter
        ? "filter-btn active"
        : "filter-btn";

    button.textContent = category;

    button.addEventListener("click", () => {

      activeFilter = category;

      renderFilters();
      renderProducts();

    });

    collectionFilters.appendChild(button);
  });
}


// ============================================================
// PRODUCTS
// ============================================================

function getFilteredProducts() {

  if (activeFilter === "Tous") {
    return products;
  }

  return products.filter(
    (product) => product.category === activeFilter
  );
}


function renderProducts() {

  if (!productGrid) return;

  const filteredProducts = getFilteredProducts();

  productGrid.innerHTML = "";

  if (filteredProducts.length === 0) {

    if (emptyState) {
      emptyState.hidden = false;
    }

    return;
  }

  if (emptyState) {
    emptyState.hidden = true;
  }

  filteredProducts.forEach((product) => {

    const card = document.createElement("article");

    card.className = "product-card";

    const image = product.image
      ? `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy">`
      : `<div class="product-no-image">XN-KODASSY</div>`;

    const sizes = Array.isArray(product.sizes)
      ? product.sizes.join(" · ")
      : escapeHtml(product.sizes || "");

    card.innerHTML = `
      <div class="product-image">
        ${image}
      </div>

      <div class="product-info">

        <div class="product-category">
          ${escapeHtml(product.category || "")}
        </div>

        <h3>
          ${escapeHtml(product.name || "")}
        </h3>

        <div class="product-price">
          ${formatPrice(product.price)}
        </div>

        ${
          sizes
            ? `<div class="product-sizes">${sizes}</div>`
            : ""
        }

        ${
          product.desc
            ? `<p class="product-desc">${escapeHtml(product.desc)}</p>`
            : ""
        }

        <button
          type="button"
          class="btn btn-primary order-product"
          data-id="${escapeHtml(product.id)}"
        >
          Commander
        </button>

      </div>
    `;

    productGrid.appendChild(card);
  });

  document
    .querySelectorAll(".order-product")
    .forEach((button) => {

      button.addEventListener("click", () => {

        const product = products.find(
          (item) => item.id === button.dataset.id
        );

        if (!product) return;

        selectProductForOrder(product);

        const orderSection =
          document.getElementById("order");

        if (orderSection) {
          orderSection.scrollIntoView({
            behavior: "smooth"
          });
        }
      });
    });
}


// ============================================================
// ORDER FORM
// ============================================================

function selectProductForOrder(product) {

  if (oArticle) {

    oArticle.value = product.name;

    oArticle.dispatchEvent(
      new Event("change")
    );
  }

  if (oSize) {

    const availableSizes =
      Array.isArray(product.sizes)
        ? product.sizes
        : [];

    oSize.innerHTML = "";

    if (availableSizes.length > 0) {

      availableSizes.forEach((size) => {

        const option =
          document.createElement("option");

        option.value = size;
        option.textContent = size;

        oSize.appendChild(option);
      });

    } else {

      const option =
        document.createElement("option");

      option.value = "";
      option.textContent = "Taille unique";

      oSize.appendChild(option);
    }
  }
}


function renderOrderOptions() {

  if (!oArticle) return;

  const previousValue = oArticle.value;

  oArticle.innerHTML = "";

  products.forEach((product) => {

    const option =
      document.createElement("option");

    option.value = product.name;
    option.textContent =
      `${product.name} — ${formatPrice(product.price)}`;

    oArticle.appendChild(option);
  });

  if (
    previousValue &&
    products.some(
      (product) => product.name === previousValue
    )
  ) {
    oArticle.value = previousValue;
  }

  updateOrderSizes();
}


function updateOrderSizes() {

  if (!oArticle || !oSize) return;

  const product =
    products.find(
      (item) => item.name === oArticle.value
    );

  oSize.innerHTML = "";

  if (!product) return;

  const sizes =
    Array.isArray(product.sizes)
      ? product.sizes
      : [];

  if (sizes.length === 0) {

    const option =
      document.createElement("option");

    option.value = "";
    option.textContent = "Taille unique";

    oSize.appendChild(option);

    return;
  }

  sizes.forEach((size) => {

    const option =
      document.createElement("option");

    option.value = size;
    option.textContent = size;

    oSize.appendChild(option);
  });
}


if (oArticle) {

  oArticle.addEventListener(
    "change",
    updateOrderSizes
  );
}


// ============================================================
// WHATSAPP ORDER
// ============================================================

if (whatsappBtn) {

  whatsappBtn.addEventListener(
    "click",
    (event) => {

      event.preventDefault();

      const name =
        oName?.value.trim() || "";

      const phone =
        oPhone?.value.trim() || "";

      const article =
        oArticle?.value.trim() || "";

      const size =
        oSize?.value.trim() || "";

      const qty =
        oQty?.value || "1";

      const city =
        oCity?.value.trim() || "";

      const address =
        oAddress?.value.trim() || "";

      const message =
        oMessage?.value.trim() || "";

      if (!name || !phone || !article) {

        alert(
          "Veuillez remplir votre nom, téléphone et article."
        );

        return;
      }

      const text = `
Bonjour XN-KODASSY 👋

Je souhaite commander :

Article : ${article}
Taille : ${size || "Non précisée"}
Quantité : ${qty}

Nom : ${name}
Téléphone : ${phone}
Ville : ${city}
Adresse : ${address}

Message :
${message}
      `.trim();

      const url =
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

      window.open(url, "_blank");

      if (orderConfirm) {
        orderConfirm.hidden = false;
      }
    }
  );
}


// ============================================================
// ADMIN AUTHENTICATION
// ============================================================

onAuthStateChanged(auth, (user) => {

  currentUser = user;

  if (user) {

    console.log(
      "Manager connecté :",
      user.email
    );

  } else {

    console.log(
      "Aucun manager connecté."
    );
  }
});


if (adminToggleLink) {

  adminToggleLink.addEventListener(
    "click",
    async (event) => {

      event.preventDefault();

      // Déjà connecté
      if (currentUser) {

        openAdminPanel();

        return;
      }

      const email =
        prompt(
          "Email du gérant :"
        );

      if (!email) return;

      const password =
        prompt(
          "Mot de passe du gérant :"
        );

      if (!password) return;

      try {

        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        openAdminPanel();

      } catch (error) {

        console.error(error);

        alert(
          "Connexion impossible.\n\n" +
          "Vérifiez l'email et le mot de passe."
        );
      }
    }
  );
}


function openAdminPanel() {

  if (!adminPanel) return;

  adminPanel.hidden = false;

  adminPanel.scrollIntoView({
    behavior: "smooth"
  });

  renderAdminList();
}


if (closeAdmin) {

  closeAdmin.addEventListener(
    "click",
    async () => {

      if (adminPanel) {
        adminPanel.hidden = true;
      }

      try {
        await signOut(auth);
      } catch (error) {
        console.error(error);
      }
    }
  );
}


// ============================================================
// IMAGE PREVIEW
// ============================================================

if (pImageFile) {

  pImageFile.addEventListener(
    "change",
    () => {

      const file =
        pImageFile.files?.[0];

      if (!file) return;

      if (!file.type.startsWith("image/")) {

        alert(
          "Veuillez sélectionner une image."
        );

        pImageFile.value = "";

        return;
      }

      const reader =
        new FileReader();

      reader.onload = (event) => {

        editingImageData =
          event.target.result;

        if (imagePreview) {
          imagePreview.src =
            editingImageData;
        }

        if (imagePreviewRow) {
          imagePreviewRow.hidden = false;
        }
      };

      reader.readAsDataURL(file);
    }
  );
}


if (removeImage) {

  removeImage.addEventListener(
    "click",
    () => {

      editingImageData = null;

      if (pImageFile) {
        pImageFile.value = "";
      }

      if (pImage) {
        pImage.value = "";
      }

      if (imagePreviewRow) {
        imagePreviewRow.hidden = true;
      }

      if (imagePreview) {
        imagePreview.removeAttribute("src");
      }
    }
  );
}


// ============================================================
// ADD PRODUCT
// ============================================================

if (productForm) {

  productForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();

      if (!currentUser) {

        alert(
          "Vous devez être connecté comme gérant."
        );

        return;
      }

      const name =
        pName?.value.trim() || "";

      const price =
        Number(pPrice?.value);

      const category =
        pCategory?.value.trim() || "";

      const sizesText =
        pSizes?.value.trim() || "";

      const description =
        pDesc?.value.trim() || "";

      const imageUrl =
        pImage?.value.trim() || "";

      if (!name) {

        alert(
          "Veuillez saisir le nom du produit."
        );

        return;
      }

      if (Number.isNaN(price)) {

        alert(
          "Veuillez saisir un prix valide."
        );

        return;
      }

      const sizes =
        sizesText
          ? sizesText
              .split(",")
              .map((size) => size.trim())
              .filter(Boolean)
          : [];

      const submitButton =
        productForm.querySelector(
          'button[type="submit"]'
        );

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent =
          "Enregistrement...";
      }

      try {

        let finalImage =
          imageUrl || "";

        let imagePath =
          "";

        // ----------------------------------------------------
        // UPLOAD IMAGE TO FIREBASE STORAGE
        // ----------------------------------------------------

        const file =
          pImageFile?.files?.[0];

        if (file) {

          const path =
            generateStorageName(file);

          const storageRef =
            ref(storage, path);

          await uploadBytes(
            storageRef,
            file
          );

          finalImage =
            await getDownloadURL(
              storageRef
            );

          imagePath = path;
        }

        // ----------------------------------------------------
        // SAVE PRODUCT TO FIRESTORE
        // ----------------------------------------------------

        await addDoc(
          productsRef,
          {
            name,
            price,
            category,
            sizes,
            image: finalImage,
            imagePath,
            desc: description,
            createdAt: serverTimestamp()
          }
        );

        alert(
          "Produit ajouté avec succès ✅"
        );

        productForm.reset();

        editingImageData = null;

        if (imagePreviewRow) {
          imagePreviewRow.hidden = true;
        }

        if (imagePreview) {
          imagePreview.removeAttribute("src");
        }

      } catch (error) {

        console.error(
          "Erreur ajout produit:",
          error
        );

        alert(
          "Erreur lors de l'ajout du produit.\n\n" +
          error.message
        );

      } finally {

        if (submitButton) {

          submitButton.disabled = false;

          submitButton.textContent =
            "Ajouter le produit";
        }
      }
    }
  );
}


// ============================================================
// ADMIN PRODUCT LIST
// ============================================================

function renderAdminList() {

  if (!adminList) return;

  adminList.innerHTML = "";

  if (products.length === 0) {

    adminList.innerHTML =
      "<p>Aucun produit pour le moment.</p>";

    return;
  }

  products.forEach((product) => {

    const item =
      document.createElement("div");

    item.className = "admin-product-item";

    item.innerHTML = `
      <div>
        <strong>
          ${escapeHtml(product.name)}
        </strong>

        <span>
          ${formatPrice(product.price)}
        </span>
      </div>

      <button
        type="button"
        class="delete-product"
        data-id="${escapeHtml(product.id)}"
      >
        Supprimer
      </button>
    `;

    adminList.appendChild(item);
  });

  document
    .querySelectorAll(".delete-product")
    .forEach((button) => {

      button.addEventListener(
        "click",
        async () => {

          const productId =
            button.dataset.id;

          const product =
            products.find(
              (item) =>
                item.id === productId
            );

          if (!product) return;

          const confirmed =
            confirm(
              `Supprimer "${product.name}" ?`
            );

          if (!confirmed) return;

          try {

            // Delete Firestore document
            await deleteDoc(
              doc(
                db,
                "products",
                productId
              )
            );

            // Delete Storage image
            if (product.imagePath) {

              try {

                const imageRef =
                  ref(
                    storage,
                    product.imagePath
                  );

                await deleteObject(
                  imageRef
                );

              } catch (imageError) {

                console.warn(
                  "Image non supprimée :",
                  imageError
                );
              }
            }

            alert(
              "Produit supprimé ✅"
            );

          } catch (error) {

            console.error(error);

            alert(
              "Erreur lors de la suppression.\n\n" +
              error.message
            );
          }
        }
      );
    });
}


// ============================================================
// EXPORT CATALOG
// ============================================================

if (exportCatalog) {

  exportCatalog.addEventListener(
    "click",
    () => {

      const exportProducts =
        products.map((product) => ({
          id: product.id,
          name: product.name || "",
          price: product.price || 0,
          category: product.category || "",
          sizes: product.sizes || [],
          image: product.image || "",
          desc: product.desc || ""
        }));

      const json =
        JSON.stringify(
          exportProducts,
          null,
          2
        );

      const blob =
        new Blob(
          [json],
          {
            type: "application/json"
          }
        );

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        "xn-kodassy-products.json";

      document.body.appendChild(link);

      link.click();

      link.remove();

      URL.revokeObjectURL(url);
    }
  );
}


// ============================================================
// MOBILE MENU
// ============================================================

const burger =
  document.querySelector(".burger");

const nav =
  document.querySelector(".nav");

if (burger && nav) {

  burger.addEventListener(
    "click",
    () => {

      nav.classList.toggle("open");
    }
  );
}


// ============================================================
// YEAR
// ============================================================

const yearElement =
  document.getElementById("year");

if (yearElement) {

  yearElement.textContent =
    new Date().getFullYear();
}


// ============================================================
// START
// ============================================================

console.log(
  "XN-KODASSY Firebase chargé ✅"
);