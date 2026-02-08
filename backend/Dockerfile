# Stage 1: Build the application
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install build tools
RUN apk add --no-cache git gcc libc-dev

# Copy go.mod and go.sum first for better cache
COPY go.mod go.sum ./
RUN go mod download

# Copy the source code
COPY . .

# Build the application
RUN go build -o /app/main ./cmd/api/main.go

# List files for debugging
RUN ls -la /app

# Stage 2: Create the final image
FROM alpine:latest

WORKDIR /app

# Copy the built application from the builder stage
COPY --from=builder /app/main /app/main

# Expose the application port
EXPOSE 8080

# Run the application
CMD ["/app/main"]