let currentCampaignType = '';
let currentCampaignId = '';
let sensorUpdateInterval = null;
let currentDemoSite = '';
let solutionSourceView = ''; // Track where solution detail was accessed from

const demoSitesData = {
    'domzale': {
        name: "Domžale-Kamnik Wastewater Treatment Plant (WWTP)",
        location: "Slovenia",
        type: "Wastewater Treatment Facility",
        coordinates: "46.1373° N, 14.5961° E",
        capacity: "45,000 population equivalent",
        commissioning: "2019",
        description: "Advanced wastewater treatment plant serving the municipalities of Domžale and Kamnik, equipped with state-of-the-art sensors for real-time water quality monitoring.",
        technologies: ["Biological treatment", "Nutrient removal", "Advanced oxidation"],
        sensors: {
            ph: { name: "pH Level", unit: "pH", min: 6.8, max: 8.2, optimal: [7.0, 7.5], current: 7.2 },
            orp: { name: "Oxidation-Reduction Potential", unit: "mV", min: 150, max: 350, optimal: [200, 300], current: 245 },
            turbidity: { name: "Turbidity", unit: "NTU", min: 0.5, max: 15, optimal: [1, 5], current: 3.2 },
            cod: { name: "Chemical Oxygen Demand", unit: "mg/L", min: 10, max: 80, optimal: [15, 30], current: 22 },
            conductivity: { name: "Conductivity", unit: "μS/cm", min: 400, max: 1200, optimal: [500, 800], current: 650 }
        }
    },
    'po-gnocca': {
        name: "River Po' - Po di Gnocca",
        location: "Italy",
        type: "River Monitoring Station",
        coordinates: "45.0348° N, 12.1734° E",
        capacity: "Major tributary monitoring",
        commissioning: "2020",
        description: "Strategic monitoring point on the Po di Gnocca branch of the River Po system, tracking water quality parameters to assess environmental impact and litter transport.",
        technologies: ["Flow measurement", "Water quality sensors", "Automated sampling"],
        sensors: {
            ph: { name: "pH Level", unit: "pH", min: 7.5, max: 8.8, optimal: [7.8, 8.2], current: 8.0 },
            orp: { name: "Oxidation-Reduction Potential", unit: "mV", min: 100, max: 280, optimal: [150, 220], current: 185 },
            turbidity: { name: "Turbidity", unit: "NTU", min: 2, max: 35, optimal: [5, 15], current: 8.7 },
            cod: { name: "Chemical Oxygen Demand", unit: "mg/L", min: 8, max: 45, optimal: [10, 20], current: 14 },
            conductivity: { name: "Conductivity", unit: "μS/cm", min: 200, max: 600, optimal: [250, 400], current: 320 }
        }
    },
    'douro': {
        name: "The Douro River",
        location: "Portugal",
        type: "Major River Monitoring",
        coordinates: "41.1579° N, 8.6291° W",
        capacity: "International watershed monitoring",
        commissioning: "2021",
        description: "Critical monitoring station on the Douro River, one of the major rivers of the Iberian Peninsula, tracking transboundary water quality and pollution transport.",
        technologies: ["Multi-parameter probes", "Telemetry systems", "Weather station integration"],
        sensors: {
            ph: { name: "pH Level", unit: "pH", min: 7.2, max: 8.5, optimal: [7.5, 8.0], current: 7.8 },
            orp: { name: "Oxidation-Reduction Potential", unit: "mV", min: 120, max: 300, optimal: [160, 240], current: 198 },
            turbidity: { name: "Turbidity", unit: "NTU", min: 1, max: 25, optimal: [2, 8], current: 5.1 },
            cod: { name: "Chemical Oxygen Demand", unit: "mg/L", min: 5, max: 30, optimal: [8, 15], current: 11 },
            conductivity: { name: "Conductivity", unit: "μS/cm", min: 150, max: 450, optimal: [180, 300], current: 235 }
        }
    },
    'danube': {
        name: "The Danube River",
        location: "Multi-national",
        type: "International River Monitoring",
        coordinates: "48.2082° N, 16.3738° E",
        capacity: "Continental watershed monitoring",
        commissioning: "2020",
        description: "Strategic monitoring point on the Danube River near Vienna, part of the international monitoring network for Europe's second-longest river system.",
        technologies: ["Automated monitoring stations", "Satellite telemetry", "Cross-border data sharing"],
        sensors: {
            ph: { name: "pH Level", unit: "pH", min: 7.8, max: 8.6, optimal: [8.0, 8.3], current: 8.1 },
            orp: { name: "Oxidation-Reduction Potential", unit: "mV", min: 180, max: 320, optimal: [200, 280], current: 235 },
            turbidity: { name: "Turbidity", unit: "NTU", min: 3, max: 40, optimal: [5, 20], current: 12.3 },
            cod: { name: "Chemical Oxygen Demand", unit: "mg/L", min: 12, max: 50, optimal: [15, 25], current: 18 },
            conductivity: { name: "Conductivity", unit: "μS/cm", min: 300, max: 800, optimal: [400, 600], current: 485 }
        }
    }
};

const solutionsData = {
    "Manta Net": {
        name: "Manta Net",
        category: "Detection",
        trl: "9",
        targetEnvironment: "Marine Surface Waters",
        description: "High-efficiency surface trawling net designed for microplastic sampling with minimal marine life disturbance.",
        characteristics: {
            "Technology Readiness Level": { value: "9", description: "Fully deployed and operational" },
            "Target Environment": { value: "Marine Surface", description: "0-50cm depth sampling" },
            "Mesh Size": { value: "333 μm", description: "Optimal for microplastic capture" },
            "Deployment Method": { value: "Ship-towed", description: "Requires research vessel" }
        },
        performance: {
            "Collection Efficiency": { value: "95%", unit: "capture rate" },
            "Operating Cost": { value: "€150", unit: "per deployment" },
            "Processing Speed": { value: "2.5", unit: "km/hour" },
            "Sample Volume": { value: "0.5-2.0", unit: "m³/min" }
        },
        applications: ["Microplastic monitoring", "Water quality assessment", "Marine debris surveys"],
        advantages: ["High capture efficiency", "Standardized protocol", "Minimal ecosystem impact"],
        limitations: ["Weather dependent", "Requires specialized vessel", "Limited depth range"],
        sampleData: [
            {
                timestamp: "2024-09-25T14:30:00Z",
                location: "Baltic Sea - 59.8586°N, 23.6455°E",
                microplastic_count: 847,
                dominant_material: "PE/PP (67%)",
                size_distribution: "0.3-5.0mm",
                density: "2.3 particles/m³",
                sample_volume: "1.2 m³"
            },
            {
                timestamp: "2024-09-25T16:45:00Z",
                location: "Baltic Sea - 59.8621°N, 23.6489°E",
                microplastic_count: 923,
                dominant_material: "PET (41%)",
                size_distribution: "0.5-3.2mm",
                density: "2.8 particles/m³",
                sample_volume: "1.1 m³"
            }
        ]
    },
    "Marine LitterWatch App": {
        name: "Marine LitterWatch App",
        category: "Detection",
        trl: "9",
        targetEnvironment: "Coastal Areas & Beaches",
        description: "Citizen science mobile application for standardized marine litter reporting and data collection.",
        characteristics: {
            "Technology Readiness Level": { value: "9", description: "Widely deployed across Europe" },
            "Target Environment": { value: "Coastal/Beach", description: "Shoreline and near-shore areas" },
            "Data Standards": { value: "OSPAR Protocol", description: "Standardized reporting format" },
            "User Base": { value: "Global", description: "Available in 24 languages" }
        },
        performance: {
            "User Engagement": { value: "85%", unit: "completion rate" },
            "Operating Cost": { value: "€0", unit: "per report" },
            "Data Quality": { value: "92%", unit: "accuracy score" },
            "Response Time": { value: "24", unit: "hours average" }
        },
        applications: ["Citizen science monitoring", "Beach litter surveys", "Policy impact assessment"],
        advantages: ["Zero operational cost", "Large-scale data collection", "Real-time reporting"],
        limitations: ["User training required", "Data quality variability", "Geographic coverage gaps"],
        sampleData: [
            {
                timestamp: "2024-09-25T10:15:00Z",
                location: "Barceloneta Beach, Spain",
                user_id: "volunteer_0847",
                litter_types: "Plastic bottles (15), Cigarette butts (47), Food wrappers (12)",
                survey_area: "100m transect",
                total_items: 74,
                photo_quality: "Excellent"
            },
            {
                timestamp: "2024-09-25T15:22:00Z",
                location: "Brighton Beach, UK",
                user_id: "volunteer_0923",
                litter_types: "Plastic bags (8), Bottle caps (23), Fishing gear (3)",
                survey_area: "100m transect",
                total_items: 34,
                photo_quality: "Good"
            }
        ]
    },
    "Citizen Engagement": {
        name: "Citizen Engagement",
        category: "Detection",
        trl: "8",
        targetEnvironment: "All Environments",
        description: "Comprehensive citizen science framework involving training, tools, and community coordination.",
        characteristics: {
            "Technology Readiness Level": { value: "8", description: "Proven in operational environment" },
            "Target Environment": { value: "Multi-environment", description: "Coastal, riverine, urban areas" },
            "Training Protocol": { value: "Standardized", description: "2-day certification program" },
            "Community Size": { value: "Variable", description: "10-500 participants per campaign" }
        },
        performance: {
            "Participation Rate": { value: "78%", unit: "retention rate" },
            "Training Cost": { value: "€45", unit: "per participant" },
            "Data Contribution": { value: "35%", unit: "of total dataset" },
            "Quality Score": { value: "88%", unit: "vs. expert data" }
        },
        applications: ["Community monitoring", "Education and awareness", "Long-term surveillance"],
        advantages: ["High community buy-in", "Cost-effective scaling", "Educational impact"],
        limitations: ["Requires coordination", "Seasonal availability", "Training overhead"]
    },
    "Clera Filtration Unit": {
        name: "Clera Special Membrane Filtration Unit",
        category: "Collection",
        trl: "7",
        targetEnvironment: "Wastewater Treatment",
        description: "Advanced membrane filtration system specifically designed for microplastic removal from water streams.",
        characteristics: {
            "Technology Readiness Level": { value: "7", description: "System prototype demonstrated" },
            "Target Environment": { value: "Treatment Plants", description: "Municipal and industrial facilities" },
            "Membrane Type": { value: "Ceramic", description: "0.1 μm pore size" },
            "Flow Rate": { value: "50-200", description: "m³/hour capacity" }
        },
        performance: {
            "Removal Efficiency": { value: "98.5%", unit: "microplastic capture" },
            "Operating Cost": { value: "€0.12", unit: "per m³ treated" },
            "Energy Consumption": { value: "0.8", unit: "kWh/m³" },
            "Maintenance Interval": { value: "6", unit: "months" }
        },
        applications: ["Wastewater treatment", "Industrial filtration", "Water recycling"],
        advantages: ["High efficiency", "Automated operation", "Low maintenance"],
        limitations: ["High initial cost", "Energy intensive", "Membrane replacement"]
    },
    "Ferrybox Sampling": {
        name: "Ferrybox Sampling Device",
        category: "Detection",
        trl: "8",
        targetEnvironment: "Marine Transit Routes",
        description: "Automated water sampling system installed on ferries for continuous monitoring during regular transit.",
        characteristics: {
            "Technology Readiness Level": { value: "8", description: "Proven in operational environment" },
            "Target Environment": { value: "Ferry Routes", description: "Regular shipping lanes" },
            "Sampling Frequency": { value: "Every 5km", description: "Automated collection" },
            "Storage Capacity": { value: "48", description: "samples per voyage" }
        },
        performance: {
            "Coverage Area": { value: "1,200", unit: "km per voyage" },
            "Operating Cost": { value: "€25", unit: "per voyage" },
            "Data Consistency": { value: "96%", unit: "success rate" },
            "Sample Quality": { value: "93%", unit: "analysis ready" }
        },
        applications: ["Route-based monitoring", "Pollution tracking", "Temporal studies"],
        advantages: ["Continuous monitoring", "Large spatial coverage", "Cost-effective"],
        limitations: ["Limited to ferry routes", "Weather dependent", "Sample storage limits"]
    },
    "Drone Observations": {
        name: "Drone Observations",
        category: "Detection",
        trl: "8",
        targetEnvironment: "Aerial Surveillance",
        description: "UAV-based visual and sensor monitoring system for large-area litter detection and mapping.",
        characteristics: {
            "Technology Readiness Level": { value: "8", description: "Proven in operational environment" },
            "Target Environment": { value: "Aerial Coverage", description: "Coastal and marine areas" },
            "Flight Duration": { value: "45", description: "minutes per mission" },
            "Detection Resolution": { value: "2cm", description: "minimum object size" }
        },
        performance: {
            "Coverage Rate": { value: "15", unit: "km²/hour" },
            "Operating Cost": { value: "€85", unit: "per flight hour" },
            "Detection Accuracy": { value: "89%", unit: "vs. ground truth" },
            "Weather Tolerance": { value: "15", unit: "m/s max wind" }
        },
        applications: ["Area surveillance", "Debris mapping", "Access monitoring"],
        advantages: ["Large area coverage", "High resolution data", "Rapid deployment"],
        limitations: ["Weather dependent", "Battery constraints", "Regulatory restrictions"],
        sampleData: [
            {
                timestamp: "2024-09-25T11:30:00Z",
                flight_id: "DRONE_MISSION_0156",
                area_surveyed: "3.2 km²",
                flight_duration: "42 minutes",
                objects_detected: 156,
                hotspots: "Estuary mouth (67 items), Marina area (41 items)",
                weather_conditions: "Clear, wind 8 m/s"
            },
            {
                timestamp: "2024-09-25T14:15:00Z",
                flight_id: "DRONE_MISSION_0157",
                area_surveyed: "2.8 km²",
                flight_duration: "38 minutes",
                objects_detected: 89,
                hotspots: "Beach access point (34 items), Pier vicinity (28 items)",
                weather_conditions: "Partly cloudy, wind 12 m/s"
            }
        ]
    },
    "Mounted Camera": {
        name: "Mounted Camera",
        category: "Detection",
        trl: "9",
        targetEnvironment: "Fixed Monitoring Points",
        description: "AI-enabled fixed camera systems for continuous monitoring and automated litter detection.",
        characteristics: {
            "Technology Readiness Level": { value: "9", description: "Fully operational systems" },
            "Target Environment": { value: "Fixed Points", description: "Bridges, piers, coastal stations" },
            "AI Processing": { value: "Real-time", description: "On-board analysis" },
            "Image Resolution": { value: "4K", description: "Ultra-high definition" }
        },
        performance: {
            "Detection Accuracy": { value: "91%", unit: "object classification" },
            "Operating Cost": { value: "€2.5", unit: "per day" },
            "Uptime": { value: "99.2%", unit: "availability" },
            "Response Time": { value: "30", unit: "seconds alert" }
        },
        applications: ["Continuous monitoring", "Alert systems", "Trend analysis"],
        advantages: ["24/7 operation", "Immediate alerts", "Long-term reliability"],
        limitations: ["Fixed location", "Lighting dependent", "Initial setup cost"],
        sampleData: [
            {
                timestamp: "2024-09-25T12:08:00Z",
                camera_id: "CAM_PIER_001",
                detection_event: "Large debris cluster",
                object_count: 12,
                classification: "Plastic bottles (8), Bags (3), Unknown (1)",
                confidence_score: "94.2%",
                alert_level: "Medium"
            },
            {
                timestamp: "2024-09-25T12:08:30Z",
                camera_id: "CAM_PIER_001",
                detection_event: "Individual item",
                object_count: 1,
                classification: "Plastic container",
                confidence_score: "87.6%",
                alert_level: "Low"
            }
        ]
    },
    "JRC Floating Litter App": {
        name: "JRC Floating Litter Monitoring App",
        category: "Detection",
        trl: "8",
        targetEnvironment: "Marine Vessels",
        description: "Specialized mobile application for systematic reporting of floating marine litter from ships and boats.",
        characteristics: {
            "Technology Readiness Level": { value: "8", description: "Operational across EU waters" },
            "Target Environment": { value: "Marine Vessels", description: "Ships, boats, research vessels" },
            "Reporting Protocol": { value: "Standardized", description: "JRC methodology" },
            "Offline Capability": { value: "Full", description: "Works without connectivity" }
        },
        performance: {
            "Report Completion": { value: "92%", unit: "success rate" },
            "Operating Cost": { value: "€0", unit: "per report" },
            "Data Synchronization": { value: "98%", unit: "upload success" },
            "User Satisfaction": { value: "4.2", unit: "out of 5 stars" }
        },
        applications: ["Vessel-based monitoring", "Shipping lane surveys", "Fisheries reporting"],
        advantages: ["Maritime focus", "Offline operation", "Professional user base"],
        limitations: ["Requires vessel access", "User training needed", "Limited shore coverage"]
    },
    "Sensor Black Box": {
        name: "Sensor Black Box",
        category: "Detection",
        trl: "6",
        targetEnvironment: "Autonomous Deployment",
        description: "Autonomous sensor package with multiple detection methods for remote litter monitoring.",
        characteristics: {
            "Technology Readiness Level": { value: "6", description: "Technology demonstrated" },
            "Target Environment": { value: "Remote Areas", description: "Autonomous deployment" },
            "Sensor Array": { value: "Multi-modal", description: "Optical, acoustic, chemical" },
            "Battery Life": { value: "6", description: "months autonomous" }
        },
        performance: {
            "Detection Range": { value: "50", unit: "meter radius" },
            "Operating Cost": { value: "€180", unit: "per deployment" },
            "Data Accuracy": { value: "86%", unit: "classification rate" },
            "Environmental Rating": { value: "IP68", unit: "waterproof rating" }
        },
        applications: ["Remote monitoring", "Long-term studies", "Inaccessible areas"],
        advantages: ["Autonomous operation", "Multi-sensor approach", "Remote deployment"],
        limitations: ["Early stage technology", "High unit cost", "Data retrieval challenges"],
        sampleData: [
            {
                timestamp: "2024-09-25T09:00:00Z",
                sensor_id: "SBB_UNIT_003",
                battery_level: "78%",
                detection_count: 23,
                optical_alerts: 18,
                acoustic_signatures: 5,
                water_temperature: "12.3°C",
                deployment_days: 45
            }
        ]
    },
    "Infordata Water Sensor": {
        name: "Infordata Water Sensor Kit",
        category: "Detection",
        trl: "8",
        targetEnvironment: "Water Quality Monitoring",
        description: "Comprehensive water quality sensor package for real-time environmental monitoring.",
        characteristics: {
            "Technology Readiness Level": { value: "8", description: "Proven in operational environment" },
            "Target Environment": { value: "Aquatic Systems", description: "Rivers, lakes, coastal waters" },
            "Sensor Types": { value: "Multi-parameter", description: "pH, turbidity, conductivity, temperature" },
            "Data Transmission": { value: "Real-time", description: "Wireless telemetry" }
        },
        performance: {
            "Measurement Accuracy": { value: "±2%", unit: "calibrated range" },
            "Operating Cost": { value: "€120", unit: "per month" },
            "Data Frequency": { value: "15", unit: "minute intervals" },
            "Maintenance Interval": { value: "3", unit: "months" }
        },
        applications: ["Water quality monitoring", "Environmental compliance", "Research studies"],
        advantages: ["Real-time data", "Multiple parameters", "Reliable transmission"],
        limitations: ["Calibration needs", "Fouling susceptible", "Power requirements"],
        sampleData: [
            {
                timestamp: "2024-09-25T13:45:00Z",
                sensor_location: "Danube monitoring station",
                pH: 8.1,
                turbidity: "12.3 NTU",
                conductivity: "485 μS/cm",
                temperature: "15.2°C",
                dissolved_oxygen: "8.7 mg/L"
            }
        ]
    }
};

// Add missing solution entries for completeness
const additionalSolutions = {
    "Archimedean Drum Screw": {
        name: "Archimedean Drum Screw",
        category: "Collection",
        trl: "7",
        targetEnvironment: "Water Intake Systems",
        description: "Mechanical collection system using Archimedean screw principle for continuous litter removal.",
        characteristics: {
            "Technology Readiness Level": { value: "7", description: "System prototype demonstrated" },
            "Target Environment": { value: "Water Intakes", description: "Pumping stations, treatment plants" },
            "Collection Method": { value: "Continuous", description: "24/7 operation capability" },
            "Material Compatibility": { value: "All debris", description: "Size range 2cm-50cm" }
        },
        performance: {
            "Collection Rate": { value: "95%", unit: "debris capture" },
            "Operating Cost": { value: "€45", unit: "per day" },
            "Processing Capacity": { value: "500", unit: "L/min" },
            "Maintenance": { value: "Weekly", unit: "inspection cycle" }
        },
        applications: ["Water treatment plants", "Intake protection", "River cleaning"],
        advantages: ["Continuous operation", "High efficiency", "Low maintenance"],
        limitations: ["Fixed installation", "Size constraints", "Power requirements"]
    },

    // Add other missing solutions...
    "Fish Friendly Trawling Net": {
        name: "Fish Friendly Litter Removing Trawling Net",
        category: "Collection",
        trl: "8",
        targetEnvironment: "Marine Fishing Operations",
        description: "Specialized trawling net designed to collect litter while minimizing marine life capture.",
        characteristics: {
            "Technology Readiness Level": { value: "8", description: "Proven in operational environment" },
            "Target Environment": { value: "Marine Fishing", description: "Commercial fishing operations" },
            "Selectivity": { value: "High", description: "Marine life escape mechanisms" },
            "Compatibility": { value: "Standard gear", description: "Retrofits existing equipment" }
        },
        performance: {
            "Litter Collection": { value: "78%", unit: "debris capture" },
            "Operating Cost": { value: "€200", unit: "per deployment" },
            "Fish Mortality": { value: "<5%", unit: "vs. standard nets" },
            "Durability": { value: "200", unit: "deployment cycles" }
        },
        applications: ["Commercial fishing", "Research vessels", "Cleanup operations"],
        advantages: ["Dual purpose operation", "Marine life protection", "Industry integration"],
        limitations: ["Fishing vessel required", "Weather dependent", "Crew training needed"]
    }
};

// Merge additional solutions
Object.assign(solutionsData, additionalSolutions);

const campaignData = {
    micro1: {
        title: "Baltic Sea Microplastic Survey",
        type: "Micro",
        status: "Active",
        location: "Estonia, Latvia, Lithuania",
        duration: "2024-2025",
        lead: "Tallinn University of Technology",
        budget: "€450,000",
        description: "Comprehensive study of microplastic distribution in Baltic Sea coastal waters, focusing on seasonal variations and pollution sources.",
        objectives: [
            "Quantify microplastic concentrations in coastal waters",
            "Identify main sources of microplastic pollution",
            "Assess seasonal and geographic variations",
            "Engage local communities in data collection"
        ],
        technologies: ["Manta Net", "Marine LitterWatch App", "Citizen Engagement"],
        results: [
            { parameter: "Samples Collected", value: "8,432", unit: "samples" },
            { parameter: "Microplastic Density", value: "2.3", unit: "particles/m³" },
            { parameter: "Dominant Material", value: "PE/PP", unit: "% of total" },
            { parameter: "Size Range", value: "0.3-5.0", unit: "mm" },
            { parameter: "Volunteer Participants", value: "127", unit: "citizens" }
        ]
    },
    micro2: {
        title: "Mediterranean Beach Microlitter",
        type: "Micro",
        status: "Active",
        location: "Italy, Spain, France",
        duration: "2024-2026",
        lead: "ENEA (Italian National Agency)",
        budget: "€320,000",
        description: "Systematic collection and analysis of microlitter on Mediterranean beaches using specialized filtration systems.",
        objectives: [
            "Map microlitter distribution on Mediterranean beaches",
            "Test effectiveness of filtration technologies",
            "Create standardized sampling protocols",
            "Train local research teams"
        ],
        technologies: ["Clera Filtration Unit", "Ferrybox Sampling", "Drone Observations"],
        results: [
            { parameter: "Beach Sites", value: "15", unit: "locations" },
            { parameter: "Microlitter Items", value: "3,712", unit: "items" },
            { parameter: "Average Density", value: "145", unit: "items/m²" },
            { parameter: "Plastic Fragments", value: "78", unit: "% of total" },
            { parameter: "Research Teams", value: "8", unit: "teams" }
        ]
    },
    macro1: {
        title: "North Sea Floating Debris",
        type: "Macro",
        status: "Active",
        location: "Netherlands, Germany, Denmark",
        duration: "2023-2025",
        lead: "DELTARES",
        budget: "€680,000",
        description: "Large-scale monitoring of floating debris in North Sea shipping routes using mounted cameras and sensor networks.",
        objectives: [
            "Monitor floating debris in shipping lanes",
            "Assess impact on marine traffic",
            "Develop automated detection systems",
            "Create debris density maps"
        ],
        technologies: ["Mounted Camera", "JRC Floating Litter App", "Sensor Black Box"],
        results: [
            { parameter: "Monitoring Areas", value: "12", unit: "zones" },
            { parameter: "Debris Items", value: "15,230", unit: "items" },
            { parameter: "Plastic Bottles", value: "34", unit: "% of total" },
            { parameter: "Detection Accuracy", value: "87", unit: "%" },
            { parameter: "Ship Reports", value: "234", unit: "reports" }
        ]
    }
};

// Sampling Data Tables
const campaignMicroSampleData = [
    {
        id: 1,
        campaign_id: 1,
        sample_code: "MS-2024-001",
        sampling_date_start: "2024-03-15T09:30:00",
        sampling_date_end: "2024-03-15T11:45:00",
        sampling_latitude_start: 46.13730000,
        sampling_longitude_start: 14.59610000,
        sampling_latitude_end: 46.14120000,
        sampling_longitude_end: 14.60210000,
        survey_length: "2.5 km",
        survey_width: "50 m",
        sampling_protocol_reference: "ISO 17294-2:2016",
        flowmeter_model: "Hydrobios FlowMeter 438115",
        flowmeter_equation: "V = (N × k) / 999999",
        flowmeter_start_count: "123456",
        flowmeter_end_count: "167892",
        particles_total_count: "3847",
        particles_total_weight: "12.5 g",
        particles_total_concentration: "2.3 particles/m³",
        tire_marker_concentration: 0.45,
        tire_wear_concentration: 1.87,
        tire_wear_concentration_volume: 0.94,
        notes: "Clear weather conditions, moderate flow rate. Sampling conducted during peak runoff period.",
        user_id: 101,
        created_at: "2024-03-15T12:00:00",
        updated_at: "2024-03-15T12:00:00",
        active: 1,
        deleted: 0,
        sampling_method: "Manta Net Trawling",
        technology_id: 1,
        data_type: "Sampling",
        spatial_or_temporal_monitoring: "Spatiotemporal",
        sampling_duration_hours: "2.25",
        station_id: "ST-DOM-01",
        total_samples: "5",
        replicate_count: "3",
        quality_control_id: 1,
        lab_analysis_id: 1,
        tire_wear_leachable_total_concentration: 0.78,
        quadrant_placement: 1.00,
        compartment_type: 1,
        sampling_instrument: "Manta Net 333µm",
        sampling_instrument_group: "Neuston Net",
        sampling_time_reference: "UTC+1",
        location_id: 1
    },
    {
        id: 2,
        campaign_id: 1,
        sample_code: "MS-2024-002",
        sampling_date_start: "2024-03-22T10:15:00",
        sampling_date_end: "2024-03-22T12:30:00",
        sampling_latitude_start: 45.03480000,
        sampling_longitude_start: 12.17340000,
        sampling_latitude_end: 45.04120000,
        sampling_longitude_end: 12.18560000,
        survey_length: "3.1 km",
        survey_width: "45 m",
        sampling_protocol_reference: "ISO 17294-2:2016",
        flowmeter_model: "General Oceanics 2030R",
        flowmeter_equation: "V = N × 0.3",
        flowmeter_start_count: "89234",
        flowmeter_end_count: "134567",
        particles_total_count: "5123",
        particles_total_weight: "18.7 g",
        particles_total_concentration: "3.1 particles/m³",
        tire_marker_concentration: 0.62,
        tire_wear_concentration: 2.34,
        tire_wear_concentration_volume: 1.12,
        notes: "Heavy precipitation 24h prior. Increased turbidity observed during sampling.",
        user_id: 102,
        created_at: "2024-03-22T13:15:00",
        updated_at: "2024-03-22T13:15:00",
        active: 1,
        deleted: 0,
        sampling_method: "Plankton Net Surface Tow",
        technology_id: 2,
        data_type: "Sampling",
        spatial_or_temporal_monitoring: "Spatial",
        sampling_duration_hours: "2.25",
        station_id: "ST-POG-01",
        total_samples: "4",
        replicate_count: "2",
        quality_control_id: 2,
        lab_analysis_id: 2,
        tire_wear_leachable_total_concentration: 1.05,
        quadrant_placement: 2.00,
        compartment_type: 1,
        sampling_instrument: "Bongo Net 300µm",
        sampling_instrument_group: "Neuston Net",
        sampling_time_reference: "UTC+1",
        location_id: 2
    },
    {
        id: 3,
        campaign_id: 2,
        sample_code: "MS-2024-003",
        sampling_date_start: "2024-04-05T08:00:00",
        sampling_date_end: "2024-04-05T10:45:00",
        sampling_latitude_start: 41.15790000,
        sampling_longitude_start: -8.62910000,
        sampling_latitude_end: 41.16450000,
        sampling_longitude_end: -8.61230000,
        survey_length: "1.8 km",
        survey_width: "60 m",
        sampling_protocol_reference: "EN ISO 16665:2014",
        flowmeter_model: "KC Denmark A/S",
        flowmeter_equation: "V = (N - N0) × k",
        flowmeter_start_count: "234567",
        flowmeter_end_count: "267890",
        particles_total_count: "2987",
        particles_total_weight: "9.3 g",
        particles_total_concentration: "1.8 particles/m³",
        tire_marker_concentration: 0.38,
        tire_wear_concentration: 1.52,
        tire_wear_concentration_volume: 0.76,
        notes: "Morning sampling session. Low wind conditions, excellent visibility.",
        user_id: 103,
        created_at: "2024-04-05T11:30:00",
        updated_at: "2024-04-05T11:30:00",
        active: 1,
        deleted: 0,
        sampling_method: "Subsurface Pump Filtration",
        technology_id: 3,
        data_type: "Station",
        spatial_or_temporal_monitoring: "Temporal",
        sampling_duration_hours: "2.75",
        station_id: "ST-DOU-01",
        total_samples: "6",
        replicate_count: "3",
        quality_control_id: 3,
        lab_analysis_id: 3,
        tire_wear_leachable_total_concentration: 0.64,
        quadrant_placement: 1.00,
        compartment_type: 2,
        sampling_instrument: "Submersible Pump GP-5000",
        sampling_instrument_group: "Pump System",
        sampling_time_reference: "UTC",
        location_id: 3
    },
    {
        id: 4,
        campaign_id: 2,
        sample_code: "MS-2024-004",
        sampling_date_start: "2024-04-12T14:30:00",
        sampling_date_end: "2024-04-12T16:15:00",
        sampling_latitude_start: 48.20820000,
        sampling_longitude_start: 16.37380000,
        sampling_latitude_end: 48.21450000,
        sampling_longitude_end: 16.38910000,
        survey_length: "2.2 km",
        survey_width: "55 m",
        sampling_protocol_reference: "ASTM D6913-04",
        flowmeter_model: "Valeport Model 801",
        flowmeter_equation: "V = N × C",
        flowmeter_start_count: "345678",
        flowmeter_end_count: "389012",
        particles_total_count: "4256",
        particles_total_weight: "15.2 g",
        particles_total_concentration: "2.7 particles/m³",
        tire_marker_concentration: 0.53,
        tire_wear_concentration: 2.08,
        tire_wear_concentration_volume: 1.04,
        notes: "Afternoon sampling. River discharge higher than seasonal average.",
        user_id: 104,
        created_at: "2024-04-12T17:00:00",
        updated_at: "2024-04-12T17:00:00",
        active: 1,
        deleted: 0,
        sampling_method: "Manta Net Trawling",
        technology_id: 1,
        data_type: "Sampling",
        spatial_or_temporal_monitoring: "Spatiotemporal",
        sampling_duration_hours: "1.75",
        station_id: "ST-DAN-01",
        total_samples: "5",
        replicate_count: "2",
        quality_control_id: 4,
        lab_analysis_id: 4,
        tire_wear_leachable_total_concentration: 0.89,
        quadrant_placement: 3.00,
        compartment_type: 1,
        sampling_instrument: "Manta Net 333µm",
        sampling_instrument_group: "Neuston Net",
        sampling_time_reference: "UTC+1",
        location_id: 4
    },
    {
        id: 5,
        campaign_id: 1,
        sample_code: "MS-2024-005",
        sampling_date_start: "2024-04-20T11:00:00",
        sampling_date_end: "2024-04-20T13:30:00",
        sampling_latitude_start: 46.14000000,
        sampling_longitude_start: 14.60000000,
        sampling_latitude_end: 46.14680000,
        sampling_longitude_end: 14.60890000,
        survey_length: "2.8 km",
        survey_width: "48 m",
        sampling_protocol_reference: "ISO 17294-2:2016",
        flowmeter_model: "Hydrobios FlowMeter 438115",
        flowmeter_equation: "V = (N × k) / 999999",
        flowmeter_start_count: "456789",
        flowmeter_end_count: "498765",
        particles_total_count: "3564",
        particles_total_weight: "11.8 g",
        particles_total_concentration: "2.1 particles/m³",
        tire_marker_concentration: 0.41,
        tire_wear_concentration: 1.76,
        tire_wear_concentration_volume: 0.88,
        notes: "Routine monitoring. Standard conditions, no anomalies detected.",
        user_id: 101,
        created_at: "2024-04-20T14:15:00",
        updated_at: "2024-04-20T14:15:00",
        active: 1,
        deleted: 0,
        sampling_method: "Continuous Flow Centrifugation",
        technology_id: 4,
        data_type: "Replica",
        spatial_or_temporal_monitoring: "Temporal",
        sampling_duration_hours: "2.5",
        station_id: "ST-DOM-01",
        total_samples: "7",
        replicate_count: "4",
        quality_control_id: 5,
        lab_analysis_id: 5,
        tire_wear_leachable_total_concentration: 0.72,
        quadrant_placement: 1.00,
        compartment_type: 1,
        sampling_instrument: "CF Centrifuge CFC-100",
        sampling_instrument_group: "Centrifuge System",
        sampling_time_reference: "UTC+1",
        location_id: 1
    },
    {
        id: 6,
        campaign_id: 2,
        sample_code: "MS-2024-006",
        sampling_date_start: "2024-05-03T09:45:00",
        sampling_date_end: "2024-05-03T12:00:00",
        sampling_latitude_start: 45.04000000,
        sampling_longitude_start: 12.18000000,
        sampling_latitude_end: 45.04890000,
        sampling_longitude_end: 12.19450000,
        survey_length: "3.4 km",
        survey_width: "52 m",
        sampling_protocol_reference: "EN ISO 16665:2014",
        flowmeter_model: "General Oceanics 2030R",
        flowmeter_equation: "V = N × 0.3",
        flowmeter_start_count: "567890",
        flowmeter_end_count: "612345",
        particles_total_count: "5678",
        particles_total_weight: "21.3 g",
        particles_total_concentration: "3.4 particles/m³",
        tire_marker_concentration: 0.71,
        tire_wear_concentration: 2.56,
        tire_wear_concentration_volume: 1.28,
        notes: "Post-storm sampling. Elevated particle concentrations observed.",
        user_id: 102,
        created_at: "2024-05-03T13:00:00",
        updated_at: "2024-05-03T13:00:00",
        active: 1,
        deleted: 0,
        sampling_method: "Plankton Net Surface Tow",
        technology_id: 2,
        data_type: "Study",
        spatial_or_temporal_monitoring: "Spatial",
        sampling_duration_hours: "2.25",
        station_id: "ST-POG-02",
        total_samples: "5",
        replicate_count: "3",
        quality_control_id: 6,
        lab_analysis_id: 6,
        tire_wear_leachable_total_concentration: 1.15,
        quadrant_placement: 2.00,
        compartment_type: 1,
        sampling_instrument: "Bongo Net 300µm",
        sampling_instrument_group: "Neuston Net",
        sampling_time_reference: "UTC+1",
        location_id: 2
    }
];

const labAnalysisData = [
    {
        id: 1,
        campaign_micro_sample_id: 1,
        digestion_y_n: "Yes",
        digestion_solution: "H2O2 30% + Fe(II)",
        digestion_temperature_c: "65",
        digestion_time_h: "24",
        recovery_solution: "NaCl saturated",
        density_solution_g_cm3: "1.2",
        recovery_particles: "95%",
        polymer_identification: "FTIR Spectroscopy",
        pi_compartment: "PE",
        pi_percentage: "45.2",
        pi_number_particles: "1738",
        fibers: "892",
        active: 1,
        deleted: 0,
        created_at: "2024-03-16T10:00:00",
        updated_at: "2024-03-16T10:00:00",
        pi_instrument: "Perkin Elmer Spectrum Two",
        pi_method_technique: "ATR-FTIR"
    },
    {
        id: 2,
        campaign_micro_sample_id: 2,
        digestion_y_n: "Yes",
        digestion_solution: "H2O2 30%",
        digestion_temperature_c: "60",
        digestion_time_h: "48",
        recovery_solution: "ZnCl2 1.6 g/cm³",
        density_solution_g_cm3: "1.6",
        recovery_particles: "92%",
        polymer_identification: "Raman Spectroscopy",
        pi_compartment: "PP",
        pi_percentage: "38.7",
        pi_number_particles: "1983",
        fibers: "1245",
        active: 1,
        deleted: 0,
        created_at: "2024-03-23T09:30:00",
        updated_at: "2024-03-23T09:30:00",
        pi_instrument: "Horiba XploRA PLUS",
        pi_method_technique: "Confocal Raman"
    },
    {
        id: 3,
        campaign_micro_sample_id: 3,
        digestion_y_n: "Yes",
        digestion_solution: "KOH 10%",
        digestion_temperature_c: "70",
        digestion_time_h: "36",
        recovery_solution: "NaI 1.8 g/cm³",
        density_solution_g_cm3: "1.8",
        recovery_particles: "97%",
        polymer_identification: "Py-GC/MS",
        pi_compartment: "PS",
        pi_percentage: "28.5",
        pi_number_particles: "851",
        fibers: "623",
        active: 1,
        deleted: 0,
        created_at: "2024-04-06T14:00:00",
        updated_at: "2024-04-06T14:00:00",
        pi_instrument: "Agilent 7890B GC/5977B MSD",
        pi_method_technique: "Pyrolysis GC-MS"
    },
    {
        id: 4,
        campaign_micro_sample_id: 4,
        digestion_y_n: "No",
        digestion_solution: "N/A",
        digestion_temperature_c: "N/A",
        digestion_time_h: "N/A",
        recovery_solution: "NaCl saturated",
        density_solution_g_cm3: "1.2",
        recovery_particles: "89%",
        polymer_identification: "Visual + FTIR",
        pi_compartment: "PET",
        pi_percentage: "52.3",
        pi_number_particles: "2226",
        fibers: "1534",
        active: 1,
        deleted: 0,
        created_at: "2024-04-13T11:00:00",
        updated_at: "2024-04-13T11:00:00",
        pi_instrument: "Bruker ALPHA II",
        pi_method_technique: "ATR-FTIR"
    },
    {
        id: 5,
        campaign_micro_sample_id: 5,
        digestion_y_n: "Yes",
        digestion_solution: "H2O2 35% + Fe(II)",
        digestion_temperature_c: "68",
        digestion_time_h: "30",
        recovery_solution: "ZnCl2 1.7 g/cm³",
        density_solution_g_cm3: "1.7",
        recovery_particles: "94%",
        polymer_identification: "FTIR Spectroscopy",
        pi_compartment: "PE",
        pi_percentage: "41.8",
        pi_number_particles: "1490",
        fibers: "785",
        active: 1,
        deleted: 0,
        created_at: "2024-04-21T10:30:00",
        updated_at: "2024-04-21T10:30:00",
        pi_instrument: "Thermo Scientific Nicolet iS50",
        pi_method_technique: "Micro-FTIR Imaging"
    },
    {
        id: 6,
        campaign_micro_sample_id: 6,
        digestion_y_n: "Yes",
        digestion_solution: "HNO3 65% + HCl 37%",
        digestion_temperature_c: "75",
        digestion_time_h: "24",
        recovery_solution: "NaI 1.8 g/cm³",
        density_solution_g_cm3: "1.8",
        recovery_particles: "96%",
        polymer_identification: "Raman + FTIR",
        pi_compartment: "Mixed",
        pi_percentage: "35.6",
        pi_number_particles: "2021",
        fibers: "1456",
        active: 1,
        deleted: 0,
        created_at: "2024-05-04T15:00:00",
        updated_at: "2024-05-04T15:00:00",
        pi_instrument: "WITec alpha300 R",
        pi_method_technique: "Combined Raman-FTIR"
    }
];

const qualityControlData = [
    {
        id: 1,
        campaign_micro_sample_id: 1,
        blanks: 3,
        control: 2,
        blanck_pi: 2.50,
        control_pi: 95.80,
        data_correction: 1,
        active: 1,
        deleted: 0,
        created_at: "2024-03-16T10:00:00",
        updated_at: "2024-03-16T10:00:00"
    },
    {
        id: 2,
        campaign_micro_sample_id: 2,
        blanks: 4,
        control: 3,
        blanck_pi: 3.10,
        control_pi: 94.20,
        data_correction: 1,
        active: 1,
        deleted: 0,
        created_at: "2024-03-23T09:30:00",
        updated_at: "2024-03-23T09:30:00"
    },
    {
        id: 3,
        campaign_micro_sample_id: 3,
        blanks: 2,
        control: 2,
        blanck_pi: 1.80,
        control_pi: 97.50,
        data_correction: 1,
        active: 1,
        deleted: 0,
        created_at: "2024-04-06T14:00:00",
        updated_at: "2024-04-06T14:00:00"
    },
    {
        id: 4,
        campaign_micro_sample_id: 4,
        blanks: 3,
        control: 2,
        blanck_pi: 2.90,
        control_pi: 93.40,
        data_correction: 1,
        active: 1,
        deleted: 0,
        created_at: "2024-04-13T11:00:00",
        updated_at: "2024-04-13T11:00:00"
    },
    {
        id: 5,
        campaign_micro_sample_id: 5,
        blanks: 4,
        control: 3,
        blanck_pi: 2.20,
        control_pi: 96.10,
        data_correction: 1,
        active: 1,
        deleted: 0,
        created_at: "2024-04-21T10:30:00",
        updated_at: "2024-04-21T10:30:00"
    },
    {
        id: 6,
        campaign_micro_sample_id: 6,
        blanks: 3,
        control: 2,
        blanck_pi: 3.50,
        control_pi: 92.80,
        data_correction: 1,
        active: 1,
        deleted: 0,
        created_at: "2024-05-04T15:00:00",
        updated_at: "2024-05-04T15:00:00"
    }
];

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
    const campaign = campaignData[campaignId];
    if (!campaign) return;

    currentCampaignId = campaignId;

    const content = `
        <div class="breadcrumb">
            <a onclick="showView('overview')">Overview</a> >
            <a onclick="showView('${campaign.type.toLowerCase()}')">${campaign.type} Campaigns</a> >
            ${campaign.title}
        </div>
        <h2>${campaign.title}</h2>

        <div class="campaign-details">
            <div>
                <div class="section">
                    <h3>Campaign Overview</h3>
                    <p><strong>Status:</strong> <span class="status-${campaign.status.toLowerCase()}">${campaign.status}</span></p>
                    <p><strong>Location:</strong> ${campaign.location}</p>
                    <p><strong>Duration:</strong> ${campaign.duration}</p>
                    <p><strong>Lead Institution:</strong> ${campaign.lead}</p>
                    <p><strong>Budget:</strong> ${campaign.budget}</p>
                    <br>
                    <p>${campaign.description}</p>
                </div>

                <div class="section">
                    <h3>Objectives</h3>
                    <ul>
                        ${campaign.objectives.map(obj => `<li>${obj}</li>`).join('')}
                    </ul>
                </div>

                <div class="section">
                    <h3>Key Results</h3>
                    <table class="data-table">
                        <thead>
                            <tr><th>Parameter</th><th>Value</th><th>Unit</th></tr>
                        </thead>
                        <tbody>
                            ${campaign.results.map(result =>
                                `<tr><td>${result.parameter}</td><td>${result.value}</td><td>${result.unit}</td></tr>`
                            ).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <div>
                <div class="section">
                    <h3>Technologies Used</h3>
                    ${campaign.technologies.map(tech =>
                        `<div class="tech-item tech-clickable" style="margin-bottom: 10px;" onclick="showSolutionDetail('${tech}')">
                            <h5>${tech}</h5>
                            <div class="tech-meta">Active in this campaign • Click to view details</div>
                        </div>`
                    ).join('')}
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
