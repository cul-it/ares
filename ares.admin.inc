<?php

require_once(dirname(__FILE__) . '/config.php');
require_once(dirname(__FILE__) . '/common.php');

/**
 * @file
 * Admin page callbacks for the ares module.
 */


/**
 * Menu callback; displays the ares administration page.
 */
function ares_admin_overview() {
  return ares_view();
}

/**
 * Displays the ares administration page.
 *
 * @return
 *   The page HTML.
 */
function ares_view() {
  $result = db_query('SELECT alid, name from {ares_location} order by name');

  $header = array(t('Locations'), t('Operations'));
  $rows = array();
  while ($location = db_fetch_object($result)) {
    $rows[] = array($location->name, l(t('edit'), "admin/content/ares/edit/$location->alid"));
  }
  $output .= theme('table', $header, $rows);

  $outout .= '';

  return $output;
}



/**
 * Form builder; Generate a form to add/edit/delete ares locations.
 *
 * @ingroup forms
 * @see ares_form_location_validate()
 * @see ares_form_location_submit()
 */
function ares_form_location(&$form_state, $edit = array('name' => '', 'alid' => NULL)) {
  $default_location =  ($edit['name'] != '') ? $edit['name'] : 'ALL';
  $form['name'] = array('#type' => 'select',
    '#title' => t('Ares Location Name'),
    '#default_value' => $default_location,
    '#options' => get_location_options(),
    '#required' => TRUE,
  );
  $form['submit'] = array('#type' => 'submit', '#value' => t('Save'));

  if ($edit['alid']) {
    $form['delete'] = array('#type' => 'submit', '#value' => t('Delete'));
    $form['alid'] = array('#type' => 'hidden', '#value' => $edit['alid']);
  }
  return $form;
}

/**
 * Validate ares_form_location form submissions.
 */
function ares_form_location_validate($form, &$form_state) {
  if ($form_state['values']['op'] == t('Save')) {
    // Check for duplicate names
    if (isset($form_state['values']['alid'])) {
      $location = db_fetch_object(db_query("SELECT alid FROM {ares_location} WHERE name = '%s' AND alid <> %d", $form_state['values']['name'], $form_state['values']['alid']));
    }else {
      $location = db_fetch_object(db_query("SELECT alid FROM {ares_location} WHERE name = '%s'", $form_state['values']['name']));
    }

    if ($location) {
      form_set_error('title', t('A location named %location already exists. Please enter a unique location name.', array('%location' => $form_state['values']['name'])));
    }
  }
}

/**
 * Process ares_form_location form submissions.
 *
 * @todo Add delete confirmation dialog.
 */
function ares_form_location_submit($form, &$form_state) {
  if ($form_state['values']['op'] == t('Delete')) {
    $name = $form_state['values']['name'];
    // Unset the name:
    unset($form_state['values']['name']);
  }
  ares_save_location($form_state['values']);
  if (isset($form_state['values']['alid'])) {
    if (isset($form_state['values']['name'])) {
      drupal_set_message(t('The lcoation %location has been updated.', array('%location' => $form_state['values']['name'])));
        $form_state['redirect'] = 'admin/content/ares/';
        return;
    } else {
      watchdog('ares', 'Ares location %location deleted.', array('%location' => $name));
      drupal_set_message(t('The Ares location %location has been deleted.', array('%location' => $name)));
        $form_state['redirect'] = 'admin/content/ares/';
        return;
    }
  } else {
    watchdog('ares', 'Ares location %location added.', array('%location' => $form_state['values']['name']), WATCHDOG_NOTICE, l(t('view'), 'admin/content/ares'));
    drupal_set_message(t('The Ares location %location has been added.', array('%location' => $form_state['values']['name'])));
    $form_state['redirect'] = 'admin/content/ares/';
    return;
  }
}

