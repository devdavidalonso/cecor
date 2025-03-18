```mermaid
erDiagram
    User ||--o{ Enrollment : has
    User ||--o{ Student : becomes
    User ||--o{ Notification : receives
    Course ||--o{ Enrollment : contains
    Course ||--o{ Registration : offers
    Student ||--o{ Guardian : has
    Student ||--o{ Registration : enrolls
    Registration ||--o{ Attendance : tracks
    Registration ||--o{ Certificate : issues

    User {
        int id PK
        varchar name
        varchar email UK
        varchar password
        varchar profile
        date birth_date NULL
        varchar cpf UK
        varchar phone
        text address
        varchar photo_url
        boolean active
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at NULL
    }

    Course {
        int id PK
        varchar name
        text description
        int workload
        int max_students
        varchar week_days
        time start_time
        time end_time
        int duration
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at NULL
    }

    Enrollment {
        int id PK
        int user_id FK
        int course_id FK
        varchar status
        date start_date
        date end_date NULL
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at NULL
    }

    Student {
        int id PK
        int user_id FK
        varchar registration_number UK
        varchar status
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at NULL
    }

    Guardian {
        int id PK
        int student_id FK
        varchar name
        varchar email
        varchar phone
        varchar cpf
        varchar relationship
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at NULL
    }

    Registration {
        int id PK
        int student_id FK
        int course_id FK
        varchar status
        date start_date
        date end_date NULL
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at NULL
    }

    Attendance {
        int id PK
        int registration_id FK
        date date
        varchar status
        text notes
        timestamp created_at
        timestamp updated_at
    }

    Certificate {
        int id PK
        int registration_id FK
        date issue_date
        varchar certificate_code UK
        varchar pdf_url
        timestamp created_at
        timestamp updated_at
    }

    Notification {
        int id PK
        int user_id FK
        varchar title
        text message
        boolean read
        timestamp created_at
        timestamp updated_at
    }
```