package com.tup.programacion3.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "detalles_pedido")
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Getter
@Setter
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
public class DetallePedido extends Base {

    private int cantidad;

    private Double subtotal;

    // Relación ManyToOne con Producto: Varios detalles pueden referenciar un mismo producto
    @ManyToOne(optional = false)
    @JoinColumn(name = "producto_id")
    private Producto producto;
}