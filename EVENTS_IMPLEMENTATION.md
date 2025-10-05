# Events Management System - Firebase Integration

## What Has Been Implemented

### 1. Firebase Firestore Integration
- **Complete Events Service** (`src/services/eventsService.ts`)
  - Full CRUD operations (Create, Read, Update, Delete)
  - Real-time subscriptions using Firestore listeners
  - Image upload to Firebase Storage
  - Data validation and error handling
  - Event categories management

### 2. Enhanced Admin Panel
- **EventsManagement Component** (`src/components/admin/EventsManagement.tsx`)
  - **Grid View**: Card-based layout showing event details
  - **Table View**: Comprehensive table with all event information
  - **Add Event Modal**: Complete form for creating new events
  - **Edit Event Modal**: Form for updating existing events
  - **Delete Functionality**: Safe deletion with confirmation
  - **Real-time Updates**: Events automatically update when changed
  - **Image Upload**: Support for event images with validation
  - **Loading States**: Smooth loading indicators
  - **Empty States**: User-friendly messages when no events exist

### 3. Public Events Page
- **Events Component** (`src/pages/Events.tsx`)
  - Loads events from Firebase Firestore
  - Category filtering
  - Featured events display
  - Responsive design
  - Loading and empty states
  - Bilingual support (Arabic/English)

### 4. Firebase Configuration
- **Updated Firebase Setup** (`src/services/firebase.ts`)
  - Firestore database initialization
  - Firebase Storage for images
  - Authentication integration
  - All necessary Firebase functions exported

## Features Included

### Admin Panel Features:
✅ **Add Events**: Complete form with validation
✅ **Edit Events**: Update existing events including images
✅ **Delete Events**: Safe deletion with confirmation
✅ **View Toggle**: Switch between grid and table views
✅ **Real-time Updates**: Automatic updates using Firestore listeners
✅ **Image Management**: Upload, update, and delete event images
✅ **Bilingual Support**: Full Arabic and English support
✅ **Form Validation**: Client-side validation with error messages
✅ **Loading States**: Proper loading indicators
✅ **Error Handling**: Comprehensive error handling and user feedback

### Public Events Page Features:
✅ **Display Events**: Show all events from Firebase
✅ **Category Filtering**: Filter events by category
✅ **Featured Events**: Highlight important events
✅ **Responsive Design**: Works on all device sizes
✅ **Loading States**: Smooth loading experience
✅ **Empty States**: User-friendly when no events exist

### Database Features:
✅ **Firestore Collections**: Events stored in Firestore
✅ **Real-time Sync**: Automatic synchronization
✅ **Image Storage**: Firebase Storage for event images
✅ **Data Structure**: Well-organized event data model
✅ **Timestamps**: Created and updated timestamps
✅ **Categories**: Organized event categorization

## Event Data Model

```typescript
interface Event {
  id?: string;
  title: string;           // Arabic title
  titleEn: string;         // English title
  date: string;            // Event date
  time: string;            // Event time
  location: string;        // Arabic location
  locationEn: string;      // English location
  category: string;        // Event category
  categoryEn: string;      // English category name
  description: string;     // Arabic description
  descriptionEn: string;   // English description
  image: string;           // Image URL
  capacity: number;        // Maximum participants
  registered: number;      // Current registrations
  featured: boolean;       // Featured event flag
  createdAt?: Timestamp;   // Creation timestamp
  updatedAt?: Timestamp;   // Last update timestamp
}
```

## Event Categories Supported

1. **General** (عام)
2. **Conference** (مؤتمر)
3. **Workshop** (ورشة عمل)
4. **Service** (خدمة)
5. **Youth** (شباب)
6. **Children** (أطفال)
7. **Prayer** (صلاة)
8. **Bible Study** (دراسة كتابية)
9. **Celebration** (احتفال)
10. **Seminar** (ندوة)
11. **Festival** (مهرجان)

## How to Use

### Adding Events (Admin):
1. Go to Admin Panel → Events Management
2. Click "Add New Event" button
3. Fill in all required fields (Arabic and English)
4. Upload an event image (optional)
5. Set category and featured status
6. Click "Save Event"

### Editing Events (Admin):
1. In Events Management, click the edit (pencil) icon on any event
2. Modify the desired fields
3. Upload a new image if needed
4. Click "Update Event"

### Viewing Events (Public):
1. Go to the Events page (الفعاليات)
2. Browse all events or filter by category
3. View featured events at the top
4. Events automatically load from Firebase

## Technical Implementation

- **Real-time Data**: Uses Firestore onSnapshot for live updates
- **Image Upload**: Firebase Storage with file validation
- **Error Handling**: Comprehensive try-catch blocks with user feedback
- **Loading States**: Proper loading indicators throughout
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Performance**: Optimized queries and efficient re-renders

The system is now fully functional with Firebase integration, providing a complete events management solution for the church website.