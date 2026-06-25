import { logout, protectRoute } from "../../../../utils/auth";

protectRoute();

// ======================================
// CONFIGURACIÓN DE ESTADOS (Actualizada con tus datos)
// ======================================
const STATUS_MAP: any = {
    pending: { label: "PENDIENTE", class: "badge-pending", msg: "⏳ Tu pedido está pendiente." },
    confirmed: { label: "CONFIRMADO", class: "badge-confirmed", msg: "🍳 Tu pedido está siendo preparado." },
    processing: { label: "PROCESANDO", class: "badge-confirmed", msg: "🍳 Tu pedido está en preparación." },
    finished: { label: "TERMINADO", class: "badge-finished", msg: "✅ Tu pedido fue entregado." },
    completed: { label: "COMPLETADO", class: "badge-finished", msg: "✅ Tu pedido fue entregado correctamente." },
    cancelled: { label: "CANCELADO", class: "badge-cancelled", msg: "❌ El pedido fue cancelado." }
};

// ======================================
// REFERENCIAS DOM
// ======================================
const ordersList = document.getElementById("orders-list") as HTMLElement;
const modal = document.getElementById("order-modal") as HTMLElement;
const modalBody = document.getElementById("modal-body") as HTMLElement;
const closeModal = document.getElementById("close-modal") as HTMLButtonElement;
const logoutBtn = document.getElementById("logout-btn") as HTMLButtonElement;

// ======================================
// LÓGICA DE DATOS
// ======================================
const fetchAndRenderOrders = async () => {
    try {
        const userDataStr = localStorage.getItem("userData");
        const session = userDataStr ? JSON.parse(userDataStr) : null;

        if (!session || !session.id) {
            console.error("No hay usuario logueado");
            return;
        }

        // Petición al archivo JSON
        const response = await fetch('/data/pedidos.json');
        if (!response.ok) throw new Error("Error al cargar pedidos");
        
        const allOrders: any[] = await response.json();
        
        // Filtramos por usuario
        const userOrders = allOrders.filter(p => p.usuarioId === session.id);

        if (userOrders.length === 0) {
            ordersList.innerHTML = `<div class="empty-orders"><h3>No tienes pedidos</h3></div>`;
            return;
        }

        renderOrderList(userOrders);

    } catch (error) {
        console.error(error);
        ordersList.innerHTML = `<p style="text-align:center;">Error al cargar tus pedidos.</p>`;
    }
};

const renderOrderList = (orders: any[]) => {
    ordersList.innerHTML = "";
    
    orders.forEach(pedido => {
        // Obtenemos el status de forma segura
        const status = STATUS_MAP[pedido.estado] || { label: pedido.estado, class: "badge-default", msg: "" };
        
        const card = document.createElement("div");
        card.className = "order-card";
        
        // Obtenemos nombres de productos de forma segura
        const summary = pedido.detalles?.map((d: any) => d.producto?.nombre).join(", ") || "Sin productos";

        card.innerHTML = `
            <h3>Pedido #${pedido.id}</h3>
            <p>📅 ${pedido.fecha}</p>
            <span class="status-badge ${status.class}">${status.label}</span>
            <p>${summary}</p>
            <h4>$${pedido.total?.toLocaleString("es-AR") || "0"}</h4>
        `;
        
        card.addEventListener("click", () => openModal(pedido));
        ordersList.appendChild(card);
    });
};

// ======================================
// MODAL
// ======================================
const openModal = (pedido: any) => {
    const status = STATUS_MAP[pedido.estado] || { label: pedido.estado, class: "badge-default", msg: "" };
    
    modalBody.innerHTML = `
        <div class="modal-header-order">
            <h2>Pedido #${pedido.id}</h2>
            <span class="status-badge ${status.class}">${status.label}</span>
        </div>
        <div class="delivery-info">
            <p><strong>Dirección:</strong> ${pedido.direccion}</p>
            <p><strong>Forma de pago:</strong> ${pedido.formaPago}</p>
        </div>
        <div class="modal-products">
            ${pedido.detalles?.map((item: any) => `
                <div class="modal-product" style="display:flex; justify-content:space-between; margin-bottom:10px;">
                    <span>${item.cantidad}x ${item.producto?.nombre || "Producto"}</span>
                    <span>$${item.subtotal.toLocaleString("es-AR")}</span>
                </div>
            `).join("") || ""}
        </div>
        <div class="order-summary" style="border-top: 1px solid #ccc; padding-top: 10px;">
            <p><strong>Costo envío:</strong> $${pedido.costoEnvio.toLocaleString("es-AR")}</p>
            <h3>Total: $${pedido.total.toLocaleString("es-AR")}</h3>
        </div>
        <p style="margin-top:15px; font-style:italic;">${status.msg}</p>
    `;
    modal.classList.remove("hidden");
};

// ======================================
// EVENTOS
// ======================================
logoutBtn?.addEventListener("click", logout);
closeModal?.addEventListener("click", () => modal.classList.add("hidden"));
window.addEventListener("click", (e) => { if (e.target === modal) modal.classList.add("hidden"); });

// Inicializar
fetchAndRenderOrders();