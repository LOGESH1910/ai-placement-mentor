# AI Placement Mentor

A personalized AI-powered campus placement preparation platform for engineering students.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React + Vite)               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │  Auth    │ │Dashboard │ │ Resume   │ │  Interview   │   │
│  │ Pages   │ │ Profile  │ │ Analysis │ │  Mock/Gen    │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                     │
│  │ Coding   │ │Roadmap   │ │ Axios +  │                     │
│  │  Recs   │ │Generator │ │ JWT Auth │                     │
│  └──────────┘ └──────────┘ └──────────┘                     │
└─────────────────────────┬───────────────────────────────────┘
                          │ REST API (JSON)
┌─────────────────────────▼───────────────────────────────────┐
│                   Backend (Spring Boot 3 / Java 21)          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Spring Security + JWT Filter             │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │ Auth     │ │ Profile  │ │ Resume   │ │  Interview   │   │
│  │Controller│ │Controller│ │Controller│ │  Controller  │   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬───────┘   │
│       │            │            │               │            │
│  ┌────▼─────┐ ┌────▼─────┐ ┌────▼─────┐ ┌──────▼───────┐   │
│  │ Auth     │ │ Profile  │ │ Resume   │ │  Interview   │   │
│  │ Service  │ │ Service  │ │ Service  │ │  Service     │   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬───────┘   │
│       │            │            │               │            │
│  ┌────▼─────────────▼────────────▼───────────────▼───────┐  │
│  │              GeminiService + PromptBuilderService       │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Spring Data MongoDB (Repositories)       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    MongoDB Atlas                              │
│  users │ resume_analyses │ interview_sessions │ roadmaps     │
│  question_history │ coding_recommendations                   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
              Google Gemini API (External)
```

## Folder Structure

```
ai-placement-mentor/
├── backend/                          # Spring Boot application
│   ├── src/main/java/com/aimentor/
│   │   ├── AiPlacementMentorApplication.java
│   │   ├── config/
│   │   │   ├── SecurityConfig.java
│   │   │   ├── SwaggerConfig.java
│   │   │   └── CorsConfig.java
│   │   ├── controller/
│   │   │   ├── AuthController.java
│   │   │   ├── ProfileController.java
│   │   │   ├── ResumeController.java
│   │   │   ├── InterviewController.java
│   │   │   ├── CodingController.java
│   │   │   └── RoadmapController.java
│   │   ├── service/
│   │   │   ├── AuthService.java
│   │   │   ├── ProfileService.java
│   │   │   ├── ResumeService.java
│   │   │   ├── InterviewService.java
│   │   │   ├── CodingService.java
│   │   │   ├── RoadmapService.java
│   │   │   ├── GeminiService.java
│   │   │   └── PromptBuilderService.java
│   │   ├── repository/
│   │   │   ├── UserRepository.java
│   │   │   ├── ResumeAnalysisRepository.java
│   │   │   ├── InterviewSessionRepository.java
│   │   │   ├── CodingRecommendationRepository.java
│   │   │   └── RoadmapRepository.java
│   │   ├── model/
│   │   │   ├── User.java
│   │   │   ├── ResumeAnalysis.java
│   │   │   ├── InterviewSession.java
│   │   │   ├── CodingRecommendation.java
│   │   │   └── Roadmap.java
│   │   ├── dto/
│   │   │   ├── request/
│   │   │   └── response/
│   │   ├── security/
│   │   │   ├── JwtUtil.java
│   │   │   ├── JwtAuthFilter.java
│   │   │   └── UserDetailsServiceImpl.java
│   │   └── exception/
│   │       ├── GlobalExceptionHandler.java
│   │       └── custom exceptions
│   └── src/main/resources/
│       └── application.yml
├── frontend/                         # React + Vite application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   ├── hooks/
│   │   └── utils/
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Prerequisites

- Java 21+
- Node.js 18+
- Maven 3.9+
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key

## Environment Variables

### Backend (`backend/.env` or set in environment)

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/ai_placement_mentor
JWT_SECRET=your-very-long-secret-key-minimum-32-chars
JWT_EXPIRATION=86400000
GEMINI_API_KEY=your-gemini-api-key
ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## Running Locally

### Backend

```bash
cd backend
cp .env.example .env
# Fill in your .env values
mvn spring-boot:run
```

Backend runs on: http://localhost:8080
Swagger UI: http://localhost:8080/swagger-ui.html

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs on: http://localhost:5173

## Running with Docker

```bash
cp .env.example .env
# Fill in your .env values
docker-compose up --build
```

## Deployment (Render.com)

### Backend
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `cd backend && mvn clean package -DskipTests`
4. Set start command: `java -jar backend/target/ai-placement-mentor-*.jar`
5. Add all environment variables in Render dashboard

### Frontend
1. Create a new Static Site on Render
2. Set build command: `cd frontend && npm install && npm run build`
3. Set publish directory: `frontend/dist`
4. Add `VITE_API_BASE_URL` pointing to your backend Render URL

## API Documentation

Once running, visit: `http://localhost:8080/swagger-ui.html`

## Features

- **Authentication**: JWT-based register/login/logout
- **Dashboard**: Placement readiness score, recent activity
- **Profile**: Edit skills, target role, upload resume
- **Resume Analysis**: AI-powered skill gap analysis
- **Interview Questions**: Generate easy/medium/hard Q&A by technology
- **Mock Interview**: Submit answers, get AI feedback and scores
- **Coding Recommendations**: DSA problems by topic/role
- **Learning Roadmap**: Personalized 3-month roadmap
