# Firebase Setup Guide

## Overview

This project uses Firebase for:
- **Authentication**: Admin login system
- **Firestore**: Real-time meetings data storage

## 1. Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `cherch-8aa60`

## 2. Authentication Setup

### Enable Email/Password Authentication
1. Navigate to **Authentication** in the left sidebar
2. Click on **Get started** if it's your first time
3. Go to the **Sign-in method** tab
4. Enable **Email/Password** provider

### Create Admin User
1. In the Firebase Console, go to **Authentication** > **Users**
2. Click **Add user**
3. Enter the following details:
   - **Email**: `admin@cherch.com`
   - **Password**: `admin123`
4. Click **Add user**

## 3. Firestore Database Setup

### Enable Firestore
1. Navigate to **Firestore Database** in the left sidebar
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select a location closest to your users

### Set Up Security Rules
In the **Rules** tab, replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to meetings for all users
    match /meetings/{document} {
      allow read: if true;
      // Only authenticated users (admin) can write
      allow write: if request.auth != null;
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Create Meetings Collection
The `meetings` collection will be automatically created when you add your first meeting through the admin panel.

## 4. Current Features

### Authentication
- ✅ Email/password authentication
- ✅ Loading states during login
- ✅ Error handling with Arabic messages
- ✅ Auto logout functionality
- ✅ Auth state persistence

### Meetings Management
- ✅ Real-time meetings data with Firestore
- ✅ Add meetings from admin panel
- ✅ Delete meetings with confirmation
- ✅ Automatic updates across all users
- ✅ Fallback to default meetings if Firebase fails
- ✅ Loading states and error handling
- ✅ Bilingual support (Arabic/English)
## 5. Testing the Complete System

### Test Authentication
1. Start your development server: `npm run dev`
2. Navigate to `/admin`
3. Login with:
   - Email: `admin@cherch.com`
   - Password: `admin123`

### Test Meetings Management
1. After logging in, click on **الاجتماعات** (Meetings) in the sidebar
2. Click **إضافة اجتماع** (Add Meeting) button
3. Fill in the form with:
   - Title (Arabic): `اختبار اجتماع`
   - Title (English): `Test Meeting`
   - Subtitle: `اختبار النظام`
   - Day: `الأحد` (Sunday)
   - Time: `10:00 AM`
   - Location (Arabic): `قاعة الاختبار`
   - Location (English): `Test Hall`
   - Category: Select any category
   - Capacity: `50`
4. Click **إضافة الاجتماع** (Add Meeting)
5. The meeting should appear in the admin list immediately
6. Navigate to `/meetings` to see it displayed publicly
7. Test deleting the meeting from the admin panel

## 6. Code Structure

### Files Modified/Created:

1. **`src/contexts/MeetingsContext.tsx`** (NEW):
   - Firebase Firestore integration
   - Real-time data synchronization
   - CRUD operations for meetings
   - Error handling and loading states

2. **`src/pages/Admin.tsx`** (UPDATED):
   - Meeting management form
   - Firebase integration
   - Loading states and error handling

3. **`src/pages/Meetings.tsx`** (UPDATED):
   - Connected to MeetingsContext
   - Real-time updates from Firestore

4. **`src/App.tsx`** (UPDATED):
   - Added MeetingsProvider wrapper

## 7. Data Flow

```
Admin Form → MeetingsContext → Firestore → Real-time Update → Meetings Page
     ↓            ↓               ↓              ↓              ↓
  Add/Edit    Firebase CRUD   Cloud Storage   Live Sync    Display
```

## 8. Security Considerations

### For Production:
- Change admin credentials
- Set up proper Firestore security rules
- Implement role-based access control
- Add input validation and sanitization
- Set up Firebase App Check
- Monitor usage and set quotas
- Use environment variables for configuration

## 9. Troubleshooting

### Common Issues:
1. **Meetings not loading**: Check Firestore rules and internet connection
2. **Authentication errors**: Verify admin user exists in Firebase Auth
3. **Permission denied**: Check Firestore security rules
4. **Real-time updates not working**: Check network connection and Firestore rules

### Debug Steps:
1. Check browser console for error messages
2. Verify Firebase configuration in `firebase.ts`
3. Check Firebase Console for database activity
4. Ensure internet connection for Firebase operations

## 10. Next Steps

Consider implementing:
- **Events Management**: Similar to meetings
- **Trips Management**: With booking system  
- **Donations Tracking**: Financial management
- **User Registration**: For meeting attendees
- **Email Notifications**: For new meetings
- **Calendar Integration**: Export to calendar apps
- **Offline Support**: PWA capabilities