# REST API Reference - URL Shortener Pro

This document provides specifications for the REST APIs of **URL Shortener Pro**.

All API routes are prefixed with `/api`.
For authenticated routes, include the JWT token in the `Authorization` header as:
`Authorization: Bearer <your_jwt_token>`

---

## 1. Authentication APIs

### Register User
* **Route**: `POST /api/auth/register`
* **Access**: Public
* **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123",
    "confirmPassword": "securepassword123"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "603d65b1d9bf3a2a4c125678",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
  ```

### Login User
* **Route**: `POST /api/auth/login`
* **Access**: Public
* **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "603d65b1d9bf3a2a4c125678",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
  ```

### Get Profile
* **Route**: `GET /api/auth/profile`
* **Access**: Private (Authenticated)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "603d65b1d9bf3a2a4c125678",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2026-06-16T12:00:00.000Z"
    }
  }
  ```

---

## 2. URL Management APIs

### Create Shortened URL
* **Route**: `POST /api/urls`
* **Access**: Private (Authenticated)
* **Request Body**:
  ```json
  {
    "originalUrl": "https://github.com/facebook/react",
    "customAlias": "react-repo",
    "expiryDate": "2026-12-31T23:59:59.000Z"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "603d65b1d9bf3a2a4c129999",
      "userId": "603d65b1d9bf3a2a4c125678",
      "originalUrl": "https://github.com/facebook/react",
      "shortCode": "react-repo",
      "customAlias": "react-repo",
      "qrCode": "data:image/png;base64,iVBORw0KGgo...",
      "clickCount": 0,
      "expiryDate": "2026-12-31T23:59:59.000Z",
      "createdAt": "2026-06-16T13:00:00.000Z"
    }
  }
  ```

### Get Paginated URL List
* **Route**: `GET /api/urls`
* **Access**: Private (Authenticated)
* **Query Parameters**:
  * `search` (Optional): Filter originalUrl, shortCode, or alias
  * `sortBy` (Optional): Field to sort by (`createdAt`, `clickCount`)
  * `sortOrder` (Optional): Direction (`asc`, `desc`)
  * `page` (Optional): Page number (default: 1)
  * `limit` (Optional): Page limit (default: 10)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 1,
    "pagination": {
      "total": 12,
      "page": 1,
      "limit": 10,
      "pages": 2
    },
    "data": [ ... ]
  }
  ```

### Update Destination URL
* **Route**: `PUT /api/urls/:id`
* **Access**: Private (Authenticated)
* **Request Body**:
  ```json
  {
    "originalUrl": "https://github.com/facebook/react/releases",
    "expiryDate": "2027-01-15T00:00:00.000Z"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": { ... }
  }
  ```

### Delete URL
* **Route**: `DELETE /api/urls/:id`
* **Access**: Private (Authenticated)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "URL and associated analytics deleted"
  }
  ```

### Bulk Import via CSV
* **Route**: `POST /api/urls/bulk`
* **Access**: Private (Authenticated)
* **Request Body**: Multipart Form containing key `file` (uploaded CSV file)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "summary": {
      "totalProcessed": 3,
      "successCount": 2,
      "skippedCount": 1
    },
    "data": [ ... ],
    "skipped": [
      {
        "row": { "originalUrl": "google.com", "customAlias": "g" },
        "reason": "Invalid URL format. Must start with http:// or https://"
      }
    ]
  }
  ```

---

## 3. Analytics APIs

### Get Metrics
* **Route**: `GET /api/analytics/:shortCode`
* **Access**: Private (Owner only) OR Public (If requested with query `?public=true`)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "url": {
        "originalUrl": "https://google.com",
        "shortCode": "aBc123",
        "customAlias": null,
        "clickCount": 25,
        "expiryDate": null,
        "createdAt": "2026-06-16T12:00:00.000Z"
      },
      "summary": {
        "totalClicks": 25,
        "lastVisit": "2026-06-16T13:45:10.000Z"
      },
      "deviceStats": [
        { "name": "Desktop", "count": 18 },
        { "name": "Mobile", "count": 7 }
      ],
      "browserStats": [
        { "name": "Chrome", "count": 15 },
        { "name": "Safari", "count": 6 },
        { "name": "Firefox", "count": 4 }
      ],
      "countryStats": [
        { "name": "United States", "count": 12 },
        { "name": "India", "count": 13 }
      ],
      "cityStats": [
        { "name": "New York", "count": 12 },
        { "name": "Mumbai", "count": 13 }
      ],
      "dailyTrend": [
        { "date": "2026-06-16", "count": 25 }
      ],
      "recentVisits": [ ... ]
    }
  }
  ```

---

## 4. Short Code Redirect API

### Redirect to Original Destination URL
* **Route**: `GET /:shortCode`
* **Access**: Public
* **Response**: `HTTP 302 Found` with redirect target in header `Location`. (If expired, performs redirect to client `/expired`).
