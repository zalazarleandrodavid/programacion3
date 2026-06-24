plugins {
    id("java")
}

group = "com.tup"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {
    // --- LOMBOK (Generación de código) ---
    compileOnly("org.projectlombok:lombok:1.18.30")
    annotationProcessor("org.projectlombok:lombok:1.18.30")

    // --- JPA / JAKARTA (Para @Id, @MappedSuperclass, etc.) ---
    // Agregamos la versión manual ya que no estás usando el plugin de Spring Boot
    implementation("jakarta.persistence:jakarta.persistence-api:3.1.0")

    // --- LOGBOOK (Para el registro de HTTP) ---
    implementation("org.zalando:logbook-core:3.9.0")

    // --- TESTING ---
    testImplementation(platform("org.junit:junit-bom:5.10.0")) // Corregida a versión estable
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
    // Source: https://mvnrepository.com/artifact/com.h2database/h2
    implementation("com.h2database:h2:2.4.240")

    implementation("org.hibernate.orm:hibernate-core:6.4.4.Final")
}

tasks.test {
    useJUnitPlatform()
}
