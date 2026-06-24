Proyecto: Gestión de Pedidos - Funcional & JPA
Este proyecto es la resolución del Parcial de Programación III (UTN), 
enfocado en la implementación de un sistema de gestión de pedidos utilizando Java, JPA (Java Persistence API) 
y el paradigma de Programación Funcional mediante el uso intensivo de Streams y Lambdas.
--------------------------------------------------------------------------------------------------------------------

🛠 Tecnologías

Java 17+

Lombok: Automatización de código (Boilerplate).

JPA / Hibernate: Mapeo objeto-relacional para persistencia de datos.

Stream API: Procesamiento declarativo de colecciones.

IntelliJ IDEA: Entorno de desarrollo.

-------------------------------------------------------------------------------------
📁 Estructura del Proyecto


src/main/java/com/tup/programacion3/
├── entities/       # Entidades JPA (Base, Categoria, Pedido, Producto, etc.)
├── enums/          # Enumeraciones (Estado, FormaPago, Rol)
├── repositories/   # BaseRepository,CategoriaRepository,ProductoRepository
├── dtos/           # Objetos de transferencia de datos (Records)
├── resources/meta-inf # Persistence
└── Main.java       # Punto de entrada y resolución de requerimientos funcionales

-------------------------------------------------------------------------------------------------------------------------------------

🚀 Guía de Configuración

Lombok: Asegúrate de tener el plugin de Lombok instalado en IntelliJ.

Ve a Settings > Build, Execution, Deployment > Compiler > Annotation Processors y marca "Enable annotation processing".

Persistencia: Verifica el archivo src/main/resources/META-INF/persistence.xml para configurar tu conexión a la base de datos.

Ejecución: Ejecuta el método main de la clase Main.java para observar los resultados de las operaciones funcionales en consola.

------------------------------------------------------------------------------------------------------------------------------------

✨ Resolución del Trabajo Práctico
El proyecto cumple con los objetivos declarativos solicitados:

Cálculo de Totales: Implementación de calcularTotal() en la entidad Pedido utilizando Stream.mapToDouble().sum().

Productos Disponibles: Filtrado de productos mediante .filter(Producto::isDisponible).

Conteo de Ítems: Método funcional contarTotalItems() en la entidad Pedido que reduce la colección de detalles a una suma total.

Stock Crítico: Detección de productos con stock < 5 usando filtrado declarativo.

-----------------------------------------------------------------------------------------------------------------------------------------

📋 Entidades Principales (Modelo UML)
El sistema gestiona la relación entre:

Usuario (1 a M) Pedido

Pedido (1 a M) DetallePedido

DetallePedido (M a 1) Producto

Producto (M a 1) Categoria

Desarrollado para la cátedra de Programación III - UTN.

Instrucciones para el usuario:

Visualización: IntelliJ IDEA renderizará automáticamente este archivo al hacer clic sobre él, mostrando los encabezados y las listas de forma legible.

Personalización: Si cambias la base de datos (por ejemplo, si pasas de H2 a MySQL), recuerda actualizar la sección de "Guía de Configuración" con los nuevos datos de conexión.

