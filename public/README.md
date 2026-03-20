# Firebase Credentials Setup

## ⚠️ IMPORTANT: Security Notice

**NEVER commit your actual Firebase service account credentials to Git!**

The actual credentials file is ignored by `.gitignore` to prevent accidental commits.

## 📋 Setup Instructions

### 1. Get Your Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** (gear icon) → **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file

### 2. Add Credentials to Your Project

1. Copy the downloaded JSON file to the `public/` directory
2. Rename it to match the path in your `.env` file

Example:

```bash
cp ~/Downloads/your-project-firebase-adminsdk-xxxxx.json public/
```

### 3. Update .env File

Make sure your `.env` file has the correct path:

```env
FIREBASE_KEY_PATH=public/your-firebase-credentials-file.json
```

### 4. Verify Setup

The file should be:

- ✅ Located in the `public/` directory
- ✅ Referenced correctly in `.env`
- ✅ **NOT** tracked by Git (check with `git status`)

## 🔒 Security Best Practices

1. **Never commit credentials** - The `.gitignore` file is configured to exclude all JSON files in the `public/` directory except the template
2. **Use environment variables** - Always reference credentials via environment variables
3. **Rotate keys regularly** - Generate new service account keys periodically
4. **Limit permissions** - Only grant necessary permissions to the service account
5. **Use different keys** - Use separate service accounts for development, staging, and production

## 📝 Template File

A template file (`firebase-credentials.template.json`) is provided to show the expected structure. **Do not use this template with real credentials!**

## 🚨 If You Accidentally Committed Credentials

If you accidentally committed your Firebase credentials:

1. **Immediately revoke the key** in Firebase Console
2. Generate a new service account key
3. Remove the file from Git history:
   ```bash
   git rm --cached public/your-credentials-file.json
   git commit -m "Remove sensitive credentials"
   ```
4. Add the new credentials file (it will be ignored by `.gitignore`)

## 📚 Additional Resources

- [Firebase Admin SDK Setup](https://firebase.google.com/docs/admin/setup)
- [Service Account Best Practices](https://cloud.google.com/iam/docs/best-practices-service-accounts)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
