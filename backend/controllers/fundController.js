const fs = require('fs');
const path = require('path');
const axios = require('axios');

const DATA_FILE = path.join(__dirname, '../data/funds.json');

// Helper to read data
const readData = () => {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            // Ensure directory exists
            const dir = path.dirname(DATA_FILE);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(DATA_FILE, JSON.stringify([]));
            return [];
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading funds data:', error);
        return [];
    }
};

// Helper to write data
const writeData = (data) => {
    try {
        const dir = path.dirname(DATA_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing funds data:', error);
        return false;
    }
};

// Get all funds
exports.getAllFunds = (req, res) => {
    const data = readData();
    res.json(data);
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
        const amountInRupees = Math.round(amountCr * 10000000);

        let funds = readData();
        const idx = funds.findIndex(f => f.name === stateName);

        const allocationRecord = {
            amountInRupees,
            amountCr,
            date,
            officerId,
            component,
            allocatorName,
            allocatorRole,
            allocatorPhone
        };

        if (idx >= 0) {
            // Update existing
            funds[idx].fundAllocated = (funds[idx].fundAllocated || 0) + amountInRupees;
            funds[idx].component = component; // Update component list if needed
            funds[idx].lastAllocation = allocationRecord;
        } else {
            // Create new
            funds.push({
                name: stateName,
                code: '', // Can add state code mapping if needed
                component,
                fundAllocated: amountInRupees,
                amountReleased: 0,
                lastAllocation: allocationRecord
            });
        }

        writeData(funds);

        res.json({ success: true, message: 'Allocation saved', data: funds });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Release Fund
exports.releaseFund = (req, res) => {
    try {
        const { stateName, amount } = req.body;

        if (!stateName || !amount) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        const amountCr = parseFloat(amount);
        const amountInRupees = Math.round(amountCr * 10000000);

        let funds = readData();
        const idx = funds.findIndex(f => f.name === stateName);

        if (idx === -1) {
            return res.status(404).json({ success: false, error: 'State not found' });
        }

        funds[idx].amountReleased = (funds[idx].amountReleased || 0) + amountInRupees;

        writeData(funds);

        res.json({ success: true, message: 'Release saved', data: funds });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
