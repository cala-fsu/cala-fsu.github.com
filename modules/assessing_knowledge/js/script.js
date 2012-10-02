/* Authors:
   Sean G. Coleman
   Sweta Shrestha
*/

$(document).ready(function () {
  var page,
      lastPage = $(".page").length,
      goToPage,
      previousPage,
      nextPage,
      hashChange,
      glossary = {},
      toc = {};

  // Hide everything
  $('#toc').hide();
  $('#glossary').hide();
  $('.page').hide();

  // Build the glossary
  $('#glossary dt').each(function () {
      glossary[this.id] = $(this).next('dd').html();
    });

  // Glossary Terms - qTips jQuery plugin
  $('a.glossary').each(function () {
    var anchor;

    /* Match the anchor at the end of the href */
    anchor = this.href.match(/[a-z]$/)[0];

    // We make use of the .each() loop to gain access to each element via the 'this' keyword...
    $(this).qtip({
      content: {
        text: glossary[anchor],
        title: {
          text: 'Glossary Term',
          button: 'Close'
        }
      },
      show: {
        event: 'click',
        solo: true,
        effect: function (offset) {
          $(this).fadeIn();
        }
      },
      hide: {
        event: 'click',
        effect: function (offset) {
          $(this).fadeOut();
        }
      },
      position: {
        container: $('section#chapter2')
      }
    });
  }).click(function (event) {
    event.preventDefault(); // Don't follow the links
  });

  // Set up challenge toggle
  (function () {
    var $links = $('.challenge').find('> a, h1 a');

    if ($links.hasClass('closed') === false) {
      // for arrow icons, start closed
      $links.addClass('closed');

      $links.click(function (e) {
        e.preventDefault();
        console.log();
        $(this).toggleClass('closed').toggleClass('open').closest('.challenge').find('.solution').slideToggle();
      }).end().closest('.challenge').find('.solution').hide();
    }
  }());

  // Generate the tables
  (function () {
    var i, tables = {};

    for (i = 1; i < 15; i += 1) {
      tables.i = $('#table2' + i).dialog({
        autoOpen: false,
        width: 712,
        maxWidth: 712,
        height: 'auto',
        modal: true
      });
    }
  }());

  // Generate the figures
  (function () {
    var i, figures = {};

    for (i = 1; i < 3; i += 1) {
      figures.i = $('#figure2' + i).dialog({
        autoOpen: false,
        width: 712,
        maxWidth: 712,
        height: 'auto',
        modal: true
      });
    }
  }());

  // Set up the navigation bar
  (function () {
    var i;
    $('nav').eq(1).attr('id', 'navbar');
    $('#navbar').append('<ul></ul>');

    for (i = 0; i < 4; i += 1) {
      $('#navbar ul').append('<li></li>');
    }

    $('#navbar ul li').eq(0).append('<a>&laquo; Prev</a>');
    $('#navbar ul li').eq(1).append('<a>Next &raquo;</a>');
    $('#navbar ul li').eq(2).append('<div><p></p></div>');
    $('#navbar ul li').eq(3).attr('class', 'last');
    $('#navbar ul li').eq(3).append('<a>TOC</a>');

    $('#navbar ul li > a').attr({'href': '',
                                 'class': 'ir'});

    $('#navbar ul li > a').eq(0).attr({
      'id': 'prev',
      'title': 'Previous'
    });
    $('#navbar ul li > a').eq(1).attr({
      'id': 'next',
      'title': 'Next'
    });
    $('#navbar ul li > a').eq(2).attr({
      'id': 'toggleTOC',
      'title': 'Table of Contents'
    });

    $('#navbar ul li > div').eq(0).attr('id', 'progress');
  }());

  // Open table or figure on click
  $('.opener').click(function () {
    var match;

    // Match the anchor at the end of the href
    match = this.href.match(/#(table|figure)\d+$/);
    $(match[0]).dialog('open');
    return false;
  });

  // Navigation

  // Go to a specified page number, and optionally follow an anchor.
  // Switching pages happens through BBQ.pushState, which triggers
  // a hashchange event.
  goToPage = function (newPage, anchor /* optional */) {
    var state = {};

    if (newPage >= 1 && newPage <= lastPage) {

      if (anchor) {
        state.anchor = anchor;
      }
      state.page = newPage;
      $.bbq.pushState(state, 2);
    }
  };

  previousPage = function () {
    goToPage(page - 1);
    return false;
  };

  nextPage = function () {
    goToPage(page + 1);
    return false;
  };

  // Bind pagination events
  $("#prev").click(previousPage);
  $("#next").click(nextPage);

  // Footnote anchor navigation
  $('a.footnote').click(function (e) {
    e.preventDefault();
    goToPage(page, $(this).attr('href'));
  });

  // ToC link navigation
  $('#toc > ul > li > a').click(function (e) {
    var newPage = toc[$(this).attr('href')];
    e.preventDefault();

    goToPage(newPage);

    if (page === newPage) {
      hashChange();
    }
  });

  // ToC anchor navigation
  $('#toc > ul > li > ul > li > a').click(function (e) {
    var newPage = toc[$(this).parent().parent().prev().attr('href')];
    e.preventDefault();

    goToPage(newPage, $(this).attr('href'));

    if (page === newPage) {
      hashChange();
    }
  });

  // Navigate using the arrow keys
  $(document).keyup(function (e) {
    if (e.keyCode === 37) {
      previousPage();
    } else if (e.keyCode === 39) {
      nextPage();
    }
  });

  // Table of Contents

  // Map the ToC links to page numbers
  $('#toc > ul > li > a').each(function (index) {
    toc[$(this).attr('href')] = index + 2;
  });

  // Toggle the ToC on navbar icon click
  $('#toggleTOC').click(function (e) {
    e.preventDefault();

    if ($('#toc').is(':visible')) {
      $('#toggleTOC').removeClass('pressed');
      $('#toc').hide();
      $('.page').eq(page - 1).show();
    } else {
      $('#toggleTOC').addClass('pressed');
      $('#toc').show();
      $('.page').eq(page - 1).hide();
    }
  });

  // hashChange is triggered when pushState is called
  // on the BBQ plugin
  hashChange = function (e) {
    var newPage = $.bbq.getState('page', true) || 1,
        anchor = $.bbq.getState('anchor', true) || "",
        targetOffset,
        targetTop;

    // Deactivate the ToC
    $("#toc").hide();
    $("#toggleTOC").removeClass("pressed");

    // Hide the old page
    $(".page").eq(page - 1).hide();

    // Set page to the new page
    page = newPage;

    // Show the current page
    $(".page").eq(page - 1).show();

    // show the new page number in the navigation bar
    $("#progress p").text(page + "/" + lastPage);

    // Set the previous button visibility
    if (page === 1) {
      $("#prev").addClass("disabled");
    } else if (page > 1) {
      $("#prev").removeClass("disabled");
    }

    // Set the next button visibility
    if (page === lastPage) {
      $("#next").addClass("disabled");
    } else if (page < lastPage) {
      $("#next").removeClass("disabled");
    }

    $('.qtip.ui-tooltip').qtip('hide');

    // If there is an anchor, scroll to it
    if (anchor) {
      targetOffset = $(anchor).offset();
      targetTop = targetOffset.top;

      $('html, body').animate({ scrollTop: targetTop }, 500);

    // Otherwise, scroll to the top of the page
    } else {
      $('html, body').animate({ scrollTop: 0 }, 0);
    }
  };

  $(window).bind('hashchange', hashChange);
  hashChange();
});
