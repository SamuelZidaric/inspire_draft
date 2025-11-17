// Data alignment verification script
const fs = require('fs');

console.log('=== Data Alignment Verification (Matryoshka Structure) ===\n');

// Load all data files
const campaigns = JSON.parse(fs.readFileSync('data/campaigns_db.json', 'utf8'));
const locations = JSON.parse(fs.readFileSync('data/locations.json', 'utf8'));
const organisations = JSON.parse(fs.readFileSync('data/organisations.json', 'utf8'));
const samples = JSON.parse(fs.readFileSync('data/campaign_micro_samples.json', 'utf8'));

console.log('Data loaded:');
console.log(`- Campaigns: ${campaigns.length}`);
console.log(`- Locations: ${locations.length}`);
console.log(`- Organisations: ${organisations.length}`);
console.log(`- Samples: ${samples.length}\n`);

// Verify campaigns have embedded location objects
console.log('Verifying campaigns have embedded location objects:');
let invalidCampaignLocations = 0;
campaigns.forEach(c => {
    if (!c.location || typeof c.location !== 'object') {
        console.log(`❌ Campaign ${c.id} is missing embedded location object`);
        invalidCampaignLocations++;
    } else if (!c.location.id) {
        console.log(`❌ Campaign ${c.id} has invalid location object (missing id)`);
        invalidCampaignLocations++;
    }
});
if (invalidCampaignLocations === 0) {
    console.log(`✓ All ${campaigns.length} campaigns have embedded location objects\n`);
} else {
    console.log(`❌ Found ${invalidCampaignLocations} campaigns with invalid location objects\n`);
}

// Verify campaigns have embedded organisation objects
console.log('Verifying campaigns have embedded organisation objects:');
let invalidCampaignOrgs = 0;
campaigns.forEach(c => {
    if (!c.organisation || typeof c.organisation !== 'object') {
        console.log(`❌ Campaign ${c.id} is missing embedded organisation object`);
        invalidCampaignOrgs++;
    } else if (!c.organisation.id) {
        console.log(`❌ Campaign ${c.id} has invalid organisation object (missing id)`);
        invalidCampaignOrgs++;
    }
});
if (invalidCampaignOrgs === 0) {
    console.log(`✓ All ${campaigns.length} campaigns have embedded organisation objects\n`);
} else {
    console.log(`❌ Found ${invalidCampaignOrgs} campaigns with invalid organisation objects\n`);
}

// Verify embedded locations match reference data
console.log('Verifying embedded locations match reference data:');
const locationMap = new Map(locations.map(l => [l.id, l]));
let mismatchedLocations = 0;
campaigns.forEach(c => {
    if (c.location && c.location.id) {
        const refLocation = locationMap.get(c.location.id);
        if (!refLocation) {
            console.log(`❌ Campaign ${c.id} has embedded location ${c.location.id} not found in reference data`);
            mismatchedLocations++;
        }
        // Could add deeper comparison here if needed
    }
});
if (mismatchedLocations === 0) {
    console.log(`✓ All embedded locations match reference data\n`);
} else {
    console.log(`❌ Found ${mismatchedLocations} embedded locations not in reference data\n`);
}

// Verify embedded organisations match reference data
console.log('Verifying embedded organisations match reference data:');
const orgMap = new Map(organisations.map(o => [o.id, o]));
let mismatchedOrgs = 0;
campaigns.forEach(c => {
    if (c.organisation && c.organisation.id) {
        const refOrg = orgMap.get(c.organisation.id);
        if (!refOrg) {
            console.log(`❌ Campaign ${c.id} has embedded organisation ${c.organisation.id} not found in reference data`);
            mismatchedOrgs++;
        }
        // Could add deeper comparison here if needed
    }
});
if (mismatchedOrgs === 0) {
    console.log(`✓ All embedded organisations match reference data\n`);
} else {
    console.log(`❌ Found ${mismatchedOrgs} embedded organisations not in reference data\n`);
}

// Verify campaign references in samples
console.log('Verifying sample -> campaign references:');
const campaignIds = new Set(campaigns.map(c => c.id));
let invalidSampleCampaigns = 0;
samples.forEach(s => {
    if (!campaignIds.has(s.campaign_id)) {
        console.log(`❌ Sample ${s.id} references invalid campaign_id ${s.campaign_id}`);
        invalidSampleCampaigns++;
    }
});
if (invalidSampleCampaigns === 0) {
    console.log(`✓ All ${samples.length} samples have valid campaign references\n`);
} else {
    console.log(`❌ Found ${invalidSampleCampaigns} invalid campaign references\n`);
}

// Verify samples don't have direct location_id (matryoshka effect)
console.log('Verifying samples follow matryoshka structure:');
let samplesWithDirectLocationId = 0;
samples.forEach(s => {
    if (s.location_id !== undefined) {
        console.log(`❌ Sample ${s.id} has direct location_id (should be accessed through campaign)`);
        samplesWithDirectLocationId++;
    }
});
if (samplesWithDirectLocationId === 0) {
    console.log(`✓ All ${samples.length} samples follow matryoshka structure (no direct location_id)\n`);
} else {
    console.log(`❌ Found ${samplesWithDirectLocationId} samples with direct location_id references\n`);
}

// Summary
const totalErrors = invalidCampaignLocations + invalidCampaignOrgs + mismatchedLocations +
                    mismatchedOrgs + invalidSampleCampaigns + samplesWithDirectLocationId;
console.log('=== Verification Summary ===');
if (totalErrors === 0) {
    console.log('✓ All data follows the matryoshka structure!');
    console.log('✓ Campaigns contain all information (location + organisation embedded)');
    console.log('✓ Samples reference campaigns only (no direct location references)');
    console.log('✓ Location and organisation reference data is maintained independently');
    process.exit(0);
} else {
    console.log(`❌ Found ${totalErrors} alignment errors.`);
    console.log('Please fix the data structure before proceeding.');
    process.exit(1);
}
