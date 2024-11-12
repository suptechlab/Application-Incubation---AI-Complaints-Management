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

FROM openjdk:17-alpine

ARG ARG_VERSION
ENV VERSION=$ARG_VERSION

RUN apk add --no-cache tzdata
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

COPY --from=backend-compiler /app/target/user-${VERSION}.jar /app/opt/user.jar
ENTRYPOINT ["java", "-jar", "/app/opt/user.jar"]
