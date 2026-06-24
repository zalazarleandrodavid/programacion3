package com.tup.programacion3.model;

import com.tup.programacion3.enums.Rol;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.util.*;

@Entity @Table(name = "usuarios") @SuperBuilder @Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Usuario extends Base {
    private String nombre;
    private String mail;
    private String apellido;
    private String celular;
    private String password;
    @Enumerated(EnumType.STRING)
    private Rol rol;
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL) @Builder.Default
    private Set<Pedido> pedidos = new HashSet<>();
}