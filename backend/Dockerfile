# syntax=docker/dockerfile:1.7

# Development image with hot reload support
FROM maven:3.8.5-openjdk-17-slim AS development
WORKDIR /app

# Install dependencies for hot reload
RUN apt-get update && apt-get install -y --no-install-recommends \
    inotify-tools \
    && rm -rf /var/lib/apt/lists/*

# Cache dependencies first
COPY pom.xml ./
RUN mvn -q -DskipTests dependency:go-offline

# Copy source (will be overridden by volume mount in dev)
COPY src ./src

# Enable Spring Boot DevTools remote restart
ENV SPRING_DEVTOOLS_RESTART_ENABLED=true \
    SPRING_DEVTOOLS_LIVERELOAD_ENABLED=true

EXPOSE 8080 5005

# Use spring-boot:run for hot reload instead of packaged jar
CMD ["mvn", "spring-boot:run", "-Dspring-boot.run.jvmArguments='-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005'"]

# Production image (multi-stage build)
FROM maven:3.8.5-openjdk-17-slim AS builder
WORKDIR /app

COPY pom.xml ./
RUN mvn -q -DskipTests dependency:go-offline

COPY src ./src
RUN mvn -q -DskipTests clean package

FROM eclipse-temurin:17-jre-jammy AS production
WORKDIR /app

ENV TZ=UTC

COPY --from=builder /app/target/*.jar /app/app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
