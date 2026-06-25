import { checkAuth } from '../../../utils/authGuards.ts';

// Estado global de la vista en memoria
let datosPedidos: any[] = [];
let datosUsuarios: any[] = [];

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Validar sesión del administrador
    checkAuth();
    
    // 2. Configurar el botón de salida
    setupLogout();
    
    // 3. Cargar las fuentes de datos asíncronas
    await inicializarEcosistemaPedidos();
});

// =====================================
// FLUJO DE DATOS (FETCH ASÍNCRONO)
// =====================================
async function inicializarEcosistemaPedidos() {
    try {
        const [resPedidos, resUsuarios] = await Promise.all([
            fetch('/data/pedidos.json'),
            fetch('/data/users.json')
        ]);

        if (!resPedidos.ok || !resUsuarios.ok) {
            throw new Error("No se pudo obtener la información de pedidos o usuarios.");
        }

        datosPedidos = await resPedidos.json();
        datosUsuarios = await resUsuarios.json();

        configurarFiltros();

    } catch (error) {
        console.error("Fallo crítico al inicializar la gestión de pedidos:", error);
        const container = document.getElementById('orders-container');
        if (container) {
            container.innerHTML = `
                <p style="color: #ff6b6b; text-align: center; font-weight: bold; padding: 20px;">
                    ⚠️ Error al sincronizar el panel de control. Verifica los archivos JSON en public/data/.
                </p>
            `;
        }
    }
}

function configurarFiltros() {
    const selectorFiltro = document.getElementById('filter-status') as HTMLSelectElement;
    if (selectorFiltro) {
        selectorFiltro.addEventListener('change', () => dibujarGrillaPedidos(selectorFiltro.value));
    }
    
    dibujarGrillaPedidos('todos');
}

// =====================================
// RENDERIZADO DE LAS TARJETAS (GRID)
// =====================================
function dibujarGrillaPedidos(filtro: string) {
    const container = document.getElementById('orders-container') as HTMLElement;
    if (!container) return;
    
    container.innerHTML = ''; 

    // 1. Filtrado del lado del cliente
    let filtrados = filtro === 'todos' 
        ? datosPedidos 
        : datosPedidos.filter(p => p.estado === filtro);

    // 2. Ordenamiento: Más recientes primero
    filtrados.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    if (filtrados.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #747d8c; padding: 40px;">No hay pedidos registrados en este estado.</p>`;
        return;
    }

    // 3. Renderizar cada tarjeta
    filtrados.forEach((pedido: any) => {
        const usuario = datosUsuarios.find(u => u.id === pedido.usuarioId);
        const clienteNombre = usuario ? `${usuario.nombre} ${usuario.apellido || ''}`.trim() : `Usuario #${pedido.usuarioId}`;
        const totalItems = pedido.detalles ? pedido.detalles.reduce((acc: number, item: any) => acc + item.cantidad, 0) : 0;
        const totalPedido = Number(pedido.total) || 0;

        const card = document.createElement('div');
        card.className = 'order-card';
        card.style.cursor = 'pointer'; 
        
        card.innerHTML = `
            <div class="order-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h3 style="margin: 0; font-size: 1.1rem;">Pedido #ORD-${pedido.id}</h3>
                <span class="status-badge ${pedido.estado}">${pedido.estado.toUpperCase()}</span>
            </div>
            <p style="margin: 6px 0;"><strong>Cliente:</strong> ${clienteNombre}</p>
            <p style="margin: 4px 0; color: #747d8c; font-size: 0.85rem;">
                📅 ${new Date(pedido.fecha).toLocaleDateString('es-AR')} - ${new Date(pedido.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <div style="display: flex; justify-content: space-between; margin-top: 15px; border-top: 1px dashed #eee; padding-top: 10px; align-items: center;">
                <span style="color: #57606f; font-size: 0.9rem;">📦 ${totalItems} unidad(es)</span>
                <strong style="font-size: 1.1rem; color: #2f3542;">$${totalPedido.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</strong>
            </div>
        `;

        card.addEventListener('click', () => abrirModalDetalle(pedido, clienteNombre, usuario));
        container.appendChild(card);
    });
}

// =====================================
// CONTROLADOR DEL MODAL DETALLE (CORREGIDO)
// =====================================
function abrirModalDetalle(pedido: any, nombreCliente: string, usuarioCompleto: any) {
    const modal = document.getElementById('order-detail-modal') as HTMLDivElement;
    if (!modal) return;
    
    // 1. Mapear metadatos del cliente (Corregido mapeo directo desde pedido)
    document.getElementById('modal-order-title')!.textContent = `Detalle del Pedido #ORD-${pedido.id}`;
    document.getElementById('modal-cliente-nombre')!.textContent = nombreCliente;
    document.getElementById('modal-pedido-fecha')!.textContent = new Date(pedido.fecha).toLocaleString('es-AR');
    document.getElementById('modal-cliente-telefono')!.textContent = usuarioCompleto?.telefono || 'N/A';
    document.getElementById('modal-cliente-direccion')!.textContent = pedido.direccion || 'Sin dirección';
    document.getElementById('modal-pedido-pago')!.textContent = pedido.formaPago || 'Efectivo';

    // 2. Inyectar productos leyendo correctamente el objeto anidado 'producto'
    const productsContainer = document.getElementById('modal-products-container')!;
    productsContainer.innerHTML = '';

    if (pedido.detalles && pedido.detalles.length > 0) {
        pedido.detalles.forEach((item: any) => {
            // Acceso seguro al objeto interno 'producto' del JSON
            const infoProducto = item.producto || {};
            const precioItem = Number(infoProducto.precio) || 0;
            const cantidadItem = Number(item.cantidad) || 0;
            const nombreItem = infoProducto.nombre || 'Producto Alimenticio';

            const itemCard = document.createElement('div');
            itemCard.className = 'product-item-card';
            itemCard.innerHTML = `
                <div>
                    <h4>${nombreItem}</h4>
                    <p>Cantidad: ${cantidadItem} × $${precioItem.toFixed(2)}</p>
                </div>
                <div class="product-price-highlight">
                    $${(cantidadItem * precioItem).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </div>
            `;
            productsContainer.appendChild(itemCard);
        });
    }

    // 3. Desglose de totales financieros (Mapeado con 'costoEnvio')
    const totalPedido = Number(pedido.total) || 0;
    const costoEnvio = pedido.costoEnvio !== undefined ? Number(pedido.costoEnvio) : 0; 
    const subtotalCalculado = totalPedido - costoEnvio;

    document.getElementById('modal-summary-subtotal')!.textContent = `$${subtotalCalculado.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
    document.getElementById('modal-summary-envio')!.textContent = `$${costoEnvio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
    document.getElementById('modal-summary-total')!.textContent = `$${totalPedido.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;

    // 4. Mostrar modal y configurar eventos de cierre
    modal.style.display = 'block';
    vincularCierresModal(modal);
}

// =====================================
// ESCUCHAS DE CIERRE DEL MODAL
// =====================================
function vincularCierresModal(modal: HTMLDivElement) {
    const btnClose = document.getElementById('close-modal-btn');

    if (btnClose) {
        btnClose.onclick = () => { modal.style.display = 'none'; };
    }

    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    };
}

// =====================================
// CIERRE DE SESIÓN
// =====================================
function setupLogout() {
    const btnLogout = document.querySelector('.admin-nav-logout-btn') as HTMLButtonElement;
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/login.html';
        });
    }
}