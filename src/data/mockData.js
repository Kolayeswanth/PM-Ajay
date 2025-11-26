// Mock data for PM-AJAY Portal

export const states = [
    { id: 1, name: 'Maharashtra', code: 'MH', districts: 36, projects: 245, fundAllocated: 15000000000 },
    { id: 2, name: 'Uttar Pradesh', code: 'UP', districts: 75, projects: 420, fundAllocated: 25000000000 },
    { id: 3, name: 'Karnataka', code: 'KA', districts: 31, projects: 189, fundAllocated: 12000000000 },
    { id: 4, name: 'Tamil Nadu', code: 'TN', districts: 38, projects: 210, fundAllocated: 13500000000 },
    { id: 5, name: 'Gujarat', code: 'GJ', districts: 33, projects: 198, fundAllocated: 11000000000 },
    { id: 6, name: 'Rajasthan', code: 'RJ', districts: 33, projects: 175, fundAllocated: 10500000000 },
    { id: 7, name: 'West Bengal', code: 'WB', districts: 23, projects: 156, fundAllocated: 9500000000 },
    { id: 8, name: 'Madhya Pradesh', code: 'MP', districts: 52, projects: 234, fundAllocated: 14000000000 },
    { id: 9, name: 'Telangana', code: 'TG', districts: 33, projects: 145, fundAllocated: 8500000000 },
    { id: 10, name: 'Andhra Pradesh', code: 'AP', districts: 26, projects: 167, fundAllocated: 9200000000 },
    { id: 11, name: 'Kerala', code: 'KL', districts: 14, projects: 112, fundAllocated: 7800000000 },
    { id: 12, name: 'Odisha', code: 'OD', districts: 30, projects: 134, fundAllocated: 8100000000 },
    { id: 13, name: 'Uttarakhand', code: 'UK', districts: 13, projects: 89, fundAllocated: 4500000000 },
    { id: 14, name: 'Bihar', code: 'BR', districts: 38, projects: 210, fundAllocated: 11500000000 },
    { id: 15, name: 'Jharkhand', code: 'JH', districts: 24, projects: 98, fundAllocated: 5600000000 },
    { id: 16, name: 'Chhattisgarh', code: 'CG', districts: 33, projects: 105, fundAllocated: 6200000000 },
    { id: 17, name: 'Haryana', code: 'HR', districts: 22, projects: 123, fundAllocated: 7100000000 },
    { id: 18, name: 'Punjab', code: 'PB', districts: 23, projects: 145, fundAllocated: 8900000000 }
];

export const districts = {
    Maharashtra: [
        { id: 1, name: 'Pune', projects: 45, fundAllocated: 850000000, progress: 68 },
        { id: 2, name: 'Mumbai', projects: 38, fundAllocated: 920000000, progress: 72 },
        { id: 3, name: 'Nagpur', projects: 32, fundAllocated: 680000000, progress: 55 },
        { id: 4, name: 'Nashik', projects: 28, fundAllocated: 590000000, progress: 61 },
        { id: 5, name: 'Aurangabad', projects: 25, fundAllocated: 520000000, progress: 58 }
    ]
};

export const schemeComponents = [
    { id: 1, name: 'Adarsh Gram', code: 'AG', color: '#FF9933', icon: '🏘️' },
    { id: 2, name: 'GIA (Grant-in-Aid)', code: 'GIA', color: '#138808', icon: '💰' },
    { id: 3, name: 'Hostel', code: 'HOSTEL', color: '#000080', icon: '🏫' }
];

export const projectStatuses = [
    { id: 1, name: 'Proposed', code: 'PROPOSED', color: '#9CA3AF', icon: '📝' },
    { id: 2, name: 'Approved', code: 'APPROVED', color: '#3B82F6', icon: '✅' },
    { id: 3, name: 'Ongoing', code: 'ONGOING', color: '#F59E0B', icon: '🚧' },
    { id: 4, name: 'Completed', code: 'COMPLETED', color: '#10B981', icon: '✔️' },
    { id: 5, name: 'Delayed', code: 'DELAYED', color: '#EF4444', icon: '⚠️' }
];

export const implementingDepartments = [
    { id: 1, name: 'Public Works Department', code: 'PWD', icon: '🏗️' },
    { id: 2, name: 'Public Health Engineering Department', code: 'PHED', icon: '💧' },
    { id: 3, name: 'Education Department', code: 'EDU', icon: '📚' },
    { id: 4, name: 'Rural Development Department', code: 'RDD', icon: '🌾' },
    { id: 5, name: 'Social Welfare Department', code: 'SWD', icon: '🤝' }
];

export const executingAgencies = [
    { id: 1, name: 'Self Help Groups (SHG)', code: 'SHG', type: 'Community' },
    { id: 2, name: 'NGO Partners', code: 'NGO', type: 'Non-Profit' },
    { id: 3, name: 'Common Service Centers', code: 'CSC', type: 'Government' },
    { id: 4, name: 'Private Contractors', code: 'PVT', type: 'Private' }
];

export const mockProjects = [
    {
        id: 1,
        name: 'Community Hall Construction - Shirur',
        component: 'Adarsh Gram',
        status: 'ONGOING',
        state: 'Maharashtra',
        district: 'Pune',
        gp: 'Shirur Gram Panchayat',
        department: 'Public Works Department',
        agency: 'ABC Construction Pvt Ltd',
        fundAllocated: 5000000,
        fundReleased: 3500000,
        fundUtilized: 2800000,
        progress: 65,
        startDate: '2024-01-15',
        expectedCompletion: '2025-06-30',
        coordinates: [18.6298, 74.3714],
        photos: 3,
        lastUpdate: '2025-11-20'
    },
    {
        id: 2,
        name: 'SC/ST Hostel - Pune City',
        component: 'Hostel',
        status: 'APPROVED',
        state: 'Maharashtra',
        district: 'Pune',
        gp: 'Pune Municipal Corporation',
        department: 'Education Department',
        agency: 'Pending Assignment',
        fundAllocated: 12000000,
        fundReleased: 6000000,
        fundUtilized: 0,
        progress: 0,
        startDate: '2025-01-01',
        expectedCompletion: '2026-12-31',
        coordinates: [18.5204, 73.8567],
        photos: 0,
        lastUpdate: '2025-11-15'
    },
    {
        id: 3,
        name: 'Water Supply System - Khed',
        component: 'Adarsh Gram',
        status: 'ONGOING',
        state: 'Maharashtra',
        district: 'Pune',
        gp: 'Khed Gram Panchayat',
        department: 'Public Health Engineering Department',
        agency: 'XYZ Infrastructure Ltd',
        fundAllocated: 8500000,
        fundReleased: 8500000,
        fundUtilized: 6200000,
        progress: 73,
        startDate: '2024-03-01',
        expectedCompletion: '2025-03-31',
        coordinates: [18.7186, 73.9514],
        photos: 8,
        lastUpdate: '2025-11-22'
    },
    {
        id: 4,
        name: 'Skill Development Center - Baramati',
        component: 'GIA',
        status: 'COMPLETED',
        state: 'Maharashtra',
        district: 'Pune',
        gp: 'Baramati Nagar Panchayat',
        department: 'Social Welfare Department',
        agency: 'Empowerment NGO',
        fundAllocated: 3500000,
        fundReleased: 3500000,
        fundUtilized: 3500000,
        progress: 100,
        startDate: '2023-06-01',
        expectedCompletion: '2024-05-31',
        coordinates: [18.1514, 74.5815],
        photos: 15,
        lastUpdate: '2024-06-05'
    },
    {
        id: 5,
        name: 'Road Construction - Junnar',
        component: 'Adarsh Gram',
        status: 'DELAYED',
        state: 'Maharashtra',
        district: 'Pune',
        gp: 'Junnar Gram Panchayat',
        department: 'Public Works Department',
        agency: 'Road Builders Co',
        fundAllocated: 6000000,
        fundReleased: 4500000,
        fundUtilized: 2100000,
        progress: 35,
        startDate: '2024-02-01',
        expectedCompletion: '2024-12-31',
        coordinates: [19.2088, 73.8758],
        photos: 4,
        lastUpdate: '2025-11-10'
    }
];

export const mockNotifications = [
    {
        id: 1,
        title: 'New Fund Release Approved',
        message: 'Rs. 50 Lakhs released for Shirur GP projects',
        type: 'success',
        date: '2025-11-24',
        read: false
    },
    {
        id: 2,
        title: 'Approval Pending',
        message: '3 new proposals awaiting your approval',
        type: 'warning',
        date: '2025-11-23',
        read: false
    },
    {
        id: 3,
        title: 'Project Delayed',
        message: 'Junnar Road Construction is behind schedule',
        type: 'error',
        date: '2025-11-22',
        read: true
    },
    {
        id: 4,
        title: 'UC Submission Due',
        message: 'Utilization Certificate due in 5 days',
        type: 'info',
        date: '2025-11-21',
        read: false
    }
];

export const nationalStats = {
    totalStates: 28,
    totalDistricts: 756,
    totalProjects: 2847,
    totalFundAllocated: 125000000000,
    totalFundReleased: 87500000000,
    totalFundUtilized: 65200000000,
    projectsCompleted: 1245,
    projectsOngoing: 1156,
    projectsApproved: 312,
    projectsProposed: 134,
    averageProgress: 62
};

export const stateStats = {
    Maharashtra: {
        districts: 36,
        projects: 245,
        fundAllocated: 15000000000,
        fundReleased: 10500000000,
        fundUtilized: 7800000000,
        projectsCompleted: 98,
        projectsOngoing: 112,
        projectsApproved: 25,
        projectsProposed: 10,
        averageProgress: 68
    }
};

export const districtStats = {
    Pune: {
        gps: 42,
        projects: 45,
        fundAllocated: 850000000,
        fundReleased: 680000000,
        fundUtilized: 520000000,
        projectsCompleted: 18,
        projectsOngoing: 20,
        projectsApproved: 5,
        projectsProposed: 2,
        averageProgress: 65
    }
};
