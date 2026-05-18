@extends(FRONTEND_THEME_NAME.'.layouts.newapp')

@push('PAGE_ASSETS_CSS')

<link rel="stylesheet" type="text/css" href="{{__frontend_asset('vendors/css/forms/wizard/bs-stepper.min.css')}}">
<link rel="stylesheet" type="text/css" href="{{__frontend_asset('vendors/css/pickers/pickadate/pickadate.css')}}">
<link rel="stylesheet" type="text/css" href="{{__frontend_asset('css/plugins/forms/pickers/form-pickadate.css')}}">
<link rel="stylesheet" type="text/css" href="{{__frontend_asset('css/pages/app-user.css')}}">
<link rel="stylesheet" type="text/css" href="{{__frontend_asset('css/core/menu/menu-types/horizontal-menu.css')}}">
<link rel="stylesheet" type="text/css" href="{{__frontend_asset('css/plugins/forms/form-validation.css')}}">
<link rel="stylesheet" type="text/css" href="{{__frontend_asset('css/plugins/forms/form-wizard.css')}}">
<link rel="stylesheet" type="text/css" href="{{__backend_asset('assets/css/rating-apply.css')}}">
@endpush


@push('PAGE_STYLES')
    <style>
        .btn-grey{
    border-color: #f3f2f7 !important;
    background-color: #f3f2f7 !important;
    color: #6E6B7B !important;
    }
    .file-input__label {
        cursor: pointer;
        display: inline-flex;
        height: 25px;
        align-items: center;
        border-radius: 4px;
        font-size: 12px;
        /* font-weight: 600; */
        color: #fff;
        padding: 8px 8px;
        background-color: #00b6e3 !important;
        box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.25);
    }
    .file-input__input {
    /* width: 0.1px; */
    /* height: 0.1px; */
    cursor: pointer;
    opacity: 1;
    overflow: hidden;
    position: absolute;
    cursor: pointer;

    /* z-index: -1; */
    }
    .tabs-wrapper{
    position: relative;
    }
    .scroller-btn{
    position: absolute;
    height: 30px;
    width: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color:#5453D2;
    border-radius: 50%;
    left: -50px;
    top: 8px;
    cursor: pointer;
    color: #ffffff;
    }
    
    </style>
@endpush
@section('content')
@include(FRONTEND_THEME_NAME . '.tabs')

@php

$completed = __get_completed_status($certficateDeatils->id, $version);
$rating_type = explode('_', $projectdetails->rating_type);
$count_completed = 0;
$required_credits = count($completed);
$show = 0;
foreach($completed as $complete){
    $form_submit_field = count( __get_form_submit_field($projectdetails->id,$tab, $complete['sub_slug'],$complete['tab'] ));
    $field_in_form = __get_param_config($complete['tab'], $complete['sub_slug'], $version, $projectdetails->rating_type,  $projectdetails->id);

    if($form_submit_field == $field_in_form)$count_completed += 1;
}
if($count_completed == $required_credits) $show = 1;

$cardTitle = '';
$presentTab = 0;
foreach($subtabs as $val) {
    if($val['sub_slug'] == $activeMenu) {
        $cardTitle = $val['name'];
        break;
    }
}
foreach($subtabs as $key => $val) {
    if($val['sub_slug'] == $activeMenu) {
        $presentTab = $key;
        break;
    }
}
$previoustab = '';
$countKey = max(array_keys($subtabs));
$next = $presentTab+1;
if($presentTab == $countKey)$next = $presentTab;

if($presentTab > 0)$previoustab = $subtabs[$presentTab-1]['sub_slug'];
if($presentTab == $next){
    $nexttab = $activeMenu;
}else{
$nexttab = $subtabs[$presentTab+1]['sub_slug'];
}
$currentTab = $activeMenu;
$rejectReport = __get_project_report_status($projectdetails->projectid, $activeSubmenu, $activeMenu);
$isPending = __check_report_pending_points($projectdetails->projectid, $activeSubmenu, $activeMenu, $certficateDeatils->submission_count);


$reappeal = __get_project_reappeal($projectdetails->id);
$reappealedTabs = [];
if(isset($reappeal)){
    $reappealedTabs = json_decode($certficateDeatils->reappeal_checklist);
}

$allow = true;

@endphp
<section class="horizontal-wizard">
        <div class="row">
            <div class="col-lg-12" style="    height: fit-content; margin-top: 50px;">
                <div class="title-sub-tab text-center d-flex">
                    <div class="project-tile-id">
                        <p>{{$projectdetails->final_project_id}} / {{$projectdetails->project_title}}</p>
                </div>
                </div>
            </div>
        </div>
        <div class="row mt-1">
            <div class="col-lg-9">
                <div class="card">
                    <div class="card-header d-flex align-items-center justify-content-between ">
                        <p class="card-title m-0 me-2"> 
                            @foreach($subtabs as $val)
                                        @if($val['sub_slug'] == $activeMenu)  {{$val['name']}} @break;@endif
                            @endforeach 
                        </p>
                    </div>
                   @if($activeSubmenu == 'water_conservation' && $activeMenu == 'annex_wc_one' && $version == 3 && $rating_type[0] != 5)
                        @include(FRONTEND_THEME_NAME . '.rating.annexV1.annexOne')
                    @elseif($activeSubmenu == 'water_conservation' && $activeMenu == 'annex_wc_one' && $version == 3 && $rating_type[0] == 5)
                        @include(FRONTEND_THEME_NAME . '.rating.greeninteriors.annexOne')
                    @elseif($activeSubmenu == 'water_conservation' && $activeMenu == 'annex_wc_two' && $version == 3 && $rating_type[0] == 5)
                        @include(FRONTEND_THEME_NAME . '.rating.annexV1.annexTwo')
                    @elseif($activeSubmenu == 'water_conservation' && $activeMenu == 'annex_wc_two' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.greenhomes.annexTwo')
                    @elseif($activeSubmenu == 'water_conservation' && $activeMenu == 'annex_wc_two_copy' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.greenhomes.annexTwo_old')
                    @elseif($activeSubmenu == 'water_conservation' && $activeMenu == 'annex_wc_three' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.annexV1.annexThree')
                    @elseif($activeSubmenu == 'water_conservation' && $activeMenu == 'annex_wc_four' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.annexV1.annexFour')
                    @elseif($activeSubmenu == 'material_resources' && $activeMenu == 'annexure_master_material' && $version == 3 && $rating_type[0] == 5)
                        @include(FRONTEND_THEME_NAME . '.rating.annexV1.annexMasterMaterial')
                    @elseif($activeSubmenu == 'material_resources' && $activeMenu == 'annexure_master_material' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.greenhomes.annexMasterMaterial')
                    @elseif($activeSubmenu == 'material_resources' && $activeMenu == 'annexure_waste_management' && $version == 3 && $rating_type[0] == 5)
                        @include(FRONTEND_THEME_NAME . '.rating.annexV1.annexMasterWaste')
                    @elseif($activeSubmenu == 'material_resources' && $activeMenu == 'annexure_waste_management' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.greenhomes.annexMasterWaste')
                    @elseif($activeSubmenu == 'indoor_enviornment_quality' && $activeMenu == 'annexure_ac_fresh_air' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.annexV1.annexAc')
                    @elseif($activeSubmenu == 'indoor_enviornment_quality' && $activeMenu == 'annexure_non_ac_fresh_air' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.annexV1.annexNonAc')
                    @elseif($activeSubmenu == 'indoor_enviornment_quality' && $activeMenu == 'annex_acoustic' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.annexV1.annexAcoutics')
                    @elseif($activeSubmenu == 'indoor_enviornment_quality' && $activeMenu == 'annexure_occupant_wellbeing_facility' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.annexV1.annexOccupantWellbeingFacility')
                    @elseif($activeSubmenu == 'indoor_enviornment_quality' && $activeMenu == 'annex_daylight_noise' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.annexV1.annexDaylightcoTwoNoise')                    
                    @elseif($activeSubmenu == 'energy_efficency' && $activeMenu == 'annex_lighting' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.annexV1.annexLighting')
                    @elseif($activeSubmenu == 'energy_efficency' && $activeMenu == 'annex_air_conditioning' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.annexV1.annexAirCondition')
                    @elseif($activeSubmenu == 'energy_efficency' && $activeMenu == 'annex_unitary_iseer' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.annexV1.annexUnitaryIseer')
                    @elseif($activeSubmenu == 'energy_efficency' && $activeMenu == 'annex_chiller_savings' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.annexV1.annexChillerSaving')
                    @elseif($activeSubmenu == 'energy_efficency' && $activeMenu == 'annex_vrv_savings' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.annexV1.annexVrvSaving')
                    @elseif($activeSubmenu == 'energy_efficency' && $activeMenu == 'annex_natural_venilation' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.annexV1.annexNaturalVenilation')
                    @elseif($activeSubmenu == 'energy_efficency' && $activeMenu == 'annex_conditioned_spaces' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.annexV1.annexConditionedSpaces')
                    @elseif($activeSubmenu == 'energy_efficency' && $activeMenu == 'annexure_onsite_renewable_energy' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.annexV1.annexOneSiteRenewable')
                    @elseif($activeSubmenu == 'energy_efficency' && $activeMenu == 'sensors_regularly_occupied' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.annexV1.annexSensorReqular')
                    @elseif($activeSubmenu == 'energy_efficency' && $activeMenu == 'non_sensors_regularly_occupied' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.annexV1.annexNonSensorReqular')
                    @elseif($activeSubmenu == 'sustainable_design' && $activeMenu == 'area_space_circulation' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.annexV1.annexAreaSpacesCirculation')
                    @elseif($activeSubmenu == 'energy_efficency' && $activeMenu == 'lpd_space_function_method' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.annexV1.annexLpdSpaceMethod')
                    @elseif($activeSubmenu == 'energy_efficency' && $activeMenu == 'lpd_building_area_method' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.annexV1.annexLpdBuildingMethodArea')
                    @elseif($activeSubmenu == 'resident_health_wellbeing' && $activeMenu == 'annex_rwh_one' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.greenhomes.rwh-one')
                    @elseif($activeSubmenu == 'resident_health_wellbeing' && $activeMenu == 'annex_rwh_one_one' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.greenhomes.rwh-one_one')
                    {{-- @elseif($activeSubmenu == 'resident_health_wellbeing' && $activeMenu == 'summanry_of_ventilation_two' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.greenhomes.summary_two_ventilation') --}}
                    @elseif($activeSubmenu == 'resident_health_wellbeing' && $activeMenu == 'summanry_of_ventilation_two_one' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.greenhomes.summary_two_one_ventilation')
                    @elseif($activeSubmenu == 'resident_health_wellbeing' && $activeMenu == 'annex_ventilation_design_one' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.greenhomes.rwh_ventilation_one')
                    @elseif($activeSubmenu == 'resident_health_wellbeing' && $activeMenu == 'annex_ventilation_design_two' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.greenhomes.rwh_ventilation_two')
                    @elseif($activeSubmenu == 'resident_health_wellbeing' && $activeMenu == 'annex_ventilation_design_cfd' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.greenhomes.rwh_ventilation_cfd')
                    @elseif($activeSubmenu == 'resident_health_wellbeing' && $activeMenu == 'annex_ventilation_design_air_conditioned' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.greenhomes.rwh_ventilation_air_ventilation')
                    @elseif($activeSubmenu == 'energy_efficency' && $activeMenu == 'annex_lpd_calculation' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.greenhomes.annex_lpd_calaculations')
                    @elseif($activeSubmenu == 'energy_efficency' && $activeMenu == 'simulaition_method' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.greenhomes.simulaition_method')
                    @elseif($activeSubmenu == 'energy_efficency' && $activeMenu == 'simulaition_method_output' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.greenhomes.simulaition_method_output')
                    @elseif($activeSubmenu == 'energy_efficency' && $activeMenu == 'energy_annex' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.greenhomes.energy_annex')
                    @elseif($activeSubmenu == 'energy_efficency' && $activeMenu == 'energy_analysis_annex' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.greenhomes.energy_analysis_annex')
                    @elseif($activeSubmenu == 'indoor_enviornment_quality' && $activeMenu == 'single_unit_annex' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.newbuilding.singlenewbuilding')
                    @elseif($activeSubmenu == 'indoor_enviornment_quality' && $activeMenu == 'multiple_unit_annex' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.newbuilding.multiplenewbuilding')
                    @elseif($activeSubmenu == 'indoor_enviornment_quality' && $activeMenu == 'single_zone_system' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.newbuilding.singlezonesystem')
                    @elseif($activeSubmenu == 'indoor_enviornment_quality' && $activeMenu == 'outdoor_air_systems' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.newbuilding.outdoorairsystem')
                    @elseif($activeSubmenu == 'rtev_annex' && $activeMenu == 'general_details' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.greenhomes.rtev_general_details')
                    @elseif($activeSubmenu == 'rtev_annex' && $activeMenu == 'enevlope_details' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.greenhomes.rtev_envelop')
                    @elseif($activeSubmenu == 'rtev_annex' && $activeMenu == 'enevlope_summary' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.greenhomes.enevelop_summary')
                    @elseif($activeSubmenu == 'rtev_annex' && $activeMenu == 'equivalent_shgc' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.greenhomes.equivalent_shgc')
                    @elseif($activeSubmenu == 'rtev_annex' && $activeMenu == 'term_details' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.greenhomes.terms')
                    @elseif($activeSubmenu == 'rtev_annex' && $activeMenu == 'rtev_value' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.greenhomes.rtev_value')
                    @elseif($activeSubmenu == 'energy_efficency' && $activeMenu == 'annex_eco_friendly_refrigerant' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.newbuilding.ecosinglezonesystem')
                    @elseif($activeSubmenu == 'energy_efficency' && $activeMenu == 'annex_simulation_input_parameters' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.newbuilding.simulaition_method')
                    @elseif($activeSubmenu == 'indoor_enviornment_quality' && $activeMenu == 'single_unit_annex' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.newbuilding.singlenewbuilding')
                    @elseif($activeSubmenu == 'indoor_enviornment_quality' && $activeMenu == 'multiple_unit_annex' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.newbuilding.multiplenewbuilding')
                    @elseif($activeSubmenu == 'indoor_enviornment_quality' && $activeMenu == 'single_zone_system' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.newbuilding.singlezonesystem')
                    @elseif($activeSubmenu == 'indoor_enviornment_quality' && $activeMenu == 'outdoor_air_systems' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.newbuilding.outdoorairsystem')
                    @elseif($activeSubmenu == 'indoor_enviornment_quality' && $activeMenu == 'single_unit_annex' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.newbuilding.singlenewbuilding')
                    @elseif($activeSubmenu == 'indoor_enviornment_quality' && $activeMenu == 'multiple_unit_annex' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.newbuilding.multiplenewbuilding')
                    @elseif($activeSubmenu == 'indoor_enviornment_quality' && $activeMenu == 'max_charge_annex' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.newbuilding.maxchargenewbuilding')
                    @elseif($activeSubmenu == 'indoor_enviornment_quality' && $activeMenu == 'max_charge_table_annex' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.newbuilding.maxchargetablenewbuilding')
                    @elseif($activeSubmenu == 'indoor_enviornment_quality' && $activeMenu == 'single_unit_annex' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.newbuilding.singlenewbuilding')
                    @elseif($activeSubmenu == 'indoor_enviornment_quality' && $activeMenu == 'multiple_unit_annex' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.newbuilding.multiplenewbuilding')
                    @elseif($activeSubmenu == 'indoor_enviornment_quality' && $activeMenu == 'max_charge_annex' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.newbuilding.maxchargenewbuilding')
                    @elseif($activeSubmenu == 'water_conservation' && $activeMenu == 'max_charge_table_annex' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.newbuilding.maxchargetablenewbuilding')
                    @elseif($activeSubmenu == 'water_conservation' && $activeMenu == 'hvac_water_requirement' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.newbuilding.hvacWaterRequire')
                    @elseif($activeSubmenu == 'energy_efficiency' && $activeMenu == 'epi_calculation' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.existingbuilding.existingEPIcalculation')
                    @elseif($activeSubmenu == 'energy_efficiency' && $activeMenu == 'eemr2_office' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.existingbuilding.exisitingEemr2office')
                    @elseif($activeSubmenu == 'energy_efficiency' && $activeMenu == 'epi_limit_calculation' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.existingbuilding.existingepilimitcal')
                    @elseif($activeSubmenu == 'sustainable_design' && $activeMenu == 'lpd_cal_annex' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.existingbuilding.existing_lpd_cal_annex')
                    @elseif($activeSubmenu == 'energy_efficiency' && $activeMenu == 'existing_simulaition_method_output' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.existingbuilding.existing_simulaition_method_output')
                    @elseif($activeSubmenu == 'energy_efficiency' && $activeMenu == 'existing_one_site_renewable' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.existingbuilding.existingOneSiteRenewable')
                    @elseif($activeSubmenu == 'water_conservation' && $activeMenu == 'existing_fte_cal' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.existingbuilding.existingFteCal')
                    @elseif($activeSubmenu == 'health_comfort' && $activeMenu == 'outdoor_air_system' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.existingbuilding.existingoutdoorairystem')
                    @elseif($activeSubmenu == 'water_conservation' && $activeMenu == 'rainfall_calculations' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.existingbuilding.existingrainfall')
                    @elseif($activeSubmenu == 'water_conservation' && $activeMenu == 'water_comsumpation' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.existingbuilding.exisitingWaterConsumption')
                    @elseif($activeSubmenu == 'health_comfort' && $activeMenu == 'single_zone_system' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.existingbuilding.existingsinglezonesystem')
                    @elseif($activeSubmenu == 'sustainable_design' && $activeMenu == 'urban_heat_roof' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.existingbuilding.existingUrbanHeatRoof')
                    @elseif($activeSubmenu == 'sustainable_design' && $activeMenu == 'urban_heat_roof_island' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.existingbuilding.existingUrbenHeadIsland')
                    @elseif($activeSubmenu == 'water_conservation' && $activeMenu == 'existing_water_efficiency' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.existingbuilding.existingWaterEfficiencyCalculation')
                    @elseif($activeSubmenu == 'water_conservation' && $activeMenu == 'existing_enchanced_water_efficiency' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.existingbuilding.existingenchancedwaterefficiency')
                    @elseif($activeSubmenu == 'water_conservation' && $activeMenu == 'existing_water_performance' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.existingbuilding.existingWaterPerformance')
                    @elseif($activeSubmenu == 'water_conservation' && $activeMenu == 'alternative_performance' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.existingbuilding.existingAlternativePerformance')
                    @elseif($activeSubmenu == 'energy_efficiency' && $activeMenu == 'building_energy_survey' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.annexV1.factorybuildingenergy')
                    @elseif($activeSubmenu == 'water_conservation' && $activeMenu == 'annextwo' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.factorybuilding.annextwo')
                    @elseif($activeSubmenu == 'energy_efficiency' && $activeMenu == 'annexure_eco_freindly_refrigerant' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.factorybuilding.ecosinglezonesystem')
                    @elseif($activeSubmenu == 'energy_efficiency' && $activeMenu == 'annexure_simulation_input' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.factorybuilding.simulaition_method')
                    @elseif($activeSubmenu == 'indoor_environment' && $activeMenu == 'mechancial_ventilation_sys' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.factorybuilding.mechancialVentilationSys')
                    @elseif($activeSubmenu == 'indoor_environment' && $activeMenu == 'freshair_condition_space' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.newbuilding.outdoorairsystem')
                         @elseif($activeSubmenu == 'indoor_environment' && $activeMenu == 'fresh_nonair_condition_space' && $version == 3)
                        @include(FRONTEND_THEME_NAME . '.rating.greenhomes.rwh_ventilation_one')
                    @else
                    <div id="rating-system" style=" padding: 0px 24px;margin-left: 10px!important; ">
                        @if(isset($params) && $subtabs == null)
                            <form id="rating_form" class="mt-2" method="POST" action="@if(count($rating) > 0){{route('updaterating')}}@else{{route('saverating')}} @endif" enctype="multipart/form-data">
                                @csrf
                                <input type="hidden"  name="table" value="{{$action}}">
                                <input type="hidden"  name="tab" value="{{$activeSubmenu}}" >
                                <input type="hidden"  name="subtab"  value="{{$activeMenu}}">
                                <input type="hidden"  name="version"  value="{{$version}}">
                                <input type="hidden"  name="decodeid"  value="{{$projectdetails->projectid}}">
                                <input type="hidden"  name="project_id"  value="{{$projectdetails->id}}">
                                <input type="hidden"  name="rating_type"  value="{{$projectdetails->rating_type}}">
                                <div class="row">
                                    @foreach($params as $param)
                                        <div @if($param['type'] == 'n' || $param['type'] == 't' || $param['type'] == 'nt' || $param['type'] == 'd') class="col-md-6 custom-index" @else class="col-md-12 custom-index" @endif >
                                            @php
                                            $value = __get_rating_data($projectdetails->id, $activeSubmenu, $activeMenu, $param['name'], $action, $projectdetails->rating_type);
                                            @endphp
                                            @if(array_key_exists('related_to', $param) && $param['related_to'])
                                                @php
                                                $value = __get_rating_relation_data($projectdetails->id, @$param['related_to'], $action, $projectdetails->rating_type);
                                                @endphp
                                            @endif
                                            <div class="form-group" id="div_{{$param['name']}}">
                                                
                                                @if($param['type'] == 't')
                                                <label for="{{$param['name']}}" class="form-label"> {{$param['display_name']}}@if($param['validation'] == 'required' || $param['re'])<span class="text-danger">*</span>@endif</label>
                                                <input type="text"  class="form-control"  id="{{$param['name']}}" name="{{$param['name']}}" placeholder=" " value="{{$value !== null ? $value : (old($param['name']) !== null ? old($param['name']) : 0)}}" >
                                                <span class="form-text text-danger">{{$errors->first($param['name'])}}</span>
                                                @endif

                                                @if($param['type'] == 'n')
                                                <label for="{{$param['name']}}" class="form-label"> {{$param['display_name']}}@if($param['validation'] == 'required')<span class="text-danger">*</span>@endif</label>
                                                <input type="text"  class="form-control" id="{{$param['name']}}" name="{{$param['name']}}" placeholder=" " value="{{$value !== null ? $value : (old($param['name']) !== null ? old($param['name']) : 0)}}" @if($param['readonly']) readonly @endif>
                                                <span class="form-text text-danger">{{$errors->first($param['name'])}}</span>
                                                @endif
                                                @if($param['type'] == 'c')
                                                <input type="checkbox"  class="custom-control-input"  id="{{$param['name']}}" name="{{$param['name']}}" placeholder="" @if($value == 1 || old($param['name'])) checked @endif value="1">
                                                <label for="{{$param['name']}}" class="custom-control-label"> {{$param['display_name']}}@if($param['validation'] == 'required')<span class="text-danger">*</span>@endif</label>
                                                <span class="form-text text-danger">{{$errors->first($param['name'])}}</span>
                                                @endif
                                                @if($param['type'] == 'ta')
                                                <label for="{{$param['name']}}" class="form-label"> {{$param['display_name']}}@if($param['validation'] == 'required')<span class="text-danger">*</span>@endif</label>
                                                <textarea class="form-control" id="{{$param['name']}}" name="{{$param['name']}}">@if($value || old($param['name'])) {{$value}} @endif</textarea>
                                                <span class="form-text text-danger">{{$errors->first($param['name'])}}</span>
                                                @endif
                                                @if($param['type'] == 'd')
                                                <label for="{{$param['name']}}" class="custom-control-label"> {{$param['display_name']}}@if($param['validation'] == 'required')<span class="text-danger">*</span>@endif</label>
                                                <select class="form-control creditDropdown" id="{{$param['name']}}" name="{{$param['name']}}" data-links='@json($param['links'] ?? [])'>
                                                    @php
                                                        $options = explode(',',$param['options']);
                                                    @endphp
                                                    <option value="">Select {{$param['display_name']}} </option>
                                                    @foreach($options as $key => $option)
                                                            @if($rating_type[0] == 5)
                                                                @if($certficateDeatils->topology_type == 2 && $key != 1)
                                                                <option value="{{$option}}" @if($value == $option || old($param['name']) == $option) selected @endif> {{$option}}</option>
                                                                @else
                                                                <option value="{{$option}}" @if($value == $option || old($param['name']) == $option) selected @endif> {{$option}}</option>
                                                                @endif
                                                            @else
                                                                <option value="{{$option}}" @if($value == $option || old($param['name']) == $option) selected @endif> {{$option}}</option>
                                                            @endif
                                                    @endforeach
                                                </select>
                                                    <div id="{{$param['name']}}_links" class="mt-2"></div>
                                                <span class="form-text text-danger">{{$errors->first($param['name'])}}</span>
                                                @endif
                                            </div>
                                        </div>
                                    @endforeach
                                    <div class="col-12">
                                        <button type="submit" id='savebutton' class="btn btn-primary btn-next pull-right" style=" background: aliceblue !important; color: #467db5 !important; right: -85%;margin: 10px;">
                                            <span class="align-right d-sm-inline-block d-none">Save</span>
                                            <i data-feather="arrow-right" class="align-right ml-sm-25 ml-0"></i>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        @else
                        @endif           
                                <!--Other Documents Start-->
                        @if(isset($params) && $subtabs != null)
                            <form id="rating_form" class="mt-2" method="POST" action="@if(count($rating) > 0){{route('updaterating')}}@else{{route('saverating')}} @endif" enctype="multipart/form-data" >
                                @csrf
                                <input type="hidden"  name="table" value="{{$action}}">
                                <input type="hidden"  name="tab" value="{{$activeSubmenu}}" >
                                <input type="hidden"  name="subtab"  value="{{$activeMenu}}">
                                <input type="hidden"  name="version"  value="{{$version}}">
                                <input type="hidden"  name="project_id"  value="{{$projectdetails->id}}">
                                <input type="hidden"  name="decodeid"  value="{{$projectdetails->projectid}}">
                                <input type="hidden"  name="rating_type"  value="{{$projectdetails->rating_type}}">

                                @if($activeMenu == 'alternative_water_performance')
                                    <div class="row">
                                        <div class="col-6"> 
                                            <table class="table table-bordered" style=" margin-bottom: 23px;">
                                                <thead>
                                                    <tr><th colspan="2"> <p>Alternate Water</p></th></tr>                                        
                                                </thead>
                                                {{-- <tbody>

                                                    <tr>
                                                        <th>Qty of Captured rainwater: </th>
                                                        @php
                                                        $value = __get_rating_data($projectdetails->id, $activeSubmenu, $activeMenu, 'captured_rainwater', $action, $projectdetails->rating_type);
                                                        @endphp
                                                        <td><input type="number" class="form-control alternate" step="0.01" id="captured_rainwater" name="captured_rainwater"  placeholder=" " value="{{isset($value)?$value:''}}"  @if($certficateDeatils->is_submitted == 1) readonly @endif></td>
                                                        
                                                    </tr>
                                                    <tr>
                                                        <th>Qty of Treated waste water: </th>
                                                        @php
                                                        $value = __get_rating_data($projectdetails->id, $activeSubmenu, $activeMenu, 'treated_waste_water', $action, $projectdetails->rating_type);
                                                        @endphp
                                                        <td><input type="number" class="form-control alternate" step="0.01"  id="treated_waste_water" name="treated_waste_water" placeholder=" " value="{{isset($value)?$value:''}}"  @if($certficateDeatils->is_submitted == 1) readonly @endif></td>
                                                        
                                                    </tr>
                                                    <tr>
                                                        <th>Qty of Condensate Water: </th>
                                                        @php
                                                        $value = __get_rating_data($projectdetails->id, $activeSubmenu, $activeMenu, 'condensed_water', $action, $projectdetails->rating_type);
                                                        @endphp
                                                    <td><input type="number" class="form-control alternate" step="0.01"  id="condensed_water" name="condensed_water" placeholder=" " value="{{isset($value)?$value:''}}"  @if($certficateDeatils->is_submitted == 1) readonly @endif></td>
                                                        
                                                    </tr>
                                                    <tr>
                                                        <th>Qty of purchased treated water: </th>
                                                        @php
                                                        $value = __get_rating_data($projectdetails->id, $activeSubmenu, $activeMenu, 'purchased_treated_water', $action, $projectdetails->rating_type);
                                                        @endphp
                                                        <td><input type="number" class="form-control alternate" step="0.01"  id="purchased_treated_water" name="purchased_treated_water" placeholder=" " value="{{isset($value)?$value:''}}"  @if($certficateDeatils->is_submitted == 1) readonly @endif></td>
                                                
                                                    </tr>
                                                    <tr>
                                                        <th>Qty of RO reject water:</th>
                                                        @php
                                                        $value = __get_rating_data($projectdetails->id, $activeSubmenu, $activeMenu, 'ro_water', $action, $projectdetails->rating_type);
                                                        @endphp
                                                        <td><input type="number" class="form-control alternate" step="0.01"  id="ro_water" name="ro_water" placeholder=" " value="{{isset($value)?$value:''}}"  @if($certficateDeatils->is_submitted == 1) readonly @endif></td>
                                                
                                                    </tr>
                                                    <tr>
                                                        <th>Qty of other alternate water: </th>
                                                        @php
                                                        $value = __get_rating_data($projectdetails->id, $activeSubmenu, $activeMenu, 'other_water', $action, $projectdetails->rating_type);
                                                        @endphp
                                                        <td><input type="number" class="form-control alternate" step="0.01"  id="other_water" name="other_water" placeholder=" " value="{{isset($value)?$value:''}}"  @if($certficateDeatils->is_submitted == 1) readonly @endif></td>
                                                    
                                                    </tr>
                                                    <tr>
                                                        <th>Total alternate water consumption</th>
                                                    @php
                                                    $value = __get_rating_data($projectdetails->id, $activeSubmenu, $activeMenu, 'total_alternate_water', $action, $projectdetails->rating_type);
                                                    @endphp
                                                    <td><input type="number" class="form-control" step="0.01"  id="total_alternate_water" name="total_alternate_water" placeholder=" " value="{{isset($value)?$value:''}}" readonly></td>
                                                
                                                    </tr>
                                                    <tr>
                                                        <th>% of alternate water usage</th>
                                                    @php
                                                    $value = __get_rating_data($projectdetails->id, $activeSubmenu, $activeMenu, 'alternative_water_usage', $action, $projectdetails->rating_type);
                                                    @endphp
                                                    <td><input type="number" class="form-control" step="0.01"  id="alternative_water_usage" name="alternative_water_usage" placeholder=" " value="{{isset($value)?$value:''}}" readonly></td>
                                                
                                                    </tr>
                                                </tbody> --}}
                                                <tbody>

                                                    <tr>
                                                        @if($projectdetails->rating_type == '3')
                                                            <th>Qty of used rainwater:​ </th>
                                                        @else   
                                                        <th>Qty of Captured rainwater: </th>
                                                        @endif
                                                        @php
                                                        $value = __get_rating_data($projectdetails->id, $activeSubmenu, $activeMenu, 'captured_rainwater', $action, $projectdetails->rating_type);
                                                        @endphp
                                                        <td><input type="number" class="form-control alternate" step="0.01" id="captured_rainwater" name="captured_rainwater"  placeholder=" " value="{{isset($value)?$value:''}}"  @if($certficateDeatils->is_submitted == 1) readonly @endif></td>
                                                        
                                                    </tr>
                                                    <tr>
                                                        @if($projectdetails->rating_type == '3')
                                                            <th>Qty of used treated waste water:​</th>
                                                        @else 
                                                        <th>Qty of Treated waste water: </th>
                                                        @endif
                                                        @php
                                                        $value = __get_rating_data($projectdetails->id, $activeSubmenu, $activeMenu, 'treated_waste_water', $action, $projectdetails->rating_type);
                                                        @endphp
                                                        <td><input type="number" class="form-control alternate" step="0.01"  id="treated_waste_water" name="treated_waste_water" placeholder=" " value="{{isset($value)?$value:''}}"  @if($certficateDeatils->is_submitted == 1) readonly @endif></td>
                                                        
                                                    </tr>
                                                    <tr>
                                                        @if($projectdetails->rating_type == '3')
                                                            <th>Qty of used condensate water:​​</th>
                                                        @else
                                                        <th>Qty of Condensate Water: </th>
                                                        @endif
                                                        @php
                                                        $value = __get_rating_data($projectdetails->id, $activeSubmenu, $activeMenu, 'condensed_water', $action, $projectdetails->rating_type);
                                                        @endphp
                                                    <td><input type="number" class="form-control alternate" step="0.01"  id="condensed_water" name="condensed_water" placeholder=" " value="{{isset($value)?$value:''}}"  @if($certficateDeatils->is_submitted == 1) readonly @endif></td>
                                                        
                                                    </tr>
                                                    @if($projectdetails->rating_type == '3')
                                                    @else
                                                    <tr>
                                                        <th>Qty of purchased treated water: </th>
                                                        @php
                                                        $value = __get_rating_data($projectdetails->id, $activeSubmenu, $activeMenu, 'purchased_treated_water', $action, $projectdetails->rating_type);
                                                        @endphp
                                                        <td><input type="number" class="form-control alternate" step="0.01"  id="purchased_treated_water" name="purchased_treated_water" placeholder=" " value="{{isset($value)?$value:''}}"  @if($certficateDeatils->is_submitted == 1) readonly @endif></td>
                                                
                                                    </tr>
                                                    @endif
                                                    <tr>
                                                        @if($projectdetails->rating_type == '3')
                                                            <th>Qty of used RO reject water:​</th>
                                                            @else
                                                        <th>Qty of RO reject water:</th>
                                                        @endif
                                                        @php
                                                        $value = __get_rating_data($projectdetails->id, $activeSubmenu, $activeMenu, 'ro_water', $action, $projectdetails->rating_type);
                                                        @endphp
                                                        <td><input type="number" class="form-control alternate" step="0.01"  id="ro_water" name="ro_water" placeholder=" " value="{{isset($value)?$value:''}}"  @if($certficateDeatils->is_submitted == 1) readonly @endif></td>
                                                
                                                    </tr>
                                                    <tr>
                                                        @if($projectdetails->rating_type == '3')
                                                            <th>Qty of used other alternate water:​</th>
                                                            @else
                                                        <th>Qty of other alternate water: </th>
                                                        @endif
                                                        @php
                                                        $value = __get_rating_data($projectdetails->id, $activeSubmenu, $activeMenu, 'other_water', $action, $projectdetails->rating_type);
                                                        @endphp
                                                        <td><input type="number" class="form-control alternate" step="0.01"  id="other_water" name="other_water" placeholder=" " value="{{isset($value)?$value:''}}"  @if($certficateDeatils->is_submitted == 1) readonly @endif></td>
                                                    
                                                    </tr>
                                                    <tr>
                                                        <th>Total alternate water consumption</th>
                                                    @php
                                                    $value = __get_rating_data($projectdetails->id, $activeSubmenu, $activeMenu, 'total_alternate_water', $action, $projectdetails->rating_type);
                                                    @endphp
                                                    <td><input type="number" class="form-control" step="0.01"  id="total_alternate_water" name="total_alternate_water" placeholder=" " value="{{isset($value)?$value:''}}" readonly></td>
                                                
                                                    </tr>
                                                    <tr>
                                                        <th>% of alternate water usage</th>
                                                    @php
                                                    $value = __get_rating_data($projectdetails->id, $activeSubmenu, $activeMenu, 'alternative_water_usage', $action, $projectdetails->rating_type);
                                                    @endphp
                                                    <td><input type="number" class="form-control" step="0.01"  id="alternative_water_usage" name="alternative_water_usage" placeholder=" " value="{{isset($value)?$value:''}}" readonly></td>
                                                
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                     @if($projectdetails->rating_type != '3')
                                        <div class="col-6">
                                            <table class="table table-bordered" style=" margin-bottom: 23px;">
                                                <thead>
                                                    <tr><th colspan="2"> <p>Reuse of alternate water:</p></th></tr>
                                                    
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <th>Qty of Alternative Water used for Landscaping</th>
                                                        @php
                                                        $value = __get_rating_data($projectdetails->id, $activeSubmenu, $activeMenu, 'landscape_alternate_water', $action, $projectdetails->rating_type);
                                                        @endphp    
                                                        <td><input type="number" class="form-control" step="0.01"  id="landscape_alternate_water" name="landscape_alternate_water" placeholder=" " value="{{isset($value)?$value:''}}"  @if($certficateDeatils->is_submitted == 1) readonly @endif></td>
                                                        
                                                    </tr>
                                                    <tr>
                                                        <th>Qty of Alternative Water used for flushing</th>
                                                        @php
                                                        $value = __get_rating_data($projectdetails->id, $activeSubmenu, $activeMenu, 'flushing_alternate_water', $action, $projectdetails->rating_type);
                                                        @endphp
                                                        <td><input type="number" class="form-control" step="0.01"  id="flushing_alternate_water" name="flushing_alternate_water" placeholder=" " value="{{isset($value)?$value:''}}"  @if($certficateDeatils->is_submitted == 1) readonly @endif></td>
                                                        
                                                    </tr>
                                                    <tr>
                                                        <th>Qty of Alternative Water used for domestic use</th>
                                                        @php
                                                        $value = __get_rating_data($projectdetails->id, $activeSubmenu, $activeMenu, 'domestic_alternate_water', $action, $projectdetails->rating_type);
                                                        @endphp
                                                        <td><input type="number" class="form-control" step="0.01"  id="domestic_alternate_water" name="domestic_alternate_water" placeholder=" " value="{{isset($value)?$value:''}}"  @if($certficateDeatils->is_submitted == 1) readonly @endif></td>
                                                        
                                                    </tr>
                                                    <tr>
                                                        <th>Qty of Alternative Water used for cooling tower makeup</th>
                                                        @php
                                                        $value = __get_rating_data($projectdetails->id, $activeSubmenu, $activeMenu, 'cooling_alternate_water', $action, $projectdetails->rating_type);
                                                        @endphp
                                                        <td><input type="number" class="form-control" step="0.01"  id="cooling_alternate_water" name="cooling_alternate_water" placeholder=" " value="{{isset($value)?$value:''}}"  @if($certficateDeatils->is_submitted == 1) readonly @endif></td>
                                                        
                                                    </tr>
                                                    <tr>
                                                        <th>Qty of Alternative Water used for others:</th>
                                                        @php
                                                        $value = __get_rating_data($projectdetails->id, $activeSubmenu, $activeMenu, 'other_alternate_water', $action, $projectdetails->rating_type);
                                                        @endphp
                                                        <td><input type="number" class="form-control" step="0.01"  id="other_alternate_water" name="other_alternate_water" placeholder=" " value="{{isset($value)?$value:''}}"  @if($certficateDeatils->is_submitted == 1) readonly @endif></td>
                                                        
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                      @endif  
                                    </div>
                                @endif
                                <div class="row">
                                    @foreach($params as $param)
                                        @if($param['type'] != 'u' && $param['type'] != 'hi')
                                            @if(($certficateDeatils->certificate_type == 1 && $param['pre-certificate']) || ($certficateDeatils->certificate_type == 2 && $param['certificate']) || ( $param['certificate'] && $param['pre-certificate']))
                                                <div id="div_{{$param['name']}}" @if(array_key_exists('tab', $param) && $param['tab']) style="margin-left: 40px;" @endif @if($param['type'] == 'n' || $param['type'] == 't' || $param['type'] == 'nt' || $param['type'] == 'd') class="col-md-6 custom-index" @else class="col-md-12 custom-index" @endif @if($param['number'] == 1) style="margin-right: 20px;"@endif>
                                                    @php
                                                    $value = __get_rating_data($projectdetails->id, $activeSubmenu, $activeMenu, $param['name'], $action, $projectdetails->rating_type);
                                                    @endphp
                                                    @if(array_key_exists('related_to', $param) && $param['related_to'])
                                                    
                                                        @php
                                                            $value = __get_rating_relation_data($projectdetails->id, $param['related_to'], $action, $projectdetails->rating_type);
                                                        @endphp
                                                       
                                                    @endif
                                                   
                                               
                                                    <div class="form-group" @if($param['type'] == 'r') style="display: flex;" @endif>
                                                        
                                                        @if($param['type'] == 't')
                                                            @php
                                                                if($param['name'] == 'occupany_type'){
                                                                    if($certficateDeatils->sub_rating_type == 1) $value = 'Owner Occupied';
                                                                    if($certficateDeatils->sub_rating_type == 2) $value = 'Tenant Occupied';
                                                                
                                                                }
                                                            @endphp
                                                             @if($param['name'] == 'percentage_area_meeting_acoustic' )
                                                                @php
                                                                $value = __get_rating_relation_data(
                                                                    $projectdetails->id,
                                                                    $param['related_to'] ?? null,
                                                                    'material_resources',
                                                                    $projectdetails->rating_type
                                                                );
                                                                $jsonData = json_decode($value);
                                                                if(is_array($jsonData)){
                                                                    $value = $jsonData[0];
                                                                }
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'mandatory_fresh_air_requirement')
                                                                @php
                                                                    $reuse_water_percent = __get_rating_data(
                                                                        $projectdetails->id,
                                                                        "energy_efficency",
                                                                        "annex_natural_venilation",
                                                                        "fresh_air_meet_space",
                                                                        "material_resources",
                                                                        $projectdetails->rating_type
                                                                    );
 
                                                                    $decoded = json_decode($reuse_water_percent, true);
                                                                    $value = is_array($decoded) ? ($decoded[0] ?? null) : null;
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'mandatoryechanced_fresh_air')
                                                                @php
                                                                    $reuse_water_percent = __get_rating_data(
                                                                        $projectdetails->id,
                                                                        "energy_efficency",
                                                                        "annex_natural_venilation",
                                                                        "fresh_air_meet_2_point",
                                                                        "material_resources",
                                                                        $projectdetails->rating_type
                                                                    );
 
                                                                    $decoded = json_decode($reuse_water_percent, true);
                                                                    $value = is_array($decoded) ? ($decoded[0] ?? null) : null;
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'applicability_nweb')
                                                                @php
                                                                    $landscape = __get_rating_relation_data($projectdetails->id,'landscape_details_total_area_landscape','sustainable_design', $projectdetails->rating_type);
                                                                    $landscapebuiltup = __get_rating_relation_data($projectdetails->id,'landscape_details_builtup','sustainable_design',$projectdetails->rating_type);
                                                                    $landscapevertical = __get_rating_relation_data($projectdetails->id,'landscape_details_area_vertical_landscape','sustainable_design',$projectdetails->rating_type);
                                                                    $totalarea = __get_rating_relation_data($projectdetails->id,'site_area','sustainable_design',$projectdetails->rating_type);
                                                                    // @dump($landscape, $landscapebuiltup, $landscapevertical, $totalarea);
                                                                    $landscape = is_numeric($landscape) ? (float)$landscape : 0;
                                                                    $landscapebuiltup = is_numeric($landscapebuiltup) ? (float)$landscapebuiltup : 0;
                                                                    $landscapevertical = is_numeric($landscapevertical) ? (float)$landscapevertical : 0;
                                                                    $totalarea = is_numeric($totalarea) ? (float)$totalarea : 0;
 
                                                                    $percentage = 0;
                                                                    if ($totalarea > 0) {
                                                                        $percentage = (($landscape + $landscapebuiltup + $landscapevertical) / $totalarea) * 100;
                                                                    }
                                                                    $value = $percentage > 10 ? 'Yes' : 'No';
                                                                @endphp
                                                            @endif
                                                            
                                                        <label for="{{$param['name']}}" class="form-label"> {{$param['display_name']}}@if($param['validation'] == 'required')<span class="text-danger">*</span>@endif</label>
                                                        <input type="text"  class="form-control"  id="{{$param['name']}}" name="{{$param['name']}}" placeholder=" " value="{{$value?$value:old($param['name'])}}"   @if($param['readonly'] ||  ($certficateDeatils->is_submitted == 1 && $isPending)) readonly @endif >
                                                        <span class="form-text text-danger">{{$errors->first($param['name'])}}</span>

                                                        @endif

                                                        @if($param['type'] == 'n')
                                                            @php
                                                                $unit = '';
                                                                // $value = $value !== null ? $value : (old($param['name']) !== null ? old($param['name']) : '');
                                                                // if(array_key_exists('calculation', $param) && $param['calculation'] && $value) {
                                                                //     $value = __calculations($param['name'],$rating_type[0]);
                                                                // }
                                                                
                                                                if($param['name'] == 'site_area' || (array_key_exists('related_to', $param) && $param['related_to'] == 'site_area')){
                                                                    $value = $certficateDeatils->site_area_insqm;
                                                                    $unit = '(sq.m)';
                                                                }
                                                                if($param['name'] == 'no_of_towers' || (array_key_exists('related_to', $param) && $param['related_to'] == 'no_of_towers')){
                                                                    $value = $certficateDeatils->no_of_buildings;
                                                                }
                                                            @endphp

                                                            @if(array_key_exists('related_to', $param) && $param['related_to'])
                                                                @php
                                                                    $value = __get_rating_relation_data($projectdetails->id, $param['related_to'], $action, $projectdetails->rating_type);
                                                                @endphp
                                                            @endif

                                                           

                                                            @if($param['name'] == 'capacity_on_site_renewable' || $param['name'] == 'capacity_on_site_renewable_on_site')
                                                                @php
                                                                    $value = __get_rating_relation_data($projectdetails->id, $param['related_to'], 'sustainable_design', $projectdetails->rating_type);
                                                                    $value = is_numeric($value) ? $value : 0;
                                                                @endphp
                                                            @endif

                                                            @if($param['name'] == 'circulation_percent' || $param['name'] == 'no_ecolablled_products' || $param['name'] == 'capacity_of_on_site_renewable_vk' || $param['name'] == "capacity_of_off_site_renewable"  || $param['name'] == 'percentage_area_meeting_acoustic' || $param['name'] == 'saving_percentage_space_method_lpd' || $param['name'] == 'saving_percentage_building_method_lpd' || $param['name'] == 'saving_percentage_building_method'|| $param['name'] == 'total_regularly_occupied_spaces_sensors' || $param['name'] == 'saving_percentage_building_method' ||  $param['name'] == 'area_percentage_credit'  || $param['name'] == 'status_gwp_credit_complince' || $param['name'] == 'percent_waste_diverted' || $param['name'] == 'fresh_air_mechanical_ventilation' || $param['name'] == 'percentage_fresh_air_supplied' || $param['name'] == 'percentage_regularly_area' || $param['name'] == 'mandatory_fresh_air_requirement' || $param['name'] == 'mandatoryechanced_fresh_air' || $param['name'] == 'daylight_measurement_report' || $param['name'] == 'percentage_regularly_occupied' || $param['name'] == 'saving_percentage_space_method'|| $param['name'] == "occupied_area_percentage" || $param['name'] == "capacity_percetage" || $param['name'] == "capacity_percetage_on_site")
                                                                @php
                                                                    $value = __get_rating_relation_data(
                                                                        $projectdetails->id,
                                                                        $param['related_to'] ?? null,
                                                                        'material_resources',
                                                                        $projectdetails->rating_type
                                                                    );
                                                                    $jsonData = json_decode($value);
                                                                    if(is_array($jsonData)){
                                                                        $value = $jsonData[0];
                                                                    }
                                                                @endphp
                                                            @endif


                                                            @if($param['name'] == 'recreational_facilities')
                                                                @php
                                                                    $value = __get_rating_relation_data(
                                                                        $projectdetails->id,
                                                                        $param['related_to'] ?? null,
                                                                        'material_resources',
                                                                        $projectdetails->rating_type
                                                                    );
                                                                                                                                        
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'toilets_abled')
                                                                @php
                                                                    $value = __get_rating_relation_data(
                                                                        $projectdetails->id,
                                                                        'no_of_dwellings_units',
                                                                        $action,
                                                                        $projectdetails->rating_type
                                                                    );
                                                                    $value = floatval($value)/250;
                                                                    if($value < 1){
                                                                        $value = 1;
                                                                    }
                                                                @endphp
                                                            @endif

                                                            @if($param['name'] == 'min_percen_comp' || $param['name'] == 'min_percen_comp_area')
                                                                @php
                                                                    $value = __get_rating_data(
                                                                        $projectdetails->id,
                                                                        'resident_health_wellbeing',
                                                                        'annex_rwh_one_one',
                                                                        $param['related_to'],
                                                                        'material_resources',
                                                                        $projectdetails->rating_type
                                                                    );
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'total_landscape')
                                                                @php
                                                                    $value = __get_rating_data(
                                                                        $projectdetails->id,
                                                                        'project_details',
                                                                        'landscape_details',
                                                                        $param['related_to'],
                                                                        'sustainable_design',
                                                                        $projectdetails->rating_type
                                                                    );
                                                                @endphp
                                                            @endif
                                                          
                                                            @if($param['name'] == 'capacity_rainwater_harvesting' || $param['name'] == 'peak_rainfall')
                                                                @php
                                                                    $value = floatval(__get_rating_data(
                                                                        $projectdetails->id,
                                                                        'water_conservation',
                                                                        'annex_wc_one',
                                                                        $param['related_to'],
                                                                        'water_conservation',
                                                                        $projectdetails->rating_type
                                                                    ));
                                                                @endphp
                                                            @endif


                                                             @if($param['name'] == 'percent_saving_consumption')
                                                                @php
                                                                        $waterconversation = __get_rating_relation_data($projectdetails->id, $param['related_to'] ?? null,'rating_data', $projectdetails->rating_type);
                                                                        $value = $waterconversation;
                                                                @endphp
                                                            @endif

                                                            

                                                            @if($param['name'] == 'capacity_pro_stp' || $param['name'] == 'proposed_rain_harvesting')
                                                                @php
                                                                    $value = __get_rating_data(
                                                                        $projectdetails->id,
                                                                        'project_details',
                                                                        'water_conservation_details',
                                                                        $param['related_to'],
                                                                        'sustainable_design',
                                                                        $projectdetails->rating_type
                                                                    );
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'proposed_total_annual')
                                                                @php
                                                                    $value = __get_rating_data(
                                                                        $projectdetails->id,
                                                                        'energy_efficency',
                                                                        'annex_lpd_calculation',
                                                                        'total_annual_consumption_lpds',
                                                                        'material_resources',
                                                                        $projectdetails->rating_type
                                                                    );
                                                                @endphp
                                                            @endif


                                                            @if($param['name'] == 'simulation_method_overall')
                                                                @php
                                                                    $value = __get_rating_data(
                                                                        $projectdetails->id,
                                                                        'energy_efficency',
                                                                        'simulaition_method_output',
                                                                        'overall_energy_savings_output',
                                                                        'material_resources',
                                                                        $projectdetails->rating_type
                                                                    );
                                                                @endphp
                                                            @endif
                                                            
                                                           
                                                             @if($param['name'] == 'percentage_energy_solor')
                                                                @php
                                                                     $on_site_eng = __get_rating_data($projectdetails->id,"energy_efficiency","existing_one_site_renewable","existing_total_renewable_wheeling","material_resources", $projectdetails->rating_type);
                                                                    $on_site_eng_build = __get_rating_data($projectdetails->id,"energy_efficiency","existing_one_site_renewable","existing_total_energy","material_resources", $projectdetails->rating_type);
                                                                  
                                                                    $on_site_eng = is_numeric($on_site_eng) ? (float)$on_site_eng : 0;
                                                                    $on_site_eng_build = is_numeric($on_site_eng_build) ? (float)$on_site_eng_build : 0;
                                                                    
                                                                    $sumofonsite = $on_site_eng + $on_site_eng_build;
                                                                    $percentagekl = 0;
                                                                    if ($on_site_eng_build > 0) {
                                                                        $percentagekl = 
                                                                            ($on_site_eng / $sumofonsite ) * 100;
                                                                    }
                                                                    $value = number_format((float)$percentagekl, 2, '.', '');
                                                                    // @dd($value);
                                                                @endphp
                                                            @endif
                                                             @if($param['name'] == 'annual_off_site')
                                                                @php
                                                                    $reuse_water_percent = __get_rating_data($projectdetails->id,"energy_efficiency","existing_one_site_renewable","existing_total_renewable_wheeling_offsite","material_resources", $projectdetails->rating_type);
                                                                    $value = json_decode($reuse_water_percent);
                                                                @endphp
                                                            @endif
                                                             @if($param['name'] == 'building_off_site')
                                                                @php
                                                                    $reuse_water_percent = __get_rating_data($projectdetails->id,"energy_efficiency","existing_one_site_renewable","existing_total_energy_offsite","material_resources", $projectdetails->rating_type);
                                                                    $value = json_decode($reuse_water_percent);
                                                                @endphp
                                                            @endif
                                                             @if($param['name'] == 'grid_off_set')
                                                                @php
                                                                    $existingtotal = __get_rating_data($projectdetails->id,"energy_efficiency","existing_one_site_renewable","existing_total_renewable_wheeling_off_set","material_resources", $projectdetails->rating_type);
                                                                    $value = json_decode($existingtotal);
                                                                @endphp
                                                            @endif
                                                             @if($param['name'] == 'gen_off_setsolar')
                                                                @php
                                                                    $existingtotalonsite = __get_rating_data($projectdetails->id,"energy_efficiency","existing_one_site_renewable","existing_total_on_site","material_resources", $projectdetails->rating_type);
                                                                    $value = json_decode($existingtotalonsite);
                                                                @endphp
                                                            @endif
                                                             @if($param['name'] == 'con_build_off_set')
                                                                @php
                                                                    $existingtotalonsite = __get_rating_data($projectdetails->id,"energy_efficiency","existing_one_site_renewable","existing_total_on_site","material_resources", $projectdetails->rating_type);
                                                                    $existingtotalset = __get_rating_data($projectdetails->id,"energy_efficiency","existing_one_site_renewable","existing_total_energy_off_set","material_resources", $projectdetails->rating_type);
                                                                    
                                                                    $existingtotalonsite = is_numeric($existingtotalonsite) ? (float)$existingtotalonsite : 0;
                                                                    $existingtotalset = is_numeric($existingtotalset) ? (float)$existingtotalset : 0;
                                                                    $sunofoffset = $existingtotalonsite + $existingtotalset;
                                                                    $value = json_decode($sunofoffset);
                                                                @endphp
                                                            @endif
                                                             @if($param['name'] == 'eng_catered_off_set')
                                                                @php
                                                                    $existingtotalonsite = __get_rating_data($projectdetails->id,"energy_efficiency","existing_one_site_renewable","existing_total_on_site","material_resources", $projectdetails->rating_type);
                                                                    $existingtotalset = __get_rating_data($projectdetails->id,"energy_efficiency","existing_one_site_renewable","existing_total_energy_off_set","material_resources", $projectdetails->rating_type);

                                                                    $existingtotalonsite = __get_rating_data($projectdetails->id,"energy_efficiency","existing_one_site_renewable","existing_total_on_site","material_resources", $projectdetails->rating_type);
                                                                    $existingtotal = __get_rating_data($projectdetails->id,"energy_efficiency","existing_one_site_renewable","existing_total_renewable_wheeling_off_set","material_resources", $projectdetails->rating_type);

                                                                    $existingtotalonsite = is_numeric($existingtotalonsite) ? (float)$existingtotalonsite : 0;
                                                                    $existingtotalset = is_numeric($existingtotalset) ? (float)$existingtotalset : 0;
                                                                    $existingtotal = is_numeric($existingtotal) ? (float)$existingtotal : 0;
                                                                    $existingtotalonsite = is_numeric($existingtotalonsite) ? (float)$existingtotalonsite : 0;

                                                                    $sumofoffset = $existingtotalonsite + $existingtotalset;
                                                                    $sumofoffsite = $existingtotal + $existingtotalonsite;
                                                                    $percentageoffsite = 0;
                                                                    if($sumofoffset > 0){
                                                                        $percentageoffsite = ($sumofoffsite / $sumofoffset) * 100;
                                                                        }
                                                                    // $value = json_decode($percentageoffsite);
                                                                    $value = number_format((float)$percentageoffsite, 2, '.', '');

                                                                @endphp
                                                            @endif

                                                            
                                                            @if($param['name'] == 'catered_off_site')
                                                                @php
                                                                    $off_site_eng = __get_rating_data($projectdetails->id,"energy_efficiency","existing_one_site_renewable","existing_total_renewable_wheeling_offsite","material_resources", $projectdetails->rating_type);
                                                                    $on_site_eng_build = __get_rating_data($projectdetails->id,"energy_efficiency","existing_one_site_renewable","existing_total_energy_offsite","material_resources",$projectdetails->rating_type);
                                                                   
                                                                    $off_site_eng = is_numeric($off_site_eng) ? (float)$off_site_eng : 0;
                                                                    $on_site_eng_build = is_numeric($on_site_eng_build) ? (float)$on_site_eng_build : 0;
                                                                    
                                                                    $percentagekl = 0;
                                                                    if ($on_site_eng_build > 0) {
                                                                        $percentagekl = 
                                                                            ($off_site_eng / $on_site_eng_build ) * 100;
                                                                    }
                                                                    $value = number_format((float)$percentagekl, 2, '.', '');
                                                                    // @dd($value);
                                                                @endphp
                                                            @endif
                                                            
                                                            @if($param['name'] == 'percent_of_treated_organic_waste')
                                                                @php
                                                                    $installedowccapacity = __get_rating_data(
                                                                        $projectdetails->id,
                                                                        'project_details',
                                                                        'material_resources_details',
                                                                        'installed_owc_capacity',
                                                                        'sustainable_design',
                                                                        $projectdetails->rating_type
                                                                    );
                                                                    $occupancygreen = __get_rating_data(
                                                                        $projectdetails->id,
                                                                        'project_details',
                                                                        'project_details',
                                                                        'occupancy_green',
                                                                        'sustainable_design',
                                                                        $projectdetails->rating_type
                                                                    );
                                                                    // @dd($occupancygreen);
                                                                    $installedowccapacity = floatval(str_replace(',', '', $installedowccapacity));
                                                                    $occupancygreen = floatval(str_replace(',', '', $occupancygreen));
                                                                    // $value = ($installedowccapacity / (0.25 * $occupancygreen)) * 100;
                                                                    $value = number_format(($installedowccapacity / (0.25 * $occupancygreen)) * 100, 2, '.', '');

                                                                    // @dd($value);
                                                                @endphp
                                                            @endif
                                                           @if($param['name'] == 'total_carpet_area_sf' || $param['name'] == 'regularly_occupied_area' || $param['name'] == 'area_of_ac' || $param['name'] == 'area_of_nonac' || $param['name'] == 'non_regularly_occupied_spaces')
                                                                @php
                                                                    $value = __get_rating_data(
                                                                        $projectdetails->id,
                                                                        'sustainable_design',
                                                                        'area_space_circulation',
                                                                        $param['related_to'],
                                                                        'material_resources',
                                                                        $projectdetails->rating_type
                                                                    );
                                                                    if(is_numeric($value)){
                                                                        @
                                                                        $value = $value;
                                                                    }else{
                                                                        $jsonData = json_decode($value);
                                                                        if(is_array($jsonData)){
                                                                            $value = $jsonData[0];
                                                                        }
                                                                    }
                                                                @endphp
                                                           @endif
                                                           @if($param['name'] == 'occupancy_interior' )
                                                                @php
                                                                    $value = __get_rating_data(
                                                                        $projectdetails->id,
                                                                        'indoor_enviornment_quality',
                                                                        'annexure_ac_fresh_air',
                                                                        $param['related_to'],
                                                                        'material_resources',
                                                                        $projectdetails->rating_type
                                                                    );
                                                                    if(is_numeric($value)){
                                                                        
                                                                        $value = $value;
                                                                    }else{
                                                                        $jsonData = json_decode($value);
                                                                        if(is_array($jsonData)){
                                                                            $value = $jsonData[0];
                                                                        }
                                                                    }
                                                                @endphp
                                                           @endif
                                                            @if($param['name'] == 'required_number_of_plants' && (array_key_exists('related_to', $param)))
                                                                @php
                                                                    $value = __get_rating_data(
                                                                        $projectdetails->id,
                                                                        'sustainable_design',
                                                                        'area_space_circulation',
                                                                        $param['related_to'],
                                                                        'material_resources',
                                                                        $projectdetails->rating_type
                                                                    );
                                                                    $value = is_numeric($value) ? ceil($value / 100) : 0;
                                                                @endphp
                                                            @endif

                                                            @if($param['name'] == 'pecentage_of_local_material_emboided')
                                                                @php
                                                                    $reuse_water_percent = __get_rating_data($projectdetails->id,"material_resources","annexure_master_material","local_percent","material_resources", $projectdetails->rating_type);
                                                                    $value = json_decode($reuse_water_percent);
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'pecentage_of_recycled_content_emboided')
                                                                @php
                                                                    $reuse_water_percent = __get_rating_data($projectdetails->id,"material_resources","annexure_master_material","recycled_percent","material_resources", $projectdetails->rating_type);
                                                                    $value = json_decode($reuse_water_percent);
                                                                @endphp
                                                            @endif

                                                            @if($param['name'] == 'water_peak_rainfall_saving')
                                                                @php
                                                                    $reuse_water_percent = __get_rating_data($projectdetails->id,"water_conservation","annex_wc_one","avg_rainfall","water_conservation", $projectdetails->rating_type);
                                                                    $value = json_decode($reuse_water_percent);
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'water_consumptin_saving')
                                                                @php
                                                                    $reuse_water_percent = __get_rating_data($projectdetails->id,"water_conservation","annex_wc_two","saving_percentage","water_conservation", $projectdetails->rating_type);
                                                                    $value = json_decode($reuse_water_percent);
                                                                @endphp
                                                            @endif
                                                            
                                                            @if($param['name'] == 'alternative_narrative')
                                                                @php
                                                                    $alternativenarrative = __get_rating_data($projectdetails->id,"water_conservation","alternative_performance","total_water_ratio","material_resources", $projectdetails->rating_type);
                                                                    $value = json_decode($alternativenarrative);
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'percentage_fresh_air_supplied')
                                                                @php
                                                                    $reuse_water_percent = __get_rating_data($projectdetails->id,"indoor_enviornment_quality","annexure_ac_fresh_air","total_meets_supplied_air","material_resources", $projectdetails->rating_type);
                                                                    $value = json_decode($reuse_water_percent);
                                                                @endphp
                                                            @endif
                                                            {{-- newbuilding relations calculations --}}
                                                            @if($param['name'] == 'capacity_on_site_renewable' || $param['name'] == 'capacity_on_site_renewable_on_site' || $param['name'] == 'total_site_area_ex'|| $param['name'] == "area_retained_topography" || $param['name'] == 'land_struc_built' || $param['name'] == 'vertical_area_total' || $param['name'] == 'tol_area_grd' || $param['name'] == 'total_site_land' ||  $param['name'] == 'cfm_required_space'|| $param['name'] == 'using_service_eco' || $param['name'] == "cfm_provided_space" || $param['name'] == 'dry_water_gene' || $param['name'] == 'data_year_before_previous_year' || $param['name'] == 'total_permanents' || $param['name'] == 'total_permanen_ecos' || $param['name'] == "area_adaptive_grd" || $param['name'] == "area_adaptive_built"  || $param['name'] == "area_adaptive_vertical" || $param['name'] == "area_adaptive_land_grd" || $param['name'] == "area_adaptive_built_stru" || $param['name'] == "area_adaptive_verti_land" || $param['name'] == "total_annual_energy_green_power" || $param['name'] == "annual_generation_green_power" )
                                                                @php
                                                                    $value = __get_rating_relation_data($projectdetails->id, $param['related_to'], 'sustainable_design', $projectdetails->rating_type);
                                                                    $value = is_numeric($value) ? $value : 0;
                                                                @endphp
                                                            @endif
                                                            {{-- @if($param['name'] == 'capacity_rainwater_harve' || $param['name'] == 'water_goes_grd' || $param['nane'] == 'storage_for_reuse'  )
                                                                @php
                                                                    $value = __get_rating_relation_data($projectdetails->id, $param['related_to'], 'sustainable_design', $projectdetails->rating_type);
                                                                    $value = is_numeric($value) ? $value : 0;
                                                                @endphp
                                                            @endif --}}
                                                            @if($param['name'] == 'percentage_reduction')
                                                                @php
                                                                    $lastYear = __get_rating_relation_data($projectdetails->id,'dry_waste','sustainable_design', $projectdetails->rating_type);

                                                                    $beforePrevYear = __get_rating_relation_data($projectdetails->id,'total_dry_waste','sustainable_design',$projectdetails->rating_type);

                                                                    $lastYear = is_numeric($lastYear) ? (float)$lastYear : 0;
                                                                    $beforePrevYear = is_numeric($beforePrevYear) ? (float)$beforePrevYear : 0;
                                                                    $percentageReduction = 0;
                                                                    if ($beforePrevYear > 0) {
                                                                        $percentageReduction = (
                                                                            ($beforePrevYear - $lastYear) / $beforePrevYear ) * 100;
                                                                    }
                                                                    $value = number_format((float)$percentageReduction, 2, '.', '');
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'occupants_public_transport')
                                                                @php
                                                                    $occupancy = __get_rating_relation_data($projectdetails->id,'occupancy','sustainable_design', $projectdetails->rating_type);

                                                                    $eco_friendly_commute = __get_rating_relation_data($projectdetails->id,'eco_friendly_commute','sustainable_design',$projectdetails->rating_type);

                                                                    $occupancy = is_numeric($occupancy) ? (float)$occupancy : 0;
                                                                    $eco_friendly_commute = is_numeric($eco_friendly_commute) ? (float)$eco_friendly_commute : 0;
                                                                    $percentaoccupancy = 0;
                                                                    if ($eco_friendly_commute > 0) {
                                                                        $percentaoccupancy = (($eco_friendly_commute / $occupancy) * 100);
                                                                    }
                                                                    $value = number_format((float)$percentaoccupancy, 2, '.', '');
                                                                @endphp
                                                            @endif

                                                            {{-- fb --}}
                                                             @if($param['name'] == 'project_turf_factory')
                                                                @php
                                                                     $fbtrufarea = __get_rating_data($projectdetails->id,"project_details","landscape_details","fb_truf_area","sustainable_design", $projectdetails->rating_type);
                                                                     $fboverstr = __get_rating_data($projectdetails->id,"project_details","landscape_details","fb_over_str","sustainable_design", $projectdetails->rating_type);
                                                                     $landscapeareafb = __get_rating_data($projectdetails->id,"project_details","landscape_details","landscape_area_fb","sustainable_design", $projectdetails->rating_type);
                                                                     $fbareabuildup = __get_rating_data($projectdetails->id,"project_details","landscape_details","fb_area_buildup","sustainable_design", $projectdetails->rating_type);
                                                                  
                                                                    $fbtrufarea = is_numeric($fbtrufarea) ? (float)$fbtrufarea : 0;
                                                                    $fboverstr = is_numeric($fboverstr) ? (float)$fboverstr : 0;
                                                                    $landscapeareafb = is_numeric($landscapeareafb) ? (float)$landscapeareafb : 0;
                                                                    $fbareabuildup = is_numeric($fbareabuildup) ? (float)$fbareabuildup : 0;
                                                                    
                                                                    $sumofbe = $fbtrufarea + $fboverstr;
                                                                    $sumofad = $landscapeareafb + $fbareabuildup;
                                                                    $percentagefb = 0;
                                                                    if ($sumofad > 0) {
                                                                        $percentagekl = 
                                                                            ($sumofbe / $sumofad ) * 100;
                                                                    }
                                                                    $value = number_format((float)$percentagekl, 2, '.', '');
                                                                    // @dd($value);
                                                                @endphp
                                                            @endif
                                                             @if($param['name'] == 'project_drought_factory')
                                                                @php
                                                                     $fbadaptiveland = __get_rating_data($projectdetails->id,"project_details","landscape_details","fb_adaptive_land","sustainable_design", $projectdetails->rating_type);
                                                                     $fbadastru = __get_rating_data($projectdetails->id,"project_details","landscape_details","fb_ada_stru","sustainable_design", $projectdetails->rating_type);
                                                                     $landscapeareafb = __get_rating_data($projectdetails->id,"project_details","landscape_details","landscape_area_fb","sustainable_design", $projectdetails->rating_type);
                                                                     $fbareabuildup = __get_rating_data($projectdetails->id,"project_details","landscape_details","fb_area_buildup","sustainable_design", $projectdetails->rating_type);
                                                                  
                                                                    $fbadaptiveland = is_numeric($fbadaptiveland) ? (float)$fbadaptiveland : 0;
                                                                    $fbadastru = is_numeric($fbadastru) ? (float)$fbadastru : 0;
                                                                    $landscapeareafb = is_numeric($landscapeareafb) ? (float)$landscapeareafb : 0;
                                                                    $fbareabuildup = is_numeric($fbareabuildup) ? (float)$fbareabuildup : 0;
                                                                    
                                                                    $sumofbe = $fbadaptiveland + $fbadastru;
                                                                    $sumofad = $landscapeareafb + $fbareabuildup;
                                                                    $percentagefb = 0;
                                                                    if ($sumofad > 0) {
                                                                        $percentagekl = 
                                                                            ($sumofbe / $sumofad ) * 100;
                                                                    }
                                                                    $value = number_format((float)$percentagekl, 2, '.', '');
                                                                    // @dd($value);
                                                                @endphp
                                                            @endif
                                                            

                                                            @if($param['name'] == 'occupants_shutter_eco')
                                                                @php
                                                                    $occupancy = __get_rating_relation_data($projectdetails->id,'occupancy','sustainable_design', $projectdetails->rating_type);

                                                                    $total_perm_shutter = __get_rating_relation_data($projectdetails->id,'total_perm_shutter','sustainable_design',$projectdetails->rating_type);

                                                                    $occupancy = is_numeric($occupancy) ? (float)$occupancy : 0;
                                                                    $total_perm_shutter = is_numeric($total_perm_shutter) ? (float)$total_perm_shutter : 0;
                                                                    $percentashetter = 0;
                                                                    if ($total_perm_shutter > 0) {
                                                                        $percentashetter =  ($total_perm_shutter / $occupancy ) * 100;
                                                                    }
                                                                    $value = number_format((float)$percentashetter, 2, '.', '');
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'low_emmiting_vehicles_ex')
                                                                    @php
                                                                        $twoparkingpercents = __get_rating_relation_data($projectdetails->id,'projects_details_ev_twowheel','sustainable_design', $projectdetails->rating_type);
                                                                        $fourparkingpercents = __get_rating_relation_data($projectdetails->id,'projects_details_ev_fourwheel','sustainable_design',$projectdetails->rating_type);
                                                                       
                                                                        $twowheels = __get_rating_relation_data($projectdetails->id,'projects_details_four_wheel','sustainable_design',$projectdetails->rating_type);
                                                                        $fourwheels = __get_rating_relation_data($projectdetails->id,'projects_details_two_wheel','sustainable_design',$projectdetails->rating_type);

                                                                        $twowheels = is_numeric($twowheels) ? (float)$twowheels : 0;
                                                                        $fourwheels = is_numeric($fourwheels) ? (float)$fourwheels : 0;

                                                                        $twoparkingpercents = is_numeric($twoparkingpercents) ? (float)$twoparkingpercents : 0;
                                                                        $fourparkingpercents = is_numeric($fourparkingpercents) ? (float)$fourparkingpercents : 0;

                                                                        $sumoftwoparkingpercents = $twoparkingpercents + $fourparkingpercents;
                                                                        $sumofparking = $twowheels + $fourwheels;
                                                                        $percentage4wheel = 0;

                                                                        if ($sumofparking > 0) {
                                                                            $percentage4wheel =  ($sumoftwoparkingpercents / $sumofparking ) * 100;
                                                                            }
                                                                      
                                                                          $value = number_format((float)$percentage4wheel, 2, '.', '');
                                                                    @endphp
                                                            @endif
                                                            @if($param['name'] == 'meeting_mandatory_require')
                                                                @php
                                                                    $rainwater_harvesting_capacity = __get_rating_relation_data($projectdetails->id,'rainwater_harvesting_capacity','sustainable_design', $projectdetails->rating_type);

                                                                    $har_required = __get_rating_relation_data($projectdetails->id,'har_required','sustainable_design',$projectdetails->rating_type);

                                                                    $rainwater_harvesting_capacity = is_numeric($rainwater_harvesting_capacity) ? (float)$rainwater_harvesting_capacity : 0;
                                                                    $har_required = is_numeric($har_required) ? (float)$har_required : 0;
                                                                    $percentagerain = 0;
                                                                    if ($har_required > 0) {
                                                                        $percentagerain = 
                                                                            ($har_required / $rainwater_harvesting_capacity ) * 100;
                                                                    }
                                                                    $value = number_format((float)$percentagerain, 2, '.', '');
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'percent_waste_water')
                                                                @php
                                                                    $waste_water_day = __get_rating_relation_data($projectdetails->id,'waste_water_day','sustainable_design', $projectdetails->rating_type);

                                                                    $capacity_kl = __get_rating_relation_data($projectdetails->id,'capacity_kl','sustainable_design',$projectdetails->rating_type);
                                                                    $waste_water_day = is_numeric($waste_water_day) ? (float)$waste_water_day : 0;
                                                                    $capacity_kl = is_numeric($capacity_kl) ? (float)$capacity_kl : 0;
                                                                    $percentagekl = 0;
                                                                    if ($capacity_kl > 0) {
                                                                        $percentagekl = 
                                                                            ($waste_water_day / $capacity_kl ) * 100;
                                                                    }
                                                                    $value = number_format((float)$percentagekl, 2, '.', '');
                                                                    // @dd($value);
                                                                @endphp
                                                            @endif
                                                            
                                                            @if($param['name'] == 'four_parking_percents')
                                                                @php
                                                                    $projects_details_four_wheel = __get_rating_relation_data($projectdetails->id,'projects_details_four_wheel','sustainable_design', $projectdetails->rating_type);

                                                                    $projects_details_ev_fourwheel = __get_rating_relation_data($projectdetails->id,'projects_details_ev_fourwheel','sustainable_design',$projectdetails->rating_type);

                                                                    $projects_details_four_wheel = is_numeric($projects_details_four_wheel) ? (float)$projects_details_four_wheel : 0;
                                                                    $projects_details_ev_fourwheel = is_numeric($projects_details_ev_fourwheel) ? (float)$projects_details_ev_fourwheel : 0;
                                                                    $percentage4wheel = 0;
                                                                    if ($projects_details_ev_fourwheel > 0) {
                                                                        $percentage4wheel = 
                                                                            ($projects_details_ev_fourwheel / $projects_details_four_wheel ) * 100;
                                                                    }
                                                                    $value = number_format((float)$percentage4wheel, 2, '.', '');
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'two_parking_percents')
                                                                @php
                                                                    $projects_details_four_wheel = __get_rating_relation_data($projectdetails->id,'projects_details_two_wheel','sustainable_design', $projectdetails->rating_type);

                                                                    $projects_details_ev_fourwheel = __get_rating_relation_data($projectdetails->id,'projects_details_ev_twowheel','sustainable_design',$projectdetails->rating_type);

                                                                    $projects_details_four_wheel = is_numeric($projects_details_four_wheel) ? (float)$projects_details_four_wheel : 0;
                                                                    $projects_details_ev_fourwheel = is_numeric($projects_details_ev_fourwheel) ? (float)$projects_details_ev_fourwheel : 0;
                                                                    $percentage4wheel = 0;
                                                                    if (isset($projects_details_ev_fourwheel) && $projects_details_ev_fourwheel > 0) {
                                                                        $percentage4wheel = 
                                                                            ($projects_details_ev_fourwheel / $projects_details_four_wheel ) * 100;
                                                                    }
                                                                    $value = number_format((float)$percentage4wheel, 2, '.', '');
                                                                @endphp
                                                            @endif
                                                            
                                                            @if($param['name'] == 'casea_adaptive')
                                                                @php
                                                                    $landscapecasea = __get_rating_relation_data($projectdetails->id,'landscape_details_adaptive_tolerant','sustainable_design', $projectdetails->rating_type);

                                                                    $landscapeturf = __get_rating_relation_data($projectdetails->id,'landscape_details_adaptive_turf','sustainable_design',$projectdetails->rating_type);

                                                                    $landscapecasea = is_numeric($landscapecasea) ? (float)$landscapecasea : 0;
                                                                    $landscapeturf = is_numeric($landscapeturf) ? (float)$landscapeturf : 0;
                                                                    $percentagesum = 0;
                                                                    $percentagesum = $landscapecasea + $landscapeturf;
                                                                    $value = number_format((float)$percentagesum, 2, '.', '');
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'caseb_natural_topography_nb')
                                                                @php
                                                                    $landscapecasea = __get_rating_relation_data($projectdetails->id,'landscape_details_adaptive_tolerant','sustainable_design', $projectdetails->rating_type);
                                                                    $landscapeturf = __get_rating_relation_data($projectdetails->id,'landscape_details_adaptive_turf','sustainable_design',$projectdetails->rating_type);
                                                                    $casea_total_site_area_nb = __get_rating_relation_data($projectdetails->id,'site_area','sustainable_design',$projectdetails->rating_type);
                                                                   
                                                                    $landscapecasea = is_numeric($landscapecasea) ? (float)$landscapecasea : 0;
                                                                    $landscapeturf = is_numeric($landscapeturf) ? (float)$landscapeturf : 0;
                                                                    $casea_total_site_area_nb = is_numeric($casea_total_site_area_nb) ? (float)$casea_total_site_area_nb : 0;
                                                                    
                                                                    $percentagesum = 0;
                                                                    $percentage4wheel = 0;

                                                                    $percentagesum = $landscapecasea + $landscapeturf;
                                                                    if ($casea_total_site_area_nb > 0) {
                                                                        $percentage4wheel = 
                                                                            ($percentagesum / $casea_total_site_area_nb  ) * 100;
                                                                    }
                                                                    $value = number_format((float)$percentage4wheel, 2, '.', '');
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'case_adaptive_on_ground')
                                                                @php
                                                                    $landscapecase = __get_rating_relation_data($projectdetails->id,'landscape_details_adaptive_tolerant','sustainable_design', $projectdetails->rating_type);

                                                                    $landscapebuiltupcase = __get_rating_relation_data($projectdetails->id,'landscape_details_adaptive_turf','sustainable_design',$projectdetails->rating_type);
                                                                    
                                                                    $landscapevertbuiltup = __get_rating_relation_data($projectdetails->id,'landscape_details_adaptive_tolerant_builtup','sustainable_design',$projectdetails->rating_type);
                                                                    $landscapecasebuiltup = __get_rating_relation_data($projectdetails->id,'landscape_details_turf_adaptive_tolerant_builtup','sustainable_design',$projectdetails->rating_type);
                                                                    $landscapeareavertlandscape = __get_rating_relation_data($projectdetails->id,'landscape_details_area_vrticl_adptv_tolrant_landscape','sustainable_design',$projectdetails->rating_type);

                                                                    $landscapecase = is_numeric($landscapecase) ? (float)$landscapecase : 0;
                                                                    $landscapebuiltupcase = is_numeric($landscapebuiltupcase) ? (float)$landscapebuiltupcase : 0;
                                                                    $percentagesum = 0;
                                                                    $percentagesum = $landscapecase + $landscapebuiltupcase + $landscapevertbuiltup + $landscapecasebuiltup + $landscapeareavertlandscape;
                                                                    $value = number_format((float)$percentagesum, 2, '.', '');
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'caseb_natural_topography_nb_2')
                                                                @php
                                                                    $casea_adaptive = __get_rating_relation_data($projectdetails->id,'case_adaptive_on_ground','sustainable_design', $projectdetails->rating_type);

                                                                    $casea_total_site_area_nb = __get_rating_relation_data($projectdetails->id,'site_area','sustainable_design',$projectdetails->rating_type);
                                                                    // @dump($casea_total_site_area_nb, $casea_adaptive);

                                                                    $casea_adaptive = is_numeric($casea_adaptive) ? (float)$casea_adaptive : 0;
                                                                    $casea_total_site_area_nb = is_numeric($casea_total_site_area_nb) ? (float)$casea_total_site_area_nb : 0;
                                                                    $percentage4wheel = 0;
                                                                    if ($casea_total_site_area_nb > 0) {
                                                                        $percentage4wheel = 
                                                                            ( $casea_adaptive / $casea_total_site_area_nb  ) * 100;
                                                                    }
                                                                    $value = number_format((float)$percentage4wheel, 2, '.', '');
                                                                @endphp
                                                            @endif

                                                            @if($param['name'] == 'trees_per_acre')
                                                                @php
                                                                    $adaptive = __get_rating_relation_data($projectdetails->id,'natural_topography_no_of_existing_trees','sustainable_design', $projectdetails->rating_type);
                                                                    $existing = __get_rating_relation_data($projectdetails->id,'natural_topography_area_no_new_adaptive_tolerant_tere','sustainable_design', $projectdetails->rating_type);

                                                                    $casea_total_site_area_nb = __get_rating_relation_data($projectdetails->id,'site_area','sustainable_design',$projectdetails->rating_type);
                                                                    $adaptive = is_numeric($adaptive) ? (float)$adaptive : 0;
                                                                    $existing = is_numeric($existing) ? (float)$existing : 0;
                                                                    $sumofadex = 0;  
                                                                    $sumofadex = $adaptive + $existing; 
                                                                    $casea_total_site_area_nb = is_numeric($casea_total_site_area_nb) ? (float)$casea_total_site_area_nb : 0;
                                                                    $percentage4wheel = 0;
                                                                    if ($casea_total_site_area_nb > 0) {
                                                                        $percentage4wheel = 
                                                                            ($sumofadex / $casea_total_site_area_nb ) * 100;
                                                                    }
                                                                    $value = number_format((float)$percentage4wheel, 2, '.', '');
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'area_tolerant_roof')
                                                                @php
                                                                    $landscapearea = __get_rating_relation_data($projectdetails->id,'landscape_details_adaptive_tolerant_builtup','sustainable_design', $projectdetails->rating_type);

                                                                    $landscapebuiltarea = __get_rating_relation_data($projectdetails->id,'landscape_details_turf_adaptive_tolerant_builtup','sustainable_design',$projectdetails->rating_type);

                                                                    $landscapearea = is_numeric($landscapearea) ? (float)$landscapearea : 0;
                                                                    $landscapebuiltarea = is_numeric($landscapebuiltarea) ? (float)$landscapebuiltarea : 0;
                                                                    $percentagesum = 0;
                                                                    $percentagesum = $landscapearea + $landscapebuiltarea;
                                                                    $value = number_format((float)$percentagesum, 2, '.', '');
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'parking_non_roof')
                                                                @php
                                                                    $projects_details_four_wheel = __get_rating_relation_data($projectdetails->id,'projects_details_four_wheel','sustainable_design', $projectdetails->rating_type);

                                                                    $projects_details_two_wheel = __get_rating_relation_data($projectdetails->id,'projects_details_two_wheel','sustainable_design',$projectdetails->rating_type);

                                                                    $projects_details_four_wheel = is_numeric($projects_details_four_wheel) ? (float)$projects_details_four_wheel : 0;
                                                                    $projects_details_two_wheel = is_numeric($projects_details_two_wheel) ? (float)$projects_details_two_wheel : 0;
                                                                    $percentagesum = 0;
                                                                    $percentagesum = $projects_details_four_wheel + $projects_details_two_wheel;
                                                                    $value = number_format((float)$percentagesum, 2, '.', '');
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'percent_waste_water')
                                                                @php
                                                                    $treated_water_percent = __get_rating_data($projectdetails->id,"water_conservation","annex_wc_four","treated_water_percent","water_conservation", $projectdetails->rating_type);
                                                                    $value = json_decode($treated_water_percent);
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'percent_reuse_water')
                                                                @php
                                                                    $reuse_water_percent = __get_rating_data($projectdetails->id,"water_conservation","annex_wc_four","reuse_water_percent","water_conservation", $projectdetails->rating_type);
                                                                    $value = json_decode($reuse_water_percent);
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'oneday_cal')
                                                                @php
                                                                    $reuse_water_percent = __get_rating_data($projectdetails->id,"water_conservation","annex_wc_one","harvesting","water_conservation", $projectdetails->rating_type);
                                                                    $value = json_decode($reuse_water_percent);
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'runoff_cal')
                                                                @php
                                                                    $reuse_water_percent = __get_rating_data($projectdetails->id,"water_conservation","annex_wc_one","avg_rainfall","water_conservation", $projectdetails->rating_type);
                                                                    $value = json_decode($reuse_water_percent);
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'annex_handel')
                                                                @php
                                                                    $reuse_water_percent = __get_rating_data($projectdetails->id,"material_resources","annexure_waste_management","percentage_waste_diverted_landfill","material_resources", $projectdetails->rating_type);
                                                                    $value = json_decode($reuse_water_percent);
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'vrp_calculations_single')
                                                                @php
                                                                    $reuse_water_percent = __get_rating_data($projectdetails->id,"indoor_enviornment_quality","single_zone_system","outdoor_air_intake_flow","material_resources", $projectdetails->rating_type);
                                                                    $value = json_decode($reuse_water_percent);
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'vrp_calculations')
                                                                @php
                                                                    $reuse_water_percent = __get_rating_data($projectdetails->id,"indoor_enviornment_quality","outdoor_air_systems","outdoor_air_intake_flow","material_resources", $projectdetails->rating_type);
                                                                    $value = json_decode($reuse_water_percent);
                                                                @endphp
                                                            @endif

                                                            @if($param['name'] == 'flush_flow_base_case')
                                                                @php
                                                                    $reuse_water_percent = __get_rating_data($projectdetails->id,"water_conservation","annex_wc_two","total_volume_base","water_conservation", $projectdetails->rating_type);
                                                                    $value = json_decode($reuse_water_percent);
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'flush_flow_proposed_case')
                                                                @php
                                                                    $reuse_water_percent = __get_rating_data($projectdetails->id,"water_conservation","annex_wc_two","total_volume_proposed","water_conservation", $projectdetails->rating_type);
                                                                    $value = json_decode($reuse_water_percent);
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'flow_percentage_achive')
                                                                @php
                                                                    $reuse_water_percent = __get_rating_data($projectdetails->id,"water_conservation","annex_wc_two","saving_percentage","water_conservation", $projectdetails->rating_type);
                                                                    $value = json_decode($reuse_water_percent);
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'total_water_ava')
                                                                @php 
                                                                    $reuse_water_percent = __get_rating_data($projectdetails->id,"water_conservation","hvac_water_requirement","totaL_water","material_resources", $projectdetails->rating_type);
                                                                    $value = json_decode($reuse_water_percent);
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'total_water_dem')
                                                                @php
                                                                    $reuse_water_percent = __get_rating_data($projectdetails->id,"water_conservation","hvac_water_requirement","total_water_demand","material_resources", $projectdetails->rating_type);
                                                                    $value = json_decode($reuse_water_percent);
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'per_flushinh_landscaping')
                                                                @php
                                                                    $reuse_water_percent = __get_rating_data($projectdetails->id,"water_conservation","hvac_water_requirement","percentage_requ","material_resources", $projectdetails->rating_type);
                                                                    $value = json_decode($reuse_water_percent);
                                                                @endphp
                                                            @endif

                                                           

                                                            @if($param['name'] == 'total_annual_energy_green_power')
                                                                @php
                                                                    $reuse_water_percent = __get_rating_data($projectdetails->id,"energy_efficiency","existing_one_site_renewable","existing_total_renewable_wheeling","material_resources", $projectdetails->rating_type);
                                                                    $existing_total_energy = __get_rating_data($projectdetails->id,"energy_efficiency","existing_one_site_renewable","existing_total_energy","material_resources", $projectdetails->rating_type);
                                                                   
                                                                    $reuse_water_percent = is_numeric($reuse_water_percent) ? (float)$reuse_water_percent : 0;
                                                                    $existing_total_energy = is_numeric($existing_total_energy) ? (float)$existing_total_energy : 0;
                                                                    $sumoftotalenergy = $reuse_water_percent + $existing_total_energy;
                                                                    $value = json_decode($sumoftotalenergy);
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'total_annual_energy_green_power_re')
                                                                @php
                                                                    $reuse_water_percent = __get_rating_data($projectdetails->id,"energy_efficiency","existing_one_site_renewable","existing_total_renewable_wheeling","material_resources", $projectdetails->rating_type);
                                                                    $value = json_decode($reuse_water_percent);
                                                                @endphp
                                                            @endif

                                                            @if($param['name'] == 'pecentage_of_local_material_emboided')
                                                                @php
                                                                    $reuse_water_percent = __get_rating_data($projectdetails->id,"material_resources","annexure_master_material","local_percent","material_resources", $projectdetails->rating_type);
                                                                    $value = json_decode($reuse_water_percent);
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'pecentage_of_recycled_content_emboided')
                                                                @php
                                                                    $reuse_water_percent = __get_rating_data($projectdetails->id,"material_resources","annexure_master_material","recycled_percent","material_resources", $projectdetails->rating_type);
                                                                    $value = json_decode($reuse_water_percent);
                                                                @endphp
                                                            @endif

                                                            @if($param['name'] == 'percentage_fresh_air_supplied')
                                                                @php
                                                                    $reuse_water_percent = __get_rating_data($projectdetails->id,"indoor_enviornment_quality","annexure_ac_fresh_air","total_meets_supplied_air","material_resources", $projectdetails->rating_type);
                                                                    $value = json_decode($reuse_water_percent);
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'water_peak_rainfall_saving')
                                                                @php
                                                                    $reuse_water_percent = __get_rating_data($projectdetails->id,"water_conservation","annex_wc_one","avg_rainfall","water_conservation", $projectdetails->rating_type);
                                                                    $value = json_decode($reuse_water_percent);
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'water_consumptin_saving')
                                                                @php
                                                                    $reuse_water_percent = __get_rating_data($projectdetails->id,"water_conservation","annex_wc_two","saving_percentage","water_conservation", $projectdetails->rating_type);
                                                                    $value = json_decode($reuse_water_percent);
                                                                @endphp
                                                            @endif
                                                            
                                                             @if($param['name'] == 'per_total_area')
                                                                @php
                                                                    $sitearea = __get_rating_relation_data($projectdetails->id,'site_area','sustainable_design', $projectdetails->rating_type);

                                                                    $totalsum = __get_rating_relation_data($projectdetails->id,'total_sum','sustainable_design',$projectdetails->rating_type);

                                                                    $sitearea = is_numeric($sitearea) ? (float)$sitearea : 0;
                                                                    $totalsum = is_numeric($totalsum) ? (float)$totalsum : 0;
                                                                    $percentagesum = 0;
                                                                    $percentagesum = ($totalsum / $sitearea) * 100;
                                                                    $value = number_format((float)$percentagesum, 2, '.', '');
                                                                @endphp
                                                            @endif

                                                           

                                                            @if($param['name'] == 'total_landscape_area')
                                                                @php
                                                                    $landscapedetailstotalarealandscape = __get_rating_relation_data($projectdetails->id,'landscape_details_total_area_landscape','sustainable_design', $projectdetails->rating_type);
                                                                    // @dump($landscapedetailstotalarealandscape);
                                                                    $landscapedetailsbuiltup = __get_rating_relation_data($projectdetails->id,'landscape_details_builtup','sustainable_design',$projectdetails->rating_type);
                                                                    $landscapedetailsarea = __get_rating_relation_data($projectdetails->id,'landscape_details_area_vertical_landscape','sustainable_design',$projectdetails->rating_type);

                                                                    $landscapedetailstotalarealandscape = is_numeric($landscapedetailstotalarealandscape) ? (float)$landscapedetailstotalarealandscape : 0;
                                                                    $landscapedetailsbuiltup = is_numeric($landscapedetailsbuiltup) ? (float)$landscapedetailsbuiltup : 0;
                                                                    $landscapedetailsarea = is_numeric($landscapedetailsarea) ? (float)$landscapedetailsarea : 0;

                                                                    $percentagesum = 0;
                                                                    $percentagesum = ($landscapedetailstotalarealandscape + $landscapedetailsbuiltup + $landscapedetailsarea);
                                                                    $value = number_format((float)$percentagesum, 2, '.', '');
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'percentage_user_total')
                                                                @php
                                                                    $landscapedetailstotalarealandscape = __get_rating_relation_data($projectdetails->id,'landscape_details_total_area_landscape','sustainable_design', $projectdetails->rating_type);
                                                                    $landscapedetailsbuiltup = __get_rating_relation_data($projectdetails->id,'landscape_details_builtup','sustainable_design',$projectdetails->rating_type);
                                                                    $landscapedetailsarea = __get_rating_relation_data($projectdetails->id,'landscape_details_area_vertical_landscape','sustainable_design',$projectdetails->rating_type);
                                                                    $casea_total_site_area_nb = __get_rating_relation_data($projectdetails->id,'site_area','sustainable_design',$projectdetails->rating_type);
                                                                    // @dump($casea_total_site_area_nb, $landscapedetailsarea);
                                                                    $landscapedetailstotalarealandscape = is_numeric($landscapedetailstotalarealandscape) ? (float)$landscapedetailstotalarealandscape : 0;
                                                                    $landscapedetailsbuiltup = is_numeric($landscapedetailsbuiltup) ? (float)$landscapedetailsbuiltup : 0;
                                                                    $landscapedetailsarea = is_numeric($landscapedetailsarea) ? (float)$landscapedetailsarea : 0;
                                                                    $casea_total_site_area_nb = is_numeric($casea_total_site_area_nb) ? (float)$casea_total_site_area_nb : 0;
                                                                    $percentagesum = 0;
                                                                    $percentagesum = ($landscapedetailstotalarealandscape + $landscapedetailsbuiltup + $landscapedetailsarea) / $casea_total_site_area_nb * 100;
                                                                    $value = number_format((float)$percentagesum, 2, '.', '');
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'circulation_percent' || $param['name'] == 'no_ecolablled_products' || $param['name'] == 'recreational_facilities' || $param['name'] == 'capacity_of_on_site_renewable_vk' || $param['name'] == "capacity_of_off_site_renewable"  || $param['name'] == 'percentage_area_meeting_acoustic' || $param['name'] == 'saving_percentage_space_method_lpd' || $param['name'] == 'saving_percentage_building_method_lpd' || $param['name'] == 'saving_percentage_building_method'|| $param['name'] == 'total_regularly_occupied_spaces_sensors' || $param['name'] == 'saving_percentage_building_method' ||  $param['name'] == 'area_percentage_credit'  || $param['name'] == 'status_gwp_credit_complince' || $param['name'] == 'percent_waste_diverted' || $param['name'] == 'fresh_air_mechanical_ventilation' || $param['name'] == 'percentage_fresh_air_supplied' || $param['name'] == 'percentage_regularly_area'  || $param['name'] == 'mandatoryechanced_fresh_air' || $param['name'] == 'daylight_measurement_report' || $param['name'] == 'percentage_regularly_occupied' || $param['name'] == 'saving_percentage_space_method'|| $param['name'] == "occupied_area_percentage" || $param['name'] == "capacity_percetage" || $param['name'] == "capacity_percetage_on_site")
                                                                @php
                                                                    $value = __get_rating_relation_data(
                                                                        $projectdetails->id,
                                                                        $param['related_to'] ?? null,
                                                                        'material_resources',
                                                                        $projectdetails->rating_type
                                                                    );
                                                                    $jsonData = json_decode($value);
                                                                    if(is_array($jsonData)){
                                                                        $value = $jsonData[0];
                                                                    }
                                                                @endphp
                                                            @endif
                                                             @if($param['name'] == 'occupants_org')
                                                                @php
                                                                    $value = __get_rating_data(
                                                                        $projectdetails->id,
                                                                        'project_details',
                                                                        'project_details',
                                                                        'occupancy',
                                                                        'sustainable_design',
                                                                        $projectdetails->rating_type
                                                                    );
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'org_generated_waste')
                                                                @php
                                                                    $value = __get_rating_data(
                                                                        $projectdetails->id,
                                                                        'project_details',
                                                                        'project_details',
                                                                        'occupancy',
                                                                        'sustainable_design',
                                                                        $projectdetails->rating_type
                                                                    );
 
                                                                    $value = $value * 0.1;
                                                                @endphp
                                                            @endif
                                                           
                                                             @if($param['name'] == 'cap_owc')
                                                                @php
                                                                    $value = __get_rating_data(
                                                                        $projectdetails->id,
                                                                        'project_details',
                                                                        'material_resources_details',
                                                                        'installed_owc_capacity',
                                                                        'sustainable_design',
                                                                        $projectdetails->rating_type
                                                                    );
 
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'treated_onsite')
                                                                @php
                                                                    $waste = __get_rating_data(
                                                                        $projectdetails->id,
                                                                        'project_details',
                                                                        'project_details',
                                                                        'occupancy',
                                                                        'sustainable_design',
                                                                        $projectdetails->rating_type
                                                                    );
 
                                                                    $waste = $waste * 0.1;
 
                                                                    $owc = __get_rating_data(
                                                                        $projectdetails->id,
                                                                        'project_details',
                                                                        'material_resources_details',
                                                                        'installed_owc_capacity',
                                                                        'sustainable_design',
                                                                        $projectdetails->rating_type
                                                                    );
 
                                                                    $value = ($owc/$waste)*100;
 
                                                                @endphp
                                                            @endif
                                                             @if($param['name'] == 'narrative_commission_annex')
                                                                @php
                                                                    $single = __get_rating_data(
                                                                        $projectdetails->id,
                                                                        'energy_efficency',
                                                                        'annex_eco_friendly_refrigerant',
                                                                        'cal_refrigerant_single',
                                                                        'material_resources',
                                                                        $projectdetails->rating_type
                                                                    );
                                                                    $multiple = __get_rating_data(
                                                                        $projectdetails->id,
                                                                        'energy_efficency',
                                                                        'annex_eco_friendly_refrigerant',
                                                                        'cal_refrigerant_multiple',
                                                                        'material_resources',
                                                                        $projectdetails->rating_type
                                                                    );
                                                                    $multiple = json_decode($multiple);

                                                                    $value = $single?$single:$multiple[0];
 
                                                                @endphp
                                                            @endif
                                                             {{-- NB END --}}
                                                            {{-- EB  realtion calculation starting--}}
                                                            @if($param['name'] == 'per_treated_roof')
                                                                @php
                                                                    $reuse_water_percent = __get_rating_data($projectdetails->id,"sustainable_design","urban_heat_roof","area_treated_percentage","material_resources", $projectdetails->rating_type);
                                                                      $decoded = json_decode($reuse_water_percent, true);
                                                                      $value = is_array($decoded) ? ($decoded[0] ?? '') : $decoded;
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'per_treated_non_roof')
                                                                @php
                                                                    $reusewaterpercent = __get_rating_data($projectdetails->id,"sustainable_design","urban_heat_roof_island","total_treated_percentage","material_resources", $projectdetails->rating_type);
                                                                    $value = $reusewaterpercent;
                                                                @endphp
                                                            @endif
                                                             @if($param['name'] == 'proposed_rain_harvesting')
                                                                @php
                                                                    $reuse_water_percent = __get_rating_data($projectdetails->id,"water_conservation","rainfall_calculations","harvesting_existing","water_conservation", $projectdetails->rating_type);
                                                                    $value = json_decode($reuse_water_percent);
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'capacity_rainwater_harve')
                                                                @php
                                                                    $reuse_water_percent = __get_rating_data($projectdetails->id,"water_conservation","rainfall_calculations","ex_mandatory_harvesting","water_conservation", $projectdetails->rating_type);
                                                                    $value = json_decode($reuse_water_percent);
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'recharge_percen')
                                                                @php
                                                                    $exavgrainfall = __get_rating_data($projectdetails->id,"water_conservation","rainfall_calculations","ex_avg_rainfall","water_conservation", $projectdetails->rating_type);
                                                                    $value = number_format((float)$exavgrainfall, 2, '.', '');
                                                                @endphp
                                                            @endif
                                                            @if($param['name'] == 'resue_percen')
                                                                @php
                                                                   $exrainfallpeak = __get_rating_data($projectdetails->id,"water_conservation","rainfall_calculations","ex_avg_rainfall_peak","water_conservation", $projectdetails->rating_type);
                                                                    $value = number_format((float)$exrainfallpeak, 2, '.', '');
                                                                @endphp
                                                            @endif
                                                            {{-- EB END --}}

 
                                                      
                                                            {{-- @dd($value) --}}
                                                            <label for="{{$param['name']}}" class="form-label"> {{$param['display_name']}} {{$unit}} @if($param['validation'] == 'required' || (array_key_exists('required', $param) && $param['required']))<span class="text-danger">*</span>@endif </label>
                                                            <input type="number" class="form-control" step="0.01"  id="{{$param['name']}}" name="{{$param['name']}}" value="{{isset($value) ? $value : (old($param['name']) !== null ? old($param['name']) : 0)}}"  @if($param['readonly']) readonly @endif>
                                                            <span class="form-text text-danger">{{$errors->first($param['name'])}}</span>
                                                        

                                                            
                                                        @endif
                                                        @if($param['type'] == 'c')
                                                            
                                                                <input type="checkbox"  class="custom-control-input"  id="{{$param['name']}}" name="{{$param['name']}}" placeholder="" @if($value == 1 || old($param['name'])) checked @endif value="1" @if(($certficateDeatils->is_submitted == 1 && $isPending)) @elseif($certficateDeatils->is_submitted == 1) disabled @else  @endif>
                                                                <label for="{{$param['name']}}" class="custom-control-label"> {{$param['display_name']}}@if($param['validation'] == 'required' || (array_key_exists('required', $param) && $param['required']))<span class="text-danger">*</span>@endif</label>
                                                                <span class="form-text text-danger">{{$errors->first($param['name'])}}</span>
                                                        @endif

                                                        @if($param['type'] == 'r')
                                                            @foreach($param['options'] as $key => $val)
                                                            <input type="radio" id="{{$key}}" name="{{$param['name']}}" value="{{$key}}" @if($value == $key || old($param['name']) == $key) checked @endif>
                                                            <label for="{{$key}}" style="margin: 12px;">{{$val}}</label><br>
                                                            @endforeach
                                                            <span class="form-text text-danger">{{$errors->first($param['name'])}}</span>
                                                        @endif
                                                        @if($param['type'] == 'd')
                                                                    
                                                            <label for="{{$param['name']}}" class="form-label"> {{$param['display_name']}}@if($param['validation'] == 'required')<span class="text-danger">*</span>@endif</label>
                                                            <select class="form-control creditDropdown" id="{{$param['name']}}" name="{{$param['name']}}" data-links='@json($param['links'] ?? [])'  @if(($certficateDeatils->is_submitted == 1 && $isPending)) @elseif($certficateDeatils->is_submitted == 1) disabled @else  @endif @if($param['name'] == 'projects_details_space_method' && $value)  @endif>
                                                                @php
                                                                    @$options = explode(',',$param['options']);
                                                                @endphp
                                                                <option value="">Select </option>
                                                                @foreach($options as $key => $option)
                                                                        @if($rating_type[0] == 5 && $param['name'] == 'material_recycled')
                                                                            @if($certficateDeatils->topology_type == 2 && $key != 1)
                                                                            <option value="{{$option}}" @if($value == $option || old($param['name']) == $option) selected @endif> {{$option}}</option>
                                                                            @endif
                                                                            @if($certficateDeatils->topology_type == 1)
                                                                            <option value="{{$option}}" @if($value == $option || old($param['name']) == $option) selected @endif> {{$option}}</option>
                                                                            @endif
                                                                        @else
                                                                            <option value="{{$option}}" @if($value == $option || old($param['name']) == $option) selected @endif> {{$option}}</option>
                                                                        @endif
                                                                @endforeach
                                                            </select>
                                                                <div id="{{$param['name']}}_links" class="mt-2"></div>

                                                            <span class="form-text text-danger">{{$errors->first($param['name'])}}</span>
                                                        @endif
                                                        @if($param['type'] == 'ta')
                                                        <label for="{{$param['name']}}" class="form-label"> {{$param['display_name']}}@if($param['validation'] == 'required' || (array_key_exists('required', $param) && $param['required']))<span class="text-danger">*</span>@endif</label>
                                                        <textarea class="form-control" id="{{$param['name']}}" name="{{$param['name']}}">@if($value || old($param['name'])) {{$value}} @endif</textarea>
                                                        <span class="form-text text-danger">{{$errors->first($param['name'])}}</span>
                                                        @endif
                                                        @if($param['type'] == 'h')
                                                        <p><a href="{{ route('ratingapply') }}?id={{base64_encode($projectid)}}&tab={{$tab}}&subtab={{$param['subtab']}}">{{$param['display_name']}}</a></p>
                                                        @endif
                                                        @if($param['type'] == 'hr')
                                                            <hr>
                                                        @endif
                                                        @if($param['type'] == 'nt')
                                                            <label for="{{$param['name']}}"> {{$param['display_name']}}</label>
                                                        @endif
                                                        {{-- bold --}}
                                                        @if($param['type'] == 'bd')
                                                            
                                                            <label for="{{$param['name']}}" style="font-weight: 600;color:#000;"> {{$param['display_name']}}</label>
                                                        @endif
                                                    </div>
                                                </div>
                                            @endif
                                        @endif
                                        @if($param['type'] == 'u')
                                            @if(($certficateDeatils->certificate_type == 1 && $param['pre-certificate']) || ($certficateDeatils->certificate_type == 2 && $param['certificate']) || ( $param['certificate'] && $param['pre-certificate']))
                                                @php
                                                $value = __get_rating_documents($projectdetails->id, $activeSubmenu, $activeMenu, $param['name']);
                                                @endphp
                                                <div class="col-md-12" style=" top: -48px;padding: 0px 10px;margin-bottom: -30px;">
                                                    <div id="{{$param['name']}}" @if($value || old($param['name']) || $errors->first($param['name'])) @else style="display:none;" @endif>
                                                        <a class="btn btn-primary" style="  background: aliceblue !important; color: #467db5 !important; float: right; margin: 20px 0px; z-index: 99;" id="{{$param['name']}}_btn"><i data-feather="plus" class="align-right ml-sm-25 ml-0"></i>Add more</a>
                                                        <table class="table table-bordered" id="{{$param['name']}}_table">
                                                            <thead>
                                                                <tr>
                                                                    <th width="30%">Upload</th>
                                                                    <th width="40%">File</th>
                                                                    <th width="30%">Remarks</th>
                                                                    <th width="30%">Action</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                @if($value)
                                                                @php
                                                                $value = $value;
                                                                @endphp
                                                                @foreach($value as $key => $file) 
                                                                <tr>
                                                                    <td>
                                                                        <input type="file"   class="file-input__input"  name="{{$param['name']}}[]" id="{{$param['name']}}[]"  disabled>                                                                        
                                                                    </td>
                                                                    <td>
                                                                        @php 
                                                                            if (strpos($file->doc, 'cloudfront.net') !== false) {
                                                                                $doc = 'https://'.$file->doc;
                                                                            }else{
                                                                                $doc = 'uploads/certificate/'.$file->doc;
                                                                            }
                                                                        @endphp
                                                                        <div style="display:flex">
                                                                            <p style="margin-right: 20px;"><a href="{{$doc}}"  target="_blank">{{$file->doc}}</a></p>
                                                                        </div>
                                                                       
                                                                    </td>
                                                                    <td><p style="margin-right: 20px;">@if($file->submission_no == 1)
                                                                                        Preliminary review document
                                                                            @elseif($file->submission_no == 2)
                                                                                        Second review document
                                                                            @elseif($file->submission_no > 2)
                                                                                        Additional Review document
                                                                            @endif</p></td>
                                                                    <td>
                                                                        <div class="d-flex">
                                                                            @if($certficateDeatils->is_submitted != 1 || ($certficateDeatils->submission_count !=  $file->submission_no) )
                                                                             <a data-id="{{$file->id}}" class="btn btn-grey  delete_{{$param['name']}}" data-container="body" data-toggle="tooltip" data-placement="bottom" data-theme="dark" title="Delete"><i class="fa fa-times" aria-hidden="true"></i></a>
                                                                            @endif
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                                @endforeach 
                                                                @else
                                                                <tr>
                                                                    <td>
                                                                        <input type="file"   class="file-input__input fileInput"  value="">
                                                                        <div class="upload-loader" style="display:none;">
                                                                            Uploading...
                                                                        </div>
                                                                        <div class="progress"></div>
                                                                        <span class="form-text text-danger">{{$errors->first($param['name'])}}</span>
                                                                        <input type="hidden" class="file-input__input fileInputUrl"  name="{{$param['name']}}[]" value="">
                                                                    </td>
                                                                    <td>
                                                                        <div style="display:flex">
                                                                            <p style="margin-right: 20px;"></p>
                                                                        </div>
                                                                    </td>
                                                                    <td></td>
                                                                    <td></td>
                                                                </tr>
                                                                @endif
                                                            <tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            @endif
                                        @endif
                                        @if($param['type'] == 'M')
                                            @if(($certficateDeatils->certificate_type == 1 && $param['pre-certificate']) || ($certficateDeatils->certificate_type == 2 && $param['certificate']) || ( $param['certificate'] && $param['pre-certificate']))
                                            <div class="row col-12" style="display: block;">
                                                <div class="d-flex" style=" justify-content: space-between; align-items: end; ">
                                                    <p>Other Documents</p>
                                                    <a class="btn btn-primary" style=" float: right; margin: 10px 0px;  background: aliceblue !important; color: #467db5 !important;" id="{{$param['name']}}_btn_others" ><i data-feather="plus" class="align-right ml-sm-25 ml-0"></i>Add more</a>
                                                </div>
                                                <table id="{{$param['name']}}_table_others" class="table table-bordered" style="width: 100%;">
                                                    <thead>
                                                        <th width="30%">Document Name</th>
                                                        <th width="30%">Upload</th>
                                                        <th width="30%">Remarks</th>
                                                        <th width="10%">Action</th>
                                                    </thead>
                                                    <tbody>
                                                            @php
                                                            $docs = __get_rating_documents($projectdetails->id, $activeSubmenu, $activeMenu, $param['name']);
                                                            @endphp
                                                            @if($docs)
                                                                @foreach($docs as $key => $doc)
                                                                    <tr>
                                                                        <td width="40%"> <input type="text" class="form-control" placeholder="Enter Document Name" @if($doc->value) value="{{$doc->value}}" readonly @else value="{{old('document_name['.$key.']')}}" @endif></td>
                                                                         @php 
                                                                            if (strpos($doc->doc, 'cloudfront.net') !== false) {
                                                                                $docs = 'https://'.$doc->doc;
                                                                            }else{
                                                                                $docs = 'uploads/certificate/'.$doc->doc;
                                                                            }
                                                                        @endphp
                                                                        <td width="40%"><div style="display:flex;" ><a href="{{$docs}}" class="" target="_blank">{{$doc->doc}}</a></div></td>
                                                                        <td width="40%"><div style="display:flex;" >@if($doc->submission_no == 1)
                                                                                        Preliminary review document
                                                                            @elseif($doc->submission_no == 2)
                                                                                        Second review document
                                                                            @elseif($doc->submission_no > 2)
                                                                                        Additional Review document
                                                                            @endif</div></td>
                                                                        <td width="20%"><div class="d-flex">@if($certficateDeatils->is_submitted != 1 || !empty($doc->remarks))<a class="btn btn-grey  edit_others_{{$param['name']}}" data-id="{{$doc->id}}" data-container="body" data-toggle="tooltip" data-placement="bottom" data-theme="dark" title="Edit"><i class="fa fa-edit"></i></a> <a data-id="{{$doc->id}}" class="btn btn-grey  delete_others_{{$param['name']}}" data-container="body" data-toggle="tooltip" data-placement="bottom" data-theme="dark" title="Delete"><i class="fa fa-times" aria-hidden="true"></i></a>@endif </div></td>
                                                                    </tr>
                                                                @endforeach
                                                            @else
                                                                    <tr>
                                                                        <td width="40%"> <input type="text" class="form-control" id="document_name" name="document_name[]" placeholder="Enter Document Name" value="{{old('document_name[]')}}"></td>
                                                                        <td width="40%"><div style="display:flex;" >
                                                                            <input type="file" class="file-input__input fileInput" id="other_documents" >
                                                                            <div class="upload-loader" style="display:none;">
                                                                            Uploading...
                                                                            </div>
                                                                            <div class="progress"></div>
                                                                            <span class="form-text text-danger">{{$errors->first($param['name'])}}</span>
                                                                            <input type="hidden" class="file-input__input fileInputUrl"  name="other_documents[]" value="">
                                                                            <span class="form-text text-danger">{{$errors->first('other_documents')}}</span>
                                                                        </td>
                                                                        <td width="40%"><div style="display:flex;" ></div></td>
                                                                        <td width="20%"></td>
                                                                    </tr>
                                                            @endif
                                                    </tbody>
                                                </table>
                                            </div>
                                            @endif
                                        @endif 
                                    @endforeach
                                    @php 
                                        $reviews = __get_project_reviews($projectdetails->id, $activeSubmenu, $activeMenu, $projectdetails->rating_type);
                                        $check_report = __check_report_submitted_approved($projectdetails->projectid);
                                    @endphp
                                    @if(count($reviews) > 0 && $check_report)
                                    <hr>
                                    <table  class="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th colspan="2" style="text-align: center;">Review Logs</th>
                                            </tr>
                                            <tr>
                                                <th>Review</th>
                                                <th>Technical Advice</th>
                                            </tr>
                                        </thead>
                                        @foreach($reviews as $key => $review)
                                            @if($key == 0)
                                                <tr >
                                                    <td style="text-align: left;">{!! nl2br(e($review->review))!!}</td>
                                                    <td style="text-align: left;">{!! nl2br(e($review->technical_advice))!!}</td>
                                                </tr>
                                            @endif
                                        @endforeach
                                    </table>
                                    <hr>
                                    @endif
                                    <div class="col-12" style=" text-align: center; margin: 20px 0px; display: flex;  @if($presentTab != 0) justify-content: space-between; @else justify-content: end; @endif">
                                        @if($presentTab != 0) 
                                            <a href="{{ route('ratingapply') }}?id={{base64_encode($projectid)}}&tab={{$tab}}&subtab={{$previoustab}}"  class="btn btn-primary btn-next @if($presentTab == 0) disabled @endif" style=" background: aliceblue !important; color: #467db5 !important;">
                                                <i data-feather="arrow-left" class="align-right ml-sm-25 ml-0"></i>
                                                <span class="align-right d-sm-inline-block d-none">Previous</span>
                                            </a>
                                         @endif
                                        @php
                                                $rating = $projectdetails->rating_type;
                                                $rating = explode('_', $rating);
                                                $detailsPending = __check_details_pending($projectdetails->id, $rating[0], $certficateDeatils->submission_count);
                                        @endphp
                                        @if($tab == 'project_details' && $detailsPending)
                                                <button type="submit" class="btn btn-primary btn-next" style=" background: aliceblue !important; color: #467db5 !important;">
                                                    <span class="align-right d-sm-inline-block d-none">@if($countKey != $presentTab)Save & Continue @else Save @endif</span>
                                                    <i data-feather="arrow-right" class="align-right ml-sm-25 ml-0"></i>
                                                </button>
                                        @elseif($certficateDeatils->is_submitted != 1 || ($certficateDeatils->is_submitted == 1 && $isPending) || ($certficateDeatils->is_submitted == 1 && $certficateDeatils->is_reappeal == 1 && $certficateDeatils->reappeal_payment_status == 1 && in_array($currentTab, $reappealedTabs)))
                                            <button type="submit" class="btn btn-primary btn-next" style=" background: aliceblue !important; color: #467db5 !important;">
                                                <span class="align-right d-sm-inline-block d-none">@if($countKey != $presentTab)Save & Continue @else Save @endif</span>
                                                <i data-feather="arrow-right" class="align-right ml-sm-25 ml-0"></i>
                                            </button>
                                        @else
                                            <a href="{{ route('ratingapply') }}?id={{base64_encode($projectid)}}&tab={{$tab}}&subtab={{$nexttab}}" class="btn btn-primary btn-next @if($presentTab == $next) d-none @endif" style=" background: aliceblue !important; color: #467db5 !important;">
                                                <span class="align-right d-sm-inline-block d-none">Next</span>
                                                <i data-feather="arrow-right" class="align-right ml-sm-25 ml-0"></i>
                                            </a>
                                        @endif
                                    </div>
                                </div>
                            </form>
                        @endif

                       
                    </div> 
                    @endif        
                </div>
            </div>    
            <div class="col-lg-3">
                    @if($certficateDeatils->is_submitted != 1 || ($certficateDeatils->is_submitted == 1 && $isPending) || ($certficateDeatils->is_submitted == 1 && isset($reappeal) && $reappeal->reappeal_payment_status == 1))
                    <div class="col-12" style=" text-align: center; margin: 20px 0px; display: flex; justify-content: center; z-index: 10;">         
                        <a id="finalSubmit" class="btn btn-primary btn-next" style=" background: aliceblue !important; color: #467db5 !important;">
                            <span class="align-right d-sm-inline-block d-none">Final Submit</span>
                        </a>
                    </div>
                    @endif
                <div class="card postion-state">
                   
                    <div class="card-header d-flex align-items-center justify-content-between ">
                        @if($tab == 'project_details')
                        <p class="card-title m-0 me-2"> 
                           Project Information
                        </p>
                        @else
                        <p class="card-title m-0 me-2"> 
                           Available Credits
                        </p>
                        @endif
                    </div>
                    <div class="main-wrapper">
                        <div class="wrapper">
                            <ul class="StepProgress">
                            @foreach($subtabs as $key => $subtab)
                                @if((
                                            ($certficateDeatils->certificate_type == 1 && $subtab['pre-certificate']) || 
                                            ($certficateDeatils->certificate_type == 2 && $subtab['certificate']) || 
                                            ($subtab['certificate'] && $subtab['pre-certificate'])
                                            )
                                            &&
                                            (
                                                $certficateDeatils->topology_type != 1 
                                                || ($certficateDeatils->topology_type == 1 && (!array_key_exists('banking', $subtab) || $subtab['banking']))
                                            )
                                            &&
                                            $subtab['sub_slug'] != 'embodied_energy'
                                            &&
                                            $subtab['sub_slug'] != 'purchase_of_green_consumables'
                                            &&
                                            $subtab['sub_slug'] != 'co2_monitoring'
                                            && 
                                            $subtab['sub_slug'] != 'thermal_comfort'
                                            && 
                                            $subtab['sub_slug'] != 'dedicated_dining_spaces'
                                            &&
                                            $subtab['sub_slug'] != 'eco_vision'
                                            &&
                                            $subtab['sub_slug'] != 'energy_analysis_annex'
                                            
                                    )
                                    @php
                                        $updated_data = '';
                                        $form_submit_field = count( __get_form_submit_field($projectdetails->id,$tab, $subtab['sub_slug'],$action ));
                                        $created_data =  __get_created_at_form_submit($projectdetails->id,$tab, $subtab['sub_slug'],$action );
                                        $field_in_form = __get_param_config($tab, $subtab['sub_slug'], $version, $projectdetails->rating_type,  $projectdetails->id);
                                        $project_form_submit_status_cls = 'default';
                                        if($form_submit_field > 0 && $form_submit_field >= $field_in_form && $subtab['sub_slug'] != 'annex_wc_one' && $subtab['sub_slug'] != 'annex_wc_two' && $subtab['sub_slug'] != 'annex_wc_three' && $subtab['sub_slug'] != 'annex_wc_four'){
                                            $project_form_submit_status_cls = 'form-completed';
                                        }else if($form_submit_field > 0 && $form_submit_field < $field_in_form && $subtab['sub_slug'] != 'annex_wc_one' && $subtab['sub_slug'] != 'annex_wc_two' && $subtab['sub_slug'] != 'annex_wc_three' && $subtab['sub_slug'] != 'annex_wc_four'){
                                            if($projectdetails->rating_type == 5){
                                                $project_form_submit_status_cls = 'form-completed';
                                            }else{
                                                $project_form_submit_status_cls = 'form-completed';
                                            }
                                        }else{
                                            $project_form_submit_status_cls = 'default';
                                        }
                                        $lpdspace = __get_rating_data($projectdetails->id, 'project_details', 'project_details', 'projects_details_space_method', 'sustainable_design', $projectdetails->rating_type);
                                        $epical = __get_rating_data($projectdetails->id, 'project_details', 'project_details', 'select_epi', 'sustainable_design', $projectdetails->rating_type);
                                        $singlezone = __get_rating_data($projectdetails->id, 'project_details', 'project_details', 'zone_systems', 'sustainable_design', $projectdetails->rating_type);
                                        if($certficateDeatils->is_submitted == 1 && in_array($subtab['sub_slug'], $rejectReport['tabs'])){
                                            $project_form_submit_status_cls = 'text-danger';
                                        }

                                        
                                        $totalannualconsumptionlpds = __get_rating_data($projectdetails->id,'energy_efficency','annex_lpd_calculation',
                                                     'total_annual_consumption_lpds','material_resources',
                                                     $projectdetails->rating_type);
                                        $occupancygreen = __get_rating_data($projectdetails->id,'project_details','project_details',
                                                     'occupancy_green','sustainable_design',
                                                     $projectdetails->rating_type);
                                            // @dd($occupancygreen);    
                                                    // @dd($totalannualconsumptionlpds);
                                        
                                    @endphp
                                        @if($tab == 'energy_efficency')
                                            @php
                                                // Decide whether to show this subtab
                                                $show = false;

                                                if ($lpdspace == 'LPD Space Function Method' && $subtab['sub_slug'] == 'lpd_space_function_method') {
                                                    $show = true;
                                                } elseif ($lpdspace == 'LPD Building Area Method' && $subtab['sub_slug'] == 'lpd_building_area_method') {
                                                    $show = true;
                                                } elseif ($subtab['sub_slug'] != 'lpd_space_function_method' && $subtab['sub_slug'] != 'lpd_building_area_method') {
                                                    $show = true;
                                                }
                                            @endphp
                                            @if($show)
                                            
                                                <li class="StepProgress-item {{$project_form_submit_status_cls}} @if($loop->last) last-loop @endif">
                                                    <strong>
                                                        <a class="default-link @if($activeMenu == $subtab['sub_slug']) active @endif" 
                                                        href="{{ route('ratingapply') }}?id={{ base64_encode($projectid) }}&tab={{ $tab }}&subtab={{ $subtab['sub_slug'] }}">
                                                        {{ $subtab['name'] }}
                                                        </a>
                                                    </strong>
                                                    <small>{{ $created_data }}</small>
                                                </li>
                                            @endif
                                            @elseif($projectdetails->rating_type == 1 && $tab == 'indoor_enviornment_quality')
                                                    @php
                                                        $show = true;

                                                        // These two subtabs are controlled by $singlezone
                                                        $zoneControlledSubtabs = ['single_zone_system', 'outdoor_air_systems'];

                                                        if (in_array($subtab['sub_slug'], $zoneControlledSubtabs)) {
                                                            $show = false;

                                                            if ($singlezone == 'Single Zone System' && $subtab['sub_slug'] == 'single_zone_system') {
                                                                $show = true;
                                                            }

                                                            if ($singlezone == 'Multi Zone System' && $subtab['sub_slug'] == 'outdoor_air_systems') {
                                                                $show = true;
                                                            }
                                                        }
                                                    @endphp

                                                    @if($show)
                                                        <li class="StepProgress-item {{$project_form_submit_status_cls}} @if($loop->last) last-loop @endif">
                                                            <strong>
                                                                <a class="@if($project_form_submit_status_cls == 'text-danger') {{$project_form_submit_status_cls}} @else default-link @endif
                                                                @if($activeMenu == $subtab['sub_slug']) active @endif"
                                                                href="{{ route('ratingapply') }}?id={{ base64_encode($projectid) }}&tab={{ $tab }}&subtab={{ $subtab['sub_slug'] }}">
                                                                    {{ $subtab['name'] }}
                                                                </a>
                                                            </strong>
                                                            <small>{{ $created_data }}</small>
                                                        </li>
                                                    @endif
                                        @elseif($tab == 'resident_health_wellbeing')
                                                {{-- @php
                                                    $show = true;
                                                    $noOfFloors = __get_rating_data($projectdetails->id, 'resident_health_wellbeing', 'ventilation_design_enhanced', 'no_of_floors', 'material_resources', $projectdetails->rating_type);
                                                    $noOfFloors = intval($noOfFloors);
                                                    
                                                      $allSubtabs = [
                                                                'annex_ventilation_design_one',
                                                                'annex_ventilation_design_two',
                                                                'summanry_of_ventilation_two_one'
                                                            ];

                                                            if ($noOfFloors <= 0 && in_array($subtab['sub_slug'], $allSubtabs)) {
                                                                $show = false;
                                                            }
                                                    if ($noOfFloors > 0 && $noOfFloors <= 5) {
                                                        if (
                                                            $subtab['sub_slug'] == 'annex_ventilation_design_two' ||
                                                            $subtab['sub_slug'] == 'summanry_of_ventilation_two_one'
                                                        ) 
                                                        {
                                                            $show = false;
                                                        }

                                                    }
                                                    if ($noOfFloors > 5) {
                                                        if (
                                                            $subtab['sub_slug'] == 'annex_ventilation_design_one' ||
                                                            $subtab['sub_slug'] == 'summanry_of_ventilation_two_one'
                                                        ) {
                                                            $show = false;
                                                        }
                                                    }
                                                    // dump($show, $noOfFloors);
                                                @endphp --}}
                                                @php
                                                $show = true;

                                                $noOfFloors = __get_rating_data(
                                                    $projectdetails->id,
                                                    'resident_health_wellbeing',
                                                    'ventilation_design_enhanced',
                                                    'no_of_floors',
                                                    'material_resources',
                                                    $projectdetails->rating_type
                                                );

                                                $noOfFloors = intval($noOfFloors);

                                                // Subtab that must ALWAYS be shown
                                                if ($subtab['sub_slug'] == 'summanry_of_ventilation_two_one') {
                                                    $show = true;
                                                }

                                                // Annexure 1 and 2 only are controlled by floors
                                                // summary_two_one is NOT controlled anymore

                                                if ($noOfFloors <= 0) {
                                                    if ($subtab['sub_slug'] == 'annex_ventilation_design_one'
                                                        || $subtab['sub_slug'] == 'annex_ventilation_design_two'
                                                        || $subtab['sub_slug'] == 'summanry_of_ventilation_two') {
                                                        $show = false;
                                                    }
                                                }

                                                if ($noOfFloors > 0 && $noOfFloors <= 5) {
                                                    if ($subtab['sub_slug'] == 'annex_ventilation_design_two'
                                                        || $subtab['sub_slug'] == 'summanry_of_ventilation_two') {
                                                        $show = false;
                                                    }
                                                }

                                                if ($noOfFloors > 5) {
                                                    if ($subtab['sub_slug'] == 'annex_ventilation_design_one'
                                                        || $subtab['sub_slug'] == 'summanry_of_ventilation_two') {
                                                        $show = false;
                                                    }
                                                }
                                            @endphp
                                            @if($show)
                                                <li class="StepProgress-item {{$project_form_submit_status_cls}} @if($loop->last) last-loop @endif">
                                                    <strong>
                                                        <a class="default-link @if($activeMenu == $subtab['sub_slug']) active @endif" 
                                                        href="{{ route('ratingapply') }}?id={{ base64_encode($projectid) }}&tab={{ $tab }}&subtab={{ $subtab['sub_slug'] }}">
                                                        {{ $subtab['name'] }}
                                                        </a>
                                                    </strong>
                                                    <small>{{ $created_data }}</small>
                                                </li>
                                            @endif
                                        
                                        @else
                                          
                                                <li class="StepProgress-item {{$project_form_submit_status_cls}} @if($loop->last) last-loop @endif">
                                                    <strong>
                                                        <a class="@if($project_form_submit_status_cls == 'text-danger') {{$project_form_submit_status_cls}} @else default-link @endif @if($activeMenu == $subtab['sub_slug']) active @endif" 
                                                        href="{{ route('ratingapply') }}?id={{ base64_encode($projectid) }}&tab={{ $tab }}&subtab={{ $subtab['sub_slug'] }}">
                                                        {{ $subtab['name'] }}
                                                        </a>
                                                    </strong>
                                                    <small>{{ $created_data }}</small>
                                                </li>
                                        @endif
                                    @elseif($subtab['sub_slug'] == 'embodied_energy' && $certficateDeatils->topology_type == 1 && $certficateDeatils->certificate_type == 2)
                                             <li class="StepProgress-item {{$project_form_submit_status_cls}} @if($loop->last) last-loop @endif">
                                                    <strong>
                                                        <a class="default-link @if($activeMenu == $subtab['sub_slug']) active @endif" 
                                                        href="{{ route('ratingapply') }}?id={{ base64_encode($projectid) }}&tab={{ $tab }}&subtab={{ $subtab['sub_slug'] }}">
                                                        {{ $subtab['name'] }}
                                                        </a>
                                                    </strong>
                                                    <small>{{ $created_data }}</small>
                                                </li>
                                        @elseif($subtab['sub_slug'] == 'purchase_of_green_consumables')
                                            @if($certficateDeatils->certificate_type == 1 )
                                                     <li class="StepProgress-item {{$project_form_submit_status_cls}} @if($loop->last) last-loop @endif">
                                                    <strong>
                                                        <a class="default-link @if($activeMenu == $subtab['sub_slug']) active @endif" 
                                                        href="{{ route('ratingapply') }}?id={{ base64_encode($projectid) }}&tab={{ $tab }}&subtab={{ $subtab['sub_slug'] }}">
                                                        {{ $subtab['name'] }}
                                                        </a>
                                                    </strong>
                                                    <small>{{ $created_data }}</small>
                                                </li>
                                            @else
                                                @if($certficateDeatils->topology_type != 1)
                                                     <li class="StepProgress-item {{$project_form_submit_status_cls}} @if($loop->last) last-loop @endif">
                                                    <strong>
                                                        <a class="default-link @if($activeMenu == $subtab['sub_slug']) active @endif" 
                                                        href="{{ route('ratingapply') }}?id={{ base64_encode($projectid) }}&tab={{ $tab }}&subtab={{ $subtab['sub_slug'] }}">
                                                        {{ $subtab['name'] }}
                                                        </a>
                                                    </strong>
                                                    <small>{{ $created_data }}</small>
                                                </li>
                                                @endif

                                            @endif
                                        @elseif($subtab['sub_slug'] == 'co2_monitoring')
                                                @if($certficateDeatils->topology_type == 1)
                                                         <li class="StepProgress-item {{$project_form_submit_status_cls}} @if($loop->last) last-loop @endif">
                                                    <strong>
                                                        <a class="default-link @if($activeMenu == $subtab['sub_slug']) active @endif" 
                                                        href="{{ route('ratingapply') }}?id={{ base64_encode($projectid) }}&tab={{ $tab }}&subtab={{ $subtab['sub_slug'] }}">
                                                        {{ $subtab['name'] }}
                                                        </a>
                                                    </strong>
                                                    <small>{{ $created_data }}</small>
                                                </li>
                                                @endif
                                        @elseif($subtab['sub_slug'] == 'thermal_comfort')
                                            @if($certficateDeatils->certificate_type == 1 )
                                                     <li class="StepProgress-item {{$project_form_submit_status_cls}} @if($loop->last) last-loop @endif">
                                                    <strong>
                                                        <a class="default-link @if($activeMenu == $subtab['sub_slug']) active @endif" 
                                                        href="{{ route('ratingapply') }}?id={{ base64_encode($projectid) }}&tab={{ $tab }}&subtab={{ $subtab['sub_slug'] }}">
                                                        {{ $subtab['name'] }}
                                                        </a>
                                                    </strong>
                                                    <small>{{ $created_data }}</small>
                                                </li>
                                            @else
                                                @if($certficateDeatils->topology_type != 1)
                                                     <li class="StepProgress-item {{$project_form_submit_status_cls}} @if($loop->last) last-loop @endif">
                                                    <strong>
                                                        <a class="default-link @if($activeMenu == $subtab['sub_slug']) active @endif" 
                                                        href="{{ route('ratingapply') }}?id={{ base64_encode($projectid) }}&tab={{ $tab }}&subtab={{ $subtab['sub_slug'] }}">
                                                        {{ $subtab['name'] }}
                                                        </a>
                                                    </strong>
                                                    <small>{{ $created_data }}</small>
                                                </li>
                                                @endif

                                            @endif
                                        @elseif($subtab['sub_slug'] == 'dedicated_dining_spaces')
                                            @if($certficateDeatils->certificate_type == 1 )
                                                     <li class="StepProgress-item {{$project_form_submit_status_cls}} @if($loop->last) last-loop @endif">
                                                    <strong>
                                                        <a class="default-link @if($activeMenu == $subtab['sub_slug']) active @endif" 
                                                        href="{{ route('ratingapply') }}?id={{ base64_encode($projectid) }}&tab={{ $tab }}&subtab={{ $subtab['sub_slug'] }}">
                                                        {{ $subtab['name'] }}
                                                        </a>
                                                    </strong>
                                                    <small>{{ $created_data }}</small>
                                                </li>
                                            @else
                                                @if($certficateDeatils->topology_type != 1)
                                                    <li class="StepProgress-item {{$project_form_submit_status_cls}} @if($loop->last) last-loop @endif">
                                                    <strong>
                                                        <a class="default-link @if($activeMenu == $subtab['sub_slug']) active @endif" 
                                                        href="{{ route('ratingapply') }}?id={{ base64_encode($projectid) }}&tab={{ $tab }}&subtab={{ $subtab['sub_slug'] }}">
                                                        {{ $subtab['name'] }}
                                                        </a>
                                                    </strong>
                                                    <small>{{ $created_data }}</small>
                                                </li>
                                                @endif

                                            @endif
                                        @elseif($subtab['sub_slug'] == 'eco_vision')
                                            @if($certficateDeatils->topology_type != 2)
                                                    <li class="StepProgress-item {{$project_form_submit_status_cls}} @if($loop->last) last-loop @endif">
                                                    <strong>
                                                        <a class="default-link @if($activeMenu == $subtab['sub_slug']) active @endif" 
                                                        href="{{ route('ratingapply') }}?id={{ base64_encode($projectid) }}&tab={{ $tab }}&subtab={{ $subtab['sub_slug'] }}">
                                                        {{ $subtab['name'] }}
                                                        </a>
                                                    </strong>
                                                    <small>{{ $created_data }}</small>
                                                </li>
                                            @endif
                                             <!-- @elseif($projectdetails->rating_type == 4 && $tab == 'energy_efficiency')
                                                        @php
                                                            // Default: hide EPI-specific subtabs
                                                            $show = true;

                                                            // Subtabs controlled by EPI selection
                                                            $epiControlledSubtabs = [
                                                                'eemr2_office',
                                                                'epi_limit_calculation',
                                                                'epi_calculation'
                                                            ];

                                                            if (in_array($subtab['sub_slug'], $epiControlledSubtabs)) {
                                                                $show = false;

                                                                if ($epical === 'Epi Office' && $subtab['sub_slug'] === 'eemr2_office') {
                                                                    $show = true;
                                                                }

                                                                if ($epical === 'Epi Mall' && $subtab['sub_slug'] === 'epi_limit_calculation') {
                                                                    $show = true;
                                                                }

                                                                if ($epical === 'Epi BPO' && $subtab['sub_slug'] === 'epi_calculation') {
                                                                    $show = true;
                                                                }
                                                            }
                                                        @endphp

                                                        @if($show)
                                                            <li class="StepProgress-item {{$project_form_submit_status_cls}} @if($loop->last) last-loop @endif">
                                                                <strong>
                                                                    <a class="default-link @if($activeMenu == $subtab['sub_slug']) active @endif"
                                                                    href="{{ route('ratingapply') }}?id={{ base64_encode($projectid) }}&tab={{ $tab }}&subtab={{ $subtab['sub_slug'] }}">
                                                                        {{ $subtab['name'] }}
                                                                    </a>
                                                                </strong>
                                                                <small>{{ $created_data }}</small>
                                                            </li>
                                                        @endif -->

                                @endif
                            @endforeach
                                
                            </ul>
                        </div>
                       
                    </div>
                   
                </div>
            </div> 
</section>
 <!-- Modal -->
 <div class="modal fade text-left" id="image_update" tabindex="-1" role="dialog" aria-labelledby="myModalLabel1"
            aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h4 class="modal-title">Edit Document</h4>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <form class="image-upload" id="image-upload"  method="POST" enctype="multipart/form-data">
                        {!! csrf_field() !!}
                        <input type='hidden' id='doc_id' value="" name='doc_id'>

                        <div class="modal-body p-2">
                            <div class="col-md-12">
                                <div class="row">
                                    <label class="form-label mr-2" for="message1">Upload Document<span class="required"> *
                                        </span></label>
                                        <input type="file"   class="file-input__input"  id="image_update" name="image_update">                                                                        
                                        <span class="form-text text-danger" id="error_remarks" style="display:none;">Document is required</span>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary btn-reject" onclick="reject()">Update</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
@endsection

@push('PAGE_ASSETS_JS')
<script src="{{__frontend_asset('js/scripts/forms/form-wizard.js')}}"></script>
<script src="{{__frontend_asset('js/scripts/pages/app-user-edit.js')}}"></script>

<script src="{{__frontend_asset('vendors/js/forms/wizard/bs-stepper.min.js')}}"></script>
<script src="{{__frontend_asset('vendors/js/forms/select/select2.full.min.js')}}"></script>
<script src="{{__frontend_asset('vendors/js/forms/validation/jquery.validate.min.js')}}"></script>
<script src="{{__frontend_asset('vendors/js/pickers/pickadate/picker.js')}}"></script>

<script src="{{__frontend_asset('vendors/js/pickers/pickadate/picker.date.js')}}"></script>
<script src="{{__frontend_asset('js/scripts/components/components-popovers.js')}}"></script>
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>

<script>
    var subtab = '{{$activeMenu}}';
    var lpdspace = "{{$lpdspace}}";
    var rating = "{{$rating_type[0]}}";
    var values = '';                 
    $.getJSON("{{__backend_asset('assets/annex-setup.json')}}", function(json) {
     values = json;
});
var total_area = 0;
// for(let i = 1; i <= 15; i++){
//     $('.surface_type'+i).change(function(){
//         let id = $('.surface_type'+i).val();
//         $('#runoff'+i).val(values[id-1]['cofficent']);
//         if($('#area'+i).val() > 0){
//             let total = $('#area'+i).val()*values[id-1]['cofficent'] ;
           

//             $('#imprevious_area'+i).val(total.toFixed(2));
            
//         }
//         related_calculations();
//     });

//     $('#area'+i).keyup(function(){
//         let area = $('#area'+i).val();
//         let total = area*$('#runoff'+i).val();
//         $('#imprevious_area'+i).val(total.toFixed(2));
//         related_calculations();
//     });

// }

$(document).on('change', '[class*="surface_type"]', function () {
    let classList = $(this).attr('class');
    let match = classList.match(/surface_type(\d+)/);
    if (!match) return;
    let i = match[1];

    let id = $(this).val();
    console.log('Row:', i, '| Selected ID:', id, '| Value entry:', values[id - 1]); // debug

    if (!id || !values[id - 1]) return;

    let cofficent = values[id - 1]['cofficent'];
    $('#runoff' + i).val(cofficent);

    let area = $('#area' + i).val();
    console.log('Area:', area, '| Cofficent:', cofficent); // debug

    if (area > 0) {
        $('#imprevious_area' + i).val((area * cofficent).toFixed(2));
    } else {
        $('#imprevious_area' + i).val('0');
    }
});

// Area keyup - delegated
$(document).on('keyup', '[id^="area"]', function () {
    let i = $(this).attr('id').replace('area', '');
    let area = $(this).val();
    let runoff = $('#runoff' + i).val();
    console.log('Area keyup | Row:', i, '| Area:', area, '| Runoff:', runoff); // debug

    if (area && runoff) {
        $('#imprevious_area' + i).val((parseFloat(area) * parseFloat(runoff)).toFixed(2));
    } else {
        $('#imprevious_area' + i).val('0');
    }
});
let rainwater_harvesting_capacity = '{{__get_annex_value("project_details", "rainwater_harvesting_capacity", $projectdetails->id)}}'
// $('#harvesting').val(rainwater_harvesting_capacity);

function change_case(c, avg){
    if(rating == 3){
      if(c == 1){
            
            if(avg <= 500){
                $('#case_range').html('Range 1')
                let val = (avg * (6/100));
                $('#oneday').val((val).toFixed(3))
            }
            if(avg >= 501 && avg <= 700){
                $('#case_range').html('Range 2')
                let val = (avg * (4.5/100));
                $('#oneday').val((val).toFixed(3))
            }
            if(avg > 701 ){
                $('#case_range').html('Range 3')
                let val = (avg * (3/100));
                $('#oneday').val((val).toFixed(3))
            }
        }

        if(c == 2){
            if(avg <= 500){
                $('#case_range').html('Range 1')
                let val = (avg * (6/100));
                $('#oneday').val((val).toFixed(3))
            }
            if(avg >= 501 && avg <= 700){
                $('#case_range').html('Range 2')
                let val = (avg * (4.5/100));
                $('#oneday').val((val).toFixed(3))
            }
            if(avg > 701 ){
                $('#case_range').html('Range 3')
                let val = (avg * (3/100));
                $('#oneday').val((val).toFixed(3))
            }
        }  
    }
    else {
            if(c == 1){
            if(avg <= 250){
                $('#case_range').html('Range 1')
                let val = (avg * (9/100))/1000;
                $('#oneday').val((val).toFixed(3))
            }
            if(avg >= 251 && avg <= 350){
                $('#case_range').html('Range 2')
                let val = (avg * (7.5/100))/1000;
                $('#oneday').val((val).toFixed(3))
            }
            if(avg >= 351 && avg <= 500){
                $('#case_range').html('Range 3')
                let val = (avg * (6/100))/1000;
                $('#oneday').val((val).toFixed(3))
            }
            if(avg >= 501 && avg <= 700){
                $('#case_range').html('Range 4')
                let val = (avg * (4.5/100))/1000;
                $('#oneday').val((val).toFixed(3))
            }
            if(avg > 701 ){
                $('#case_range').html('Range 5')
                let val = (avg * (3/100))/1000;
                $('#oneday').val((val).toFixed(3))
            }
        }

        if(c == 2){
            if(avg <= 250){
                $('#case_range').html('Range 1')
                $('#oneday').val(0)
            }
            if(avg >= 251 && avg <= 350){
                $('#case_range').html('Range 2')
                $('#oneday').val(0)
            }
            if(avg >= 351 && avg <= 500){
                $('#case_range').html('Range 3')
                $('#oneday').val(0)
            }
            if(avg >= 501 && avg <= 700){
                $('#case_range').html('Range 4')
                $('#oneday').val(0)
            }
            if(avg > 701 ){
                $('#case_range').html('Range 5')
                $('#oneday').val(0)
            }
        }
    }
    
}

$('#case').change(function(){
    var c = $('#case').val();
    let avg = $('#average').val();
    if(rating == 5){
        c = 1;
    }
    change_case(c, avg);
    related_calculations();
});

</script>
@if($activeSubmenu == 'water_conservation')
<script>
let consumption_daily_total = "{{__get_rating_data($projectdetails->id, 'water_conservation', 'annex_wc_three', 'consumption_daily_total', 'water_conservation', $projectdetails->rating_type)}}"

</script>
<script src="{{__backend_asset('js/core/annex.js')}}"></script>
@endif
@if($activeSubmenu == 'sustainable_design')
<script src="{{__backend_asset('js/core/sustainable.js')}}"></script>
@endif
@if($activeMenu == 'water_efficent_plumbing_fixtures')
<script src="{{__backend_asset('js/core/water-conversation.js')}}"></script>
@endif
@if($activeSubmenu == 'material_resources')
<script src="{{__backend_asset('js/core/material_calculation.js')}}"></script>
@endif

@if($activeSubmenu == 'indoor_enviornment_quality')
<script src="{{__backend_asset('js/core/energy-ac-annex.js')}}"></script>
<script src="{{__backend_asset('js/core/energy-non-ac-annex.js')}}"></script>
<script src="{{__backend_asset('js/core/energy-acoustic.js')}}"></script>
<script src="{{__backend_asset('js/core/indoor-enviornment.js')}}"></script>

@endif
@if($activeSubmenu == 'indoor_enviornment_quality' && $activeMenu == 'annexure_non_ac_fresh_air')
<script src="{{__backend_asset('js/core/annex_non_ac_air.js')}}"></script>
@endif
@if($activeSubmenu == 'energy_efficency' || $activeSubmenu == 'material_resources' || $activeSubmenu == 'indoor_environment' ||  $activeSubmenu == 'resident_health_wellbeing' || $activeSubmenu == 'energy_efficiency' || $activeSubmenu == 'health_comfort' || $activeSubmenu == 'innovation_performance' || $activeSubmenu == 'sustainable_design' || $activeSubmenu == 'minimum_energy_performance' ||  $activeSubmenu == 'water_conservation' || $activeSubmenu == 'sustainable_landscape_design' || $activeSubmenu == 'indoor_enviornment' || $activeSubmenu == 'indoor_environment' || $activeSubmenu == 'innovation_development' )
<script src="{{__backend_asset('js/core/energy-lighting.js')}}"></script>
<script src="{{__backend_asset('js/core/air_conditioner.js')}}"></script>
<script src="{{__backend_asset('js/core/interiorhome.js')}}"></script>
<script src="{{__backend_asset('js/core/existing_building.js')}}"></script>
<script src="{{__backend_asset('js/core/factory.js')}}"></script>
@endif

@if($activeSubmenu == 'innovation_interior_design')
<script src="{{__backend_asset('js/core/innovation.js')}}"></script>
@endif
@if($rating_type[0] == 1)
<script src="{{__backend_asset('js/core/new-building.js')}}"></script>

@endif
@endpush

@push('PAGE_SCRIPTS')
<script>
     
const landscape_details_adaptive_tolerant_builtup = "{{__get_rating_data($projectdetails->id, 'project_details', 'landscape_details', 'landscape_details_adaptive_tolerant_builtup', 'sustainable_design', $projectdetails->rating_type)}}";
const landscape_details_adaptive_tolerant = "{{__get_rating_data($projectdetails->id, 'project_details', 'landscape_details', 'landscape_details_adaptive_tolerant', 'sustainable_design', $projectdetails->rating_type)}}";
</script>
@if($activeSubmenu == 'water_conservation')
    <script>
            let buildup_area = '{{$projectdetails->total_builtup_area_insqm}}';
            let aplicability = '{{__check_project_applicability($projectdetails->id)}}';
            let landscape_details_total_area_landscape = "{{__get_rating_data($projectdetails->id, 'project_details', 'landscape_details', 'landscape_details_total_area_landscape', 'sustainable_design', $projectdetails->rating_type)}}"
            let landscape_details_total_area_turf = "{{__get_rating_data($projectdetails->id, 'project_details', 'landscape_details', 'landscape_details_total_area_turf', 'sustainable_design', $projectdetails->rating_type)}}"
            let landscape_details_adaptive_turf = "{{__get_rating_data($projectdetails->id, 'project_details', 'landscape_details', 'landscape_details_adaptive_turf', 'sustainable_design', $projectdetails->rating_type)}}"
            let landscape_details_builtup = "{{__get_rating_data($projectdetails->id, 'project_details', 'landscape_details', 'landscape_details_builtup', 'sustainable_design', $projectdetails->rating_type)}}"
            let landscape_details_turf_builtup = "{{__get_rating_data($projectdetails->id, 'project_details', 'landscape_details', 'landscape_details_turf_builtup', 'sustainable_design', $projectdetails->rating_type)}}"
            let landscape_details_turf_adaptive_tolerant_builtup = "{{__get_rating_data($projectdetails->id, 'project_details', 'landscape_details', 'landscape_details_turf_adaptive_tolerant_builtup', 'sustainable_design', $projectdetails->rating_type)}}"
            let landscape_details_area_vertical_landscape = "{{__get_rating_data($projectdetails->id, 'project_details', 'landscape_details', 'landscape_details_area_vertical_landscape', 'sustainable_design', $projectdetails->rating_type)}}"
            let landscape_details_area_vrticl_adptv_tolrant_landscape = "{{__get_rating_data($projectdetails->id, 'project_details', 'landscape_details', 'landscape_details_area_vrticl_adptv_tolrant_landscape', 'sustainable_design', $projectdetails->rating_type)}}"
            let site_area_total = "{{__get_rating_data($projectdetails->id, 'project_details', 'project_details', 'site_area', 'sustainable_design', $projectdetails->rating_type)}}"
            let area_fruit = $('#area_fruit_vegetable').val();
            let exotic_grd_area = "{{__get_rating_data($projectdetails->id, 'project_details', 'landscape_details', 'exotic_grd_area', 'sustainable_design', $projectdetails->rating_type)}}"
            let truf_builtup_area = "{{__get_rating_data($projectdetails->id, 'project_details', 'landscape_details', 'truf_built_up_area', 'sustainable_design', $projectdetails->rating_type)}}"
            let landscape_details_tolrent_builtup = "{{__get_rating_data($projectdetails->id, 'project_details', 'landscape_details', 'landscape_details_adaptive_tolerant', 'sustainable_design', $projectdetails->rating_type)}}";
     
            let project_turf = (parseFloat(exotic_grd_area) + parseFloat(truf_builtup_area))/(parseFloat(landscape_details_total_area_landscape) + parseFloat(landscape_details_builtup) + parseFloat(landscape_details_area_vertical_landscape));
            let project_drought = (parseFloat(landscape_details_adaptive_tolerant) + parseFloat(landscape_details_tolrent_builtup) + parseFloat(landscape_details_area_vrticl_adptv_tolrant_landscape))/(parseFloat(landscape_details_total_area_landscape) + parseFloat(landscape_details_builtup) + parseFloat(landscape_details_area_vertical_landscape));
            let project_fruit = 0;
            if(area_fruit){
                project_fruit += (parseFloat(area_fruit))/(parseFloat(landscape_details_total_area_landscape) + parseFloat(landscape_details_builtup) + parseFloat(landscape_details_area_vertical_landscape));
            }

            if(aplicability){
                let rating = '{{$rating_type[0]}}';
                $('#land_design_applicability').val('Yes');
                $('#div_project_turf').show();
                $('#project_turf').val((project_turf*100).toFixed(2));
                $('#project_drought').val((project_drought*100).toFixed(2));
                $('#project_fruit').val((project_fruit*100).toFixed(2));

                $('#div_project_drought').show();
                if(rating == 2){
                    $('#div_project_fruit').show();
                    $('#div_area_fruit_vegetable').show();
                }else{
                    $('#div_project_fruit').hide();
                    $('#div_area_fruit_vegetable').hide();
                }
            
            }else{
                $('#land_design_applicability').val('Yes');
                // $('#div_project_turf').hide();
                // $('#div_project_drought').hide();
                // $('#div_project_fruit').hide();
                // $('#div_area_fruit_vegetable').hide();
            }

            $('#area_fruit_vegetable').keyup(function(){
            let area = $('#area_fruit_vegetable').val();

            let area_project_fruit = (parseFloat(area))/(parseFloat(landscape_details_total_area_landscape) + parseFloat(landscape_details_builtup) + parseFloat(landscape_details_area_vertical_landscape));
            $('#project_fruit').val((area_project_fruit*100).toFixed(2));

            });

            let irrigation_applicability = ((parseFloat(landscape_details_total_area_landscape) + parseFloat(landscape_details_builtup) + parseFloat(landscape_details_area_vertical_landscape))/parseFloat(site_area_total))*100;
            
            if(buildup_area < 10000 && irrigation_applicability > 10 ){
                $('#irrigation_system_applicablity').val('Yes');
            }else if(buildup_area > 10000 && irrigation_applicability > 8 ){
                $('#irrigation_system_applicablity').val('Yes');
            }else{
                $('#irrigation_system_applicablity').val('No');
            }

    </script>
@endif
<script>

        $(window).scroll(function(e){ 
            var $el = $('.postion-state'); 
            var isPositionFixed = ($el.css('position') == 'fixed');
            if ($(this).scrollTop() > 53 && !isPositionFixed){ 
                $el.css({'position': 'sticky', 'top': '50px'}); 
            }
            if ($(this).scrollTop() < 53 && isPositionFixed){
                $el.css({'position': 'static', 'top': '50px'}); 
            } 
        });
        $(document).ready(function(e){ 
            var $el = $('.postion-state'); 
            var isPositionFixed = ($el.css('position') == 'fixed');
            if ($(this).scrollTop() > 53 && !isPositionFixed){ 
                $el.css({'position': 'sticky', 'top': '50px'}); 
            }
            if ($(this).scrollTop() < 53 && isPositionFixed){
                $el.css({'position': 'static', 'top': '50px'}); 
            } 
        });

    @foreach($params as $param)
        @if($param['type'] == 'c')
            $('#{{$param['name']}}').change(function() {
            if(this.checked) {
                $('#{{$param['name']}}_doc').show();
                $('#{{ $param['name'] }}_doc input[type="file"]').val('');
                }else{
                    $('#{{$param['name']}}_doc').hide();
                    $('#{{$param['name']}}_doc').val('');
                    $('#{{$param['name']}}_doc input[type="file"]').val('');


                }
            });

           
        @endif
    @endforeach


 


        jQuery(document).ready(function($) {
        var tabwrapWidth= $('.tabs-wrapper').outerWidth();
        var totalWidth=0;
        jQuery("ul li").each(function() { 
            totalWidth += jQuery(this).outerWidth(); 
        });
        if(totalWidth > tabwrapWidth){
            $('.scroller-btn').removeClass('inactive');
        }
        else{
            $('.scroller-btn').addClass('inactive');
        }

        if($("#scroller").scrollLeft() == 0 ){
            $('.scroller-btn.left').addClass('inactive');
        }
        else{
            $('.scroller-btn.left').removeClass('inactive');
        }
            var liWidth= $('#scroller li').outerWidth();
            var liCount= $('#scroller li').length;
            var scrollWidth = liWidth * liCount;
            
        $('.right').on('click', function(){
            $('.nav-pills').animate({scrollLeft: '+=200px'}, 300);
            console.log($("#scroller").scrollLeft() + " px");
        });
        
        
        $('.left').on('click', function(){
            $('.nav-pills').animate({scrollLeft: '-=200px'}, 300);
        });
        scrollerHide()
        // var activeTab =  $('#scroller li').find(".active");
        // // alert(activeTab.outerWidth()) 
        // console.log(totalWidth) 
        
        // if (activeTab.length > 0) {
        //     var activeTabPosition = activeTab.position().left;
        //     var containerScrollLeft = $('.nav-pills').scrollLeft();
        //     var scrollOffset = totalWidth - scrollWidth - activeTab.outerWidth();
        //     console.log(totalWidth-scrollOffset) 

        //     $('.nav-pills').animate({ scrollLeft: '+=' + scrollOffset }, 1000);
        // }

        setTimeout(function() {
        var activeTab = $('#scroller li').find(".active");
        // alert(activeTab.length)
        if (activeTab.length > 0) {
            var activeTabOffset = activeTab.offset().left;
            var containerOffset = $('.nav-pills').offset().left;
            var scrollOffset = activeTabOffset - containerOffset;
            // alert(activeTabOffset)
            // var containerScrollLeft = $('.nav-pills').scrollLeft();
            // var scrollOffset = activeTabWidth - containerScrollLeft;
            if(scrollOffset > 500){
                $('.nav-pills').animate({ scrollLeft: '+=' + scrollOffset }, 1000);
            }
        }
    }, 500);
        function scrollerHide(){
            var scrollLeftPrev = 0;
            $('#scroller').scroll(function () {
                var $elem=$('#scroller');
                var newScrollLeft = $elem.scrollLeft(),
                    width=$elem.outerWidth(),
                    scrollWidth=$elem.get(0).scrollWidth;
                if (scrollWidth-newScrollLeft==width) {
                    $('.right.scroller-btn').addClass('inactive');
                }
                else{

                    $('.right.scroller-btn').removeClass('inactive');
                }
                if (newScrollLeft === 0) {
                $('.left.scroller-btn').addClass('inactive');
                }
                else{

                    $('.left.scroller-btn').removeClass('inactive');
                }
                scrollLeftPrev = newScrollLeft;
            });
        }
    });

    @foreach($params as $param)
        @if($param['type'] == 'u')
        $('#{{$param['name']}}_btn').click(function() {
            let param = '{{$param['name']}}[]';
            let newRow = '<tr> <td><input type="file"   class="file-input__input fileInput" value=""><div class="progressBar"><div class="progress"></div></div><input type="hidden"   class="file-input__input  fileInputUrl"   name="'+param+'"  value=""><span class="form-text text-danger">{{$errors->first('+param+')}}</span></td><td></td><td></td><td><a class="btn btn-grey {{$param['name']}}_remove_btn" data-container="body" data-toggle="tooltip" data-placement="bottom" data-theme="dark" title=""  data-original-title="Delete"><i class="fa fa-times" aria-hidden="true"></i></a></td></tr>';
            $("#{{$param['name']}}_table").append(newRow);
        });
        $('.delete_{{$param['name']}}').click(function() {
            var rowCount = $('#{{$param['name']}}_table tbody tr').length;
            
            if(rowCount > 1){
                let id = $(this).attr('data-id');
                    Swal.fire({
                    title: 'Are you sure?',
                    text: "You won't be able to revert this!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Yes, Delete the Document!',
                    showClass: {
                        popup: 'animate__animated animate__fadeIn'
                    },
                    customClass: {
                        confirmButton: 'btn btn-primary',
                        cancelButton: 'btn btn-outline-danger ml-1'
                    },
                    buttonsStyling: false
                    }).then(function(result) {
                        if (result.value) {

                            $.ajax({
                                type: "post",
                                url: "{{ route('documentdelete') }}",
                                data: {
                                    id: id,
                                },
                                datatype: JSON
                            }).done(function(response) {
                                if (response.status == "success") {
                                    //  toastr.error("Oops... some error occured! Please try again later.", "Membership Directory");
                                    JsUtility.showToastr("success", "Document",
                                        "Success! Document Deleted");
                                    // window.reload();
                                    // $('#mail').modal('toggle');
                                    location.reload();
                                } else {
                            
                                    JsUtility.showToastr("error", "Document",
                                        "Success! Some error occured, please try again");
                                }
                            });
                        }

                    });
            }else{
                JsUtility.showToastr("error", "Document",
                                        "This Document can't be deleted! Minimum One document is required");
            }
        });
        $('.edit_{{$param['name']}}').click(function() {
         
            let id = $(this).attr('data-id');
            $('#doc_id').val(id);
            $('#image_update').modal('toggle');

        });
        $("#{{$param['name']}}_table").on('click','.{{$param['name']}}_remove_btn',function(){
            $(this).parent().parent().remove();
        });
       
        @endif
        @if($param['type'] == 'M')
        $('#{{$param['name']}}_btn_others').click(function() {
            let param = 'other_documents[]';
            var newRow = '<tr> <td><input type="text" class="form-control" id="document_name" name="document_name[]" placeholder="Enter Document Name" value="{{old("document_name[]")}}"><span class="form-text text-danger">{{$errors->first('+param+')}}</span></td><td><input type="file"   class="file-input__input"  name="'+param+'"  value=""><span class="form-text text-danger">{{$errors->first('+param+')}}</span></td><td></td><td><a class="btn btn-grey {{$param['name']}}_remove_btn_others" data-container="body" data-toggle="tooltip" data-placement="bottom" data-theme="dark" title="" data-original-title="Delete"><i class="fa fa-times" aria-hidden="true"></i></a></td></tr>';
            $("#{{$param['name']}}_table_others").append(newRow);
        });
        $('.delete_others_{{$param['name']}}').click(function() {
            var rowCount = $('#{{$param['name']}}_table_others').length;
            
            if(rowCount){
                let id = $(this).attr('data-id');
                    Swal.fire({
                    title: 'Are you sure?',
                    text: "You won't be able to revert this!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Yes, Delete the Document!',
                    showClass: {
                        popup: 'animate__animated animate__fadeIn'
                    },
                    customClass: {
                        confirmButton: 'btn btn-primary',
                        cancelButton: 'btn btn-outline-danger ml-1'
                    },
                    buttonsStyling: false
                    }).then(function(result) {
                        if (result.value) {

                            $.ajax({
                                type: "post",
                                url: "{{ route('documentdelete') }}",
                                data: {
                                    id: id,
                                },
                                datatype: JSON
                            }).done(function(response) {
                                if (response.status == "success") {
                                    //  toastr.error("Oops... some error occured! Please try again later.", "Membership Directory");
                                    JsUtility.showToastr("success", "Document",
                                        "Success! Document Deleted");
                                    // window.reload();
                                    // $('#mail').modal('toggle');
                                    location.reload();
                                } else {
                            
                                    JsUtility.showToastr("error", "Document",
                                        "Success! Some error occured, please try again");
                                }
                            });
                        }

                    });
            }else{
                JsUtility.showToastr("error", "Document",
                                        "This Document can't be deleted! Minimum One document is required");
            }
        });
        $('.edit_others_{{$param['name']}}').click(function() {
         
            let id = $(this).attr('data-id');
            $('#doc_id').val(id);
            $('#image_update').modal('toggle');

        });
        $("#{{$param['name']}}_table_others").on('click','.{{$param['name']}}_remove_btn_others',function(){
            $(this).parent().parent().remove();
        });
       
        @endif
    @endforeach
     
    function reject() {
            
        $('#image-upload').validate({
                        rules: {
                            'image_update': {
                                required: true
                            }
                        }
                    });
            if(!$('#image-upload').valid()){ 
            
            // $("#error_remarks").css("display","block");
        
            }else{

            
                Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Update it!',
            showClass: {
                popup: 'animate__animated animate__fadeIn'
            },
            customClass: {
                confirmButton: 'btn btn-primary',
                cancelButton: 'btn btn-outline-danger ml-1'
            },
            buttonsStyling: false
            }).then(function(result) {
                if (result.value) {
                
                    $(".btn-reject").prop('disabled', true);
                    $('.btn-reject').html("Loading....");   
                    var formData = new FormData($('#image-upload')[0]); // Initialize FormData with form element directly
                        console.log(formData);
                    $.ajax({
                        type: "POST",
                        url: "{{ route('documentupdate') }}",
                        data: formData,
                        contentType: false,
                        processData: false,
                    }).done(function(response) {
                        if (response.status == "success") {
                            //  toastr.error("Oops... some error occured! Please try again later.", "Membership Directory");
                            JsUtility.showToastr("success", "Document",
                                "Success! Document Updated Successfully");
                            
                            $('#image_update').modal('toggle');
                            location.reload();
                        } else {
                            //JsUtility.showToastr("error", "Projects","Error! Some error occured, please try again.");

                            $("#btn-reject").prop('disabled', false);
                            $('.btn-reject').html("Update");   

                            JsUtility.showToastr("error", "Document",
                                "Success! Some error occured, please try again");
                        }
                    });
                }

            });

            

        }

    }

</script>

<script>
     $('.sBtn-text').mouseenter(function() {
      //  $(this).find('.select-btn').trigger("click")
        $(this).parent().parent().addClass('active');
        $("#"+$(this).attr('data-item-target')).removeClass('d-none');
        $(this).find('.dropdown-menu').addClass('active');
      }
    //   , function() {
    //     //$(this).parent().parent().removeClass('active');

    //     $(this).find('.dropdown-menu').removeClass('active');
    //   }
      );
      $('.custom-dropdown-js').mouseleave(function () {
     //   alert("hii")

        $(this).find('.select-menu').removeClass('active');
      })

            

</script>

<script>


    let building_footprint = $('#building_footprint').val();
    let rock_total_site_area = $('#rock_total_site_area').val();
    let area_retainted_natural_rock = $('#area_retainted_natural_rock').val();
    let retainted_natural_rock_percent = (parseFloat(area_retainted_natural_rock)/(parseFloat(rock_total_site_area) - parseFloat(building_footprint)))*100;
    $('#retainted_natural_rock_percent').val(Math.abs(retainted_natural_rock_percent.toFixed(2)));
    console.log(retainted_natural_rock_percent);

    let natural_topography_no_of_existing_trees = parseFloat($('#natural_topography_no_of_existing_trees').val()) || 0;
    let natural_topography_no_of_preserved_trees = parseFloat($('#natural_topography_no_of_preserved_trees').val()) || 0;
    let preserved_trees_percent = (parseFloat(natural_topography_no_of_preserved_trees) /  parseFloat(natural_topography_no_of_existing_trees)) * 100;
    $('#preserved_trees_percent').val(Math.abs(preserved_trees_percent.toFixed(2)));
    console.log(preserved_trees_percent);

    let area_retainted_site_countour = $('#area_retainted_site_countour').val();
    let countour_site_area = $('#countour_site_area').val();
    let by_percent2 = (parseFloat(area_retainted_site_countour)/parseFloat(countour_site_area))*100;
    $('#retainted_site_countour_percent').val(Math.abs(by_percent2.toFixed(2)));

    let area_retained_topography = $('#area_retained_topography').val();
    let total_site_area = $('#total_site_area').val();
    let retained_percent = (parseFloat(area_retained_topography)/parseFloat(total_site_area))*100;
    $('#retained_percent').val(Math.abs(retained_percent.toFixed(2)));

    let projects_details_ev_fourwheel = $('#projects_details_ev_fourwheel').val();
    let projects_details_four_wheel = $('#projects_details_four_wheel').val();
    let four_parking_percent = (parseFloat(projects_details_ev_fourwheel)/parseFloat(projects_details_four_wheel))*100;
    $('#four_parking_percent').val(Math.abs(four_parking_percent.toFixed(2)));
    console.log(four_parking_percent);

    let projects_details_ev_twowheel = $('#projects_details_ev_twowheel').val();
    let projects_details_two_wheel = $('#projects_details_two_wheel').val();
    let two_parking_percent = (parseFloat(projects_details_ev_twowheel)/parseFloat(projects_details_two_wheel))*100;
    $('#two_parking_percent').val(Math.abs(two_parking_percent.toFixed(2)));
    console.log(two_parking_percent);

    //let landscape_details_adaptive_tolerant = $('#landscape_details_adaptive_tolerant').val();
    // let landscape_details_adaptive_tolerant_builtup = $('#landscape_details_adaptive_tolerant_builtup').val();
    let landscape_details_area_vrticl_adptv_tolrant_landscape = $('#landscape_details_area_vrticl_adptv_tolrant_landscape').val();
    let landscape_details_turf_adaptive_tolerant_builtup = $('#landscape_details_turf_adaptive_tolerant_builtup').val();
    let natural_topography_area_retained_natural = $('#natural_topography_area_retained_natural').val();
    let natural_topography_area_water_bodies_channels = $('#natural_topography_area_water_bodies_channels').val();

    // let caseb_natural_topography_nb_2 = ((parseFloat(landscape_details_adaptive_tolerant)) + (parseFloat(landscape_details_turf_adaptive_tolerant_builtup)) + (parseFloat(natural_topography_area_retained_natural)) + (parseFloat(natural_topography_area_water_bodies_channels)))/ (parseFloat(total_site_area))*100;
    // $('#caseb_natural_topography_nb_2').val(Math.abs(caseb_natural_topography_nb_2.toFixed(2)));

    // let caseb_natural_topography_nb = ((parseFloat(landscape_details_adaptive_tolerant)) + (parseFloat(natural_topography_area_retained_natural)) + (parseFloat(natural_topography_area_water_bodies_channels)))/ (parseFloat(total_site_area))*100;
    // $('#caseb_natural_topography_nb').val(Math.abs(caseb_natural_topography_nb.toFixed(2)));
    // console.log(caseb_natural_topography_nb);

    let adaptive = $('#adaptive').val();
    let preserved = $('#preserved').val();
    let site_area = $('#site_area').val();
    let trees_per_acre = parseFloat(adaptive) + parseFloat(preserved) / (parseFloat(site_area))*4046;
    $('#trees_per_acre').val(Math.abs(trees_per_acre.toFixed(2)));
    console.log(trees_per_acre);

    let applicability = (parseFloat(landscape_details_adaptive_tolerant) + parseFloat(landscape_details_adaptive_tolerant_builtup) + parseFloat(landscape_details_area_vrticl_adptv_tolrant_landscape) / parseFloat(total_site_area))*100;
    $('#applicability').val(Math.abs(applicability.toFixed(2)));
    console.log(applicability);



    // const annualconsum = {{ $totalannualconsumptionlpds ?? 0 }};
    // console.log(annualconsum);
    // let energy_generation_renewables = $('#energy_generation_renewables').val();
    // console.log(energy_generation_renewables);
    // let  totalEnergy = (parseFloat(energy_generation_renewables)/parseFloat(annualconsum))*100;
    // $('#energy_percentage_renaw').val(totalEnergy.toFixed(2));
    // console.log(totalEnergy);
    const annualconsum = {{ $totalannualconsumptionlpds ?? 0 }};
    console.log(annualconsum,"annualconsum");
    const occupancygreen = {{ $occupancygreen ?? 0 }};
    console.log(occupancygreen,"occupancygreen");

    // function to calculate
    function calculateEnergyPercentage() {
        let energy_generation_renewables = parseFloat($('#energy_generation_renewables').val()) || 0;
        let proposedtotalannual = parseFloat($('#proposed_total_annual').val()) || 0;
        let proposed_alt_water_heating_system = parseFloat($('#proposed_alt_water_heating_system').val()) || 0;
        let occupancy_green = parseFloat($('#occupancy_green').val()) || 0;
        console.log(energy_generation_renewables, "energy_generation_renewables");
        let totalEnergy = (energy_generation_renewables / proposedtotalannual) * 100;
        $('#energy_percentage_renaw').val(totalEnergy.toFixed(2));
       
        console.log(occupancy_green, "occupancy_green");
        let denominator = 0.02 * (parseFloat(occupancygreen) || 1);
        console.log(denominator, "denominator");
        console.log(proposed_alt_water_heating_system, "proposed_alt_water_heating_system");
        let totalproductofoccupancy = (parseFloat(proposed_alt_water_heating_system) / denominator) * 100;
        console.log(totalproductofoccupancy, "totalproductofoccupancy");
        $('#hot_water_requ').val(totalproductofoccupancy.toFixed(2));


    }

    calculateEnergyPercentage();

    $('#energy_generation_renewables, #proposed_alt_water_heating_system').on('input', function() {
        calculateEnergyPercentage();
    });


</script>

<script>
    $('#finalSubmit').click(function(){
       let show = '{{$show}}';
        if(1 == 1){
            Swal.fire({
    title: 'Warning',
    text: "Do you want to submit the project? Once it is submitted, you can't edit it.",
    icon: 'warning',
    showCancelButton: true, // 👈 Enable cancel button
    confirmButtonText: 'Ok',
    cancelButtonText: 'Cancel',
    allowOutsideClick: false, // 👈 Prevent closing by clicking outside
    allowEscapeKey: false, // 👈 Prevent closing with ESC
    showClass: {
        popup: 'animate__animated animate__fadeIn'
    },
    customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-outline-danger ml-1'
    },
    buttonsStyling: false
        }).then(function(result) {
            if (result.isConfirmed) { // 👈 Run only when confirmed
                $.ajax({
                    type: "post",
                    url: "{{ route('finalSubmit') }}",
                    data: {
                        id: '{{$certficateDeatils->id}}',
                        _token: "{{ csrf_token() }}" // 👈 Always include CSRF in POST
                    },
                    dataType: "json"
                }).done(function(response) {
                    if (response.status == "success") {
                        JsUtility.showToastr("success", "Certificate", "Success! Application Submitted Successfully");
                        location.reload();
                    } else {
                        JsUtility.showToastr("error", "Document", response.message);
                    }
                });
            }
        });

        }else{
            Swal.fire({
                    title: 'Warning',
                    text: "All required credits are not completed",
                    icon: 'warning',
                    showCancelButton: false,
                    confirmButtonText: 'Ok',
                    showClass: {
                        popup: 'animate__animated animate__fadeIn'
                    },
                    customClass: {
                        confirmButton: 'btn btn-primary',
                        cancelButton: 'btn btn-outline-danger ml-1'
                    },
                    buttonsStyling: false
                    }).then(function(result) {
                        if (result.value) {
                            // $('#{{$subtab['sub_slug']}}_input').val('');
                           
                        }
                    });
        }
    });

    $(':input[type="number"]').keyup(function (e) { 
        const number = e.currentTarget.value;
        const decimalIndex = number.toString().indexOf('.');
        const value = decimalIndex >= 0 ? number.toString().length - decimalIndex - 1 : 0;
        if(value > 2){
            e.currentTarget.value = parseFloat(e.currentTarget.value.replace(/(\.[\d]{2})./g, '$1'));
        }
     });
</script>
    <!-- Material annex two script-->
{{-- <script>
    $('.generated').keyup(function(e){
        var ek = $('.generated').map((_,el) => el.value).get()
        console.log(ek);
        let count = 0;
        var sum = ek.reduce((pv,cv)=>{
            if(cv >= 0 && cv != '') count +=1;
            return pv + (parseFloat(cv)||0);
        },0);

        if (sum && !isNaN(sum) && parseFloat(sum) !== 0) {
            $('#total_generated').val(sum.toFixed(2));
        } else {
            $('#total_generated').val('');
        }
        related_calculations();
    });

    $('.reused').keyup(function(e){
        var ek = $('.reused').map((_,el) => el.value).get()
        console.log(ek);
        let count = 0;
        var sum = ek.reduce((pv,cv)=>{
            if(cv >= 0 && cv != '') count +=1;
            return pv + (parseFloat(cv)||0);
        },0);


        if (sum && !isNaN(sum) && parseFloat(sum) !== 0) {
            $('#total_reused').val(sum.toFixed(2));
        } else {
            $('#total_reused').val('');
        }
        // change_case(c, avg);
        related_calculations();
    });

function related_calculations(){
    let total_reused = $('#total_reused').val();
    let total_generated = $('#total_generated').val();
    if (total_reused && total_generated && !isNaN(total_reused) && !isNaN(total_generated) && parseFloat(total_generated) !== 0) {
        let percentage_waste_diverted_landfill = (parseFloat(total_reused) / parseFloat(total_generated)) * 100;
        let rounded_percentage = Math.round(percentage_waste_diverted_landfill);
        $('#percentage_waste_diverted_landfill').val(rounded_percentage);
    } else {
        // Set to zero or empty string if values are not valid
        $('#percentage_waste_diverted_landfill').val('');
    }

}

related_calculations();
</script> --}}
<script>
    // WASTE DIVERTED CALCULATOR - Works with dynamic/new rows
// Replace the old script with this one

$(document).ready(function() {
    
    const WasteCalculator = {
        
        // Calculate total generated
        calculateTotalGenerated: function() {
            const generatedSum = $('.generated')
                .map((_, el) => parseFloat(el.value) || 0)
                .get()
                .reduce((sum, val) => sum + val, 0);
            
            $('#total_generated').val(generatedSum.toFixed(2));
            console.log('Total Generated:', generatedSum);
            return generatedSum;
        },
        
        // Calculate total reused
        calculateTotalReused: function() {
            const reusedSum = $('.reused')
                .map((_, el) => parseFloat(el.value) || 0)
                .get()
                .reduce((sum, val) => sum + val, 0);
            
            $('#total_reused').val(reusedSum.toFixed(2));
            console.log('Total Reused:', reusedSum);
            return reusedSum;
        },
        
        // Calculate percentage waste diverted
        calculateWasteDivertedPercentage: function() {
            const totalGenerated = parseFloat($('#total_generated').val()) || 0;
            const totalReused = parseFloat($('#total_reused').val()) || 0;
            
            if (totalGenerated > 0 && totalReused > 0) {
                const percentage = (totalReused / totalGenerated) * 100;
                const roundedPercentage = Math.round(percentage);
                $('#percentage_waste_diverted_landfill').val(roundedPercentage);
                console.log('Waste Diverted %:', roundedPercentage);
            } else {
                $('#percentage_waste_diverted_landfill').val('0');
            }
        },
        
        // Master update function
        updateAll: function() {
            this.calculateTotalGenerated();
            this.calculateTotalReused();
            this.calculateWasteDivertedPercentage();
        }
    };
    
    // =======================
    // EVENT LISTENERS - Works with dynamic rows
    // =======================
    
    // When .generated input changes (including new rows added dynamically)
    $(document).on('keyup change', '.generated', function() {
        console.log('Generated field changed');
        WasteCalculator.updateAll();
    });
    
    // When .reused input changes (including new rows added dynamically)
    $(document).on('keyup change', '.reused', function() {
        console.log('Reused field changed');
        WasteCalculator.updateAll();
    });
    
    // Initial calculation on page load
    WasteCalculator.updateAll();
});
</script>

{{-- added by vikas --}}
 <script>
    $(document).ready(function () {
  for (let i = 1; i <= 15; i++) {

    $('.one_materials' + i).change(function () {
      let id = $(this).val();
      if (id === 'material_other') {
        $('.material_other' + i).show();
      } else {
        $('.material_other' + i).hide().val('');
      }
    });
    if ($('.one_materials' + i).val() === 'material_other') {
      $('.material_other' + i).show();
    }

    $('.materials' + i).change(function () {
      let id = $(this).val();
      if (id === 'material_other') {
        $('.material_other' + i).show();
      } else {
        $('.material_other' + i).hide().val('');
      }
    });

    if ($('.materials' + i).val() === 'material_other') {
      $('.material_other' + i).show();
    }

    $('.recycle_used' + i).change(function () {
      let id = $(this).val();
      if (id === 'others') {
        $('.used_other' + i).show();
      } else {
        $('.used_other' + i).hide();
      }
    });

    if ($('.recycle_used' + i).val() === 'others') {
      $('.used_other' + i).show();
    }

  }
});

 </script>

@php
    $spaceTypes = [];
    for ($i = 1; $i <= 12; $i++) {
        $spaceTypes[$i] = get_space_type_constants($i);
    }

@endphp

<script>
    const spaceTypes = @json($spaceTypes);

    for (let i = 1; i <= 6; i++) {
        $('.space_type' + i).change(function () {
            let space_type = $('.space_type' + i).val();
            var value = spaceTypes[space_type];
            if(value){
                $('#outdoor_air_rate' + i).val(value['ra']);
                $('#outdoor_air_rate_person' + i).val(value['rp']);

                let carValue = $('#carpet_area' + i).val();
                let ocuValue = $('#design_occupancy' + i).val();

                let totalVal = (carValue*value['ra']) + (ocuValue*value['rp']);

                $('#ventilation_baseline' + i).val(totalVal);
                $('#ventilation_required' + i).val(totalVal * 1.1);
            }else{
                $('#outdoor_air_rate' + i).val('');
                $('#outdoor_air_rate_person' + i).val('');

                $('#ventilation_baseline' + i).val('');
                $('#ventilation_required' + i).val('');
            }
            
            calculate_fresh_ac(); 

        });

        $('.carpet_area' + i).on('keyup', function () {
            let carValue = $('.carpet_area' + i).val();
            let ocuValue = $('.design_occupancy' + i).val();
            let raVal = $('#outdoor_air_rate' + i).val();
            let rpVal = $('#outdoor_air_rate_person' + i).val();
           
            let totalVal = (carValue*raVal) + (ocuValue*rpVal);

            $('#ventilation_baseline' + i).val(totalVal);
            $('#ventilation_required' + i).val(totalVal * 1.1);
            calculate_fresh_ac();
        });

        $('.design_occupancy' + i).on('keyup', function () {
            let carValue = $('.carpet_area' + i).val();
            let ocuValue = $('.design_occupancy' + i).val();
            let raVal = $('#outdoor_air_rate' + i).val();
            let rpVal = $('#outdoor_air_rate_person' + i).val();
           
            let totalVal = (carValue*raVal) + (ocuValue*rpVal);

            $('#ventilation_baseline' + i).val(totalVal.toFixed(2));
            $('#ventilation_required' + i).val((totalVal * 1.1).toFixed(2));
            calculate_fresh_ac();
        });
    }

    function calculate_fresh_ac(){
        var ek = $('.venbase').map((_,el) => el.value).get()
        var sum = ek.reduce((pv,cv)=>{
            return pv + (parseFloat(cv)||0);
        },0);
        
        $('#fresh_air_requirement').val(sum.toFixed(2));
        
        // let tfa1 = $('#tfa_capacity1').val();
        // let tfa4 = $('#tfa_capacity4').val();
        
        let tfa1 = parseFloat($('#tfa_capacity1').val()) || 0;
        let tfa4 = parseFloat($('#tfa_capacity4').val()) || 0;

        let tfaSum = tfa1 + tfa4;

        $('#fresh_air_ventilation').val(tfaSum.toFixed(2));
        
        let diff = tfaSum - sum;
        let percent = diff/sum;
        
        $('#fresh_air_ventilation_percent').val(percent.toFixed(2));
    }

    calculate_fresh_ac();

    $('#tfa_capacity1').on('keyup', function () {
            calculate_fresh_ac();
    });

    $('#tfa_capacity4').on('keyup', function () {
            calculate_fresh_ac();
    });


        let area = $('#total_carpet_area_sf').val();
        let newarea = area/10.764;

        $('#total_carpet_area_sm').val(newarea.toFixed(2));
    

    
</script>
<script>

    if ($("#eco_freindly_refrigerant").is(":checked")) {
        $("#div_detailed_narrative_energy_efficency").show();
        
        $("#div_declaration_letter_project_owner").show();
        
        $("#div_installed_air_conditioning_systems").show();
        
        $("#div_manufacturer_technical_cutsheet").show();
        $("#div_multiple_geo_photographs").show();
    } else {
        $("#div_detailed_narrative_energy_efficency").hide();
        $("#div_declaration_letter_project_owner").hide();
        $("#div_installed_air_conditioning_systems").hide();
        $("#div_manufacturer_technical_cutsheet").hide();
        $("#div_multiple_geo_photographs").hide();
        $("#multiple_geo_photographs_doc").hide();
        $("#manufacturer_technical_cutsheet_doc").hide();
        $("#installed_air_conditioning_systems_doc").hide();
        $("#declaration_letter_project_owner_doc").hide();
        $("#detailed_narrative_energy_efficency_doc").hide();
    }

    if ($("#halons_free_fire_extinguisher").is(":checked")) {
        $("#div_indicating_quantity_fire_extinguishers").show();
        $("#div_manufacturer_brochure_fire_suppression").show();
        $("#div_geotagged_photographs_fire_suppression").show();
    } else {
        $("#div_indicating_quantity_fire_extinguishers").hide();
        $("#indicating_quantity_fire_extinguishers_doc").hide();
        $("#div_manufacturer_brochure_fire_suppression").hide();
        $("#manufacturer_brochure_fire_suppression_doc").hide();
        $("#div_geotagged_photographs_fire_suppression").hide();
        $("#geotagged_photographs_fire_suppression_doc").hide();
    }
    
    $("#eco_freindly_refrigerant").on("change", function () {
        if ($(this).is(":checked")) {
            $("#div_detailed_narrative_energy_efficency").show();
            $("#div_declaration_letter_project_owner").show();
            $("#div_installed_air_conditioning_systems").show();
            $("#div_manufacturer_technical_cutsheet").show();
            $("#div_multiple_geo_photographs").show();
        } else {
            $("#div_detailed_narrative_energy_efficency").hide();
            $("#div_declaration_letter_project_owner").hide();
            $("#div_installed_air_conditioning_systems").hide();
            $("#div_manufacturer_technical_cutsheet").hide();
            $("#div_multiple_geo_photographs").hide();
        }
    });

    $("#halons_free_fire_extinguisher").on("change", function () {
        if ($(this).is(":checked")) {
            $("#div_indicating_quantity_fire_extinguishers").show();
            $("#div_manufacturer_brochure_fire_suppression").show();
            $("#div_geotagged_photographs_fire_suppression").show();
        } else {
            $("#div_indicating_quantity_fire_extinguishers").hide();
            $("#div_manufacturer_brochure_fire_suppression").hide();
            $("#div_geotagged_photographs_fire_suppression").hide();
        }
    });


    $(function () {
    function calculatePercentage() {
        let provided = parseFloat($("#input_number_of_plants_provided").val()) || 0;
        let required = parseFloat($("#required_number_of_plants").val()) || 0;

        let percentage = 0;
        if (required > 0) {
            percentage = (provided / required) * 100;
        }

        $("#display_percentage_of_indoor_plants_provided").val(percentage.toFixed(2));
    }

    $("#input_number_of_plants_provided, #required_number_of_plants").on("input", calculatePercentage);

    calculatePercentage();
 });
</script>
<script>
    document.querySelectorAll('.creditDropdown').forEach(function(dropdown) {
        const linksMap = JSON.parse(dropdown.dataset.links || "{}");
        const linkDiv = document.getElementById(dropdown.id + "_links");

        function updateLink() {
            const selected = dropdown.value;
            if (linksMap[selected]) {
                linkDiv.innerHTML = `
                    <a href="${linksMap[selected]}" target="_blank" class="btn btn-link">
                        ${selected}
                    </a>
                `;
            } else {
                linkDiv.innerHTML = '';
            }
        }
        dropdown.addEventListener('change', updateLink);

        updateLink();
    });

</script>

<script>
    // ISOLATED MATERIAL CALCULATIONS - Place this at the END of your PAGE_SCRIPTS
    // This code runs independently without affecting other calculations

    $(document).ready(function() {
    
    // =======================
    // MATERIAL COST CALCULATOR
    // =======================
    
    const MaterialCalculator = {
        
        // Calculate individual row totals
        calculateRowTotal: function(rowNumber) {
            const quantity = parseFloat($('#quantity' + rowNumber).val()) || 0;
            const rate = parseFloat($('#rates' + rowNumber).val()) || 0;
            const totalRates = quantity * rate;
            
            $('#total_rates' + rowNumber).val(totalRates.toFixed(2));
            
            // Calculate total_cost_material based on distance
            const distance = parseFloat($('#distance' + rowNumber).val()) || 0;
            if (distance > 500 || distance == '') {
                $('#total_cost_material' + rowNumber).val('0.00');
            } else {
                $('#total_cost_material' + rowNumber).val(totalRates.toFixed(2));
            }
            
            return totalRates;
        },
        
        // Calculate derived costs for a row
        calculateDerivedCosts: function(rowNumber) {
            const totalRates = parseFloat($('#total_rates' + rowNumber).val()) || 0;
            
            // Salvaged Cost
            const salvaged = $('#salvaged' + rowNumber).val();
            if (salvaged === 'yes') {
                $('#salvaged_cost' + rowNumber).val(totalRates.toFixed(2));
            } else {
                $('#salvaged_cost' + rowNumber).val('0.00');
            }
            
            // Reuse Cost
            const reusePercent = parseFloat($('#reuse_material' + rowNumber).val()) || 0;
            const reuseCost = (totalRates * reusePercent) / 100;
            $('#reuse_cost' + rowNumber).val(reuseCost.toFixed(2));
            
            // Ecolabelled Cost
            const ecolabelled = $('#ecolablled' + rowNumber).val();
            if (ecolabelled === 'yes') {
                $('#ecolablled_cost' + rowNumber).val(totalRates.toFixed(2));
            } else {
                $('#ecolablled_cost' + rowNumber).val('0.00');
            }
            
            // Recycled Cost
            const recycledPercent = parseFloat($('#recycled_percent' + rowNumber).val()) || 0;
            const recycledCost = (totalRates * recycledPercent) / 100;
            $('#recycled_cost' + rowNumber).val(recycledCost.toFixed(2));
            
            // Woodbased Cost
            const woodbased = $('#woodbased' + rowNumber).val();
            if (woodbased === 'yes') {
                $('#woodbased_cost' + rowNumber).val(totalRates.toFixed(2));
            } else {
                $('#woodbased_cost' + rowNumber).val('0.00');
            }
            
            // Composite Wood Cost
            const composite = $('#composite_wood' + rowNumber).val();
            if (composite === 'yes') {
                $('#composite_wood_cost' + rowNumber).val(totalRates.toFixed(2));
            } else {
                $('#composite_wood_cost' + rowNumber).val('0.00');
            }
            
            
            // Alternative Material Cost
            const alternative = $('#alternative_material' + rowNumber).val();
            if (alternative === 'yes') {
                $('#alternative_material_cost' + rowNumber).val(totalRates.toFixed(2));
            } else {
                $('#alternative_material_cost' + rowNumber).val('0.00');
            }
        },
        
        // Sum all totals and update summary fields
        updateAllTotals: function() {
            // Sum total_rates -> total_material_cost
            const totalRates = this.sumFieldsByClass('total_rates');
            $('#total_material_cost').val(totalRates.toFixed(2));
            
            // Sum total_cost_material -> total_procured_cost
            const totalProcured = this.sumFieldsByClass('total_cost_material');
            $('#total_procured_cost').val(totalProcured.toFixed(2));
            
            // Sum salvaged_cost -> total_salvage_cost
            const totalSalvage = this.sumFieldsByClass('salvaged_cost');
            $('#total_salvage_cost').val(totalSalvage.toFixed(2));
            
            // Sum reuse_cost -> total_resued_cost
            const totalReuse = this.sumFieldsByClass('reuse_cost');
            $('#total_resued_cost').val(totalReuse.toFixed(2));
            
            // Sum ecolablled_cost -> total_ecolabled_cost
            const totalEcolabelled = this.sumFieldsByClass('ecolablled_cost');
            $('#total_ecolabled_cost').val(totalEcolabelled.toFixed(2));
            
            // Sum recycled_cost -> total_recycled_cost
            const totalRecycled = this.sumFieldsByClass('recycled_cost');
            console.log(totalRecycled);
            $('#total_recycled_cost').val(totalRecycled.toFixed(2));
            
            

            
            if(rating == 5){
                // Sum woodbased_cost -> total_wood_cost
                const totalWood = this.sumFieldsByClass('woodbased_cost_rapid');
                // $('#total_wood_cost').val(totalWood.toFixed(2));
                $('#total_renewable_cost').val(totalWood.toFixed(2));
                
                let totalWoodCost = 0;

                $('.woodbased_cost_rapid').each(function () {
                    const row = $(this).closest('tr');   // adjust if not table
                    const material = row.find('.one_materials_master').val();
                    const cost = parseFloat(row.find('.total_rates').val()) || 0;

                    // check only wood
                    if (material == 2 || material === 'wood') {
                        totalWoodCost += cost;
                    }
                });
                $('#total_wood_cost').val(totalWoodCost.toFixed(2));

            }else{
                const woodbased_cost = this.sumFieldsByClass('woodbased_cost');
                $('#total_wood_cost').val(woodbased_cost.toFixed(2));
                
                const totalcompositewoodcost = this.sumFieldsByClass('composite_wood_cost');
                $('#total_renewable_cost').val(totalcompositewoodcost.toFixed(2));

            }
            
            // Sum composite_cost -> total_renewable_cost
            // const totalComposite = this.sumFieldsByClass('composite_cost');
            // $('#total_renewable_cost').val(totalComposite.toFixed(2));

            
            
            // Sum alternative_material_cost -> total_alternative_cost
            const totalAlternative = this.sumFieldsByClass('alternative_material_cost');
            $('#total_alternative_cost').val(totalAlternative.toFixed(2));
            
            // Calculate percentages
            this.updatePercentages(totalRates);
            
            // Count ecolabelled products
            const ecolabelledCount = $('#ecolablled').filter(function() {
                return $(this).val() === 'yes';
            }).length;
            $('#ecolablled_products').val(ecolabelledCount.toFixed(2));

            let count = 0;
            
            $('.ecolablled').each(function () {
                if ($(this).val() === 'yes') {
                    count++;
                }
            });

            $('#ecolablled_products').val(count);
        },
        
        // Helper: Sum all values from fields with specific class
        sumFieldsByClass: function(className) {
            return $('.' + className).map((_, el) => parseFloat(el.value) || 0)
                .get()
                .reduce((sum, val) => sum + val, 0);
        },
        
        // Calculate and update all percentages
        updatePercentages: function(total) {
            if (total <= 0) {
                $('#local_percent').val('0.00');
                $('#salvage_percent').val('0.00');
                $('#reused_percent').val('0.00');
                $('#recycled_percent').val('0.00');
                $('#wood_percent').val('0.00');
                $('#ecolablled_material_percent').val('0.00');
                $('#alternate_material_percent').val('0.00');
                return;
            }
            var total_wood_cost = parseFloat($('#total_wood_cost').val()) || 0;
            var total_renewable_cost = parseFloat($('#total_renewable_cost').val()) || 0;
            

            $('#local_percent').val(((parseFloat($('#total_procured_cost').val()) || 0) / total * 100).toFixed(2));
            $('#salvage_percent').val(((parseFloat($('#total_salvage_cost').val()) || 0) / total * 100).toFixed(2));
            $('#reused_percent').val(((parseFloat($('#total_resued_cost').val()) || 0) / total * 100).toFixed(2));
            $('#recycled_percent').val(((parseFloat($('#total_recycled_cost').val()) || 0) / total * 100).toFixed(2));
            console.log("Total Wood Cost: " + total_wood_cost); 
            console.log("Total Renewable Cost: " + total_renewable_cost);
            var woodPercent = ((total_renewable_cost) / total_wood_cost * 100).toFixed(2);
            $('#wood_percent').val(woodPercent);
            // $('#wood_percent').val(((parseFloat($('#total_wood_cost').val()) || 0) / (parseFloat($('#total_renewable_cost').val()) || 0) * 100).toFixed(2));
            $('#ecolablled_material_percent').val(((parseFloat($('#total_ecolabled_cost').val()) || 0) / total * 100).toFixed(2));
            $('#alternate_material_percent').val(((parseFloat($('#total_alternative_cost').val()) || 0) / total * 100).toFixed(2));
        }
    };
    
    // =======================
    // EVENT LISTENERS
    // =======================
    
    // Quantity change (1-50)
    for (let i = 1; i <= 50; i++) {
        $(document).on('keyup change', '#quantity' + i, function() {
            MaterialCalculator.calculateRowTotal(i);
            MaterialCalculator.calculateDerivedCosts(i);
            MaterialCalculator.updateAllTotals();
        });
    }
    
    // Rate change (1-50)
    for (let i = 1; i <= 50; i++) {
        $(document).on('keyup change', '.rates', function() {
            // alert();
            MaterialCalculator.calculateRowTotal(i);
            MaterialCalculator.calculateDerivedCosts(i);
            MaterialCalculator.updateAllTotals();
        });
    }
    
    // Distance change (1-50)
    for (let i = 1; i <= 50; i++) {
        $(document).on('keyup change', '.distance', function() {
            MaterialCalculator.calculateRowTotal(i);
            MaterialCalculator.calculateDerivedCosts(i);
            MaterialCalculator.updateAllTotals();
        });
    }
    
    // Reuse Material % (1-50)
    for (let i = 1; i <= 50; i++) {
        $(document).on('keyup change', '#reuse_material' + i, function() {
            MaterialCalculator.calculateDerivedCosts(i);
            MaterialCalculator.updateAllTotals();
        });
    }
    
    // Recycled % (1-50)
    for (let i = 1; i <= 50; i++) {
        $(document).on('keyup change', '#recycled_percent' + i, function() {
            MaterialCalculator.calculateDerivedCosts(i);
            MaterialCalculator.updateAllTotals();
        });
    }
    
    // Dropdown changes (Salvaged, Ecolabelled, Woodbased, Composite, Alternative)
    for (let i = 1; i <= 50; i++) {
        $(document).on('change','#salvaged' + i + ', #ecolablled' + i + ', #woodbased' + i + ',#woodbased_material' + i + ', #composite_wood' + i + ', #alternative_material' + i, function() {
            MaterialCalculator.calculateDerivedCosts(i);
            MaterialCalculator.updateAllTotals();
        });
    }
    
    // Initial calculation on page load
    MaterialCalculator.updateAllTotals();
    });
</script>

<script>
$(document).on("change", ".fileInput", async function () {

            let $input = $(this);
            let $row = $input.closest("td");
            let $loader = $row.find(".upload-loader");
            let $progress = $row.find(".progress");
                // Disable input & show loader
            $input.prop("disabled", true);
            $('.fileInput').prop("disabled", true);
            $loader.show();
            $progress.css({ width: "0%" });
            
            let file = $(this)[0].files[0];
            // Step 1 — request multipart upload creation
            let initRes = await $.post("/create-multipart-upload", {
                file_name: file.name,
                file_type: file.type,
                project_id: "{{$projectdetails->final_project_id}}",
                _token: $('meta[name="csrf-token"]').attr("content")
            });

            let uploadId = initRes.upload_id;
            let key = initRes.key;

            let partSize = 5 * 1024 * 1024; // 5 MB
            let parts = [];
            let partNumber = 1;

            for (let start = 0; start < file.size; start += partSize) {

                let end = Math.min(start + partSize, file.size);
                let blob = file.slice(start, end);

                // Step 2 — get signed URL for each part
                let presignedRes = await $.post("/get-presigned-part-url", {
                    key: key,
                    upload_id: uploadId,
                    part_number: partNumber,
                    _token: $('meta[name="csrf-token"]').attr("content")
                });

                let url = presignedRes.url;

                // Upload part using fetch (jQuery cannot handle PUT binary uploads)
                let uploadResponse = await fetch(url, {
                    method: "PUT",
                    headers: {
                        "Content-Type": file.type,
                    },
                    body: blob
                });

                if (!uploadResponse.ok) {
                    alert("Error uploading part " + partNumber);
                    return;
                }

                let eTag = uploadResponse.headers.get("ETag").replaceAll('"', "");

                parts.push({
                    ETag: eTag,
                    PartNumber: partNumber
                });
                
                // Progress update
                let progressDiv = $(this).closest("td").find(".progress");
                let percent = Math.round((end / file.size) * 100);
                progressDiv.css({
                    "width": percent + "%",
                    "height": "10px",
                    "background": "green"
                });

                partNumber++;
            }

            // Step 3 — complete upload
            let completeRes = await $.ajax({
                url: "/complete-multipart-upload",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    key: key,
                    upload_id: uploadId,
                    parts: parts
                }),
                headers: {
                    "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
                }
            });

            let row = $(this).closest("td");

            // Set the file URL into the .fileInputUrl box inside the same row
            row.find(".fileInputUrl").val(completeRes.file_url);

            $loader.hide();
            
            $input.prop("disabled", false);
            $('.fileInput').prop("disabled", false);
 });

</script>
<script>
document.querySelectorAll('.autoResize').forEach(textarea => {
    // Auto resize on page load
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";

    // Auto resize on input
    textarea.addEventListener('input', function () {
        this.style.height = "auto";
        this.style.height = this.scrollHeight + "px";
    });
});
</script>
<!-- newbuilding scripts -->
 
<script>

    function calculateIndoorPercentage() {
    let occupancy = "{{__get_rating_data($projectdetails->id, 'project_details', 'project_details', 'tol_reg_occupancy', 'sustainable_design', $projectdetails->rating_type)}}"
    let regareaocc = "{{__get_rating_data($projectdetails->id, 'project_details', 'project_details', 'reg_area_occ', 'sustainable_design', $projectdetails->rating_type)}}"
    let freshair = "{{__get_rating_data($projectdetails->id, 'energy_efficency', 'annex_natural_venilation', 'fresh_air_meet_space', 'material_resources',  $projectdetails->rating_type)}}"
    let occupancy_well = "{{__get_rating_data($projectdetails->id, 'project_details', 'project_details', 'occupancy', 'sustainable_design', $projectdetails->rating_type)}}"
    let carpetareatotal = "{{__get_rating_data($projectdetails->id, 'project_details', 'project_details', 'carpet_area_total', 'sustainable_design', $projectdetails->rating_type)}}"
    let sitearea = "{{__get_rating_data($projectdetails->id, 'project_details', 'project_details', 'site_area', 'sustainable_design', $projectdetails->rating_type)}}"
    let totalwaterend = "{{__get_rating_data($projectdetails->id, 'water_conservation', 'annex_wc_three', 'consumption_annual_total', 'water_conservation', $projectdetails->rating_type)}}"
    let daytotalarea = parseFloat($("#day_total_area").val()) || 0;
    let mannualparametersarea = parseFloat($("#mannual_parameters_area").val()) || 0;
    let occupantnumber = parseFloat($("#occupant_number").val()) || 0;

    let greenthrough = parseFloat($("#green_through").val()) || 0;
    let offsitesolar = parseFloat($("#off_site_solar").val()) || 0;
    let totalannual = parseFloat($("#total_annual").val()) || 0;

    let carpet = "{{__get_rating_data($projectdetails->id, 'project_details', 'project_details', 'area_carpetfac', 'sustainable_design', $projectdetails->rating_type)}}"
    let indoor = parseFloat($("#indoor_total_area").val()) || 0;


    // new building
    
    let exposed_roof = parseFloat($("#exposed_roof").val()) || 0;
    let area_insert_area_roof = parseFloat($("#area_insert_area_roof").val()) || 0;
    let area_tolerant_roof = parseFloat($("#area_tolerant_roof").val()) || 0;
   
    let shaded = parseFloat($("#shaded").val()) || 0;
    let hard_sri_least_materials = parseFloat($("#hard_sri_least_materials").val()) || 0;
    let open_grid_grass = parseFloat($("#open_grid_grass").val()) || 0;
    let impervious = parseFloat($("#impervious").val()) || 0;
    let covered = parseFloat($("#covered").val()) || 0;
    let parking_non_roof = parseFloat($("#parking_non_roof").val()) || 0;
    let totalcompliantarea = parseFloat($("#total_compliant_area").val()) || 0;
    let totalcompliantreg = parseFloat($("#total_compliant_reg").val()) || 0;
    let areacri = parseFloat($("#area_cri").val()) || 0;
    let occupantscatered = parseFloat($("#occupants_catered").val()) || 0;
    let occupantsarea = parseFloat($("#total_compliant_area").val()) || 0;
    let occupantsreg = parseFloat($("#total_compliant_reg").val()) || 0;
    let generationonsitesolar = parseFloat($("#generation_onsite_solar").val()) || 0;
    let generationoffsitesolar = parseFloat($("#generation_offsite").val()) || 0;
    let lightingenergyoffsite = parseFloat($("#lighting_energy_offsite").val()) || 0;

    let totalenergybuilding = parseFloat($("#total_energy_building").val()) || 0;
    let generationonsitesolarannex = parseFloat($("#generation_onsite_solar_annex").val()) || 0;
    let lightingenergybuilding = parseFloat($("#lighting_energy_building").val()) || 0;
    let totalfertilzer = parseFloat($("#total_fertilzer").val()) || 0;
    let totalorganicfertilzer = parseFloat($("#total_organic_fertilzer").val()) || 0;
    let total_permanen_ecos = parseFloat($("#total_permanen_ecos").val()) || 0;
    let using_service_eco = parseFloat($("#using_service_eco").val()) || 0;
    let compliant_area = parseFloat($("#compliant_area").val()) || 0;
    let total_area_daylight = parseFloat($("#total_area_daylight").val()) || 0;
    let total_area_para = parseFloat($("#total_area_para").val()) || 0;
    let regularly_area_para = parseFloat($("#regularly_area_para").val()) || 0;
    let catered_well_being = parseFloat($("#catered_well_being").val()) || 0;
    let permanent_occupants = parseFloat($("#permanent_occupants").val()) || 0;
    let sum1 = parseFloat($("#landscape_details_total_area_landscape").val()) || 0;
    let sum2 = parseFloat($("#landscape_details_area_vertical_landscape").val()) || 0;
    let sum3 = parseFloat($("#landscape_details_builtup").val()) || 0;
    let areatrufgrd = parseFloat($("#area_truf_grd").val()) || 0;
    let terracetruf = parseFloat($("#terrace_truf").val()) || 0;
    let totalsiteland = parseFloat($("#total_site_land").val()) || 0;
    let areadruoghtspec = parseFloat($("#area_druoght_spec").val()) || 0;
    let nativespec = parseFloat($("#native_spec").val()) || 0;
    let areanativeada = parseFloat($("#area_native_ada").val()) || 0;
    let arearetainedtopography = parseFloat($("#area_retained_topography").val()) || 0;
    let nopreservedtrees = parseFloat($("#no_preserved_trees").val()) || 0;
    let noexistingtrees = parseFloat($("#no_existing_trees").val()) || 0;
    let arearetaintednaturalrock = parseFloat($("#area_retainted_natural_rock").val()) || 0;
    let rocktotalsitearea = parseFloat($("#rock_total_site_area").val()) || 0;
    let buildingfootprint = parseFloat($("#building_footprint").val()) || 0;
    let arearetaintedsitecountour = parseFloat($("#area_retainted_site_countour").val()) || 0;
    let generationoffsolar = parseFloat($("#generation_offsite_solar").val()) || 0;
    let totalenergyoffsite = parseFloat($("#total_energy_offsite").val()) || 0;
     let wastewaterday = parseFloat($("#capacity_pro_stp").val()) || 0;
    let stpcapa = parseFloat($("#stp_capa_ex").val()) || 0;
    let waterenduse = parseFloat($("#water_end_use").val()) || 0;

    let percentageofnatural = 0;
    if(rocktotalsitearea > 0){
        percentageofnatural = ((arearetaintednaturalrock / rocktotalsitearea)-buildingfootprint ) * 100;
    }


    // fb
    let percetageofenduse = 0;
    if(totalwaterend > 0){
        percetageofenduse = (waterenduse / totalwaterend) * 100;
    }


    let percentageofwastetreated = 0;
    if(stpcapa > 0){
        percentageofwastetreated = (wastewaterday/stpcapa) * 100;
    }


    let percentageofownersite = 0;
    if(totalenergyoffsite > 0){
        percentageofownersite = (generationoffsolar / totalenergyoffsite) * 100;
    }

    let percentageoffonsite = 0;
    if(lightingenergyoffsite > 0){
        percentageoffonsite = (generationoffsitesolar / lightingenergyoffsite) * 100;
    }

    let percentageofsite = 0;
    if(sitearea > 0){
        percentageofsite = (arearetaintedsitecountour / sitearea) * 100;
    }



    let sumofhardopenim = 0;
    sumofhardopenim = (shaded + hard_sri_least_materials + open_grid_grass ) / impervious;

    let percentagehardopenim = 0;
    if (parking_non_roof > 0) {
        percentagehardopenim = (covered / parking_non_roof) * 100;
    }

    let percentageoftrees = 0;
    if(noexistingtrees > 0){
        percentageoftrees = (noexistingtrees / nopreservedtrees) * 100;
    }

    let percentageofnew = 0;
    if(sitearea > 0){
        percentageofnew = (arearetainedtopography / sitearea) * 100;
    }

    let percetageoftree = 0;
    if(totalsiteland > 0){
        percetageoftree = (areanativeada + nativespec + areadruoghtspec) / totalsiteland * 100;
    }

    let percentageoftruf = 0;
    if(totalsiteland > 0){
        percentageoftruf = (terracetruf + areatrufgrd) / totalsiteland * 100;
    }
    let percentagearapara = 0;
    if(regularly_area_para >0){
        percentagearapara = ( regularly_area_para /total_area_para) * 100;
    }

    let percetageofoccupants = 0;
    if(permanent_occupants > 0){
        percetageofoccupants = (catered_well_being / permanent_occupants) * 100;
    }
    let percentagehealtharea = 0;
    if(compliant_area > 0){
        percentagehealtharea = (  compliant_area / total_area_daylight) * 100;
    }

    let percentagerefm = 0;
    if (exposed_roof > 0) {
        percentagerefm = (area_insert_area_roof / exposed_roof) * 100;
    }

    let percetagesolar = 0;
    if(totalenergybuilding > 0){
        percetagesolar = (generationonsitesolar / totalenergybuilding) * 100;
    }

    let percentageonsitesolar = 0;
    if(lightingenergybuilding > 0){
        percentageonsitesolar = (generationonsitesolarannex / lightingenergybuilding) * 100;
    }

    let percetageveg = 0;
    if(area_tolerant_roof > 0){
        percetageveg = (area_tolerant_roof / exposed_roof) * 100;
    }
    let percentagesirveg = 0;
    let sumofsriveg = area_tolerant_roof + area_insert_area_roof;
    if(area_tolerant_roof > 0){

        percentagesirveg = (sumofsriveg/ exposed_roof) * 100;
    }
    

    let percentage = 0;
    if (carpet > 0) {
        percentage = (indoor / carpet) * 100;
    }

    console.log(occupancy, daytotalarea, "daytotalarea, occupancy");
    let percentageoccy = 0;
    if (regareaocc > 0) {
        percentageoccy = (daytotalarea / regareaocc) * 100;
    }

    let percentagemannual = 0;
    if(regareaocc > 0){
        percentagemannual = (mannualparametersarea/ regareaocc) * 100;
    }

    let percetageofex = 0;
    if(totalfertilzer >0){
        percetageofex = ( totalorganicfertilzer / totalfertilzer) * 100;
    }

    let percentagewellfac = 0;
    if(regareaocc > 0){
        percentagewellfac = (occupantnumber/ regareaocc) * 100;
    }

    let percentagegreen = 0;

    percentagegreen = (greenthrough + offsitesolar ) / totalannual * 100;

    let percentagewheels = 0;

        let sumofshaded = 0;
        if(occupancy > 0){
            sumofshaded = (totalcompliantarea / occupancy) * 100;
        }
        
        let sumofper = 0;
        if(occupancy > 0){
            sumofper = (totalcompliantreg / occupancy) * 100;
        }
    let percentagetotalarea = (areacri / carpetareatotal) * 100;
        if (percentagetotalarea <= 10) {
            $('#area_cri_applicable').val(percentagetotalarea.toFixed(2));
        } else {
            $('#area_cri_applicable').val(percentagetotalarea.toFixed(2));
        }
    let occupanetwellper = 0;
    if(occupancy > 0){
        occupanetwellper = (occupantscatered / occupancy_well) * 100;
    }

    let percetagePratice = 0;
    if(occupancy_well > 0){
        percetagePratice = (  total_permanen_ecos / occupancy_well) * 100;
    }
    let percetageshuttel = 0;
    if(occupancy_well > 0){
        percetageshuttel = (  using_service_eco / occupancy_well) * 100;
    }

    let sumoflandscpe = 0;
    sumoflandscpe = sum1 + sum2 + sum3

    $("#indoor_parameters_area").val(percentage.toFixed(2));
    $("#day_parameters_area").val(percentageoccy.toFixed(2));
    $("#mannual_total").val(percentagemannual.toFixed(2));
    $("#occupant_well").val(percentagewellfac.toFixed(2));
    $("#percentage_green_power").val(percentagegreen.toFixed(2));

    $("#reflective_mitigation").val(percentagerefm.toFixed(2));
    $("#vegetation_mitigation").val(percetageveg.toFixed(2));
    $("#sri_vegetation_island_mitigation").val(percentagesirveg.toFixed(2));
    $("#non_roof_mitigation_one").val(sumofhardopenim.toFixed(2));
    $("#non_roof_mitigation_two").val(percentagehardopenim.toFixed(2));
    $("#total_compliant_reg_area2").val(sumofshaded.toFixed(2));
    $("#total_compliant_reg_area").val(sumofper.toFixed(2));
    $("#through_occupancy_no").val(occupanetwellper.toFixed(2));
    $("#percentage_energy_catered").val(percetagesolar.toFixed(2));
    $("#catered_lighting_energy").val(percentageonsitesolar.toFixed(2));
    $("#percent_organic_fertilzer").val(percetageofex.toFixed(2));
    // $("#occupants_public_transport").val(percetagePratice.toFixed(2));
    // $("#occupants_shutter_eco").val(percetageshuttel.toFixed(2));
    $("#regularly_occupied_area").val(percentagehealtharea.toFixed(2));
    $("#occupied_area_para").val(percentagearapara.toFixed(2));
    $("#public_occupants").val(percetageofoccupants.toFixed(2));
    $("#total_sum").val(sumoflandscpe.toFixed(2));
    $("#per_turf").val(percentageoftruf.toFixed(2));
    $("#local_adaptive").val(percetageoftree.toFixed(2));
    $("#retained_percent").val(percentageofnew.toFixed(2));
    $("#preserved_trees_percent").val(percentageoftrees.toFixed(2));
    $("#retainted_natural_rock_percent").val(percentageofnatural.toFixed(2));
    $("#retainted_site_countour_percent").val(percentageofsite.toFixed(2));
    $("#catered_lighting_offsite").val(percentageoffonsite.toFixed(2));
    $("#percentage_energy_offsite").val(percentageofownersite.toFixed(2));
    $("#percent_waste_water_ex").val(percentageofwastetreated.toFixed(2));
    $("#percentage_water_meter").val(percetageofenduse.toFixed(2));
 }

 $("#indoor_total_area, #area_carpetfac,#no_preserved_trees,#no_existing_trees,#stp_capa_ex, #water_end_use,#lighting_energy_offsite,#generation_offsite_solar, #total_energy_offsite,  #generation_offsite, #area_retainted_natural_rock,#rock_total_site_area,#building_footprint,#area_retainted_site_countour,  #generation_onsite_solar,#total_organic_fertilzer,#area_retained_topography, #area_druoght_spec, #native_spec, #area_native_ada, #total_site_land, #area_truf_grd, #terrace_truf, #landscape_details_total_area_landscape, #landscape_details_area_vertical_landscape, #landscape_details_builtup, #permanent_occupants, #catered_well_being, #total_area_para, #regularly_area_para,  #total_area_daylight, #compliant_area, #using_service_eco, #total_fertilzer, #total_permanen_ecos,  #generation_onsite_solar_annex, #lighting_energy_building, #total_energy_building, #shaded, #hard_sri_least_materials,#occupants_catered, #area_cri, #carpet_area_total, #total_compliant_reg, #total_compliant_area, #covered, #open_grid_grass, #impervious,  #day_total_area, #exposed_roof, #area_insert_area_roof, #occupancy, #landscape_details_adaptive_turf, #landscape_details_adaptive_tolerant,  #mannual_parameters_area, #occupant_number, #green_through, #off_site_solar, #total_annual, #projects_details_ev_twowheel, #projects_details_two_wheel").on("input", calculateIndoorPercentage);   
</script>
<script>
    if(rating != 2){
        $(document).ready(function () {
            
            let applicability = $('#applicability_nweb').val();
            console.log(applicability, "applicabilitydc");
            if (applicability === 'Yes') {
                $('#div_project_turf, #div_project_drought').show();
            } else {
                $('#div_project_turf, #div_project_drought').hide();
            }
        });
    }
</script>
<script>
    $(document).ready(function () {

        const inputIds = [
            "#details_installed_space_indoor",
            "#indicating_openable_space_indoor",
            "#percentage_improvement_space_indoor"
        ];

        inputIds.forEach(function (selector) {

            $(selector).on("input", function () {

                let value = parseFloat($(this).val()) || 0;
                let fieldId = $(this).attr("id");

                console.log(value, fieldId);

                if (value > 2) {
                    alert("Maximum allowed points is 2.");
                    $(this).val('');
                    return;
                }

                if (value < 0) {
                    $(this).val(0);
                }
            });

        });

    });
</script>
<script>
    $(document).ready(function () {

        const inputIds = [
            "#green_certified"
        ];

        inputIds.forEach(function (selector) {

            $(selector).on("input", function () {

                let value = parseFloat($(this).val()) || 0;
                let fieldId = $(this).attr("id");

                console.log(value, fieldId);

                if (value > 5) {
                    alert("Value cannot be more than 5");
                    $(this).val('');
                    return;
                }

                if (value < 0) {
                    $(this).val(0);
                }
            });

        });

    });
</script>

@endpush


