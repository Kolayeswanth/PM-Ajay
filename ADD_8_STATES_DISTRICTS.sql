-- Add districts for 8 states with state_code filtering

-- 1. DELHI (DL) - 11 districts
INSERT INTO districts (name, state_code)
SELECT d.name, 'DL'
FROM (VALUES 
    ('Central Delhi'), ('East Delhi'), ('New Delhi'), ('North Delhi'), ('North East Delhi'),
    ('North West Delhi'), ('Shahdara'), ('South Delhi'), ('South East Delhi'), ('South West Delhi'), ('West Delhi')
) AS d(name)
WHERE NOT EXISTS (SELECT 1 FROM districts WHERE name = d.name);

-- 2. ANDHRA PRADESH (AP) - 26 districts
INSERT INTO districts (name, state_code)
SELECT d.name, 'AP'
FROM (VALUES 
    ('Anantapur'), ('Chittoor'), ('East Godavari'), ('Guntur'), ('Krishna'), ('Kurnool'),
    ('Prakasam'), ('Srikakulam'), ('Sri Potti Sriramulu Nellore'), ('Visakhapatnam'), ('Vizianagaram'), ('West Godavari'), ('YSR Kadapa'),
    ('Alluri Sitharama Raju'), ('Anakapalli'), ('Annamayya'), ('Bapatla'), ('Eluru'), ('Kakinada'),
    ('Konaseema'), ('NTR'), ('Nandyal'), ('Palnadu'), ('Parvathipuram Manyam'), ('Tirupati'), ('Visakhapatnam')
) AS d(name)
WHERE NOT EXISTS (SELECT 1 FROM districts WHERE name = d.name);

-- 3. ANDAMAN AND NICOBAR ISLANDS (AN) - 3 districts
INSERT INTO districts (name, state_code)
SELECT d.name, 'AN'
FROM (VALUES 
    ('Nicobar'), ('North and Middle Andaman'), ('South Andaman')
) AS d(name)
WHERE NOT EXISTS (SELECT 1 FROM districts WHERE name = d.name);

-- 4. ASSAM (AS) - 35 districts
INSERT INTO districts (name, state_code)
SELECT d.name, 'AS'
FROM (VALUES 
    ('Baksa'), ('Barpeta'), ('Biswanath'), ('Bongaigaon'), ('Cachar'), ('Charaideo'),
    ('Chirang'), ('Darrang'), ('Dhemaji'), ('Dhubri'), ('Dibrugarh'), ('Dima Hasao'),
    ('Goalpara'), ('Golaghat'), ('Hailakandi'), ('Hojai'), ('Jorhat'), ('Kamrup'),
    ('Kamrup Metropolitan'), ('Karbi Anglong'), ('Karimganj'), ('Kokrajhar'), ('Lakhimpur'),
    ('Majuli'), ('Morigaon'), ('Nagaon'), ('Nalbari'), ('Sivasagar'), ('Sonitpur'),
    ('South Salmara-Mankachar'), ('Tinsukia'), ('Udalguri'), ('West Karbi Anglong'), ('Bajali'), ('Tamulpur')
) AS d(name)
WHERE NOT EXISTS (SELECT 1 FROM districts WHERE name = d.name);

-- 5. MAHARASHTRA (MH) - 36 districts
INSERT INTO districts (name, state_code)
SELECT d.name, 'MH'
FROM (VALUES 
    ('Ahmednagar'), ('Akola'), ('Amravati'), ('Aurangabad'), ('Beed'), ('Bhandara'),
    ('Buldhana'), ('Chandrapur'), ('Dhule'), ('Gadchiroli'), ('Gondia'), ('Hingoli'),
    ('Jalgaon'), ('Jalna'), ('Kolhapur'), ('Latur'), ('Mumbai City'), ('Mumbai Suburban'),
    ('Nagpur'), ('Nanded'), ('Nandurbar'), ('Nashik'), ('Osmanabad'), ('Palghar'),
    ('Parbhani'), ('Pune'), ('Raigad'), ('Ratnagiri'), ('Sangli'), ('Satara'),
    ('Sindhudurg'), ('Solapur'), ('Thane'), ('Wardha'), ('Washim'), ('Yavatmal')
) AS d(name)
WHERE NOT EXISTS (SELECT 1 FROM districts WHERE name = d.name);

-- 6. KARNATAKA (KA) - 31 districts
INSERT INTO districts (name, state_code)
SELECT d.name, 'KA'
FROM (VALUES 
    ('Bagalkot'), ('Ballari'), ('Belagavi'), ('Bengaluru Rural'), ('Bengaluru Urban'), ('Bidar'),
    ('Chamarajanagar'), ('Chikkaballapur'), ('Chikkamagaluru'), ('Chitradurga'), ('Dakshina Kannada'), ('Davanagere'),
    ('Dharwad'), ('Gadag'), ('Hassan'), ('Haveri'), ('Kalaburagi'), ('Kodagu'),
    ('Kolar'), ('Koppal'), ('Mandya'), ('Mysuru'), ('Raichur'), ('Ramanagara'),
    ('Shivamogga'), ('Tumakuru'), ('Udupi'), ('Uttara Kannada'), ('Vijayapura'), ('Vijayanagara'), ('Yadgir')
) AS d(name)
WHERE NOT EXISTS (SELECT 1 FROM districts WHERE name = d.name);

-- 7. KERALA (KL) - 14 districts
INSERT INTO districts (name, state_code)
SELECT d.name, 'KL'
FROM (VALUES 
    ('Alappuzha'), ('Ernakulam'), ('Idukki'), ('Kannur'), ('Kasaragod'), ('Kollam'),
    ('Kottayam'), ('Kozhikode'), ('Malappuram'), ('Palakkad'), ('Pathanamthitta'), ('Thiruvananthapuram'),
    ('Thrissur'), ('Wayanad')
) AS d(name)
WHERE NOT EXISTS (SELECT 1 FROM districts WHERE name = d.name);

-- 8. GUJARAT (GJ) - 33 districts
INSERT INTO districts (name, state_code)
SELECT d.name, 'GJ'
FROM (VALUES 
    ('Ahmedabad'), ('Amreli'), ('Anand'), ('Aravalli'), ('Banaskantha'), ('Bharuch'),
    ('Bhavnagar'), ('Botad'), ('Chhota Udaipur'), ('Dahod'), ('Dang'), ('Devbhoomi Dwarka'),
    ('Gandhinagar'), ('Gir Somnath'), ('Jamnagar'), ('Junagadh'), ('Kheda'), ('Kutch'),
    ('Mahisagar'), ('Mehsana'), ('Morbi'), ('Narmada'), ('Navsari'), ('Panchmahal'),
    ('Patan'), ('Porbandar'), ('Rajkot'), ('Sabarkantha'), ('Surat'), ('Surendranagar'),
    ('Tapi'), ('Vadodara'), ('Valsad')
) AS d(name)
WHERE NOT EXISTS (SELECT 1 FROM districts WHERE name = d.name);

-- Update state_code for existing districts
UPDATE districts SET state_code = 'DL' WHERE name IN ('Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi', 'North East Delhi', 'North West Delhi', 'Shahdara', 'South Delhi', 'South East Delhi', 'South West Delhi', 'West Delhi');
UPDATE districts SET state_code = 'AP' WHERE name IN ('Anantapur', 'Chittoor', 'East Godavari', 'Guntur', 'Krishna', 'Kurnool', 'Prakasam', 'Srikakulam', 'Sri Potti Sriramulu Nellore', 'Visakhapatnam', 'Vizianagaram', 'West Godavari', 'YSR Kadapa', 'Alluri Sitharama Raju', 'Anakapalli', 'Annamayya', 'Bapatla', 'Eluru', 'Kakinada', 'Konaseema', 'NTR', 'Nandyal', 'Palnadu', 'Parvathipuram Manyam', 'Tirupati');
UPDATE districts SET state_code = 'AN' WHERE name IN ('Nicobar', 'North and Middle Andaman', 'South Andaman');
UPDATE districts SET state_code = 'AS' WHERE name IN ('Baksa', 'Barpeta', 'Biswanath', 'Bongaigaon', 'Cachar', 'Charaideo', 'Chirang', 'Darrang', 'Dhemaji', 'Dhubri', 'Dibrugarh', 'Dima Hasao', 'Goalpara', 'Golaghat', 'Hailakandi', 'Hojai', 'Jorhat', 'Kamrup', 'Kamrup Metropolitan', 'Karbi Anglong', 'Karimganj', 'Kokrajhar', 'Lakhimpur', 'Majuli', 'Morigaon', 'Nagaon', 'Nalbari', 'Sivasagar', 'Sonitpur', 'South Salmara-Mankachar', 'Tinsukia', 'Udalguri', 'West Karbi Anglong', 'Bajali', 'Tamulpur');
UPDATE districts SET state_code = 'MH' WHERE name IN ('Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed', 'Bhandara', 'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded', 'Nandurbar', 'Nashik', 'Osmanabad', 'Palghar', 'Parbhani', 'Pune', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal');
UPDATE districts SET state_code = 'KA' WHERE name IN ('Bagalkot', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban', 'Bidar', 'Chamarajanagar', 'Chikkaballapur', 'Chikkamagaluru', 'Chitradurga', 'Dakshina Kannada', 'Davanagere', 'Dharwad', 'Gadag', 'Hassan', 'Haveri', 'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal', 'Mandya', 'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga', 'Tumakuru', 'Udupi', 'Uttara Kannada', 'Vijayapura', 'Vijayanagara', 'Yadgir');
UPDATE districts SET state_code = 'KL' WHERE name IN ('Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod', 'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad', 'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad');
UPDATE districts SET state_code = 'GJ' WHERE name IN ('Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha', 'Bharuch', 'Bhavnagar', 'Botad', 'Chhota Udaipur', 'Dahod', 'Dang', 'Devbhoomi Dwarka', 'Gandhinagar', 'Gir Somnath', 'Jamnagar', 'Junagadh', 'Kheda', 'Kutch', 'Mahisagar', 'Mehsana', 'Morbi', 'Narmada', 'Navsari', 'Panchmahal', 'Patan', 'Porbandar', 'Rajkot', 'Sabarkantha', 'Surat', 'Surendranagar', 'Tapi', 'Vadodara', 'Valsad');
