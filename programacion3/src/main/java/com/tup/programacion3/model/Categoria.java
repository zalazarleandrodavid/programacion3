package com.tup.programacion3.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.util.*;

@Entity @Table(name = "categorias") @SuperBuilder @Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Categoria extends Base {
    private String nombre;
    private String descripcion;
    @OneToMany(mappedBy = "categoria") @Builder.Default
    private Set<Producto> productos = new HashSet<>();
}