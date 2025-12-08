# 🎯 AI Photo Fraud Detection - Three-Way Percentage Analysis

## Overview
When you upload photos to the PM-AJAY portal, the AI now provides **three separate percentage scores** showing exactly how authentic, fake, or manipulated each image is.

---

## 📊 The Three Percentages Explained

### 1. ✅ **TRUE (Authentic) Percentage**
**What it means:** How likely this photo is a genuine, unedited camera photo

**High Score (60-100%):**
- Photo taken with real camera
- Has camera EXIF metadata
- Contains GPS location data
- Proper resolution and dimensions
- Natural pixel patterns
- Recent timestamp

**Example:** A contractor takes a photo at the construction site with their phone camera
- ✅ TRUE: **75%**
- 🤖 FAKE: **15%** 
- ✏️ MANIPULATED: **20%**

---

### 2. 🤖 **FAKE (AI-Generated) Percentage**
**What it means:** How likely this image was created by AI (like DALL-E, Midjourney, Stable Diffusion)

**High Score (60-100%):**
- Unusual pixel variance patterns
- No camera metadata
- No GPS data
- Perfect/artificial looking details
- Suspicious image characteristics

**Example:** Someone tries to upload an AI-generated image of a fake construction site
- ✅ TRUE: **20%**
- 🤖 FAKE: **85%** ← **HIGH! REJECTED**
- ✏️ MANIPULATED: **30%**

---

### 3. ✏️ **MANIPULATED (Edited) Percentage**
**What it means:** How likely this is a real photo that was edited, cropped, or taken as a screenshot

**High Score (60-100%):**
- Screenshot dimensions (1920x1080, etc.)
- Filename contains "screenshot"
- Missing GPS data
- Old timestamp (>30 days)
- Low resolution
- No camera metadata

**Example:** Someone uploads a screenshot of a photo instead of the original photo
- ✅ TRUE: **35%**
- 🤖 FAKE: **25%**
- ✏️ MANIPULATED: **80%** ← **HIGH! REJECTED**

---

## 🎨 Visual Display

When you upload a photo, you'll see:

```
┌─────────────────────────────────────────┐
│ 🔍 AI Detection Breakdown               │
├─────────────────────────────────────────┤
│                                         │
│ ✅ TRUE (Authentic)              75%    │
│ ████████████████░░░░░░░                 │
│                                         │
│ 🤖 FAKE (AI-Generated)           15%    │
│ ██░░░░░░░░░░░░░░░░░░░░░                 │
│                                         │
│ ✏️ MANIPULATED (Edited)          20%    │
│ ███░░░░░░░░░░░░░░░░░░░░                 │
└─────────────────────────────────────────┘
```

**Color Codes:**
- 🟢 **Green bars** = TRUE (good!)
- 🔴 **Red bars** = FAKE (bad!)
- 🟠 **Orange bars** = MANIPULATED (suspicious!)

---

## ⚖️ Decision Logic

The system automatically **accepts or rejects** photos based on these scores:

### ✅ **ACCEPTED - VERIFIED**
- TRUE ≥ 60% AND
- FAKE < 70% AND
- MANIPULATED < 70%

**Example:**
- TRUE: 75% ✅
- FAKE: 15%
- MANIPULATED: 25%
- **Result:** ✅ VERIFIED

### ⚠️ **ACCEPTED - WARNING**
- TRUE between 40-59% OR
- Minor concerns detected

**Example:**
- TRUE: 55% ⚠️
- FAKE: 30%
- MANIPULATED: 40%
- **Result:** ⚠️ WARNING - Review required

### ❌ **REJECTED**
- FAKE ≥ 70% OR
- MANIPULATED ≥ 70% OR
- TRUE < 40%

**Example 1 (AI Image):**
- TRUE: 20%
- FAKE: 85% ❌
- MANIPULATED: 30%
- **Result:** ❌ REJECTED - AI-generated

**Example 2 (Screenshot):**
- TRUE: 30%
- FAKE: 25%
- MANIPULATED: 75% ❌
- **Result:** ❌ REJECTED - Manipulated

---

## 🔍 What the AI Checks

| Check | Increases TRUE | Increases FAKE | Increases MANIPULATED |
|-------|----------------|----------------|----------------------|
| Camera metadata present | ✅ +30% | ❌ -25% | ❌ -10% |
| GPS location data | ✅ +25% | - | ❌ -15% |
| Recent timestamp | ✅ +10% | - | - |
| Normal dimensions | ✅ +15% | - | ❌ -10% |
| Natural pixel patterns | ✅ +20% | ❌ -20% | - |
| Not a screenshot | ✅ +15% | - | ❌ -15% |

---

## 📱 Real-World Examples

### Example 1: Perfect Authentic Photo
**Scenario:** Contractor uses phone camera at construction site with GPS on

**Scores:**
- ✅ TRUE: **90%** (has camera, GPS, recent, good quality)
- 🤖 FAKE: **10%** (clearly not AI)
- ✏️ MANIPULATED: **5%** (no edits detected)

**Verdict:** ✅ **VERIFIED** - Upload successful!

---

### Example 2: Downloaded Internet Photo
**Scenario:** Someone downloads a construction photo from Google

**Scores:**
- ✅ TRUE: **25%** (no metadata)
- 🤖 FAKE: **60%** (suspicious patterns)
- ✏️ MANIPULATED: **70%** (no GPS, edited metadata)

**Verdict:** ❌ **REJECTED** - Manipulated image detected!

---

### Example 3: Screenshot of Real Photo
**Scenario:** Contractor takes screenshot of a photo instead of uploading original

**Scores:**
- ✅ TRUE: **30%** (low score)
- 🤖 FAKE: **30%** (medium)
- ✏️ MANIPULATED: **85%** (screenshot detected!)

**Verdict:** ❌ **REJECTED** - Screenshot not allowed!

**Solution:** Upload the original photo file instead

---

### Example 4: AI-Generated Fake Site
**Scenario:** Fraudster tries to use DALL-E/Midjourney image

**Scores:**
- ✅ TRUE: **15%** (very low)
- 🤖 FAKE: **95%** (AI patterns detected!)
- ✏️ MANIPULATED: **50%** (clearly fake)

**Verdict:** ❌ **REJECTED** - AI-generated image!

**Alert:** System flags this for admin review

---

## 💡 Tips for Contractors

### ✅ To Get High TRUE Score:

1. **Use your phone camera directly**
   - Don't take screenshots
   - Don't download from internet

2. **Enable GPS/Location**
   - Settings → Camera → Location → ON
   - Required for site photo verification

3. **Take photos at the actual site**
   - AI can detect if location matches project area

4. **Upload recent photos**
   - Photos should be < 30 days old
   - Take new photos for each progress update

5. **Use original files**
   - Don't edit or crop
   - Don't apply filters
   - Upload the .jpg file directly from camera

---

## 🛠️ How It Works (Technical)

### Backend Analysis (AI Service)
```javascript
// Three separate scoring algorithms
let authenticScore = 50;    // Starts at 50
let aiGenScore = 50;        // Starts at 50
let manipulatedScore = 50;  // Starts at 50

// Camera metadata check
if (hasCameraEXIF) {
  authenticScore += 30;
  aiGenScore -= 25;
} else {
  authenticScore -= 25;
  aiGenScore += 20;
}

// Pixel pattern analysis
if (suspiciousPixelPatterns) {
  aiGenScore += 30;  // Strong AI indicator
  authenticScore -= 25;
}

// Screenshot detection
if (isScreenshot) {
  manipulatedScore += 25;
  authenticScore -= 30;
}

// Normalize to 0-100%
truePercent = clamp(authenticScore, 0, 100);
fakePercent = clamp(aiGenScore, 0, 100);
manipulatedPercent = clamp(manipulatedScore, 0, 100);
```

---

## 📊 System Dashboard (For Admins)

Admins can see statistics:
- Total photos analyzed today
- Average TRUE percentage: 68%
- Photos rejected: 12 (5%)
- Most common rejection: Screenshots (8 photos)
- AI-generated attempts: 4 photos

---

## 🚀 Testing the System

### Test 1: Upload Real Photo
1. Go to "Update Work Progress"
2. Upload photo from your phone camera
3. Wait 2-3 seconds for AI analysis
4. See three percentage bars
5. Should show: TRUE: 70%+, FAKE: 20%-, MANIPULATED: 25%-

### Test 2: Upload Screenshot
1. Take screenshot of a photo
2. Try to upload it
3. Should show: MANIPULATED: 75%+
4. Photo will be REJECTED

### Test 3: Upload AI Image
1. Generate image using AI tool
2. Try to upload it
3. Should show: FAKE: 80%+
4. Photo will be REJECTED

---

## 📞 Support

**If you see unexpected results:**
- Check that GPS is enabled on your camera
- Ensure you're uploading original photos, not screenshots
- Upload photos taken within last 30 days
- Use your phone's camera app, not third-party apps

**Contact support if:**
- Real photos are being rejected (TRUE > 60% but still rejected)
- System shows error message
- Percentages don't make sense

---

## 🎯 Success Metrics

**Good Upload (Allowed):**
```
✅ TRUE: 75%
🤖 FAKE: 15%
✏️ MANIPULATED: 20%
→ Overall Confidence: 72%
→ Status: VERIFIED ✅
```

**Suspicious Upload (Warning):**
```
⚠️ TRUE: 55%
🤖 FAKE: 30%
✏️ MANIPULATED: 45%
→ Overall Confidence: 55%
→ Status: WARNING ⚠️
```

**Bad Upload (Rejected):**
```
❌ TRUE: 25%
🤖 FAKE: 85%
✏️ MANIPULATED: 40%
→ Overall Confidence: 28%
→ Status: REJECTED ❌
```

---

**Last Updated:** December 5, 2025  
**Version:** 2.0.0 (Three-Way Percentage Analysis)  
**Status:** ✅ Production Ready
