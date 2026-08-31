---
source: "rest-api-status-codes-and-errors.md"
topic: "REST APIs"
difficulty: "easy"
role: "backend,fullstack"
technology: "REST APIs"
title: "HTTP Status Codes and REST API Error Handling Best Practices"
---

# HTTP Status Codes and REST API Error Handling Best Practices

Proper HTTP status codes communicate operational results semantically to API clients and automated monitoring systems.

## Status Code Classes
- **2xx (Success)**:
  - `200 OK`: Standard response for successful requests.
  - `201 Created`: Resource successfully created (includes `Location` header or created object in body).
  - `204 No Content`: Successful request with no body returned (common in `DELETE` operations).
- **4xx (Client Errors)**:
  - `400 Bad Request`: Malformed syntax, invalid request body, or failed schema validation.
  - `401 Unauthorized`: Authentication required or invalid/expired session token.
  - `403 Forbidden`: Authenticated user lacks permission to access the specified resource.
  - `404 Not Found`: Resource does not exist.
  - `409 Conflict`: Conflict with current state of target resource (e.g., duplicate unique field).
  - `429 Too Many Requests`: Rate limit exceeded.
- **5xx (Server Errors)**:
  - `500 Internal Server Error`: Unhandled server exception.
  - `502 Bad Gateway`: Downstream service failure (e.g., AI model endpoint unreachable).
  - `503 Service Unavailable`: Server overloaded or undergoing maintenance.

## Production Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Validation failed on fields: 'targetRole', 'experience'",
    "details": [
      { "field": "targetRole", "issue": "Must be a non-empty string" }
    ]
  }
}
```
Never leak internal stack traces or environment secrets in production error responses.
