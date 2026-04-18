(function($) {
  "use strict"; // Start of use strict

  // Theme toggle — pairs with the inline FOUC guard in _includes/head.html
  // and the tokens in _sass/_theme.scss.
  var THEME_STORAGE_KEY = 'kruspanek-theme';

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function applyTheme(theme, persist) {
    document.documentElement.setAttribute('data-theme', theme);
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    }
    if (persist) {
      try { localStorage.setItem(THEME_STORAGE_KEY, theme); } catch (e) { /* ignore */ }
    }
    var announce = document.getElementById('theme-toggle-announce');
    if (announce) {
      announce.textContent = theme === 'dark' ? 'Tmavý režim' : 'Světlý režim';
    }
  }

  // Sync initial aria-pressed with the theme the inline script already set.
  applyTheme(currentTheme(), false);

  $('#theme-toggle').on('click', function () {
    applyTheme(currentTheme() === 'dark' ? 'light' : 'dark', true);
  });

  // Follow OS preference changes only when the user has not made an explicit
  // choice. Explicit clicks win forever (until localStorage is cleared).
  if (window.matchMedia) {
    var mql = window.matchMedia('(prefers-color-scheme: dark)');
    var handler = function (e) {
      var stored;
      try { stored = localStorage.getItem(THEME_STORAGE_KEY); } catch (_) { stored = null; }
      if (stored !== 'dark' && stored !== 'light') {
        applyTheme(e.matches ? 'dark' : 'light', false);
      }
    };
    if (mql.addEventListener) {
      mql.addEventListener('change', handler);
    } else if (mql.addListener) {
      mql.addListener(handler);
    }
  }

  // Smooth scrolling using jQuery easing
  $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: (target.offset().top - 54)
        }, 1000, "easeInOutExpo");
        return false;
      }
    }
  });

  // Closes responsive menu when a scroll trigger link is clicked
  $('.js-scroll-trigger').click(function() {
    $('.navbar-collapse').collapse('hide');
  });

  // Activate scrollspy to add active class to navbar items on scroll
  $('body').scrollspy({
    target: '#mainNav',
    offset: 56
  });

  // Collapse Navbar
  var navbarCollapse = function() {
    if ($("#mainNav").offset().top > 100) {
      $("#mainNav").addClass("navbar-shrink");
    } else {
      $("#mainNav").removeClass("navbar-shrink");
    }
  };
  // Collapse now if page is not at top
  navbarCollapse();
  // Collapse the navbar when page is scrolled
  $(window).scroll(navbarCollapse);

  // Hide navbar when modals trigger
  $('.portfolio-modal').on('show.bs.modal', function(e) {
    $('.navbar').addClass('d-none');
  })
  $('.portfolio-modal').on('hidden.bs.modal', function(e) {
    $('.navbar').removeClass('d-none');
  })

})(jQuery); // End of use strict
