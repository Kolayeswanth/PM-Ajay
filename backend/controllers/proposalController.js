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
