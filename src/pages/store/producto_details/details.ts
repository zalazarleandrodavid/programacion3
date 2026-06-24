import products from "../../../data/products.json";
import { logout, protectRoute } from "../../../utils/auth";

protectRoute();

// =====================================
// PRODUCTO SELECCIONADO
// =====================================

const productId = Number(
    localStorage.getItem("selectedProductId")
);

const product = products.find(
    p => p.id === productId
);

if (!product) {

    alert("Producto no encontrado");

    window.location.href =
        "../home/home.html";

    throw new Error(
        "Producto no encontrado"
    );
}

// =====================================
// ELEMENTOS HTML
// =====================================

const productImage =
    document.getElementById(
        "product-image"
    ) as HTMLImageElement;

const productName =
    document.getElementById(
        "product-name"
    ) as HTMLElement;

const productDescription =
    document.getElementById(
        "product-description"
    ) as HTMLElement;

const productPrice =
    document.getElementById(
        "product-price"
    ) as HTMLElement;

const productStock =
    document.getElementById(
        "product-stock"
    ) as HTMLElement;

const productStatus =
    document.getElementById(
        "product-status"
    ) as HTMLElement;

const quantityInput =
    document.getElementById(
        "quantity"
    ) as HTMLInputElement;

const btnAddCart =
    document.getElementById(
        "btn-add-cart"
    ) as HTMLButtonElement;

const message =
    document.getElementById(
        "message"
    ) as HTMLParagraphElement;

const btnLogout =
    document.getElementById(
        "logout-btn"
    ) as HTMLButtonElement | null;

btnLogout?.addEventListener(
    "click",
    logout
);
// =====================================
// MOSTRAR PRODUCTO
// =====================================

productImage.src =
    product.imagen;

productImage.alt =
    product.nombre;

productName.textContent =
    product.nombre;

productDescription.textContent =
    product.descripcion;

productPrice.textContent =
    `$${product.precio.toLocaleString(
        "es-AR"
    )}`;

productStock.textContent =
    String(product.stock);

productStatus.textContent =
    product.estado;

// =====================================
// ACTUALIZAR BADGE
// =====================================

const updateCartBadge = () => {

    const cart = JSON.parse(
        localStorage.getItem("cart") || "[]"
    );

    const cartCount =
        document.getElementById(
            "cart-count"
        );

    if (!cartCount) return;

    const totalItems = cart.reduce(
        (
            total: number,
            item: any
        ) =>
            total + item.cantidad,
        0
    );

    cartCount.textContent =
        totalItems.toString();

    (
        cartCount as HTMLElement
    ).style.display =
        totalItems > 0
            ? "inline-flex"
            : "none";
};

updateCartBadge();

// =====================================
// VALIDAR DISPONIBILIDAD
// =====================================

if (
    product.estado !==
        "disponible" ||
    product.stock <= 0
) {

    btnAddCart.disabled = true;

    btnAddCart.textContent =
        "Sin Stock";

    quantityInput.disabled =
        true;
}
btnLogout?.addEventListener(
    "click",
    logout
);
// =====================================
// AGREGAR AL CARRITO
// =====================================

btnAddCart.addEventListener(
    "click",
    () => {

        const quantity = Number(
            quantityInput.value
        );

        if (quantity <= 0) {

            message.textContent =
                "La cantidad debe ser mayor a 0";

            return;
        }

        if (
            quantity >
            product.stock
        ) {

            message.textContent =
                `Solo hay ${product.stock} unidades disponibles`;

            return;
        }

        const cart =
            JSON.parse(
                localStorage.getItem(
                    "cart"
                ) || "[]"
            );

        const existingProduct =
            cart.find(
                (
                    item: any
                ) =>
                    item.id ===
                    product.id
            );

        if (
            existingProduct
        ) {

            const total =
                existingProduct.cantidad +
                quantity;

            if (
                total >
                product.stock
            ) {

                message.textContent =
                    `No puedes superar el stock (${product.stock})`;

                return;
            }

            existingProduct.cantidad +=
                quantity;

        } else {

            cart.push({
                ...product,
                cantidad:
                    quantity
            });
        }

        localStorage.setItem(
            "cart",
            JSON.stringify(
                cart
            )
        );

        updateCartBadge();

        message.textContent =
            "✅ Producto agregado al carrito";

        quantityInput.value =
            "1";

        console.log(
            "Carrito:",
            cart
        );
    }
    
);

