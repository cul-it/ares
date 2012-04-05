Adam Smith (ajs17@cornell.edu)
May 2010

The ares module provides convenient pages and blocks for displaying course
reserve items from the Ares system.

____________________________________________
Usage

(Note that in the following examples, "clean URL's" will also work properly. For
an explanation of the 'shortName' and 'courseNumber' attributes, see the
'Web Services description' section below.)

Enable the module in the normal way and give the 'administer ares module'
permission to the appropriate roles.

Once enabled, the module provides pages that can be called directly to display
a course select list for a library location, by using the library location's
'shortName' value:
  http://localhost/drupal/?q=ares/library/ALL
  http://localhost/drupal/?q=ares/library/Music

You can also link directly to pages that list reserve items with this
combination of 'shortName' and 'courseNumber' values:
  http://localhost/drupal/?q=ares/library/Music/course/2326

The course selection box and reserve items lists are all loaded via AJAX.

You can also create two types of blocks:
  1. a block that displays a course selection box for a specific library
     location and links to a full page display of reserve items, or
  2. a block that displays a course selection box for a specific library
     location and displays reserve items underneath it using AJAX.

To create these blocks, go to:
  Administer -> Content management -> Ares Locations
  (http://localhost/drupal/?q=admin/content/ares/)

From there, you can add new Ares library locations. The location selection list
is also dynamically created from the Ares Web Services.

Once a library location has been added, two corresponding blocks are exposed in
the blocks management screen. For example, if you add the Music library
location, you will see the following blocks:
  - Music Library Ares reserves (results display inline)
  - Music Library Ares reserves (results display separately)

The 'inline' block will display a course selection box that displays reserve
items underneath it using AJAX. The separate block will display a course
selection box that will link to a separate page to display reserve items.

These pages and modules are designed to look like an implementation used on the
Mann Library Web site in early 2010. To implement your own display, you can
make calls to the Ares module from jQuery to get the appropriate JSON formatted
data.

For example, to get course information for a library, use its 'shortName' value
like so:
  http://localhost/default_drupal/?q=ares/get_courses_json/Music

And to get reserve item information for a course, use its 'courseNumber' value
like so:
  http://localhost/default_drupal/?q=ares/get_items_json/84

These calls are a little simpler than the direct Mann Web Service calls, and
they allow you to take advantage of Drupal's caching automatically.

____________________________________________
Present shortcomings/future enhancements

The following are possible shortcomings in the current module that could be
addressed in future updates:
  - Test AJAX functionality in IE, Firefox and Safari.
  - Provide for error handling for Web Services calls.
  - Enable graceful degradation in the absense of Javascript. (How important
    is this nowadays?)
  - Possibly account for known Ares data issues, described below.

____________________________________________
Issues with Ares data

The data coming out of Ares is very messy and unpredictable. During the
development of this module, the following issues were encountered:
  - some courses are duplicated
  - some courses don't have a name specified for them, just a course number
  - some courses have the course number specified as the name also
  - course id's can be assigned to multiple courses(!) (These are cross listed
      courses.)

The module tries to intelligently handle these cases, although new oddities
are discovered all the time.

____________________________________________
Performance

This module requests JSON formatted output from the Web services for use by
jQuery.

JSON requests are made through a layer of indirection in the module so the
results can be cached locally using Drupal's built-in caching mechanism.

Upon enabling the module, the JSON formatted 'ALL' course list is automatically
requested and cached. All other library location course lists as well as reserve
items lists for each course are cached upon their initial request through the
browser.

On each cron run, items cached by this module are deleted and the JSON formatted
'ALL' course list is automatically requested and cached again.

____________________________________________
Web Services description

This module relies on Web services maintained by John Fereira at Mann Library:
  http://mannservices.mannlib.cornell.edu/LibServices

For course reserves information, these Web Services communicate with the Ares
system. The following are sample calls to those services.

To view a list of available library locations:
  http://mannservices.mannlib.cornell.edu/LibServices/showLocationInfo.do?output=json

The 'shortName' values from this output can then be used to request a list of
courses associated with that library location:
  http://mannservices.mannlib.cornell.edu/LibServices/showCourseReserveList.do?output=json&library=Music

Note that in addition to the library locations returned by the showLocationInfo
service, there is also an 'ALL' shortName that returns all courses for all
library locations:
  http://mannservices.mannlib.cornell.edu/LibServices/showCourseReserveList.do?output=json&library=ALL

Finally, the 'courseNumber' value retrieved from the course list service can be
used to request the reserve items for that course:
  http://mannservices.mannlib.cornell.edu/LibServices/showCourseReserveItemInfo.do?output=json&courseid=84
