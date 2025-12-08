# Quick Start Guide - Ministry Dashboard Mobile App

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- Expo CLI installed (`npm install -g expo-cli`)
- Expo Go app on your phone (iOS/Android)

### Installation

1. **Navigate to mobile app directory**
   ```bash
   cd mobile-app
   ```

2. **Install dependencies** (if not already done)
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   expo start
   ```

4. **Run on your device**
   - Scan QR code with Expo Go app (Android)
   - Scan QR code with Camera app (iOS)

## 📱 Testing the Ministry Dashboard

### Step 1: Login
Use these credentials to access the Ministry Dashboard:

**Test Accounts:**
- **Email**: ministry@pmajay.gov.in
- **Password**: PMajay@2024#Demo

Or use any state admin credentials from the web version.

### Step 2: Explore Features

#### 🏠 Dashboard Panel (Default View)
- View national statistics
- See project status overview
- Check recent activities
- View top performing states
- Use quick action buttons

#### 👥 Manage State Admins
1. Tap sidebar menu (☰) or bottom navigation
2. Select "Manage State Admins"
3. **Add New Admin:**
   - Tap "+ Add Admin" button
   - Fill in details (name, email, phone, state)
   - System auto-generates username and password
   - Save and view credentials
4. **Edit Admin:**
   - Tap "✏️ Edit" on any admin card
   - Update information
   - Save changes
5. **Toggle Status:**
   - Tap "🚫 Deactivate" or "✅ Activate"
   - Confirm action

#### 💰 Fund Allocation
1. Navigate to "Fund Allocation"
2. **Allocate New Fund:**
   - Tap "+ Allocate Fund" button
   - Select State/UT from picker
   - Choose components (tap to select multiple)
   - Enter amount in Crores
   - Enter Officer ID
   - Enter allocator details (name, phone)
   - Tap "Allocate & Notify"
   - View success message with WhatsApp notification confirmation
3. View allocation history below

#### 💸 Fund Released
1. Navigate to "Fund Released"
2. View all released funds
3. **Filter by component:**
   - Tap filter chips (All, Adarsh Gram, GIA, Hostel)
4. View release details:
   - State name
   - Amount
   - Installment number
   - Release date

#### 📈 Monitor Progress
1. Navigate to "Monitor Progress"
2. View KPIs:
   - Fund Utilization
   - Project Completion
   - Beneficiaries
3. Check region-wise performance
4. See top performing states ranking

#### 📢 Issue Notifications
1. Navigate to "Notifications"
2. **Create New Notification:**
   - Tap "+ Create Notification"
   - Enter title and message
   - Select audience (All States or specific state)
   - Choose priority level (High/Medium/Low)
   - Optionally schedule for future date
   - Tap "Send Now" or "Schedule"
3. View notification history

#### 📑 Reports & Analytics
1. Navigate to "Reports & Analytics"
2. View available reports
3. **Download Report:**
   - Tap "📥 Download" on any report
   - View download confirmation
4. Use quick actions:
   - Generate custom report
   - Export all
   - Schedule report
   - Email reports

## 🎯 Navigation Tips

### Bottom Navigation Bar
Quick access to 5 main features:
1. 📊 Dashboard
2. 👥 Manage (State Admins)
3. 💰 Fund (Allocation)
4. 💸 Fund Released  
5. 📈 Monitor

### Sidebar Menu
Tap ☰ in header to open full menu:
- All features listed
- Shows active section highlight
- User profile at top
- Scroll for more options

### Header Actions
- **☰ Menu**: Open/close sidebar
- **Ministry Dashboard**: Current section name
- **🚪 Logout**: Sign out

## 🔧 Common Actions

### Search & Filter
- Use search bar in State Admins
- Use filter chips in Fund Released
- Results update in real-time

### Add/Edit Forms
- All forms have validation
- Required fields marked with *
- Error messages shown inline
- Success confirmation after save

### Modals
- Tap outside to close (or Cancel button)
- Scroll for long content
- Use pickers for selection lists

## ⚡ Performance Tips

1. **Smooth Scrolling**: Lists are optimized
2. **Quick Actions**: Use bottom nav for speed
3. **Offline Ready**: Data persists in AsyncStorage
4. **Fast Load**: Components load on demand

## 🐛 Troubleshooting

### Issue: App won't start
**Solution**: 
```bash
cd mobile-app
rm -rf node_modules
npm install
expo start --clear
```

### Issue: Login not working
**Solution**: 
- Check if backend server is running (if connected)
- Verify credentials
- Check AsyncStorage permissions

### Issue: Sidebar not showing
**Solution**: 
- Tap ☰ menu icon in header
- Ensure screen is in portrait mode

### Issue: Modal stuck open
**Solution**: 
- Tap outside modal area
- Use Cancel/Close button
- Restart app if needed

## 📊 Test Data

The app comes with pre-loaded test data:
- 3 State Admins (Maharashtra, Karnataka, Gujarat)
- Sample fund allocations
- Sample fund releases
- Sample notifications
- Mock reports

You can add more or modify existing data through the UI.

## 🔐 Security Notes

- Login tokens stored securely in AsyncStorage
- Role-based access enforced
- All forms have input validation
- Sensitive data (passwords) masked in UI

## 📱 Device Compatibility

**Tested On:**
- iPhone (iOS 13+)
- Android phones (8.0+)
- Tablets supported
- Expo Go app

**Screen Sizes:**
- Small phones (iPhone SE): Optimized
- Standard phones: Perfect
- Large phones/Tablets: Adaptive

## 🎨 UI Features

- **Colors**: Government of India theme (Saffron, White, Green)
- **Fonts**: System default, readable sizes
- **Icons**: Emoji-based (universal compatibility)
- **Animations**: Smooth transitions
- **Feedback**: Visual confirmation for actions

## 📈 Next Steps

1. **Explore all features** listed above
2. **Test different roles** (change role in DB)
3. **Add custom data** through forms
4. **Check reports** for insights
5. **Test notifications** feature

## 💡 Pro Tips

1. **Quick Navigation**: Use bottom bar for common tasks
2. **Bulk Actions**: Open sidebar for complete feature list
3. **Data Export**: Use Reports section to export data
4. **Search First**: Use search before scrolling long lists
5. **Save Time**: Recent activities show latest updates

## 🆘 Need Help?

1. Check `MINISTRY_DASHBOARD_IMPLEMENTATION.md` for details
2. Review code comments in source files
3. Check Expo documentation: https://docs.expo.dev
4. React Native docs: https://reactnative.dev

## ✅ Verification Checklist

Test these features to verify everything works:

- [ ] Login successfully
- [ ] View dashboard statistics
- [ ] Add a new state admin
- [ ] Edit an existing admin
- [ ] Allocate fund to a state
- [ ] View fund releases
- [ ] Check progress metrics
- [ ] Create a notification
- [ ] Download a report
- [ ] Navigate between sections smoothly
- [ ] Logout and login again

## 🎉 Success!

If you completed the checklist, your Ministry Dashboard is fully functional!

---

**Happy Testing! 🚀**

**Questions?** Review the documentation or check the source code comments.
