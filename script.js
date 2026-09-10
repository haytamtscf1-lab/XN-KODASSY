/* =========================================================
   XN-KODASSY
   LOGIQUE DU SITE
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       CONFIGURATION
    ===================================================== */

    const STORAGE_KEY =
        "xn_kodassy_products";

    /*
       IMPORTANT :
       Remplace ce numéro par le vrai numéro WhatsApp.

       Format :
       212 + numéro
       sans +, sans espaces.
    */

    const WHATSAPP_NUMBER =
        "212600000000";


    /*
       Code espace gérant.

       IMPORTANT :
       Ce système est adapté à un site simple.
       Pour un vrai site professionnel en production,
       il faudra une authentification côté serveur.
    */

    const ADMIN_CODE =
        "XN-KODASSY2026";


    /* =====================================================
       PRODUITS PAR DEFAUT
    ===================================================== */

    const defaultProducts = [

        {
            id: cryptoId(),

            name:
                "XN Speed Pro",

            price:
                799,

            category:
                "Crampons",

            sizes:
                "39, 40, 41, 42, 43, 44",

            image:
                "",

            desc:
                "Crampons de football légers avec excellente adhérence et design sportif."
        },


        {
            id: cryptoId(),

            name:
                "Tenue XN Elite",

            price:
                499,

            category:
                "Tenues",

            sizes:
                "S, M, L, XL",

            image:
                "",

            desc:
                "Tenue complète de football avec maillot et short, confortable et respirante."
        },


        {
            id: cryptoId(),

            name:
                "Socks Silicone XN",

            price:
                129,

            category:
                "Socks",

            sizes:
                "39-42, 43-46",

            image:
                "",

            desc:
                "Chaussettes silicone antidérapantes pour une meilleure stabilité du pied."
        },


        {
            id: cryptoId(),

            name:
                "Ballon XN Match",

            price:
                249,

            category:
                "Ballons",

            sizes:
                "Taille 5",

            image:
                "",

            desc:
                "Ballon de football adapté aux entraînements et aux matchs."
        }

    ];


    /* =====================================================
       ID PRODUIT
    ===================================================== */

    function cryptoId() {

        return "p_" +
            Math.random()
                .toString(36)
                .slice(2, 10);
    }


    /* =====================================================
       RECUPERER LES PRODUITS
    ===================================================== */

    function getProducts() {

        try {

            const raw =
                localStorage.getItem(
                    STORAGE_KEY
                );

            if (!raw) {

                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(
                        defaultProducts
                    )
                );

                return defaultProducts.slice();
            }

            const data =
                JSON.parse(raw);

            if (!Array.isArray(data)) {

                return defaultProducts.slice();
            }

            return data;

        } catch (error) {

            console.warn(
                "Erreur catalogue :",
                error
            );

            return defaultProducts.slice();
        }
    }


    /* =====================================================
       SAUVEGARDER
    ===================================================== */

    function saveProducts(products) {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(products)
            );

        } catch (error) {

            console.warn(
                "Impossible de sauvegarder :",
                error
            );
        }
    }


    /* =====================================================
       VARIABLES
    ===================================================== */

    let products =
        getProducts();

    let activeFilter =
        "Tous";


    /* =====================================================
       ELEMENTS HTML
    ===================================================== */

    const productGrid =
        document.getElementById(
            "productGrid"
        );

    const emptyState =
        document.getElementById(
            "emptyState"
        );

    const filtersWrap =
        document.getElementById(
            "collectionFilters"
        );

    const orderArticleSelect =
        document.getElementById(
            "oArticle"
        );


    /* =====================================================
       PRIX
    ===================================================== */

    function formatPrice(value) {

        return Number(value)
            .toLocaleString("fr-FR")
            + " DH";
    }


    /* =====================================================
       SECURITE HTML
    ===================================================== */

    function escapeHtml(str) {

        const div =
            document.createElement(
                "div"
            );

        div.textContent =
            str == null
                ? ""
                : String(str);

        return div.innerHTML;
    }


    /* =====================================================
       FILTRES
    ===================================================== */

    function renderFilters() {

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


        filtersWrap.innerHTML =
            "";


        categories.forEach(
            category => {

                const button =
                    document.createElement(
                        "button"
                    );

                button.className =
                    "filter-chip" +
                    (
                        category === activeFilter
                            ? " is-active"
                            : ""
                    );

                button.textContent =
                    category;

                button.dataset.filter =
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


                filtersWrap.appendChild(
                    button
                );

            }
        );
    }


    /* =====================================================
       AFFICHER PRODUITS
    ===================================================== */

    function renderProducts() {

        const visibleProducts =
            activeFilter === "Tous"

                ? products

                : products.filter(
                    product =>
                        product.category ===
                        activeFilter
                );


        productGrid.innerHTML =
            "";


        emptyState.hidden =
            visibleProducts.length > 0;


        visibleProducts.forEach(
            product => {

                const card =
                    document.createElement(
                        "article"
                    );

                card.className =
                    "product-card";


                /* IMAGE */

                const media =
                    document.createElement(
                        "div"
                    );

                media.className =
                    "product-media";


                if (product.image) {

                    media.style.backgroundImage =
                        `url("${product.image}")`;

                } else {

                    const placeholder =
                        document.createElement(
                            "div"
                        );

                    placeholder.className =
                        "no-img";

                    placeholder.textContent =
                        "XN";

                    media.appendChild(
                        placeholder
                    );
                }


                /* CATEGORIE */

                const categoryTag =
                    document.createElement(
                        "span"
                    );

                categoryTag.className =
                    "product-store";

                categoryTag.textContent =
                    product.category ||
                    "Football";


                media.appendChild(
                    categoryTag
                );


                /* BODY */

                const body =
                    document.createElement(
                        "div"
                    );

                body.className =
                    "product-body";


                body.innerHTML = `

                    <span class="product-cat">
                        ${escapeHtml(
                            product.category || ""
                        )}
                    </span>

                    <h3 class="product-name">
                        ${escapeHtml(
                            product.name
                        )}
                    </h3>

                    <p class="product-desc">
                        ${escapeHtml(
                            product.desc || ""
                        )}
                    </p>

                    <div class="product-sizes">
                        <strong>Tailles :</strong>
                        ${escapeHtml(
                            product.sizes ||
                            "Selon disponibilité"
                        )}
                    </div>

                    <div class="product-foot">

                        <span class="product-price">
                            ${formatPrice(
                                product.price
                            )}
                        </span>

                        <button
                            class="product-order"
                            data-id="${product.id}">
                            Commander
                        </button>

                    </div>

                `;


                card.appendChild(
                    media
                );

                card.appendChild(
                    body
                );

                productGrid.appendChild(
                    card
                );

            }
        );


        /* BOUTONS COMMANDER */

        productGrid
            .querySelectorAll(
                ".product-order"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            const product =
                                products.find(
                                    item =>
                                        item.id ===
                                        button.dataset.id
                                );

                            if (!product) {
                                return;
                            }


                            document
                                .getElementById(
                                    "commande"
                                )
                                .scrollIntoView({
                                    behavior:
                                        "smooth"
                                });


                            selectArticle(
                                product.name
                            );
                        }
                    );
                }
            );
    }


    /* =====================================================
       OPTIONS PRODUITS COMMANDE
    ===================================================== */

    function renderOrderOptions() {

        orderArticleSelect.innerHTML =

            `<option value="">
                Sélectionner un produit
            </option>`;


        products.forEach(
            product => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    product.name;

                option.textContent =
                    `${product.name} — ${formatPrice(product.price)}`;


                orderArticleSelect.appendChild(
                    option
                );
            }
        );
    }


    /* =====================================================
       SELECTIONNER PRODUIT
    ===================================================== */

    function selectArticle(name) {

        renderOrderOptions();

        orderArticleSelect.value =
            name;
    }


    /* =====================================================
       REFRESH
    ===================================================== */

    function refreshAll() {

        saveProducts(products);

        renderFilters();

        renderProducts();

        renderOrderOptions();

        renderAdminList();
    }


    /* =====================================================
       ESPACE GERANT
    ===================================================== */

    const adminPanel =
        document.getElementById(
            "adminPanel"
        );

    const adminToggleLink =
        document.getElementById(
            "adminToggleLink"
        );

    const closeAdminBtn =
        document.getElementById(
            "closeAdmin"
        );

    const productForm =
        document.getElementById(
            "productForm"
        );

    const adminList =
        document.getElementById(
            "adminList"
        );


    /* OUVRIR */

    adminToggleLink.addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            if (adminPanel.hidden) {

                const code =
                    prompt(
                        "Code d'accès de l'espace gérant :"
                    );


                if (code !== ADMIN_CODE) {

                    if (code !== null) {

                        alert(
                            "Code incorrect."
                        );
                    }

                    return;
                }


                adminPanel.hidden =
                    false;

                adminPanel.scrollIntoView({
                    behavior:
                        "smooth"
                });

            } else {

                adminPanel.hidden =
                    true;
            }
        }
    );


    /* FERMER */

    closeAdminBtn.addEventListener(
        "click",
        function () {

            adminPanel.hidden =
                true;

            document
                .getElementById(
                    "produits"
                )
                .scrollIntoView({
                    behavior:
                        "smooth"
                });
        }
    );


    /* =====================================================
       UPLOAD IMAGE
    ===================================================== */

    const pImageFile =
        document.getElementById(
            "pImageFile"
        );

    const imagePreviewRow =
        document.getElementById(
            "imagePreviewRow"
        );

    const imagePreview =
        document.getElementById(
            "imagePreview"
        );

    const removeImageBtn =
        document.getElementById(
            "removeImage"
        );


    let uploadedImageData =
        "";


    pImageFile.addEventListener(
        "change",
        function () {

            const file =
                pImageFile.files &&
                pImageFile.files[0];


            if (!file) {
                return;
            }


            if (!file.type.startsWith(
                "image/"
            )) {

                alert(
                    "Veuillez choisir une image."
                );

                pImageFile.value =
                    "";

                return;
            }


            const reader =
                new FileReader();


            reader.onload =
                function () {

                    uploadedImageData =
                        reader.result;

                    imagePreview.src =
                        uploadedImageData;

                    imagePreviewRow.hidden =
                        false;
                };


            reader.readAsDataURL(
                file
            );
        }
    );


    /* RETIRER IMAGE */

    removeImageBtn.addEventListener(
        "click",
        function () {

            uploadedImageData =
                "";

            pImageFile.value =
                "";

            imagePreviewRow.hidden =
                true;

            imagePreview.src =
                "";
        }
    );


    function resetImageUpload() {

        uploadedImageData =
            "";

        pImageFile.value =
            "";

        imagePreviewRow.hidden =
            true;

        imagePreview.src =
            "";
    }


    /* =====================================================
       AJOUT PRODUIT
    ===================================================== */

    productForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const newProduct = {

                id:
                    cryptoId(),

                name:
                    document
                        .getElementById(
                            "pName"
                        )
                        .value
                        .trim(),

                price:
                    Number(
                        document
                            .getElementById(
                                "pPrice"
                            )
                            .value
                    ),

                category:
                    document
                        .getElementById(
                            "pCategory"
                        )
                        .value,

                sizes:
                    document
                        .getElementById(
                            "pSizes"
                        )
                        .value
                        .trim(),

                image:
                    uploadedImageData ||
                    document
                        .getElementById(
                            "pImage"
                        )
                        .value
                        .trim(),

                desc:
                    document
                        .getElementById(
                            "pDesc"
                        )
                        .value
                        .trim()
            };


            if (
                !newProduct.name ||
                !newProduct.category
            ) {

                alert(
                    "Veuillez remplir les informations obligatoires."
                );

                return;
            }


            products.push(
                newProduct
            );


            refreshAll();


            productForm.reset();

            resetImageUpload();


            alert(
                "Produit ajouté avec succès !"
            );
        }
    );


    /* =====================================================
       LISTE ADMIN
    ===================================================== */

    function renderAdminList() {

        adminList.innerHTML =
            "";


        products.forEach(
            product => {

                const row =
                    document.createElement(
                        "div"
                    );

                row.className =
                    "admin-list-item";


                const info =
                    document.createElement(
                        "span"
                    );

                info.className =
                    "item-info";


                if (product.image) {

                    const image =
                        document.createElement(
                            "img"
                        );

                    image.src =
                        product.image;

                    image.alt =
                        "";

                    info.appendChild(
                        image
                    );
                }


                info.appendChild(
                    document.createTextNode(
                        `${product.name} — ${formatPrice(product.price)}`
                    )
                );


                const removeButton =
                    document.createElement(
                        "button"
                    );

                removeButton.textContent =
                    "Supprimer";


                removeButton.addEventListener(
                    "click",
                    function () {

                        const confirmation =
                            confirm(
                                `Supprimer "${product.name}" ?`
                            );


                        if (!confirmation) {
                            return;
                        }


                        products =
                            products.filter(
                                item =>
                                    item.id !==
                                    product.id
                            );


                        refreshAll();
                    }
                );


                row.appendChild(
                    info
                );

                row.appendChild(
                    removeButton
                );


                adminList.appendChild(
                    row
                );
            }
        );
    }


    /* =====================================================
       EXPORT PRODUCTS.JSON
    ===================================================== */

    const exportCatalogBtn =
        document.getElementById(
            "exportCatalog"
        );


    exportCatalogBtn.addEventListener(
        "click",
        function () {

            const blob =
                new Blob(
                    [
                        JSON.stringify(
                            products,
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
                "products.json";


            document.body.appendChild(
                link
            );

            link.click();

            document.body.removeChild(
                link
            );


            URL.revokeObjectURL(
                url
            );


            alert(
                "products.json a été téléchargé.\n\n" +
                "Remplacez l'ancien products.json " +
                "sur votre hébergement pour publier " +
                "le nouveau catalogue."
            );
        }
    );


    /* =====================================================
       COMMANDE
    ===================================================== */

    const orderForm =
        document.getElementById(
            "orderForm"
        );

    const orderConfirm =
        document.getElementById(
            "orderConfirm"
        );

    const whatsappBtn =
        document.getElementById(
            "whatsappBtn"
        );


    /* =====================================================
       MESSAGE WHATSAPP
    ===================================================== */

    function buildOrderMessage() {

        const name =
            document
                .getElementById(
                    "oName"
                )
                .value
                .trim();

        const phone =
            document
                .getElementById(
                    "oPhone"
                )
                .value
                .trim();

        const article =
            document
                .getElementById(
                    "oArticle"
                )
                .value;

        const size =
            document
                .getElementById(
                    "oSize"
                )
                .value
                .trim();

        const quantity =
            document
                .getElementById(
                    "oQty"
                )
                .value;

        const city =
            document
                .getElementById(
                    "oCity"
                )
                .value
                .trim();

        const address =
            document
                .getElementById(
                    "oAddress"
                )
                .value
                .trim();

        const message =
            document
                .getElementById(
                    "oMessage"
                )
                .value
                .trim();


        return (

            "Bonjour XN-KODASSY, " +
            "je souhaite commander :\n\n" +

            `- Produit : ${article || "—"}\n` +

            `- Taille : ${size || "—"}\n` +

            `- Quantité : ${quantity}\n` +

            `- Nom : ${name}\n` +

            `- Téléphone : ${phone}\n` +

            `- Ville : ${city}\n` +

            `- Adresse : ${address || "—"}\n` +

            (
                message
                    ? `- Message : ${message}\n`
                    : ""
            )
        );
    }


    /* =====================================================
       WHATSAPP
    ===================================================== */

    function updateWhatsappLink() {

        const text =
            encodeURIComponent(
                buildOrderMessage()
            );


        whatsappBtn.href =
            `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
    }


    orderForm.addEventListener(
        "input",
        updateWhatsappLink
    );


    /* =====================================================
       FORMULAIRE COMMANDE
    ===================================================== */

    orderForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            if (
                !orderForm.checkValidity()
            ) {

                orderForm.reportValidity();

                return;
            }


            updateWhatsappLink();


            orderConfirm.hidden =
                false;


            orderForm.reset();


            setTimeout(
                function () {

                    orderConfirm.hidden =
                        true;

                },
                6000
            );
        }
    );


    /* =====================================================
       MENU MOBILE
    ===================================================== */

    const burgerBtn =
        document.getElementById(
            "burgerBtn"
        );

    const mainNav =
        document.getElementById(
            "mainNav"
        );


    burgerBtn.addEventListener(
        "click",
        function () {

            const isOpen =
                mainNav.classList.toggle(
                    "is-open"
                );


            burgerBtn.setAttribute(
                "aria-expanded",
                String(isOpen)
            );
        }
    );


    mainNav
        .querySelectorAll("a")
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    function () {

                        mainNav.classList.remove(
                            "is-open"
                        );

                        burgerBtn.setAttribute(
                            "aria-expanded",
                            "false"
                        );
                    }
                );
            }
        );


    /* =====================================================
       INITIALISATION
    ===================================================== */

    document.getElementById(
        "year"
    ).textContent =
        new Date().getFullYear();


    refreshAll();

    updateWhatsappLink();


})();