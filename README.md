# Student Management System (Node.js, Express, MongoDB, Docker, Kubernetes)

Services: api-gateway (3000), registration-service (3001), search-service (3002).
Pod 1 = api-gateway + registration-service, Pod 2 = search-service. Data is stored in MongoDB Atlas (connection string in a Kubernetes Secret).
All client requests go through the API gateway.

Endpoints (via gateway):
- POST /api/register
- PUT  /api/register/:id
- GET  /api/students/search?id=1  or  ?name=sophea
