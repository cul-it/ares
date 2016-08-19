<?php

function get_location_options() {
    global $libraries_url;
    $location_options = array();
    $json = get_and_cache_json('ares_libraries', $libraries_url);
    $locations = json_decode($json, true);
    foreach($locations['locationList'] as $location) {
      $location_options[$location['shortName']] = $location['name'];
    }
    asort($location_options);
    return array_merge(array('ALL' => 'All Libraries'), $location_options);
}