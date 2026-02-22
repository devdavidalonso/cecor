package database

import (
	"context"
	"fmt"
	"time"

	"github.com/devdavidalonso/cecor/backend/internal/config"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var MongoClient *mongo.Client

// InitMongoDB initializes the MongoDB connection
func InitMongoDB(cfg *config.Config) (*mongo.Client, error) {
	// Skip MongoDB if URI is explicitly set to empty or "disabled"
	if cfg.Database.MongoURI == "" || cfg.Database.MongoURI == "disabled" {
		return nil, nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Use URI from config or default (fallback for local dev)
	uri := cfg.Database.MongoURI
	if uri == "" {
		uri = "mongodb://mongo:27017"
	}

	clientOptions := options.Client().ApplyURI(uri)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to mongodb: %w", err)
	}

	// Ping the database
	err = client.Ping(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to ping mongodb: %w", err)
	}

	MongoClient = client
	return client, nil
}

// GetCollection returns a MongoDB collection handle
func GetCollection(collectionName string) *mongo.Collection {
	if MongoClient == nil {
		return nil
	}
	// TODO: Get database name from config
	return MongoClient.Database("cecor_mongo").Collection(collectionName)
}
