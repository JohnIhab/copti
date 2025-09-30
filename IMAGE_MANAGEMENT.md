# Image Management for Church Website

## Issue Resolution: ERR_BLOCKED_BY_CLIENT

The "Failed to load resource: net::ERR_BLOCKED_BY_CLIENT" error was caused by external image URLs from Pexels being blocked by ad blockers or browser security extensions.

## Solution Implemented

All external image references have been replaced with local image paths:

### Events Images (public/Images/events/)
- youth-conference.jpg
- christmas-celebration.jpg
- family-seminar.jpg
- hymns-festival.jpg

### Trips Images (public/Images/trips/)
- monastery-trip.jpg
- zoo-trip.jpg
- family-trip.jpg
- pilgrimage-trip.jpg

## How to Add Images

1. Download appropriate images for each event/trip
2. Resize them to approximately 800px width for optimal performance
3. Save them in the respective folders with the exact names listed above
4. Ensure images are in JPG format for best compression

## Alternative Solutions

### For Development/Testing
If you need placeholder images immediately, you can:

1. **Use placeholder services that are less likely to be blocked:**
   ```tsx
   image: 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Event'
   ```

2. **Use the ImageWithFallback component** (already created in components/):
   ```tsx
   import ImageWithFallback from '../components/ImageWithFallback';
   
   <ImageWithFallback 
     src="/Images/events/youth-conference.jpg"
     alt="Youth Conference"
     className="w-full h-64 object-cover"
   />
   ```

### Why This Happened

- **Ad Blockers**: Extensions like uBlock Origin, AdBlock Plus block many external image domains
- **Privacy Extensions**: Privacy-focused extensions block tracking domains
- **Corporate Firewalls**: Some networks block external image resources
- **CSP Policies**: Content Security Policies may restrict external resources

### Best Practices Going Forward

1. **Always use local images** for production websites
2. **Optimize images** before adding them (use tools like TinyPNG)
3. **Use appropriate formats** (WebP for modern browsers, JPG for compatibility)
4. **Implement lazy loading** for better performance
5. **Have fallback images** for error cases

## Current Status

✅ External URLs replaced with local paths
✅ Directory structure created
✅ ImageWithFallback component available
⚠️ Actual image files need to be added

The website will now load without the ERR_BLOCKED_BY_CLIENT error, though you'll need to add the actual image files to see them properly.