package com.tup.programacion3.utils;

import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;

public class JPAUtil {
    // Se crea una única vez (static final)
    private static final EntityManagerFactory emf = buildEntityManagerFactory();

    private static EntityManagerFactory buildEntityManagerFactory() {
        try {
            // Aquí se conecta con el nombre que definiste en persistence.xml
            return Persistence.createEntityManagerFactory("MiUnidadPersistencia");
        } catch (Throwable ex) {
            throw new ExceptionInInitializerError("Fallo al crear la Factoría: " + ex);
        }
    }

    public static EntityManagerFactory getEntityManagerFactory() {
        return emf;
    }

    public static void close() {
        if (emf != null) emf.close();
    }
}