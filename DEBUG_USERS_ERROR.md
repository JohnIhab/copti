# Users Management Debug Guide

## When you get "حدث خطأ" (Error occurred) when adding a user, follow these steps:

### Step 1: Open Browser Developer Tools
1. Open your browser's Developer Tools (F12)
2. Go to the **Console** tab
3. Clear the console
4. Try to add a user again
5. Look at the console logs for detailed error information

### Step 2: Check Firebase Connection
1. Click the **"Test Firebase"** button in the Users Management page
2. Check if it shows "Firebase connection successful!" or fails
3. If it fails, there's a Firebase configuration issue

### Step 3: Common Error Scenarios

#### A. Network/Connection Errors
**Console shows:** `auth/network-request-failed` or network errors
**Solution:** Check your internet connection and Firebase project status

#### B. Firebase Auth Errors
**Console shows:** `auth/email-already-in-use`
**Solution:** The email is already registered in Firebase Auth

**Console shows:** `auth/invalid-email`
**Solution:** The email format is invalid

**Console shows:** `auth/weak-password`
**Solution:** Password must be at least 6 characters

#### C. Firestore Permission Errors
**Console shows:** `permission-denied` or `FirebaseError: Missing or insufficient permissions`
**Solution:** Check Firestore security rules

#### D. Form Validation Errors
**Console shows:** "Form validation failed"
**Solution:** Check if all required fields are filled:
- Name (required)
- Email (required, must be valid format)
- Password (required for new users, min 6 chars)
- Security Number (required, must be unique)

### Step 4: Check Firestore Security Rules
Make sure your Firestore rules allow read/write access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to users collection
    match /users/{document} {
      allow read, write: if true; // For development only
    }
  }
}
```

### Step 5: Check Firebase Auth Settings
1. Go to Firebase Console → Authentication → Sign-in method
2. Make sure **Email/Password** provider is enabled
3. Check if there are any domain restrictions

### Step 6: Common Fix Steps

#### Fix 1: Clear Browser Cache
1. Clear browser cache and cookies
2. Refresh the page and try again

#### Fix 2: Check Form Data
Make sure all fields are properly filled:
- **Name:** Not empty
- **Email:** Valid format (example@domain.com)
- **Password:** At least 6 characters
- **Security Number:** Unique identifier

#### Fix 3: Test with Different Data
Try creating a user with completely different information to rule out data conflicts.

### Step 7: Debug Information to Collect

When reporting the issue, please provide:

1. **Console Logs:** Copy all error messages from browser console
2. **Network Tab:** Check if there are failed requests in Network tab
3. **Form Data:** What values were you trying to save?
4. **Firebase Project Status:** Is your Firebase project active?

### Step 8: Sample Working Data

Try creating a user with this test data:
- **Name:** Test User
- **Email:** test@example.com
- **Password:** test123456
- **Security Number:** TEST001

### Quick Test Commands

You can run these in the browser console:

```javascript
// Test Firebase connection
console.log('Firebase app:', window.firebase);

// Test form data
console.log('Current form data:', document.querySelector('input[name="name"]')?.value);
```

## Most Common Issues:

1. **Firestore Rules** - Security rules blocking writes
2. **Network Issues** - Internet connection problems
3. **Duplicate Data** - Email or security number already exists
4. **Form Validation** - Missing required fields
5. **Firebase Config** - Wrong project configuration

Follow this guide step by step to identify and fix the issue!