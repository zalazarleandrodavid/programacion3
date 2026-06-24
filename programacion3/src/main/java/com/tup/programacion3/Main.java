package com.tup.programacion3;

import com.tup.programacion3.enums.Estado;
import com.tup.programacion3.enums.FormaPago;
import com.tup.programacion3.enums.Rol;
import com.tup.programacion3.model.*;
import com.tup.programacion3.repositories.*;
import com.tup.programacion3.utils.JPAUtil;
import jakarta.persistence.EntityManager;
import java.time.LocalDate;
import java.util.*;

public class Main {

    private static final Scanner sc = new Scanner(System.in);
    private static final CategoriaRepository catRepo = new CategoriaRepository();
    private static final ProductoRepository prodRepo = new ProductoRepository();
    private static final UsuarioRepository userRepo = new UsuarioRepository();
    private static final PedidoRepository pedidoRepo = new PedidoRepository();

    public static void main(String[] args) {
        cargaInicial();
        int opcion = -1;

        while (opcion != 0) {
            System.out.println("\n");
            System.out.println("       // \"\"--.._");
            System.out.println("      ||  (_)  _ \"-._");
            System.out.println("      ||    _ (_)    '-.");
            System.out.println("      ||   (_)   __..-'");
            System.out.println("       \\\\__..--\"\"");
            System.out.println("=================================");
            System.out.println("     Food Store ");
            System.out.println("=================================");
            System.out.println("1. Gestionar Categorías");
            System.out.println("2. Gestionar Productos");
            System.out.println("3. Gestionar Usuarios");
            System.out.println("4. Gestionar Pedidos");
            System.out.println("5. Reportes");
            System.out.println("0. Salir");
            System.out.println("=================================");
            System.out.print("Seleccione una opción: ");

            if (!sc.hasNextInt()) {
                System.out.println("Entrada inválida. Ingrese un número.");
                sc.nextLine();
                continue;
            }

            opcion = sc.nextInt();
            sc.nextLine();

            switch (opcion) {
                case 1 -> menuCategorias();
                case 2 -> menuProductos();
                case 3 -> menuUsuarios();
                case 4 -> menuPedidos();
                case 5 -> menuReportes();
                case 0 -> {
                    JPAUtil.getEntityManagerFactory().close();
                    System.out.println("¡Gracias por usar Food Store! Hasta pronto...");
                }
                default -> System.out.println("Opción inválida.");
            }
        }
    }

    private static void cargaInicial() {
        if (!catRepo.listarActivos().isEmpty()) return;
        System.out.println("Cargando categorías iniciales...");
        catRepo.guardar(Categoria.builder().nombre("Pizzas").descripcion("Pizzas al horno").build());
        catRepo.guardar(Categoria.builder().nombre("Hamburguesas").descripcion("Hamburguesas caseras").build());
        catRepo.guardar(Categoria.builder().nombre("Bebidas").descripcion("Bebidas frías").build());
        System.out.println("Categorías cargadas correctamente.");
    }

    // --- 5.1 SUBMENÚ CATEGORÍAS ---
    private static void menuCategorias() {
        boolean volver = false;
        while (!volver) {
            System.out.println("\n--- ABM CATEGORÍAS ---");
            System.out.println("1. Alta | 2. Modificación | 3. Baja lógica | 4. Listado | 0. Volver");
            int op = sc.nextInt(); sc.nextLine();

            switch (op) {
                case 1 -> {
                    System.out.print("Nombre (obligatorio): "); String nombre = sc.nextLine();
                    if (nombre.isBlank()) { System.out.println("Error: El nombre no puede estar vacío."); break; }
                    System.out.print("Descripción (opcional): "); String desc = sc.nextLine();
                    Categoria c = Categoria.builder().nombre(nombre).descripcion(desc).build();
                    catRepo.guardar(c);
                    System.out.println("Categoría creada con ID: " + c.getId());
                }
                case 2 -> {
                    catRepo.listarActivos().forEach(c -> System.out.println(c.getId() + " - " + c.getNombre()));
                    System.out.print("ID a modificar: "); Long id = sc.nextLong(); sc.nextLine();
                    Optional<Categoria> opt = catRepo.buscarPorId(id);
                    if (opt.isPresent()) {
                        Categoria c = opt.get();
                        System.out.println("Actual -> Nombre: " + c.getNombre() + " | Desc: " + c.getDescripcion());
                        System.out.print("Nuevo Nombre: "); String nNom = sc.nextLine();
                        if (!nNom.isBlank()) c.setNombre(nNom);
                        System.out.print("Nueva Descripción: "); String nDesc = sc.nextLine();
                        if (!nDesc.isBlank()) c.setDescripcion(nDesc);
                        catRepo.guardar(c);
                        System.out.println("Modificación guardada.");
                    } else System.out.println("Error: Categoría no encontrada o inactiva.");
                }
                case 3 -> {
                    System.out.print("ID a dar de baja: "); Long id = sc.nextLong(); sc.nextLine();
                    Optional<Categoria> opt = catRepo.buscarPorId(id);
                    if (opt.isPresent() && catRepo.eliminarLogico(id)) {
                        System.out.println("Baja confirmada: " + opt.get().getNombre());
                    } else System.out.println("Error: ID no existe o ya dado de baja.");
                }
                case 4 -> {
                    List<Categoria> cats = catRepo.listarActivos();
                    if (cats.isEmpty()) System.out.println("No hay categorías activas.");
                    else cats.forEach(c -> System.out.println(c.getId() + " | " + c.getNombre() + " | " + c.getDescripcion()));
                }
                case 0 -> volver = true;
            }
        }
    }

    // --- 5.2 SUBMENÚ PRODUCTOS ---
    private static void menuProductos() {
        boolean volver = false;
        while (!volver) {
            System.out.println("\n--- ABM PRODUCTOS ---");
            System.out.println("1. Alta | 2. Modificación | 3. Baja lógica | 4. Listado | 0. Volver");
            int op = sc.nextInt(); sc.nextLine();

            switch (op) {
                case 1 -> {
                    List<Categoria> cats = catRepo.listarActivos();
                    if (cats.isEmpty()) { System.out.println("Debe crear una categoría antes de agregar productos."); break; }
                    cats.forEach(c -> System.out.println(c.getId() + ". " + c.getNombre()));

                    System.out.print("Seleccione ID Categoría: "); Long idCat = sc.nextLong(); sc.nextLine();
                    Optional<Categoria> catOpt = catRepo.buscarPorId(idCat);
                    if (catOpt.isEmpty()) { System.out.println("Error: Categoría no encontrada."); break; }

                    System.out.print("Nombre (obligatorio): "); String nom = sc.nextLine();
                    if (nom.isBlank()) { System.out.println("Error: Nombre no puede estar vacío."); break; }

                    System.out.print("Precio: "); Double pre = sc.nextDouble();
                    System.out.print("Stock: "); int stk = sc.nextInt(); sc.nextLine();
                    if (pre <= 0 || stk < 0) { System.out.println("Error: Precio (>0) o Stock (>=0) inválidos."); break; }

                    System.out.print("Disponible (S/N): ");
                    boolean disponible = sc.nextLine().trim().equalsIgnoreCase("S");

                    Producto p = Producto.builder().nombre(nom).precio(pre).stock(stk)
                            .disponible(disponible).categoria(catOpt.get()).build();
                    prodRepo.guardar(p);
                    System.out.println("Producto guardado con ID: " + p.getId() + " en categoría: " + catOpt.get().getNombre());
                }
                case 2 -> {
                    prodRepo.listarActivos().forEach(p -> System.out.println(p.getId() + " - " + p.getNombre()));
                    System.out.print("ID a modificar: "); Long id = sc.nextLong(); sc.nextLine();
                    Optional<Producto> opt = prodRepo.buscarPorId(id);
                    if (opt.isEmpty()) { System.out.println("Error: Producto no encontrado."); break; }

                    Producto p = opt.get();
                    System.out.println("Actual -> " + p.getNombre() + " | $" + p.getPrecio() + " | Stock: " + p.getStock());

                    System.out.print("Nuevo Nombre: "); String nNom = sc.nextLine();
                    if (!nNom.isBlank()) p.setNombre(nNom);

                    System.out.print("Nuevo Precio (0 para omitir): "); Double nPre = sc.nextDouble();
                    if (nPre > 0) p.setPrecio(nPre);

                    System.out.print("Nuevo Stock (-1 para omitir): "); int nStk = sc.nextInt(); sc.nextLine();
                    if (nStk >= 0) p.setStock(nStk);

                    prodRepo.guardar(p);
                    System.out.println("Modificación guardada.");
                }
                case 3 -> {
                    System.out.print("ID a dar de baja: "); Long id = sc.nextLong(); sc.nextLine();
                    Optional<Producto> opt = prodRepo.buscarPorId(id);
                    if (opt.isPresent() && prodRepo.eliminarLogico(id)) {
                        System.out.println("Baja confirmada: " + opt.get().getNombre());
                    } else System.out.println("Error: Producto no encontrado.");
                }
                case 4 -> {
                    List<Producto> prods = prodRepo.listarActivos();
                    if (prods.isEmpty()) System.out.println("No hay productos.");
                    else prods.forEach(p -> System.out.println(p.getId() + " | " + p.getNombre() + " | $" + p.getPrecio() +
                            " | Stock: " + p.getStock() + " | Disp: " + p.isDisponible() + " | Cat: " + p.getCategoria().getNombre()));
                }
                case 0 -> volver = true;
            }
        }
    }

    // --- 5.3 SUBMENÚ USUARIOS ---
    private static void menuUsuarios() {
        boolean volver = false;
        while (!volver) {
            System.out.println("\n--- ABM USUARIOS ---");
            System.out.println("1. Alta | 2. Modificación | 3. Baja | 4. Listado | 5. Buscar por mail | 0. Volver");
            int op = sc.nextInt(); sc.nextLine();

            switch (op) {
                case 1 -> {
                    System.out.print("Nombre: "); String nombre = sc.nextLine();
                    System.out.print("Apellido: "); String apellido = sc.nextLine();
                    System.out.print("Mail: "); String mail = sc.nextLine();

                    if (userRepo.buscarPorMail(mail).isPresent()) {
                        System.out.println("Error: Ya existe un usuario activo con ese mail.");
                        break;
                    }

                    System.out.print("Celular (opcional): "); String celular = sc.nextLine();
                    System.out.print("Contraseña: "); String pass = sc.nextLine();
                    System.out.print("Rol (1. ADMIN / 2. USUARIO): ");
                    Rol rol = (sc.nextInt() == 1) ? Rol.ADMIN : Rol.USUARIO; sc.nextLine();

                    Usuario u = Usuario.builder().nombre(nombre).apellido(apellido).mail(mail)
                            .celular(celular).password(pass).rol(rol).build();
                    userRepo.guardar(u);
                    System.out.println("Usuario creado con ID: " + u.getId());
                }
                case 2 -> {
                    userRepo.listarActivos().forEach(u -> System.out.println(u.getId() + " - " + u.getNombre() + " " + u.getApellido()));
                    System.out.print("Seleccione ID a modificar: "); Long id = sc.nextLong(); sc.nextLine();

                    Optional<Usuario> opt = userRepo.buscarPorId(id);
                    if (opt.isEmpty()) { System.out.println("Error: Usuario no encontrado."); break; }

                    Usuario u = opt.get();
                    System.out.print("Nuevo Nombre: "); String nom = sc.nextLine(); if (!nom.isBlank()) u.setNombre(nom);
                    System.out.print("Nuevo Apellido: "); String ape = sc.nextLine(); if (!ape.isBlank()) u.setApellido(ape);

                    System.out.print("Nuevo Mail: "); String mail = sc.nextLine();
                    if (!mail.isBlank()) {
                        Optional<Usuario> checkMail = userRepo.buscarPorMail(mail);
                        if (checkMail.isPresent() && !checkMail.get().getId().equals(u.getId())) {
                            System.out.println("Error: Mail ya en uso por otro usuario.");
                        } else u.setMail(mail);
                    }
                    userRepo.guardar(u);
                    System.out.println("Modificación guardada.");
                }
                case 3 -> {
                    System.out.print("ID a dar de baja: "); Long id = sc.nextLong(); sc.nextLine();
                    Optional<Usuario> opt = userRepo.buscarPorId(id);
                    if (opt.isPresent() && userRepo.eliminarLogico(id)) {
                        System.out.println("Usuario " + opt.get().getNombre() + " " + opt.get().getApellido() + " dado de baja.");
                    } else System.out.println("Error: Usuario no encontrado.");
                }
                case 4 -> userRepo.listarActivos().forEach(u ->
                        System.out.println(u.getId() + " | " + u.getNombre() + " " + u.getApellido() + " | " + u.getMail() + " | " + u.getRol()));
                case 5 -> {
                    System.out.print("Ingrese mail a buscar: "); String mail = sc.nextLine();
                    userRepo.buscarPorMail(mail).ifPresentOrElse(
                            u -> System.out.println("Datos: " + u.getNombre() + " " + u.getApellido() + ", Rol: " + u.getRol()),
                            () -> System.out.println("No existe usuario activo con ese mail.")
                    );
                }
                case 0 -> volver = true;
            }
        }
    }

    // --- 5.4 SUBMENÚ PEDIDOS ---
    static class ItemTemp {
        Long idProducto;
        int cantidad;
        ItemTemp(Long id, int cant) { this.idProducto = id; this.cantidad = cant; }
    }

    private static void menuPedidos() {
        boolean volver = false;
        while (!volver) {
            System.out.println("\n--- GESTIÓN DE PEDIDOS ---");
            System.out.println("1. Alta | 2. Cambiar Estado | 3. Baja lógica | 4. Listado | 5. Por Usuario | 6. Por Estado | 0. Volver");
            int op = sc.nextInt(); sc.nextLine();

            switch (op) {
                case 1 -> altaPedido();
                case 2 -> {
                    System.out.print("ID Pedido: "); Long id = sc.nextLong(); sc.nextLine();
                    Optional<Pedido> opt = pedidoRepo.buscarPorId(id);
                    if (opt.isPresent() && !opt.get().isEliminado()) {
                        Pedido p = opt.get();
                        System.out.println("Estado actual: " + p.getEstado());
                        System.out.println("Opciones: 1. PENDIENTE, 2. CONFIRMADO, 3. TERMINADO, 4. CANCELADO");
                        int eOp = sc.nextInt(); sc.nextLine();
                        Estado nuevo = switch(eOp) { case 2->Estado.CONFIRMADO; case 3->Estado.TERMINADO; case 4->Estado.CANCELADO; default->Estado.PENDIENTE; };
                        p.setEstado(nuevo);
                        pedidoRepo.guardar(p);
                        System.out.println("Pedido actualizado a: " + p.getEstado());
                    } else System.out.println("Error: Pedido no encontrado.");
                }
                case 3 -> {
                    System.out.print("ID a dar de baja: "); Long id = sc.nextLong(); sc.nextLine();
                    Optional<Pedido> opt = pedidoRepo.buscarPorId(id);
                    if (opt.isPresent() && pedidoRepo.eliminarLogico(id)) {
                        System.out.println("Baja realizada. ID: " + opt.get().getId() + " | Total: $" + opt.get().getTotal());
                    } else System.out.println("Error: Pedido no encontrado.");
                }
                case 4 -> pedidoRepo.listarActivos().forEach(p ->
                        System.out.println(p.getId() + " | " + p.getFecha() + " | " + p.getEstado() + " | " + p.getFormaPago() + " | " + p.getUsuario().getNombre() + " | $" + p.getTotal()));
                case 5 -> {
                    // Se eliminó la línea que listaba a los usuarios
                    System.out.print("ID Usuario: "); Long idU = sc.nextLong(); sc.nextLine();
                    List<Pedido> pedidosUsuario = pedidoRepo.buscarPorUsuario(idU);
                    if(pedidosUsuario.isEmpty()) System.out.println("El usuario no tiene pedidos activos o el ID no existe.");
                    else pedidosUsuario.forEach(p -> System.out.println(p.getId() + " | " + p.getFecha() + " | " + p.getEstado() + " | $" + p.getTotal()));
                }
                case 6 -> {
                    System.out.println("1. PENDIENTE, 2. CONFIRMADO, 3. TERMINADO, 4. CANCELADO");
                    int eOp = sc.nextInt(); sc.nextLine();
                    Estado est = switch(eOp) { case 2->Estado.CONFIRMADO; case 3->Estado.TERMINADO; case 4->Estado.CANCELADO; default->Estado.PENDIENTE; };
                    List<Pedido> pedidosEstado = pedidoRepo.buscarPorEstado(est);
                    if(pedidosEstado.isEmpty()) System.out.println("No hay pedidos con ese estado.");
                    else pedidosEstado.forEach(p -> System.out.println(p.getId() + " | " + p.getFecha() + " | " + p.getUsuario().getNombre() + " | $" + p.getTotal()));
                }
                case 0 -> volver = true;
            }
        }
    }

    private static void altaPedido() {
        List<Usuario> usuarios = userRepo.listarActivos();
        if (usuarios.isEmpty()) {
            System.out.println("No hay usuarios activos. Cancelando operación.");
            return;
        }
        usuarios.forEach(u -> System.out.println(u.getId() + ". " + u.getNombre() + " " + u.getApellido()));
        System.out.print("Seleccione ID Usuario: "); Long idU = sc.nextLong(); sc.nextLine();
        Optional<Usuario> userOpt = userRepo.buscarPorId(idU);
        if (userOpt.isEmpty()) { System.out.println("Usuario no encontrado."); return; }

        System.out.println("Forma de pago: 1. TARJETA, 2. TRANSFERENCIA, 3. EFECTIVO");
        int fOp = sc.nextInt(); sc.nextLine();
        FormaPago fp = (fOp == 1) ? FormaPago.TARJETA : (fOp == 2) ? FormaPago.TRANSFERENCIA : FormaPago.EFECTIVO;

        List<ItemTemp> carrito = new ArrayList<>();
        boolean seguir = true;
        while (seguir) {
            prodRepo.listarActivos().forEach(p ->
                    System.out.println(p.getId() + ". " + p.getNombre() + " | Precio: $" + p.getPrecio() + " | Stock: " + p.getStock()));

            System.out.print("ID Producto: "); Long idP = sc.nextLong(); sc.nextLine();
            Optional<Producto> prodOpt = prodRepo.buscarPorId(idP);

            if (prodOpt.isPresent() && prodOpt.get().isDisponible()) {
                System.out.print("Cantidad: "); int cant = sc.nextInt(); sc.nextLine();
                if (cant > 0 && prodOpt.get().getStock() >= cant) {
                    carrito.add(new ItemTemp(idP, cant));
                } else System.out.println("Stock insuficiente (" + prodOpt.get().getStock() + " disponibles) o cantidad inválida.");
            } else System.out.println("Producto no existe o no está disponible.");

            System.out.print("¿Agregar otro producto? (1. Sí / 0. No): ");
            seguir = (sc.nextInt() == 1); sc.nextLine();
        }

        if (carrito.isEmpty()) { System.out.println("El pedido debe tener al menos un detalle. Cancelando."); return; }

        EntityManager em = JPAUtil.getEntityManagerFactory().createEntityManager();
        try {
            em.getTransaction().begin();
            Pedido pedido = new Pedido(userOpt.get(), LocalDate.now(), Estado.PENDIENTE, fp);

            for (ItemTemp item : carrito) {
                Producto p = em.find(Producto.class, item.idProducto);

                // NOTA: Usando el constructor DetallePedido(Producto, Integer, Double)
                DetallePedido dp = new DetallePedido(item.cantidad, p.getPrecio() * item.cantidad, p);
                pedido.addDetallePedido(dp);

                p.setStock(p.getStock() - item.cantidad);
            }

            pedido.calcularTotal();
            em.persist(pedido);
            em.getTransaction().commit();

            System.out.println("--- Pedido guardado exitosamente ---");
            System.out.println("ID Generado: " + pedido.getId() + " | Fecha: " + pedido.getFecha());
            System.out.println("Usuario: " + pedido.getUsuario().getNombre() + " | Pago: " + pedido.getFormaPago());
            pedido.getDetalles().forEach(d -> System.out.println("- " + d.getProducto().getNombre() +
                    " x" + d.getCantidad() + " | Subtotal: $" + d.getSubtotal()));
            System.out.println("Total del pedido: $" + pedido.getTotal());

        } catch (Exception e) {
            if (em.getTransaction().isActive()) em.getTransaction().rollback();
            System.out.println("Error en transacción. Se ha realizado rollback. Detalle: " + e.getMessage());
        } finally {
            em.close();
        }
    }

    // --- 5.5 SUBMENÚ REPORTES ---
    private static void menuReportes() {
        boolean volver = false;
        while (!volver) {
            System.out.println("\n--- REPORTES ---");
            System.out.println("1. Productos por Categoría");
            System.out.println("2. Pedidos por Usuario");
            System.out.println("3. Pedidos por Estado");
            System.out.println("4. Total Facturado");
            System.out.println("0. Volver");
            int op = sc.nextInt(); sc.nextLine();

            switch (op) {
                case 1 -> {
                    List<Categoria> cats = catRepo.listarActivos();
                    if(cats.isEmpty()) { System.out.println("No hay categorías activas."); break; }
                    cats.forEach(c -> System.out.println(c.getId() + ". " + c.getNombre()));
                    System.out.print("ID Categoría: "); Long idCat = sc.nextLong(); sc.nextLine();
                    List<Producto> prods = prodRepo.buscarPorCategoria(idCat);
                    if(prods.isEmpty()) System.out.println("No hay productos activos en esta categoría.");
                    else prods.forEach(p -> System.out.println("ID: " + p.getId() + " | " + p.getNombre() + " | $" + p.getPrecio() + " | Stock: " + p.getStock()));
                }
                case 2 -> {
                    // Se eliminó la línea que listaba a los usuarios
                    System.out.print("ID Usuario: "); Long idU = sc.nextLong(); sc.nextLine();
                    List<Pedido> pedsU = pedidoRepo.buscarPorUsuario(idU);
                    if(pedsU.isEmpty()) System.out.println("No hay pedidos activos para este usuario o el ID no existe.");
                    else pedsU.forEach(p -> System.out.println(p.getId() + " | " + p.getFecha() + " | " + p.getEstado() + " | " + p.getFormaPago() + " | $" + p.getTotal()));
                }
                case 3 -> {
                    System.out.println("Estados: 1. PENDIENTE, 2. CONFIRMADO, 3. TERMINADO, 4. CANCELADO");
                    int eOp = sc.nextInt(); sc.nextLine();
                    Estado est = switch(eOp) { case 2->Estado.CONFIRMADO; case 3->Estado.TERMINADO; case 4->Estado.CANCELADO; default->Estado.PENDIENTE; };
                    List<Pedido> pedsE = pedidoRepo.buscarPorEstado(est);
                    if(pedsE.isEmpty()) System.out.println("No hay pedidos con estado " + est);
                    else pedsE.forEach(p -> System.out.println(p.getId() + " | " + p.getFecha() + " | " + p.getUsuario().getNombre() + " | $" + p.getTotal()));
                }
                case 4 -> {
                    double total = pedidoRepo.buscarPorEstado(Estado.TERMINADO).stream()
                            .mapToDouble(p -> p.getTotal() != null ? p.getTotal() : 0.0)
                            .sum();
                    System.out.println(String.format(Locale.US, "Total facturado: $%.2f", total));
                }
                case 0 -> volver = true;
            }
        }
    }
}