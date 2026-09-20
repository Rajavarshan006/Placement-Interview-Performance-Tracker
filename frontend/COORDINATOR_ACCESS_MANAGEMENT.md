# Coordinator Access Management - Frontend Implementation

## Overview

This frontend implementation provides the user interface for the **giveAccess()** and **removeAccess()** coordinator functions specified in the project UML.

**Team:** Team A - Recruitment Lifecycle Management  
**Module:** Coordinator Access Management  
**Implementation Type:** Frontend-only with mock data

---

## What This Feature Does

### giveAccess()
Allows a coordinator to **grant access** to a placed student. When access is granted:
1. The coordinator views the list of placed students
2. Identifies a student without access
3. Clicks "Give Access"
4. Confirms the action in a dialog
5. The student's access status changes to "Active"

### removeAccess()
Allows a coordinator to **revoke access** from a placed student. When access is removed:
1. The coordinator views the list of placed students
2. Identifies a student with active access
3. Clicks "Remove Access"
4. Confirms the action in a dialog
5. The student's access status changes to "No Access"

---

## Important Assumptions

### What "Access" Means
The UML defines `giveAccess()` and `removeAccess()` methods but does not specify what "access" represents in business terms.

**For this frontend prototype, we assume:**
- "Access" is a permission state associated with placed students
- Coordinators can toggle this state on or off
- The exact authorization rules will be defined by the backend team

**This is a temporary UI assumption** until the backend formally defines the access control business logic.

### Why Mock Data?
- The backend API endpoints for access management do not exist yet
- This frontend demonstrates the complete UI workflow
- Mock data simulates realistic async operations (network delays, success/failure)
- The service layer is designed to easily swap mock implementations with real API calls

---

## Technical Architecture

### Technology Stack
- **Framework:** React 19
- **Build Tool:** Vite 8
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Testing:** Vitest + React Testing Library
- **State Management:** React hooks (useState, useEffect, useMemo)

### Project Structure
```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── AccessTable.tsx      # Student list table
│   │   ├── ConfirmDialog.tsx    # Confirmation modal
│   │   └── Toast.tsx            # Success/error notifications
│   ├── pages/
│   │   └── AccessManagement.tsx # Main coordinator page
│   ├── services/
│   │   └── coordinatorService.ts # Data access layer (mock)
│   ├── data/
│   │   └── mockPlacedStudents.ts # Mock student data
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   └── test/
│       ├── setup.ts
│       └── AccessManagement.test.tsx
```

### Service Layer Abstraction

The application uses a **service layer** to abstract data access:

**Current Implementation (Mock):**
```typescript
// coordinatorService.ts
export const giveAccess = async (coordinatorId, studentId) => {
  // Mock: Update in-memory state
  studentsState = studentsState.map(s => 
    s.studentId === studentId 
      ? { ...s, accessStatus: 'ACTIVE' } 
      : s
  );
  return { success: true, message: '...' };
};
```

**Future Implementation (Real API):**
```typescript
export const giveAccess = async (coordinatorId, studentId) => {
  const response = await fetch(
    `/api/coordinator/${coordinatorId}/access/${studentId}`,
    { method: 'POST' }
  );
  return response.json();
};
```

**Why This Matters:**
- UI components call `coordinatorService.giveAccess()`
- They don't know if it's mock or real
- Backend team can replace the service implementation without touching any UI code
- Makes testing much easier

---

## How React State Changes

When a user grants or removes access, here's what happens:

### State Flow (Give Access Example)

1. **Initial State:** 
   - Student has `accessStatus: 'NO_ACCESS'`
   - UI shows "Give Access" button

2. **User Clicks "Give Access":**
   - Component state: `confirmDialog.isOpen = true`
   - Modal appears

3. **User Clicks "Confirm":**
   - Component state: `isProcessing = true`
   - Button becomes disabled
   - Service call: `await giveAccess(coordinatorId, studentId)`

4. **Service Returns Success:**
   - Component reloads student data: `await getPlacedStudents()`
   - New student data has `accessStatus: 'ACTIVE'`
   - React re-renders table
   - UI now shows "Remove Access" button
   - Toast notification appears

5. **Final State:**
   - `isProcessing = false`
   - `confirmDialog.isOpen = false`
   - Student visible with "Active" badge

**Key React Concepts Used:**
- `useState` - Managing local component state
- `useEffect` - Loading data on component mount
- `useMemo` - Optimizing search/filter calculations
- Controlled components - Input fields controlled by React state

---

## Backend Integration Points

### API Endpoints (To Be Implemented)

The frontend expects these endpoints:

**1. Get Placed Students**
```
GET /api/coordinator/{coordinatorId}/placed-students

Response:
[
  {
    studentId: string,
    name: string,
    registerNumber: string,
    department: string,
    placedCompany: string,
    rolePlaced: string,
    packageLpa: number,
    accessStatus: 'ACTIVE' | 'NO_ACCESS'
  },
  ...
]
```

**2. Give Access**
```
POST /api/coordinator/{coordinatorId}/access/{studentId}

Response:
{
  success: boolean,
  message: string,
  studentId?: string
}
```

**3. Remove Access**
```
DELETE /api/coordinator/{coordinatorId}/access/{studentId}

Response:
{
  success: boolean,
  message: string,
  studentId?: string
}
```

### Integration Steps

To connect real backend:

1. **Update coordinatorService.ts:**
   - Replace mock implementations with `fetch()` calls
   - Add error handling for network failures
   - Add authentication headers if needed

2. **Add Environment Config:**
   - Create `.env` file with API base URL
   - Update Vite config to expose env variables

3. **Handle Authentication:**
   - Add auth context/provider
   - Store coordinator ID from login
   - Include auth token in API requests

---

## Security Considerations

### Frontend is NOT Security

**Critical Understanding:** 
- Hiding/disabling buttons does NOT provide real authorization
- Frontend code can be bypassed by anyone with browser dev tools
- Access state changes in our mock data have no security value

### What the Backend Must Do

The backend MUST enforce:

1. **Authentication:** Verify coordinator identity
2. **Authorization:** Check if coordinator has permission
3. **Validation:** Validate student IDs and access states
4. **Audit Trail:** Log who changed what and when
5. **Least Privilege:** Only allow necessary operations

**Example Backend Validation:**
```python
@require_authentication
@require_role("coordinator")
def give_access(coordinator_id, student_id):
    # Verify coordinator_id matches authenticated user
    # Check if student exists and is placed
    # Check if coordinator has permission for this student
    # Update database
    # Log the change
    pass
```

Our frontend confirmation dialog is for **UX only** - not security.

---

## Testing

### Test Suite

We use **Vitest** and **React Testing Library** to test:

1. ✅ Page renders correctly
2. ✅ Students display after loading
3. ✅ "Give Access" button shows for students without access
4. ✅ "Remove Access" button shows for students with access
5. ✅ Confirmation dialog opens on button click
6. ✅ Cancel button closes dialog without changes
7. ✅ Confirm button calls service and updates UI
8. ✅ Search filter works
9. ✅ Department filter works
10. ✅ Empty state displays when no students
11. ✅ Error toast shows on service failure
12. ✅ Success toast shows on successful operation

### Running Tests

```bash
# Run once
npm test

# Watch mode (re-runs on file changes)
npm run test:watch

# UI mode (visual test runner)
npm run test:ui
```

**All 12 tests pass** ✓

---

## Development

### Setup
```bash
cd frontend
npm install
```

### Run Development Server
```bash
npm run dev
```
Runs at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Type Check
```bash
npm run build  # Runs tsc -b first
```

---

## What I Can Explain in Viva

### Simple Explanations

**Q: What does giveAccess do?**
> It's a button that lets the coordinator grant permission to a placed student. When clicked, it opens a confirmation dialog, and if confirmed, changes the student's access status to Active.

**Q: Why did you use mock data?**
> The backend API doesn't exist yet. Mock data lets us build and test the complete UI workflow. The service layer design means we can easily replace mock functions with real API calls without changing any UI code.

**Q: How does confirmation work?**
> When you click Give Access or Remove Access, a modal dialog appears asking you to confirm. If you click Cancel, nothing happens. If you click Confirm, it calls the service function to update the access state, then shows a success message.

**Q: Why is this Team A's responsibility?**
> Team A handles Recruitment Lifecycle Management - tracking students through placement stages, managing coordinator dashboards, and access control for placed students. Team B focuses on analytics and intervention.

**Q: How would you connect the real backend?**
> Open coordinatorService.ts, find the giveAccess function, and replace the mock logic with a fetch() call to the backend API endpoint. Same for removeAccess and getPlacedStudents.

**Q: Why frontend buttons aren't security?**
> JavaScript runs in the browser which users control. They can use dev tools to bypass buttons, change network requests, or modify data. Real security must be on the server - the backend validates every request with authentication and authorization.

---

## Files Created

### Core Implementation
- `src/pages/AccessManagement.tsx` - Main coordinator page (230 lines)
- `src/components/AccessTable.tsx` - Student table component (145 lines)
- `src/components/ConfirmDialog.tsx` - Reusable confirmation modal (80 lines)
- `src/components/Toast.tsx` - Notification component (60 lines)
- `src/services/coordinatorService.ts` - Data access service layer (140 lines)
- `src/data/mockPlacedStudents.ts` - Mock student data (60 lines)
- `src/types/index.ts` - TypeScript type definitions (25 lines)

### Testing
- `src/test/setup.ts` - Test configuration
- `src/test/AccessManagement.test.tsx` - Test suite (295 lines, 12 tests)

### Configuration
- `vite.config.ts` - Build and test configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `tsconfig.app.json` - TypeScript configuration
- `package.json` - Dependencies and scripts

---

## Next Steps

### For Backend Team
1. Define the exact business logic for "access"
2. Create the three API endpoints listed above
3. Implement authentication and authorization
4. Add database tables/models for access management
5. Provide API documentation

### For Integration
1. Add `.env` with backend URL
2. Update coordinatorService.ts with real API calls
3. Add authentication context
4. Test with real backend
5. Handle backend-specific error codes

### For Future Enhancement
1. Add pagination for large student lists
2. Add bulk operations (grant access to multiple students)
3. Add access history/audit log view
4. Add email notifications when access is granted/removed
5. Add role-based coordinator permissions

---

## Conclusion

This implementation provides a complete, tested, and well-structured frontend for coordinator access management. The service layer abstraction makes backend integration straightforward, and the component-based architecture ensures maintainability.

**Ready for:**
- Technical viva defense
- Integration with backend APIs
- Future feature additions
- Production deployment (after backend integration)
