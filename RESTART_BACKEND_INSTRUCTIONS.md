# 🔄 RESTART BACKEND TO ENABLE THREE-WAY PERCENTAGE SYSTEM

## ⚠️ IMPORTANT: You need to restart the backend server!

The AI detection code was updated, but your backend server is still running the OLD code.

---

## 🚀 Quick Restart Steps:

### Step 1: Stop the Backend Server
In your terminal where `npm run dev` is running (backend folder):
1. Press **Ctrl + C** to stop the server
2. Wait for it to fully stop

### Step 2: Restart the Backend
```powershell
cd c:\Users\HPWOW\Desktop\PM-Ajay-1\backend
npm run dev
```

### Step 3: Verify Backend is Running
You should see:
```
Server is running on port 5001
- Auth Routes loaded at /api/auth
- Notification Routes loaded at /api/notifications
- Fund Routes loaded at /api/funds
```

---

## ✅ After Restart, Test Again:

1. **Go to:** http://localhost:5173
2. **Login** as contractor
3. **Navigate to:** Update Work Progress
4. **Upload a photo**

**NOW you should see:**
```
🔍 AI Detection Breakdown

✅ TRUE (Authentic)         XX%
████████████░░░░░░

🤖 FAKE (AI-Generated)      XX%
████░░░░░░░░░░░░

✏️ MANIPULATED (Edited)     XX%
█████░░░░░░░░░░░
```

---

## 🐛 If You Still Don't See the Percentages:

### Check 1: Backend Running?
Open: http://localhost:5001/api/health

Should show:
```json
{
  "status": "ok",
  "message": "Backend is running correctly..."
}
```

### Check 2: Frontend Console
1. Press **F12** in browser
2. Go to **Console** tab
3. Upload a photo
4. Look for errors in red

### Check 3: Network Tab
1. Press **F12** in browser
2. Go to **Network** tab
3. Upload a photo
4. Look for `/api/verify-image/multiple` request
5. Check if it returns the percentages in response

---

## 📞 Common Issues:

### "Port 5001 is already in use"
**Solution:** Kill all Node processes first:
```powershell
Get-Process node | Stop-Process -Force
```
Then restart backend.

### "Cannot find module 'sharp'"
**Solution:** Install sharp:
```powershell
cd c:\Users\HPWOW\Desktop\PM-Ajay-1\backend
npm install sharp
```

### "Photos upload but no percentages"
**Solution:** 
1. Check browser console (F12)
2. Look for error messages
3. Verify backend API is being called
4. Check if response has `percentages` object

---

## ✅ Expected Behavior After Restart:

**When you upload a photo, you should see:**

1. **Loading state:**
   ```
   🔍 AI Verification in Progress...
   Analyzing image authenticity
   ```

2. **Three percentage bars appear:**
   - Green bar for TRUE (Authentic)
   - Red bar for FAKE (AI-Generated)
   - Orange bar for MANIPULATED (Edited)

3. **Detailed result card with:**
   - All three percentages
   - Overall confidence
   - Verdict (VERIFIED/WARNING/REJECTED)
   - Warnings list
   - Metadata info

---

## 🎯 Quick Test After Restart:

Upload these types of photos to test:

**Test 1: Real phone photo**
- Expected: TRUE 60-80%, FAKE 15-30%, MANIPULATED 20-30%
- Result: Should be VERIFIED ✅

**Test 2: Screenshot**
- Expected: TRUE 20-30%, FAKE 30-40%, MANIPULATED 80-90%
- Result: Should be REJECTED ❌

**Test 3: Downloaded image**
- Expected: TRUE 25-35%, FAKE 40-60%, MANIPULATED 60-75%
- Result: Should be REJECTED or WARNING

---

## 💡 Pro Tip:

After making ANY code changes to the backend, ALWAYS restart the server:
1. Ctrl + C (stop)
2. npm run dev (restart)

This ensures the new code is loaded!

---

**Ready? Restart your backend server now and test again!** 🚀
