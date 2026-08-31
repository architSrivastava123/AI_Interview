---
source: "express-middleware-pipeline.md"
topic: "Express.js"
difficulty: "medium"
role: "backend,fullstack"
technology: "Express.js"
title: "Express.js Middleware Architecture and Error Handling Pipeline"
---

# Express.js Middleware Architecture and Error Handling Pipeline

Express uses the Chain of Responsibility pattern. A middleware function has access to the Request object (`req`), the Response object (`res`), and the `next` middleware function in the application’s request-response cycle.

## Types of Middleware
1. **Application-level**: Bound to `app.use()` or `app.METHOD()`.
2. **Router-level**: Bound to an instance of `express.Router()`.
3. **Built-in**: `express.json()`, `express.urlencoded()`, `express.static()`.
4. **Third-party**: `cors`, `helmet`, `morgan`, `multer`.
5. **Error-handling**: Middleware with **4 arguments**: `(err, req, res, next)`.

## Error-Handling Mechanics
- If `next(error)` is called with an argument (anything other than `'route'`), Express stops executing the regular middleware pipeline and forwards execution straight to the nearest error-handling middleware.
- Error middleware must be placed **last** after all route definitions.
- In Express 4, asynchronous errors thrown inside promises must be explicitly passed to `next(err)` or caught by async wrappers.

## Security & Best Practices
- Input validation & sanitization (e.g., Zod / Joi).
- Rate limiting (`express-rate-limit`) to protect against brute force and DDoS.
- Secure HTTP headers via `helmet`.
- Centralized custom error classes (e.g., `AppError`, `NotFoundError`, `UnauthorizedError`).
