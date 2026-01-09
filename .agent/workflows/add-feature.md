---
description: how to add a new feature
---

# Adding New Features Workflow

## Backend Feature (API Endpoint)

### 1. Create/Update Model (if needed)
Location: `server/models/`
- Define schema with Mongoose
- Add validation and defaults
- Export model

### 2. Create Controller
Location: `server/controllers/`
- Add business logic
- Handle errors properly
- Return appropriate status codes

### 3. Create Route
Location: `server/routes/`
- Define HTTP method (GET/POST/PUT/DELETE)
- Add authentication middleware if needed
- Link to controller function

### 4. Register Route in server.js
```javascript
app.use('/api/your-route', require('./routes/your.routes'));
```

### 5. Test with Postman/curl
// turbo
```bash
curl http://localhost:3000/api/your-route
```

## Frontend Feature (UI Component)

### 1. Create Component/Page
Location: `client/src/pages/` or `client/src/components/`
- Use functional components with hooks
- Import necessary dependencies

### 2. Add Route (if it's a page)
Location: `client/src/App.jsx`
```javascript
<Route path="/your-path" element={<YourPage />} />
```

### 3. Create API Call
Location: `client/src/utils/api.js` or in component
```javascript
const fetchData = async () => {
  const res = await api.get('/your-endpoint');
  return res.data;
};
```

### 4. Use TanStack Query (for data fetching)
```javascript
const { data, isLoading } = useQuery({
  queryKey: ['your-key'],
  queryFn: fetchData
});
```

### 5. Style with Tailwind CSS
Use utility classes for styling

## Example: Adding "Course Reviews" Feature

### Backend:
1. Create `Review.js` model
2. Create `review.controller.js`
3. Create `review.routes.js`
4. Register in `server.js`

### Frontend:
1. Create `ReviewForm.jsx` component
2. Create `ReviewList.jsx` component
3. Add to `CourseDetailsPage.jsx`
4. Create API functions in `api.js`

## Testing Checklist
- [ ] Backend endpoint works
- [ ] Frontend displays data correctly
- [ ] Error handling works
- [ ] Authentication works (if required)
- [ ] Database updates correctly
