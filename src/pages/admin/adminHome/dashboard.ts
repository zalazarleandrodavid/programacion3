import { checkAuth } from '../../../utils/authGuards.ts';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificación de seguridad
    checkAuth();

    // 2. Configurar botón de cerrar sesión
    setupLogout();

    // 3. Cargar datos y actualizar UI
    await cargarDashboard();
});

function setupLogout() {
    const btnLogout = document.querySelector('.admin-nav-logout-btn') as HTMLButtonElement;
    
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault(); // Prevenir comportamiento por defecto si fuera necesario
            
            // Limpiar sesión
            localStorage.clear();
            sessionStorage.clear();
            
            // Redirigir al login (ajusta la ruta si tu login está en otra carpeta)
            window.location.href = '/login.html'; 
        });
    }
}

async function cargarDashboard() {
    try {
        // Fetch de los datos en paralelo para mayor velocidad
        const [respProd, respCat, respPed] = await Promise.all([
            fetch('../../../data/products.json'),
            fetch('../../../data/categorias.json'),
            fetch('../../../data/pedidos.json')
        ]);

        const productos = await respProd.json();
        const categorias = await respCat.json();
        const pedidos = await respPed.json();

        // --- Cálculos ---
        const totalProd = productos.length;
        const totalCat = categorias.length;
        const totalPed = pedidos.length;
        
        // Productos disponibles
        const disponibles = productos.filter((p: any) => p.estado === 'disponible').length;
        
        // Cálculos de pedidos
        const totalIngresos = pedidos.reduce((acc: number, p: any) => acc + (p.total || 0), 0);
        const pendientes = pedidos.filter((p: any) => p.estado === 'pending').length;
        const preparacion = pedidos.filter((p: any) => p.estado === 'processing').length;
        const completados = pedidos.filter((p: any) => p.estado === 'completed').length;

        // --- Actualizar DOM ---
        const update = (id: string, val: string | number) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val.toString();
        };

        // Tarjetas superiores
        update('stat-categorias', totalCat);
        update('stat-productos', totalProd);
        update('stat-pedidos', totalPed);
        update('stat-disponibles', disponibles);

        // Resumen rápido
        update('res-ingresos', `$${totalIngresos.toLocaleString()}`);
        update('res-pendientes', pendientes);
        update('res-preparacion', preparacion);
        update('res-completados', completados);

        // Resumen detallado (Grid dinámico)
        const detailedPanel = document.getElementById('resumen-detallado');
        if (detailedPanel) {
            const activos = disponibles;
            const inactivos = totalProd - activos;

            // Agrupar pedidos por estado para mostrar en el resumen
            const pedidosPorEstado = pedidos.reduce((acc: any, pedido: any) => {
                acc[pedido.estado] = (acc[pedido.estado] || 0) + 1;
                return acc;
            }, {});

            detailedPanel.innerHTML = `
                <div class="summary-box">
                    <h4>Productos</h4>
                    <p>✅ Activos: ${activos}</p>
                    <p>❌ Inactivos: ${inactivos}</p>
                </div>
                <div class="summary-box">
                    <h4>Pedidos por Estado</h4>
                    ${Object.entries(pedidosPorEstado).map(([estado, count]) => `
                        <p>• ${estado.charAt(0).toUpperCase() + estado.slice(1)}: <strong>${count}</strong></p>
                    `).join('')}
                </div>
            `;
        }

    } catch (error) {
        console.error("Error al cargar los datos del dashboard:", error);
    }
}