package com.ah.web.config;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class SchemaMigrationRunner implements ApplicationRunner {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        entityManager.createNativeQuery("""
            ALTER TABLE products
            ALTER COLUMN name TYPE TEXT USING name::text;
        """).executeUpdate();

        entityManager.createNativeQuery("""
            ALTER TABLE products
            ALTER COLUMN sku TYPE TEXT USING sku::text;
        """).executeUpdate();

        entityManager.createNativeQuery("""
            ALTER TABLE products
            ALTER COLUMN short_description TYPE TEXT USING short_description::text;
        """).executeUpdate();

        entityManager.createNativeQuery("""
            ALTER TABLE products
            ALTER COLUMN description TYPE TEXT USING description::text;
        """).executeUpdate();

        entityManager.createNativeQuery("""
            ALTER TABLE products
            ALTER COLUMN ingredients TYPE TEXT USING ingredients::text;
        """).executeUpdate();

        entityManager.createNativeQuery("""
            ALTER TABLE products
            ALTER COLUMN benefits TYPE TEXT USING benefits::text;
        """).executeUpdate();

        entityManager.createNativeQuery("""
            ALTER TABLE products
            ALTER COLUMN usage TYPE TEXT USING usage::text;
        """).executeUpdate();
    }
}
