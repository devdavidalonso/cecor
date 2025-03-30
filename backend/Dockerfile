FROM golang:1.22-alpine

WORKDIR /app

# Copy go.mod and go.sum first for better caching
COPY go.mod go.sum ./
RUN go mod download

# Add missing dependencies
RUN go get github.com/go-chi/cors

# Copy the source code
COPY . .

# Build the application
RUN go build -o myapp ./cmd/api

# Expose port and set the startup command
EXPOSE 8080
CMD ["/app/myapp"]