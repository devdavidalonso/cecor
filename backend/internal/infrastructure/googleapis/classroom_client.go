package googleapis

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/classroom/v1"
	"google.golang.org/api/option"
)

type GoogleClassroomClient interface {
	CreateCourse(name, section, descriptionHeading, description string) (*classroom.Course, error)
	AddStudent(courseId string, studentEmail string) (*classroom.Student, error)
	AddTeacher(courseId string, teacherEmail string) (*classroom.Teacher, error)
}

type classroomClient struct {
	srv *classroom.Service
}

func NewGoogleClassroomClient(credentialsFile string) (GoogleClassroomClient, error) {
	ctx := context.Background()
	
	b, err := os.ReadFile(credentialsFile)
	if err != nil {
		return nil, fmt.Errorf("unable to read client secret file: %v", err)
	}

	// Requesting full permissions for the Classroom APIs
	config, err := google.ConfigFromJSON(b,
		classroom.ClassroomCoursesScope,
		classroom.ClassroomRostersScope,
		classroom.ClassroomProfileEmailsScope,
		classroom.ClassroomProfilePhotosScope,
	)
	if err != nil {
		return nil, fmt.Errorf("unable to parse client secret file to config: %v", err)
	}

	client := getClient(config)

	srv, err := classroom.NewService(ctx, option.WithHTTPClient(client))
	if err != nil {
		return nil, fmt.Errorf("unable to retrieve Classroom client: %v", err)
	}

	return &classroomClient{srv: srv}, nil
}

// Retrieves a token, saves the token, then returns the generated client.
func getClient(config *oauth2.Config) *http.Client {
	tokFile := "token.json"
	tok, err := tokenFromFile(tokFile)
	if err != nil {
		tok = getTokenFromWeb(config)
		saveToken(tokFile, tok)
	}
	return config.Client(context.Background(), tok)
}

// Requests a token from the web, then returns the retrieved token.
func getTokenFromWeb(config *oauth2.Config) *oauth2.Token {
	authURL := config.AuthCodeURL("state-token", oauth2.AccessTypeOffline)
	fmt.Printf("Go to the following link in your browser then type the "+
		"authorization code: \n%v\n", authURL)

	var authCode string
	if _, err := fmt.Scan(&authCode); err != nil {
		log.Fatalf("Unable to read authorization code: %v", err)
	}

	tok, err := config.Exchange(context.Background(), authCode)
	if err != nil {
		log.Fatalf("Unable to retrieve token from web: %v", err)
	}
	return tok
}

// Retrieves a token from a local file.
func tokenFromFile(file string) (*oauth2.Token, error) {
	f, err := os.Open(file)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	tok := &oauth2.Token{}
	err = json.NewDecoder(f).Decode(tok)
	return tok, err
}

// Saves a token to a file path.
func saveToken(path string, token *oauth2.Token) {
	fmt.Printf("Saving credential file to: %s\n", path)
	f, err := os.OpenFile(path, os.O_RDWR|os.O_CREATE|os.O_TRUNC, 0600)
	if err != nil {
		log.Fatalf("Unable to cache oauth token: %v", err)
	}
	defer f.Close()
	json.NewEncoder(f).Encode(token)
}

func (c *classroomClient) CreateCourse(name, section, descriptionHeading, description string) (*classroom.Course, error) {
	// Create course in PROVISIONED state first (required for non-domain admins)
	course := &classroom.Course{
		Name:               name,
		Section:            section,
		DescriptionHeading: descriptionHeading,
		Description:        description,
		OwnerId:            "me",
		CourseState:        "PROVISIONED",
	}

	createdCourse, err := c.srv.Courses.Create(course).Do()
	if err != nil {
		return nil, fmt.Errorf("unable to create course: %v", err)
	}

	// Try to activate the course (may fail if user doesn't have permission)
	// For regular users, they need to accept the course in the UI
	activeCourse := &classroom.Course{
		CourseState: "ACTIVE",
	}
	_, err = c.srv.Courses.Patch(createdCourse.Id, activeCourse).UpdateMask("courseState").Do()
	if err != nil {
		// Log but don't fail - course is created but needs to be activated manually
		fmt.Printf("⚠️  Course created but could not be activated automatically: %v\n", err)
		fmt.Printf("📧 Check your email to accept the course invitation\n")
	}

	return createdCourse, nil
}

func (c *classroomClient) AddStudent(courseId string, studentEmail string) (*classroom.Student, error) {
	student := &classroom.Student{
		UserId: studentEmail,
	}
	res, err := c.srv.Courses.Students.Create(courseId, student).Do()
	if err != nil {
		return nil, fmt.Errorf("unable to add student: %v", err)
	}
	return res, nil
}

func (c *classroomClient) AddTeacher(courseId string, teacherEmail string) (*classroom.Teacher, error) {
	teacher := &classroom.Teacher{
		UserId: teacherEmail,
	}
	res, err := c.srv.Courses.Teachers.Create(courseId, teacher).Do()
	if err != nil {
		return nil, fmt.Errorf("unable to add teacher: %v", err)
	}
	return res, nil
}
