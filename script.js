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
        const [demoSites, solutions, campaigns, microSamples, labAnalysis, qualityControl, campaignsDb, locationsDb, organisationsDb] = await Promise.all([
            fetch('data/demo_sites.json').then(r => r.json()),
            fetch('data/solutions.json').then(r => r.json()),
            fetch('data/campaigns.json').then(r => r.json()),
            fetch('data/campaign_micro_samples.json').then(r => r.json()),
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
        labAnalysisData = labAnalysis;
        qualityControlData = qualityControl;

        // Assign database-aligned structures
        campaignsDB = campaignsDb;
        locationsDB = locationsDb;
        organisationsDB = organisationsDb;

        dataLoaded = true;
        hideLoadingState();
        
        // Initialize the sampling data view if it exists
        if (document.getElementById('sampling-samples-container')) {
            renderSamplingData();
        }
        
        console.log('✓ All data loaded successfully');
        console.log('✓ Database tables aligned:', {
            campaigns: campaignsDB.length,
            locations: locationsDB.length,
            organisations: organisationsDB.length,
            samples: campaignMicroSampleData.length
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

    // Get samples for this campaign
    const campaignSamples = campaignMicroSampleData.filter(sample => sample.campaign_id === numericId);

    // Format dates
    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });

    const samplesSection = campaignSamples.length > 0 ? `
        <div class="section">
            <h3>Campaign Samples (${campaignSamples.length})</h3>
            <div class="campaign-list">
                ${campaignSamples.map(sample => {
                    const labAnalysis = labAnalysisData.find(la => la.campaign_micro_sample_id === sample.id);
                    const qc = qualityControlData.find(q => q.campaign_micro_sample_id === sample.id);

                    return `
                        <div class="campaign-item" style="cursor: pointer; margin-bottom: 15px;" onclick="showSampleDetail(${sample.id})">
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
                                    <div style="font-size: 11px; color: #666;">concentration</div>
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
                    <p><strong>Lead Institution:</strong> ${campaign.lead}</p>
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
            </div>

            <div>
                ${samplesSection}
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

// Sampling Data Functions
let currentFilteredSamples = [...campaignMicroSampleData];

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

function renderSamplingData(samples = campaignMicroSampleData) {
    const container = document.getElementById('sampling-samples-container');
    if (!container) return;

    currentFilteredSamples = samples;

    if (samples.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <h4>No samples found</h4>
                <p>Try adjusting your filters</p>
            </div>
        `;
        document.getElementById('sample-count-display').textContent = 'Showing 0 of 0 samples';
        return;
    }

    const html = samples.map(sample => {
        const labAnalysis = labAnalysisData.find(la => la.campaign_micro_sample_id === sample.id);
        const qc = qualityControlData.find(q => q.campaign_micro_sample_id === sample.id);

        return `
            <div class="campaign-item" style="cursor: pointer; transition: all 0.3s ease;" onclick="showSampleDetail(${sample.id})">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <div>
                        <h4 style="margin: 0 0 5px 0; color: #007bff;">${sample.sample_code}</h4>
                        <div class="meta">
                            Campaign ${sample.campaign_id} |
                            <span class="status-active">${sample.data_type}</span> |
                            ${sample.station_id} |
                            ${formatDateTime(sample.sampling_date_start)}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 24px; font-weight: 600; color: #28a745;">${sample.particles_total_concentration}</div>
                        <div style="font-size: 12px; color: #666;">concentration</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin: 15px 0;">
                    <div style="background: #f8f9fa; padding: 10px; border-radius: 4px;">
                        <div style="font-size: 12px; color: #666; margin-bottom: 3px;">Sampling Method</div>
                        <div style="font-weight: 600; font-size: 14px;">${sample.sampling_method}</div>
                    </div>
                    <div style="background: #f8f9fa; padding: 10px; border-radius: 4px;">
                        <div style="font-size: 12px; color: #666; margin-bottom: 3px;">Survey Area</div>
                        <div style="font-weight: 600; font-size: 14px;">${sample.survey_length} × ${sample.survey_width}</div>
                    </div>
                    <div style="background: #f8f9fa; padding: 10px; border-radius: 4px;">
                        <div style="font-size: 12px; color: #666; margin-bottom: 3px;">Total Particles</div>
                        <div style="font-weight: 600; font-size: 14px;">${sample.particles_total_count}</div>
                    </div>
                    <div style="background: #f8f9fa; padding: 10px; border-radius: 4px;">
                        <div style="font-size: 12px; color: #666; margin-bottom: 3px;">Tire Wear Conc.</div>
                        <div style="font-weight: 600; font-size: 14px;">${sample.tire_wear_concentration} µg/L</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
                    <div>
                        <div style="font-size: 12px; color: #666;">Start: ${formatCoordinate(sample.sampling_latitude_start, sample.sampling_longitude_start)}</div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: #666;">End: ${formatCoordinate(sample.sampling_latitude_end, sample.sampling_longitude_end)}</div>
                    </div>
                </div>

                ${sample.notes ? `
                    <div style="margin-top: 10px; padding: 10px; background: #fff3cd; border-left: 3px solid #ffc107; border-radius: 4px; font-size: 13px;">
                        <strong>Notes:</strong> ${sample.notes}
                    </div>
                ` : ''}

                <div style="margin-top: 12px; display: flex; gap: 10px;">
                    ${labAnalysis ? `<span class="tech-tag" style="background: #28a745;">Lab Analysis Available</span>` : ''}
                    ${qc ? `<span class="tech-tag" style="background: #17a2b8;">QC: ${qc.control_pi}% Control</span>` : ''}
                    <span class="tech-tag">${sample.spatial_or_temporal_monitoring}</span>
                    <span class="tech-tag">Replicates: ${sample.replicate_count}</span>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
    document.getElementById('sample-count-display').textContent =
        `Showing ${samples.length} of ${campaignMicroSampleData.length} samples`;
}

function filterSamplingData() {
    const campaignFilter = document.getElementById('filter-campaign').value;
    const methodFilter = document.getElementById('filter-method').value;
    const datatypeFilter = document.getElementById('filter-datatype').value;

    let filtered = campaignMicroSampleData.filter(sample => {
        const matchesCampaign = !campaignFilter || sample.campaign_id.toString() === campaignFilter;
        const matchesMethod = !methodFilter || sample.sampling_method === methodFilter;
        const matchesDatatype = !datatypeFilter || sample.data_type === datatypeFilter;

        return matchesCampaign && matchesMethod && matchesDatatype;
    });

    renderSamplingData(filtered);
}

function resetFilters() {
    document.getElementById('filter-campaign').value = '';
    document.getElementById('filter-method').value = '';
    document.getElementById('filter-datatype').value = '';
    renderSamplingData(campaignMicroSampleData);
}

function showSampleDetail(sampleId) {
    const sample = campaignMicroSampleData.find(s => s.id === sampleId);
    if (!sample) return;

    const labAnalysis = labAnalysisData.find(la => la.campaign_micro_sample_id === sampleId);
    const qc = qualityControlData.find(q => q.campaign_micro_sample_id === sampleId);

    const content = `
        <div class="breadcrumb">
            <a onclick="showView('overview')">Overview</a> >
            <a onclick="showView('sampling-data')">Sampling Data</a> >
            ${sample.sample_code}
        </div>
        <h2>${sample.sample_code} - Detailed View</h2>

        <!-- Key Metrics -->
        <div class="stats">
            <div class="stat-card">
                <h4>Total Particles</h4>
                <div class="number">${sample.particles_total_count}</div>
            </div>
            <div class="stat-card">
                <h4>Concentration</h4>
                <div class="number">${sample.particles_total_concentration}</div>
            </div>
            <div class="stat-card">
                <h4>Total Weight</h4>
                <div class="number">${sample.particles_total_weight}</div>
            </div>
            <div class="stat-card">
                <h4>Duration</h4>
                <div class="number">${sample.sampling_duration_hours}</div>
                <small>hours</small>
            </div>
        </div>

        <!-- Sample Information -->
        <div class="section">
            <h3>Sample Information</h3>
            <table class="data-table">
                <tr><td><strong>Sample Code</strong></td><td>${sample.sample_code}</td></tr>
                <tr><td><strong>Campaign ID</strong></td><td>${sample.campaign_id}</td></tr>
                <tr><td><strong>Station ID</strong></td><td>${sample.station_id}</td></tr>
                <tr><td><strong>Data Type</strong></td><td><span class="status-active">${sample.data_type}</span></td></tr>
                <tr><td><strong>Monitoring Type</strong></td><td>${sample.spatial_or_temporal_monitoring}</td></tr>
                <tr><td><strong>Sampling Method</strong></td><td>${sample.sampling_method}</td></tr>
                <tr><td><strong>Sampling Instrument</strong></td><td>${sample.sampling_instrument} (${sample.sampling_instrument_group})</td></tr>
                <tr><td><strong>Protocol Reference</strong></td><td>${sample.sampling_protocol_reference}</td></tr>
            </table>
        </div>

        <!-- Temporal & Spatial Data -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div class="section">
                <h3>Temporal Data</h3>
                <table class="data-table">
                    <tr><td><strong>Start Time</strong></td><td>${formatDateTime(sample.sampling_date_start)}</td></tr>
                    <tr><td><strong>End Time</strong></td><td>${formatDateTime(sample.sampling_date_end)}</td></tr>
                    <tr><td><strong>Duration</strong></td><td>${sample.sampling_duration_hours} hours</td></tr>
                    <tr><td><strong>Time Reference</strong></td><td>${sample.sampling_time_reference}</td></tr>
                </table>
            </div>

            <div class="section">
                <h3>Spatial Data</h3>
                <table class="data-table">
                    <tr><td><strong>Start Position</strong></td><td>${formatCoordinate(sample.sampling_latitude_start, sample.sampling_longitude_start)}</td></tr>
                    <tr><td><strong>End Position</strong></td><td>${formatCoordinate(sample.sampling_latitude_end, sample.sampling_longitude_end)}</td></tr>
                    <tr><td><strong>Survey Length</strong></td><td>${sample.survey_length}</td></tr>
                    <tr><td><strong>Survey Width</strong></td><td>${sample.survey_width}</td></tr>
                </table>
            </div>
        </div>

        <!-- Flowmeter Data -->
        <div class="section">
            <h3>Flowmeter & Equipment</h3>
            <table class="data-table">
                <tr><td><strong>Flowmeter Model</strong></td><td>${sample.flowmeter_model}</td></tr>
                <tr><td><strong>Flowmeter Equation</strong></td><td><code>${sample.flowmeter_equation}</code></td></tr>
                <tr><td><strong>Start Count</strong></td><td>${sample.flowmeter_start_count}</td></tr>
                <tr><td><strong>End Count</strong></td><td>${sample.flowmeter_end_count}</td></tr>
            </table>
        </div>

        <!-- Particle Analysis Results -->
        <div class="section">
            <h3>Particle Analysis Results</h3>
            <table class="data-table">
                <tr><td><strong>Total Particle Count</strong></td><td>${sample.particles_total_count}</td></tr>
                <tr><td><strong>Total Weight</strong></td><td>${sample.particles_total_weight}</td></tr>
                <tr><td><strong>Total Concentration</strong></td><td>${sample.particles_total_concentration}</td></tr>
                <tr><td><strong>Tire Marker Concentration</strong></td><td>${sample.tire_marker_concentration} µg/L</td></tr>
                <tr><td><strong>Tire Wear Concentration</strong></td><td>${sample.tire_wear_concentration} µg/L</td></tr>
                <tr><td><strong>Tire Wear Conc. (Volume)</strong></td><td>${sample.tire_wear_concentration_volume} µg/L</td></tr>
                <tr><td><strong>Tire Wear Leachable Total</strong></td><td>${sample.tire_wear_leachable_total_concentration} µg/L</td></tr>
            </table>
        </div>

        <!-- Lab Analysis -->
        ${labAnalysis ? `
        <div class="section">
            <h3>Laboratory Analysis</h3>
            <table class="data-table">
                <tr><td><strong>Analysis ID</strong></td><td>${labAnalysis.id}</td></tr>
                <tr><td><strong>Digestion</strong></td><td>${labAnalysis.digestion_y_n}</td></tr>
                ${labAnalysis.digestion_y_n === 'Yes' ? `
                    <tr><td><strong>Digestion Solution</strong></td><td>${labAnalysis.digestion_solution}</td></tr>
                    <tr><td><strong>Temperature</strong></td><td>${labAnalysis.digestion_temperature_c}°C</td></tr>
                    <tr><td><strong>Time</strong></td><td>${labAnalysis.digestion_time_h} hours</td></tr>
                ` : ''}
                <tr><td><strong>Recovery Solution</strong></td><td>${labAnalysis.recovery_solution}</td></tr>
                <tr><td><strong>Density Solution</strong></td><td>${labAnalysis.density_solution_g_cm3} g/cm³</td></tr>
                <tr><td><strong>Recovery Particles</strong></td><td><span style="color: #28a745; font-weight: 600;">${labAnalysis.recovery_particles}</span></td></tr>
            </table>

            <h4 style="margin-top: 20px;">Polymer Identification</h4>
            <table class="data-table">
                <tr><td><strong>PI Method</strong></td><td>${labAnalysis.polymer_identification}</td></tr>
                <tr><td><strong>PI Instrument</strong></td><td>${labAnalysis.pi_instrument}</td></tr>
                <tr><td><strong>PI Technique</strong></td><td>${labAnalysis.pi_method_technique}</td></tr>
                <tr><td><strong>PI Compartment</strong></td><td><span class="tech-tag">${labAnalysis.pi_compartment}</span></td></tr>
                <tr><td><strong>PI Percentage</strong></td><td>${labAnalysis.pi_percentage}%</td></tr>
                <tr><td><strong>PI Number of Particles</strong></td><td>${labAnalysis.pi_number_particles}</td></tr>
                <tr><td><strong>Fibers</strong></td><td>${labAnalysis.fibers}</td></tr>
            </table>
        </div>
        ` : '<div class="section"><p style="color: #666;">No lab analysis data available for this sample.</p></div>'}

        <!-- Quality Control -->
        ${qc ? `
        <div class="section">
            <h3>Quality Control</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 15px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px; color: white;">
                    <div style="font-size: 14px; margin-bottom: 5px;">Blanks</div>
                    <div style="font-size: 32px; font-weight: 600;">${qc.blanks}</div>
                    <div style="font-size: 12px; margin-top: 5px;">Blank PI: ${qc.blanck_pi}%</div>
                </div>
                <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; border-radius: 8px; color: white;">
                    <div style="font-size: 14px; margin-bottom: 5px;">Controls</div>
                    <div style="font-size: 32px; font-weight: 600;">${qc.control}</div>
                    <div style="font-size: 12px; margin-top: 5px;">Control PI: ${qc.control_pi}%</div>
                </div>
                <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 20px; border-radius: 8px; color: white;">
                    <div style="font-size: 14px; margin-bottom: 5px;">Data Correction</div>
                    <div style="font-size: 32px; font-weight: 600;">${qc.data_correction ? 'Yes' : 'No'}</div>
                    <div style="font-size: 12px; margin-top: 5px;">Applied to results</div>
                </div>
            </div>
        </div>
        ` : '<div class="section"><p style="color: #666;">No quality control data available for this sample.</p></div>'}

        <!-- Sample Metadata -->
        <div class="section">
            <h3>Sample Metadata</h3>
            <table class="data-table">
                <tr><td><strong>Total Samples in Series</strong></td><td>${sample.total_samples}</td></tr>
                <tr><td><strong>Replicate Count</strong></td><td>${sample.replicate_count}</td></tr>
                <tr><td><strong>Quadrant Placement</strong></td><td>${sample.quadrant_placement}</td></tr>
                <tr><td><strong>Compartment Type</strong></td><td>${sample.compartment_type}</td></tr>
                <tr><td><strong>Technology ID</strong></td><td>${sample.technology_id}</td></tr>
                <tr><td><strong>Location ID</strong></td><td>${sample.location_id}</td></tr>
                <tr><td><strong>User ID</strong></td><td>${sample.user_id}</td></tr>
                <tr><td><strong>Created At</strong></td><td>${formatDateTime(sample.created_at)}</td></tr>
                <tr><td><strong>Updated At</strong></td><td>${formatDateTime(sample.updated_at)}</td></tr>
            </table>
        </div>

        ${sample.notes ? `
        <div class="section">
            <h3>Notes</h3>
            <div style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; border-radius: 4px;">
                ${sample.notes}
            </div>
        </div>
        ` : ''}
    `;

    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.add('hidden');
    });

    // Show sampling data view and update its content
    const samplingDataView = document.getElementById('sampling-data');
    samplingDataView.classList.remove('hidden');
    samplingDataView.innerHTML = content;
}

// Initialize sampling data view when page loads
document.addEventListener('DOMContentLoaded', function() {
    renderSamplingData();
});
