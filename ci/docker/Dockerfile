# Stage 1: Build the application
FROM maven:3.8.5-openjdk-17 AS backend-compiler
LABEL maintainer="usuario.seps@seps.gob.ec"
WORKDIR /app
COPY . .
 
# Build the project
RUN chmod +x ./mvnw
RUN ./mvnw -Pprod clean verify -DskipTests
 
# Stage 2: Create the runtime image
FROM openjdk:17-alpine
 
ARG ARG_VERSION
ENV VERSION=$ARG_VERSION
 
# Install required packages for font management
RUN apk add --no-cache tzdata freetype fontconfig
 
# Create a user for running the application
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring
 
# Copy the JAR file from the build stage
COPY --from=backend-compiler /app/target/admin-${VERSION}.jar /app/opt/admin.jar
 
# Set the entry point
ENTRYPOINT ["java", "-Djava.awt.headless=true", "-jar", "/app/opt/admin.jar"]
