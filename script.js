// ============================================================
// XN-KODASSY
// Firebase + Firestore + GitHub Images
// Lenis Smooth Scroll + Scroll Reveal
// ============================================================


// ============================================================
// LENIS
// ============================================================

import Lenis from "https://cdn.jsdelivr.net/npm/lenis@1.3.26/+esm";


// ============================================================
// FIREBASE IMPORTS
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
    updateDoc,
    doc,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


// ============================================================
// FIREBASE
// ============================================================

const firebaseConfig = {

    apiKey:
        "AIzaSyDYceEA3iY6N20uZJ3PBMAdINgxTvRMWoI",

    authDomain:
        "xn-kodassy.firebaseapp.com",

    projectId:
        "xn-kodassy",

    storageBucket:
        "xn-kodassy.firebasestorage.app",

    messagingSenderId:
        "587033328645",

    appId:
        "1:587033328645:web:f707f0e3c858342b3d706c",

    measurementId:
        "G-966SCVK8DH"
};


let app = null;
let auth = null;
let db = null;


try {

    app =
        initializeApp(
            firebaseConfig
        );

    auth =
        getAuth(app);

    db =
        getFirestore(app);

    console.log(
        "Firebase initialisé ✅"
    );

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
// LENIS INITIALIZATION
// ============================================================

const lenis = new Lenis({

    autoRaf:
        true,

    smoothWheel:
        true,

    anchors:
        false,

    stopInertiaOnNavigate:
        true,

    lerp:
        0.08,

    respectReducedMotion:
        true
});


window.lenis =
    lenis;


console.log(
    "Lenis Smooth Scroll activé ✅"
);


// ============================================================
// SETTINGS / STATE
// ============================================================

const WHATSAPP_NUMBER =
    "212600000000";


let products = [];

let orders = [];

let activeFilter =
    "Tous";

let currentUser =
    null;

let unsubscribeOrders =
    null;


// ============================================================
// DOM
// ============================================================

const productGrid =
    document.getElementById(
        "productGrid"
    );

const emptyState =
    document.getElementById(
        "emptyState"
    );

const collectionFilters =
    document.getElementById(
        "collectionFilters"
    );


const adminPanel =
    document.getElementById(
        "adminPanel"
    );

const adminList =
    document.getElementById(
        "adminList"
    );

const productForm =
    document.getElementById(
        "productForm"
    );


const pName =
    document.getElementById(
        "pName"
    );

const pPrice =
    document.getElementById(
        "pPrice"
    );

const pCategory =
    document.getElementById(
        "pCategory"
    );

const pSizes =
    document.getElementById(
        "pSizes"
    );

const pImageFile =
    document.getElementById(
        "pImageFile"
    );

const pImage =
    document.getElementById(
        "pImage"
    );

const pDesc =
    document.getElementById(
        "pDesc"
    );

const imagePreview =
    document.getElementById(
        "imagePreview"
    );

const imagePreviewRow =
    document.getElementById(
        "imagePreviewRow"
    );

const removeImage =
    document.getElementById(
        "removeImage"
    );

const exportCatalog =
    document.getElementById(
        "exportCatalog"
    );


const adminToggleLink =
    document.getElementById(
        "adminToggleLink"
    );

const closeAdmin =
    document.getElementById(
        "closeAdmin"
    );


const oName =
    document.getElementById(
        "oName"
    );

const oPhone =
    document.getElementById(
        "oPhone"
    );

const oArticle =
    document.getElementById(
        "oArticle"
    );

const oSize =
    document.getElementById(
        "oSize"
    );

const oQty =
    document.getElementById(
        "oQty"
    );

const oCity =
    document.getElementById(
        "oCity"
    );

const oAddress =
    document.getElementById(
        "oAddress"
    );

const oMessage =
    document.getElementById(
        "oMessage"
    );

const whatsappBtn =
    document.getElementById(
        "whatsappBtn"
    );

const orderConfirm =
    document.getElementById(
        "orderConfirm"
    );

const orderForm =
    document.getElementById(
        "orderForm"
    );


const productsRef =
    db
        ? collection(
            db,
            "products"
        )
        : null;


const ordersRef =
    db
        ? collection(
            db,
            "orders"
        )
        : null;


// ============================================================
// HELPERS
// ============================================================

function escapeHtml(value) {

    return String(
        value ?? ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}


function decodeURIComponentSafe(
    value
) {

    try {

        return decodeURIComponent(
            value
        );

    } catch {

        return value;
    }
}


function normalizeImageUrl(
    value
) {

    const image =
        String(
            value || ""
        ).trim();


    if (!image) {
        return "";
    }


    if (
        image.startsWith(
            "data:image/"
        )
    ) {

        return image;
    }


    if (
        image.startsWith(
            "http://"
        ) ||
        image.startsWith(
            "https://"
        )
    ) {

        return image;
    }


    const cleanPath =
        image

            .replace(
                /^\.\/+/,
                ""
            )

            .replace(
                /^\/+/,
                ""
            );


    const parts =
        cleanPath

            .split("/")

            .map(
                part =>
                    encodeURIComponent(
                        decodeURIComponentSafe(
                            part
                        )
                    )
            );


    return "./" +
        parts.join("/");
}


function formatPrice(
    price
) {

    const number =
        Number(price);


    if (
        Number.isNaN(
            number
        )
    ) {

        return "0 DH";
    }


    return (
        number.toLocaleString(
            "fr-FR"
        ) +
        " DH"
    );
}


function formatDate(
    timestamp
) {

    if (!timestamp) {

        return "Date inconnue";
    }


    try {

        const date =
            timestamp.toDate
                ? timestamp.toDate()
                : new Date(timestamp);


        return date.toLocaleString(
            "fr-FR",
            {
                dateStyle:
                    "short",

                timeStyle:
                    "short"
            }
        );

    } catch {

        return "Date inconnue";
    }
}


function getOrderData() {

    return {

        name:
            oName?.value.trim() ||
            "",

        phone:
            oPhone?.value.trim() ||
            "",

        article:
            oArticle?.value.trim() ||
            "",

        size:
            oSize?.value.trim() ||
            "",

        qty:
            Math.max(
                1,
                Number(
                    oQty?.value ||
                    1
                )
            ),

        city:
            oCity?.value.trim() ||
            "",

        address:
            oAddress?.value.trim() ||
            "",

        message:
            oMessage?.value.trim() ||
            ""
    };
}


function validateOrder(
    data
) {

    if (
        !data.name ||
        !data.phone ||
        !data.article ||
        !data.size ||
        !data.city
    ) {

        return (
            "Veuillez remplir tous les champs obligatoires."
        );
    }


    if (
        !Number.isFinite(
            data.qty
        ) ||
        data.qty < 1
    ) {

        return (
            "Veuillez saisir une quantité valide."
        );
    }


    return "";
}


function buildWhatsAppUrl(
    data
) {

    const text = `

Bonjour XN-KODASSY 👋

Je souhaite commander :

Article : ${data.article}
Taille : ${data.size || "Non précisée"}
Quantité : ${data.qty}

Nom : ${data.name}
Téléphone : ${data.phone}
Ville : ${data.city || "Non précisée"}
Adresse : ${data.address || "Non précisée"}

Message :
${data.message || "Aucun message supplémentaire."}

`.trim();


    return (
        `https://wa.me/${WHATSAPP_NUMBER}?text=` +
        encodeURIComponent(text)
    );
}


// ============================================================
// SMOOTH ANCHOR SCROLL
// ============================================================

function smoothScrollTo(
    target
) {

    if (!target) {
        return;
    }


    const element =
        document.querySelector(
            target
        );


    if (!element) {
        return;
    }


    lenis.scrollTo(
        element,
        {
            offset:
                -78,

            duration:
                1.2
        }
    );
}


document
    .querySelectorAll(
        'a[href^="#"]'
    )
    .forEach(
        link => {

            link.addEventListener(
                "click",
                event => {

                    const href =
                        link.getAttribute(
                            "href"
                        );


                    if (
                        !href ||
                        href === "#"
                    ) {
                        return;
                    }


                    const target =
                        document.querySelector(
                            href
                        );


                    if (!target) {
                        return;
                    }


                    event.preventDefault();


                    smoothScrollTo(
                        href
                    );


                    history.replaceState(
                        null,
                        "",
                        href
                    );
                }
            );
        }
    );


// ============================================================
// HEADER SCROLL EFFECT
// ============================================================

const siteHeader =
    document.querySelector(
        ".site-header"
    );


lenis.on(
    "scroll",
    ({
        scroll
    }) => {

        if (!siteHeader) {
            return;
        }


        if (
            scroll > 30
        ) {

            siteHeader.classList.add(
                "scrolled"
            );

        } else {

            siteHeader.classList.remove(
                "scrolled"
            );
        }
    }
);


// ============================================================
// SCROLL REVEAL
// ============================================================

const revealElements =
    document.querySelectorAll(
        ".reveal"
    );


if (
    "IntersectionObserver"
    in window
) {

    const revealObserver =
        new IntersectionObserver(
            entries => {

                entries.forEach(
                    entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "visible"
                            );

                            revealObserver.unobserve(
                                entry.target
                            );
                        }
                    }
                );

            },
            {
                threshold:
                    0.12,

                rootMargin:
                    "0px 0px -50px 0px"
            }
        );


    revealElements.forEach(
        element => {

            revealObserver.observe(
                element
            );
        }
    );

} else {

    revealElements.forEach(
        element => {

            element.classList.add(
                "visible"
            );
        }
    );
}


// ============================================================
// PRODUCT CARD REVEAL
// ============================================================

function animateProductCards() {

    if (!productGrid) {
        return;
    }


    const cards =
        productGrid.querySelectorAll(
            ".product-card"
        );


    if (
        !("IntersectionObserver" in window)
    ) {

        cards.forEach(
            card =>
                card.classList.add(
                    "product-visible"
                )
        );

        return;
    }


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(
                    entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "product-visible"
                            );

                            observer.unobserve(
                                entry.target
                            );
                        }
                    }
                );

            },
            {
                threshold:
                    0.08
            }
        );


    cards.forEach(
        (card, index) => {

            card.style.transitionDelay =
                `${Math.min(index * 70, 350)}ms`;

            observer.observe(
                card
            );
        }
    );
}


// ============================================================
// ADMIN LOGIN
// ============================================================

if (adminToggleLink) {

    adminToggleLink.addEventListener(
        "click",
        async event => {

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


                alert(
                    message
                );
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
        user => {

            currentUser =
                user || null;


            if (user) {

                console.log(
                    "Manager connecté :",
                    user.email
                );


                startOrdersListener();

            } else {

                console.log(
                    "Aucun manager connecté."
                );


                stopOrdersListener();


                orders =
                    [];


                renderAdminList();
            }
        }
    );
}


function startOrdersListener() {

    if (
        !ordersRef ||
        unsubscribeOrders
    ) {

        return;
    }


    unsubscribeOrders =
        onSnapshot(
            ordersRef,

            snapshot => {

                orders =
                    snapshot.docs.map(
                        item => ({
                            id:
                                item.id,

                            ...item.data()
                        })
                    );


                orders.sort(
                    (a, b) => {

                        const dateA =
                            a.createdAt?.seconds ||
                            0;

                        const dateB =
                            b.createdAt?.seconds ||
                            0;


                        return (
                            dateB -
                            dateA
                        );
                    }
                );


                console.log(
                    `${orders.length} commande(s) chargée(s) ✅`
                );


                renderAdminList();
            },

            error => {

                console.error(
                    "Erreur commandes Firestore:",
                    error
                );
            }
        );
}


function stopOrdersListener() {

    if (unsubscribeOrders) {

        unsubscribeOrders();

        unsubscribeOrders =
            null;
    }
}


// ============================================================
// ADMIN PANEL
// ============================================================

function openAdminPanel() {

    if (!adminPanel) {
        return;
    }


    adminPanel.hidden =
        false;


    renderAdminList();


    lenis.scrollTo(
        adminPanel,
        {
            offset:
                -20,

            duration:
                1.1
        }
    );
}


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

                    await signOut(
                        auth
                    );

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
// PRODUCTS REAL-TIME
// ============================================================

if (productsRef) {

    onSnapshot(
        productsRef,

        snapshot => {

            products =
                snapshot.docs.map(
                    item => ({

                        id:
                            item.id,

                        ...item.data()
                    })
                );


            products.sort(
                (a, b) => {

                    const dateA =
                        a.createdAt?.seconds ||
                        0;

                    const dateB =
                        b.createdAt?.seconds ||
                        0;


                    return (
                        dateB -
                        dateA
                    );
                }
            );


            renderFilters();

            renderProducts();

            renderOrderOptions();

            renderAdminList();
        },


        error => {

            console.error(
                "Firestore products error:",
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
                    product =>
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
        category => {

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


function getFilteredProducts() {

    if (
        activeFilter ===
        "Tous"
    ) {

        return products;
    }


    return products.filter(
        product =>
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

            emptyState.textContent =
                "Aucun produit pour le moment.";
        }


        return;
    }


    if (emptyState) {

        emptyState.hidden =
            true;
    }


    filteredProducts.forEach(
        product => {

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
                            onerror="
                                this.style.display='none';
                                this.parentElement.classList.add('image-error');
                            "
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
                            size =>
                                escapeHtml(
                                    size
                                )
                        )

                        .join(
                            " · "
                        )

                    : escapeHtml(
                        product.sizes ||
                        ""
                    );


            card.innerHTML = `

                <div class="product-image">

                    ${image}

                </div>


                <div class="product-info">

                    <div class="product-category">

                        ${escapeHtml(
                            product.category ||
                            ""
                        )}

                    </div>


                    <h3>

                        ${escapeHtml(
                            product.name ||
                            ""
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


    requestAnimationFrame(
        () => {

            animateProductCards();

        }
    );
}


// ============================================================
// PRODUCT COMMANDER BUTTON
// ============================================================

if (productGrid) {

    productGrid.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".order-product"
                );


            if (!button) {
                return;
            }


            const product =
                products.find(
                    item =>
                        item.id ===
                        button.dataset.id
                );


            if (!product) {
                return;
            }


            selectProductForOrder(
                product
            );


            const orderSection =
                document.getElementById(
                    "commande"
                );


            if (!orderSection) {
                return;
            }


            smoothScrollTo(
                "#commande"
            );


            setTimeout(
                () => {

                    if (oName) {

                        oName.focus();
                    }

                },
                900
            );
        }
    );
}


// ============================================================
// ORDER OPTIONS
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
        product => {

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
            product =>
                product.name ===
                previousValue
        )
    ) {

        oArticle.value =
            previousValue;
    }


    updateOrderSizes();
}


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
            item =>
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


    oSize.value =
        "";


    oSize.placeholder =
        sizes.length > 0

            ? `Tailles : ${sizes.join(
                ", "
            )}`

            : "Taille";
}


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
        event => {

            event.preventDefault();


            const data =
                getOrderData();


            if (
                !data.name ||
                !data.phone ||
                !data.article
            ) {

                alert(
                    "Veuillez remplir votre nom, téléphone et article."
                );

                return;
            }


            const url =
                buildWhatsAppUrl(
                    data
                );


            window.open(
                url,
                "_blank",
                "noopener,noreferrer"
            );
        }
    );
}


// ============================================================
// ORDER FORM
// ============================================================

if (orderForm) {

    orderForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            if (!ordersRef) {

                alert(
                    "Firestore n'est pas disponible."
                );

                return;
            }


            const data =
                getOrderData();


            const validationError =
                validateOrder(
                    data
                );


            if (validationError) {

                alert(
                    validationError
                );

                return;
            }


            const submitButton =
                orderForm.querySelector(
                    'button[type="submit"]'
                );


            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.textContent =
                    "Enregistrement...";
            }


            try {

                await addDoc(
                    ordersRef,
                    {

                        ...data,

                        channel:
                            "Formulaire",

                        status:
                            "Nouveau",

                        createdAt:
                            serverTimestamp()
                    }
                );


                if (orderConfirm) {

                    orderConfirm.hidden =
                        false;

                    orderConfirm.textContent =
                        "Merci ! Votre demande a bien été enregistrée.";
                }


                orderForm.reset();


                updateOrderSizes();


                console.log(
                    "Commande enregistrée dans Firestore ✅"
                );

            } catch (error) {

                console.error(
                    "Erreur enregistrement commande:",
                    error
                );


                alert(
                    "Impossible d'enregistrer la commande.\n\n" +
                    (
                        error.message ||
                        "Erreur inconnue."
                    )
                );

            } finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Envoyer la commande";
                }
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
                event => {

                    if (imagePreview) {

                        imagePreview.src =
                            event.target.result;
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


            if (imagePreview) {

                imagePreview.src =
                    normalizeImageUrl(
                        value
                    );
            }


            if (imagePreviewRow) {

                imagePreviewRow.hidden =
                    false;
            }
        }
    );
}


if (removeImage) {

    removeImage.addEventListener(
        "click",
        () => {

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
        async event => {

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
                Number.isNaN(
                    price
                )
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
                            size =>
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

                await addDoc(
                    productsRef,
                    {

                        name,

                        price,

                        category,

                        sizes,

                        image:
                            normalizeImageUrl(
                                imageInput
                            ),

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


                alert(
                    "Erreur lors de l'ajout du produit.\n\n" +
                    (
                        error.message ||
                        "Erreur inconnue."
                    )
                );

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


    const titleProducts =
        document.createElement(
            "h3"
        );


    titleProducts.textContent =
        "Produits";


    adminList.appendChild(
        titleProducts
    );


    if (
        products.length ===
        0
    ) {

        const p =
            document.createElement(
                "p"
            );


        p.textContent =
            "Aucun produit pour le moment.";


        adminList.appendChild(
            p
        );

    } else {

        products.forEach(
            product => {

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
    }


    const titleOrders =
        document.createElement(
            "h3"
        );


    titleOrders.textContent =
        "Commandes clients";


    adminList.appendChild(
        titleOrders
    );


    if (!currentUser) {

        const p =
            document.createElement(
                "p"
            );


        p.textContent =
            "Connectez-vous pour voir les commandes.";


        adminList.appendChild(
            p
        );


        return;
    }


    if (
        orders.length ===
        0
    ) {

        const p =
            document.createElement(
                "p"
            );


        p.textContent =
            "Aucune commande pour le moment.";


        adminList.appendChild(
            p
        );


        return;
    }


    orders.forEach(
        order => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "admin-order-item";


            const status =
                order.status ||
                "Nouveau";


            const statusLabel =
                status ===
                "Traité"

                    ? "Traité"

                    : "Nouveau";


            item.innerHTML = `

                <div class="admin-order-content">

                    <strong>
                        ${escapeHtml(
                            order.article ||
                            "Article"
                        )}
                    </strong>


                    <div>
                        <b>Client :</b>
                        ${escapeHtml(
                            order.name
                        )}
                    </div>


                    <div>
                        <b>Téléphone :</b>
                        ${escapeHtml(
                            order.phone
                        )}
                    </div>


                    <div>
                        <b>Taille :</b>
                        ${escapeHtml(
                            order.size
                        )}
                    </div>


                    <div>
                        <b>Quantité :</b>
                        ${escapeHtml(
                            order.qty
                        )}
                    </div>


                    <div>
                        <b>Ville :</b>
                        ${escapeHtml(
                            order.city
                        )}
                    </div>


                    <div>
                        <b>Adresse :</b>
                        ${escapeHtml(
                            order.address ||
                            "Non précisée"
                        )}
                    </div>


                    <div>
                        <b>Message :</b>
                        ${escapeHtml(
                            order.message ||
                            "Aucun"
                        )}
                    </div>


                    <div>
                        <b>Source :</b>
                        ${escapeHtml(
                            order.channel ||
                            "Formulaire"
                        )}
                    </div>


                    <div>
                        <b>Date :</b>
                        ${escapeHtml(
                            formatDate(
                                order.createdAt
                            )
                        )}
                    </div>


                    <div>
                        <b>Statut :</b>
                        ${escapeHtml(
                            statusLabel
                        )}
                    </div>

                </div>


                <div class="admin-order-actions">

                    <button
                        type="button"
                        class="toggle-order-status"
                        data-id="${escapeHtml(
                            order.id
                        )}"
                    >

                        ${
                            status === "Traité"

                                ? "Marquer nouveau"

                                : "Marquer traité"
                        }

                    </button>


                    <button
                        type="button"
                        class="delete-order"
                        data-id="${escapeHtml(
                            order.id
                        )}"
                    >
                        Supprimer
                    </button>

                </div>

            `;


            adminList.appendChild(
                item
            );
        }
    );


    // ========================================================
    // DELETE PRODUCTS
    // ========================================================

    adminList
        .querySelectorAll(
            ".delete-product"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        if (!currentUser) {
                            return;
                        }


                        const productId =
                            button.dataset.id;


                        const product =
                            products.find(
                                item =>
                                    item.id ===
                                    productId
                            );


                        if (!product) {
                            return;
                        }


                        if (
                            !confirm(
                                `Supprimer "${product.name}" ?`
                            )
                        ) {

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
                                "Erreur suppression produit:",
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


    // ========================================================
    // TOGGLE ORDER STATUS
    // ========================================================

    adminList
        .querySelectorAll(
            ".toggle-order-status"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        if (!currentUser) {
                            return;
                        }


                        const orderId =
                            button.dataset.id;


                        const order =
                            orders.find(
                                item =>
                                    item.id ===
                                    orderId
                            );


                        if (!order) {
                            return;
                        }


                        const newStatus =
                            order.status ===
                            "Traité"

                                ? "Nouveau"

                                : "Traité";


                        try {

                            await updateDoc(
                                doc(
                                    db,
                                    "orders",
                                    orderId
                                ),
                                {
                                    status:
                                        newStatus
                                }
                            );

                        } catch (error) {

                            console.error(
                                "Erreur statut commande:",
                                error
                            );


                            alert(
                                "Impossible de modifier le statut.\n\n" +
                                error.message
                            );
                        }
                    }
                );
            }
        );


    // ========================================================
    // DELETE ORDERS
    // ========================================================

    adminList
        .querySelectorAll(
            ".delete-order"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        if (!currentUser) {
                            return;
                        }


                        const orderId =
                            button.dataset.id;


                        const order =
                            orders.find(
                                item =>
                                    item.id ===
                                    orderId
                            );


                        if (!order) {
                            return;
                        }


                        if (
                            !confirm(
                                `Supprimer la commande de "${order.name}" ?`
                            )
                        ) {

                            return;
                        }


                        try {

                            await deleteDoc(
                                doc(
                                    db,
                                    "orders",
                                    orderId
                                )
                            );

                        } catch (error) {

                            console.error(
                                "Erreur suppression commande:",
                                error
                            );


                            alert(
                                "Impossible de supprimer la commande.\n\n" +
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
                    product => ({

                        id:
                            product.id,

                        name:
                            product.name ||
                            "",

                        price:
                            product.price ||
                            0,

                        category:
                            product.category ||
                            "",

                        sizes:
                            product.sizes ||
                            [],

                        image:
                            product.image ||
                            "",

                        desc:
                            product.desc ||
                            ""
                    })
                );


            const blob =
                new Blob(
                    [
                        JSON.stringify(
                            exportProducts,
                            null,
                            2
                        )
                    ],
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


            burger.classList.toggle(
                "active",
                isOpen
            );


            burger.setAttribute(
                "aria-expanded",
                String(isOpen)
            );
        }
    );


    nav.querySelectorAll(
        "a[href^='#']"
    ).forEach(
        link => {

            link.addEventListener(
                "click",
                () => {

                    nav.classList.remove(
                        "open"
                    );


                    burger.classList.remove(
                        "active"
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
    "Lenis Smooth Scroll: ACTIVÉ ✅"
);

console.log(
    "Scroll Reveal: ACTIVÉ ✅"
);

console.log(
    "Formulaire: COMMANDES SAUVEGARDÉES ✅"
);

console.log(
    "WhatsApp: UNIQUEMENT WHATSAPP ✅"
);

console.log(
    "Firebase Storage: DÉSACTIVÉ"
);

console.log(
    "================================================"
);
