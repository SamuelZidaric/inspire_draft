// Data alignment verification script
const fs = require('fs');

console.log('=== Data Alignment Verification ===\n');

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

// Verify location references in campaigns
console.log('Verifying campaign -> location references:');
const locationIds = new Set(locations.map(l => l.id));
let invalidCampaignLocations = 0;
campaigns.forEach(c => {
    if (!locationIds.has(c.location_id)) {
        console.log(`❌ Campaign ${c.id} references invalid location_id ${c.location_id}`);
        invalidCampaignLocations++;
    }
});
if (invalidCampaignLocations === 0) {
    console.log(`✓ All ${campaigns.length} campaigns have valid location references\n`);
} else {
    console.log(`❌ Found ${invalidCampaignLocations} invalid location references\n`);
}

// Verify organisation references in campaigns
console.log('Verifying campaign -> organisation references:');
const orgIds = new Set(organisations.map(o => o.id));
let invalidCampaignOrgs = 0;
campaigns.forEach(c => {
    if (!orgIds.has(c.organisation_id)) {
        console.log(`❌ Campaign ${c.id} references invalid organisation_id ${c.organisation_id}`);
        invalidCampaignOrgs++;
    }
});
if (invalidCampaignOrgs === 0) {
    console.log(`✓ All ${campaigns.length} campaigns have valid organisation references\n`);
} else {
    console.log(`❌ Found ${invalidCampaignOrgs} invalid organisation references\n`);
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

// Verify location references in samples
console.log('Verifying sample -> location references:');
let invalidSampleLocations = 0;
samples.forEach(s => {
    if (!locationIds.has(s.location_id)) {
        console.log(`❌ Sample ${s.id} references invalid location_id ${s.location_id}`);
        invalidSampleLocations++;
    }
});
if (invalidSampleLocations === 0) {
    console.log(`✓ All ${samples.length} samples have valid location references\n`);
} else {
    console.log(`❌ Found ${invalidSampleLocations} invalid location references\n`);
}

// Summary
const totalErrors = invalidCampaignLocations + invalidCampaignOrgs + invalidSampleCampaigns + invalidSampleLocations;
console.log('=== Verification Summary ===');
if (totalErrors === 0) {
    console.log('✓ All data tables are properly aligned!');
    console.log('✓ All foreign key references are valid.');
    process.exit(0);
} else {
    console.log(`❌ Found ${totalErrors} alignment errors.`);
    console.log('Please fix the data before proceeding.');
    process.exit(1);
}
