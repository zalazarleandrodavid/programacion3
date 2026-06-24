// vite.config.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'src/pages/auth/login.html'),
        home: resolve(__dirname, 'src/pages/store/home/home.html'),
        cart: resolve(__dirname, 'src/pages/store/cart/cart.html'),
        details: resolve(__dirname, 'src/pages/store/producto_details/details.html'),
        
        // Rutas diferenciadas para evitar duplicados
        clientOrders: resolve(__dirname, 'src/pages/store/client/orders/orders.html'),
        adminOrders: resolve(__dirname, 'src/pages/admin/orders/orders.html'),
        
        // Páginas de administración
        adminHome: resolve(__dirname, 'src/pages/admin/adminHome/adminHome.html'),
        categories: resolve(__dirname, 'src/pages/admin/categories/categories.html'),
        products: resolve(__dirname, 'src/pages/admin/product/product.html'),
      },
    },
  },
});