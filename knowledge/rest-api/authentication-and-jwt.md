---
source: "rest-api-authentication-and-jwt.md"
topic: "Authentication"
difficulty: "medium"
role: "backend,fullstack"
technology: "Authentication"
title: "Web Authentication: JWT, Clerk Tokens, and API Authorization"
---

# Web Authentication: JWT, Clerk Tokens, and API Authorization

Secure stateless authentication in modern web architectures decouples identity management from application business logic.

## JSON Web Tokens (JWT) Architecture
A JWT consists of three base64url-encoded parts separated by dots:
1. **Header**: Token type (`JWT`) and signing algorithm (`RS256`, `HS256`).
2. **Payload (Claims)**: Registered claims (`sub`, `iss`, `exp`, `iat`) and custom application claims (`role`, `clerkUserId`).
3. **Signature**: Cryptographic signature computed using private key or shared secret:
   `HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)`

## Clerk Authentication Flow
1. Client logs in through Clerk React components (`SignIn`, `SignUp`).
2. Clerk issues a short-lived signed JWT session token to the client.
3. Client attaches the token in API requests: `Authorization: Bearer <session_token>`.
4. Express middleware validates the token signature against Clerk's JSON Web Key Set (JWKS) or Clerk backend SDK.
5. Upon successful verification, the middleware extracts the verified `userId` (`clerkUserId`) and attaches it to `req.auth`.
6. Express controllers enforce ownership boundary: queries filter on `{ clerkUserId: req.auth.userId }`.

## Security Considerations
- Never store sensitive secrets in JWT payload (payload is base64 encoded and publicly readable).
- Validate token expiration (`exp`) and issuer (`iss`).
- Enforce HTTPS to prevent token interception in transit.
