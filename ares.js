function getCleanValue(value) {
    if (value == null) {
      value = "";
    }
    return value.replace(/^\s*|\s*jQuery/g,'');
}

function populate_course_selector(library, course, style) {
    //var library = Drupal.settings.ares.library
    var hideThis = "#course-spinner-" + library + "-" + style;
    var populateThis = "#edit-courselist-" + library + "-" + style;
    var get_courses_url = jQuery("#courselist-link-" + library + "-" + style).attr('href');

    jQuery(populateThis).append('<option value="0" selected="selected">----- Select a course -----</option>');
    jQuery.getJSON(get_courses_url, function(data) {
      if (data.courseList) {
          data.courseList.sort(sort_courses);
          jQuery.each(data.courseList, function(key, value) {
            var displayName = value.displayCourseNumber + ': ' + value.courseName;
            if (value.displayCourseNumber == value.courseName) {
              displayName = value.displayCourseNumber;
            }
            var classCode = getCleanValue(classCode);
            if (classCode != '') {
              displayName += ' (' + classCode + ')';
            }
            var inst =
            jQuery(populateThis).append(jQuery("<option></option>").attr("value", value.id).text(displayName));
          });

          jQuery(populateThis).change(function () {
            if (style == 'inline') {
              ajax_class_selection(library, style);
            } else {
              non_ajax_class_selection(library, style);
            }
          });

          // now the course selection control can be displayed
          jQuery(hideThis).attr('style', 'display: none');
          jQuery(populateThis).removeAttr('style');

          // trigger the control if a course has already been selected in another request
          if (course) {
            select_course(library, course, style);
            jQuery(populateThis).change();
          }

      } else {
          jQuery(hideThis).attr('style', 'display: none');
          populateThis.replaceWith("An error occured trying to display the list of courses.");
      }
    });

}

function sort_courses(a,b) {
  var astring = a.displayCourseNumber.toLowerCase().split(' ').join('') + getCleanValue(a.classCode).toLowerCase().split(' ').join('');
  var bstring = b.displayCourseNumber.toLowerCase().split(' ').join('') + getCleanValue(b.classCode).toLowerCase().split(' ').join('');
  if (astring < bstring) {return -1}
  if (astring > bstring) {return 1}
  return 0;
}

function select_course(library, course, style) {
  var selector = "#edit-courselist-" + library + "-" + style + " option";
  jQuery(selector + ":selected").removeAttr("selected");
  jQuery(selector).each( function() {
      if (jQuery(this).val() == course) {
          jQuery(this).attr('selected', 'selected');
      }
  });
}

function non_ajax_class_selection(library, style) {
  var selector = "#edit-courselist-" + library + "-" + style;
  var items_base_url = jQuery('form#courselist-form-' + library + "-" + style).attr('action') + "/" + library + "/course/";
  if (jQuery(selector + " option:selected").val() != '0') {
      jQuery(selector + " option:selected").each(function () {
        var get_items_url = items_base_url + jQuery(this).val();
        window.location = get_items_url;
    });
  }
}


//      var list_title = '';
//      var selection_count = 0;
//      jQuery(selector + " option").each(function () {
//        if (jQuery(this).val() == selected_course) {
//          if (selection_count > 0) {
//            list_title += " | "
//          }
//          list_title += jQuery(this).text();
//          if (jQuery(this).data('inst')) {
//            list_title += ' (' + jQuery(this).data('inst') + ')';
//          }
//          selection_count++;
//        }
//      });


function ajax_class_selection(library, style) {
  var selector = "#edit-courselist-" + library + "-" + style;
  var items_base_url = jQuery('#itemlist-link-' + library + "-" + style + "-items").attr('href');
  var title_base_url = jQuery('#itemlist-link-' + library + "-" + style + "-title").attr('href');

  if (jQuery(selector + " option:selected").val() != '0') {

      // hide previous display
      var items = "#reserve-items-" + library + "-" + style;
      var spinner = "#items-spinner-" + library + "-" + style;
      var body = "#course-reserves-" + library + "-" + style + " tbody";

      jQuery(items).attr('style', 'display: none');
      jQuery(spinner).removeAttr('style');

      // get new display
      jQuery(selector + " option:selected").each(function () {
        var get_items_url = items_base_url + jQuery(this).val();
        var get_title_url = title_base_url + library + '/' + jQuery(this).val();

        jQuery(items + " h3").empty();
        jQuery.getJSON(get_title_url, function(data) {
          jQuery(items + " h3").html(data["value"]);
          jQuery(items + " h3 div").addClass('ares-course-title-info');
        });

        jQuery.getJSON(get_items_url, function(data) {
            jQuery(body).empty();
            jQuery.each(data.reserveItemList, function(i, reserve) {
                var odd_even = 'odd';
                ((i+1)%2) == 0  ? odd_even = 'even' : odd_even = 'odd';

                var output = '<tr class="' + odd_even + '">';

                // TITLE AND PAGES
                output += '   <td class="ares-title">';
                if (reserve.articleTitle != '' && reserve.articleTitle != '?') {
                  output +=  '<p class="title"><strong>' + reserve.title + '</strong></p>';
                  output +=  '<p class="article-title"><em>' + reserve.articleTitle + '</em></p>';
                } else {
                  output +=  '<p class="title"><strong>' + reserve.title + '</strong></p>';
                }
                // Originally this showed pages for all formats, but it was requested
                // by Wendy and Troy to limit it to articles and chapters only
                if ((reserve.itemFormat == 'Article' || reserve.itemFormat == 'BookChapter') && (reserve.pages != '' && reserve.pages != '?')) {
                  output +=  '<p class="pages">pp. ' + reserve.pages + '</p>';
                }
                output += '</td>';

                // AUTHOR
                output += '   <td class="ares-author"><p>' + reserve.author + '</p></td>';

                // BLACKBOARD LINK OR LIBRARY AND CALLNUMBER
                output += '   <td class="ares-location-complete">';
                if (reserve.status.toUpperCase().indexOf("ELECTRONIC") != -1) {
                  output += '<p class="electronic">Electronic Access: <a href="http://blackboard.cornell.edu/#aresid=' + reserve.id + '">Click here to find electronic reserve readings in Blackboard</a></p>';
                } else {
                  if (reserve.location != '' && reserve.location != '?') {
                    output += '<p class="ares-location">' + reserve.location + '&nbsp;</p>';
                  }
                  output += '<p class="ares-callnumber">' + reserve.callnumber + '</p></td>';
                }
                output += '</td>';

                // DUE DATE
                // Convert date format to MM/DD/YYYY HH:MM
                reserve.dueDate = reserve.dueDate.replace(/(\d{4})-(\d{2})-(\d{2}) (\d{2}:\d{2}).*/, '$2/$3/$1 $4');
                var formattableDate = moment(reserve.dueDate);
                var formattedDate;
                
                if (formattableDate.isValid())
                  formattedDate = moment(reserve.dueDate).format('ddd, M/D/YY [ &nbsp;&nbsp; ] h:mm A');  
                else
                  // If formattableDate is *not* a valid date, then it's probably a status
                  // message like 'Available' that should be passed through without alteration.
                  formattedDate = reserve.dueDate;
                
                if (reserve.status.toUpperCase().indexOf("ELECTRONIC") == -1) {
                  output += '   <td class="ares-status"><span class="available">' + formattedDate + '</span></td>';
                } else {
                  output += '   <td class="ares-status"></td>';
                }

                output += '</tr>';
                jQuery(body).append(output);
          });

          jQuery(spinner).attr('style', 'display: none');
          jQuery(items).removeAttr('style');
          jQuery("#course-reserves-" + library + "-" + style).trigger("update");
       });
    });
  }
}

// Enable auto-submit of form when an item is selected from autocomplete
jQuery(document).ready(function(){
  Drupal.jsAC.prototype.select = function (node) {
    this.input.value = jQuery(node).data('autocompleteValue');
    if(jQuery(this.input).hasClass('auto_submit')){
      this.input.form.submit();
    }
  };
});
