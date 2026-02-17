package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// FormDefinition (MongoDB) - Questionário Socioeducacional
type FormDefinition struct {
	ID          primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Title       string             `json:"title" bson:"title"`
	Version     string             `json:"version" bson:"version"` // ex: "v1_2026"
	Description string             `json:"description" bson:"description"`
	IsActive    bool               `json:"isActive" bson:"isActive"`
	Questions   []Question         `json:"questions" bson:"questions"`
	CreatedAt   time.Time          `json:"createdAt" bson:"createdAt"`
}

type Question struct {
	ID          string   `json:"id" bson:"id"` // unique key like "income_level"
	Label       string   `json:"label" bson:"label"`
	Type        string   `json:"type" bson:"type"` // text, select, boolean, multiple_choice
	Options     []string `json:"options,omitempty" bson:"options,omitempty"`
	Required    bool     `json:"required" bson:"required"`
	Placeholder string   `json:"placeholder,omitempty" bson:"placeholder,omitempty"`
}

// InterviewResponse (MongoDB) - Respostas dos Alunos
type InterviewResponse struct {
	ID              primitive.ObjectID     `json:"id" bson:"_id,omitempty"`
	StudentID       uint                   `json:"studentId" bson:"studentId"` // Ref to Postgres Student ID
	FormVersion     string                 `json:"formVersion" bson:"formVersion"`
	Status          string                 `json:"status" bson:"status"` // pending, completed
	Answers         map[string]interface{} `json:"answers" bson:"answers"`
	InterviewerID   uint                   `json:"interviewerId,omitempty" bson:"interviewerId,omitempty"` // Se foi feito por admin
	CompletionDate  time.Time              `json:"completionDate" bson:"completionDate"`
	CreatedAt       time.Time              `json:"createdAt" bson:"createdAt"`
}
