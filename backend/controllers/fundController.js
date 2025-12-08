const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Get all fund allocations
exports.getAllFunds = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('fund_allocations')
            .select('*')
            .order('allocation_date', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        // Group by state and aggregate
        const stateMap = {};
        data.forEach(allocation => {
            const stateName = allocation.state_name;
            if (!stateMap[stateName]) {
                stateMap[stateName] = {
                    name: stateName,
                    code: allocation.state_code || stateName.substring(0, 2).toUpperCase(),
                    component: allocation.scheme_components || [],
                    fundAllocated: 0,
                    amountReleased: 0,
                    lastAllocation: null
                };
            }
            stateMap[stateName].fundAllocated += parseInt(allocation.amount_allocated) || 0;
            stateMap[stateName].amountReleased += parseInt(allocation.amount_released) || 0;

            // Set last allocation (assuming data is ordered by date desc)
            if (!stateMap[stateName].lastAllocation) {
                stateMap[stateName].lastAllocation = {
                    amountInRupees: parseInt(allocation.amount_allocated),
                    amountCr: parseInt(allocation.amount_allocated) / 10000000,
                    date: allocation.allocation_date,
                    officerId: allocation.officer_id,
                    allocatorName: allocation.allocator_name,
                    allocatorRole: allocation.allocator_role,
                    allocatorPhone: allocation.allocator_phone
                };
            }
        });

        const result = Object.values(stateMap);
        res.json(result);

    } catch (error) {
        console.error('Error fetching funds:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get Annual Plan Approvals (Approved Projects)
exports.getAnnualPlanApprovals = async (req, res) => {
    try {
        // 1. Get all approved projects (APPROVED_BY_MINISTRY)
        const { data: approvedProjects, error: projectError } = await supabase
            .from('district_proposals')
            .select('id, project_name, estimated_cost, approved_at, district_id')
            .eq('status', 'APPROVED_BY_MINISTRY');

        if (projectError) {
            console.error('Error fetching approved projects:', projectError);
            return res.status(500).json({ success: false, error: projectError.message });
        }

        if (!approvedProjects || approvedProjects.length === 0) {
            return res.json([]);
        }

        // 2. Get District IDs
        const districtIds = [...new Set(approvedProjects.map(p => p.district_id))];

        // 3. Fetch Districts with State IDs
        const { data: districts, error: districtError } = await supabase
            .from('districts')
            .select('id, name, state_id')
            .in('id', districtIds);

        if (districtError) {
            console.error('Error fetching districts:', districtError);
            return res.status(500).json({ success: false, error: districtError.message });
        }

        // 4. Get State IDs
        const stateIds = [...new Set(districts.map(d => d.state_id))];

        // 5. Fetch States
        const { data: states, error: stateError } = await supabase
            .from('states')
            .select('id, name')
            .in('id', stateIds);

        if (stateError) {
            console.error('Error fetching states:', stateError);
            return res.status(500).json({ success: false, error: stateError.message });
        }

        // 6. Create Lookup Maps
        const stateLookup = states.reduce((acc, s) => {
            acc[s.id] = s.name;
            return acc;
        }, {});

        const districtLookup = districts.reduce((acc, d) => {
            acc[d.id] = {
                name: d.name,
                stateName: stateLookup[d.state_id]
            };
            return acc;
        }, {});

        // 7. Group by State
        const stateMap = {};

        approvedProjects.forEach(project => {
            const districtInfo = districtLookup[project.district_id];
            const stateName = districtInfo?.stateName;

            if (!stateName) return;

            if (!stateMap[stateName]) {
                stateMap[stateName] = {
                    id: Object.keys(stateMap).length + 1,
                    state: stateName,
                    name: stateName,
                    totalProjects: 0,
                    totalFundsValue: 0,
                    orders: []
                };
            }

            stateMap[stateName].totalProjects += 1;
            const cost = parseFloat(project.estimated_cost) || 0;
            stateMap[stateName].totalFundsValue += cost;

            stateMap[stateName].orders.push({
                id: project.id,
                year: '2024-2025',
                date: project.approved_at ? new Date(project.approved_at).toISOString().split('T')[0] : 'N/A',
                amount: cost.toFixed(2),
                orderNo: project.project_name
            });
        });

        // Format for UI
        const result = Object.values(stateMap).map(state => ({
            ...state,
            totalFunds: state.totalFundsValue.toFixed(2)
        }));

        res.json(result);

    } catch (error) {
        console.error('Error fetching annual plan approvals:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Allocate Fund
exports.allocateFund = async (req, res) => {
    try {
        const {
            stateName,
            component,
            amount,
            date,
            officerId,
            allocatorName,
            allocatorRole,
            allocatorPhone
        } = req.body;

        if (!stateName || !amount) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        const amountCr = parseFloat(amount);
        const amountInRupees = Math.round(amountCr * 10000000); // 1 Cr = 10,000,000

        // Insert new allocation
        const { data, error } = await supabase
            .from('fund_allocations')
            .insert([
                {
                    state_name: stateName,
                    state_code: stateName.substring(0, 2).toUpperCase(),
                    scheme_components: component || [],
                    amount_allocated: amountInRupees,
                    allocation_date: date || new Date().toISOString().split('T')[0],
                    officer_id: officerId,
                    allocator_name: allocatorName,
                    allocator_role: allocatorRole,
                    allocator_phone: allocatorPhone || 'N/A'
                }
            ])
            .select();

        if (error) {
            console.error('Supabase insert error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        console.log('✅ Fund allocation saved successfully');

        // Send WhatsApp notification to State Admin
        try {
            console.log('📱 Fetching State Admin details for:', stateName);
            console.log('📱 Searching with case-insensitive match...');

            // First, let's see ALL admins for debugging
            const { data: allAdmins } = await supabase
                .from('state_assignment')
                .select('*')
                .ilike('state_name', stateName);

            console.log('📊 All admins found for state (case-insensitive):', JSON.stringify(allAdmins, null, 2));

            // Get State Admin phone number
            const { data: stateAdmin, error: adminError } = await supabase
                .from('state_assignment')
                .select('phone_no, admin_name, email, status, state_name')
                .ilike('state_name', stateName)
                .eq('status', 'Activated')
                .single();

            console.log('📱 Query result - Admin:', stateAdmin, 'Error:', adminError);

            if (adminError || !stateAdmin) {
                console.log('⚠️ No activated State Admin found for:', stateName);
                console.log('⚠️ Error details:', JSON.stringify(adminError, null, 2));

                // Try without status filter
                const { data: anyAdmin } = await supabase
                    .from('state_assignment')
                    .select('*')
                    .ilike('state_name', stateName)
                    .limit(1);

                console.log('📊 Admin exists (any status):', JSON.stringify(anyAdmin, null, 2));
            } else {
                console.log('📱 Found State Admin:', stateAdmin.admin_name, 'Phone:', stateAdmin.phone_no);

                // Format phone number for WATI
                let formattedPhone = stateAdmin.phone_no.replace(/\D/g, '');
                if (formattedPhone.startsWith('91')) {
                    formattedPhone = formattedPhone.substring(2);
                }
                formattedPhone = `91${formattedPhone}`;

                const watiApiBaseUrl = process.env.WATI_API_URL;
                const watiApiKey = process.env.WATI_API_KEY;
                const tenantId = process.env.TENANT_ID;
                const templateName = process.env.WATI_TEMPLATE_NAME || 'sih';

                if (watiApiBaseUrl && watiApiKey && tenantId) {
                    const messageContent =
                        `FUND ALLOCATION NOTIFICATION - ` +
                        `Dear ${stateAdmin.admin_name}, ` +
                        `The Ministry has allocated ₹${amountCr.toFixed(2)} Crores to ${stateName}. ` +
                        `Allocation Date: ${date || new Date().toISOString().split('T')[0]}. ` +
                        `Scheme Components: ${Array.isArray(component) ? component.join(', ') : component || 'General'}. ` +
                        `Officer ID: ${officerId || 'N/A'}. ` +
                        `Please login to the PM-AJAY portal to view details and release funds to districts. ` +
                        `Thank you, Ministry of Social Justice & Empowerment`;

                    const endpoint = `${watiApiBaseUrl}/${tenantId}/api/v1/sendTemplateMessage?whatsappNumber=${formattedPhone}`;
                    const payload = {
                        template_name: templateName,
                        broadcast_name: 'Fund Allocation Notification',
                        parameters: [{ name: "message_body", value: messageContent }]
                    };

                    console.log('📱 Sending WhatsApp notification to:', formattedPhone);

                    await axios.post(endpoint, payload, {
                        headers: {
                            'Authorization': `Bearer ${watiApiKey}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    console.log('✅ WhatsApp notification sent successfully to State Admin!');
                } else {
                    console.log('⚠️ WATI configuration missing, skipping WhatsApp notification');
                }
            }
        } catch (whatsappError) {
            console.error('❌ Error sending WhatsApp notification:', whatsappError.message);
            // Don't fail the allocation if WhatsApp fails
        }

        res.json({
            success: true,
            message: 'Fund allocated successfully and notification sent to State Admin',
            data: data[0]
        });

    } catch (error) {
        console.error('Error allocating fund:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Release Fund (handles both Ministry→State and State→District)
exports.releaseFund = async (req, res) => {
    try {
        const {
            district_id,     // If present: State → District release
            stateName,       // If present: Ministry → State release
            amount,
            amount_rupees,
            amount_cr,
            component,
            date,
            release_date,
            officerId,
            officer_id,
            remarks,
            created_by,
            state_name,
            bankAccount
        } = req.body;

        console.log('💰 Release Fund Request Received:');
        console.log('📦 Full Request Body:', JSON.stringify(req.body, null, 2));

        // Determine if this is a State→District release or Ministry→State release
        if (district_id) {
            // STATE → DISTRICT RELEASE
            console.log('💰 Processing State→District fund release for district ID:', district_id);

            const amountCr = amount_cr || parseFloat(amount);
            const amountInRupees = amount_rupees || Math.round(amountCr * 10000000);
            const releaseDate = release_date || date || new Date().toISOString().split('T')[0];

            // Insert into fund_releases table
            const { data, error } = await supabase
                .from('fund_releases')
                .insert([
                    {
                        district_id: district_id,
                        component: component || [],
                        amount_rupees: amountInRupees,
                        amount_cr: amountCr,
                        release_date: releaseDate,
                        officer_id: officer_id || officerId,
                        remarks: bankAccount ? `${remarks} | Bank Account: ${bankAccount}` : remarks,
                        created_by: created_by
                    }
                ])
                .select('*, districts(name, id)');

            if (error) {
                console.error('Error inserting fund release:', error);
                return res.status(500).json({ success: false, error: error.message });
            }

            console.log('✅ Fund release saved to database');

            // Send WhatsApp & Push to District Admin
            try {
                console.log('📱 Fetching District Admin details for district ID:', district_id);

                // Get district information
                const { data: districtInfo, error: districtError } = await supabase
                    .from('districts')
                    .select('name, state_id, states(name)')
                    .eq('id', district_id)
                    .single();

                if (districtError || !districtInfo) {
                    console.log('⚠️ Could not find district information');
                } else {
                    const districtName = districtInfo.name;
                    const stateName = districtInfo.states?.name || state_name;

                    console.log('📊 District:', districtName, 'State:', stateName);

                    // Get District Admin details
                    const { data: districtAdmin, error: adminError } = await supabase
                        .from('district_assignment')
                        .select('phone_no, admin_name, email, district_name, status')
                        .ilike('district_name', districtName)
                        .eq('status', 'Activated')
                        .single();

                    console.log('📱 District Admin query result:', districtAdmin, 'Error:', adminError);

                    if (adminError || !districtAdmin) {
                        console.log('⚠️ No activated District Admin found for:', districtName);
                    } else {
                        console.log('📱 Found District Admin:', districtAdmin.admin_name, 'Phone:', districtAdmin.phone_no);

                        // 1. In-App Notification (Realtime)
                        const { error: notifError } = await supabase.from('notifications').insert([{
                            user_role: 'district_admin',
                            district_name: districtName,
                            state_name: stateName,
                            title: 'Fund Released By State',
                            message: `${stateName} has released ₹${amountCr.toFixed(2)} Cr to ${districtName}.`,
                            type: 'fund_release',
                            read: false,
                            created_at: new Date().toISOString()
                        }]);

                        if (notifError) console.error('Error creating in-app notification:', notifError);
                        else console.log('✅ In-App Notification created in DB');


                        // 2. WhatsApp Notification
                        let formattedPhone = districtAdmin.phone_no.replace(/\D/g, '');
                        if (formattedPhone.startsWith('91')) {
                            formattedPhone = formattedPhone.substring(2);
                        }
                        formattedPhone = `91${formattedPhone}`;

                        const watiApiBaseUrl = process.env.WATI_API_URL;
                        const watiApiKey = process.env.WATI_API_KEY;
                        const tenantId = process.env.TENANT_ID;
                        const templateName = process.env.WATI_TEMPLATE_NAME || 'sih';

                        if (watiApiBaseUrl && watiApiKey && tenantId) {
                            const messageContent =
                                `FUND RELEASE NOTIFICATION - ` +
                                `Dear ${districtAdmin.admin_name}, ` +
                                `The State (${stateName}) has released ₹${amountCr.toFixed(2)} Crores to ${districtName} District. ` +
                                `Release Date: ${releaseDate}. ` +
                                `Scheme Components: ${Array.isArray(component) ? component.join(', ') : component || 'General'}. ` +
                                `Officer ID: ${officer_id || officerId || 'N/A'}. ` +
                                `Please login to the PM-AJAY portal to view details and utilize the funds. ` +
                                `Thank you, ${stateName} State Administration`;

                            const endpoint = `${watiApiBaseUrl}/${tenantId}/api/v1/sendTemplateMessage?whatsappNumber=${formattedPhone}`;
                            const payload = {
                                template_name: templateName,
                                broadcast_name: 'Fund Release Notification',
                                parameters: [{ name: "message_body", value: messageContent }]
                            };

                            console.log('📱 Sending WhatsApp to District Admin:', formattedPhone);

                            await axios.post(endpoint, payload, {
                                headers: {
                                    'Authorization': `Bearer ${watiApiKey}`,
                                    'Content-Type': 'application/json'
                                }
                            });

                            console.log('✅ WhatsApp notification sent to District Admin!');
                        } else {
                            console.log('⚠️ WATI configuration missing');
                        }

                        // Expo Push - Robust Official Account Lookup
                        console.log(`🔍 Expo: Looking for Official District Admin profile for: ${districtName}`);

                        // Search for role='district_admin' and full_name containing the district name
                        let { data: officialProfile, error: profileErr } = await supabase
                            .from('profiles')
                            .select('push_token, id, email, full_name')
                            .eq('role', 'district_admin')
                            .ilike('full_name', `%${districtName}%`) // Matches "Lucknow District Admin"
                            .maybeSingle();

                        if (officialProfile) {
                            console.log(`✅ Expo: Found Official Admin: ${officialProfile.email} (${officialProfile.full_name})`);

                            if (officialProfile.push_token) {
                                console.log(`✅ Expo: Found valid push token. Sending notification...`);
                                try {
                                    const pushResponse = await axios.post('https://exp.host/--/api/v2/push/send', {
                                        to: officialProfile.push_token,
                                        title: '💰 Fund Release Update',
                                        body: `State has released funds to ${districtName}. Released: ₹${amountCr.toFixed(2)} Cr.`,
                                        data: { type: 'fund_release', amount: amountCr },
                                        sound: 'default',
                                        priority: 'high'
                                    });
                                    console.log('✅ Expo: Notification sent successfully:', pushResponse.data?.data);
                                } catch (err) {
                                    console.error('❌ Expo: Error sending notification:', err.response?.data || err.message);
                                }
                            } else {
                                console.log(`⚠️ Expo: Official Admin has no push token set (Token is null). User needs to login to app.`);
                            }
                        } else {
                            console.log(`⚠️ Expo: Could not find an official profile for district: ${districtName}`);
                            if (profileErr) console.error('Error details:', profileErr);
                        }
                    }
                }
            } catch (whatsappError) {
                console.error('❌ Error sending Notification:', whatsappError.message);
            }

            return res.json({ success: true, message: 'Fund released to district successfully', data: data[0] });

        } else if (stateName) {
            // MINISTRY → STATE RELEASE
            console.log('💰 Processing Ministry→State fund release for state:', stateName);
            const amountCr = parseFloat(amount);
            const amountInRupees = Math.round(amountCr * 10000000);

            // Get State ID
            const { data: stateData, error: stateError } = await supabase
                .from('states')
                .select('id')
                .eq('name', stateName)
                .single();

            if (stateError || !stateData) return res.status(404).json({ success: false, error: 'State not found' });

            const stateId = stateData.id;

            // Check if Project Release
            const isProjectRelease = officerId && officerId.startsWith('PROJ-');
            let currentReleased = 0;
            let totalAllocated = 0;

            if (!isProjectRelease) {
                // Update Allocation
                const { data: allocations } = await supabase
                    .from('fund_allocations')
                    .select('*')
                    .eq('state_name', stateName)
                    .order('allocation_date', { ascending: false })
                    .limit(1);

                if (!allocations?.length) return res.status(404).json({ success: false, error: 'State allocation not found.' });

                const allocation = allocations[0];
                currentReleased = parseInt(allocation.amount_released) || 0;
                totalAllocated = parseInt(allocation.amount_allocated) || 0;
                const newReleased = currentReleased + amountInRupees;

                if (newReleased > totalAllocated) {
                    return res.status(400).json({
                        success: false,
                        error: `Cannot release funds. Exceeds allocation. Available: ₹${((totalAllocated - currentReleased) / 10000000).toFixed(2)} Cr`
                    });
                }

                await supabase.from('fund_allocations').update({ amount_released: newReleased }).eq('id', allocation.id);
            }

            // Insert Release Log
            const { data: releaseLog, error: insertError } = await supabase
                .from('state_fund_releases')
                .insert([{
                    state_id: stateId,
                    component: component || [],
                    amount_rupees: amountInRupees,
                    amount_cr: amountCr,
                    release_date: date || new Date().toISOString().split('T')[0],
                    sanction_order_no: officerId,
                    remarks: bankAccount ? `${remarks} | Bank Account: ${bankAccount}` : remarks
                }])
                .select();

            if (insertError) return res.status(500).json({ success: false, error: insertError.message });

            // Update Project if needed
            if (isProjectRelease) {
                const projectId = officerId.replace('PROJ-', '');
                const { data: projectData } = await supabase.from('approved_projects').select('released_amount, allocated_amount').eq('proposal_id', projectId).single();
                if (projectData) {
                    const newProjReleased = (parseFloat(projectData.released_amount) || 0) + (amountInRupees / 100000);
                    const newRemaining = (parseFloat(projectData.allocated_amount) || 0) - newProjReleased;
                    await supabase.from('approved_projects').update({ released_amount: newProjReleased, remaining_fund: newRemaining }).eq('proposal_id', projectId);
                }
            }

            // Notifications
            try {
                const { data: stateAdmin } = await supabase
                    .from('state_assignment')
                    .select('phone_no, admin_name, email, status')
                    .ilike('state_name', stateName)
                    .eq('status', 'Activated')
                    .single();

                if (stateAdmin) {
                    // In-App Notification (Reliable via Realtime)
                    const { error: notifError } = await supabase.from('notifications').insert([{
                        user_role: 'state_admin',
                        state_name: stateName,
                        title: 'Fund Released By Ministry',
                        message: `Ministry has released ₹${amountCr.toFixed(2)} Cr for ${stateName}.`,
                        type: 'fund_release',
                        read: false,
                        created_at: new Date().toISOString()
                    }]);

                    if (notifError) console.error('Error creating in-app notification:', notifError);
                    else console.log('✅ In-App Notification created in DB');

                    // WhatsApp & Push
                    const formattedPhone = '91' + stateAdmin.phone_no.replace(/\D/g, '').slice(-10);
                    const remainingBalance = !isProjectRelease ? ((totalAllocated - (currentReleased + amountInRupees)) / 10000000).toFixed(2) : 'N/A';

                    // WhatsApp
                    if (process.env.WATI_API_KEY) {
                        const msg = `FUND RELEASE - Released: ₹${amountCr.toFixed(2)} Cr. Remaining: ₹${remainingBalance} Cr.`;
                        axios.post(`${process.env.WATI_API_URL}/${process.env.TENANT_ID}/api/v1/sendTemplateMessage?whatsappNumber=${formattedPhone}`, {
                            template_name: process.env.WATI_TEMPLATE_NAME || 'sih',
                            broadcast_name: 'Fund Release',
                            parameters: [{ name: "message_body", value: msg }]
                        }, { headers: { 'Authorization': `Bearer ${process.env.WATI_API_KEY}` } }).catch(console.error);
                    }

                    // Expo Push - Robust Official Account Lookup
                    console.log(`🔍 Expo: Looking for Official State Admin profile for: ${stateName}`);

                    // The profiles table has official accounts like "Uttar Pradesh State Admin"
                    // We search for role='state_admin' and full_name containing the state name
                    let { data: officialProfile, error: profileErr } = await supabase
                        .from('profiles')
                        .select('push_token, id, email, full_name')
                        .eq('role', 'state_admin')
                        .ilike('full_name', `%${stateName}%`) // Matches "Uttar Pradesh State Admin"
                        .maybeSingle();

                    if (officialProfile) {
                        console.log(`✅ Expo: Found Official Admin: ${officialProfile.email} (${officialProfile.full_name})`);

                        if (officialProfile.push_token) {
                            console.log(`✅ Expo: Found valid push token. Sending notification...`);
                            try {
                                const pushResponse = await axios.post('https://exp.host/--/api/v2/push/send', {
                                    to: officialProfile.push_token,
                                    title: '💰 Fund Release Update',
                                    body: `The fund is released to ${stateName}. Released: ₹${amountCr.toFixed(2)} Cr. Remaining: ₹${remainingBalance} Cr.`,
                                    data: { type: 'fund_release', amount: amountCr },
                                    sound: 'default',
                                    priority: 'high'
                                });
                                console.log('✅ Expo: Notification sent successfully:', pushResponse.data?.data);
                            } catch (err) {
                                console.error('❌ Expo: Error sending notification:', err.response?.data || err.message);
                            }
                        } else {
                            console.log(`⚠️ Expo: Official Admin has no push token set (Token is null). User needs to login to app.`);
                        }

                    } else {
                        console.log(`⚠️ Expo: Could not find an official profile for state: ${stateName}`);
                        if (profileErr) console.error('Error details:', profileErr);

                        // Fallback: try constructing the email from state code if available? 
                        // For now, the name match is very reliable based on the schema provided.
                    }
                }
            } catch (e) { console.error('Notification error:', e); }

            return res.json({ success: true, message: 'Fund released successfully', data: releaseLog[0] });

        } else {
            return res.status(400).json({ success: false, error: 'Target not specified' });
        }
    } catch (error) {
        console.error('Release error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Release fund to Agency (District -> Agency)
exports.releaseFundToAgency = async (req, res) => {
    try {
        const { districtId, agencyId, component, amount, date, remarks, createdBy, districtName } = req.body;
        const amountCr = parseFloat(amount);
        const amountInRupees = Math.round(amountCr * 10000000);

        // Check balance
        const { data: received } = await supabase.from('fund_releases').select('amount_cr').eq('district_id', districtId);
        const totalReceived = received?.reduce((sum, i) => sum + (parseFloat(i.amount_cr) || 0), 0) || 0;

        const { data: released } = await supabase.from('agency_fund_releases').select('amount_cr').eq('district_id', districtId);
        const totalReleased = released?.reduce((sum, i) => sum + (parseFloat(i.amount_cr) || 0), 0) || 0;

        const available = totalReceived - totalReleased;
        if (amountCr > available) return res.status(400).json({ success: false, error: `Insufficient balance. Available: ₹${available.toFixed(2)} Cr` });

        // Insert
        const { data, error } = await supabase.from('agency_fund_releases').insert([{
            district_id: districtId, agency_id: agencyId, component: [component], amount_cr: amountCr,
            amount_rupees: amountInRupees, release_date: date, remarks: remarks, created_by: createdBy
        }]).select('*, implementing_agencies_assignment(admin_name, agency_name, phone_no)');

        if (error) throw error;

        // WhatsApp
        try {
            const agency = data[0].implementing_agencies_assignment;
            if (agency?.phone_no && process.env.WATI_API_KEY) {
                const phone = '91' + agency.phone_no.replace(/\D/g, '').slice(-10);
                const msg = `AGENCY FUND RELEASE - Released ₹${amountCr.toFixed(2)} Cr to ${agency.agency_name}.`;
                axios.post(`${process.env.WATI_API_URL}/${process.env.TENANT_ID}/api/v1/sendTemplateMessage?whatsappNumber=${phone}`, {
                    template_name: process.env.WATI_TEMPLATE_NAME,
                    broadcast_name: 'Agency Release',
                    parameters: [{ name: "message_body", value: msg }]
                }, { headers: { 'Authorization': `Bearer ${process.env.WATI_API_KEY}` } }).catch(console.error);
            }
        } catch (e) { console.error('Agency notification error:', e); }

        res.json({ success: true, data: data[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get Agency Fund Releases
exports.getAgencyFundReleases = async (req, res) => {
    try {
        const { districtId } = req.query;
        let query = supabase
            .from('agency_fund_releases')
            .select('*, implementing_agencies_assignment(admin_name, agency_name)')
            .order('created_at', { ascending: false });

        if (districtId) {
            query = query.eq('district_id', districtId);
        }

        const { data, error } = await query;
        if (error) {
            if (error.code === '42P01') return res.json({ success: true, data: [] });
            throw error;
        }
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// UTILITY: Fix fund allocation amounts by recalculating from actual releases
exports.fixFundAllocations = async (req, res) => {
    try {
        console.log('🔧 Fixing fund allocation amounts...');

        // Get all fund allocations
        const { data: allocations, error: allocError } = await supabase
            .from('fund_allocations')
            .select('*');

        if (allocError) {
            return res.status(500).json({ success: false, error: allocError.message });
        }

        const results = [];

        for (const allocation of allocations) {
            // Get state ID
            const { data: stateData } = await supabase
                .from('states')
                .select('id')
                .eq('name', allocation.state_name)
                .single();

            if (!stateData) continue;

            // Calculate actual released amount from state_fund_releases
            const { data: releases } = await supabase
                .from('state_fund_releases')
                .select('amount_rupees')
                .eq('state_id', stateData.id);

            const totalReleased = releases?.reduce((sum, r) => sum + (parseInt(r.amount_rupees) || 0), 0) || 0;

            // Update allocation
            const { error: updateError } = await supabase
                .from('fund_allocations')
                .update({ amount_released: totalReleased })
                .eq('id', allocation.id);

            results.push({
                state: allocation.state_name,
                allocated: allocation.amount_allocated,
                old_released: allocation.amount_released,
                new_released: totalReleased,
                fixed: !updateError
            });
        }

        console.log('✅ Fixed fund allocations:', results);
        res.json({ success: true, message: 'Fund allocations fixed', data: results });

    } catch (error) {
        console.error('Error fixing fund allocations:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get releases TO a specific district (State -> District)
exports.getReleasesToDistrict = async (req, res) => {
    try {
        const { districtId } = req.query;
        const { data, error } = await supabase
            .from('fund_releases')
            .select('*')
            .eq('district_id', districtId);
        if (error) throw error;
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get all Ministry -> State fund releases
exports.getAllStateFundReleases = async (req, res) => {
    try {
        const { data, error } = await supabase.from('state_fund_releases').select('*, states(name)').order('release_date', { ascending: false });
        if (error) throw error;
        res.json({ success: true, data });
    } catch (error) { res.status(500).json({ success: false, error: error.message }); }
};

// Get releases to districts in a specific state
exports.getDistrictFundReleasesByState = async (req, res) => {
    try {
        const { stateName } = req.query;
        let query = supabase.from('fund_releases').select('*, districts(name, state_id, states(name))').order('release_date', { ascending: false });
        if (stateName) {
            const { data: stateData } = await supabase.from('states').select('id').eq('name', stateName).single();
            if (stateData) {
                const { data: districts } = await supabase.from('districts').select('id').eq('state_id', stateData.id);
                const districtIds = districts?.map(d => d.id) || [];
                query = query.in('district_id', districtIds);
            }
        }
        const { data, error } = await query;
        if (error) throw error;
        res.json({ success: true, data });
    } catch (error) { res.status(500).json({ success: false, error: error.message }); }
};

// Get funds overview/stats for a district
exports.getDistrictStats = async (req, res) => {
    try {
        const { districtId } = req.query;
        if (!districtId) return res.status(400).json({ success: false, error: 'District ID required' });
        const { data: received } = await supabase.from('fund_releases').select('amount_cr').eq('district_id', districtId);
        const totalReceived = received?.reduce((sum, r) => sum + (r.amount_cr || 0), 0) || 0;
        const { data: released } = await supabase.from('agency_fund_releases').select('amount_cr').eq('district_id', districtId);
        const totalReleased = released?.reduce((sum, r) => sum + (r.amount_cr || 0), 0) || 0;
        const { data: ucs } = await supabase.from('uc_submissions').select('fund_utilized').eq('district_id', districtId).eq('status', 'Verified');
        const totalUtilized = (ucs?.reduce((sum, u) => sum + (u.fund_utilized || 0), 0) || 0) / 10000000;
        res.json({ success: true, data: { totalReceived, totalReleased, totalUtilized, balance: totalReceived - totalReleased } });
    } catch (error) { res.status(500).json({ success: false, error: error.message }); }
};
