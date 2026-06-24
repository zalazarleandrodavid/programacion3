import { checkAuth } from '../../../utils/authGuards.ts';
import pedidos from '../../../data/pedidos.json';

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();

    const container = document.getElementById('orders-container') as HTMLElement;
    const filter = document.getElementById('filter-status') as HTMLSelectElement;

    const render = (estadoFiltro: string) => {
        container.innerHTML = '';

        // 1. Filtrar usando 'p.estado' y comparando con los valores del JSON
        let mostrar = estadoFiltro === 'todos'
            ? pedidos
            : pedidos.filter((p: any) => p.estado === estadoFiltro);

        // 2. Ordenar por fecha
        mostrar.sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

        // 3. Renderizar
        mostrar.forEach((p: any) => {
            const card = document.createElement('div');
            card.className = 'order-card';

            // Usamos 'p.detalles' en lugar de 'p.productos'
            const cantidadProductos = p.detalles ? p.detalles.length : 0;

            card.innerHTML = `
                <div class="order-header">
                    <h3>Pedido #${p.id}</h3>
                    <span class="badge ${p.estado}">${p.estado}</span>
                </div>
                <p><strong>Cliente:</strong> ID ${p.usuarioId}</p>
                <p><small>${p.fecha}</small></p>
                <div style="display:flex; justify-content:space-between; margin-top:10px;">
                    <span>${cantidadProductos} tipo(s) de producto</span>
                    <strong>$${p.total.toFixed(2)}</strong>
                </div>
            `;
            container.appendChild(card);
        });
    };
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
    setupLogout();
    filter.addEventListener('change', () => render(filter.value));
    render('todos');
});

