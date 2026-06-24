package com.tup.programacion3.model;

import com.tup.programacion3.enums.Estado;
import com.tup.programacion3.enums.FormaPago;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.time.LocalDate;
import java.util.*;

@Entity
@Table(name = "pedidos")
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Getter
@Setter
@ToString(callSuper = true, exclude = {"usuario", "detalles"})
@EqualsAndHashCode(callSuper = true)
public class Pedido extends Base implements Calculable {

    private LocalDate fecha;
    private Double total;

    @Enumerated(EnumType.STRING)
    private Estado estado;

    @Enumerated(EnumType.STRING)
    private FormaPago formaPago;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    // Se utiliza List para mayor eficiencia en la persistencia con @OneToMany
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "pedido_id")
    @Builder.Default
    private List<DetallePedido> detalles = new ArrayList<>();

    /**
     * Constructor para el flujo de alta de pedido.
     */
    public Pedido(Usuario usuario, LocalDate fecha, Estado estado, FormaPago formaPago) {
        this.usuario = usuario;
        this.fecha = fecha;
        this.estado = estado;
        this.formaPago = formaPago;
        this.detalles = new ArrayList<>();
        this.total = 0.0;
    }

    /**
     * Calcula el total del pedido sumando el subtotal de cada detalle.
     */
    @Override
    public void calcularTotal() {
        this.total = detalles.stream()
                .mapToDouble(DetallePedido::getSubtotal)
                .sum();
    }

    /**
     * Agrega un detalle al pedido.
     */
    public void addDetallePedido(DetallePedido dp) {
        if (this.detalles == null) {
            this.detalles = new ArrayList<>();
        }
        this.detalles.add(dp);
    }
}