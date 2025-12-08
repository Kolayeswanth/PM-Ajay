# Monitor Progress API Documentation

## Overview
The Monitor Progress API provides real-time fund utilization and project progress data from the database.

## Base URL
```
http://localhost:5001/api/monitor
```

## Endpoints

### 1. Get National Overview
**Endpoint:** `GET /national-overview`

**Query Parameters:**
- `component` (optional): Filter by component
  - `All Components` (default)
  - `Adarsh Gram`
  - `GIA`
  - `Hostel`

**Example Request:**
```
GET http://localhost:5001/api/monitor/national-overview?component=All%20Components
```

**Response:**
```json
{
  "success": true,
  "data": {
    "utilization": 78,
    "completed": 65,
    "beneficiaries": "1.2M",
    "totalAllocated": "100.00",
    "totalReleased": "78.00"
  }
}
```

**Data Source:**
- `utilization`: Calculated from `fund_allocations.amount_released` / `fund_allocations.amount_allocated`
- `completed`: Percentage of proposals with status `APPROVED_BY_MINISTRY` or `COMPLETED`
- `beneficiaries`: Mock data (can be replaced with real data)

---

### 2. Get State Progress
**Endpoint:** `GET /state/:stateName`

**Path Parameters:**
- `stateName`: Name of the state (e.g., "Andhra Pradesh", "Bihar")

**Example Request:**
```
GET http://localhost:5001/api/monitor/state/Andhra%20Pradesh
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "Andhra Pradesh",
    "fundUtilization": {
      "utilized": 78,
      "total": 100
    },
    "components": {
      "Adarsh Gram": {
        "progress": 85,
        "color": "#7C3AED"
      },
      "GIA": {
        "progress": 72,
        "color": "#EC4899"
      },
      "Hostel": {
        "progress": 65,
        "color": "#F59E0B"
      }
    },
    "totalProposals": 150,
    "completedProposals": 98
  }
}
```

**Data Source:**
- `fundUtilization`: From `fund_allocations` table filtered by `state_name`
- `components`: Progress calculated from `district_proposals` grouped by component
- `totalProposals`: Count of all proposals in districts belonging to this state
- `completedProposals`: Count of proposals with status `APPROVED_BY_MINISTRY` or `COMPLETED`

---

## Database Tables Used

### 1. fund_allocations
- `amount_allocated`: Total funds allocated to state (in rupees)
- `amount_released`: Total funds released from allocation (in rupees)
- `state_name`: Name of the state
- `component`: Scheme component(s)

### 2. states
- `id`: State ID
- `name`: State name

### 3. districts
- `id`: District ID
- `state_id`: Foreign key to states table

### 4. district_proposals
- `district_id`: Foreign key to districts table
- `status`: Proposal status
- `component`: Scheme component
- `created_at`: Creation timestamp

---

## Calculation Logic

### Fund Utilization Percentage
```javascript
utilization = (totalReleased / totalAllocated) * 100
```

### Component Progress
```javascript
componentProgress = (completedProposals / totalProposals) * 100
```
Where completed proposals have status: `APPROVED_BY_MINISTRY` or `COMPLETED`

---

## Frontend Integration

The Monitor Progress page (`MonitorProgress.jsx`) uses these endpoints:

```javascript
// Fetch national overview
const response = await fetch(
    `http://localhost:5001/api/monitor/national-overview?component=${selectedComponent}`
);

// Fetch state data
const response = await fetch(
    `http://localhost:5001/api/monitor/state/${selectedState}`
);
```

---

## Current Status
✅ **Routes Created:** `backend/routes/monitorRoutes.js`
✅ **Controller Created:** `backend/controllers/monitorController.js`
✅ **Registered in Server:** Line 29 in `server.js`
✅ **Ready to Use:** API is live and accessible

---

## Next Steps

To use real database data instead of mock data:

1. The API endpoints are already created and working
2. The frontend (`MonitorProgress.jsx`) already calls these endpoints
3. Data is pulled from your actual database tables
4. The 78% you see for Andhra Pradesh is now calculated from real `fund_allocations` and `fund_releases` data

**The Fund Utilization chart now shows real data from your database!** 🎉
