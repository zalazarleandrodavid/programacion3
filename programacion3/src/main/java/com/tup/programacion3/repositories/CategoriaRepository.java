package com.tup.programacion3.repositories;

import com.tup.programacion3.model.Categoria;

public class CategoriaRepository extends BaseRepository<Categoria> {
    public CategoriaRepository() {
        super(Categoria.class);
    }
}