# PM-AJAY Portal - Quick Start Guide

## 🚀 Getting Started

### Start the Portal
```bash
cd C:\Users\gayat\OneDrive\Desktop\SIH3
npm run dev
```

Then open your browser to: **http://localhost:5173**

## 🔐 Login Credentials (Demo)

The portal has 7 different user roles. Select any role from the dropdown on the login page:

| Role | What You'll See |
|------|----------------|
| **Ministry Admin (MoSJE)** | National dashboard with state-wise data, fund allocation, India map |
| **State Admin (SSWD)** | State-level dashboard (placeholder) |
| **District Admin** | District dashboard with GIS map, project table, GP approvals |
| **GP Officer** | Gram Panchayat interface (placeholder) |
| **Implementing Department** | Department work orders (placeholder) |
| **Executing Agency/Contractor** | Contractor portal (placeholder) |
| **Public/Beneficiary** | Public transparency view (placeholder) |

> **Note**: Email and password fields are pre-filled for demo purposes. Just select a role and click "Login to Dashboard".

## 🗺️ Testing the Maps

### India Map (Homepage & Ministry Dashboard)
1. **Hover** over states to see them highlight
2. **Click** on any state to see a popup with statistics
3. States are **color-coded** by project count:
   - 🟢 Green: 300+ projects
   - 🟠 Orange: 200-300 projects
   - 🔵 Blue: <200 projects

### District Map (District Dashboard)
1. Login as **District Admin**
2. Scroll to the "Project Locations (GIS View)" section
3. **Toggle** "Show Projects" checkbox to show/hide project markers
4. **Click** on colored markers to see project details:
   - 🟠 Orange: Adarsh Gram projects
   - 🟢 Green: GIA projects
   - 🔵 Blue: Hostel projects
5. Districts are **color-coded** by progress:
   - 🟢 Green: ≥70% complete
   - 🟠 Orange: 50-70% complete
   - 🔴 Red: <50% complete

## 📊 Key Features to Explore

### Ministry Admin Dashboard
- **National Statistics**: 6 stat cards showing key metrics
- **Project Status**: Breakdown of completed, ongoing, approved, proposed
- **Interactive Map**: Click states to explore
- **Fund Allocation Table**: See all states with progress bars
- **Pending Approvals**: Review and approve state annual plans
- **Quick Actions**: Manage admins, generate reports, send circulars

### District Admin Dashboard
- **District Overview**: 6 stat cards for Pune district
- **GIS Map**: Interactive map with project markers
- **GP Proposals**: Approve or reject proposals from Gram Panchayats
- **Projects Table**: Complete list with status, progress, and departments
- **Quick Actions**: Assign work, manage contractors, approve payments

## 🎨 Design Features

### Government Branding
- **Header**: Government of India emblem, Ministry logo, PM-AJAY logo
- **Colors**: Saffron, white, green, navy blue (Indian tricolor theme)
- **Typography**: Professional Inter and Roboto fonts
- **Bilingual**: Hindi/English toggle in header

### UI Components
- **Stat Cards**: Hover to see elevation effect
- **Tables**: Sortable columns with hover states
- **Buttons**: Primary (orange), Secondary (green), Accent (blue)
- **Badges**: Color-coded status indicators
- **Progress Bars**: Visual completion indicators
- **Notifications**: Bell icon with unread count

## 📱 Responsive Design

The portal works on:
- 💻 Desktop (1920x1080, 1366x768)
- 📱 Tablet (768px width)
- 📱 Mobile (responsive down to 375px)

## 🔄 Switching Roles

1. Click **Logout** in the top navigation
2. You'll be redirected to the login page
3. Select a different role from the dropdown
4. Click **Login to Dashboard**
5. Explore the new dashboard!

## 📂 Project Files

### Key Files to Explore
- `src/index.css` - Complete design system with all colors, typography, components
- `src/components/Header.jsx` - Government-standard header
- `src/components/maps/IndiaMap.jsx` - Interactive India map
- `src/components/maps/DistrictMap.jsx` - District-level map with projects
- `src/pages/dashboards/MinistryDashboard.jsx` - Full ministry dashboard
- `src/pages/dashboards/DistrictDashboard.jsx` - Full district dashboard
- `src/data/mockData.js` - All mock data for demonstration

### Generated Logos
- `public/logos/emblem.png` - Government of India emblem
- `public/logos/ministry.png` - Ministry of Social Justice & Empowerment logo
- `public/logos/pmajay.png` - PM-AJAY scheme logo

## 🛠️ Customization

### Change Colors
Edit `src/index.css` and modify the CSS custom properties:
```css
:root {
  --color-primary: #FF9933;  /* Saffron */
  --color-secondary: #138808; /* Green */
  --color-accent: #000080;   /* Navy Blue */
}
```

### Add More Mock Data
Edit `src/data/mockData.js`:
- Add more states to `states` array
- Add more projects to `mockProjects` array
- Add more notifications to `mockNotifications` array

### Modify Maps
Edit `src/data/geoData.js` to add more states or districts to the GeoJSON data.

## 🐛 Troubleshooting

### Map Not Loading?
- Check that Leaflet CSS is loaded in `index.html`
- Verify internet connection (maps use OpenStreetMap tiles)
- Check browser console for errors

### Logos Not Showing?
- Ensure logos are in `public/logos/` directory
- Check file names match: `emblem.png`, `ministry.png`, `pmajay.png`
- Clear browser cache and reload

### Styles Not Applied?
- Verify `src/index.css` is imported in `src/main.jsx`
- Check for CSS syntax errors
- Try hard refresh (Ctrl+F5)

## 📚 Next Steps

1. **Test All Features**: Explore both dashboards thoroughly
2. **Review Code**: Check component structure and design system
3. **Plan Backend**: Design API endpoints for data integration
4. **Complete Dashboards**: Implement remaining 5 role dashboards
5. **Add Workflows**: Build proposal submission, approval flows
6. **Deploy**: Set up staging environment for testing

## 💡 Tips

- **Use Chrome DevTools**: Inspect elements to see CSS classes
- **Check Console**: Look for any errors or warnings
- **Test Responsiveness**: Resize browser window to see mobile view
- **Explore Navigation**: Click all menu items to see routing
- **Read Comments**: Code is well-commented for understanding

## 📞 Need Help?

- Check `walkthrough.md` for detailed documentation
- Review `implementation_plan.md` for architecture details
- Examine component files for usage examples
- All mock data is in `src/data/mockData.js`

---

**Enjoy exploring the PM-AJAY Portal! 🎉**
