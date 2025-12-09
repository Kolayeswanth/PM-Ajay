# Role and Responsibility Assignment Implementation

## Overview
This implementation adds role and responsibility assignment capabilities to the project assignment workflows in the PM-AJAY portal. It allows district admins to assign specific roles and responsibilities when assigning projects to implementing agencies, and implementing agencies to do the same when assigning to executing agencies.

## Changes Made

### 1. Database Migration
- Added new columns to the `work_orders` table:
  - `assigned_user_role` (TEXT): The role assigned to the user
  - `assigned_user_responsibilities` (TEXT[]): Array of responsibilities for the assigned user
  - `assigned_user_notes` (TEXT): Additional notes about the assignment

### 2. District Dashboard (AssignProjectsDistrict.jsx)
- Added form fields for role selection, responsibility checkboxes, and notes
- Added predefined roles for implementing agencies:
  - Project Coordinator
  - Financial Manager
  - Technical Lead
  - Implementation Manager
  - Quality Assurance Officer
  - Documentation Specialist
  - Monitoring Liaison
- Added predefined responsibilities for each role
- Updated the work order creation to include role and responsibility information
- Added display of role information in the assigned projects table

### 3. Department Dashboard (AssignProjects.jsx)
- Added form fields for role selection, responsibility checkboxes, and notes
- Added predefined roles for executing agencies:
  - Site Supervisor
  - Procurement Officer
  - Construction Manager
  - Field Engineer
  - Safety Officer
  - Progress Tracker
- Added predefined responsibilities for each role
- Updated the work order update to include role and responsibility information
- Added display of role information in the assigned projects table

### 4. New Component (RoleResponsibilityDisplay.jsx)
- Created a reusable component to display role and responsibility information
- Shows role, responsibilities, and notes in a formatted display

## Usage

### District Admin Assignment
1. Navigate to the District Dashboard
2. Go to the "Assign Projects to Implementing Agency" section
3. Select a project, implementing agency, and fill in the required fields
4. Select a role from the dropdown (e.g., "Project Coordinator")
5. Select relevant responsibilities from the checkboxes (e.g., "Project planning", "Timeline development")
6. Add any additional notes if needed
7. Click "Assign Project"

### Implementing Agency Assignment
1. Navigate to the Department Dashboard
2. Go to the "Assign Projects to Executing Agencies" section
3. Select a project and executing agency
4. Select a role from the dropdown (e.g., "Site Supervisor")
5. Select relevant responsibilities from the checkboxes (e.g., "Day-to-day site management", "Worker supervision")
6. Add any additional notes if needed
7. Click "Assign Project"

## Predefined Roles and Responsibilities

### Implementing Agency Roles
- **Project Coordinator**: Project planning, Timeline development, Stakeholder coordination
- **Financial Manager**: Budget management, Fund tracking, Financial reporting
- **Technical Lead**: Technical oversight, Quality standards compliance, Design review
- **Implementation Manager**: Execution oversight, Resource allocation, Milestone tracking
- **Quality Assurance Officer**: Quality control, Compliance monitoring, Inspections
- **Documentation Specialist**: Report preparation, Record keeping, Filing
- **Monitoring Liaison**: Communication with monitoring authorities, Progress reporting

### Executing Agency Roles
- **Site Supervisor**: Day-to-day site management, Worker supervision, Safety compliance
- **Procurement Officer**: Material procurement, Vendor management, Cost optimization
- **Construction Manager**: Construction oversight, Timeline adherence, Quality control
- **Field Engineer**: Technical implementation, Design adherence, Problem resolution
- **Safety Officer**: Safety protocols enforcement, Incident reporting, Compliance
- **Progress Tracker**: Work progress documentation, Milestone reporting, Photo documentation

## Implementation Details

### File Changes
1. `src/pages/dashboards/district/AssignProjectsDistrict.jsx` - Added role/responsibility fields and display
2. `src/pages/dashboards/department/AssignProjects.jsx` - Added role/responsibility fields and display
3. `src/components/RoleResponsibilityDisplay.jsx` - New component for displaying role/responsibility information
4. `backend/migrations/add_role_responsibility_fields.sql` - Database migration script

### Database Changes
- Added three new columns to the `work_orders` table
- Added index on `assigned_user_role` for better query performance

## Benefits
1. Clear accountability: Each assigned user has a clearly defined role and set of responsibilities
2. Transparency: Role and responsibility information is visible in project listings
3. Consistency: Predefined roles and responsibilities ensure consistent assignment practices
4. Flexibility: Additional notes field allows for customization and context
5. Audit trail: Full history of assignments with roles and responsibilities