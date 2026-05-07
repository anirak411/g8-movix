# Build stage
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
# This line is the fix: it ensures we only copy the actual executable jar
COPY --from=build /app/target/movix-*.jar app.jar
EXPOSE 8080
# Use this entrypoint to ensure Spring Boot finds the main class
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]