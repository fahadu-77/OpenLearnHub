---
description: how to debug common issues
---

# Debugging Workflow

## Backend Issues

### Server Won't Start
1. Check if port 3000 is already in use
// turbo
```bash
lsof -ti:3000 | xargs kill -9
```

2. Verify `.env` file exists and has correct values
3. Check MongoDB connection string
4. Look for syntax errors in terminal

### Database Connection Failed
1. Verify MongoDB is running (local) or Atlas connection string is correct
2. Check network/firewall settings
3. Verify IP whitelist in MongoDB Atlas
4. Test connection:
```bash
node -e "require('mongoose').connect(process.env.MONGO_URI).then(() => console.log('Connected')).catch(e => console.log(e))"
```

### API Returns 500 Error
1. Check server terminal for error logs
2. Verify request body/params match controller expectations
3. Check database schema matches data being saved
4. Add console.log() in controller to debug

## Frontend Issues

### Page Shows Blank/White Screen
1. Open browser console (F12) for errors
2. Check if API base URL is correct in `api.js`
3. Verify backend is running
4. Check React component syntax errors

### API Calls Failing (401/403)
1. Check if user is logged in
2. Verify token is being sent in headers
3. Check token expiration
4. Verify auth middleware on backend

### Styles Not Applying
1. Verify Tailwind CSS is installed
2. Check `tailwind.config.js` content paths
3. Restart dev server
// turbo
```bash
npm run dev
```

### File Upload Not Working
1. Check `multer` is installed on backend
2. Verify `uploads/` folder exists
3. Check file size limits
4. Verify `multipart/form-data` header is set

## Common Error Messages

### "Cannot find module"
- Run `npm install` in the correct directory

### "Port already in use"
- Kill the process or change port in `.env`

### "MongooseError: Operation buffering timed out"
- MongoDB connection failed, check connection string

### "JWT malformed"
- Token is invalid, user needs to login again

## Debugging Tools

### Backend
- Use `console.log()` liberally
- Check terminal output
- Use Postman to test API endpoints

### Frontend
- Browser DevTools (F12)
- React DevTools extension
- Network tab to see API calls
- Console for errors

## Quick Fixes

### Clear Everything and Restart
```bash
# Backend
cd server
rm -rf node_modules
npm install
npm start

# Frontend
cd client
rm -rf node_modules
npm install
npm run dev
```

### Reset Database (if needed)
- Delete all collections in MongoDB
- Re-run the app to create fresh data
