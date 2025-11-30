const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
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

        res.json({ success: true, message: 'Proposal status updated', data: data[0] });

    } catch (error) {
        console.error('Error updating proposal status:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
