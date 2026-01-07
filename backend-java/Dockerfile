# Stage 1: Build
FROM eclipse-temurin:21-jdk-alpine AS build

WORKDIR /workspace/app

# Copy Maven wrapper, metadata, and sources
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY src src

# Build the application
RUN ./mvnw -DskipTests package && \
    JAR_FILE=$(find target -maxdepth 1 -type f -name "*.jar" ! -name "*.original" | head -n 1) && \
    test -n "$JAR_FILE" && \
    mkdir -p target/dependency && \
    (cd target/dependency; jar -xf "../$(basename "$JAR_FILE")")

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

ARG DEPENDENCY=/workspace/app/target/dependency
COPY --from=build ${DEPENDENCY}/BOOT-INF/lib /app/lib
COPY --from=build ${DEPENDENCY}/META-INF /app/META-INF
COPY --from=build ${DEPENDENCY}/BOOT-INF/classes /app

# Create directory for uploads
RUN mkdir -p /app/public/uploads

# Expose port
EXPOSE 3000

# Set environment variables
ENV SPRING_PROFILES_ACTIVE=prod

# Run the application
ENTRYPOINT ["java", "-cp", ".:lib/*", "com.jiraclone.JiraCloneApplication"]
