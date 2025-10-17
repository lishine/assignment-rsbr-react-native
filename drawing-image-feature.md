# Drawing & Image Feature Implementation Plan

## Overview
Add image upload and drawing capabilities to tasks, with support for drawing on uploaded images. All data stored as base64 in PostgreSQL.

## Constraints
- **Max image size**: 200KB (original file, ~267KB as base64)
- **Storage**: PostgreSQL TEXT columns (base64 encoded)
- **Drawing library**: react-native-signature-canvas
- **Image picker**: expo-image-picker

---

## Database Schema Changes

### Tasks Table Updates
```sql
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS drawing TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS image_type VARCHAR(20);
```

**Fields:**
- `image`: Base64-encoded image string (nullable)
- `drawing`: Base64-encoded drawing/signature (nullable)
- `image_type`: MIME type (e.g., 'image/jpeg', 'image/png') (nullable)

---

## Backend Changes

### 1. Update Types (`packages/backend/src/types.ts`)
```typescript
export type Task = {
  id: number
  title: string
  description?: string
  completed: boolean
  user_id: number
  created_at: string
  updated_at: string
  image?: string        // NEW: base64 image
  drawing?: string      // NEW: base64 drawing
  image_type?: string   // NEW: MIME type
}

export type TaskRequest = {
  title: string
  description?: string
  completed?: boolean
  image?: string        // NEW
  drawing?: string      // NEW
  image_type?: string   // NEW
}
```

### 2. Update Database Init (`packages/backend/src/db/init.ts`)
- Add new columns to CREATE TABLE statement
- Ensure columns are created if they don't exist

### 3. Update Task Controller (`packages/backend/src/controllers/tasks.ts`)
- Modify CREATE task to accept image, drawing, image_type
- Modify UPDATE task to accept image, drawing, image_type
- Add validation for base64 size (~300KB max after encoding)

### 4. Update Express Config (`packages/backend/src/index.ts`)
```typescript
app.use(express.json({ limit: '2mb' })); // Increase from default 100kb
```

### 5. Add Validation Middleware (optional but recommended)
- Validate base64 format
- Check size limits
- Verify MIME types

---

## Frontend Changes

### 1. Install Dependencies
```bash
cd packages/mobile
npx expo install expo-image-picker
npm install react-native-signature-canvas react-native-webview
```

### 2. Update Types (`packages/mobile/src/types.ts`)
```typescript
export type Task = {
  id: number
  title: string
  description?: string
  completed: boolean
  user_id: number
  created_at: string
  updated_at: string
  image?: string        // NEW
  drawing?: string      // NEW
  image_type?: string   // NEW
}

export type TaskRequest = {
  title: string
  description?: string
  completed?: boolean
  image?: string        // NEW
  drawing?: string      // NEW
  image_type?: string   // NEW
}
```

### 3. Create Image Picker Component (`packages/mobile/src/components/ImagePicker.tsx`)
**Features:**
- Button to pick image from library or camera
- Image compression to stay under 200KB
- Preview selected image
- Clear/remove image option
- Convert to base64

**Implementation:**
```typescript
import * as ImagePicker from 'expo-image-picker'

// Pick image with compression
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,
  quality: 0.5,        // Compress to reduce size
  base64: true,
  maxWidth: 800,       // Limit dimensions to reduce size
  maxHeight: 800,
})

// Validate size < 200KB
if (base64.length * 0.75 > 200000) {
  alert('Image too large. Please select a smaller image.')
  return
}
```

### 4. Create Drawing Canvas Component (`packages/mobile/src/components/DrawingCanvas.tsx`)
**Features:**
- Full-screen or modal drawing canvas
- Clear button
- Save button (returns base64)
- Optional: Load image as background for drawing on image
- Pen color/size options (optional)

**Implementation:**
```typescript
import SignatureCanvas from 'react-native-signature-canvas'

<SignatureCanvas
  onEnd={(base64Signature) => {
    setDrawing(base64Signature)
  }}
  descriptionText="Draw here"
  clearText="Clear"
  confirmText="Save"
  backgroundColor="white"
  penColor="black"
  webStyle={`.m-signature-pad { box-shadow: none; border: none; }`}
/>
```

### 5. Drawing on Image Feature
**Approach:**
- Load uploaded image as background
- Overlay transparent canvas
- User draws on top
- Save both separately OR merge into single image

**Implementation:**
```typescript
// Option 1: Save separately (simpler)
- image: base64 of uploaded photo
- drawing: base64 of drawing layer

// Option 2: Merge (requires canvas manipulation)
- Combine both into single base64 image
```

### 6. Update TasksScreen (`packages/mobile/src/screens/TasksScreen.tsx`)
**Add UI for:**
- "Add Image" button in task creation
- "Add Drawing" button in task creation
- "Draw on Image" option (only if image exists)
- Modal/overlay for drawing canvas

**Flow:**
1. User creates task → enters title/description
2. (Optional) User picks image → previews
3. (Optional) User opens drawing canvas
   - If image exists: show as background
   - User draws
   - Save drawing
4. Submit task with all data

### 7. Update TaskItem Component (`packages/mobile/src/components/TaskItem.tsx`)
**Display:**
- Show image thumbnail if exists
- Show drawing thumbnail if exists
- Tap to view full screen
- Option to remove image/drawing (edit mode)

**Implementation:**
```typescript
{task.image && (
  <Image 
    source={{ uri: `data:${task.image_type};base64,${task.image}` }}
    style={{ width: 60, height: 60, borderRadius: 4 }}
    resizeMode="cover"
  />
)}

{task.drawing && (
  <Image 
    source={{ uri: task.drawing }}
    style={{ width: 60, height: 60, borderRadius: 4 }}
    resizeMode="cover"
  />
)}
```

---

## Implementation Steps

### Phase 1: Backend (Est. 1-2 hours)
1. ✅ Write this plan document
2. ⏳ Update database schema (add columns)
3. ⏳ Update backend types
4. ⏳ Update task controller (create/update endpoints)
5. ⏳ Increase Express body size limit
6. ⏳ Test API with Postman/Swagger

### Phase 2: Frontend - Image Upload (Est. 2 hours)
7. ⏳ Install dependencies
8. ⏳ Update mobile types
9. ⏳ Create ImagePicker component
10. ⏳ Integrate into TasksScreen
11. ⏳ Add image preview in TaskItem
12. ⏳ Test image upload flow

### Phase 3: Frontend - Drawing (Est. 2 hours)
13. ⏳ Create DrawingCanvas component
14. ⏳ Integrate into TasksScreen (standalone drawing)
15. ⏳ Add drawing preview in TaskItem
16. ⏳ Test drawing flow

### Phase 4: Drawing on Image (Est. 1 hour)
17. ⏳ Add background image support to DrawingCanvas
18. ⏳ Update UI flow to support combined mode
19. ⏳ Test drawing on uploaded images

### Phase 5: Polish & Testing (Est. 1 hour)
20. ⏳ Add loading states
21. ⏳ Add error handling
22. ⏳ Test full flow end-to-end
23. ⏳ Verify 200KB limit enforcement
24. ⏳ Run typecheck and tests

---

## Size Optimization Strategies

### Image Compression:
- **Quality**: 0.5 (50% JPEG quality)
- **Max dimensions**: 800x800px
- **Format**: Prefer JPEG over PNG (smaller)
- **Validation**: Check size before upload, reject if >200KB

### Drawing Compression:
- **Format**: PNG (signature-canvas default)
- **Canvas size**: Limit to reasonable dimensions (e.g., 600x400)
- **Background**: Transparent to save space

### Base64 Overhead:
- Base64 increases size by ~33%
- 200KB original → ~267KB base64
- Need to validate original file size, not base64 size

---

## User Flows

### Flow 1: Add Image to Task
1. User taps "Create Task"
2. Enters title/description
3. Taps "Add Image" button
4. Picks image from gallery/camera
5. Image auto-compressed if needed
6. Preview shown
7. User saves task
8. Task created with image stored in DB

### Flow 2: Add Drawing to Task
1. User taps "Create Task"
2. Enters title/description
3. Taps "Add Drawing" button
4. Drawing canvas opens (full screen modal)
5. User draws
6. Taps "Save" → returns to task form with preview
7. User saves task
8. Task created with drawing stored in DB

### Flow 3: Draw on Image
1. User taps "Create Task"
2. Enters title/description
3. Taps "Add Image" → picks image
4. Taps "Draw on Image" button (appears after image picked)
5. Canvas opens with image as background
6. User draws annotations
7. Taps "Save" → both image and drawing saved separately
8. Task shows image with drawing overlay

### Flow 4: View Task with Image/Drawing
1. User sees task in list with thumbnail
2. Taps task or thumbnail
3. Full-screen view opens
4. Image/drawing shown full size
5. Can zoom/pan (optional enhancement)
6. Can edit/remove (if in edit mode)

---

## API Examples

### Create Task with Image
```bash
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Design mockup",
  "description": "Review this screenshot",
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "image_type": "image/jpeg"
}
```

### Create Task with Drawing
```bash
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Diagram explanation",
  "drawing": "data:image/png;base64,iVBORw0KGgo...",
  "image_type": "image/png"
}
```

### Create Task with Both
```bash
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Annotated screenshot",
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "drawing": "data:image/png;base64,iVBORw0KGgo...",
  "image_type": "image/jpeg"
}
```

---

## Testing Checklist

### Backend:
- [ ] Can create task with image only
- [ ] Can create task with drawing only
- [ ] Can create task with both image and drawing
- [ ] Can update task to add/remove image
- [ ] Can update task to add/remove drawing
- [ ] Rejects images >200KB original size
- [ ] Database stores base64 correctly
- [ ] API returns image/drawing in task responses

### Frontend:
- [ ] Image picker opens and selects images
- [ ] Image compression works (stays under 200KB)
- [ ] Image preview shows correctly
- [ ] Drawing canvas opens and captures drawing
- [ ] Drawing saves and previews correctly
- [ ] Can draw on uploaded image
- [ ] Task list shows image/drawing thumbnails
- [ ] Full-screen image view works
- [ ] Can edit task to change/remove image/drawing
- [ ] Loading states show during upload
- [ ] Error messages show for oversized images

### Integration:
- [ ] End-to-end: create task with image via mobile
- [ ] End-to-end: create task with drawing via mobile
- [ ] End-to-end: draw on uploaded image
- [ ] Images persist across app restarts
- [ ] Images sync between devices (same user)

---

## Security Considerations

1. **Validation**: Always validate base64 format and size on backend
2. **MIME Types**: Only allow image/jpeg, image/png
3. **Injection**: Sanitize filenames if storing separately
4. **DoS Prevention**: Rate limit uploads, enforce size limits strictly
5. **Privacy**: Images are user-scoped (can only see own tasks)

---

## Performance Considerations

1. **Lazy Loading**: Only load images when visible (FlatList optimization)
2. **Thumbnails**: Consider generating smaller thumbnails for list view
3. **Caching**: Use Image component caching in React Native
4. **Database Indexing**: No index needed on TEXT columns
5. **Query Optimization**: Use SELECT without image/drawing for list views (add separate endpoint if needed)

---

## Future Enhancements (Out of Scope)

- [ ] Multiple images per task
- [ ] Drawing tools (shapes, text, colors)
- [ ] Image filters
- [ ] Video support
- [ ] Cloud storage migration (S3, Cloudinary)
- [ ] Image CDN
- [ ] Thumbnail generation
- [ ] Image editing (crop, rotate)
- [ ] Collaborative drawing

---

## Estimated Total Time: 6-8 hours

- Backend: 1-2 hours
- Frontend Image: 2 hours
- Frontend Drawing: 2 hours
- Drawing on Image: 1 hour
- Testing & Polish: 1-2 hours

---

## Success Criteria

✅ User can upload images to tasks (max 200KB)  
✅ User can create drawings on blank canvas  
✅ User can draw on uploaded images  
✅ Images and drawings stored as base64 in PostgreSQL  
✅ Task list shows thumbnails of images/drawings  
✅ Full-screen view for images/drawings  
✅ Can edit/remove images and drawings  
✅ All data persists across app restarts  
✅ Type checking passes (npx tsc --noEmit)  
✅ No breaking changes to existing functionality  

---

*Plan created: 2025-10-17*  
*Feature: Image Upload & Drawing for Tasks*  
*Estimated completion: 6-8 hours*
