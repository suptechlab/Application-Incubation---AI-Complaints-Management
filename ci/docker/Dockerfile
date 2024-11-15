FROM maven:3.8.5-openjdk-17 AS backend-compiler
LABEL mantainer="usuario.seps@seps.gob.ec"
WORKDIR /app
COPY . .

#ARG SEPS_MAVEN_USER_ARG
#ARG SEPS_MAVEN_PASSWORD_ARG

#ENV SEPS_MAVEN_USER=$SEPS_MAVEN_USER_ARG
#ENV SEPS_MAVEN_PASSWORD=$SEPS_MAVEN_PASSWORD_ARG

RUN chmod +x ./mvnw
RUN ./mvnw -Pprod clean verify -DskipTests

FROM openjdk:17-slim

ARG ARG_VERSION
ENV VERSION=$ARG_VERSION

# Install necessary libraries and fonts
RUN apt-get update && apt-get install -y \
    ttf-mscorefonts-installer \
    fontconfig \
    ttf-dejavu \
    libx11-6 \
    curl && \
    fc-cache -f -v && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* 

RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

COPY --from=backend-compiler /app/target/admin-${VERSION}.jar /app/opt/admin.jar
ENTRYPOINT ["java", "-Djava.awt.headless=true", "-Dsun.java2d.debugfonts=true", "-jar", "/app/opt/admin.jar"]
