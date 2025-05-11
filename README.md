# University Course Assessment Portal (UCAP)

## Start the app

```bash
docker-compose up --build
docker-compose up -d
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate

#POSTGRES TERMINAL
docker exec -ti ucap_db psql -U postgres -d ucap_db 
```

- Frontend: http://localhost:3000  
- Backend: http://localhost:8000
