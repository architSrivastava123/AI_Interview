---
source: "express-rest-api-design.md"
topic: "REST APIs"
difficulty: "medium"
role: "backend,fullstack"
technology: "REST APIs"
title: "RESTful API Design Principles, Status Codes, and Idempotency"
---

# RESTful API Design Principles, Status Codes, and Idempotency

Representational State Transfer (REST) is an architectural style for building scalable web services over HTTP using standard resource identifiers, verbs, and status codes.

## HTTP Verbs & Idempotency
- `GET`: Read resource representation. Safe & Idempotent. (Status: `200 OK`, `404 Not Found`).
- `POST`: Create a new resource or process data. Non-idempotent. (Status: `201 Created`, `400 Bad Request`, `422 Unprocessable`).
- `PUT`: Complete resource replacement. Idempotent. (Status: `200 OK` or `204 No Content`).
- `PATCH`: Partial update. Non-idempotent (unless formatted with RFC 6902 JSON Patch). (Status: `200 OK`).
- `DELETE`: Remove resource. Idempotent. (Status: `200 OK` or `204 No Content`).

## URL Resource Naming Conventions
- Use plural nouns for resource collections: `/api/v1/interviews`.
- Use hierarchical relationships: `/api/v1/interviews/:id/questions`.
- Use query parameters for filtering, sorting, and pagination: `/api/v1/interviews?limit=10&page=1&status=completed`.
- Avoid verbs in URLs (e.g., use `POST /api/interviews/:id/complete` or `PATCH /api/interviews/:id { status: "completed" }` rather than `/api/completeInterview`).

## Response Payload Envelope
Consistent JSON envelope across all endpoints:
```json
{
  "success": true,
  "data": { ... },
  "message": "Resource retrieved successfully"
}
```
For errors:
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Interview with id 123 was not found."
  }
}
```
