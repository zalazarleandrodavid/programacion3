package com.tup.programacion3.repositories;

import com.tup.programacion3.model.Producto;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import java.util.List;

public class ProductoRepository extends BaseRepository<Producto> {

    public ProductoRepository() {
        super(Producto.class);
    }

    // Sobreescribimos listarActivos para forzar la carga de la categoría
    @Override
    public List<Producto> listarActivos() {
        EntityManager em = emf.createEntityManager();
        try {
            // "JOIN FETCH" le dice a Hibernate: trae el producto y su categoría de una vez
            String jpql = "SELECT p FROM Producto p LEFT JOIN FETCH p.categoria WHERE p.eliminado = false";
            TypedQuery<Producto> query = em.createQuery(jpql, Producto.class);
            return query.getResultList();
        } finally {
            em.close();
        }
    }

    public List<Producto> buscarPorCategoria(Long categoriaId) {
        EntityManager em = emf.createEntityManager();
        try {
            // Aquí también hacemos JOIN FETCH por si necesitas usar los datos de la categoría luego
            String jpql = "SELECT p FROM Producto p LEFT JOIN FETCH p.categoria WHERE p.categoria.id = :categoriaId AND p.eliminado = false";
            TypedQuery<Producto> query = em.createQuery(jpql, Producto.class);
            query.setParameter("categoriaId", categoriaId);
            return query.getResultList();
        } finally {
            em.close();
        }
    }
}