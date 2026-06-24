package com.tup.programacion3.repositories;

import com.tup.programacion3.model.Pedido;
import com.tup.programacion3.enums.Estado; // Asumiendo que tienes un Enum Estado
import com.tup.programacion3.utils.JPAUtil;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import java.util.List;

public class PedidoRepository extends BaseRepository<Pedido> {

    public PedidoRepository() {
        super(Pedido.class);
    }

    /**
     * Busca todos los pedidos activos asociados a un usuario específico.
     * @param idUsuario El ID del usuario.
     * @return Lista de pedidos activos del usuario.
     */
    public List<Pedido> buscarPorUsuario(Long idUsuario) {
        EntityManager em = emf.createEntityManager();
        try {
            // JPQL: Selecciona pedidos vinculados al usuario dado que no están marcados como eliminados.
            String jpql = "SELECT p FROM Pedido p WHERE p.usuario.id = :idUsuario AND p.eliminado = false";
            TypedQuery<Pedido> query = em.createQuery(jpql, Pedido.class);
            query.setParameter("idUsuario", idUsuario);
            return query.getResultList();
        } finally {
            em.close();
        }
    }

    /**
     * Busca todos los pedidos activos según su estado (ej: PENDIENTE, TERMINADO).
     * @param estado El estado del pedido a buscar.
     * @return Lista de pedidos activos con el estado indicado.
     */
// Ejemplo de cómo debería quedar tu método en PedidoRepository
    public List<Pedido> buscarPorEstado(Estado estado) {
        EntityManager em = JPAUtil.getEntityManagerFactory().createEntityManager();
        try {
            // El JOIN FETCH obliga a Hibernate a traer los datos del usuario en la misma consulta
            String jpql = "SELECT p FROM Pedido p JOIN FETCH p.usuario WHERE p.estado = :estado AND p.eliminado = false";
            return em.createQuery(jpql, Pedido.class)
                    .setParameter("estado", estado)
                    .getResultList();
        } finally {
            em.close();
        }
    }
}