
import pedidos from "../../../../data/pedidos.json";

import {
    logout,
    protectRoute
} from "../../../../utils/auth";

protectRoute();

const ordersList =
    document.getElementById(
        "orders-list"
    ) as HTMLElement;

const modal =
    document.getElementById(
        "order-modal"
    ) as HTMLElement;

const modalBody =
    document.getElementById(
        "modal-body"
    ) as HTMLElement;

const closeModal =
    document.getElementById(
        "close-modal"
    ) as HTMLButtonElement;

const logoutBtn =
    document.getElementById(
        "logout-btn"
    ) as HTMLButtonElement;

logoutBtn?.addEventListener(
    "click",
    logout
);

// ======================================
// USUARIO LOGUEADO
// ======================================

const session = JSON.parse(
    localStorage.getItem(
        "userData"
    ) || "{}"
);

// ======================================
// CONTADOR CARRITO
// ======================================

const updateCartBadge = () => {

    const cart = JSON.parse(
        localStorage.getItem(
            "cart"
        ) || "[]"
    );

    const badge =
        document.getElementById(
            "cart-count"
        );

    if (!badge) return;

    const totalItems =
        cart.reduce(
            (
                acc: number,
                item: any
            ) =>
                acc +
                item.cantidad,
            0
        );

    badge.textContent =
        totalItems.toString();

    (
        badge as HTMLElement
    ).style.display =
        totalItems > 0
            ? "flex"
            : "none";
};

updateCartBadge();

// ======================================
// FILTRAR PEDIDOS
// ======================================

const userOrders =
    pedidos.filter(
        (pedido: any) =>
            pedido.usuarioId ===
            session.id
    );

// ======================================
// BADGES
// ======================================

const getBadgeText = (
    estado: string
) => {

    switch (estado) {

        case "pending":
            return "⏳ Pendiente";

        case "processing":
            return "🍳 En Preparación";

        case "completed":
            return "✅ Entregado";

        case "cancelled":
            return "❌ Cancelado";

        default:
            return estado;
    }
};

// ======================================
// RENDER PEDIDOS
// ======================================

const renderOrders = () => {

    if (
        userOrders.length === 0
    ) {

        ordersList.innerHTML = `
        
        <div class="empty-orders">

            <h3>
                No tienes pedidos
            </h3>

            <p>
                Aún no realizaste compras.
            </p>

            <a
                href="../../store/home/home.html"
                class="btn-primary-action"
            >
                Ir al catálogo
            </a>

        </div>
        `;

        return;
    }

    ordersList.innerHTML = "";

    userOrders.forEach(
        (pedido: any) => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "order-card";

            const productsSummary =
                pedido.detalles
                    .slice(0, 3)
                    .map(
                        (
                            item: any
                        ) =>
                            item.producto.nombre
                    )
                    .join(
                        ", "
                    );

            const extraProducts =
                pedido.detalles.length > 3
                    ? ` +${pedido.detalles.length - 3} productos`
                    : "";

            card.innerHTML = `

            <h3>
                Pedido #${pedido.id}
            </h3>

            <p>
                📅 ${pedido.fecha}
            </p>

            <span
                class="status-badge ${pedido.estado}"
            >
                ${getBadgeText(
                    pedido.estado
                )}
            </span>

            <p>
                ${productsSummary}
                ${extraProducts}
            </p>

            <h4>
                $${pedido.total.toLocaleString(
                    "es-AR"
                )}
            </h4>
            `;

            card.addEventListener(
                "click",
                () =>
                    openModal(
                        pedido
                    )
            );

            ordersList.appendChild(
                card
            );
        }
    );
};

// ======================================
// MODAL
// ======================================

const openModal = (
    pedido: any
) => {

    const subtotal =
        pedido.detalles.reduce(
            (
                acc: number,
                item: any
            ) =>
                acc +
                item.subtotal,
            0
        );

    let message = "";

    switch (pedido.estado) {

        case "pending":
            message =
                "⏳ Tu pedido fue recibido y está pendiente de confirmación.";
            break;

        case "processing":
            message =
                "🍳 Tu pedido está siendo preparado.";
            break;

        case "completed":
            message =
                "✅ Tu pedido fue entregado correctamente.";
            break;

        case "cancelled":
            message =
                "❌ El pedido fue cancelado.";
            break;
    }

    modalBody.innerHTML = `

    <div class="modal-header-order">

        <h2>
            Pedido #${pedido.id}
        </h2>

        <span
            class="status-badge ${pedido.estado}"
        >
            ${getBadgeText(
                pedido.estado
            )}
        </span>

        <p class="modal-date">
            ${pedido.fecha}
        </p>

    </div>

    <div class="delivery-info">

        <h4>
            📍 Información de entrega
        </h4>

        <p>
            <strong>
                Dirección:
            </strong>

            ${pedido.direccion}
        </p>

        <p>
            <strong>
                Método de pago:
            </strong>

            ${pedido.formaPago}
        </p>

    </div>

    <div class="modal-products">

        <h4>
            📦 Productos
        </h4>

        ${pedido.detalles
            .map(
                (
                    item: any
                ) => `

                <div class="modal-product">

                    <img
                        src="${item.producto.imagen}"
                        alt="${item.producto.nombre}"
                    >

                    <div class="modal-product-info">

                        <strong>
                            ${item.producto.nombre}
                        </strong>

                        <p>
                            Cantidad:
                            ${item.cantidad}
                        </p>

                        <p>
                            $${item.producto.precio.toLocaleString("es-AR")}
                        </p>

                    </div>

                    <div class="modal-product-price">

                        $${item.subtotal.toLocaleString("es-AR")}

                    </div>

                </div>
            `
            )
            .join("")}

    </div>

    <div class="order-summary">

        <div class="summary-row">
            <span>Subtotal</span>
            <span>
                $${subtotal.toLocaleString("es-AR")}
            </span>
        </div>

        <div class="summary-row">
            <span>Envío</span>
            <span>
                $${pedido.costoEnvio.toLocaleString("es-AR")}
            </span>
        </div>

        <div class="summary-total">
            <span>Total</span>
            <span>
                $${pedido.total.toLocaleString("es-AR")}
            </span>
        </div>

    </div>

    <div
        class="order-message message-${pedido.estado}"
    >
        ${message}
    </div>
    `;

    modal.classList.remove(
        "hidden"
    );
};

// ======================================
// CERRAR MODAL
// ======================================

closeModal.addEventListener(
    "click",
    () =>
        modal.classList.add(
            "hidden"
        )
);

window.addEventListener(
    "click",
    (e) => {

        if (
            e.target === modal
        ) {

            modal.classList.add(
                "hidden"
            );
        }
    }
);

// ======================================
// INIT
// ======================================

renderOrders();