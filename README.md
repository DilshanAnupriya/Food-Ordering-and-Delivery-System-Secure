# Secure Food Ordering and Delivery System

## 1. Team Members

| No. | Name | Index Number |
|-----|------|--------------|
| 1 | Hewaduwa H.G.V | IT22186706 |
| 2 | Athukorala H.H.B | IT22066770 |
| 3 | Jayasinghe J.A.N.T | IT22189530 |
| 4 | Cooray B.D.A | IT22122100 |

---

## 2. Project Information

### Project Name
**Food Ordering and Delivery System**

### Module
SE4030 / Group ID:31

### Academic Year
2026

### University
Sri Lanka Institute of Information Technology (SLIIT)

---

## 3. Original Project

This project was originally developed as a Food Ordering and Delivery System using a microservices-based architecture.

### Original GitHub Repository

https://github.com/DilshanAnupriya/Food-Ordering-Delivery-System.git

### Original Project Reference

If this project is based on a third-party project, the original project/reference is provided below:

- **Project:** [Food Ordering and Delivery System
- **Author/Organization:** Dilshan Anupriya,Chathumi Gunathunga,Vidura Hewaduwa,Navoda H.G.J
- **GitHub:** https://github.com/DilshanAnupriya/Food-Ordering-Delivery-System.git



## 4. Modified Secure Project

This repository contains the modified version of the Food Ordering and Delivery System after identifying and fixing the security vulnerabilities.

### Modified GitHub Repository

https://github.com/DilshanAnupriya/Food-Ordering-and-Delivery-System-Secure.git

The GitHub commit history contains detailed comments describing the security fixes and implementation changes.

---

## 5. Security Vulnerabilities Identified and Fixed

The following security vulnerabilities were identified and addressed in the project.

| No. | Vulnerability | 
|-----|---------------|
| V1 | Broken Access Control / IDOR 
| V2 | Authentication weakness 
| V3 | Security misconfiguration / headers 
| V4 | Sensitive Information Exposure 
| V5 | Business Logic & Parameter/Price Tampering
| V6 | Stored XSS & Lack of Input Sanitization 
| V7 | Unrestricted Resource Consumption  
| V8 | Missing Rate Limiting and Unbounded Pagination. 





## 6. Authentication – Google Sign-In

We implemented **Sign in with Google** using **OpenID Connect (OIDC)** on top of the **OAuth 2.0 Authorization Code flow**.

### Authentication Flow

The authentication process works as follows:

1. User clicks **Continue with Google**.
2. The request is sent through the **API Gateway** to the **Auth Service**.
3. The Auth Service redirects the user to Google's authentication page.
4. The application requests the required scopes:
   - `openid`
   - `profile`
   - `email`
5. `state` and `nonce` are used for additional security.
6. The user authenticates directly with Google.
7. Google returns a one-time authorization code.
8. The Auth Service exchanges the authorization code for tokens directly with Google.
9. The ID token is validated.
10. The system finds or creates the user account.
11. New users are assigned the basic `USER` role.
12. The Auth Service issues the application's JWT.
13. The JWT is then used to access protected microservices.

### Security Measures

The Google authentication implementation includes:

- OAuth 2.0 Authorization Code flow
- OpenID Connect
- `state` parameter protection
- `nonce` validation
- Minimum required scopes
- Exact redirect URI configuration
- Secure client-secret storage
- ID token validation
- Role-based authorization
- JWT-based authentication
- Protected API Gateway endpoints
- Safe authentication error handling

---

## 7. Security Configuration

Sensitive credentials are not stored directly in the source code.

The following information is kept outside the source code:

- Google Client Secret
- Database credentials
- JWT secrets
- Other sensitive configuration values

Sensitive configuration files are excluded from Git using `.gitignore`.

---

## 8. Git Commit History

The modified project contains a detailed Git commit history showing the development and security fixes.

Each security-related commit includes a description of:

- The vulnerability identified
- The affected component
- The security fix
- Any important configuration or code changes

Example:

```text
fix(auth): validate Google OIDC ID token

fix(security): remove hard-coded credentials

fix(gateway): enforce authentication on protected endpoints

fix(errors): prevent sensitive information in error responses
