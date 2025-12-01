# Ministry Dashboard - Interactive Button Implementation Guide

## Overview
This guide shows how to replace all standard buttons with the new InteractiveButton component across all Ministry Dashboard pages.

## Button Variants and Their Use Cases

### 1. **Primary (Saffron/Orange)** - `variant="primary"` or `variant="saffron"`
- Used for: Main actions, Create, Add, Approve, Submit, Confirm
- Examples: "+ Add Allocation", "Approve", "Create Notification", "Submit"

### 2. **Success (Green)** - `variant="success"`
- Used for: Positive confirmations, success actions
- Examples: "Confirm", "Save", "Release Funds"

### 3. **Danger (Red)** - `variant="danger"`
- Used for: Destructive actions, rejections
- Examples: "Reject", "Delete", "Deactivate", "Remove"

### 4. **Info (Blue)** - `variant="info"`
- Used for: View actions, informational buttons
- Examples: "View", "View Details", "Export Report"

### 5. **Warning (Amber)** - `variant="warning"`
- Used for: Warning actions, caution needed
- Examples: "Pending Review", "Needs Attention"

### 6. **Secondary (Gray)** - `variant="secondary"`
- Used for: Cancel, secondary actions
- Examples: "Cancel", "Close", "Back"

## Import Statement
Add this to the top of each Ministry page file:
```jsx
import InteractiveButton from '../../../components/InteractiveButton';
```

## Replacement Examples

### Example 1: "+ Add Allocation" Button (FundAllocation.jsx)
**Before:**
```jsx
<button className="btn btn-outline btn-outline-static" onClick={openAddAllocation}>
    + Add Allocation
</button>
```

**After:**
```jsx
<InteractiveButton variant="saffron" onClick={openAddAllocation}>
    + Add Allocation
</InteractiveButton>
```

### Example 2: "View" Button (AnnualPlansApproval.jsx)
**Before:**
```jsx
<button className="btn btn-secondary btn-sm" onClick={() => handleViewPDF(plan)}>
    View
</button>
```

**After:**
```jsx
<InteractiveButton variant="info" size="sm" onClick={() => handleViewPDF(plan)}>
    View
</InteractiveButton>
```

### Example 3: "Approve" Button (AnnualPlansApproval.jsx)
**Before:**
```jsx
<button className="btn btn-primary btn-sm" onClick={() => handleApproveClick(plan)}>
    Approve
</button>
```

**After:**
```jsx
<InteractiveButton variant="success" size="sm" onClick={() => handleApproveClick(plan)}>
    Approve
</InteractiveButton>
```

### Example 4: "Reject" Button (AnnualPlansApproval.jsx)
**Before:**
```jsx
<button className="btn btn-error btn-sm" onClick={() => handleRejectClick(plan)}>
    Reject
</button>
```

**After:**
```jsx
<InteractiveButton variant="danger" size="sm" onClick={() => handleRejectClick(plan)}>
    Reject
</InteractiveButton>
```

### Example 5: "Cancel" Button
**Before:**
```jsx
<button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
    Cancel
</button>
```

**After:**
```jsx
<InteractiveButton variant="secondary" onClick={() => setIsModalOpen(false)}>
    Cancel
</InteractiveButton>
```

### Example 6: Export Button with Icon
**Before:**
```jsx
<button className="btn btn-primary btn-sm" onClick={handleExportPDF}>
    <svg>...</svg>
    Export Report
</button>
```

**After:**
```jsx
<InteractiveButton variant="info" size="sm" onClick={handleExportPDF}>
    <svg>...</svg>
    Export Report
</InteractiveButton>
```

## Size Options
- `size="sm"` - Small buttons (for table actions, compact layouts)
- `size="md"` - Medium buttons (default, most common)
- `size="lg"` - Large buttons (prominent actions)

## Pages to Update

### ✅ AnnualPlansApproval.jsx
- View buttons → `variant="info"`
- Approve buttons → `variant="success"`
- Reject buttons → `variant="danger"`
- Cancel buttons → `variant="secondary"`
- Confirm Approve → `variant="success"`

### ✅ DashboardPanel.jsx
- Export Map Data → `variant="info"`
- View Details → `variant="info"`

### ✅ FundAllocation.jsx
- + Add Allocation → `variant="saffron"` (DONE)
- Submit → `variant="primary"`

### ✅ FundReleased.jsx
- + Release Funds → `variant="success"`
- Submit → `variant="success"`

### ✅ HelpSupport.jsx
- Submit Ticket → `variant="primary"`

### ✅ IssueNotifications.jsx
- + Create New Notification → `variant="primary"`
- View → `variant="info"`
- Deactivate → `variant="danger"`
- Create → `variant="primary"`

### ✅ ManageStateAdmins.jsx
- + Add Admin → `variant="primary"`
- View → `variant="info"`
- Save → `variant="success"`

### ✅ ReportsAnalytics.jsx
- Export Report → `variant="info"` (keep the icon)

## Interactive States

All InteractiveButton components automatically include:

1. **Normal State**: Base color from variant
2. **Hover State**: Darker shade of base color
3. **Active/Focus State**: Circular ring effect (4px glow)
4. **Disabled State**: 50% opacity, no-cursor

## Special Cases

### Buttons with Custom Styles
If a button has custom styles, pass them via the `style` prop:
```jsx
<InteractiveButton 
    variant="primary" 
    style={{ width: '100%', marginTop: 10 }}
    onClick={handleSubmit}
>
    Submit
</InteractiveButton>
```

### Buttons with Additional Classes
```jsx
<InteractiveButton 
    variant="info"
    className="custom-class"
    onClick={handleClick}
>
    Click Me
</InteractiveButton>
```

## Testing Checklist
- [ ] Normal state shows correct color
- [ ] Hover state darkens color
- [ ] Click/active state shows circular ring
- [ ] Focus state (tab key) shows circular ring
- [ ] All icons display correctly
- [ ] Button sizes are appropriate
- [ ] Disabled state works correctly
