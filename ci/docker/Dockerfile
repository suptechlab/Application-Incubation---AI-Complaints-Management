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

# Install required libraries for font rendering
RUN apk add --no-cache fontconfig ttf-dejavu libx11 curl

# Download and install Microsoft Core Fonts, including Calibri
RUN curl -LO http://ftp.us.debian.org/debian/pool/contrib/m/msttcorefonts-installer/msttcorefonts-installer_3.8.1_all.deb && \
    apk add --no-cache --virtual .msttcorefonts-installer-deps --allow-untrusted msttcorefonts-installer_3.8.1_all.deb && \
    rm msttcorefonts-installer_3.8.1_all.deb && \
    apk del .msttcorefonts-installer-deps

# Rebuild font cache
RUN fc-cache -f -v    

RUN apk add --no-cache tzdata
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

COPY --from=backend-compiler /app/target/admin-${VERSION}.jar /app/opt/admin.jar
ENTRYPOINT ["java", "-Djava.awt.headless=true", "-Dsun.java2d.debugfonts=true", "-jar", "/app/opt/admin.jar"]
