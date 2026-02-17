package mongodb

import (
	"context"
	"fmt"
	"time"

	"github.com/devdavidalonso/cecor/backend/internal/database"
	"github.com/devdavidalonso/cecor/backend/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type FormRepository interface {
	GetActiveForm(ctx context.Context) (*models.FormDefinition, error)
	CreateForm(ctx context.Context, form *models.FormDefinition) error
	SaveResponse(ctx context.Context, response *models.InterviewResponse) error
	GetResponseByStudent(ctx context.Context, studentID uint) (*models.InterviewResponse, error)
}

type formRepository struct {
	formCollection     *mongo.Collection
	responseCollection *mongo.Collection
}

func NewFormRepository() FormRepository {
	return &formRepository{
		formCollection:     database.GetCollection("form_definitions"),
		responseCollection: database.GetCollection("interview_responses"),
	}
}

func (r *formRepository) GetActiveForm(ctx context.Context) (*models.FormDefinition, error) {
	var form models.FormDefinition
	// Find the latest active form
	opts := options.FindOne().SetSort(bson.D{{Key: "createdAt", Value: -1}})
	err := r.formCollection.FindOne(ctx, bson.M{"isActive": true}, opts).Decode(&form)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil // No active form found
		}
		return nil, err
	}
	return &form, nil
}

func (r *formRepository) CreateForm(ctx context.Context, form *models.FormDefinition) error {
	form.CreatedAt = time.Now()
	form.ID = primitive.NewObjectID()
	_, err := r.formCollection.InsertOne(ctx, form)
	return err
}

func (r *formRepository) SaveResponse(ctx context.Context, response *models.InterviewResponse) error {
	response.CreatedAt = time.Now()
	if response.CompletionDate.IsZero() && response.Status == "completed" {
		response.CompletionDate = time.Now()
	}
	response.ID = primitive.NewObjectID()
	_, err := r.responseCollection.InsertOne(ctx, response)
	return err
}

func (r *formRepository) GetResponseByStudent(ctx context.Context, studentID uint) (*models.InterviewResponse, error) {
	var response models.InterviewResponse
	// Find the latest response by student
	opts := options.FindOne().SetSort(bson.D{{Key: "createdAt", Value: -1}})
	err := r.responseCollection.FindOne(ctx, bson.M{"studentId": studentID}, opts).Decode(&response)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil // No response found
		}
		return nil, err
	}
	return &response, nil
}
