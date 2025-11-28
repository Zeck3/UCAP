# University Course Assessment Portal (UCAP)

📌 The University Course Assessment Portal (UCAP) is a web-based system designed to help instructors and academic administrators efficiently manage class records, compute course outcome attainment, and generate standardized COA result sheets.
It integrates multiple tools—CRMS, COAS, and NLP-based CO–PO Mapping into a single streamlined platform to improve academic reporting, reduce manual workload, and ensure alignment with program outcomes.

🎯 **Key Features**
1. Authentication and Role Management
  - Secure login/logout
  - Role-based dashboards for Instructors, Chairs, VPAA, VCAA, and Admin
2. Dashboard
  - View courses, sections, and academic summaries
  - Quick access to class records and COA reports
3. Class Record Management System (CRMS)
  - Manage student lists
  - Create assessments
  - Encode scores
  - Automatic computation of grades
4. Course Outcome Assessment System (COAS)
  - Generate COA result sheets
  - Compute CO attainment
  - Bloom’s Taxonomy classification
  - Exportable assessment summaries
5. NLP-Powered CO–PO Mapping
  - Upload syllabus files
  - Automatically generate suggested CO–PO mappings
  - Manual review and correction interface
6. Usability & Reporting
  - System Usability Scale (SUS) testing
  - Instructor-friendly interface
  - Real-time computation and validation

🛠️ **Technologies Used**
**Frontend**
  - React.js
  - Vite
  - TypeScript
  - Tailwind CSS

**Backend**
  - Django
  - Django REST Framework
  - Database
  - PostgreSQL

**Other Tools**
  - Docker (containerization)
  - Postman (API testing)
  - GitHub (version control)
  - Visual Studio Code

## Start the app
```bash
  docker-compose down -v #Avoid this to not delete data on database
  docker-compose up --build
  docker-compose up -d
  docker-compose exec backend python manage.py makemigrations
  docker-compose exec backend python manage.py migrate

#POSTGRES TERMINAL
  docker exec -ti ucap_db psql -U postgres -d ucap_db 
```

- Frontend: http://localhost:3000  
- Backend: http://localhost:8000

👥 **Team**
  - Carlo Angelo Cortes – Project Manager
  - Neil Jan Dinglasa – Developer
  - Jestoni Andales – Database Manager
  - Dave Deguanco – QA Manager
