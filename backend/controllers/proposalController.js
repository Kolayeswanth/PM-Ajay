const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.createProposal = async (req, res) => {
    try {
        const { districtId, projectName, component, estimatedCost, description } = req.body;
        const files = req.files;

        if (!districtId || !projectName || !estimatedCost) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        let uploadedDocuments = [];

        // Upload files to Supabase Storage
        if (files && files.length > 0) {
            for (const file of files) {
                const fileName = `${districtId}/${Date.now()}_${file.originalname}`;
                const { data, error } = await supabase.storage
                    .from('proposal-documents') // Ensure this bucket exists
                    .upload(fileName, file.buffer, {
                        contentType: file.mimetype
                    });

                if (error) {
                    console.error('File upload error:', error);
                    // Continue with other files or fail? Let's log and continue for now.
                } else {
                    // Get public URL
                    const { data: publicUrlData } = supabase.storage
                        .from('proposal-documents')
                        .getPublicUrl(fileName);

                    uploadedDocuments.push({
                        name: file.originalname,
                        path: data.path,
                        url: publicUrlData.publicUrl,
                        type: file.mimetype,
                        size: file.size
                    });
                }
            }
        }

        const { data, error } = await supabase
            .from('district_proposals')
            .insert([
                {
                    district_id: districtId,
                    project_name: projectName,
                    component,
                    estimated_cost: estimatedCost,
                    description,
                    documents: uploadedDocuments,
                    status: 'SUBMITTED'
                }
            ])
            .select();

        if (error) {
            console.error('Supabase insert error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        // Get district info to find state
        const { data: districtData, error: districtError } = await supabase
            .from('districts')
            .select('name, state_id')
            .eq('id', districtId)
            .single();

        if (!districtError && districtData) {
            // Get state info
            const { data: stateData, error: stateError } = await supabase
                .from('states')
                .select('name')
                .eq('id', districtData.state_id)
                .single();

            if (!stateError && stateData) {
                // Create notification for State Admin
                const notificationData = {
                    user_role: 'state',
                    state_name: stateData.name,
                    title: 'New Proposal Received',
                    message: `New proposal "${projectName}" submitted by ${districtData.name} district for ${component} component (₹${estimatedCost} Lakhs)`,
                    type: 'info',
                    read: false,
                    metadata: {
                        proposal_id: data[0].id,
                        district_id: districtId,
                        district_name: districtData.name,
                        project_name: projectName,
                        component: component,
                        estimated_cost: estimatedCost
                    }
                };

                const { error: notifError } = await supabase
                    .from('notifications')
                    .insert([notificationData]);

                if (notifError) {
                    console.error('Failed to create notification:', notifError);
                    // Don't fail the request, just log it
                } else {
                    console.log('✅ Notification created for state:', stateData.name);
                }
            }
        }

        res.json({ success: true, message: 'Proposal submitted successfully', data: data[0] });
    } catch (error) {
        console.error('Error creating proposal:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getProposalsByDistrict = async (req, res) => {
    try {
        const { districtId } = req.params;

        const { data, error } = await supabase
            .from('district_proposals')
            .select('*')
            .eq('district_id', districtId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase select error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching proposals:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getProposalsByState = async (req, res) => {
    try {
        const { stateName } = req.query;

        if (!stateName) {
            return res.status(400).json({ success: false, error: 'State name is required' });
        }

        // 1. Get State ID
        const { data: stateData, error: stateError } = await supabase
            .from('states')
            .select('id')
            .eq('name', stateName)
            .single();

        if (stateError || !stateData) {
            return res.status(404).json({ success: false, error: 'State not found' });
        }

        // 2. Get Districts in State
        const { data: districtsData, error: districtsError } = await supabase
            .from('districts')
            .select('id, name')
            .eq('state_id', stateData.id);

        if (districtsError) {
            return res.status(500).json({ success: false, error: districtsError.message });
        }

        const districtIds = districtsData.map(d => d.id);

        if (districtIds.length === 0) {
            return res.json({ success: true, data: [] });
        }

        // 3. Get Proposals for these Districts
        const { data: proposals, error: proposalsError } = await supabase
            .from('district_proposals')
            .select('*')
            .in('district_id', districtIds)
            .order('created_at', { ascending: false });

        if (proposalsError) {
            return res.status(500).json({ success: false, error: proposalsError.message });
        }

        // Map district names to proposals
        const districtMap = districtsData.reduce((acc, d) => {
            acc[d.id] = d.name;
            return acc;
        }, {});

        const enrichedProposals = proposals.map(p => ({
            ...p,
            district_name: districtMap[p.district_id]
        }));

        res.json({ success: true, data: enrichedProposals });

    } catch (error) {
        console.error('Error fetching state proposals:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getMinistryProposals = async (req, res) => {
    try {
        // 1. Fetch proposals
        const { data: proposals, error } = await supabase
            .from('district_proposals')
            .select('*')
            .in('status', ['APPROVED_BY_STATE', 'APPROVED_BY_MINISTRY', 'REJECTED_BY_MINISTRY'])
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase select error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        if (!proposals || proposals.length === 0) {
            return res.json({ success: true, data: [] });
        }

        // 2. Get unique District IDs
        const districtIds = [...new Set(proposals.map(p => p.district_id))];

        // 3. Fetch Districts
        const { data: districts, error: distError } = await supabase
            .from('districts')
            .select('id, name, state_id')
            .in('id', districtIds);

        if (distError) {
            throw distError;
        }

        // 4. Get unique State IDs
        const stateIds = [...new Set(districts.map(d => d.state_id))];

        // 5. Fetch States
        const { data: states, error: stateError } = await supabase
            .from('states')
            .select('id, name')
            .in('id', stateIds);

        if (stateError) {
            throw stateError;
        }

        // 6. Create Maps for easy lookup
        const stateMap = states.reduce((acc, s) => {
            acc[s.id] = s.name;
            return acc;
        }, {});

        const districtMap = districts.reduce((acc, d) => {
            acc[d.id] = {
                name: d.name,
                stateName: stateMap[d.state_id]
            };
            return acc;
        }, {});

        // 7. Merge data
        const flattenedProposals = proposals.map(p => ({
            ...p,
            district_name: districtMap[p.district_id]?.name || 'Unknown District',
            state_name: districtMap[p.district_id]?.stateName || 'Unknown State'
        }));

        res.json({ success: true, data: flattenedProposals });
    } catch (error) {
        console.error('Error fetching ministry proposals:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updateProposalStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectReason, remarks, userId } = req.body;

        // 1. Get current status for history
        const { data: currentProposal, error: fetchError } = await supabase
            .from('district_proposals')
            .select('status')
            .eq('id', id)
            .single();

        if (fetchError) {
            return res.status(404).json({ success: false, error: 'Proposal not found' });
        }

        const updateData = { status };
        if (rejectReason) {
            updateData.reject_reason = rejectReason;
        }
        if (remarks) {
            updateData.remarks = remarks;
        }
        if (status.includes('APPROVED')) {
            updateData.approved_at = new Date().toISOString();
            if (userId) updateData.approved_by = userId;
        }

        // 2. Update Proposal
        const { data, error } = await supabase
            .from('district_proposals')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) {
            console.error('Supabase update error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        // 3. Insert into History
        const { error: historyError } = await supabase
            .from('proposal_history')
            .insert([
                {
                    proposal_id: id,
                    old_status: currentProposal.status,
                    new_status: status,
                    changed_by: userId || null,
                    remarks: rejectReason || remarks || ''
                }
            ]);

        if (historyError) {
            console.error('Error logging history:', historyError);
            // Don't fail the request just because history failed, but log it
        }

        // 4. Create notification for District Admin when approved/rejected by state
        if (status === 'APPROVED_BY_STATE' || status === 'REJECTED_BY_STATE') {
            try {
                // Get full proposal details with district info
                const { data: proposalData, error: proposalError } = await supabase
                    .from('district_proposals')
                    .select('project_name, estimated_cost, component, district_id')
                    .eq('id', id)
                    .single();

                if (!proposalError && proposalData) {
                    // Get district name
                    const { data: districtData, error: districtError } = await supabase
                        .from('districts')
                        .select('name')
                        .eq('id', proposalData.district_id)
                        .single();

                    if (!districtError && districtData) {
                        console.log('District data found:', districtData);
                        const isApproved = status === 'APPROVED_BY_STATE';
                        console.log('Is Approved?', isApproved);

                        // 1. Notification for District Admin
                        const notificationData = {
                            user_role: 'district',
                            district_name: districtData.name,
                            title: isApproved ? 'Proposal Approved by State' : 'Proposal Rejected by State',
                            message: isApproved
                                ? `Your proposal "${proposalData.project_name}" for ${proposalData.component} (₹${proposalData.estimated_cost} Lakhs) has been approved by the State Government!`
                                : `Your proposal "${proposalData.project_name}" has been rejected. Reason: ${rejectReason || 'Not specified'}`,
                            type: isApproved ? 'success' : 'error',
                            read: false,
                            metadata: {
                                proposal_id: id,
                                project_name: proposalData.project_name,
                                component: proposalData.component,
                                estimated_cost: proposalData.estimated_cost,
                                status: status,
                                reject_reason: rejectReason || null
                            }
                        };

                        const { error: notifError } = await supabase
                            .from('notifications')
                            .insert([notificationData]);

                        if (notifError) {
                            console.error('Failed to create notification:', notifError);
                        } else {
                            console.log(`✅ Notification created for district: ${districtData.name} (${isApproved ? 'Approved' : 'Rejected'})`);
                        }

                        // 2. Notification for Ministry (Only on Approval)
                        if (isApproved) {
                            // Fetch State Name
                            const { data: stateData, error: stateError } = await supabase
                                .from('states')
                                .select('name')
                                .eq('id', districtData.state_id)
                                .single();

                            const stateName = stateData ? stateData.name : 'State Government';

                            const ministryNotification = {
                                user_role: 'ministry', // Target the Ministry Dashboard (Database constraint requires 'ministry')
                                state_name: stateName,
                                title: 'Project Approved in State Gov',
                                message: `Project "${proposalData.project_name}" in ${districtData.name} (${stateName}) has been approved by the State Government.`,
                                type: 'success',
                                read: false,
                                metadata: {
                                    proposal_id: id,
                                    project_name: proposalData.project_name,
                                    district_name: districtData.name,
                                    state_name: stateName,
                                    component: proposalData.component,
                                    estimated_cost: proposalData.estimated_cost,
                                    approved_at: new Date().toISOString()
                                }
                            };

                            const { error: ministryNotifError } = await supabase
                                .from('notifications')
                                .insert([ministryNotification]);

                            if (ministryNotifError) {
                                console.error('Failed to create ministry notification:', ministryNotifError);
                            } else {
                                console.log(`✅ Notification created for Ministry: ${proposalData.project_name}`);
                            }
                        }
                    }
                }
            } catch (notifErr) {
                console.error('Error creating notification:', notifErr);
                // Don't fail the request, just log it
            }
        }

        res.json({ success: true, message: 'Proposal status updated', data: data[0] });

    } catch (error) {
        console.error('Error updating proposal status:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
