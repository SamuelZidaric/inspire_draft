// Global state variables
let currentCampaignType = '';
let currentCampaignId = '';
let sensorUpdateInterval = null;
let currentDemoSite = '';
let solutionSourceView = '';

// Data containers - will be populated from JSON files
let demoSitesData = {};
let solutionsData = {};
let campaignData = {};
let campaignMicroSampleData = [];
let campaignMacroSampleData = [];
let campaignMacroSampleItemData = [];
let labAnalysisData = [];
let qualityControlData = [];

// Database-aligned data structures
let campaignsDB = [];
let locationsDB = [];
let organisationsDB = [];

// Loading state
let dataLoaded = false;
let dataLoadError = null;

// Data loader function
async function loadData() {
    try {
        showLoadingState();

        // Load all data files in parallel
        const [demoSites, solutions, campaigns, microSamples, macroSamples, macroSampleItems, labAnalysis, qualityControl, campaignsDb, locationsDb, organisationsDb] = await Promise.all([
            fetch('data/demo_sites.json').then(r => r.json()),
            fetch('data/solutions.json').then(r => r.json()),
            fetch('data/campaigns.json').then(r => r.json()),
            fetch('data/campaign_micro_samples.json').then(r => r.json()),
            fetch('data/campaign_macro_samples.json').then(r => r.json()),
            fetch('data/campaign_macro_sample_items.json').then(r => r.json()),
            fetch('data/lab_analysis.json').then(r => r.json()),
            fetch('data/quality_control.json').then(r => r.json()),
            fetch('data/campaigns_db.json').then(r => r.json()),
            fetch('data/locations.json').then(r => r.json()),
            fetch('data/organisations.json').then(r => r.json())
        ]);

        // Assign to global variables
        demoSitesData = demoSites;
        solutionsData = solutions;
        campaignData = campaigns;
        campaignMicroSampleData = microSamples;
        campaignMacroSampleData = macroSamples;
        campaignMacroSampleItemData = macroSampleItems;
        labAnalysisData = labAnalysis;
        qualityControlData = qualityControl;

        // Assign database-aligned structures
        campaignsDB = campaignsDb;
        locationsDB = locationsDb;
        organisationsDB = organisationsDb;

        dataLoaded = true;
        hideLoadingState();

        // Initialize locations and organisations views
        renderLocations();
        renderOrganisations();
        renderMacroCampaigns();
        renderOverviewCampaignTypes();

        console.log('✓ All data loaded successfully');
        console.log('✓ Database tables aligned:', {
            campaigns: campaignsDB.length,
            locations: locationsDB.length,
            organisations: organisationsDB.length,
            microSamples: campaignMicroSampleData.length,
            macroSamples: campaignMacroSampleData.length,
            macroSampleItems: campaignMacroSampleItemData.length
        });
        return true;
    } catch (error) {
        console.error('Error loading data:', error);
        dataLoadError = error;
        showErrorState(error);
        return false;
    }
}

// Helper functions for data relationships
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

function getAllEnrichedSamples() {
    return campaignMicroSampleData.map(enrichSampleWithRelatedData);
}

function enrichMacroSampleWithRelatedData(sample) {
    const enriched = { ...sample };

    if (sample.campaign_id) {
        const campaign = getCampaignById(sample.campaign_id);
        if (campaign) {
            enriched.campaign = campaign;

            // Matryoshka effect: location and organisation are embedded in campaign
            if (campaign.location) {
                enriched.location = campaign.location;
            }
            if (campaign.organisation) {
                enriched.organisation = campaign.organisation;
            }
        }
    }

    // Add items for this macro sample
    enriched.items = campaignMacroSampleItemData.filter(item => item.campaign_macro_sample_id === sample.id);

    return enriched;
}

function getAllEnrichedMacroSamples() {
    return campaignMacroSampleData.map(enrichMacroSampleWithRelatedData);
}

function getMacroSampleById(id) {
    return campaignMacroSampleData.find(s => s.id === id);
}

function getMacroSampleItemsBySampleId(sampleId) {
    return campaignMacroSampleItemData.filter(item => item.campaign_macro_sample_id === sampleId);
}

// Loading state UI functions
function showLoadingState() {
    const loadingHTML = `
        <div id="data-loading" style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255,255,255,0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        ">
            <div style="text-align: center;">
                <div class="loading" style="margin: 0 auto 20px;"></div>
                <h3 style="color: #333; margin-bottom: 10px;">Loading Data...</h3>
                <p style="color: #666;">Please wait while we fetch the monitoring data</p>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', loadingHTML);
}

function hideLoadingState() {
    const loader = document.getElementById('data-loading');
    if (loader) {
        loader.remove();
    }
}

function showErrorState(error) {
    const errorHTML = `
        <div id="data-error" style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            max-width: 500px;
            z-index: 9999;
        ">
            <h3 style="color: #dc3545; margin-bottom: 15px;">⚠ Data Loading Error</h3>
            <p style="color: #666; margin-bottom: 15px;">
                Failed to load application data. Please ensure you're running a local server.
            </p>
            <details style="margin-bottom: 15px;">
                <summary style="cursor: pointer; color: #007bff;">Technical Details</summary>
                <pre style="background: #f8f9fa; padding: 10px; border-radius: 4px; overflow-x: auto; font-size: 12px; margin-top: 10px;">${error.message}</pre>
            </details>
            <button onclick="location.reload()" style="
                background: #007bff;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 4px;
                cursor: pointer;
                font-weight: 600;
            ">Retry</button>
        </div>
    `;
    hideLoadingState();
    document.body.insertAdjacentHTML('beforeend', errorHTML);
}

// Initialize data loading when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadData);
} else {
    loadData();
}

function toggleDropdown(event) {
    event.stopPropagation();
    const dropdownItem = event.currentTarget;
    const submenu = dropdownItem.querySelector('.submenu');

    // Close other dropdowns
    document.querySelectorAll('.has-dropdown').forEach(item => {
        if (item !== dropdownItem) {
            item.classList.remove('open');
            item.querySelector('.submenu').classList.remove('open');
        }
    });

    // Toggle current dropdown
    dropdownItem.classList.toggle('open');
    submenu.classList.toggle('open');
}

function showView(viewId, event) {
    if (event) {
        event.stopPropagation();
    }

    // Clear sensor updates when leaving demo sites
    if (sensorUpdateInterval) {
        clearInterval(sensorUpdateInterval);
        sensorUpdateInterval = null;
    }

    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.add('hidden');
    });

    // Remove active class from all sidebar items and submenu items
    document.querySelectorAll('.sidebar li').forEach(item => {
        item.classList.remove('active');
    });

    // Show selected view
    document.getElementById(viewId).classList.remove('hidden');

    // Set active state
    if (viewId === 'micro' || viewId === 'macro') {
        // For submenu items, set the submenu item as active
        const submenuItem = document.querySelector(`.submenu li[onclick="showView('${viewId}', event)"]`);
        if (submenuItem) {
            submenuItem.classList.add('active');
        }
        currentCampaignType = viewId;
    } else {
        // For main menu items, set the main item as active
        const mainItem = document.querySelector(`.sidebar > ul > li[onclick="showView('${viewId}')"]`);
        if (mainItem) {
            mainItem.classList.add('active');
        }
    }
}

function showCampaignDetail(campaignId) {
    // Convert to number if string is passed
    const numericId = typeof campaignId === 'string' ? parseInt(campaignId) : campaignId;
    const campaign = getCampaignById(numericId);

    if (!campaign) {
        console.error(`Campaign not found with ID: ${campaignId}`);
        return;
    }

    currentCampaignId = numericId;

    // Get samples for this campaign based on campaign type
    const isMacroCampaign = campaign.target_litter_category === 'macro';
    const campaignSamples = isMacroCampaign
        ? campaignMacroSampleData.filter(sample => sample.campaign_id === numericId)
        : campaignMicroSampleData.filter(sample => sample.campaign_id === numericId);

    // Format dates
    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });

    // Get technology information
    const technology = technologyMap[campaign.technology_id] || { name: 'Unknown', description: 'No technology information available', category: 'N/A' };

    const samplesSection = campaignSamples.length > 0 ? `
        <div class="section">
            <h3>Campaign Samples (${campaignSamples.length})</h3>
            <div class="campaign-list">
                ${campaignSamples.map(sample => {
                    if (isMacroCampaign) {
                        // Macro sample display
                        const sampleItems = campaignMacroSampleItemData.filter(item => item.campaign_macro_sample_id === sample.id);
                        const topItems = sampleItems.slice(0, 3);

                        return `
                            <div class="campaign-item campaign-clickable" style="margin-bottom: 15px;" onclick="showMacroSampleDetail(${sample.id}, ${numericId})">
                                <div style="display: flex; justify-content: space-between; align-items: start;">
                                    <div>
                                        <h4 style="margin: 0 0 5px 0; color: #007bff;">${sample.sample_code}</h4>
                                        <div class="meta">
                                            ${sample.station_id} |
                                            <span class="status-active">${sample.data_type}</span> |
                                            ${formatDateTime(sample.sampling_date_start)}
                                        </div>
                                    </div>
                                    <div style="text-align: right;">
                                        <div style="font-size: 20px; font-weight: 600; color: #dc3545;">${sample.total_litter_ww ? sample.total_litter_ww.toFixed(2) : 'N/A'} kg</div>
                                        <div style="font-size: 11px; color: #666;">total wet weight</div>
                                    </div>
                                </div>
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px; margin-top: 10px;">
                                    <div style="background: #f8f9fa; padding: 8px; border-radius: 4px; font-size: 12px;">
                                        <div style="color: #666; margin-bottom: 2px;">Method</div>
                                        <div style="font-weight: 600;">${sample.sampling_method}</div>
                                    </div>
                                    <div style="background: #f8f9fa; padding: 8px; border-radius: 4px; font-size: 12px;">
                                        <div style="color: #666; margin-bottom: 2px;">Dry Weight</div>
                                        <div style="font-weight: 600;">${sample.total_litter_dw ? sample.total_litter_dw.toFixed(2) : 'N/A'} kg</div>
                                    </div>
                                    <div style="background: #f8f9fa; padding: 8px; border-radius: 4px; font-size: 12px;">
                                        <div style="color: #666; margin-bottom: 2px;">Item Types</div>
                                        <div style="font-weight: 600;">${sampleItems.length}</div>
                                    </div>
                                </div>
                                ${topItems.length > 0 ? `
                                    <div style="margin-top: 8px; padding: 10px; background: #f8f9fa; border-radius: 4px;">
                                        <div style="font-size: 11px; color: #666; margin-bottom: 5px;">Top Items:</div>
                                        ${topItems.map(item => `
                                            <div style="font-size: 12px; margin-bottom: 3px;">
                                                <strong>${item.name}</strong>: ${item.quantity} items
                                            </div>
                                        `).join('')}
                                        ${sampleItems.length > 3 ? `<div style="font-size: 11px; color: #666; margin-top: 3px;">+${sampleItems.length - 3} more types</div>` : ''}
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    } else {
                        // Micro sample display
                        const labAnalysis = labAnalysisData.find(la => la.campaign_micro_sample_id === sample.id);
                        const qc = qualityControlData.find(q => q.campaign_micro_sample_id === sample.id);

                        return `
                            <div class="campaign-item campaign-clickable" style="margin-bottom: 15px;" onclick="showSampleDetail(${sample.id}, ${numericId})">
                                <div style="display: flex; justify-content: space-between; align-items: start;">
                                    <div>
                                        <h4 style="margin: 0 0 5px 0; color: #007bff;">${sample.sample_code}</h4>
                                        <div class="meta">
                                            ${sample.station_id} |
                                            <span class="status-active">${sample.data_type}</span> |
                                            ${formatDateTime(sample.sampling_date_start)}
                                        </div>
                                    </div>
                                    <div style="text-align: right;">
                                        <div style="font-size: 20px; font-weight: 600; color: #28a745;">${sample.particles_total_concentration}</div>
                                        <div style="font-size: 11px; color: #666;">particles/m³</div>
                                    </div>
                                </div>
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px; margin-top: 10px;">
                                    <div style="background: #f8f9fa; padding: 8px; border-radius: 4px; font-size: 12px;">
                                        <div style="color: #666; margin-bottom: 2px;">Method</div>
                                        <div style="font-weight: 600;">${sample.sampling_method}</div>
                                    </div>
                                    <div style="background: #f8f9fa; padding: 8px; border-radius: 4px; font-size: 12px;">
                                        <div style="color: #666; margin-bottom: 2px;">Total Particles</div>
                                        <div style="font-weight: 600;">${sample.particles_total_count}</div>
                                    </div>
                                    <div style="background: #f8f9fa; padding: 8px; border-radius: 4px; font-size: 12px;">
                                        <div style="color: #666; margin-bottom: 2px;">Tire Wear</div>
                                        <div style="font-weight: 600;">${sample.tire_wear_concentration} µg/L</div>
                                    </div>
                                </div>
                                ${labAnalysis || qc ? `
                                    <div style="margin-top: 8px; display: flex; gap: 8px; font-size: 11px;">
                                        ${labAnalysis ? `<span class="tech-tag" style="background: #28a745;">Lab Analysis</span>` : ''}
                                        ${qc ? `<span class="tech-tag" style="background: #17a2b8;">QC Data</span>` : ''}
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }
                }).join('')}
            </div>
        </div>
    ` : `
        <div class="section">
            <h3>Campaign Samples</h3>
            <p style="color: #666; font-style: italic;">No samples have been collected for this campaign yet.</p>
        </div>
    `;

    const content = `
        <div class="breadcrumb">
            <a onclick="showView('overview')">Overview</a> >
            <a onclick="showView('${campaign.target_litter_category}')">${campaign.target_litter_category.charAt(0).toUpperCase() + campaign.target_litter_category.slice(1)} Campaigns</a> >
            ${campaign.title}
        </div>
        <h2>${campaign.title}</h2>

        <div class="campaign-details">
            <div>
                <div class="section">
                    <h3>Campaign Overview</h3>
                    <p><strong>Campaign Code:</strong> ${campaign.campaign_code}</p>
                    <p><strong>Status:</strong> <span class="status-${campaign.active ? 'active' : 'inactive'}">${campaign.active ? 'Active' : 'Inactive'}</span></p>
                    <p><strong>Category:</strong> ${campaign.target_litter_category.toUpperCase()}</p>
                    <p><strong>Duration:</strong> ${formatDate(campaign.campaign_date_start)} - ${formatDate(campaign.campaign_date_end)}</p>
                    <p><strong>Sampling Stations:</strong> ${campaign.number_of_sampling_stations}</p>
                    <p><strong>Budget:</strong> ${campaign.budget}</p>
                    <br>
                    <p>${campaign.description}</p>
                    ${campaign.notes ? `
                        <div style="margin-top: 15px; padding: 12px; background: #fff3cd; border-left: 3px solid #ffc107; border-radius: 4px;">
                            <strong>Notes:</strong> ${campaign.notes}
                        </div>
                    ` : ''}
                </div>

                <div class="section">
                    <h3>Organisation</h3>
                    <p><strong>Name:</strong> ${campaign.organisation.name}</p>
                    <p><strong>Address:</strong> ${campaign.organisation.address}, ${campaign.organisation.city}, ${campaign.organisation.postal_code}</p>
                    <p><strong>Contact:</strong> ${campaign.organisation.referent_email}</p>
                    ${campaign.organisation.website ? `<p><strong>Website:</strong> <a href="${campaign.organisation.website}" target="_blank" style="color: #007bff;">${campaign.organisation.website}</a></p>` : ''}
                    <p><strong>VAT:</strong> ${campaign.organisation.vat_number}</p>
                </div>

                <div class="section">
                    <h3>Location Details</h3>
                    <p><strong>Site:</strong> ${campaign.location.site_name || campaign.location.site}</p>
                    <p><strong>Water Body:</strong> ${campaign.location.water_body_name} (${campaign.location.water_body_type})</p>
                    <p><strong>Location:</strong> ${campaign.location.location}</p>
                    ${campaign.location.main_river ? `<p><strong>Main River:</strong> ${campaign.location.main_river}</p>` : ''}
                    <p><strong>Coordinates:</strong> ${campaign.location.start_latitude}, ${campaign.location.start_longitude}</p>
                    <p><strong>Timezone:</strong> ${campaign.location.timezone}</p>
                    ${campaign.location.is_demo_site ? `<p><span class="tech-tag" style="background: #17a2b8;">Demo Site</span></p>` : ''}
                </div>

                ${samplesSection}
            </div>

            <div>
                <div class="section">
                    <h3>Technologies Used</h3>
                    <div class="tech-item tech-clickable" style="margin-bottom: 10px;" onclick="showSolutionDetail('${technology.name}')">
                        <h5>${technology.name}</h5>
                        <div class="tech-meta">${technology.category} • Click to view details</div>
                        <p style="margin-top: 8px; font-size: 13px; color: #666;">${technology.description}</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('campaign-content').innerHTML = content;
    document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));
    document.getElementById('campaign-detail').classList.remove('hidden');
}

function showSolutionDetail(solutionName) {
    const solution = solutionsData[solutionName];
    if (!solution) return;

    // Determine source view - if we're currently viewing a campaign detail, mark as campaign
    // Otherwise, assume we came from solutions view
    const currentView = document.querySelector('.view:not(.hidden)');
    if (currentView && currentView.id === 'campaign-detail') {
        solutionSourceView = 'campaign';
    } else {
        solutionSourceView = 'solutions';
    }

    const sampleDataSection = solution.sampleData ? `
        <div class="section">
            <h3>Sample Data Output</h3>
            <div class="data-samples">
                ${solution.sampleData.map(sample => {
                    return `
                        <div class="sample-data">
                            <div class="sample-header">Data Sample - ${sample.timestamp}</div>
                            ${Object.entries(sample).filter(([key]) => key !== 'timestamp').map(([key, value]) =>
                                `<strong>${key.replace(/_/g, ' ').toUpperCase()}:</strong> ${value}`
                            ).join('<br>')}
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    ` : '';

    const content = `
        <div class="breadcrumb">
            <a onclick="showView('overview')">Overview</a> >
            <a onclick="showView('solutions')">Solutions</a> >
            ${solution.name}
        </div>
        <h2>${solution.name}</h2>

        <div class="section">
            <h3>Overview</h3>
            <div style="display: flex; align-items: center; gap: 30px; margin-bottom: 20px;">
                <div class="tech-3d-container" style="flex-shrink: 0;">
                    <div class="tech-3d-object">
                        <div class="tech-face tech-front"></div>
                        <div class="tech-face tech-back"></div>
                        <div class="tech-face tech-right"></div>
                        <div class="tech-face tech-left"></div>
                        <div class="tech-face tech-top"></div>
                        <div class="tech-face tech-bottom"></div>
                    </div>
                </div>
                <div>
                    <p><strong>Category:</strong> ${solution.category}</p>
                    <p><strong>Target Environment:</strong> ${solution.targetEnvironment}</p>
                    <p>${solution.description}</p>
                </div>
            </div>
        </div>

        <div class="section">
            <h3>Key Characteristics</h3>
            <div class="solution-characteristics">
                ${Object.entries(solution.characteristics).map(([key, char]) =>
                    `<div class="characteristic-item">
                        <h5>${key}</h5>
                        <div class="value">${char.value}</div>
                        <div class="description">${char.description}</div>
                    </div>`
                ).join('')}
            </div>
        </div>

        <div class="section">
            <h3>Performance Data</h3>
            <div class="performance-grid">
                ${Object.entries(solution.performance).map(([key, perf]) =>
                    `<div class="performance-card">
                        <div class="metric">${perf.value}</div>
                        <div class="label">${key}</div>
                        <div class="label">${perf.unit}</div>
                    </div>`
                ).join('')}
            </div>
        </div>

        ${sampleDataSection}

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
            <div class="section">
                <h3>Applications</h3>
                <ul>
                    ${solution.applications.map(app => `<li>${app}</li>`).join('')}
                </ul>
            </div>

            <div class="section">
                <h3>Advantages</h3>
                <ul>
                    ${solution.advantages.map(adv => `<li style="color: #28a745;">${adv}</li>`).join('')}
                </ul>
            </div>

            <div class="section">
                <h3>Limitations</h3>
                <ul>
                    ${solution.limitations.map(limit => `<li style="color: #dc3545;">${limit}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;

    document.getElementById('solution-content').innerHTML = content;
    document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));
    document.getElementById('solution-detail').classList.remove('hidden');
}

function goBackFromSolution() {
    if (solutionSourceView === 'campaign' && currentCampaignId) {
        showCampaignDetail(currentCampaignId);
    } else {
        showView('solutions');
    }
}

function goBackToCampaign() {
    if (currentCampaignId) {
        showCampaignDetail(currentCampaignId);
    } else {
        showView(currentCampaignType || 'overview');
    }
}

function showDemoSite(siteId, event) {
    if (event) {
        event.stopPropagation();
    }

    const site = demoSitesData[siteId];
    if (!site) return;

    currentDemoSite = siteId;

    // Clear any existing sensor update interval
    if (sensorUpdateInterval) {
        clearInterval(sensorUpdateInterval);
    }

    const content = `
        <div class="breadcrumb">
            <a onclick="showView('overview')">Overview</a> > Demo Sites > ${site.name}
        </div>
        <h2><span class="live-indicator"></span>${site.name}</h2>

        <div class="site-info">
            <div class="site-details">
                <div class="section">
                    <h3>Site Information</h3>
                    <p><strong>Location:</strong> ${site.location}</p>
                    <p><strong>Type:</strong> ${site.type}</p>
                    <p><strong>Coordinates:</strong> ${site.coordinates}</p>
                    <p><strong>Capacity:</strong> ${site.capacity}</p>
                    <p><strong>Commissioned:</strong> ${site.commissioning}</p>
                    <p><strong>Description:</strong> ${site.description}</p>
                </div>

                <div class="section">
                    <h3>Deployed Technologies</h3>
                    <ul>
                        ${site.technologies.map(tech => `<li>${tech}</li>`).join('')}
                    </ul>
                </div>
            </div>

            <div class="site-image">
                <h4>Monitoring Station</h4>
                <p>Real-time sensor array<br>Active since ${site.commissioning}</p>
                <div style="margin-top: 20px; font-size: 24px;">🏭🌊📊</div>
            </div>
        </div>

        <div class="section">
            <h3>Live Sensor Data</h3>
            <div class="sensor-grid" id="sensor-grid-${siteId}">
                ${generateSensorCards(site.sensors, siteId)}
            </div>
        </div>
    `;

    document.getElementById('demo-site-content').innerHTML = content;
    document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));
    document.getElementById('demo-site').classList.remove('hidden');

    // Remove active class from all sidebar items
    document.querySelectorAll('.sidebar li').forEach(item => {
        item.classList.remove('active');
    });

    // Set active state for demo site submenu item
    const demoMenuItem = document.querySelector(`.submenu li[onclick="showDemoSite('${siteId}', event)"]`);
    if (demoMenuItem) {
        demoMenuItem.classList.add('active');
    }

    // Start sensor data cycling
    startSensorCycling(siteId);
}

function generateSensorCards(sensors, siteId) {
    return Object.entries(sensors).map(([key, sensor]) => {
        const status = getSensorStatus(sensor);
        const trend = getSensorTrend();
        const timestamp = new Date().toLocaleTimeString();

        return `
            <div class="sensor-card" id="sensor-${siteId}-${key}">
                <h4>${sensor.name}</h4>
                <div class="sensor-value" id="value-${siteId}-${key}">${sensor.current}</div>
                <div class="sensor-unit">${sensor.unit}</div>
                <div class="sensor-status ${status.class}" id="status-${siteId}-${key}">${status.text}</div>
                <div class="sensor-trend ${trend.class}" id="trend-${siteId}-${key}">${trend.text}</div>
                <div class="sensor-timestamp" id="timestamp-${siteId}-${key}">Last update: ${timestamp}</div>
            </div>
        `;
    }).join('');
}

function getSensorStatus(sensor) {
    const value = sensor.current;
    const [optimalMin, optimalMax] = sensor.optimal;

    if (value >= optimalMin && value <= optimalMax) {
        return { class: 'normal', text: 'Normal' };
    } else if (value >= sensor.min && value <= sensor.max) {
        return { class: 'warning', text: 'Warning' };
    } else {
        return { class: 'critical', text: 'Critical' };
    }
}

function getSensorTrend() {
    const trends = [
        { class: 'trend-up', text: '↗ Trending up' },
        { class: 'trend-down', text: '↘ Trending down' },
        { class: 'trend-stable', text: '→ Stable' }
    ];
    return trends[Math.floor(Math.random() * trends.length)];
}

function startSensorCycling(siteId) {
    sensorUpdateInterval = setInterval(() => {
        updateSensorData(siteId);
    }, 3000); // Update every 3 seconds
}

function updateSensorData(siteId) {
    const site = demoSitesData[siteId];
    if (!site) return;

    Object.entries(site.sensors).forEach(([key, sensor]) => {
        // Generate realistic fluctuation within sensor range
        const range = sensor.max - sensor.min;
        const fluctuation = (Math.random() - 0.5) * (range * 0.05); // 5% fluctuation
        let newValue = sensor.current + fluctuation;

        // Keep within bounds
        newValue = Math.max(sensor.min, Math.min(sensor.max, newValue));

        // Round to appropriate decimal places
        newValue = Math.round(newValue * 100) / 100;

        // Update the data
        site.sensors[key].current = newValue;

        // Update the display
        const valueElement = document.getElementById(`value-${siteId}-${key}`);
        const statusElement = document.getElementById(`status-${siteId}-${key}`);
        const trendElement = document.getElementById(`trend-${siteId}-${key}`);
        const timestampElement = document.getElementById(`timestamp-${siteId}-${key}`);

        if (valueElement) {
            valueElement.textContent = newValue;
        }

        if (statusElement) {
            const status = getSensorStatus(sensor);
            statusElement.className = `sensor-status ${status.class}`;
            statusElement.textContent = status.text;
        }

        if (trendElement) {
            const trend = getSensorTrend();
            trendElement.className = `sensor-trend ${trend.class}`;
            trendElement.textContent = trend.text;
        }

        if (timestampElement) {
            timestampElement.textContent = `Last update: ${new Date().toLocaleTimeString()}`;
        }
    });
}

function goBackToCampaigns() {
    showView(currentCampaignType);
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
    if (!event.target.closest('.has-dropdown')) {
        document.querySelectorAll('.has-dropdown').forEach(item => {
            item.classList.remove('open');
            item.querySelector('.submenu').classList.remove('open');
        });
    }
});

// Technology mapping based on campaign IDs
const technologyMap = {
    1: { name: 'Manta Net', description: 'Surface trawling net for microplastic sampling', category: 'Detection' },
    2: { name: 'Clera Filtration Unit', description: 'Special membrane filtration for micro-filtration', category: 'Collection' },
    3: { name: 'Ferrybox Sampling', description: 'Water sampling device', category: 'Detection' },
    4: { name: 'Manta Net', description: 'Surface trawling net for microplastic sampling', category: 'Detection' }
};

// Helper function for formatting dates
function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatCoordinate(lat, lon) {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(4)}° ${lonDir}`;
}

// Locations rendering function
// Show location detail
function showLocationDetail(locationId) {
    const numericId = typeof locationId === 'string' ? parseInt(locationId) : locationId;
    const location = locationsDB.find(l => l.id === numericId);

    if (!location) {
        console.error(`Location not found with ID: ${locationId}`);
        return;
    }

    // Find campaigns using this location
    const campaignsAtLocation = campaignsDB.filter(c => c.location.id === numericId);

    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });

    const content = `
        <div class="breadcrumb">
            <a onclick="showView('overview')">Overview</a> >
            <a onclick="showView('locations')">Locations</a> >
            ${location.site_name || location.site}
        </div>
        <h2>${location.site}</h2>

        <div class="campaign-details">
            <div>
                <div class="section">
                    <h3>Location Overview</h3>
                    <p><strong>Site Name:</strong> ${location.site_name}</p>
                    <p><strong>Water Body:</strong> ${location.water_body_name} (${location.water_body_type})</p>
                    <p><strong>Country:</strong> ${location.location}</p>
                    ${location.main_river ? `<p><strong>Main River:</strong> ${location.main_river}</p>` : ''}
                    <p><strong>Timezone:</strong> ${location.timezone}</p>
                    ${location.is_demo_site ? `<p><span class="tech-tag" style="background: #17a2b8;">Demo Site</span></p>` : ''}
                </div>

                <div class="section">
                    <h3>Geographic Coordinates</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                            <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Start Point</div>
                            <div style="font-weight: 600; font-size: 16px;">${formatCoordinate(parseFloat(location.start_latitude), parseFloat(location.start_longitude))}</div>
                        </div>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                            <div style="font-size: 12px; color: #666; margin-bottom: 5px;">End Point</div>
                            <div style="font-weight: 600; font-size: 16px;">${formatCoordinate(parseFloat(location.end_latitude), parseFloat(location.end_longitude))}</div>
                        </div>
                    </div>
                </div>

                ${campaignsAtLocation.length > 0 ? `
                    <div class="section">
                        <h3>Campaigns at this Location (${campaignsAtLocation.length})</h3>
                        <div class="campaign-list">
                            ${campaignsAtLocation.map(campaign => `
                                <div class="campaign-item campaign-clickable" onclick="showCampaignDetail(${campaign.id})">
                                    <h4>${campaign.title}</h4>
                                    <div class="meta">
                                        ${campaign.campaign_code} |
                                        <span class="status-${campaign.active ? 'active' : 'inactive'}">${campaign.active ? 'Active' : 'Inactive'}</span> |
                                        ${formatDate(campaign.campaign_date_start)} - ${formatDate(campaign.campaign_date_end)}
                                    </div>
                                    <p style="margin-top: 8px; font-size: 13px;">${campaign.description}</p>
                                    <div style="margin-top: 8px;">
                                        <span class="tech-tag">${campaign.lead}</span>
                                        <span class="tech-tag">${campaign.budget}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : `
                    <div class="section">
                        <h3>Campaigns at this Location</h3>
                        <p style="color: #666; font-style: italic;">No campaigns are currently running at this location.</p>
                    </div>
                `}
            </div>
        </div>
    `;

    document.getElementById('location-content').innerHTML = content;
    document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));
    document.getElementById('location-detail').classList.remove('hidden');
}

// Show organisation detail
function showOrganisationDetail(orgId) {
    const numericId = typeof orgId === 'string' ? parseInt(orgId) : orgId;
    const organisation = organisationsDB.find(o => o.id === numericId);

    if (!organisation) {
        console.error(`Organisation not found with ID: ${orgId}`);
        return;
    }

    // Find campaigns led by this organisation
    const orgCampaigns = campaignsDB.filter(c => c.organisation.id === numericId);

    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });

    const content = `
        <div class="breadcrumb">
            <a onclick="showView('overview')">Overview</a> >
            <a onclick="showView('organisations')">Organisations</a> >
            ${organisation.name}
        </div>
        <h2>${organisation.name}</h2>

        <div class="campaign-details">
            <div>
                <div class="section">
                    <h3>Organisation Details</h3>
                    <p><strong>Type:</strong> ${organisation.organisation_type_id === 1 ? 'Research Institute' : organisation.organisation_type_id === 2 ? 'University' : 'Organisation'}</p>
                    <p><strong>Location:</strong> ${organisation.city}, ${organisation.state_region}</p>
                    <p><strong>Country:</strong> Country ID ${organisation.country_id}</p>
                    ${organisation.emodnet_originator ? `<p><span class="tech-tag" style="background: #28a745;">EMODnet Originator</span></p>` : ''}
                </div>

                <div class="section">
                    <h3>Contact Information</h3>
                    <p><strong>Address:</strong> ${organisation.address}</p>
                    <p><strong>Postal Code:</strong> ${organisation.postal_code}</p>
                    <p><strong>City:</strong> ${organisation.city}</p>
                    <p><strong>State/Region:</strong> ${organisation.state_region}</p>
                    <p><strong>Phone:</strong> ${organisation.telephone}</p>
                    <p><strong>Referent Email:</strong> <a href="mailto:${organisation.referent_email}" style="color: #007bff;">${organisation.referent_email}</a></p>
                    <p><strong>Administrative Email:</strong> <a href="mailto:${organisation.administrative_email}" style="color: #007bff;">${organisation.administrative_email}</a></p>
                    ${organisation.website ? `<p><strong>Website:</strong> <a href="${organisation.website}" target="_blank" style="color: #007bff;">${organisation.website}</a></p>` : ''}
                </div>

                <div class="section">
                    <h3>Administrative Information</h3>
                    <p><strong>VAT Number:</strong> ${organisation.vat_number}</p>
                    <p><strong>Status:</strong> <span class="status-${organisation.active ? 'active' : 'inactive'}">${organisation.active ? 'Active' : 'Inactive'}</span></p>
                </div>

                ${orgCampaigns.length > 0 ? `
                    <div class="section">
                        <h3>Campaigns Led by this Organisation (${orgCampaigns.length})</h3>
                        <div class="campaign-list">
                            ${orgCampaigns.map(campaign => `
                                <div class="campaign-item campaign-clickable" onclick="showCampaignDetail(${campaign.id})">
                                    <h4>${campaign.title}</h4>
                                    <div class="meta">
                                        ${campaign.campaign_code} |
                                        <span class="status-${campaign.active ? 'active' : 'inactive'}">${campaign.active ? 'Active' : 'Inactive'}</span> |
                                        ${formatDate(campaign.campaign_date_start)} - ${formatDate(campaign.campaign_date_end)}
                                    </div>
                                    <p style="margin-top: 8px; font-size: 13px;">${campaign.description}</p>
                                    <div style="margin-top: 8px;">
                                        <span class="tech-tag">${campaign.location.location}</span>
                                        <span class="tech-tag">${campaign.budget}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : `
                    <div class="section">
                        <h3>Campaigns Led by this Organisation</h3>
                        <p style="color: #666; font-style: italic;">This organisation is not currently leading any campaigns.</p>
                    </div>
                `}
            </div>
        </div>
    `;

    document.getElementById('organisation-content').innerHTML = content;
    document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));
    document.getElementById('organisation-detail').classList.remove('hidden');
}

// Show sample detail
let previousViewBeforeSample = 'micro';

function showSampleDetail(sampleId, fromCampaignId = null) {
    const numericId = typeof sampleId === 'string' ? parseInt(sampleId) : sampleId;
    const sample = campaignMicroSampleData.find(s => s.id === numericId);

    if (!sample) {
        console.error(`Sample not found with ID: ${sampleId}`);
        return;
    }

    if (fromCampaignId) {
        previousViewBeforeSample = 'campaign-detail';
        currentCampaignId = fromCampaignId;
    }

    const campaign = getCampaignById(sample.campaign_id);
    const labAnalysis = labAnalysisData.find(la => la.campaign_micro_sample_id === numericId);
    const qc = qualityControlData.find(q => q.campaign_micro_sample_id === numericId);

    const content = `
        <div class="breadcrumb">
            <a onclick="showView('overview')">Overview</a> >
            ${campaign ? `<a onclick="showCampaignDetail(${campaign.id})">${campaign.title}</a> >` : ''}
            ${sample.sample_code}
        </div>
        <h2>Sample: ${sample.sample_code}</h2>

        <div class="campaign-details">
            <div>
                <div class="section">
                    <h3>Sample Overview</h3>
                    <p><strong>Sample Code:</strong> ${sample.sample_code}</p>
                    <p><strong>Campaign:</strong> ${campaign ? `<a onclick="showCampaignDetail(${campaign.id})" style="color: #007bff; cursor: pointer;">${campaign.title}</a>` : 'Unknown'}</p>
                    <p><strong>Station ID:</strong> ${sample.station_id}</p>
                    <p><strong>Data Type:</strong> <span class="status-active">${sample.data_type}</span></p>
                    <p><strong>Monitoring Type:</strong> ${sample.spatial_or_temporal_monitoring}</p>
                </div>

                <div class="section">
                    <h3>Sampling Details</h3>
                    <p><strong>Method:</strong> ${sample.sampling_method}</p>
                    <p><strong>Instrument:</strong> ${sample.sampling_instrument} (${sample.sampling_instrument_group})</p>
                    <p><strong>Protocol:</strong> ${sample.sampling_protocol_reference}</p>
                    <p><strong>Date/Time:</strong> ${formatDateTime(sample.sampling_date_start)} - ${formatDateTime(sample.sampling_date_end)}</p>
                    <p><strong>Duration:</strong> ${sample.sampling_duration_hours} hours</p>
                    <p><strong>Time Reference:</strong> ${sample.sampling_time_reference}</p>
                </div>

                <div class="section">
                    <h3>Location & Survey</h3>
                    <p><strong>Start Coordinates:</strong> ${formatCoordinate(parseFloat(sample.sampling_latitude_start), parseFloat(sample.sampling_longitude_start))}</p>
                    <p><strong>End Coordinates:</strong> ${formatCoordinate(parseFloat(sample.sampling_latitude_end), parseFloat(sample.sampling_longitude_end))}</p>
                    <p><strong>Survey Length:</strong> ${sample.survey_length}</p>
                    <p><strong>Survey Width:</strong> ${sample.survey_width}</p>
                </div>

                <div class="section">
                    <h3>Flowmeter Data</h3>
                    <p><strong>Model:</strong> ${sample.flowmeter_model}</p>
                    <p><strong>Equation:</strong> <code>${sample.flowmeter_equation}</code></p>
                    <p><strong>Start Count:</strong> ${sample.flowmeter_start_count}</p>
                    <p><strong>End Count:</strong> ${sample.flowmeter_end_count}</p>
                </div>

                <div class="section">
                    <h3>Particle Analysis</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; border-left: 4px solid #2196f3;">
                            <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Total Count</div>
                            <div style="font-weight: 600; font-size: 24px; color: #2196f3;">${sample.particles_total_count}</div>
                            <div style="font-size: 11px; color: #666;">particles</div>
                        </div>
                        <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; border-left: 4px solid #4caf50;">
                            <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Concentration</div>
                            <div style="font-weight: 600; font-size: 24px; color: #4caf50;">${sample.particles_total_concentration}</div>
                        </div>
                        <div style="background: #fff3e0; padding: 15px; border-radius: 8px; border-left: 4px solid #ff9800;">
                            <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Total Weight</div>
                            <div style="font-weight: 600; font-size: 24px; color: #ff9800;">${sample.particles_total_weight}</div>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <h3>Tire Wear Particles</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                        <div style="background: #f3e5f5; padding: 15px; border-radius: 8px;">
                            <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Tire Marker</div>
                            <div style="font-weight: 600; font-size: 18px;">${sample.tire_marker_concentration} µg/L</div>
                        </div>
                        <div style="background: #f3e5f5; padding: 15px; border-radius: 8px;">
                            <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Tire Wear</div>
                            <div style="font-weight: 600; font-size: 18px;">${sample.tire_wear_concentration} µg/L</div>
                        </div>
                        <div style="background: #f3e5f5; padding: 15px; border-radius: 8px;">
                            <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Tire Wear (Volume)</div>
                            <div style="font-weight: 600; font-size: 18px;">${sample.tire_wear_concentration_volume} µg/L</div>
                        </div>
                        <div style="background: #f3e5f5; padding: 15px; border-radius: 8px;">
                            <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Leachable Total</div>
                            <div style="font-weight: 600; font-size: 18px;">${sample.tire_wear_leachable_total_concentration} µg/L</div>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <h3>Sample Details</h3>
                    <p><strong>Total Samples:</strong> ${sample.total_samples}</p>
                    <p><strong>Replicate Count:</strong> ${sample.replicate_count}</p>
                    <p><strong>Quadrant Placement:</strong> ${sample.quadrant_placement}</p>
                    <p><strong>Compartment Type:</strong> ${sample.compartment_type}</p>
                    ${sample.notes ? `
                        <div style="margin-top: 15px; padding: 12px; background: #fff3cd; border-left: 3px solid #ffc107; border-radius: 4px;">
                            <strong>Notes:</strong> ${sample.notes}
                        </div>
                    ` : ''}
                </div>

                ${labAnalysis || qc ? `
                    <div class="section">
                        <h3>Quality Control & Lab Analysis</h3>
                        ${labAnalysis ? `<span class="tech-tag" style="background: #28a745; margin-right: 8px;">Lab Analysis Available</span>` : ''}
                        ${qc ? `<span class="tech-tag" style="background: #17a2b8;">QC Data Available</span>` : ''}
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    document.getElementById('sample-content').innerHTML = content;
    document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));
    document.getElementById('sample-detail').classList.remove('hidden');
}

function showMacroSampleDetail(sampleId, fromCampaignId = null) {
    const numericId = typeof sampleId === 'string' ? parseInt(sampleId) : sampleId;
    const sample = campaignMacroSampleData.find(s => s.id === numericId);

    if (!sample) {
        console.error(`Macro sample not found with ID: ${sampleId}`);
        return;
    }

    if (fromCampaignId) {
        previousViewBeforeSample = 'campaign-detail';
        currentCampaignId = fromCampaignId;
    }

    const campaign = getCampaignById(sample.campaign_id);
    const sampleItems = campaignMacroSampleItemData.filter(item => item.campaign_macro_sample_id === numericId);

    // Calculate total items
    const totalItems = sampleItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

    const content = `
        <div class="breadcrumb">
            <a onclick="showView('overview')">Overview</a> >
            ${campaign ? `<a onclick="showCampaignDetail(${campaign.id})">${campaign.title}</a> >` : ''}
            ${sample.sample_code}
        </div>
        <h2>Macro Sample: ${sample.sample_code}</h2>

        <div class="campaign-details">
            <div>
                <div class="section">
                    <h3>Sample Overview</h3>
                    <p><strong>Sample Code:</strong> ${sample.sample_code}</p>
                    <p><strong>Campaign:</strong> ${campaign ? `<a onclick="showCampaignDetail(${campaign.id})" style="color: #007bff; cursor: pointer;">${campaign.title}</a>` : 'Unknown'}</p>
                    <p><strong>Station ID:</strong> ${sample.station_id}</p>
                    <p><strong>Data Type:</strong> <span class="status-active">${sample.data_type}</span></p>
                    <p><strong>Monitoring Type:</strong> ${sample.spatial_or_temporal_monitoring}</p>
                </div>

                <div class="section">
                    <h3>Sampling Details</h3>
                    <p><strong>Method:</strong> ${sample.sampling_method}</p>
                    <p><strong>Instrument:</strong> ${sample.sampling_instrument || 'N/A'}</p>
                    <p><strong>Protocol:</strong> ${sample.sampling_protocol_reference}</p>
                    <p><strong>Date/Time:</strong> ${formatDateTime(sample.sampling_date_start)} - ${formatDateTime(sample.sampling_date_end)}</p>
                    <p><strong>Duration:</strong> ${sample.sampling_duration_hours} hours</p>
                    <p><strong>Time Reference:</strong> ${sample.sampling_time_reference || 'N/A'}</p>
                </div>

                <div class="section">
                    <h3>Location & Survey</h3>
                    <p><strong>Start Coordinates:</strong> ${formatCoordinate(parseFloat(sample.sampling_latitude_start), parseFloat(sample.sampling_longitude_start))}</p>
                    <p><strong>End Coordinates:</strong> ${formatCoordinate(parseFloat(sample.sampling_latitude_end), parseFloat(sample.sampling_longitude_end))}</p>
                    <p><strong>Survey Length:</strong> ${sample.survey_length} m</p>
                    <p><strong>Survey Width:</strong> ${sample.survey_width} m</p>
                    ${sample.altitude ? `<p><strong>Altitude:</strong> ${sample.altitude} m</p>` : ''}
                </div>

                <div class="section">
                    <h3>Litter Analysis</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                        <div style="background: #ffebee; padding: 15px; border-radius: 8px; border-left: 4px solid #f44336;">
                            <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Total Wet Weight</div>
                            <div style="font-weight: 600; font-size: 24px; color: #f44336;">${sample.total_litter_ww ? sample.total_litter_ww.toFixed(2) : 'N/A'}</div>
                            <div style="font-size: 11px; color: #666;">kg</div>
                        </div>
                        <div style="background: #fff3e0; padding: 15px; border-radius: 8px; border-left: 4px solid #ff9800;">
                            <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Total Dry Weight</div>
                            <div style="font-weight: 600; font-size: 24px; color: #ff9800;">${sample.total_litter_dw ? sample.total_litter_dw.toFixed(2) : 'N/A'}</div>
                            <div style="font-size: 11px; color: #666;">kg</div>
                        </div>
                        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; border-left: 4px solid #2196f3;">
                            <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Total Items</div>
                            <div style="font-weight: 600; font-size: 24px; color: #2196f3;">${totalItems}</div>
                            <div style="font-size: 11px; color: #666;">individual items</div>
                        </div>
                        <div style="background: #f3e5f5; padding: 15px; border-radius: 8px; border-left: 4px solid #9c27b0;">
                            <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Item Types</div>
                            <div style="font-weight: 600; font-size: 24px; color: #9c27b0;">${sampleItems.length}</div>
                            <div style="font-size: 11px; color: #666;">categories</div>
                        </div>
                    </div>
                </div>

                ${sampleItems.length > 0 ? `
                    <div class="section">
                        <h3>Litter Items Collected</h3>
                        <div style="overflow-x: auto;">
                            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                                <thead>
                                    <tr style="background: #f8f9fa; border-bottom: 2px solid #dee2e6;">
                                        <th style="padding: 12px; text-align: left;">Item Type</th>
                                        <th style="padding: 12px; text-align: right;">Quantity</th>
                                        <th style="padding: 12px; text-align: left;">Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${sampleItems.sort((a, b) => (b.quantity || 0) - (a.quantity || 0)).map((item, index) => `
                                        <tr style="border-bottom: 1px solid #dee2e6; ${index % 2 === 0 ? 'background: #f8f9fa;' : ''}">
                                            <td style="padding: 10px; font-weight: 600;">${item.name}</td>
                                            <td style="padding: 10px; text-align: right; color: #dc3545; font-weight: 600;">${item.quantity}</td>
                                            <td style="padding: 10px; color: #666; font-size: 12px;">${item.notes || '-'}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ` : ''}

                <div class="section">
                    <h3>Sample Details</h3>
                    <p><strong>Total Stations:</strong> ${sample.total_stations || 'N/A'}</p>
                    <p><strong>Total Samples:</strong> ${sample.total_samples || 'N/A'}</p>
                    <p><strong>Replicate Count:</strong> ${sample.replicate_count || 'N/A'}</p>
                    ${sample.quadrant_placement ? `<p><strong>Quadrant Placement:</strong> ${sample.quadrant_placement}</p>` : ''}
                    ${sample.compartment_type ? `<p><strong>Compartment Type:</strong> ${sample.compartment_type}</p>` : ''}
                    ${sample.notes ? `
                        <div style="margin-top: 15px; padding: 12px; background: #fff3cd; border-left: 3px solid #ffc107; border-radius: 4px;">
                            <strong>Notes:</strong> ${sample.notes}
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    document.getElementById('sample-content').innerHTML = content;
    document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));
    document.getElementById('sample-detail').classList.remove('hidden');
}

function goBackFromSample() {
    if (previousViewBeforeSample === 'campaign-detail' && currentCampaignId) {
        showCampaignDetail(currentCampaignId);
    } else {
        showView('micro');
    }
}

function renderLocations() {
    const container = document.getElementById('locations-container');
    if (!container || !locationsDB || locationsDB.length === 0) return;

    const html = locationsDB.map(location => {
        return `
            <div class="campaign-item campaign-clickable" onclick="showLocationDetail(${location.id})">
                <h4>${location.site}</h4>
                <div class="meta">
                    ${location.location} | ${location.water_body_type} |
                    ${location.is_demo_site ? '<span class="tech-tag" style="background: #17a2b8;">Demo Site</span>' : ''}
                </div>
                <div style="margin-top: 10px;">
                    <p><strong>Water Body:</strong> ${location.water_body_name}</p>
                    <p><strong>Site Name:</strong> ${location.site_name}</p>
                    ${location.main_river ? `<p><strong>Main River:</strong> ${location.main_river}</p>` : ''}
                    <p><strong>Timezone:</strong> ${location.timezone}</p>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px;">
                    <div>
                        <div style="font-size: 12px; color: #666;">Start Coordinates</div>
                        <div style="font-weight: 600;">${formatCoordinate(parseFloat(location.start_latitude), parseFloat(location.start_longitude))}</div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: #666;">End Coordinates</div>
                        <div style="font-weight: 600;">${formatCoordinate(parseFloat(location.end_latitude), parseFloat(location.end_longitude))}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

// Organisations rendering function
function renderOrganisations() {
    const container = document.getElementById('organisations-container');
    if (!container || !organisationsDB || organisationsDB.length === 0) return;

    const html = organisationsDB.map(org => {
        return `
            <div class="campaign-item campaign-clickable" onclick="showOrganisationDetail(${org.id})">
                <h4>${org.name}</h4>
                <div class="meta">
                    ${org.city}, ${org.state_region} |
                    <span class="status-active">Active</span>
                </div>
                <div style="margin-top: 10px;">
                    <p><strong>Address:</strong> ${org.address}, ${org.postal_code} ${org.city}</p>
                    <p><strong>Contact:</strong> ${org.referent_email}</p>
                    <p><strong>Administrative:</strong> ${org.administrative_email}</p>
                    <p><strong>Phone:</strong> ${org.telephone}</p>
                    ${org.website ? `<p><strong>Website:</strong> <a href="${org.website}" target="_blank" style="color: #007bff;">${org.website}</a></p>` : ''}
                </div>
                <div style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px;">
                    <p style="margin: 0;"><strong>VAT Number:</strong> ${org.vat_number}</p>
                    ${org.emodnet_originator ? '<span class="tech-tag" style="background: #28a745; margin-top: 8px; display: inline-block;">EMODnet Originator</span>' : ''}
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

// Overview campaign types rendering function
function renderOverviewCampaignTypes() {
    const container = document.getElementById('campaign-types-grid');
    if (!container || !campaignsDB || campaignsDB.length === 0) return;

    // Count campaigns by type
    const microCount = campaignsDB.filter(c => c.target_litter_category === 'micro').length;
    const macroCount = campaignsDB.filter(c => c.target_litter_category === 'macro').length;

    const html = `
        <div onclick="showView('micro')" style="cursor: pointer; padding: 20px; border: 2px solid #007bff; border-radius: 8px; text-align: center;">
            <h4>Micro Campaigns</h4>
            <div class="number" style="color: #007bff;">${microCount}</div>
            <p>Microplastic monitoring campaigns</p>
        </div>
        <div onclick="showView('macro')" style="cursor: pointer; padding: 20px; border: 2px solid #dc3545; border-radius: 8px; text-align: center;">
            <h4>Macro Campaigns</h4>
            <div class="number" style="color: #dc3545;">${macroCount}</div>
            <p>Macrolitter monitoring campaigns</p>
        </div>
    `;

    container.innerHTML = html;
}

// Macro campaigns rendering function
function renderMacroCampaigns() {
    const container = document.getElementById('macro-campaigns-container');
    const titleElement = document.getElementById('macro-campaigns-title');

    if (!container) return;

    // Filter campaigns by macro category
    const macroCampaigns = campaignsDB.filter(c => c.target_litter_category === 'macro');

    if (titleElement) {
        titleElement.textContent = `Macro Campaigns (${macroCampaigns.length})`;
    }

    if (macroCampaigns.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666; background: #f8f9fa; border-radius: 8px;">
                <h3 style="color: #333; margin-bottom: 10px;">No Macro Campaigns Yet</h3>
                <p>Macro litter campaigns will appear here once created.</p>
            </div>
        `;
        return;
    }

    const formatYear = (dateStr) => new Date(dateStr).getFullYear();
    const getYearRange = (start, end) => {
        const startYear = formatYear(start);
        const endYear = formatYear(end);
        return startYear === endYear ? startYear : `${startYear}-${endYear}`;
    };

    const html = macroCampaigns.map(campaign => {
        const sampleCount = campaignMacroSampleData.filter(s => s.campaign_id === campaign.id).length;
        const technology = technologyMap[campaign.technology_id] || { name: 'Standard Sampling' };

        return `
            <div class="campaign-item campaign-clickable" onclick="showCampaignDetail(${campaign.id})">
                <h4>${campaign.title}</h4>
                <div class="meta">
                    ${campaign.campaign_code} |
                    <span class="status-${campaign.active ? 'active' : 'inactive'}">${campaign.active ? 'Active' : 'Inactive'}</span> |
                    ${campaign.location.location} |
                    ${getYearRange(campaign.campaign_date_start, campaign.campaign_date_end)}
                </div>
                <p>${campaign.description}</p>
                <div class="tech-tags">
                    <span class="tech-tag">${technology.name}</span>
                    <span class="tech-tag">${campaign.number_of_sampling_stations} Sampling Stations</span>
                    ${sampleCount > 0 ? `<span class="tech-tag" style="background: #28a745;">${sampleCount} Samples</span>` : ''}
                    <span class="tech-tag">${campaign.organisation.name}</span>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}
