# Admin Setup Guide

This guide explains how to create the first admin user for the JAAP Backend application.

## Prerequisites

- MongoDB must be running and connected
- Application dependencies must be installed (`npm install`)

## Method 1: Using Command Line Script (Recommended)

The easiest way to create the first admin is using the provided script:

```bash
npm run create-admin <username> <password>
```

### Example:

```bash
npm run create-admin admin SecurePassword123
```

This will:

- Connect to your MongoDB database
- Hash the password using bcrypt (12 salt rounds)
- Create the admin user
- Display the created admin's details

### Output:

```
✅ Admin created successfully!
Username: admin
ID: 507f1f77bcf86cd799439011
```

## Method 2: Using API Endpoint

You can also create an admin via the REST API:

### Endpoint:

```
POST /api/admin/register
```

### Request Body:

```json
{
  "username": "admin",
  "password": "SecurePassword123"
}
```

### Example using cURL:

```bash
curl -X POST http://localhost:3000/api/admin/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"SecurePassword123"}'
```

### Example using Postman or Thunder Client:

1. Method: POST
2. URL: `http://localhost:3000/api/admin/register`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):

```json
{
  "username": "admin",
  "password": "SecurePassword123"
}
```

## Security Recommendations

1. **Strong Password**: Use a strong password with:
   - At least 12 characters
   - Mix of uppercase and lowercase letters
   - Numbers and special characters

2. **Disable Registration**: After creating the first admin, consider:
   - Removing or protecting the `/api/admin/register` endpoint
   - Adding authentication guards to prevent unauthorized admin creation

3. **Environment Variables**: Store sensitive credentials in `.env` file:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
```

## Login After Creation

Once the admin is created, you can login using:

### Endpoint:

```
POST /api/admin/login
```

### Request Body:

```json
{
  "username": "admin",
  "password": "SecurePassword123"
}
```

### Response:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Use this JWT token in the `Authorization` header for protected routes:

```
Authorization: Bearer <your-token>
```

## Troubleshooting

### Error: "Admin creation failed"

- Check if MongoDB is running
- Verify database connection in `.env` file
- Check if username already exists

### Error: "Usage: npm run create-admin <username> <password>"

- Make sure to provide both username and password arguments
- Example: `npm run create-admin admin mypassword`

### Script doesn't run

- Ensure `ts-node` is installed: `npm install`
- Check if the script file exists at `src/scripts/create-admin.ts`

## Next Steps

After creating your first admin:

1. Test the login endpoint
2. Secure the registration endpoint
3. Set up additional admin users if needed
4. Configure JWT secret in `.env` file for production
