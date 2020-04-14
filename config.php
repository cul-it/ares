<?php

global $libraries_url;
//$libraries_url = 'http://api.library.cornell.edu/LibServices/showLocationInfo.do?output=json';
$libraries_url = 'http://api.library.cornell.edu/CourseReserves/sites';

global $courses_url;
//$courses_url = 'http://api.library.cornell.edu/LibServices/showCourseReserveList.do?output=json&library=';
$courses_url = 'https://api.library.cornell.edu/CourseReserves/showCourseReserveList?library=';

global $reserves_url;
//$reserves_url = 'http://api.library.cornell.edu/LibServices/showCourseReserveItemInfo.do?output=json&courseid=';
$reserves_url = 'https://api.library.cornell.edu/CourseReserves/showCourseReserveItemInfo?courseid=';
