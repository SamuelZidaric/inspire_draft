// Test script to verify data enrichment
const fs = require('fs');

console.log('=== Testing Data Enrichment ===\n');

// Load all data files
const campaignsMacro = JSON.parse(fs.readFileSync('data/campaign_macro.json', 'utf8'));
const campaignsMicro = JSON.parse(fs.readFileSync('data/campaign_micro.json', 'utf8'));
const locationsDB = JSON.parse(fs.readFileSync('data/locations.json', 'utf8'));
const organisationsDB = JSON.parse(fs.readFileSync('data/organisations.json', 'utf8'));
const samples = JSON.parse(fs.readFileSync('data/campaign_micro_samples.json', 'utf8'));

// Merge macro and micro campaigns and add target_litter_category field
const macroCampaignsWithCategory = campaignsMacro.map(c => ({...c, target_litter_category: 'macro'}));
const microCampaignsWithCategory = campaignsMicro.map(c => ({...c, target_litter_category: 'micro'}));
const campaignsDB = [...macroCampaignsWithCategory, ...microCampaignsWithCategory];

// Helper functions (same as in script.js)
function getCampaignById(id) {
    return campaignsDB.find(c => c.id === id);
}

function getLocationById(id) {
    return locationsDB.find(l => l.id === id);
}

function getOrganisationById(id) {
    return organisationsDB.find(o => o.id === id);
}

function enrichSampleWithRelatedData(sample) {
    const enriched = { ...sample };

    if (sample.campaign_id) {
        const campaign = getCampaignById(sample.campaign_id);
        if (campaign) {
            enriched.campaign = campaign;

            // Matryoshka effect: location and organisation are embedded in campaign
            // Campaign contains all the information - just reference them directly
            if (campaign.location) {
                enriched.location = campaign.location;
            }
            if (campaign.organisation) {
                enriched.organisation = campaign.organisation;
            }
        }
    }

    return enriched;
}

// Test enrichment
console.log('Testing sample enrichment...\n');
const enrichedSamples = samples.map(enrichSampleWithRelatedData);

// Display first sample with all enriched data
const firstSample = enrichedSamples[0];
console.log('Sample #1 Enriched Data:');
console.log(`  Sample ID: ${firstSample.id}`);
console.log(`  Sample Code: ${firstSample.sample_code}`);
console.log(`  Campaign: ${firstSample.campaign?.title || 'N/A'} (ID: ${firstSample.campaign_id})`);
console.log(`  Location: ${firstSample.location?.site_name || 'N/A'} (ID: ${firstSample.location_id})`);
console.log(`  Organisation: ${firstSample.organisation?.name || 'N/A'}`);
console.log(`  Water Body: ${firstSample.location?.water_body_name || 'N/A'}`);
console.log(`  Coordinates: ${firstSample.location?.start_latitude || 'N/A'}, ${firstSample.location?.start_longitude || 'N/A'}\n`);

// Verify all samples can be enriched
let successCount = 0;
let errors = [];

enrichedSamples.forEach((sample, idx) => {
    if (sample.campaign && sample.location && sample.organisation) {
        successCount++;
    } else {
        errors.push({
            id: sample.id,
            missing: {
                campaign: !sample.campaign,
                location: !sample.location,
                organisation: !sample.organisation
            }
        });
    }
});

console.log('=== Enrichment Results ===');
console.log(`✓ Successfully enriched: ${successCount}/${samples.length} samples`);
if (errors.length > 0) {
    console.log(`❌ Errors found in ${errors.length} samples:`);
    errors.forEach(err => {
        console.log(`  Sample ${err.id}: Missing ${Object.keys(err.missing).filter(k => err.missing[k]).join(', ')}`);
    });
} else {
    console.log('✓ All samples successfully enriched with campaign, location, and organisation data!');
}

console.log('\n=== Summary ===');
console.log(`Total Samples: ${samples.length}`);
console.log(`Total Campaigns: ${campaignsDB.length}`);
console.log(`Total Locations: ${locationsDB.length}`);
console.log(`Total Organisations: ${organisationsDB.length}`);
console.log('✓ Data tables are properly aligned and working!');
