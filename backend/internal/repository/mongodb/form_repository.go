package mongodb

import (
	"context"
	"errors"
	"time"

	"github.com/devdavidalonso/cecor/backend/internal/database"
	"github.com/devdavidalonso/cecor/backend/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type FormRepository interface {
	// Form Definitions (Questionários)
	GetActiveForm(ctx context.Context) (*models.FormDefinition, error)
	GetFormByID(ctx context.Context, id string) (*models.FormDefinition, error)
	ListAllForms(ctx context.Context) ([]models.FormDefinition, error)
	CreateForm(ctx context.Context, form *models.FormDefinition) error
	UpdateForm(ctx context.Context, id string, form *models.FormDefinition) error
	UpdateFormStatus(ctx context.Context, id string, isActive bool) error
	DeleteForm(ctx context.Context, id string) error

	// Interview Responses (Respostas)
	SaveResponse(ctx context.Context, response *models.InterviewResponse) error
	GetResponseByStudent(ctx context.Context, studentID uint) (*models.InterviewResponse, error)
	GetResponseByID(ctx context.Context, id string) (*models.InterviewResponse, error)
	ListResponsesByForm(ctx context.Context, formVersion string) ([]models.InterviewResponse, error)
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

// ==================== FORM DEFINITIONS ====================

func (r *formRepository) GetActiveForm(ctx context.Context) (*models.FormDefinition, error) {
	var form models.FormDefinition
	opts := options.FindOne().SetSort(bson.D{{Key: "createdAt", Value: -1}})
	err := r.formCollection.FindOne(ctx, bson.M{"isActive": true}, opts).Decode(&form)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &form, nil
}

func (r *formRepository) GetFormByID(ctx context.Context, id string) (*models.FormDefinition, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, errors.New("invalid form ID format")
	}

	var form models.FormDefinition
	err = r.formCollection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&form)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &form, nil
}

func (r *formRepository) ListAllForms(ctx context.Context) ([]models.FormDefinition, error) {
	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}})
	cursor, err := r.formCollection.Find(ctx, bson.M{}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var forms []models.FormDefinition
	if err = cursor.All(ctx, &forms); err != nil {
		return nil, err
	}
	return forms, nil
}

func (r *formRepository) CreateForm(ctx context.Context, form *models.FormDefinition) error {
	form.CreatedAt = time.Now()
	form.ID = primitive.NewObjectID()
	_, err := r.formCollection.InsertOne(ctx, form)
	return err
}

func (r *formRepository) UpdateForm(ctx context.Context, id string, form *models.FormDefinition) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("invalid form ID format")
	}

	update := bson.M{
		"$set": bson.M{
			"title":       form.Title,
			"version":     form.Version,
			"description": form.Description,
			"isActive":    form.IsActive,
			"questions":   form.Questions,
		},
	}

	_, err = r.formCollection.UpdateOne(ctx, bson.M{"_id": objectID}, update)
	return err
}

func (r *formRepository) UpdateFormStatus(ctx context.Context, id string, isActive bool) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("invalid form ID format")
	}

	update := bson.M{
		"$set": bson.M{
			"isActive": isActive,
		},
	}

	_, err = r.formCollection.UpdateOne(ctx, bson.M{"_id": objectID}, update)
	return err
}

func (r *formRepository) DeleteForm(ctx context.Context, id string) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("invalid form ID format")
	}

	_, err = r.formCollection.DeleteOne(ctx, bson.M{"_id": objectID})
	return err
}

// ==================== INTERVIEW RESPONSES ====================

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
	opts := options.FindOne().SetSort(bson.D{{Key: "createdAt", Value: -1}})
	err := r.responseCollection.FindOne(ctx, bson.M{"studentId": studentID}, opts).Decode(&response)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &response, nil
}

func (r *formRepository) GetResponseByID(ctx context.Context, id string) (*models.InterviewResponse, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, errors.New("invalid response ID format")
	}

	var response models.InterviewResponse
	err = r.responseCollection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&response)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &response, nil
}

func (r *formRepository) ListResponsesByForm(ctx context.Context, formVersion string) ([]models.InterviewResponse, error) {
	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}})
	cursor, err := r.responseCollection.Find(ctx, bson.M{"formVersion": formVersion}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var responses []models.InterviewResponse
	if err = cursor.All(ctx, &responses); err != nil {
		return nil, err
	}
	return responses, nil
}
