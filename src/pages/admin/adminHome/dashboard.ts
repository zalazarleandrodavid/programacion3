import { checkAuth } from '../../../utils/authGuards.ts';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificación de seguridad
    checkAuth();

    // 2. Configurar botón de cerrar sesión de forma segura
    setupLogout();

    // 3. Cargar datos desde public/data y actualizar la interfaz
    await cargarDashboard();
});

function setupLogout() {
    const btnLogout = document.querySelector('.admin-nav-logout-btn') as HTMLButtonElement;
    
    if (btnLogout) {
        // Removemos el comportamiento inline del HTML para manejarlo limpiamente por código
        btnLogout.removeAttribute('onclick');
        
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Limpieza absoluta de estados de sesión
            localStorage.clear();
            sessionStorage.clear();
            
            // Redirección al login
            window.location.href = '/login.html'; 
        });
    }
}

async function cargarDashboard() {
    try {
        // Consumo asíncrono desde la carpeta public/data de tu proyecto
        const [respProd, respCat, respPed] = await Promise.all([
            fetch('/data/products.json'),
            fetch('/data/categorias.json'),
            fetch('/data/pedidos.json')
        ]);

        if (!respProd.ok || !respCat.ok || !respPed.ok) {
            throw new Error("No se pudo cargar uno o más archivos JSON de la carpeta public/data");
        }

        const productos = await respProd.json();
        const categorias = await respCat.json();
        const pedidos = await respPed.json();

        // =====================================
        // CÁLCULOS - ESTADÍSTICAS GENERALES
        // =====================================
        const totalProd = productos.length;
        const totalCat = categorias.length;
        const totalPed = pedidos.length;
        
        // Filtrado de productos disponibles
        const disponibles = productos.filter((p: any) => p.estado === 'disponible').length;
        
        // =====================================
        // CÁLCULOS - RESUMEN RÁPIDO
        // =====================================
        const totalIngresos = pedidos.reduce((acc: number, p: any) => acc + (p.total || 0), 0);
        const pendientes = pedidos.filter((p: any) => p.estado === 'pending').length;
        const preparacion = pedidos.filter((p: any) => p.estado === 'processing').length;
        const completados = pedidos.filter((p: any) => p.estado === 'completed').length;

        // =====================================
        // ACTUALIZACIÓN DEL DOM
        // =====================================
        const update = (id: string, val: string | number) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val.toString();
        };

        // 1. Tarjetas Superiores Grid
        update('stat-categorias', totalCat);
        update('stat-productos', totalProd);
        update('stat-pedidos', totalPed);
        update('stat-disponibles', disponibles);

        // 2. Bloques de Resumen Rápido
        update('res-ingresos', `$${totalIngresos.toLocaleString('es-AR')}`);
        update('res-pendientes', pendientes);
        update('res-preparacion', preparacion);
        update('res-completados', completados);

        // 3. Inyección en Panel Detallado (Estructura Dinámica)
        const detailedPanel = document.getElementById('resumen-detallado');
        if (detailedPanel) {
            const activosProd = disponibles;
            const inactivosProd = totalProd - activosProd;

            // Calculamos categorías activas dinámicamente si tienen propiedad de estado
            const categoriasActivas = categorias.filter((c: any) => c.estado === 'activo' || c.estado !== 'inactivo').length;
            const categoriasInactivas = totalCat - categoriasActivas;

            // Agrupar pedidos por su estado interno para el mapeo
            const pedidosPorEstado = pedidos.reduce((acc: any, pedido: any) => {
                acc[pedido.estado] = (acc[pedido.estado] || 0) + 1;
                return acc;
            }, {});

            detailedPanel.innerHTML = `
                <div class="card" style="background: white; color: #333; padding: 20px; box-shadow: none; border: 1px solid #eee;">
                    <h4 style="margin-top:0; color: #2f3542; border-bottom: 1px solid #eee; padding-bottom: 8px;">📁 Control de Categorías</h4>
                    <p style="margin: 8px 0;">🟢 Categorías Activas: <strong>${categoriasActivas}</strong></p>
                    <p style="margin: 8px 0;">🔴 Categorías Inactivas: <strong>${categoriasInactivas}</strong></p>
                </div>

                <div class="card" style="background: white; color: #333; padding: 20px; box-shadow: none; border: 1px solid #eee;">
                    <h4 style="margin-top:0; color: #2f3542; border-bottom: 1px solid #eee; padding-bottom: 8px;">🍔 Control de Stock</h4>
                    <p style="margin: 8px 0;">✅ Productos Activos: <strong>${activosProd}</strong></p>
                    <p style="margin: 8px 0;">❌ Productos Inactivos: <strong>${inactivosProd}</strong></p>
                </div>
                
                <div class="card" style="background: white; color: #333; padding: 20px; box-shadow: none; border: 1px solid #eee;">
                    <h4 style="margin-top:0; color: #2f3542; border-bottom: 1px solid #eee; padding-bottom: 8px;">📦 Flujo de Pedidos</h4>
                    ${Object.entries(pedidosPorEstado).map(([estado, count]) => {
                        // Traducir los slugs técnicos de los estados del backend a español legible
                        let nombreLegible = estado;
                        if (estado === 'pending') nombreLegible = 'Pendientes';
                        if (estado === 'processing') nombreLegible = 'En Preparación';
                        if (estado === 'completed') nombreLegible = 'Completados';
                        
                        return `<p style="margin: 8px 0;">• ${nombreLegible}: <strong>${count}</strong></p>`;
                    }).join('')}
                </div>
            `;
        }

    } catch (error) {
        console.error("Error al renderizar el ecosistema del dashboard:", error);
        const detailedPanel = document.getElementById('resumen-detallado');
        if (detailedPanel) {
            detailedPanel.innerHTML = `<p style="color: red; font-weight: bold;">⚠️ Error crítico al intentar leer las fuentes de datos JSON.</p>`;
        }
    }
}