function getViewport() {
  var e = window, a = 'inner';
  if ( !( 'innerWidth' in window ) ) {
    a = 'client';
    e = document.documentElement || document.body;
  }
  return { width : e[ a+'Width' ] , height : e[ a+'Height' ] }
}

var fixWidths = function() {
  var padding = getViewport().height / 5,
      maxWidth = 0;

  $(".option").each(function() {
    maxWidth = Math.max(maxWidth, parseInt($(this).outerWidth()));
  });

  $(".option").width(maxWidth);
  console.log(padding);
  $(".container").css({
    'padding-bottom': padding,
    'padding-top': padding
  });
};

var getPosition = function(margin) {
  margin = margin || 50;
  var oneThird = getViewport().height / 3,
      scrollPos = $(window).scrollTop() + oneThird,
      scrollTop = scrollPos;

  $('.subquestion').each(function() {
    var diff, elBottom, elTop;
    var elTop = $(this).offset().top - margin,
        elBottom = elTop + $(this).height() + margin,
        diff = Math.max(0, Math.min(elTop - scrollTop, elBottom - scrollTop));

    if (diff < margin) {
      $(this).addClass('current').siblings().removeClass('current');
    }
  });
};

var setupQuestionOptions = function(options) {
  $(".subquestion").each(function(i) {
    var optionGroup = $("<div class='options'/>");
    
    $.each(options, function() {
      var label, name, radio;
      var name = ["option", i].join("-"),
          radio = $("<input type='radio'/>").attr("value", this.value).attr("name", name),
          label = $("<label/>").text(this.text).addClass("option animated").prepend(radio);
      optionGroup.append(label);
    });
    
    $(this).append(optionGroup).attr('id', 'q' + i).toggleClass("current", i === 0);
  });
};

var scrollToEl = function(el) {
  var currentEl = $('.current'),
      hash = '',
      scroll;

  if (el.length && el != currentEl) {
    currentEl.removeClass('current');
    el.addClass('current');

    var viewportHeight = getViewport().height,
        questionHeight = el.outerHeight(),
        centeredScroll = el.offset().top - ((viewportHeight - questionHeight) / 2),
        offsetScroll = (parseInt(el.css('padding-top')) > (viewportHeight / 10)) ? el.offset().top : el.offset().top - (viewportHeight / 10);

    hash = el.attr("id");
    scroll = (questionHeight > (viewportHeight * 0.8)) ? offsetScroll : centeredScroll; 

  } else if ( currentEl.is(":last-child") ) {
    scroll = document.body.scrollHeight;
  }

  if (scroll) {
    $('html, body').stop().animate({
      'scrollTop': Math.max(0, scroll)
    }, 300, "swing", function() {
      window.location.hash = hash;
      $('html, body').clearQueue();
    });
  }
};

var gotoQuestion = function(el) {
  scrollToEl(el);
}

var nextQuestion = function(direction) {
  var direction = direction || 'next',
      currentQuestion = $(".current"),
      nextQuestion = currentQuestion[ direction ]();
  
  gotoQuestion(nextQuestion);
};

$(document).ready(function() {

  var options = [
    {
      value: 0,
      text: "every day"
    }, {
      value: 1,
      text: "a few times a week"
    }, {
      value: 2,
      text: "every couple weeks"
    }, {
      value: 3,
      text: "a few times a month"
    }, {
      value: 4,
      text: "a few times a year"
    }, {
      value: 5,
      text: "never"
    }
  ];

  setupQuestionOptions(options);
  fixWidths();
  window.scrollTo(0, 1);

  $(window).scroll(function() {
    getPosition();
  });

  $(".subquestion").on("click", function(e) {
    var question = $(e.target).closest('.subquestion'),
        isOption = $(e.target).is('input') || $(e.target).is('label');
    
    if (!$(this).hasClass('current')) {
      /* if they click the input/label of another question (not the current one) it will prevent default behavoir and scroll to that question first */
      if (isOption) {
        e.preventDefault();
      }

      scrollToEl($(this));
    }

  });

  $(".prev").on("click", function(e) {
    e.preventDefault();
    nextQuestion('prev');
  });

  $(".next").on("click", function(e) {
    e.preventDefault();
    nextQuestion('next');
  });
  
  $("input").on("change", function(e) {
    var option = $(this).closest(".option"),
        question = option.closest(".subquestion");

    if (this.checked) {
      option.addClass("selected").siblings().removeClass("selected");

      setTimeout(function() {
        question.addClass('answered');
        gotoQuestion(question.next());
      }, 800);
    }
  });
});
