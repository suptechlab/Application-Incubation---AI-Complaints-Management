FROM maven:3.8.5-jdk-11 AS backend-compiler
LABEL mantainer="usuario.seps@seps.gob.ec"
WORKDIR /app
COPY . .

ARG SEPS_MAVEN_USER_ARG
ARG SEPS_MAVEN_PASSWORD_ARG

ENV SEPS_MAVEN_USER=$SEPS_MAVEN_USER_ARG
ENV SEPS_MAVEN_PASSWORD=$SEPS_MAVEN_PASSWORD_ARG

RUN ./mvnw -Pprod clean verify

FROM openjdk:8-alpine

ARG ARG_VERSION
ENV VERSION=$ARG_VERSION

RUN apk add --no-cache tzdata
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

COPY --from=backend-compiler /app/target/service-$VERSION.jar /app/opt/service.jar
ENTRYPOINT ["/usr/bin/java", "-jar", "/app/opt/service.jar"]
