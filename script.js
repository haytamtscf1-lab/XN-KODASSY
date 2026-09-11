// ============================================================
// XN-KODASSY
// Firebase + Firestore + GitHub Images
// ============================================================

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

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


// ============================================================
// FIREBASE CONFIG
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyDYceEA3iY6N20uZJ3PBMAdINgxTvRMWoI",
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

let app = null;
let auth = null;
let db = null;

try {

  app = initializeApp(firebaseConfig);

  auth = getAuth(app);

  db = getFirestore(app);

  console.log("Firebase initialisé ✅");

} catch (error) {

  console.error(
    "Erreur initialisation Firebase:",
    error
  );

  alert(
    "Erreur de connexion à Firebase.\n\n" +
    error.message
  );
}


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

const productGrid =
  document.getElementById("productGrid");

const emptyState =
  document.getElementById("emptyState");

const collectionFilters =
  document.getElementById("collectionFilters");

const adminPanel =
  document.getElementById("adminPanel");

const adminList =
  document.getElementById("adminList");

const productForm =
  document.getElementById("productForm");

const pName =
  document.getElementById("pName");

const pPrice =
  document.getElementById("pPrice");

const pCategory =
  document.getElementById("pCategory");

const pSizes =
  document.getElementById("pSizes");

const pImageFile =
  document.getElementById("pImageFile");

const pImage =
  document.getElementById("pImage");

const pDesc =
  document.getElementById("pDesc");

const imagePreview =
  document.getElementById("imagePreview");

const imagePreviewRow =
  document.getElementById("imagePreviewRow");

const removeImage =
  document.getElementById("removeImage");

const exportCatalog =
  document.getElementById("exportCatalog");

const adminToggleLink =
  document.getElementById("adminToggleLink");

const closeAdmin =
  document.getElementById("closeAdmin");

const oName =
  document.getElementById("oName");

const oPhone =
  document.getElementById("oPhone");

const oArticle =
  document.getElementById("oArticle");

const oSize =
  document.getElementById("oSize");

const oQty =
  document.getElementById("oQty");

const oCity =
  document.getElementById("oCity");

const oAddress =
  document.getElementById("oAddress");

const oMessage =
  document.getElementById("oMessage");

const whatsappBtn =
  document.getElementById("whatsappBtn");

const orderConfirm =
  document.getElementById("orderConfirm");


// ============================================================
// GLOBAL ERRORS
// ============================================================

window.addEventListener(
  "error",
  (event) => {

    console.error(
      "Erreur JavaScript:",
      event.error || event.message
    );

  }
);

window.addEventListener(
  "unhandledrejection",
  (event) => {

    console.error(
      "Promise non gérée:",
      event.reason
    );

  }
);


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


// ============================================================
// SAFE DECODER
// ============================================================

function decodeURIComponentSafe(value) {

  try {

    return decodeURIComponent(value);

  } catch {

    return value;

  }
}


// ============================================================
// IMAGE URL
// ============================================================

function normalizeImageUrl(value) {

  const image =
    String(value || "").trim();

  if (!image) {

    return "";

  }


  if (
    image.startsWith("data:image/")
  ) {

    return image;

  }


  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {

    return image;

  }


  let cleanPath =
    image
      .replace(/^\.\/+/, "")
      .replace(/^\/+/, "");


  const parts =
    cleanPath
      .split("/")
      .map(
        (part) =>
          encodeURIComponent(
            decodeURIComponentSafe(part)
          )
      );


  return "./" + parts.join("/");
}


// ============================================================
// PRICE
// ============================================================

function formatPrice(price) {

  const number =
    Number(price);

  if (Number.isNaN(number)) {

    return "0 DH";

  }

  return `${number.toLocaleString("fr-FR")} DH`;
}


// ============================================================
// FIRESTORE
// ============================================================

let productsRef = null;

if (db) {

  productsRef =
    collection(
      db,
      "products"
    );

}


// ============================================================
// ADMIN LOGIN
// ============================================================

if (adminToggleLink) {

  adminToggleLink.addEventListener(
    "click",
    async (event) => {

      event.preventDefault();

      if (currentUser) {

        openAdminPanel();

        return;

      }


      const email =
        prompt(
          "Email du gérant :"
        );

      if (!email) {

        return;

      }


      const password =
        prompt(
          "Mot de passe du gérant :"
        );

      if (!password) {

        return;

      }


      if (!auth) {

        alert(
          "Firebase Authentication n'est pas disponible."
        );

        return;

      }


      try {

        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );


        alert(
          "Connexion réussie ✅"
        );


        openAdminPanel();


      } catch (error) {

        console.error(
          "Erreur connexion:",
          error
        );


        let message =
          "Connexion impossible.\n\n";


        if (
          error.code ===
          "auth/invalid-credential"
        ) {

          message +=
            "Email ou mot de passe incorrect.";

        } else if (
          error.code ===
          "auth/user-not-found"
        ) {

          message +=
            "Utilisateur introuvable.";

        } else if (
          error.code ===
          "auth/wrong-password"
        ) {

          message +=
            "Mot de passe incorrect.";

        } else if (
          error.code ===
          "auth/invalid-email"
        ) {

          message +=
            "Adresse email invalide.";

        } else if (
          error.code ===
          "auth/too-many-requests"
        ) {

          message +=
            "Trop de tentatives. Réessayez plus tard.";

        } else {

          message +=
            error.message ||
            "Erreur inconnue.";

        }


        alert(message);

      }

    }
  );

}


// ============================================================
// AUTH STATE
// ============================================================

if (auth) {

  onAuthStateChanged(
    auth,
    (user) => {

      currentUser =
        user || null;


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

    }
  );

}


// ============================================================
// OPEN ADMIN
// ============================================================

function openAdminPanel() {

  if (!adminPanel) {

    return;

  }


  adminPanel.hidden =
    false;


  renderAdminList();


  adminPanel.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}


// ============================================================
// CLOSE ADMIN
// ============================================================

if (closeAdmin) {

  closeAdmin.addEventListener(
    "click",
    async () => {

      if (adminPanel) {

        adminPanel.hidden =
          true;

      }


      if (auth) {

        try {

          await signOut(auth);

        } catch (error) {

          console.error(
            "Erreur déconnexion:",
            error
          );

        }

      }

    }
  );

}


// ============================================================
// FIRESTORE REAL-TIME
// ============================================================

if (productsRef) {

  onSnapshot(
    productsRef,

    (snapshot) => {

      products =
        snapshot.docs.map(
          (item) => ({

            id: item.id,

            ...item.data()

          })
        );


      products.sort(
        (a, b) => {

          const dateA =
            a.createdAt?.seconds || 0;

          const dateB =
            b.createdAt?.seconds || 0;

          return dateB - dateA;

        }
      );


      console.log(
        `${products.length} produit(s) chargé(s) ✅`
      );


      renderFilters();

      renderProducts();

      renderOrderOptions();

      renderAdminList();

    },


    (error) => {

      console.error(
        "Firestore error:",
        error
      );


      if (emptyState) {

        emptyState.hidden =
          false;

        emptyState.textContent =
          "Impossible de charger les produits.";

      }

    }

  );

}


// ============================================================
// FILTERS
// ============================================================

function renderFilters() {

  if (!collectionFilters) {

    return;

  }


  const categories = [
    "Tous",
    ...new Set(
      products
        .map(
          (product) =>
            product.category
        )
        .filter(Boolean)
    )
  ];


  if (
    !categories.includes(
      activeFilter
    )
  ) {

    activeFilter =
      "Tous";

  }


  collectionFilters.innerHTML =
    "";


  categories.forEach(
    (category) => {

      const button =
        document.createElement(
          "button"
        );


      button.type =
        "button";


      button.className =
        category === activeFilter
          ? "filter-btn active"
          : "filter-btn";


      button.textContent =
        category;


      // IMPORTANT:
      // Le bouton filtre ne doit PAS
      // contenir la logique Commander.
      button.addEventListener(
        "click",
        () => {

          activeFilter =
            category;

          renderFilters();

          renderProducts();

        }
      );


      collectionFilters.appendChild(
        button
      );

    }
  );

}


// ============================================================
// FILTERED PRODUCTS
// ============================================================

function getFilteredProducts() {

  if (
    activeFilter ===
    "Tous"
  ) {

    return products;

  }


  return products.filter(
    (product) =>
      product.category ===
      activeFilter
  );

}


// ============================================================
// PRODUCTS
// ============================================================

function renderProducts() {

  if (!productGrid) {

    return;

  }


  const filteredProducts =
    getFilteredProducts();


  productGrid.innerHTML =
    "";


  if (
    filteredProducts.length ===
    0
  ) {

    if (emptyState) {

      emptyState.hidden =
        false;

    }

    return;

  }


  if (emptyState) {

    emptyState.hidden =
      true;

  }


  filteredProducts.forEach(
    (product) => {

      const card =
        document.createElement(
          "article"
        );


      card.className =
        "product-card";


      const imageUrl =
        normalizeImageUrl(
          product.image
        );


      const image =
        imageUrl

          ? `
            <img
              src="${escapeHtml(imageUrl)}"
              alt="${escapeHtml(product.name)}"
              loading="lazy"
              onerror="this.style.display='none'; this.parentElement.classList.add('image-error');"
            >
          `

          : `
            <div class="product-no-image">
              XN-KODASSY
            </div>
          `;


      const sizes =
        Array.isArray(
          product.sizes
        )

          ? product.sizes
              .map(
                (size) =>
                  escapeHtml(size)
              )
              .join(" · ")

          : escapeHtml(
              product.sizes || ""
            );


      card.innerHTML = `

        <div class="product-image">

          ${image}

        </div>


        <div class="product-info">

          <div class="product-category">

            ${escapeHtml(
              product.category || ""
            )}

          </div>


          <h3>

            ${escapeHtml(
              product.name || ""
            )}

          </h3>


          <div class="product-price">

            ${formatPrice(
              product.price
            )}

          </div>


          ${
            sizes
              ? `
                <div class="product-sizes">

                  ${sizes}

                </div>
              `
              : ""
          }


          ${
            product.desc
              ? `
                <p class="product-desc">

                  ${escapeHtml(
                    product.desc
                  )}

                </p>
              `
              : ""
          }


          <button
            type="button"
            class="btn btn-primary order-product"
            data-id="${escapeHtml(
              product.id
            )}"
          >

            Commander

          </button>

        </div>

      `;


      productGrid.appendChild(
        card
      );

    }
  );

}


// ============================================================
// COMMANDER BUTTON
// ============================================================
//
// Event delegation.
// This is more reliable than recreating listeners every time
// the products are filtered or refreshed.
// ============================================================

if (productGrid) {

  productGrid.addEventListener(
    "click",
    (event) => {

      const button =
        event.target.closest(
          ".order-product"
        );


      if (!button) {

        return;

      }


      console.log(
        "Bouton Commander cliqué ✅"
      );


      const productId =
        button.dataset.id;


      const product =
        products.find(
          (item) =>
            item.id ===
            productId
        );


      if (!product) {

        console.error(
          "Produit introuvable:",
          productId
        );

        return;

      }


      // Sélectionner automatiquement
      // le produit dans le formulaire.
      selectProductForOrder(
        product
      );


      const orderSection =
        document.getElementById(
          "commande"
        );


      if (!orderSection) {

        console.error(
          "Section #commande introuvable."
        );

        return;

      }


      // Mettre le hash.
      window.location.hash =
        "commande";


      // Scroll.
      setTimeout(
        () => {

          orderSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });


          // Focus sur le nom.
          if (oName) {

            setTimeout(
              () => {

                oName.focus();

              },
              500
            );

          }

        },
        100
      );

    }
  );

}


// ============================================================
// SELECT PRODUCT
// ============================================================

function selectProductForOrder(
  product
) {

  if (!product) {

    return;

  }


  if (oArticle) {

    oArticle.value =
      product.name;

  }


  updateOrderSizes(
    product
  );

}


// ============================================================
// ORDER ARTICLE OPTIONS
// ============================================================

function renderOrderOptions() {

  if (!oArticle) {

    return;

  }


  const previousValue =
    oArticle.value;


  oArticle.innerHTML =
    "";


  const placeholder =
    document.createElement(
      "option"
    );


  placeholder.value =
    "";


  placeholder.textContent =
    "Sélectionner un produit";


  oArticle.appendChild(
    placeholder
  );


  products.forEach(
    (product) => {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        product.name;


      option.textContent =
        `${product.name} — ${formatPrice(
          product.price
        )}`;


      oArticle.appendChild(
        option
      );

    }
  );


  if (
    previousValue &&
    products.some(
      (product) =>
        product.name ===
        previousValue
    )
  ) {

    oArticle.value =
      previousValue;

  }


  updateOrderSizes();

}


// ============================================================
// UPDATE ORDER SIZE
// ============================================================
//
// IMPORTANT:
// #oSize is an INPUT in index.html.
// Therefore we do NOT add <option> elements to it.
// We simply display the available sizes as a placeholder.
// ============================================================

function updateOrderSizes(
  selectedProduct = null
) {

  if (
    !oArticle ||
    !oSize
  ) {

    return;

  }


  const product =
    selectedProduct ||
    products.find(
      (item) =>
        item.name ===
        oArticle.value
    );


  if (!product) {

    oSize.value =
      "";

    oSize.placeholder =
      "Ex : 42";

    return;

  }


  const sizes =
    Array.isArray(
      product.sizes
    )

      ? product.sizes
      : [];


  if (
    sizes.length > 0
  ) {

    // On garde l'input texte.
    oSize.value =
      "";

    oSize.placeholder =
      `Tailles : ${sizes.join(
        ", "
      )}`;

  } else {

    oSize.value =
      "";

    oSize.placeholder =
      "Taille";

  }

}


// ============================================================
// ARTICLE CHANGE
// ============================================================

if (oArticle) {

  oArticle.addEventListener(
    "change",
    () => {

      updateOrderSizes();

    }
  );

}


// ============================================================
// WHATSAPP
// ============================================================

if (whatsappBtn) {

  whatsappBtn.addEventListener(
    "click",
    (event) => {

      event.preventDefault();


      const name =
        oName?.value.trim() ||
        "";


      const phone =
        oPhone?.value.trim() ||
        "";


      const article =
        oArticle?.value.trim() ||
        "";


      const size =
        oSize?.value.trim() ||
        "";


      const qty =
        oQty?.value ||
        "1";


      const city =
        oCity?.value.trim() ||
        "";


      const address =
        oAddress?.value.trim() ||
        "";


      const message =
        oMessage?.value.trim() ||
        "";


      if (
        !name ||
        !phone ||
        !article
      ) {

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
Ville : ${city || "Non précisée"}
Adresse : ${address || "Non précisée"}

Message :
${message || "Aucun message supplémentaire."}
      `.trim();


      const url =
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
          text
        )}`;


      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );


      if (orderConfirm) {

        orderConfirm.hidden =
          false;

      }

    }
  );

}


// ============================================================
// SEND ORDER FORM
// ============================================================

if (document.getElementById("orderForm")) {

  const orderForm =
    document.getElementById(
      "orderForm"
    );


  orderForm.addEventListener(
    "submit",
    (event) => {

      event.preventDefault();


      if (orderConfirm) {

        orderConfirm.hidden =
          false;

        orderConfirm.textContent =
          "Merci ! Votre demande a bien été enregistrée. Vous pouvez également nous contacter via WhatsApp.";

      }


      // On ouvre également WhatsApp
      // pour que la commande arrive directement.
      if (whatsappBtn) {

        whatsappBtn.click();

      }

    }
  );

}


// ============================================================
// IMAGE FILE PREVIEW
// ============================================================

if (pImageFile) {

  pImageFile.addEventListener(
    "change",
    () => {

      const file =
        pImageFile.files?.[0];


      if (!file) {

        return;

      }


      if (
        !file.type.startsWith(
          "image/"
        )
      ) {

        alert(
          "Veuillez sélectionner une image."
        );


        pImageFile.value =
          "";


        return;

      }


      const reader =
        new FileReader();


      reader.onload =
        (event) => {

          editingImageData =
            event.target.result;


          if (imagePreview) {

            imagePreview.src =
              editingImageData;

          }


          if (imagePreviewRow) {

            imagePreviewRow.hidden =
              false;

          }

        };


      reader.readAsDataURL(
        file
      );

    }
  );

}


// ============================================================
// IMAGE PATH PREVIEW
// ============================================================

if (pImage) {

  pImage.addEventListener(
    "input",
    () => {

      const value =
        pImage.value.trim();


      if (!value) {

        if (imagePreviewRow) {

          imagePreviewRow.hidden =
            true;

        }

        return;

      }


      const imageUrl =
        normalizeImageUrl(
          value
        );


      if (imagePreview) {

        imagePreview.src =
          imageUrl;

      }


      if (imagePreviewRow) {

        imagePreviewRow.hidden =
          false;

      }

    }
  );

}


// ============================================================
// REMOVE IMAGE
// ============================================================

if (removeImage) {

  removeImage.addEventListener(
    "click",
    () => {

      editingImageData =
        null;


      if (pImageFile) {

        pImageFile.value =
          "";

      }


      if (pImage) {

        pImage.value =
          "";

      }


      if (imagePreviewRow) {

        imagePreviewRow.hidden =
          true;

      }


      if (imagePreview) {

        imagePreview.removeAttribute(
          "src"
        );

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


      if (!productsRef) {

        alert(
          "Firestore n'est pas disponible."
        );

        return;

      }


      const name =
        pName?.value.trim() ||
        "";


      const price =
        Number(
          pPrice?.value
        );


      const category =
        pCategory?.value.trim() ||
        "";


      const sizesText =
        pSizes?.value.trim() ||
        "";


      const description =
        pDesc?.value.trim() ||
        "";


      const imageInput =
        pImage?.value.trim() ||
        "";


      if (!name) {

        alert(
          "Veuillez saisir le nom du produit."
        );

        return;

      }


      if (
        Number.isNaN(price)
      ) {

        alert(
          "Veuillez saisir un prix valide."
        );

        return;

      }


      const sizes =
        sizesText

          ? sizesText
              .split(",")
              .map(
                (size) =>
                  size.trim()
              )
              .filter(Boolean)

          : [];


      const submitButton =
        productForm.querySelector(
          'button[type="submit"]'
        );


      if (submitButton) {

        submitButton.disabled =
          true;

        submitButton.textContent =
          "Enregistrement...";

      }


      try {

        const finalImage =
          normalizeImageUrl(
            imageInput
          );


        await addDoc(
          productsRef,
          {

            name,

            price,

            category,

            sizes,

            image:
              finalImage,

            imagePath:
              imageInput,

            desc:
              description,

            createdAt:
              serverTimestamp()

          }
        );


        alert(
          "Produit ajouté avec succès ✅"
        );


        productForm.reset();


        editingImageData =
          null;


        if (imagePreviewRow) {

          imagePreviewRow.hidden =
            true;

        }


        if (imagePreview) {

          imagePreview.removeAttribute(
            "src"
          );

        }


      } catch (error) {

        console.error(
          "Erreur ajout produit:",
          error
        );


        let message =
          "Erreur lors de l'ajout du produit.\n\n";


        if (
          error.code ===
          "permission-denied"
        ) {

          message +=
            "Vous n'avez pas les permissions nécessaires dans Firestore.";

        } else {

          message +=
            error.message ||
            "Erreur inconnue.";

        }


        alert(message);


      } finally {

        if (submitButton) {

          submitButton.disabled =
            false;

          submitButton.textContent =
            "Ajouter le produit";

        }

      }

    }
  );

}


// ============================================================
// ADMIN LIST
// ============================================================

function renderAdminList() {

  if (!adminList) {

    return;

  }


  adminList.innerHTML =
    "";


  if (
    products.length ===
    0
  ) {

    adminList.innerHTML =
      "<p>Aucun produit pour le moment.</p>";

    return;

  }


  products.forEach(
    (product) => {

      const item =
        document.createElement(
          "div"
        );


      item.className =
        "admin-product-item";


      item.innerHTML = `

        <div>

          <strong>

            ${escapeHtml(
              product.name
            )}

          </strong>

          <span>

            ${formatPrice(
              product.price
            )}

          </span>

        </div>


        <button
          type="button"
          class="delete-product"
          data-id="${escapeHtml(
            product.id
          )}"
        >

          Supprimer

        </button>

      `;


      adminList.appendChild(
        item
      );

    }
  );


  adminList
    .querySelectorAll(
      ".delete-product"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          async () => {

            if (!currentUser) {

              alert(
                "Vous devez être connecté comme gérant."
              );

              return;

            }


            const productId =
              button.dataset.id;


            const product =
              products.find(
                (item) =>
                  item.id ===
                  productId
              );


            if (!product) {

              return;

            }


            const confirmed =
              confirm(
                `Supprimer "${product.name}" ?`
              );


            if (!confirmed) {

              return;

            }


            try {

              await deleteDoc(
                doc(
                  db,
                  "products",
                  productId
                )
              );


              alert(
                "Produit supprimé ✅"
              );


            } catch (error) {

              console.error(
                "Erreur suppression:",
                error
              );


              alert(
                "Erreur lors de la suppression.\n\n" +
                error.message
              );

            }

          }
        );

      }
    );

}


// ============================================================
// EXPORT CATALOG
// ============================================================

if (exportCatalog) {

  exportCatalog.addEventListener(
    "click",
    () => {

      const exportProducts =
        products.map(
          (product) => ({

            id:
              product.id,

            name:
              product.name || "",

            price:
              product.price || 0,

            category:
              product.category || "",

            sizes:
              product.sizes || [],

            image:
              product.image || "",

            desc:
              product.desc || ""

          })
        );


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
            type:
              "application/json"
          }
        );


      const url =
        URL.createObjectURL(
          blob
        );


      const link =
        document.createElement(
          "a"
        );


      link.href =
        url;


      link.download =
        "xn-kodassy-products.json";


      document.body.appendChild(
        link
      );


      link.click();


      link.remove();


      URL.revokeObjectURL(
        url
      );

    }
  );

}


// ============================================================
// MOBILE MENU
// ============================================================

const burger =
  document.getElementById(
    "burgerBtn"
  );


const nav =
  document.getElementById(
    "mainNav"
  );


if (
  burger &&
  nav
) {

  burger.addEventListener(
    "click",
    () => {

      const isOpen =
        nav.classList.toggle(
          "open"
        );


      burger.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

    }
  );


  // Fermer le menu après
  // avoir choisi une section.
  nav.querySelectorAll(
    "a[href^='#']"
  ).forEach(
    (link) => {

      link.addEventListener(
        "click",
        () => {

          nav.classList.remove(
            "open"
          );


          burger.setAttribute(
            "aria-expanded",
            "false"
          );

        }
      );

    }
  );

}


// ============================================================
// YEAR
// ============================================================

const yearElement =
  document.getElementById(
    "year"
  );


if (yearElement) {

  yearElement.textContent =
    new Date().getFullYear();

}


// ============================================================
// START
// ============================================================

console.log(
  "================================================"
);

console.log(
  "XN-KODASSY Firebase chargé ✅"
);

console.log(
  "Mode: Firestore + GitHub Images"
);

console.log(
  "WhatsApp: ACTIVÉ ✅"
);

console.log(
  "Firebase Storage: DÉSACTIVÉ"
);

console.log(
  "================================================"
);
