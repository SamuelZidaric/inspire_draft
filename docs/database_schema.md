# Database Schema Reference

This document contains the complete database schema for the INSPIRE project.

## Campaign Tables

### campaign
Main campaign table containing both macro and micro campaigns, differentiated by `target_litter_category`.

| Column | Type | Nullable | Key | Extra |
|--------|------|----------|-----|-------|
| id | int | NO | PRI | auto_increment |
| location_id | int | YES | MUL | |
| organisation_id | int | YES | MUL | |
| campaign_code | varchar | YES | | |
| target_litter_category | enum | YES | MUL | |
| campaign_date_start | datetime | YES | | |
| campaign_date_end | datetime | YES | | |
| number_of_sampling_stations | int | YES | | |
| notes | text | YES | | |
| technology_id | int | YES | MUL | |
| active | tinyint | YES | | |
| deleted | tinyint | YES | | |
| created_at | timestamp | NO | | |
| updated_at | timestamp | NO | | on update CURRENT_TIMESTAMP |
| user_id | int | YES | MUL | |
| campaign_type_id | int | YES | | |
| external | tinyint | YES | | |

### campaign_macro_sample
Macro litter sample data linked to campaigns.

| Column | Type | Nullable | Key | Extra |
|--------|------|----------|-----|-------|
| id | int | NO | PRI | auto_increment |
| campaign_id | int | YES | MUL | |
| sample_code | varchar | YES | | |
| sampling_date_start | datetime | YES | | |
| sampling_date_end | datetime | YES | | |
| sampling_latitude_start | decimal | YES | | |
| sampling_longitude_start | decimal | YES | | |
| sampling_latitude_end | decimal | YES | | |
| sampling_longitude_end | decimal | YES | | |
| survey_length | decimal | YES | | |
| survey_width | decimal | YES | | |
| sampling_method | varchar | YES | | |
| sampling_protocol_reference | varchar | YES | | |
| technology_id | int | YES | MUL | |
| data_type | enum | YES | | |
| spatial_or_temporal_monitoring | enum | YES | | |
| sampling_duration_hours | decimal | YES | | |
| station_id | varchar | YES | | |
| total_stations | int | YES | | |
| total_samples | int | YES | | |
| replicate_count | tinyint | YES | | |
| total_litter_ww | decimal | YES | | |
| total_litter_dw | decimal | YES | | |
| notes | text | YES | | |
| user_id | int | YES | MUL | |
| custom_field_id | int | YES | MUL | |
| active | tinyint | YES | | |
| deleted | tinyint | YES | | |
| created_at | timestamp | NO | | |
| updated_at | timestamp | NO | | on update CURRENT_TIMESTAMP |
| organisation_id | int | YES | MUL | |
| sampling_time_reference | varchar | YES | | |
| location_id | int | YES | MUL | |
| quadrant_placement | decimal | YES | | |
| sampling_instrument | varchar | YES | | |
| sampling_instrument_uri | varchar | YES | | |
| campaign_row_code | varchar | YES | | |
| altitude | decimal | YES | | |
| compartment_type | int | YES | MUL | |
| survey_answer | mediumtext | YES | | |

### campaign_macro_sample_item
Individual litter items within macro samples.

| Column | Type | Nullable | Key | Extra |
|--------|------|----------|-----|-------|
| id | int | NO | PRI | auto_increment |
| campaign_macro_sample_id | int | YES | MUL | |
| litter_id | int | YES | MUL | |
| quantity | int | YES | | |
| notes | text | YES | | |
| active | tinyint | YES | | |
| deleted | tinyint | YES | | |
| created_at | timestamp | NO | | |
| updated_at | timestamp | NO | | on update CURRENT_TIMESTAMP |
| name | varchar | YES | | |

### campaign_macro_sample_item_polymer_type
Polymer type classification for macro sample items.

| Column | Type | Nullable | Key | Extra |
|--------|------|----------|-----|-------|
| campaign_macro_sample_item_id | int | NO | PRI | |
| polymer_type_id | int | NO | PRI | |
| name | varchar | YES | | |

### campaign_micro_sample
Microplastic sample data linked to campaigns.

| Column | Type | Nullable | Key | Extra |
|--------|------|----------|-----|-------|
| id | int | NO | PRI | auto_increment |
| campaign_id | int | YES | MUL | |
| sample_code | varchar | YES | | |
| sampling_date_start | datetime | YES | | |
| sampling_date_end | datetime | YES | | |
| sampling_latitude_start | decimal | YES | | |
| sampling_longitude_start | decimal | YES | | |
| sampling_latitude_end | decimal | YES | | |
| sampling_longitude_end | decimal | YES | | |
| survey_length | varchar | YES | | |
| survey_width | varchar | YES | | |
| sampling_protocol_reference | varchar | YES | | |
| flowmeter_model | varchar | YES | | |
| flowmeter_equation | varchar | YES | | |
| flowmeter_start_count | varchar | YES | | |
| flowmeter_end_count | varchar | YES | | |
| particles_total_count | varchar | YES | | |
| particles_total_weight | varchar | YES | | |
| particles_total_concentration | varchar | YES | | |
| tire_marker_concentration | decimal | YES | | |
| tire_wear_concentration | decimal | YES | | |
| tire_wear_concentration_volume | decimal | YES | | |
| notes | text | YES | | |
| user_id | int | YES | MUL | |
| created_at | timestamp | NO | | |
| updated_at | timestamp | NO | | on update CURRENT_TIMESTAMP |
| active | tinyint | YES | | |
| deleted | tinyint | YES | | |
| sampling_method | varchar | YES | | |
| technology_id | int | YES | MUL | |
| data_type | enum | YES | | |
| spatial_or_temporal_monitoring | enum | YES | | |
| sampling_duration_hours | varchar | YES | | |
| station_id | varchar | YES | | |
| total_samples | varchar | YES | | |
| replicate_count | varchar | YES | | |
| quality_control_id | int | YES | MUL | |
| lab_analysis_id | int | YES | MUL | |
| tire_wear_leachable_total_concentration | decimal | YES | | |
| quadrant_placement | decimal | YES | | |
| compartment_type | int | YES | MUL | |
| sampling_instrument | varchar | YES | | |
| sampling_instrument_group | varchar | YES | | |
| sampling_time_reference | varchar | YES | | |
| location_id | int | YES | MUL | |

### campaign_micro_sample_item
Individual particles within micro samples.

| Column | Type | Nullable | Key | Extra |
|--------|------|----------|-----|-------|
| id | int | NO | PRI | auto_increment |
| campaign_micro_sample_id | int | NO | MUL | |
| particle_code | varchar | YES | | |
| is_plastic | tinyint | YES | | |
| particle_length | decimal | YES | | |
| particle_width | decimal | YES | | |
| particle_mass | decimal | YES | | |
| notes | text | YES | | |
| particle_type_id | int | YES | MUL | |
| particle_size_id | int | YES | MUL | |
| particle_colour_id | int | YES | MUL | |
| particle_transparency_id | int | YES | MUL | |
| particle_shape_id | int | YES | MUL | |
| particle_polymer_type_id | int | YES | MUL | |
| sample_replicate_code | int | YES | | |
| analysis_instrument_method_id | int | YES | | |
| instrument_match | varchar | YES | | |
| material_type | int | YES | | |
| particle_size_class_uri | varchar | YES | | |
| particle_colour_uri | varchar | YES | | |
| particle_transparency_uri | varchar | YES | | |
| particle_type_uri | varchar | YES | | |
| particle_shape_uri | varchar | YES | | |
| particle_polymer_type_uri | varchar | YES | | |
| particle_container_code | int | YES | | |
| micro_institution | varchar | YES | | |
| micro_institution_ror | varchar | YES | | |
| operator_name | varchar | YES | | |
| operator_orcid | varchar | YES | | |
| operator_email | varchar | YES | | |

## Related Tables

### campaign_ip
Intellectual property and publication references for campaigns.

| Column | Type | Nullable | Key | Extra |
|--------|------|----------|-----|-------|
| id | int | NO | PRI | auto_increment |
| campaign_id | int | NO | MUL | |
| reference | varchar | YES | | |
| full_reference | varchar | YES | | |
| year | int | YES | | |
| title | varchar | YES | | |
| doi | varchar | YES | | |
| doi_code | varchar | YES | | |
| original_review | varchar | YES | | |
| observations | varchar | YES | | |
| license_id | int | YES | MUL | |
| supplementary | tinyint | YES | | |
| data_from_graph | tinyint | YES | | |
| data_request | tinyint | YES | | |
| author_email | varchar | YES | | |
| copyright | varchar | YES | | |
| created_at | timestamp | YES | | |
| updated_at | timestamp | YES | | |
| active | tinyint | YES | | |
| deleted | tinyint | YES | | |

### campaign_weather_station_log
Weather data associated with campaigns.

| Column | Type | Nullable | Key | Extra |
|--------|------|----------|-----|-------|
| id | int | NO | PRI | auto_increment |
| datetime | datetime | YES | | |
| temp | decimal | YES | | |
| humidity | decimal | YES | | |
| precipitation | decimal | YES | | |
| wind_speed | decimal | YES | | |
| wind_max_speed | decimal | YES | | |
| wind_direction | decimal | YES | | |
| wind_direction_max | decimal | YES | | |
| radiation | decimal | YES | | |
| pressure_hpa | decimal | YES | | |
| user_id | int | YES | | |
| active | tinyint | YES | | |
| deleted | tinyint | YES | | |
| created_at | int | YES | | |
| updated_at | int | YES | | |
| macro_sample_id | int | YES | MUL | |
| micro_sample_id | int | YES | MUL | |

### riverbank_sampling_data
Riverbank-specific sampling data for campaigns.

| Column | Type | Nullable | Key | Extra |
|--------|------|----------|-----|-------|
| id | int | NO | PRI | auto_increment |
| campaign_id | int | YES | MUL | |
| sampling_area_length_m | decimal | YES | | |
| sampling_area_width_m | decimal | YES | | |
| sampling_area_m2 | decimal | YES | | |
| sediment_weight_kg | decimal | YES | | |
| riverbank_tree_bush | varchar | YES | | |
| distance_from_waterline_m | decimal | YES | | |
| active | tinyint | YES | | |
| deleted | tinyint | YES | | |
| created_at | timestamp | NO | | |
| updated_at | timestamp | NO | | on update CURRENT_TIMESTAMP |

### riverbed_sampling_data
Riverbed-specific sampling data for campaigns.

| Column | Type | Nullable | Key | Extra |
|--------|------|----------|-----|-------|
| id | int | NO | PRI | auto_increment |
| campaign_id | int | YES | | |
| bottom_depth_m | decimal | YES | | |
| sampling_depth_m | decimal | YES | | |
| layer_in_cm | decimal | YES | | |
| layer_end_cm | decimal | YES | | |
| sediment_depth_cm | decimal | YES | | |
| dw_ww | decimal | YES | | |
| sediment_type | decimal | YES | | |
| sediment_weight_kg | decimal | YES | | |
| sediment_area_m2 | decimal | YES | | |
| grain_size | decimal | YES | | |
| active | tinyint | YES | | |
| deleted | tinyint | YES | | |
| created_at | timestamp | NO | | |
| updated_at | timestamp | NO | | on update CURRENT_TIMESTAMP |

### water_quality_parameters
Water quality measurements for micro samples.

| Column | Type | Nullable | Key | Extra |
|--------|------|----------|-----|-------|
| id | int | NO | PRI | auto_increment |
| micro_sample_id | int | YES | | |
| salinity_psu | decimal | YES | | |
| temperature_c | decimal | YES | | |
| conductivity_us_cm | decimal | YES | | |
| ph | decimal | YES | | |
| turbidity_ntu | decimal | YES | | |
| chla_mg_m3 | decimal | YES | | |
| suspended_solids_mg_l | decimal | YES | | |
| active | tinyint | YES | | |
| deleted | tinyint | YES | | |
| created_at | timestamp | NO | | |
| updated_at | timestamp | NO | | on update CURRENT_TIMESTAMP |

### water_sampling_data
Water-specific sampling data for micro samples.

| Column | Type | Nullable | Key | Extra |
|--------|------|----------|-----|-------|
| id | int | NO | PRI | auto_increment |
| micro_sample_id | int | YES | | |
| minimum_depth_m | decimal | YES | | |
| maximum_depth_m | decimal | YES | | |
| instrument_dimension_diameter_or_width_m | decimal | YES | | |
| instrument_dimension_height_m | decimal | YES | | |
| opening_area_of_the_net_m2 | decimal | YES | | |
| volume_of_water_filtered_m3 | decimal | YES | | |
| mesh_size_mm | decimal | YES | | |
| sampling_area_length_m | decimal | YES | | |
| sampling_area_width_m | decimal | YES | | |
| sampling_area_m2 | decimal | YES | | |
| sediment_weight_kg | decimal | YES | | |
| active | tinyint | YES | | |
| deleted | tinyint | YES | | |
| created_at | timestamp | NO | | |
| updated_at | timestamp | NO | | on update CURRENT_TIMESTAMP |

### lab_analysis
Laboratory analysis data for micro samples.

| Column | Type | Nullable | Key | Extra |
|--------|------|----------|-----|-------|
| id | int | NO | PRI | auto_increment |
| campaign_micro_sample_id | int | YES | MUL | |
| digestion_y_n | varchar | YES | | |
| digestion_solution | varchar | YES | | |
| digestion_temperature_c | varchar | YES | | |
| digestion_time_h | varchar | YES | | |
| recovery_solution | varchar | YES | | |
| density_solution_g_cm3 | varchar | YES | | |
| recovery_particles | varchar | YES | | |
| polymer_identification | varchar | YES | | |
| pi_compartment | varchar | YES | | |
| pi_percentage | varchar | YES | | |
| pi_number_particles | varchar | YES | | |
| fibers | varchar | YES | | |
| active | tinyint | YES | | |
| deleted | tinyint | YES | | |
| created_at | timestamp | NO | | |
| updated_at | timestamp | NO | | on update CURRENT_TIMESTAMP |
| pi_instrument | varchar | YES | | |
| pi_method_technique | varchar | YES | | |

### quality_control
Quality control data for micro samples.

| Column | Type | Nullable | Key | Extra |
|--------|------|----------|-----|-------|
| id | int | NO | PRI | auto_increment |
| campaign_micro_sample_id | int | YES | MUL | |
| blanks | varchar | YES | | |
| control | varchar | YES | | |
| blanck_pi | varchar | YES | | |
| control_pi | varchar | YES | | |
| data_correction | varchar | YES | | |
| active | tinyint | YES | | |
| deleted | tinyint | YES | | |
| created_at | timestamp | NO | | |
| updated_at | timestamp | NO | | on update CURRENT_TIMESTAMP |

## Supporting Tables

### location
Geographic location data.

| Column | Type | Nullable | Key | Extra |
|--------|------|----------|-----|-------|
| id | int | NO | PRI | auto_increment |
| site | varchar | YES | | |
| is_demo_site | tinyint | YES | | |
| created_at | int | YES | | |
| updated_at | int | YES | | |
| water_body_type | varchar | YES | | |
| water_body_name | varchar | YES | | |
| active | tinyint | YES | | |
| deleted | tinyint | YES | | |
| location | varchar | YES | | |
| main_river | varchar | YES | | |
| continent_id | int | YES | MUL | |
| country_id | int | YES | MUL | |
| city_id | int | YES | MUL | |
| site_name | varchar | YES | | |
| timezone | varchar | YES | | |
| start_latitude | varchar | YES | | |
| end_latitude | varchar | YES | | |
| start_longitude | varchar | YES | | |
| end_longitude | varchar | YES | | |
| survey_answer | longtext | YES | | |
| custom_field_id | int | YES | MUL | |
| external | tinyint | YES | | |

### organisation
Organization data.

| Column | Type | Nullable | Key | Extra |
|--------|------|----------|-----|-------|
| id | int | NO | PRI | auto_increment |
| name | varchar | YES | | |
| vat_number | varchar | YES | | |
| administrative_email | varchar | YES | | |
| referent_email | varchar | YES | | |
| address | varchar | YES | | |
| city | varchar | YES | | |
| state_region | varchar | YES | | |
| postal_code | varchar | YES | | |
| telephone | varchar | YES | | |
| logo | text | YES | | |
| emodnet_originator | int | YES | | |
| active | tinyint | YES | | |
| deleted | tinyint | YES | | |
| created_at | int | YES | | |
| updated_at | int | YES | | |
| country_id | int | YES | MUL | |
| continent_id | int | YES | MUL | |
| website | varchar | YES | | |
| organisation_type_id | int | YES | MUL | |

### technology
Technology/equipment used in campaigns.

| Column | Type | Nullable | Key | Extra |
|--------|------|----------|-----|-------|
| id | int | NO | PRI | auto_increment |
| name | varchar | YES | | |
| serial | varchar | YES | | |
| technology_type_id | int | YES | MUL | |
| organisation_id | int | YES | MUL | |
| created_at | int | YES | | |
| updated_at | int | YES | | |
| active | tinyint | YES | | |
| deleted | tinyint | YES | | |
| ping_time_interval | int | YES | | |
| send_time_interval | int | YES | | |

### litter
Litter classification codes and types.

| Column | Type | Nullable | Key | Extra |
|--------|------|----------|-----|-------|
| id | int | NO | PRI | auto_increment |
| j_code | varchar | YES | | |
| g_code | varchar | YES | | |
| ospar_code | varchar | YES | | |
| j_code_type | varchar | YES | | |
| name | varchar | YES | | |
| created_at | int | YES | | |
| updated_at | int | YES | | |
| active | tinyint | YES | | |
| deleted | tinyint | YES | | |
| rldb_list | varchar | YES | | |
| jm_code | varchar | YES | | |
| u_code | varchar | YES | | |
| icc_code | varchar | YES | | |
| internal_id | int | YES | | |
| description | text | YES | | |

## Microplastic Classification Tables

### micro_litter_color
| Column | Type | Nullable | Key | Extra |
|--------|------|----------|-----|-------|
| id | int | NO | PRI | auto_increment |
| label | varchar | YES | | |
| code | varchar | YES | UNI | |
| definition | text | NO | | |
| valid_since | date | YES | | |

### micro_litter_shape
| Column | Type | Nullable | Key | Extra |
|--------|------|----------|-----|-------|
| id | int | NO | PRI | auto_increment |
| label | varchar | YES | | |
| code | varchar | YES | UNI | |
| definition | text | NO | | |
| valid_since | date | YES | | |

### micro_litter_size
| Column | Type | Nullable | Key | Extra |
|--------|------|----------|-----|-------|
| id | int | NO | PRI | auto_increment |
| label | varchar | YES | | |
| code | varchar | YES | UNI | |
| definition | text | NO | | |
| valid_since | date | YES | | |

### micro_litter_transparency
| Column | Type | Nullable | Key | Extra |
|--------|------|----------|-----|-------|
| id | int | NO | PRI | auto_increment |
| label | varchar | YES | | |
| code | varchar | YES | UNI | |
| definition | text | NO | | |
| valid_since | date | YES | | |

### micro_litter_type
| Column | Type | Nullable | Key | Extra |
|--------|------|----------|-----|-------|
| id | int | NO | PRI | auto_increment |
| label | varchar | NO | | |
| code | varchar | YES | UNI | |
| definition | text | NO | | |
| valid_since | date | YES | | |

### micro_polymer_type
| Column | Type | Nullable | Key | Extra |
|--------|------|----------|-----|-------|
| id | int | NO | PRI | auto_increment |
| code | varchar | YES | | |
| label | varchar | YES | | |
| chemical_formula | varchar | YES | | |
| definition | text | YES | | |
| valid_since | date | YES | | |

### compartment_type
| Column | Type | Nullable | Key | Extra |
|--------|------|----------|-----|-------|
| id | int | NO | PRI | auto_increment |
| code | varchar | NO | UNI | |
| label | varchar | NO | | |
| campaign_type | enum | YES | | |
| definition | text | YES | | |

## Current Campaign Structure (To Be Refactored)

Currently, the system uses a **single `campaign` table** with a `target_litter_category` enum field to differentiate between macro and micro campaigns. This needs to be split into:

1. **`campaign_macro`** - Dedicated table for macrolitter campaigns
2. **`campaign_micro`** - Dedicated table for microplastic campaigns

Each campaign type should have its own specific fields and logic based on their different monitoring requirements.
