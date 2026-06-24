package com.tup.programacion3.repositories;



import com.tup.programacion3.model.Usuario;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.TypedQuery;
import java.util.Optional;

public class UsuarioRepository extends BaseRepository<Usuario> {

    public UsuarioRepository() {
        super(Usuario.class);
    }

    /**
     * Busca un usuario por su correo electrónico, filtrando solo aquellos
     * que no han sido marcados como eliminados (eliminado = false).
     * * @param mail El correo electrónico del usuario.
     * @return Un Optional con el usuario si es encontrado y activo, Optional.empty() en caso contrario.
     */
    public Optional<Usuario> buscarPorMail(String mail) {
        EntityManager em = emf.createEntityManager();
        try {
            // JPQL con parámetro nombrado :mail para prevenir inyección de consultas
            // Se filtra por eliminado = false para asegurar que el usuario esté activo
            String jpql = "SELECT u FROM Usuario u WHERE u.mail = :mail AND u.eliminado = false";

            TypedQuery<Usuario> query = em.createQuery(jpql, Usuario.class);
            query.setParameter("mail", mail);

            return Optional.of(query.getSingleResult());
        } catch (NoResultException e) {
            // Si no se encuentra ningún resultado, retornamos un Optional vacío
            return Optional.empty();
        } finally {
            em.close();
        }
    }
}