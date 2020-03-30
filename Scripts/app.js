"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
 * This library was created to emulate some jQuery features
 * used in this template only with Javascript and DOM
 * manipulation functions (IE10+).
 * All methods were designed for an adequate and specific use
 * and don't perform a deep validation on the arguments provided.
 *
 * IMPORTANT:
 * ==========
 * It's suggested NOT to use this library extensively unless you
 * understand what each method does. Instead, use only JS or
 * you might even need jQuery.
 */
(function (global, factory) {
  if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === 'object') {
    // CommonJS-like
    module.exports = factory();
  } else {
    // Browser
    if (typeof global.jQuery === 'undefined') global.$ = factory();
  }
})(window, function () {
  // HELPERS
  function arrayFrom(obj) {
    return 'length' in obj && obj !== window ? [].slice.call(obj) : [obj];
  }

  function _filter(ctx, fn) {
    return [].filter.call(ctx, fn);
  }

  function map(ctx, fn) {
    return [].map.call(ctx, fn);
  }

  function matches(item, selector) {
    return (Element.prototype.matches || Element.prototype.msMatchesSelector).call(item, selector);
  } // Events handler with simple scoped events support


  var EventHandler = function EventHandler() {
    this.events = {};
  };

  EventHandler.prototype = {
    // event accepts: 'click' or 'click.scope'
    bind: function bind(event, listener, target) {
      var type = event.split('.')[0];
      target.addEventListener(type, listener, false);
      this.events[event] = {
        type: type,
        listener: listener
      };
    },
    unbind: function unbind(event, target) {
      if (event in this.events) {
        target.removeEventListener(this.events[event].type, this.events[event].listener, false);
        delete this.events[event];
      }
    }
  }; // Object Definition

  var Wrap = function Wrap(selector) {
    this.selector = selector;
    return this._setup([]);
  }; // CONSTRUCTOR


  Wrap.Constructor = function (param, attrs) {
    var el = new Wrap(param);
    return el.init(attrs);
  }; // Core methods


  Wrap.prototype = {
    constructor: Wrap,

    /**
     * Initialize the object depending on param type
     * [attrs] only to handle $(htmlString, {attributes})
     */
    init: function init(attrs) {
      // empty object
      if (!this.selector) return this; // selector === string

      if (typeof this.selector === 'string') {
        // if looks like markup, try to create an element
        if (this.selector[0] === '<') {
          var elem = this._setup([this._create(this.selector)]);

          return attrs ? elem.attr(attrs) : elem;
        } else return this._setup(arrayFrom(document.querySelectorAll(this.selector)));
      } // selector === DOMElement


      if (this.selector.nodeType) return this._setup([this.selector]);else // shorthand for DOMReady
        if (typeof this.selector === 'function') return this._setup([document]).ready(this.selector); // Array like objects (e.g. NodeList/HTMLCollection)

      return this._setup(arrayFrom(this.selector));
    },

    /**
     * Creates a DOM element from a string
     * Strictly supports the form: '<tag>' or '<tag/>'
     */
    _create: function _create(str) {
      var nodeName = str.substr(str.indexOf('<') + 1, str.indexOf('>') - 1).replace('/', '');
      return document.createElement(nodeName);
    },

    /** setup properties and array to element set */
    _setup: function _setup(elements) {
      var i = 0;

      for (; i < elements.length; i++) {
        delete this[i];
      } // clean up old set


      this.elements = elements;
      this.length = elements.length;

      for (i = 0; i < elements.length; i++) {
        this[i] = elements[i];
      } // new set


      return this;
    },
    _first: function _first(cb, ret) {
      var f = this.elements[0];
      return f ? cb ? cb.call(this, f) : f : ret;
    },

    /** Common function for class manipulation  */
    _classes: function _classes(method, classname) {
      var cls = classname.split(' ');

      if (cls.length > 1) {
        cls.forEach(this._classes.bind(this, method));
      } else {
        if (method === 'contains') {
          var elem = this._first();

          return elem ? elem.classList.contains(classname) : false;
        }

        return classname === '' ? this : this.each(function (i, item) {
          item.classList[method](classname);
        });
      }
    },

    /**
     * Multi purpose function to set or get a (key, value)
     * If no value, works as a getter for the given key
     * key can be an object in the form {key: value, ...}
     */
    _access: function _access(key, value, fn) {
      if (_typeof(key) === 'object') {
        for (var k in key) {
          this._access(k, key[k], fn);
        }
      } else if (value === undefined) {
        return this._first(function (elem) {
          return fn(elem, key);
        });
      }

      return this.each(function (i, item) {
        fn(item, key, value);
      });
    },
    each: function each(fn, arr) {
      arr = arr ? arr : this.elements;

      for (var i = 0; i < arr.length; i++) {
        if (fn.call(arr[i], i, arr[i]) === false) break;
      }

      return this;
    }
  };
  /** Allows to extend with new methods */

  Wrap.extend = function (methods) {
    Object.keys(methods).forEach(function (m) {
      Wrap.prototype[m] = methods[m];
    });
  }; // DOM READY


  Wrap.extend({
    ready: function ready(fn) {
      if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
        fn();
      } else {
        document.addEventListener('DOMContentLoaded', fn);
      }

      return this;
    }
  }); // ACCESS

  Wrap.extend({
    /** Get or set a css value */
    css: function css(key, value) {
      var getStyle = function getStyle(e, k) {
        return e.style[k] || getComputedStyle(e)[k];
      };

      return this._access(key, value, function (item, k, val) {
        var unit = typeof val === 'number' ? 'px' : '';
        return val === undefined ? getStyle(item, k) : item.style[k] = val + unit;
      });
    },

    /** Get an attribute or set it */
    attr: function attr(key, value) {
      return this._access(key, value, function (item, k, val) {
        return val === undefined ? item.getAttribute(k) : item.setAttribute(k, val);
      });
    },

    /** Get a property or set it */
    prop: function prop(key, value) {
      return this._access(key, value, function (item, k, val) {
        return val === undefined ? item[k] : item[k] = val;
      });
    },
    position: function position() {
      return this._first(function (elem) {
        return {
          left: elem.offsetLeft,
          top: elem.offsetTop
        };
      });
    },
    scrollTop: function scrollTop(value) {
      return this._access('scrollTop', value, function (item, k, val) {
        return val === undefined ? item[k] : item[k] = val;
      });
    },
    outerHeight: function outerHeight(includeMargin) {
      return this._first(function (elem) {
        var style = getComputedStyle(elem);
        var margins = includeMargin ? parseInt(style.marginTop, 10) + parseInt(style.marginBottom, 10) : 0;
        return elem.offsetHeight + margins;
      });
    },

    /**
     * Find the position of the first element in the set
     * relative to its sibling elements.
     */
    index: function index() {
      return this._first(function (el) {
        return arrayFrom(el.parentNode.children).indexOf(el);
      }, -1);
    }
  }); // LOOKUP

  Wrap.extend({
    children: function children(selector) {
      var childs = [];
      this.each(function (i, item) {
        childs = childs.concat(map(item.children, function (item) {
          return item;
        }));
      });
      return Wrap.Constructor(childs).filter(selector);
    },
    siblings: function siblings() {
      var sibs = [];
      this.each(function (i, item) {
        sibs = sibs.concat(_filter(item.parentNode.children, function (child) {
          return child !== item;
        }));
      });
      return Wrap.Constructor(sibs);
    },

    /** Return the parent of each element in the current set */
    parent: function parent() {
      var par = map(this.elements, function (item) {
        return item.parentNode;
      });
      return Wrap.Constructor(par);
    },

    /** Return ALL parents of each element in the current set */
    parents: function parents(selector) {
      var par = [];
      this.each(function (i, item) {
        for (var p = item.parentElement; p; p = p.parentElement) {
          par.push(p);
        }
      });
      return Wrap.Constructor(par).filter(selector);
    },

    /**
     * Get the descendants of each element in the set, filtered by a selector
     * Selector can't start with ">" (:scope not supported on IE).
     */
    find: function find(selector) {
      var found = [];
      this.each(function (i, item) {
        found = found.concat(map(item.querySelectorAll(
        /*':scope ' + */
        selector), function (fitem) {
          return fitem;
        }));
      });
      return Wrap.Constructor(found);
    },

    /** filter the actual set based on given selector */
    filter: function filter(selector) {
      if (!selector) return this;

      var res = _filter(this.elements, function (item) {
        return matches(item, selector);
      });

      return Wrap.Constructor(res);
    },

    /** Works only with a string selector */
    is: function is(selector) {
      var found = false;
      this.each(function (i, item) {
        return !(found = matches(item, selector));
      });
      return found;
    }
  }); // ELEMENTS

  Wrap.extend({
    /**
     * append current set to given node
     * expects a dom node or set
     * if element is a set, prepends only the first
     */
    appendTo: function appendTo(elem) {
      elem = elem.nodeType ? elem : elem._first();
      return this.each(function (i, item) {
        elem.appendChild(item);
      });
    },

    /**
     * Append a domNode to each element in the set
     * if element is a set, append only the first
     */
    append: function append(elem) {
      elem = elem.nodeType ? elem : elem._first();
      return this.each(function (i, item) {
        item.appendChild(elem);
      });
    },

    /**
     * Insert the current set of elements after the element
     * that matches the given selector in param
     */
    insertAfter: function insertAfter(selector) {
      var target = document.querySelector(selector);
      return this.each(function (i, item) {
        target.parentNode.insertBefore(item, target.nextSibling);
      });
    },

    /**
     * Clones all element in the set
     * returns a new set with the cloned elements
     */
    clone: function clone() {
      var clones = map(this.elements, function (item) {
        return item.cloneNode(true);
      });
      return Wrap.Constructor(clones);
    },

    /** Remove all node in the set from DOM. */
    remove: function remove() {
      this.each(function (i, item) {
        delete item.events;
        delete item.data;
        if (item.parentNode) item.parentNode.removeChild(item);
      });

      this._setup([]);
    }
  }); // DATASETS

  Wrap.extend({
    /**
     * Expected key in camelCase format
     * if value provided save data into element set
     * if not, return data for the first element
     */
    data: function data(key, value) {
      var hasJSON = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
          dataAttr = 'data-' + key.replace(/[A-Z]/g, '-$&').toLowerCase();

      if (value === undefined) {
        return this._first(function (el) {
          if (el.data && el.data[key]) return el.data[key];else {
            var data = el.getAttribute(dataAttr);
            if (data === 'true') return true;
            if (data === 'false') return false;
            if (data === +data + '') return +data;
            if (hasJSON.test(data)) return JSON.parse(data);
            return data;
          }
        });
      } else {
        return this.each(function (i, item) {
          item.data = item.data || {};
          item.data[key] = value;
        });
      }
    }
  }); // EVENTS

  Wrap.extend({
    trigger: function trigger(type) {
      type = type.split('.')[0]; // ignore namespace

      var event = document.createEvent('HTMLEvents');
      event.initEvent(type, true, false);
      return this.each(function (i, item) {
        item.dispatchEvent(event);
      });
    },
    blur: function blur() {
      return this.trigger('blur');
    },
    focus: function focus() {
      return this.trigger('focus');
    },
    on: function on(event, callback) {
      return this.each(function (i, item) {
        if (!item.events) item.events = new EventHandler();
        event.split(' ').forEach(function (ev) {
          item.events.bind(ev, callback, item);
        });
      });
    },
    off: function off(event) {
      return this.each(function (i, item) {
        if (item.events) {
          item.events.unbind(event, item);
          delete item.events;
        }
      });
    }
  }); // CLASSES

  Wrap.extend({
    toggleClass: function toggleClass(classname) {
      return this._classes('toggle', classname);
    },
    addClass: function addClass(classname) {
      return this._classes('add', classname);
    },
    removeClass: function removeClass(classname) {
      return this._classes('remove', classname);
    },
    hasClass: function hasClass(classname) {
      return this._classes('contains', classname);
    }
  });
  /**
   * Some basic features in this template relies on Bootstrap
   * plugins, like Collapse, Dropdown and Tab.
   * Below code emulates plugins behavior by toggling classes
   * from elements to allow a minimum interaction without animation.
   * - Only Collapse is required which is used by the sidebar.
   * - Tab and Dropdown are optional features.
   */
  // Emulate jQuery symbol to simplify usage

  var $ = Wrap.Constructor; // Emulates Collapse plugin

  Wrap.extend({
    collapse: function collapse(action) {
      return this.each(function (i, item) {
        var $item = $(item).trigger(action + '.bs.collapse');
        if (action === 'toggle') $item.collapse($item.hasClass('show') ? 'hide' : 'show');else $item[action === 'show' ? 'addClass' : 'removeClass']('show');
      });
    }
  }); // Initializations

  $('[data-toggle]').on('click', function (e) {
    var target = $(e.currentTarget);
    if (target.is('a')) e.preventDefault();

    switch (target.data('toggle')) {
      case 'collapse':
        $(target.attr('href')).collapse('toggle');
        break;

      case 'tab':
        target.parent().parent().find('.active').removeClass('active');
        target.addClass('active');
        var tabPane = $(target.attr('href'));
        tabPane.siblings().removeClass('active show');
        tabPane.addClass('active show');
        break;

      case 'dropdown':
        var dd = target.parent().toggleClass('show');
        dd.find('.dropdown-menu').toggleClass('show');
        break;

      default:
        break;
    }
  });
  return Wrap.Constructor;
});
/*!
 *
 * Angle - Bootstrap Admin Template
 *
 * Version: 4.7.1
 * Author: @themicon_co
 * Website: http://themicon.co
 * License: https://wrapbootstrap.com/help/licenses
 *
 */


(function () {
  'use strict';

  $(function () {
    // Restore body classes
    // -----------------------------------
    var $body = $('body');
    new StateToggler().restoreState($body); // enable settings toggle after restore

    $('#chk-fixed').prop('checked', $body.hasClass('layout-fixed'));
    $('#chk-collapsed').prop('checked', $body.hasClass('aside-collapsed'));
    $('#chk-collapsed-text').prop('checked', $body.hasClass('aside-collapsed-text'));
    $('#chk-boxed').prop('checked', $body.hasClass('layout-boxed'));
    $('#chk-float').prop('checked', $body.hasClass('aside-float'));
    $('#chk-hover').prop('checked', $body.hasClass('aside-hover')); // When ready display the offsidebar

    $('.offsidebar.d-none').removeClass('d-none');
  }); // doc ready
})(); // Knob chart
// -----------------------------------


(function () {
  'use strict';

  $(initKnob);

  function initKnob() {
    if (!$.fn.knob) return;
    var knobLoaderOptions1 = {
      width: '50%',
      // responsive
      displayInput: true,
      fgColor: APP_COLORS['info']
    };
    $('#knob-chart1').knob(knobLoaderOptions1);
    var knobLoaderOptions2 = {
      width: '50%',
      // responsive
      displayInput: true,
      fgColor: APP_COLORS['purple'],
      readOnly: true
    };
    $('#knob-chart2').knob(knobLoaderOptions2);
    var knobLoaderOptions3 = {
      width: '50%',
      // responsive
      displayInput: true,
      fgColor: APP_COLORS['info'],
      bgColor: APP_COLORS['gray'],
      angleOffset: -125,
      angleArc: 250
    };
    $('#knob-chart3').knob(knobLoaderOptions3);
    var knobLoaderOptions4 = {
      width: '50%',
      // responsive
      displayInput: true,
      fgColor: APP_COLORS['pink'],
      displayPrevious: true,
      thickness: 0.1,
      lineCap: 'round'
    };
    $('#knob-chart4').knob(knobLoaderOptions4);
  }
})(); // Chart JS
// -----------------------------------


(function () {
  'use strict';

  $(initChartJS);

  function initChartJS() {
    if (typeof Chart === 'undefined') return; // random values for demo

    var rFactor = function rFactor() {
      return Math.round(Math.random() * 100);
    }; // Line chart
    // -----------------------------------


    var lineData = {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [{
        label: 'My First dataset',
        backgroundColor: 'rgba(114,102,186,0.2)',
        borderColor: 'rgba(114,102,186,1)',
        pointBorderColor: '#fff',
        data: [rFactor(), rFactor(), rFactor(), rFactor(), rFactor(), rFactor(), rFactor()]
      }, {
        label: 'My Second dataset',
        backgroundColor: 'rgba(35,183,229,0.2)',
        borderColor: 'rgba(35,183,229,1)',
        pointBorderColor: '#fff',
        data: [rFactor(), rFactor(), rFactor(), rFactor(), rFactor(), rFactor(), rFactor()]
      }]
    };
    var lineOptions = {
      legend: {
        display: false
      }
    };
    var linectx = document.getElementById('chartjs-linechart').getContext('2d');
    var lineChart = new Chart(linectx, {
      data: lineData,
      type: 'line',
      options: lineOptions
    }); // Bar chart
    // -----------------------------------

    var barData = {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [{
        backgroundColor: '#23b7e5',
        borderColor: '#23b7e5',
        data: [rFactor(), rFactor(), rFactor(), rFactor(), rFactor(), rFactor(), rFactor()]
      }, {
        backgroundColor: '#5d9cec',
        borderColor: '#5d9cec',
        data: [rFactor(), rFactor(), rFactor(), rFactor(), rFactor(), rFactor(), rFactor()]
      }]
    };
    var barOptions = {
      legend: {
        display: false
      }
    };
    var barctx = document.getElementById('chartjs-barchart').getContext('2d');
    var barChart = new Chart(barctx, {
      data: barData,
      type: 'bar',
      options: barOptions
    }); //  Doughnut chart
    // -----------------------------------

    var doughnutData = {
      labels: ['Purple', 'Yellow', 'Blue'],
      datasets: [{
        data: [300, 50, 100],
        backgroundColor: ['#7266ba', '#fad732', '#23b7e5'],
        hoverBackgroundColor: ['#7266ba', '#fad732', '#23b7e5']
      }]
    };
    var doughnutOptions = {
      legend: {
        display: false
      }
    };
    var doughnutctx = document.getElementById('chartjs-doughnutchart').getContext('2d');
    var doughnutChart = new Chart(doughnutctx, {
      data: doughnutData,
      type: 'doughnut',
      options: doughnutOptions
    }); // Pie chart
    // -----------------------------------

    var pieData = {
      labels: ['Purple', 'Yellow', 'Blue'],
      datasets: [{
        data: [300, 50, 100],
        backgroundColor: ['#7266ba', '#fad732', '#23b7e5'],
        hoverBackgroundColor: ['#7266ba', '#fad732', '#23b7e5']
      }]
    };
    var pieOptions = {
      legend: {
        display: false
      }
    };
    var piectx = document.getElementById('chartjs-piechart').getContext('2d');
    var pieChart = new Chart(piectx, {
      data: pieData,
      type: 'pie',
      options: pieOptions
    }); // Polar chart
    // -----------------------------------

    var polarData = {
      datasets: [{
        data: [11, 16, 7, 3],
        backgroundColor: ['#f532e5', '#7266ba', '#f532e5', '#7266ba'],
        label: 'My dataset' // for legend

      }],
      labels: ['Label 1', 'Label 2', 'Label 3', 'Label 4']
    };
    var polarOptions = {
      legend: {
        display: false
      }
    };
    var polarctx = document.getElementById('chartjs-polarchart').getContext('2d');
    var polarChart = new Chart(polarctx, {
      data: polarData,
      type: 'polarArea',
      options: polarOptions
    }); // Radar chart
    // -----------------------------------

    var radarData = {
      labels: ['Eating', 'Drinking', 'Sleeping', 'Designing', 'Coding', 'Cycling', 'Running'],
      datasets: [{
        label: 'My First dataset',
        backgroundColor: 'rgba(114,102,186,0.2)',
        borderColor: 'rgba(114,102,186,1)',
        data: [65, 59, 90, 81, 56, 55, 40]
      }, {
        label: 'My Second dataset',
        backgroundColor: 'rgba(151,187,205,0.2)',
        borderColor: 'rgba(151,187,205,1)',
        data: [28, 48, 40, 19, 96, 27, 100]
      }]
    };
    var radarOptions = {
      legend: {
        display: false
      }
    };
    var radarctx = document.getElementById('chartjs-radarchart').getContext('2d');
    var radarChart = new Chart(radarctx, {
      data: radarData,
      type: 'radar',
      options: radarOptions
    });
  }
})(); // Chartist
// -----------------------------------


(function () {
  'use strict';

  $(initChartists);

  function initChartists() {
    if (typeof Chartist === 'undefined') return; // Bar bipolar
    // -----------------------------------

    var data1 = {
      labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10'],
      series: [[1, 2, 4, 8, 6, -2, -1, -4, -6, -2]]
    };
    var options1 = {
      high: 10,
      low: -10,
      height: 280,
      axisX: {
        labelInterpolationFnc: function labelInterpolationFnc(value, index) {
          return index % 2 === 0 ? value : null;
        }
      }
    };
    new Chartist.Bar('#ct-bar1', data1, options1); // Bar Horizontal
    // -----------------------------------

    new Chartist.Bar('#ct-bar2', {
      labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      series: [[5, 4, 3, 7, 5, 10, 3], [3, 2, 9, 5, 4, 6, 4]]
    }, {
      seriesBarDistance: 10,
      reverseData: true,
      horizontalBars: true,
      height: 280,
      axisY: {
        offset: 70
      }
    }); // Line
    // -----------------------------------

    new Chartist.Line('#ct-line1', {
      labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      series: [[12, 9, 7, 8, 5], [2, 1, 3.5, 7, 3], [1, 3, 4, 5, 6]]
    }, {
      fullWidth: true,
      height: 280,
      chartPadding: {
        right: 40
      }
    }); // SVG Animation
    // -----------------------------------

    var chart1 = new Chartist.Line('#ct-line3', {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      series: [[1, 5, 2, 5, 4, 3], [2, 3, 4, 8, 1, 2], [5, 4, 3, 2, 1, 0.5]]
    }, {
      low: 0,
      showArea: true,
      showPoint: false,
      fullWidth: true,
      height: 300
    });
    chart1.on('draw', function (data) {
      if (data.type === 'line' || data.type === 'area') {
        data.element.animate({
          d: {
            begin: 2000 * data.index,
            dur: 2000,
            from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
            to: data.path.clone().stringify(),
            easing: Chartist.Svg.Easing.easeOutQuint
          }
        });
      }
    }); // Slim animation
    // -----------------------------------

    var chart = new Chartist.Line('#ct-line2', {
      labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      series: [[12, 9, 7, 8, 5, 4, 6, 2, 3, 3, 4, 6], [4, 5, 3, 7, 3, 5, 5, 3, 4, 4, 5, 5], [5, 3, 4, 5, 6, 3, 3, 4, 5, 6, 3, 4], [3, 4, 5, 6, 7, 6, 4, 5, 6, 7, 6, 3]]
    }, {
      low: 0,
      height: 300
    }); // Let's put a sequence number aside so we can use it in the event callbacks

    var seq = 0,
        delays = 80,
        durations = 500; // Once the chart is fully created we reset the sequence

    chart.on('created', function () {
      seq = 0;
    }); // On each drawn element by Chartist we use the Chartist.Svg API to trigger SMIL animations

    chart.on('draw', function (data) {
      seq++;

      if (data.type === 'line') {
        // If the drawn element is a line we do a simple opacity fade in. This could also be achieved using CSS3 animations.
        data.element.animate({
          opacity: {
            // The delay when we like to start the animation
            begin: seq * delays + 1000,
            // Duration of the animation
            dur: durations,
            // The value where the animation should start
            from: 0,
            // The value where it should end
            to: 1
          }
        });
      } else if (data.type === 'label' && data.axis === 'x') {
        data.element.animate({
          y: {
            begin: seq * delays,
            dur: durations,
            from: data.y + 100,
            to: data.y,
            // We can specify an easing function from Chartist.Svg.Easing
            easing: 'easeOutQuart'
          }
        });
      } else if (data.type === 'label' && data.axis === 'y') {
        data.element.animate({
          x: {
            begin: seq * delays,
            dur: durations,
            from: data.x - 100,
            to: data.x,
            easing: 'easeOutQuart'
          }
        });
      } else if (data.type === 'point') {
        data.element.animate({
          x1: {
            begin: seq * delays,
            dur: durations,
            from: data.x - 10,
            to: data.x,
            easing: 'easeOutQuart'
          },
          x2: {
            begin: seq * delays,
            dur: durations,
            from: data.x - 10,
            to: data.x,
            easing: 'easeOutQuart'
          },
          opacity: {
            begin: seq * delays,
            dur: durations,
            from: 0,
            to: 1,
            easing: 'easeOutQuart'
          }
        });
      } else if (data.type === 'grid') {
        // Using data.axis we get x or y which we can use to construct our animation definition objects
        var pos1Animation = {
          begin: seq * delays,
          dur: durations,
          from: data[data.axis.units.pos + '1'] - 30,
          to: data[data.axis.units.pos + '1'],
          easing: 'easeOutQuart'
        };
        var pos2Animation = {
          begin: seq * delays,
          dur: durations,
          from: data[data.axis.units.pos + '2'] - 100,
          to: data[data.axis.units.pos + '2'],
          easing: 'easeOutQuart'
        };
        var animations = {};
        animations[data.axis.units.pos + '1'] = pos1Animation;
        animations[data.axis.units.pos + '2'] = pos2Animation;
        animations['opacity'] = {
          begin: seq * delays,
          dur: durations,
          from: 0,
          to: 1,
          easing: 'easeOutQuart'
        };
        data.element.animate(animations);
      }
    }); // For the sake of the example we update the chart every time it's created with a delay of 10 seconds

    chart.on('created', function () {
      if (window.__exampleAnimateTimeout) {
        clearTimeout(window.__exampleAnimateTimeout);
        window.__exampleAnimateTimeout = null;
      }

      window.__exampleAnimateTimeout = setTimeout(chart.update.bind(chart), 12000);
    });
  }
})(); // Easypie chart Loader
// -----------------------------------


(function () {
  'use strict';

  $(initEasyPieChart);

  function initEasyPieChart() {
    if (!$.fn.easyPieChart) return; // Usage via data attributes
    // <div class="easypie-chart" data-easypiechart data-percent="X" data-optionName="value"></div>

    $('[data-easypiechart]').each(function () {
      var $elem = $(this);
      var options = $elem.data();
      $elem.easyPieChart(options || {});
    }); // programmatic usage

    var pieOptions1 = {
      animate: {
        duration: 800,
        enabled: true
      },
      barColor: APP_COLORS['success'],
      trackColor: false,
      scaleColor: false,
      lineWidth: 10,
      lineCap: 'circle'
    };
    $('#easypie1').easyPieChart(pieOptions1);
    var pieOptions2 = {
      animate: {
        duration: 800,
        enabled: true
      },
      barColor: APP_COLORS['warning'],
      trackColor: false,
      scaleColor: false,
      lineWidth: 4,
      lineCap: 'circle'
    };
    $('#easypie2').easyPieChart(pieOptions2);
    var pieOptions3 = {
      animate: {
        duration: 800,
        enabled: true
      },
      barColor: APP_COLORS['danger'],
      trackColor: false,
      scaleColor: APP_COLORS['gray'],
      lineWidth: 15,
      lineCap: 'circle'
    };
    $('#easypie3').easyPieChart(pieOptions3);
    var pieOptions4 = {
      animate: {
        duration: 800,
        enabled: true
      },
      barColor: APP_COLORS['danger'],
      trackColor: APP_COLORS['yellow'],
      scaleColor: APP_COLORS['gray-dark'],
      lineWidth: 15,
      lineCap: 'circle'
    };
    $('#easypie4').easyPieChart(pieOptions4);
  }
})(); // CHART SPLINE
// -----------------------------------


(function () {
  'use strict';

  $(initFlotSpline);

  function initFlotSpline() {
    var data = [{
      "label": "Uniques",
      "color": "#768294",
      "data": [["Mar", 70], ["Apr", 85], ["May", 59], ["Jun", 93], ["Jul", 66], ["Aug", 86], ["Sep", 60]]
    }, {
      "label": "Recurrent",
      "color": "#1f92fe",
      "data": [["Mar", 21], ["Apr", 12], ["May", 27], ["Jun", 24], ["Jul", 16], ["Aug", 39], ["Sep", 15]]
    }];
    var datav2 = [{
      "label": "Hours",
      "color": "#23b7e5",
      "data": [["Jan", 70], ["Feb", 20], ["Mar", 70], ["Apr", 85], ["May", 59], ["Jun", 93], ["Jul", 66], ["Aug", 86], ["Sep", 60], ["Oct", 60], ["Nov", 12], ["Dec", 50]]
    }, {
      "label": "Commits",
      "color": "#7266ba",
      "data": [["Jan", 20], ["Feb", 70], ["Mar", 30], ["Apr", 50], ["May", 85], ["Jun", 43], ["Jul", 96], ["Aug", 36], ["Sep", 80], ["Oct", 10], ["Nov", 72], ["Dec", 31]]
    }];
    var datav3 = [{
      "label": "Home",
      "color": "#1ba3cd",
      "data": [["1", 38], ["2", 40], ["3", 42], ["4", 48], ["5", 50], ["6", 70], ["7", 145], ["8", 70], ["9", 59], ["10", 48], ["11", 38], ["12", 29], ["13", 30], ["14", 22], ["15", 28]]
    }, {
      "label": "Overall",
      "color": "#3a3f51",
      "data": [["1", 16], ["2", 18], ["3", 17], ["4", 16], ["5", 30], ["6", 110], ["7", 19], ["8", 18], ["9", 110], ["10", 19], ["11", 16], ["12", 10], ["13", 20], ["14", 10], ["15", 20]]
    }];
    var options = {
      series: {
        lines: {
          show: false
        },
        points: {
          show: true,
          radius: 4
        },
        splines: {
          show: true,
          tension: 0.4,
          lineWidth: 1,
          fill: 0.5
        }
      },
      grid: {
        borderColor: '#eee',
        borderWidth: 1,
        hoverable: true,
        backgroundColor: '#fcfcfc'
      },
      tooltip: true,
      tooltipOpts: {
        content: function content(label, x, y) {
          return x + ' : ' + y;
        }
      },
      xaxis: {
        tickColor: '#fcfcfc',
        mode: 'categories'
      },
      yaxis: {
        min: 0,
        max: 150,
        // optional: use it for a clear represetation
        tickColor: '#eee',
        //position: 'right' or 'left',
        tickFormatter: function tickFormatter(v) {
          return v
          /* + ' visitors'*/
          ;
        }
      },
      shadowSize: 0
    };
    var chart = $('.chart-spline');
    if (chart.length) $.plot(chart, data, options);
    var chartv2 = $('.chart-splinev2');
    if (chartv2.length) $.plot(chartv2, datav2, options);
    var chartv3 = $('.chart-splinev3');
    if (chartv3.length) $.plot(chartv3, datav3, options);
  }
})(); // CHART AREA
// -----------------------------------


(function () {
  'use strict';

  $(initFlotArea);

  function initFlotArea() {
    var data = [{
      "label": "Uniques",
      "color": "#aad874",
      "data": [["Mar", 50], ["Apr", 84], ["May", 52], ["Jun", 88], ["Jul", 69], ["Aug", 92], ["Sep", 58]]
    }, {
      "label": "Recurrent",
      "color": "#7dc7df",
      "data": [["Mar", 13], ["Apr", 44], ["May", 44], ["Jun", 27], ["Jul", 38], ["Aug", 11], ["Sep", 39]]
    }];
    var options = {
      series: {
        lines: {
          show: true,
          fill: 0.8
        },
        points: {
          show: true,
          radius: 4
        }
      },
      grid: {
        borderColor: '#eee',
        borderWidth: 1,
        hoverable: true,
        backgroundColor: '#fcfcfc'
      },
      tooltip: true,
      tooltipOpts: {
        content: function content(label, x, y) {
          return x + ' : ' + y;
        }
      },
      xaxis: {
        tickColor: '#fcfcfc',
        mode: 'categories'
      },
      yaxis: {
        min: 0,
        tickColor: '#eee',
        // position: 'right' or 'left'
        tickFormatter: function tickFormatter(v) {
          return v + ' visitors';
        }
      },
      shadowSize: 0
    };
    var chart = $('.chart-area');
    if (chart.length) $.plot(chart, data, options);
  }
})(); // CHART BAR
// -----------------------------------


(function () {
  'use strict';

  $(initFlotBar);

  function initFlotBar() {
    var data = [{
      "label": "Sales",
      "color": "#9cd159",
      "data": [["Jan", 27], ["Feb", 82], ["Mar", 56], ["Apr", 14], ["May", 28], ["Jun", 77], ["Jul", 23], ["Aug", 49], ["Sep", 81], ["Oct", 20]]
    }];
    var options = {
      series: {
        bars: {
          align: 'center',
          lineWidth: 0,
          show: true,
          barWidth: 0.6,
          fill: 0.9
        }
      },
      grid: {
        borderColor: '#eee',
        borderWidth: 1,
        hoverable: true,
        backgroundColor: '#fcfcfc'
      },
      tooltip: true,
      tooltipOpts: {
        content: function content(label, x, y) {
          return x + ' : ' + y;
        }
      },
      xaxis: {
        tickColor: '#fcfcfc',
        mode: 'categories'
      },
      yaxis: {
        // position: 'right' or 'left'
        tickColor: '#eee'
      },
      shadowSize: 0
    };
    var chart = $('.chart-bar');
    if (chart.length) $.plot(chart, data, options);
  }
})(); // CHART BAR STACKED
// -----------------------------------


(function () {
  'use strict';

  $(initFlotBarStacked);

  function initFlotBarStacked() {
    var data = [{
      "label": "Tweets",
      "color": "#51bff2",
      "data": [["Jan", 56], ["Feb", 81], ["Mar", 97], ["Apr", 44], ["May", 24], ["Jun", 85], ["Jul", 94], ["Aug", 78], ["Sep", 52], ["Oct", 17], ["Nov", 90], ["Dec", 62]]
    }, {
      "label": "Likes",
      "color": "#4a8ef1",
      "data": [["Jan", 69], ["Feb", 135], ["Mar", 14], ["Apr", 100], ["May", 100], ["Jun", 62], ["Jul", 115], ["Aug", 22], ["Sep", 104], ["Oct", 132], ["Nov", 72], ["Dec", 61]]
    }, {
      "label": "+1",
      "color": "#f0693a",
      "data": [["Jan", 29], ["Feb", 36], ["Mar", 47], ["Apr", 21], ["May", 5], ["Jun", 49], ["Jul", 37], ["Aug", 44], ["Sep", 28], ["Oct", 9], ["Nov", 12], ["Dec", 35]]
    }];
    var datav2 = [{
      "label": "Pending",
      "color": "#9289ca",
      "data": [["Pj1", 86], ["Pj2", 136], ["Pj3", 97], ["Pj4", 110], ["Pj5", 62], ["Pj6", 85], ["Pj7", 115], ["Pj8", 78], ["Pj9", 104], ["Pj10", 82], ["Pj11", 97], ["Pj12", 110], ["Pj13", 62]]
    }, {
      "label": "Assigned",
      "color": "#7266ba",
      "data": [["Pj1", 49], ["Pj2", 81], ["Pj3", 47], ["Pj4", 44], ["Pj5", 100], ["Pj6", 49], ["Pj7", 94], ["Pj8", 44], ["Pj9", 52], ["Pj10", 17], ["Pj11", 47], ["Pj12", 44], ["Pj13", 100]]
    }, {
      "label": "Completed",
      "color": "#564aa3",
      "data": [["Pj1", 29], ["Pj2", 56], ["Pj3", 14], ["Pj4", 21], ["Pj5", 5], ["Pj6", 24], ["Pj7", 37], ["Pj8", 22], ["Pj9", 28], ["Pj10", 9], ["Pj11", 14], ["Pj12", 21], ["Pj13", 5]]
    }];
    var options = {
      series: {
        stack: true,
        bars: {
          align: 'center',
          lineWidth: 0,
          show: true,
          barWidth: 0.6,
          fill: 0.9
        }
      },
      grid: {
        borderColor: '#eee',
        borderWidth: 1,
        hoverable: true,
        backgroundColor: '#fcfcfc'
      },
      tooltip: true,
      tooltipOpts: {
        content: function content(label, x, y) {
          return x + ' : ' + y;
        }
      },
      xaxis: {
        tickColor: '#fcfcfc',
        mode: 'categories'
      },
      yaxis: {
        // position: 'right' or 'left'
        tickColor: '#eee'
      },
      shadowSize: 0
    };
    var chart = $('.chart-bar-stacked');
    if (chart.length) $.plot(chart, data, options);
    var chartv2 = $('.chart-bar-stackedv2');
    if (chartv2.length) $.plot(chartv2, datav2, options);
  }
})(); // CHART DONUT
// -----------------------------------


(function () {
  'use strict';

  $(initFlotDonut);

  function initFlotDonut() {
    var data = [{
      "color": "#39C558",
      "data": 60,
      "label": "Coffee"
    }, {
      "color": "#00b4ff",
      "data": 90,
      "label": "CSS"
    }, {
      "color": "#FFBE41",
      "data": 50,
      "label": "LESS"
    }, {
      "color": "#ff3e43",
      "data": 80,
      "label": "Jade"
    }, {
      "color": "#937fc7",
      "data": 116,
      "label": "AngularJS"
    }];
    var options = {
      series: {
        pie: {
          show: true,
          innerRadius: 0.5 // This makes the donut shape

        }
      }
    };
    var chart = $('.chart-donut');
    if (chart.length) $.plot(chart, data, options);
  }
})(); // CHART LINE
// -----------------------------------


(function () {
  'use strict';

  $(initFlotLine);

  function initFlotLine() {
    var data = [{
      "label": "Complete",
      "color": "#5ab1ef",
      "data": [["Jan", 188], ["Feb", 183], ["Mar", 185], ["Apr", 199], ["May", 190], ["Jun", 194], ["Jul", 194], ["Aug", 184], ["Sep", 74]]
    }, {
      "label": "In Progress",
      "color": "#f5994e",
      "data": [["Jan", 153], ["Feb", 116], ["Mar", 136], ["Apr", 119], ["May", 148], ["Jun", 133], ["Jul", 118], ["Aug", 161], ["Sep", 59]]
    }, {
      "label": "Cancelled",
      "color": "#d87a80",
      "data": [["Jan", 111], ["Feb", 97], ["Mar", 93], ["Apr", 110], ["May", 102], ["Jun", 93], ["Jul", 92], ["Aug", 92], ["Sep", 44]]
    }];
    var options = {
      series: {
        lines: {
          show: true,
          fill: 0.01
        },
        points: {
          show: true,
          radius: 4
        }
      },
      grid: {
        borderColor: '#eee',
        borderWidth: 1,
        hoverable: true,
        backgroundColor: '#fcfcfc'
      },
      tooltip: true,
      tooltipOpts: {
        content: function content(label, x, y) {
          return x + ' : ' + y;
        }
      },
      xaxis: {
        tickColor: '#eee',
        mode: 'categories'
      },
      yaxis: {
        // position: 'right' or 'left'
        tickColor: '#eee'
      },
      shadowSize: 0
    };
    var chart = $('.chart-line');
    if (chart.length) $.plot(chart, data, options);
  }
})(); // CHART PIE
// -----------------------------------


(function () {
  'use strict';

  $(initFlotPie);

  function initFlotPie() {
    var data = [{
      "label": "jQuery",
      "color": "#4acab4",
      "data": 30
    }, {
      "label": "CSS",
      "color": "#ffea88",
      "data": 40
    }, {
      "label": "LESS",
      "color": "#ff8153",
      "data": 90
    }, {
      "label": "SASS",
      "color": "#878bb6",
      "data": 75
    }, {
      "label": "Jade",
      "color": "#b2d767",
      "data": 120
    }];
    var options = {
      series: {
        pie: {
          show: true,
          innerRadius: 0,
          label: {
            show: true,
            radius: 0.8,
            formatter: function formatter(label, series) {
              return '<div class="flot-pie-label">' + //label + ' : ' +
              Math.round(series.percent) + '%</div>';
            },
            background: {
              opacity: 0.8,
              color: '#222'
            }
          }
        }
      }
    };
    var chart = $('.chart-pie');
    if (chart.length) $.plot(chart, data, options);
  }
})(); // Morris
// -----------------------------------


(function () {
  'use strict';

  $(initMorris);

  function initMorris() {
    if (typeof Morris === 'undefined') return;
    var chartdata = [{
      y: "2006",
      a: 100,
      b: 90
    }, {
      y: "2007",
      a: 75,
      b: 65
    }, {
      y: "2008",
      a: 50,
      b: 40
    }, {
      y: "2009",
      a: 75,
      b: 65
    }, {
      y: "2010",
      a: 50,
      b: 40
    }, {
      y: "2011",
      a: 75,
      b: 65
    }, {
      y: "2012",
      a: 100,
      b: 90
    }];
    var donutdata = [{
      label: "Download Sales",
      value: 12
    }, {
      label: "In-Store Sales",
      value: 30
    }, {
      label: "Mail-Order Sales",
      value: 20
    }]; // Line Chart
    // -----------------------------------

    new Morris.Line({
      element: 'morris-line',
      data: chartdata,
      xkey: 'y',
      ykeys: ["a", "b"],
      labels: ["Serie A", "Serie B"],
      lineColors: ["#31C0BE", "#7a92a3"],
      resize: true
    }); // Donut Chart
    // -----------------------------------

    new Morris.Donut({
      element: 'morris-donut',
      data: donutdata,
      colors: ['#f05050', '#fad732', '#ff902b'],
      resize: true
    }); // Bar Chart
    // -----------------------------------

    new Morris.Bar({
      element: 'morris-bar',
      data: chartdata,
      xkey: 'y',
      ykeys: ["a", "b"],
      labels: ["Series A", "Series B"],
      xLabelMargin: 2,
      barColors: ['#23b7e5', '#f05050'],
      resize: true
    }); // Area Chart
    // -----------------------------------

    new Morris.Area({
      element: 'morris-area',
      data: chartdata,
      xkey: 'y',
      ykeys: ["a", "b"],
      labels: ["Serie A", "Serie B"],
      lineColors: ['#7266ba', '#23b7e5'],
      resize: true
    });
  }
})(); // Rickshaw
// -----------------------------------


(function () {
  'use strict';

  $(initMorris);

  function initMorris() {
    if (typeof Rickshaw === 'undefined') return;
    var seriesData = [[], [], []];
    var random = new Rickshaw.Fixtures.RandomData(150);

    for (var i = 0; i < 150; i++) {
      random.addData(seriesData);
    }

    var series1 = [{
      color: "#c05020",
      data: seriesData[0],
      name: 'New York'
    }, {
      color: "#30c020",
      data: seriesData[1],
      name: 'London'
    }, {
      color: "#6060c0",
      data: seriesData[2],
      name: 'Tokyo'
    }];
    var graph1 = new Rickshaw.Graph({
      element: document.querySelector("#rickshaw1"),
      series: series1,
      renderer: 'area'
    });
    graph1.render(); // Graph 2
    // -----------------------------------

    var graph2 = new Rickshaw.Graph({
      element: document.querySelector("#rickshaw2"),
      renderer: 'area',
      stroke: true,
      series: [{
        data: [{
          x: 0,
          y: 40
        }, {
          x: 1,
          y: 49
        }, {
          x: 2,
          y: 38
        }, {
          x: 3,
          y: 30
        }, {
          x: 4,
          y: 32
        }],
        color: '#f05050'
      }, {
        data: [{
          x: 0,
          y: 40
        }, {
          x: 1,
          y: 49
        }, {
          x: 2,
          y: 38
        }, {
          x: 3,
          y: 30
        }, {
          x: 4,
          y: 32
        }],
        color: '#fad732'
      }]
    });
    graph2.render(); // Graph 3
    // -----------------------------------

    var graph3 = new Rickshaw.Graph({
      element: document.querySelector("#rickshaw3"),
      renderer: 'line',
      series: [{
        data: [{
          x: 0,
          y: 40
        }, {
          x: 1,
          y: 49
        }, {
          x: 2,
          y: 38
        }, {
          x: 3,
          y: 30
        }, {
          x: 4,
          y: 32
        }],
        color: '#7266ba'
      }, {
        data: [{
          x: 0,
          y: 20
        }, {
          x: 1,
          y: 24
        }, {
          x: 2,
          y: 19
        }, {
          x: 3,
          y: 15
        }, {
          x: 4,
          y: 16
        }],
        color: '#23b7e5'
      }]
    });
    graph3.render(); // Graph 4
    // -----------------------------------

    var graph4 = new Rickshaw.Graph({
      element: document.querySelector("#rickshaw4"),
      renderer: 'bar',
      series: [{
        data: [{
          x: 0,
          y: 40
        }, {
          x: 1,
          y: 49
        }, {
          x: 2,
          y: 38
        }, {
          x: 3,
          y: 30
        }, {
          x: 4,
          y: 32
        }],
        color: '#fad732'
      }, {
        data: [{
          x: 0,
          y: 20
        }, {
          x: 1,
          y: 24
        }, {
          x: 2,
          y: 19
        }, {
          x: 3,
          y: 15
        }, {
          x: 4,
          y: 16
        }],
        color: '#ff902b'
      }]
    });
    graph4.render();
  }
})(); // SPARKLINE
// -----------------------------------


(function () {
  'use strict';

  $(initSparkline);

  function initSparkline() {
    $('[data-sparkline]').each(initSparkLine);

    function initSparkLine() {
      var $element = $(this),
          options = $element.data(),
          values = options.values && options.values.split(',');
      options.type = options.type || 'bar'; // default chart is bar

      options.disableHiddenCheck = true;
      $element.sparkline(values, options);

      if (options.resize) {
        $(window).resize(function () {
          $element.sparkline(values, options);
        });
      }
    }
  }
})(); // Start Bootstrap JS
// -----------------------------------


(function () {
  'use strict';

  $(initBootstrap);

  function initBootstrap() {
    // necessary check at least til BS doesn't require jQuery
    if (!$.fn || !$.fn.tooltip || !$.fn.popover) return; // POPOVER
    // -----------------------------------

    $('[data-toggle="popover"]').popover(); // TOOLTIP
    // -----------------------------------

    $('[data-toggle="tooltip"]').tooltip({
      container: 'body'
    }); // DROPDOWN INPUTS
    // -----------------------------------

    $('.dropdown input').on('click focus', function (event) {
      event.stopPropagation();
    });
  }
})(); // Module: card-tools
// -----------------------------------


(function () {
  'use strict';

  $(initCardDismiss);
  $(initCardCollapse);
  $(initCardRefresh);
  /**
   * Helper function to find the closest
   * ascending .card element
   */

  function getCardParent(item) {
    var el = item.parentElement;

    while (el && !el.classList.contains('card')) {
      el = el.parentElement;
    }

    return el;
  }
  /**
   * Helper to trigger custom event
   */


  function triggerEvent(type, item, data) {
    var ev;

    if (typeof CustomEvent === 'function') {
      ev = new CustomEvent(type, {
        detail: data
      });
    } else {
      ev = document.createEvent('CustomEvent');
      ev.initCustomEvent(type, true, false, data);
    }

    item.dispatchEvent(ev);
  }
  /**
   * Dismiss cards
   * [data-tool="card-dismiss"]
   */


  function initCardDismiss() {
    var cardtoolSelector = '[data-tool="card-dismiss"]';
    var cardList = [].slice.call(document.querySelectorAll(cardtoolSelector));
    cardList.forEach(function (item) {
      new CardDismiss(item);
    });

    function CardDismiss(item) {
      var EVENT_REMOVE = 'card.remove';
      var EVENT_REMOVED = 'card.removed';
      this.item = item;
      this.cardParent = getCardParent(this.item);
      this.removing = false; // prevents double execution

      this.clickHandler = function (e) {
        if (this.removing) return;
        this.removing = true; // pass callbacks via event.detail to confirm/cancel the removal

        triggerEvent(EVENT_REMOVE, this.cardParent, {
          confirm: this.confirm.bind(this),
          cancel: this.cancel.bind(this)
        });
      };

      this.confirm = function () {
        this.animate(this.cardParent, function () {
          triggerEvent(EVENT_REMOVED, this.cardParent);
          this.remove(this.cardParent);
        });
      };

      this.cancel = function () {
        this.removing = false;
      };

      this.animate = function (item, cb) {
        if ('onanimationend' in window) {
          // animation supported
          item.addEventListener('animationend', cb.bind(this));
          item.className += ' animated bounceOut'; // requires animate.css
        } else cb.call(this); // no animation, just remove

      };

      this.remove = function (item) {
        item.parentNode.removeChild(item);
      }; // attach listener


      item.addEventListener('click', this.clickHandler.bind(this), false);
    }
  }
  /**
   * Collapsed cards
   * [data-tool="card-collapse"]
   * [data-start-collapsed]
   */


  function initCardCollapse() {
    var cardtoolSelector = '[data-tool="card-collapse"]';
    var cardList = [].slice.call(document.querySelectorAll(cardtoolSelector));
    cardList.forEach(function (item) {
      var initialState = item.hasAttribute('data-start-collapsed');
      new CardCollapse(item, initialState);
    });

    function CardCollapse(item, startCollapsed) {
      var EVENT_SHOW = 'card.collapse.show';
      var EVENT_HIDE = 'card.collapse.hide';
      this.state = true; // true -> show / false -> hide

      this.item = item;
      this.cardParent = getCardParent(this.item);
      this.wrapper = this.cardParent.querySelector('.card-wrapper');

      this.toggleCollapse = function (action) {
        triggerEvent(action ? EVENT_SHOW : EVENT_HIDE, this.cardParent);
        this.wrapper.style.maxHeight = (action ? this.wrapper.scrollHeight : 0) + 'px';
        this.state = action;
        this.updateIcon(action);
      };

      this.updateIcon = function (action) {
        this.item.firstElementChild.className = action ? 'fa fa-minus' : 'fa fa-plus';
      };

      this.clickHandler = function () {
        this.toggleCollapse(!this.state);
      };

      this.initStyles = function () {
        this.wrapper.style.maxHeight = this.wrapper.scrollHeight + 'px';
        this.wrapper.style.transition = 'max-height 0.5s';
        this.wrapper.style.overflow = 'hidden';
      }; // prepare styles for collapse animation


      this.initStyles(); // set initial state if provided

      if (startCollapsed) {
        this.toggleCollapse(false);
      } // attach listener


      this.item.addEventListener('click', this.clickHandler.bind(this), false);
    }
  }
  /**
   * Refresh cards
   * [data-tool="card-refresh"]
   * [data-spinner="standard"]
   */


  function initCardRefresh() {
    var cardtoolSelector = '[data-tool="card-refresh"]';
    var cardList = [].slice.call(document.querySelectorAll(cardtoolSelector));
    cardList.forEach(function (item) {
      new CardRefresh(item);
    });

    function CardRefresh(item) {
      var EVENT_REFRESH = 'card.refresh';
      var WHIRL_CLASS = 'whirl';
      var DEFAULT_SPINNER = 'standard';
      this.item = item;
      this.cardParent = getCardParent(this.item);
      this.spinner = ((this.item.dataset || {}).spinner || DEFAULT_SPINNER).split(' '); // support space separated classes

      this.refresh = function (e) {
        var card = this.cardParent; // start showing the spinner

        this.showSpinner(card, this.spinner); // attach as public method

        card.removeSpinner = this.removeSpinner.bind(this); // Trigger the event and send the card

        triggerEvent(EVENT_REFRESH, card, {
          card: card
        });
      };

      this.showSpinner = function (card, spinner) {
        card.classList.add(WHIRL_CLASS);
        spinner.forEach(function (s) {
          card.classList.add(s);
        });
      };

      this.removeSpinner = function () {
        this.cardParent.classList.remove(WHIRL_CLASS);
      }; // attach listener


      this.item.addEventListener('click', this.refresh.bind(this), false);
    }
  }
})(); // GLOBAL CONSTANTS
// -----------------------------------


(function () {
  window.APP_COLORS = {
    'primary': '#5d9cec',
    'success': '#27c24c',
    'info': '#23b7e5',
    'warning': '#ff902b',
    'danger': '#f05050',
    'inverse': '#131e26',
    'green': '#37bc9b',
    'pink': '#f532e5',
    'purple': '#7266ba',
    'dark': '#3a3f51',
    'yellow': '#fad732',
    'gray-darker': '#232735',
    'gray-dark': '#3a3f51',
    'gray': '#dde6e9',
    'gray-light': '#e4eaec',
    'gray-lighter': '#edf1f2'
  };
  window.APP_MEDIAQUERY = {
    'desktopLG': 1200,
    'desktop': 992,
    'tablet': 768,
    'mobile': 480
  };
})(); // FULLSCREEN
// -----------------------------------


(function () {
  'use strict';

  $(initScreenFull);

  function initScreenFull() {
    if (typeof screenfull === 'undefined') return;
    var $doc = $(document);
    var $fsToggler = $('[data-toggle-fullscreen]'); // Not supported under IE

    var ua = window.navigator.userAgent;

    if (ua.indexOf("MSIE ") > 0 || !!ua.match(/Trident.*rv\:11\./)) {
      $fsToggler.addClass('d-none'); // hide element

      return; // and abort
    }

    $fsToggler.on('click', function (e) {
      e.preventDefault();

      if (screenfull.enabled) {
        screenfull.toggle(); // Switch icon indicator

        toggleFSIcon($fsToggler);
      } else {
        console.log('Fullscreen not enabled');
      }
    });
    if (screenfull.raw && screenfull.raw.fullscreenchange) $doc.on(screenfull.raw.fullscreenchange, function () {
      toggleFSIcon($fsToggler);
    });

    function toggleFSIcon($element) {
      if (screenfull.isFullscreen) $element.children('em').removeClass('fa-expand').addClass('fa-compress');else $element.children('em').removeClass('fa-compress').addClass('fa-expand');
    }
  }
})(); // LOAD CUSTOM CSS
// -----------------------------------


(function () {
  'use strict';

  $(initLoadCSS);

  function initLoadCSS() {
    $('[data-load-css]').on('click', function (e) {
      var element = $(this);
      if (element.is('a')) e.preventDefault();
      var uri = element.data('loadCss'),
          link;

      if (uri) {
        link = createLink(uri);

        if (!link) {
          $.error('Error creating stylesheet link element.');
        }
      } else {
        $.error('No stylesheet location defined.');
      }
    });
  }

  function createLink(uri) {
    var linkId = 'autoloaded-stylesheet',
        oldLink = $('#' + linkId).attr('id', linkId + '-old');
    $('head').append($('<link/>').attr({
      'id': linkId,
      'rel': 'stylesheet',
      'href': uri
    }));

    if (oldLink.length) {
      oldLink.remove();
    }

    return $('#' + linkId);
  }
})(); // TRANSLATION
// -----------------------------------


(function () {
  'use strict';

  $(initTranslation);
  var pathPrefix = '/Content/i18n'; // folder of json files

  var STORAGEKEY = 'jq-appLang';
  var savedLanguage = Storages.localStorage.get(STORAGEKEY);

  function initTranslation() {
    i18next.use(i18nextXHRBackend) // .use(LanguageDetector)
    .init({
      fallbackLng: savedLanguage || 'en',
      backend: {
        loadPath: pathPrefix + '/{{ns}}-{{lng}}.json'
      },
      ns: ['site'],
      defaultNS: 'site',
      debug: false
    }, function (err, t) {
      // initialize elements
      applyTranlations(); // listen to language changes

      attachChangeListener();
    });

    function applyTranlations() {
      var list = [].slice.call(document.querySelectorAll('[data-localize]'));
      list.forEach(function (item) {
        var key = item.getAttribute('data-localize');
        if (i18next.exists(key)) item.innerHTML = i18next.t(key);
      });
    }

    function attachChangeListener() {
      var list = [].slice.call(document.querySelectorAll('[data-set-lang]'));
      list.forEach(function (item) {
        item.addEventListener('click', function (e) {
          if (e.target.tagName === 'A') e.preventDefault();
          var lang = item.getAttribute('data-set-lang');

          if (lang) {
            i18next.changeLanguage(lang, function (err) {
              if (err) console.log(err);else {
                applyTranlations();
                Storages.localStorage.set(STORAGEKEY, lang);
              }
            });
          }

          activateDropdown(item);
        });
      });
    }

    function activateDropdown(item) {
      if (item.classList.contains('dropdown-item')) {
        item.parentElement.previousElementSibling.innerHTML = item.innerHTML;
      }
    }
  }
})(); // NAVBAR SEARCH
// -----------------------------------


(function () {
  'use strict';

  $(initNavbarSearch);

  function initNavbarSearch() {
    var navSearch = new navbarSearchInput(); // Open search input

    var $searchOpen = $('[data-search-open]');
    $searchOpen.on('click', function (e) {
      e.stopPropagation();
    }).on('click', navSearch.toggle); // Close search input

    var $searchDismiss = $('[data-search-dismiss]');
    var inputSelector = '.navbar-form input[type="text"]';
    $(inputSelector).on('click', function (e) {
      e.stopPropagation();
    }).on('keyup', function (e) {
      if (e.keyCode == 27) // ESC
        navSearch.dismiss();
    }); // click anywhere closes the search

    $(document).on('click', navSearch.dismiss); // dismissable options

    $searchDismiss.on('click', function (e) {
      e.stopPropagation();
    }).on('click', navSearch.dismiss);
  }

  var navbarSearchInput = function navbarSearchInput() {
    var navbarFormSelector = 'form.navbar-form';
    return {
      toggle: function toggle() {
        var navbarForm = $(navbarFormSelector);
        navbarForm.toggleClass('open');
        var isOpen = navbarForm.hasClass('open');
        navbarForm.find('input')[isOpen ? 'focus' : 'blur']();
      },
      dismiss: function dismiss() {
        $(navbarFormSelector).removeClass('open') // Close control
        .find('input[type="text"]').blur() // remove focus
        // .val('')                    // Empty input
        ;
      }
    };
  };
})(); // NOW TIMER
// -----------------------------------


(function () {
  'use strict';

  $(initNowTimer);

  function initNowTimer() {
    if (typeof moment === 'undefined') return;
    $('[data-now]').each(function () {
      var element = $(this),
          format = element.data('format');

      function updateTime() {
        var dt = moment(new Date()).format(format);
        element.text(dt);
      }

      updateTime();
      setInterval(updateTime, 1000);
    });
  }
})(); // Toggle RTL mode for demo
// -----------------------------------


(function () {
  'use strict';

  $(initRTL);

  function initRTL() {
    var maincss = $('#maincss');
    var bscss = $('#bscss');
    $('#chk-rtl').on('change', function () {
      // app rtl check
      maincss.attr('href', this.checked ? '/Content/css/app-rtl.css' : '/Content/css/app.css'); // bootstrap rtl check

      bscss.attr('href', this.checked ? '/Content/css/bootstrap-rtl.css' : '/Content/css/bootstrap.css');
    });
  }
})(); // SIDEBAR
// -----------------------------------


(function () {
  'use strict';

  $(initSidebar);
  var $html;
  var $body;
  var $sidebar;

  function initSidebar() {
    $html = $('html');
    $body = $('body');
    $sidebar = $('.sidebar'); // AUTOCOLLAPSE ITEMS
    // -----------------------------------

    var sidebarCollapse = $sidebar.find('.collapse');
    sidebarCollapse.on('show.bs.collapse', function (event) {
      event.stopPropagation();
      if ($(this).parents('.collapse').length === 0) sidebarCollapse.filter('.show').collapse('hide');
    }); // SIDEBAR ACTIVE STATE
    // -----------------------------------
    // Find current active item

    var currentItem = $('.sidebar .active').parents('li'); // hover mode don't try to expand active collapse

    if (!useAsideHover()) currentItem.addClass('active') // activate the parent
    .children('.collapse') // find the collapse
    .collapse('show'); // and show it
    // remove this if you use only collapsible sidebar items

    $sidebar.find('li > a + ul').on('show.bs.collapse', function (e) {
      if (useAsideHover()) e.preventDefault();
    }); // SIDEBAR COLLAPSED ITEM HANDLER
    // -----------------------------------

    var eventName = isTouch() ? 'click' : 'mouseenter';
    var subNav = $();
    $sidebar.find('.sidebar-nav > li').on(eventName, function (e) {
      if (isSidebarCollapsed() || useAsideHover()) {
        subNav.trigger('mouseleave');
        subNav = toggleMenuItem($(this)); // Used to detect click and touch events outside the sidebar

        sidebarAddBackdrop();
      }
    });
    var sidebarAnyclickClose = $sidebar.data('sidebarAnyclickClose'); // Allows to close

    if (typeof sidebarAnyclickClose !== 'undefined') {
      $('.wrapper').on('click.sidebar', function (e) {
        // don't check if sidebar not visible
        if (!$body.hasClass('aside-toggled')) return;
        var $target = $(e.target);

        if (!$target.parents('.aside-container').length && // if not child of sidebar
        !$target.is('#user-block-toggle') && // user block toggle anchor
        !$target.parent().is('#user-block-toggle') // user block toggle icon
        ) {
            $body.removeClass('aside-toggled');
          }
      });
    }
  }

  function sidebarAddBackdrop() {
    var $backdrop = $('<div/>', {
      'class': 'sideabr-backdrop'
    });
    $backdrop.insertAfter('.aside-container').on("click mouseenter", function () {
      removeFloatingNav();
    });
  } // Open the collapse sidebar submenu items when on touch devices
  // - desktop only opens on hover


  function toggleTouchItem($element) {
    $element.siblings('li').removeClass('open');
    $element.toggleClass('open');
  } // Handles hover to open items under collapsed menu
  // -----------------------------------


  function toggleMenuItem($listItem) {
    removeFloatingNav();
    var ul = $listItem.children('ul');
    if (!ul.length) return $();

    if ($listItem.hasClass('open')) {
      toggleTouchItem($listItem);
      return $();
    }

    var $aside = $('.aside-container');
    var $asideInner = $('.aside-inner'); // for top offset calculation
    // float aside uses extra padding on aside

    var mar = parseInt($asideInner.css('padding-top'), 0) + parseInt($aside.css('padding-top'), 0);
    var subNav = ul.clone().appendTo($aside);
    toggleTouchItem($listItem);
    var itemTop = $listItem.position().top + mar - $sidebar.scrollTop();
    var vwHeight = document.body.clientHeight;
    subNav.addClass('nav-floating').css({
      position: isFixed() ? 'fixed' : 'absolute',
      top: itemTop,
      bottom: subNav.outerHeight(true) + itemTop > vwHeight ? 0 : 'auto'
    });
    subNav.on('mouseleave', function () {
      toggleTouchItem($listItem);
      subNav.remove();
    });
    return subNav;
  }

  function removeFloatingNav() {
    $('.sidebar-subnav.nav-floating').remove();
    $('.sideabr-backdrop').remove();
    $('.sidebar li.open').removeClass('open');
  }

  function isTouch() {
    return $html.hasClass('touch');
  }

  function isSidebarCollapsed() {
    return $body.hasClass('aside-collapsed') || $body.hasClass('aside-collapsed-text');
  }

  function isSidebarToggled() {
    return $body.hasClass('aside-toggled');
  }

  function isMobile() {
    return document.body.clientWidth < APP_MEDIAQUERY.tablet;
  }

  function isFixed() {
    return $body.hasClass('layout-fixed');
  }

  function useAsideHover() {
    return $body.hasClass('aside-hover');
  }
})(); // SLIMSCROLL
// -----------------------------------


(function () {
  'use strict';

  $(initSlimsSroll);

  function initSlimsSroll() {
    if (!$.fn || !$.fn.slimScroll) return;
    $('[data-scrollable]').each(function () {
      var element = $(this),
          defaultHeight = 250;
      element.slimScroll({
        height: element.data('height') || defaultHeight
      });
    });
  }
})(); // Table Check All
// -----------------------------------


(function () {
  'use strict';

  $(initTableCheckAll);

  function initTableCheckAll() {
    $('[data-check-all]').on('change', function () {
      var $this = $(this),
          index = $this.index() + 1,
          checkbox = $this.find('input[type="checkbox"]'),
          table = $this.parents('table'); // Make sure to affect only the correct checkbox column

      table.find('tbody > tr > td:nth-child(' + index + ') input[type="checkbox"]').prop('checked', checkbox[0].checked);
    });
  }
})(); // TOGGLE STATE
// -----------------------------------


(function () {
  'use strict';

  $(initToggleState);

  function initToggleState() {
    var $body = $('body');
    var toggle = new StateToggler();
    $('[data-toggle-state]').on('click', function (e) {
      // e.preventDefault();
      e.stopPropagation();
      var element = $(this),
          classname = element.data('toggleState'),
          target = element.data('target'),
          noPersist = element.attr('data-no-persist') !== undefined; // Specify a target selector to toggle classname
      // use body by default

      var $target = target ? $(target) : $body;

      if (classname) {
        if ($target.hasClass(classname)) {
          $target.removeClass(classname);
          if (!noPersist) toggle.removeState(classname);
        } else {
          $target.addClass(classname);
          if (!noPersist) toggle.addState(classname);
        }
      } // some elements may need this when toggled class change the content size


      if (typeof Event === 'function') {
        // modern browsers
        window.dispatchEvent(new Event('resize'));
      } else {
        // old browsers and IE
        var resizeEvent = window.document.createEvent('UIEvents');
        resizeEvent.initUIEvent('resize', true, false, window, 0);
        window.dispatchEvent(resizeEvent);
      }
    });
  } // Handle states to/from localstorage


  var StateToggler = function StateToggler() {
    var STORAGE_KEY_NAME = 'jq-toggleState';
    /** Add a state to the browser storage to be restored later */

    this.addState = function (classname) {
      var data = Storages.localStorage.get(STORAGE_KEY_NAME);
      if (data instanceof Array) data.push(classname);else data = [classname];
      Storages.localStorage.set(STORAGE_KEY_NAME, data);
    };
    /** Remove a state from the browser storage */


    this.removeState = function (classname) {
      var data = Storages.localStorage.get(STORAGE_KEY_NAME);

      if (data) {
        var index = data.indexOf(classname);
        if (index !== -1) data.splice(index, 1);
        Storages.localStorage.set(STORAGE_KEY_NAME, data);
      }
    };
    /** Load the state string and restore the classlist */


    this.restoreState = function ($elem) {
      var data = Storages.localStorage.get(STORAGE_KEY_NAME);
      if (data instanceof Array) $elem.addClass(data.join(' '));
    };
  };

  window.StateToggler = StateToggler;
})();
/**=========================================================
 * Module: trigger-resize.js
 * Triggers a window resize event from any element
 =========================================================*/


(function () {
  'use strict';

  $(initTriggerResize);

  function initTriggerResize() {
    var element = $('[data-trigger-resize]');
    var value = element.data('triggerResize');
    element.on('click', function () {
      setTimeout(function () {
        // all IE friendly dispatchEvent
        var evt = document.createEvent('UIEvents');
        evt.initUIEvent('resize', true, false, window, 0);
        window.dispatchEvent(evt); // modern dispatchEvent way
        // window.dispatchEvent(new Event('resize'));
      }, value || 300);
    });
  }
})(); // Demo Cards
// -----------------------------------


(function () {
  'use strict';

  $(initCardDemo);

  function initCardDemo() {
    /**
     * This functions show a demonstration of how to use
     * the card tools system via custom event.
     */
    var cardList = [].slice.call(document.querySelectorAll('.card.card-demo'));
    cardList.forEach(function (item) {
      item.addEventListener('card.refresh', function (event) {
        // get the card element that is refreshing
        var card = event.detail.card; // perform any action here, when it is done,
        // remove the spinner calling "removeSpinner"
        // setTimeout used to simulate async operation

        setTimeout(card.removeSpinner, 3000);
      });
      item.addEventListener('card.collapse.hide', function () {
        console.log('Card Collapse Hide');
      });
      item.addEventListener('card.collapse.show', function () {
        console.log('Card Collapse Show');
      });
      item.addEventListener('card.remove', function (event) {
        var confirm = event.detail.confirm;
        var cancel = event.detail.cancel; // perform any action  here

        console.log('Removing Card'); // Call confirm() to continue removing card
        // otherwise call cancel()

        confirm();
      });
      item.addEventListener('card.removed', function (event) {
        console.log('Removed Card');
      });
    });
  }
})(); // Nestable demo
// -----------------------------------


(function () {
  'use strict';

  $(initNestable);

  function initNestable() {
    if (!$.fn.nestable) return;

    var updateOutput = function updateOutput(e) {
      var list = e.length ? e : $(e.target),
          output = list.data('output');

      if (window.JSON) {
        output.val(window.JSON.stringify(list.nestable('serialize'))); //, null, 2));
      } else {
        output.val('JSON browser support required for this demo.');
      }
    }; // activate Nestable for list 1


    $('#nestable').nestable({
      group: 1
    }).on('change', updateOutput); // activate Nestable for list 2

    $('#nestable2').nestable({
      group: 1
    }).on('change', updateOutput); // output initial serialised data

    updateOutput($('#nestable').data('output', $('#nestable-output')));
    updateOutput($('#nestable2').data('output', $('#nestable2-output')));
    $('.js-nestable-action').on('click', function (e) {
      var target = $(e.target),
          action = target.data('action');

      if (action === 'expand-all') {
        $('.dd').nestable('expandAll');
      }

      if (action === 'collapse-all') {
        $('.dd').nestable('collapseAll');
      }
    });
  }
})();
/**=========================================================
 * Module: notify.js
 * Create toggleable notifications that fade out automatically.
 * Based on Notify addon from UIKit (http://getuikit.com/docs/addons_notify.html)
 * [data-toggle="notify"]
 * [data-options="options in json format" ]
 =========================================================*/


(function () {
  'use strict';

  $(initNotify);

  function initNotify() {
    var Selector = '[data-notify]',
        autoloadSelector = '[data-onload]',
        doc = $(document);
    $(Selector).each(function () {
      var $this = $(this),
          onload = $this.data('onload');

      if (onload !== undefined) {
        setTimeout(function () {
          notifyNow($this);
        }, 800);
      }

      $this.on('click', function (e) {
        e.preventDefault();
        notifyNow($this);
      });
    });
  }

  function notifyNow($element) {
    var message = $element.data('message'),
        options = $element.data('options');
    if (!message) $.error('Notify: No message specified');
    $.notify(message, options || {});
  }
})();
/**
 * Notify Addon definition as jQuery plugin
 * Adapted version to work with Bootstrap classes
 * More information http://getuikit.com/docs/addons_notify.html
 */


(function () {
  var containers = {},
      messages = {},
      notify = function notify(options) {
    if ($.type(options) == 'string') {
      options = {
        message: options
      };
    }

    if (arguments[1]) {
      options = $.extend(options, $.type(arguments[1]) == 'string' ? {
        status: arguments[1]
      } : arguments[1]);
    }

    return new Message(options).show();
  },
      closeAll = function closeAll(group, instantly) {
    if (group) {
      for (var id in messages) {
        if (group === messages[id].group) messages[id].close(instantly);
      }
    } else {
      for (var id in messages) {
        messages[id].close(instantly);
      }
    }
  };

  var Message = function Message(options) {
    var $this = this;
    this.options = $.extend({}, Message.defaults, options);
    this.uuid = "ID" + new Date().getTime() + "RAND" + Math.ceil(Math.random() * 100000);
    this.element = $([// alert-dismissable enables bs close icon
    '<div class="uk-notify-message alert-dismissable">', '<a class="close">&times;</a>', '<div>' + this.options.message + '</div>', '</div>'].join('')).data("notifyMessage", this); // status

    if (this.options.status) {
      this.element.addClass('alert alert-' + this.options.status);
      this.currentstatus = this.options.status;
    }

    this.group = this.options.group;
    messages[this.uuid] = this;

    if (!containers[this.options.pos]) {
      containers[this.options.pos] = $('<div class="uk-notify uk-notify-' + this.options.pos + '"></div>').appendTo('body').on("click", ".uk-notify-message", function () {
        $(this).data("notifyMessage").close();
      });
    }
  };

  $.extend(Message.prototype, {
    uuid: false,
    element: false,
    timout: false,
    currentstatus: "",
    group: false,
    show: function show() {
      if (this.element.is(":visible")) return;
      var $this = this;
      containers[this.options.pos].show().prepend(this.element);
      var marginbottom = parseInt(this.element.css("margin-bottom"), 10);
      this.element.css({
        "opacity": 0,
        "margin-top": -1 * this.element.outerHeight(),
        "margin-bottom": 0
      }).animate({
        "opacity": 1,
        "margin-top": 0,
        "margin-bottom": marginbottom
      }, function () {
        if ($this.options.timeout) {
          var closefn = function closefn() {
            $this.close();
          };

          $this.timeout = setTimeout(closefn, $this.options.timeout);
          $this.element.hover(function () {
            clearTimeout($this.timeout);
          }, function () {
            $this.timeout = setTimeout(closefn, $this.options.timeout);
          });
        }
      });
      return this;
    },
    close: function close(instantly) {
      var $this = this,
          finalize = function finalize() {
        $this.element.remove();

        if (!containers[$this.options.pos].children().length) {
          containers[$this.options.pos].hide();
        }

        delete messages[$this.uuid];
      };

      if (this.timeout) clearTimeout(this.timeout);

      if (instantly) {
        finalize();
      } else {
        this.element.animate({
          "opacity": 0,
          "margin-top": -1 * this.element.outerHeight(),
          "margin-bottom": 0
        }, function () {
          finalize();
        });
      }
    },
    content: function content(html) {
      var container = this.element.find(">div");

      if (!html) {
        return container.html();
      }

      container.html(html);
      return this;
    },
    status: function status(_status) {
      if (!_status) {
        return this.currentstatus;
      }

      this.element.removeClass('alert alert-' + this.currentstatus).addClass('alert alert-' + _status);
      this.currentstatus = _status;
      return this;
    }
  });
  Message.defaults = {
    message: "",
    status: "normal",
    timeout: 5000,
    group: null,
    pos: 'top-center'
  };
  $["notify"] = notify;
  $["notify"].message = Message;
  $["notify"].closeAll = closeAll;
  return notify;
})();
/**=========================================================
 * Module: portlet.js
 * Drag and drop any card to change its position
 * The Selector should could be applied to any object that contains
 * card, so .col-* element are ideal.
 =========================================================*/


(function () {
  'use strict';

  var STORAGE_KEY_NAME = 'jq-portletState';
  $(initPortlets);

  function initPortlets() {
    // Component is NOT optional
    if (!$.fn.sortable) return;
    var Selector = '[data-toggle="portlet"]';
    $(Selector).sortable({
      connectWith: Selector,
      items: 'div.card',
      handle: '.portlet-handler',
      opacity: 0.7,
      placeholder: 'portlet box-placeholder',
      cancel: '.portlet-cancel',
      forcePlaceholderSize: true,
      iframeFix: false,
      tolerance: 'pointer',
      helper: 'original',
      revert: 200,
      forceHelperSize: true,
      update: savePortletOrder,
      create: loadPortletOrder
    }) // optionally disables mouse selection
    //.disableSelection()
    ;
  }

  function savePortletOrder(event, ui) {
    var data = Storages.localStorage.get(STORAGE_KEY_NAME);

    if (!data) {
      data = {};
    }

    data[this.id] = $(this).sortable('toArray');

    if (data) {
      Storages.localStorage.set(STORAGE_KEY_NAME, data);
    }
  }

  function loadPortletOrder() {
    var data = Storages.localStorage.get(STORAGE_KEY_NAME);

    if (data) {
      var porletId = this.id,
          cards = data[porletId];

      if (cards) {
        var portlet = $('#' + porletId);
        $.each(cards, function (index, value) {
          $('#' + value).appendTo(portlet);
        });
      }
    }
  } // Reset porlet save state


  window.resetPorlets = function (e) {
    Storages.localStorage.remove(STORAGE_KEY_NAME); // reload the page

    window.location.reload();
  };
})(); // HTML5 Sortable demo
// -----------------------------------


(function () {
  'use strict';

  $(initSortable);

  function initSortable() {
    if (typeof sortable === 'undefined') return;
    sortable('.sortable', {
      forcePlaceholderSize: true,
      placeholder: '<div class="box-placeholder p0 m0"><div></div></div>'
    });
  }
})(); // Sweet Alert
// -----------------------------------


(function () {
  'use strict';

  $(initSweetAlert);

  function initSweetAlert() {
    $('#swal-demo1').on('click', function (e) {
      e.preventDefault();
      swal("Here's a message!");
    });
    $('#swal-demo2').on('click', function (e) {
      e.preventDefault();
      swal("Here's a message!", "It's pretty, isn't it?");
    });
    $('#swal-demo3').on('click', function (e) {
      e.preventDefault();
      swal("Good job!", "You clicked the button!", "success");
    });
    $('#swal-demo4').on('click', function (e) {
      e.preventDefault();
      swal({
        title: 'Are you sure?',
        text: 'Your will not be able to recover this imaginary file!',
        icon: 'warning',
        buttons: {
          cancel: true,
          confirm: {
            text: 'Yes, delete it!',
            value: true,
            visible: true,
            className: "bg-danger",
            closeModal: true
          }
        }
      }).then(function () {
        swal('Booyah!');
      });
    });
    $('#swal-demo5').on('click', function (e) {
      e.preventDefault();
      swal({
        title: 'Are you sure?',
        text: 'Your will not be able to recover this imaginary file!',
        icon: 'warning',
        buttons: {
          cancel: {
            text: 'No, cancel plx!',
            value: null,
            visible: true,
            className: "",
            closeModal: false
          },
          confirm: {
            text: 'Yes, delete it!',
            value: true,
            visible: true,
            className: "bg-danger",
            closeModal: false
          }
        }
      }).then(function (isConfirm) {
        if (isConfirm) {
          swal('Deleted!', 'Your imaginary file has been deleted.', 'success');
        } else {
          swal('Cancelled', 'Your imaginary file is safe :)', 'error');
        }
      });
    });
  }
})(); // Full Calendar
// -----------------------------------


(function () {
  'use strict';

  if (typeof FullCalendar === 'undefined') return; // When dom ready, init calendar and events

  $(initExternalEvents);
  $(initFullCalendar);

  function initFullCalendar() {
    var Calendar = FullCalendar.Calendar;
    var Draggable = FullCalendarInteraction.Draggable;
    /* initialize the external events */

    var containerEl = document.getElementById('external-events-list');
    new Draggable(containerEl, {
      itemSelector: '.fce-event',
      eventData: function eventData(eventEl) {
        return {
          title: eventEl.innerText.trim()
        };
      }
    });
    /* initialize the calendar */

    var calendarEl = document.getElementById('calendar');
    var calendar = new Calendar(calendarEl, {
      events: createDemoEvents(),
      plugins: ['interaction', 'dayGrid', 'timeGrid', 'list', 'bootstrap'],
      themeSystem: 'bootstrap',
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
      },
      editable: true,
      droppable: true,
      // this allows things to be dropped onto the calendar
      eventReceive: function eventReceive(info) {
        var styles = getComputedStyle(info.draggedEl);
        info.event.setProp('backgroundColor', styles.backgroundColor);
        info.event.setProp('borderColor', styles.borderColor); // is the "remove after drop" checkbox checked?

        if (document.getElementById('drop-remove').checked) {
          // if so, remove the element from the "Draggable Events" list
          info.draggedEl.parentNode.removeChild(info.draggedEl);
        }
      }
    });
    calendar.render();
  }

  function initExternalEvents() {
    var colorSelectorContainer = document.getElementById('external-event-color-selector');
    var addEventButton = document.getElementById('external-event-add-btn');
    var eventNameInput = document.getElementById('external-event-name');
    var colorSelectors = [].slice.call(colorSelectorContainer.querySelectorAll('.circle'));
    var currentSelector = colorSelectorContainer.querySelector('.circle'); // select first as default

    var containerEl = document.getElementById('external-events-list'); // control the color selector selectable behavior

    colorSelectors.forEach(function (sel) {
      sel.addEventListener('click', selectColorSelector(sel));
    }); // Create and add a new event to the list

    addEventButton.addEventListener('click', addNewExternalEvent);

    function selectColorSelector(sel) {
      return function (e) {
        // deselect all
        colorSelectors.forEach(unselectAllColorSelector); // select current

        sel.classList.add('selected');
        currentSelector = sel;
      };
    }

    function unselectAllColorSelector(el) {
      el.classList.remove('selected');
    }

    function addNewExternalEvent() {
      var name = eventNameInput.value;

      if (name) {
        var el = createElement(currentSelector);
        el.innerText = name;
        containerEl.insertBefore(el, containerEl.firstChild); // preppend
      }
    }

    function createElement(baseElement) {
      var styles = getComputedStyle(currentSelector);
      var element = document.createElement('div');
      element.style.backgroundColor = styles.backgroundColor;
      element.style.borderColor = styles.borderColor;
      element.style.color = '#fff';
      element.className = 'fce-event'; // make draggable

      return element;
    }
  }
  /**
   * Creates an array of events to display in the first load of the calendar
   * Wrap into this function a request to a source to get via ajax the stored events
   * @return Array The array with the events
   */


  function createDemoEvents() {
    // Date for the calendar events (dummy data)
    var date = new Date();
    var d = date.getDate(),
        m = date.getMonth(),
        y = date.getFullYear();
    return [{
      title: 'All Day Event',
      start: new Date(y, m, 1),
      backgroundColor: '#f56954',
      //red
      borderColor: '#f56954' //red

    }, {
      title: 'Long Event',
      start: new Date(y, m, d - 5),
      end: new Date(y, m, d - 2),
      backgroundColor: '#f39c12',
      //yellow
      borderColor: '#f39c12' //yellow

    }, {
      title: 'Meeting',
      start: new Date(y, m, d, 10, 30),
      allDay: false,
      backgroundColor: '#0073b7',
      //Blue
      borderColor: '#0073b7' //Blue

    }, {
      title: 'Lunch',
      start: new Date(y, m, d, 12, 0),
      end: new Date(y, m, d, 14, 0),
      allDay: false,
      backgroundColor: '#00c0ef',
      //Info (aqua)
      borderColor: '#00c0ef' //Info (aqua)

    }, {
      title: 'Birthday Party',
      start: new Date(y, m, d + 1, 19, 0),
      end: new Date(y, m, d + 1, 22, 30),
      allDay: false,
      backgroundColor: '#00a65a',
      //Success (green)
      borderColor: '#00a65a' //Success (green)

    }, {
      title: 'Open Google',
      start: new Date(y, m, 28),
      end: new Date(y, m, 29),
      url: '//google.com/',
      backgroundColor: '#3c8dbc',
      //Primary (light-blue)
      borderColor: '#3c8dbc' //Primary (light-blue)

    }];
  }
})(); // JQCloud
// -----------------------------------


(function () {
  'use strict';

  $(initWordCloud);

  function initWordCloud() {
    if (!$.fn.jQCloud) return; //Create an array of word objects, each representing a word in the cloud

    var word_array = [{
      text: 'Lorem',
      weight: 13
      /*link: 'http://themicon.co'*/

    }, {
      text: 'Ipsum',
      weight: 10.5
    }, {
      text: 'Dolor',
      weight: 9.4
    }, {
      text: 'Sit',
      weight: 8
    }, {
      text: 'Amet',
      weight: 6.2
    }, {
      text: 'Consectetur',
      weight: 5
    }, {
      text: 'Adipiscing',
      weight: 5
    }, {
      text: 'Sit',
      weight: 8
    }, {
      text: 'Amet',
      weight: 6.2
    }, {
      text: 'Consectetur',
      weight: 5
    }, {
      text: 'Adipiscing',
      weight: 5
    }];
    $("#jqcloud").jQCloud(word_array, {
      width: 240,
      height: 200,
      steps: 7
    });
  }
})(); // Search Results
// -----------------------------------


(function () {
  'use strict';

  $(initSearch);

  function initSearch() {
    if (!$.fn.slider) return;
    if (!$.fn.chosen) return;
    if (!$.fn.datepicker) return; // BOOTSTRAP SLIDER CTRL
    // -----------------------------------

    $('[data-ui-slider]').slider(); // CHOSEN
    // -----------------------------------

    $('.chosen-select').chosen(); // DATETIMEPICKER
    // -----------------------------------

    $('#datetimepicker').datepicker({
      orientation: 'bottom',
      icons: {
        time: 'fa fa-clock-o',
        date: 'fa fa-calendar',
        up: 'fa fa-chevron-up',
        down: 'fa fa-chevron-down',
        previous: 'fa fa-chevron-left',
        next: 'fa fa-chevron-right',
        today: 'fa fa-crosshairs',
        clear: 'fa fa-trash'
      }
    });
  }
})(); // Color picker
// -----------------------------------


(function () {
  'use strict';

  $(initColorPicker);

  function initColorPicker() {
    if (!$.fn.colorpicker) return;
    $('.demo-colorpicker').colorpicker();
    $('#demo_selectors').colorpicker({
      colorSelectors: {
        'default': '#777777',
        'primary': APP_COLORS['primary'],
        'success': APP_COLORS['success'],
        'info': APP_COLORS['info'],
        'warning': APP_COLORS['warning'],
        'danger': APP_COLORS['danger']
      }
    });
  }
})(); // Forms Demo
// -----------------------------------


(function () {
  'use strict';

  $(initFormsDemo);

  function initFormsDemo() {
    if (!$.fn.slider) return;
    if (!$.fn.chosen) return;
    if (!$.fn.inputmask) return;
    if (!$.fn.filestyle) return;
    if (!$.fn.wysiwyg) return;
    if (!$.fn.datepicker) return; // BOOTSTRAP SLIDER CTRL
    // -----------------------------------

    $('[data-ui-slider]').slider(); // CHOSEN
    // -----------------------------------

    $('.chosen-select').chosen(); // MASKED
    // -----------------------------------

    $('[data-masked]').inputmask(); // FILESTYLE
    // -----------------------------------

    $('.filestyle').filestyle(); // WYSIWYG
    // -----------------------------------

    $('.wysiwyg').wysiwyg(); // DATETIMEPICKER
    // -----------------------------------

    $('#datetimepicker1').datepicker({
      orientation: 'bottom',
      icons: {
        time: 'fa fa-clock-o',
        date: 'fa fa-calendar',
        up: 'fa fa-chevron-up',
        down: 'fa fa-chevron-down',
        previous: 'fa fa-chevron-left',
        next: 'fa fa-chevron-right',
        today: 'fa fa-crosshairs',
        clear: 'fa fa-trash'
      }
    }); // only time

    $('#datetimepicker2').datepicker({
      format: 'mm-dd-yyyy'
    });
  }
})();
/**=========================================================
 * Module: Image Cropper
 =========================================================*/


(function () {
  'use strict';

  $(initImageCropper);

  function initImageCropper() {
    if (!$.fn.cropper) return;
    var $image = $('.img-container > img'),
        $dataX = $('#dataX'),
        $dataY = $('#dataY'),
        $dataHeight = $('#dataHeight'),
        $dataWidth = $('#dataWidth'),
        $dataRotate = $('#dataRotate'),
        options = {
      // data: {
      //   x: 420,
      //   y: 60,
      //   width: 640,
      //   height: 360
      // },
      // strict: false,
      // responsive: false,
      // checkImageOrigin: false
      // modal: false,
      // guides: false,
      // highlight: false,
      // background: false,
      // autoCrop: false,
      // autoCropArea: 0.5,
      // dragCrop: false,
      // movable: false,
      // rotatable: false,
      // zoomable: false,
      // touchDragZoom: false,
      // mouseWheelZoom: false,
      // cropBoxMovable: false,
      // cropBoxResizable: false,
      // doubleClickToggle: false,
      // minCanvasWidth: 320,
      // minCanvasHeight: 180,
      // minCropBoxWidth: 160,
      // minCropBoxHeight: 90,
      // minContainerWidth: 320,
      // minContainerHeight: 180,
      // build: null,
      // built: null,
      // dragstart: null,
      // dragmove: null,
      // dragend: null,
      // zoomin: null,
      // zoomout: null,
      aspectRatio: 16 / 9,
      preview: '.img-preview',
      crop: function crop(data) {
        $dataX.val(Math.round(data.x));
        $dataY.val(Math.round(data.y));
        $dataHeight.val(Math.round(data.height));
        $dataWidth.val(Math.round(data.width));
        $dataRotate.val(Math.round(data.rotate));
      }
    };
    $image.on({
      'build.cropper': function buildCropper(e) {
        console.log(e.type);
      },
      'built.cropper': function builtCropper(e) {
        console.log(e.type);
      },
      'dragstart.cropper': function dragstartCropper(e) {
        console.log(e.type, e.dragType);
      },
      'dragmove.cropper': function dragmoveCropper(e) {
        console.log(e.type, e.dragType);
      },
      'dragend.cropper': function dragendCropper(e) {
        console.log(e.type, e.dragType);
      },
      'zoomin.cropper': function zoominCropper(e) {
        console.log(e.type);
      },
      'zoomout.cropper': function zoomoutCropper(e) {
        console.log(e.type);
      },
      'change.cropper': function changeCropper(e) {
        console.log(e.type);
      }
    }).cropper(options); // Methods

    $(document.body).on('click', '[data-method]', function () {
      var data = $(this).data(),
          $target,
          result;

      if (!$image.data('cropper')) {
        return;
      }

      if (data.method) {
        data = $.extend({}, data); // Clone a new one

        if (typeof data.target !== 'undefined') {
          $target = $(data.target);

          if (typeof data.option === 'undefined') {
            try {
              data.option = JSON.parse($target.val());
            } catch (e) {
              console.log(e.message);
            }
          }
        }

        result = $image.cropper(data.method, data.option);

        if (data.method === 'getCroppedCanvas') {
          $('#getCroppedCanvasModal').modal().find('.modal-body').html(result);
        }

        if ($.isPlainObject(result) && $target) {
          try {
            $target.val(JSON.stringify(result));
          } catch (e) {
            console.log(e.message);
          }
        }
      }
    }).on('keydown', function (e) {
      if (!$image.data('cropper')) {
        return;
      }

      switch (e.which) {
        case 37:
          e.preventDefault();
          $image.cropper('move', -1, 0);
          break;

        case 38:
          e.preventDefault();
          $image.cropper('move', 0, -1);
          break;

        case 39:
          e.preventDefault();
          $image.cropper('move', 1, 0);
          break;

        case 40:
          e.preventDefault();
          $image.cropper('move', 0, 1);
          break;
      }
    }); // Import image

    var $inputImage = $('#inputImage'),
        URL = window.URL || window.webkitURL,
        blobURL;

    if (URL) {
      $inputImage.change(function () {
        var files = this.files,
            file;

        if (!$image.data('cropper')) {
          return;
        }

        if (files && files.length) {
          file = files[0];

          if (/^image\/\w+$/.test(file.type)) {
            blobURL = URL.createObjectURL(file);
            $image.one('built.cropper', function () {
              URL.revokeObjectURL(blobURL); // Revoke when load complete
            }).cropper('reset').cropper('replace', blobURL);
            $inputImage.val('');
          } else {
            alert('Please choose an image file.');
          }
        }
      });
    } else {
      $inputImage.parent().remove();
    } // Options


    $('.docs-options :checkbox').on('change', function () {
      var $this = $(this);

      if (!$image.data('cropper')) {
        return;
      }

      options[$this.val()] = $this.prop('checked');
      $image.cropper('destroy').cropper(options);
    }); // Tooltips

    $('[data-toggle="tooltip"]').tooltip();
  }
})(); // Select2
// -----------------------------------


(function () {
  'use strict';

  $(initSelect2);

  function initSelect2() {
    if (!$.fn.select2) return; // Select 2

    $('#select2-1').select2({
      theme: 'bootstrap4'
    });
    $('#select2-2').select2({
      theme: 'bootstrap4'
    });
    $('#select2-3').select2({
      theme: 'bootstrap4'
    });
    $('#select2-4').select2({
      placeholder: 'Select a state',
      allowClear: true,
      theme: 'bootstrap4'
    });
  }
})();

(function () {
  'use strict';

  if (typeof Dropzone === 'undefined') return; // Prevent Dropzone from auto discovering
  // This is useful when you want to create the
  // Dropzone programmatically later

  Dropzone.autoDiscover = false;
  $(initDropzone);

  function initDropzone() {
    // Dropzone settings
    var dropzoneOptions = {
      autoProcessQueue: false,
      uploadMultiple: true,
      parallelUploads: 100,
      maxFiles: 100,
      dictDefaultMessage: '<em class="fa fa-upload text-muted"></em><br>Drop files here to upload',
      // default messages before first drop
      paramName: 'file',
      // The name that will be used to transfer the file
      maxFilesize: 2,
      // MB
      addRemoveLinks: true,
      accept: function accept(file, done) {
        if (file.name === 'justinbieber.jpg') {
          done('Naha, you dont. :)');
        } else {
          done();
        }
      },
      init: function init() {
        var dzHandler = this;
        this.element.querySelector('button[type=submit]').addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          dzHandler.processQueue();
        });
        this.on('addedfile', function (file) {
          console.log('Added file: ' + file.name);
        });
        this.on('removedfile', function (file) {
          console.log('Removed file: ' + file.name);
        });
        this.on('sendingmultiple', function () {});
        this.on('successmultiple', function ()
        /*files, response*/
        {});
        this.on('errormultiple', function ()
        /*files, response*/
        {});
      }
    };
    var dropzoneArea = new Dropzone('#dropzone-area', dropzoneOptions);
  }
})(); // Forms Demo
// -----------------------------------


(function () {
  'use strict';

  $(initWizard);

  function initWizard() {
    if (!$.fn.validate) return; // FORM EXAMPLE
    // -----------------------------------

    var form = $("#example-form");
    form.validate({
      errorPlacement: function errorPlacement(error, element) {
        element.before(error);
      },
      rules: {
        confirm: {
          equalTo: "#password"
        }
      }
    });
    form.children("div").steps({
      headerTag: "h4",
      bodyTag: "fieldset",
      transitionEffect: "slideLeft",
      onStepChanging: function onStepChanging(event, currentIndex, newIndex) {
        form.validate().settings.ignore = ":disabled,:hidden";
        return form.valid();
      },
      onFinishing: function onFinishing(event, currentIndex) {
        form.validate().settings.ignore = ":disabled";
        return form.valid();
      },
      onFinished: function onFinished(event, currentIndex) {
        alert("Submitted!"); // Submit form

        $(this).submit();
      }
    }); // VERTICAL
    // -----------------------------------

    $("#example-vertical").steps({
      headerTag: "h4",
      bodyTag: "section",
      transitionEffect: "slideLeft",
      stepsOrientation: "vertical"
    });
  }
})(); // Xeditable Demo
// -----------------------------------


(function () {
  'use strict';

  $(initXEditable);

  function initXEditable() {
    if (!$.fn.editable) return; // Font Awesome support

    $.fn.editableform.buttons = '<button type="submit" class="btn btn-primary btn-sm editable-submit">' + '<i class="fa fa-fw fa-check"></i>' + '</button>' + '<button type="button" class="btn btn-default btn-sm editable-cancel">' + '<i class="fa fa-fw fa-times"></i>' + '</button>'; //defaults
    //$.fn.editable.defaults.url = 'url/to/server';
    //enable / disable

    $('#enable').click(function () {
      $('#user .editable').editable('toggleDisabled');
    }); //editables

    $('#username').editable({
      // url: 'url/to/server',
      type: 'text',
      pk: 1,
      name: 'username',
      title: 'Enter username',
      mode: 'inline'
    });
    $('#firstname').editable({
      validate: function validate(value) {
        if ($.trim(value) === '') return 'This field is required';
      },
      mode: 'inline'
    });
    $('#sex').editable({
      prepend: "not selected",
      source: [{
        value: 1,
        text: 'Male'
      }, {
        value: 2,
        text: 'Female'
      }],
      display: function display(value, sourceData) {
        var colors = {
          "": "gray",
          1: "green",
          2: "blue"
        },
            elem = $.grep(sourceData, function (o) {
          return o.value == value;
        });

        if (elem.length) {
          $(this).text(elem[0].text).css("color", colors[value]);
        } else {
          $(this).empty();
        }
      },
      mode: 'inline'
    });
    $('#status').editable({
      mode: 'inline'
    });
    $('#group').editable({
      showbuttons: false,
      mode: 'inline'
    });
    $('#dob').editable({
      mode: 'inline'
    });
    $('#event').editable({
      placement: 'right',
      combodate: {
        firstItem: 'name'
      },
      mode: 'inline'
    });
    $('#comments').editable({
      showbuttons: 'bottom',
      mode: 'inline'
    });
    $('#note').editable({
      mode: 'inline'
    });
    $('#pencil').click(function (e) {
      e.stopPropagation();
      e.preventDefault();
      $('#note').editable('toggle');
    });
    $('#user .editable').on('hidden', function (e, reason) {
      if (reason === 'save' || reason === 'nochange') {
        var $next = $(this).closest('tr').next().find('.editable');

        if ($('#autoopen').is(':checked')) {
          setTimeout(function () {
            $next.editable('show');
          }, 300);
        } else {
          $next.focus();
        }
      }
    }); // TABLE
    // -----------------------------------

    $('#users a').editable({
      type: 'text',
      name: 'username',
      title: 'Enter username',
      mode: 'inline'
    });
  }
})();
/**=========================================================
 * Module: gmap.js
 * Init Google Map plugin
 =========================================================*/


(function () {
  'use strict';

  $(initGoogleMaps); // -------------------------
  // Map Style definition
  // -------------------------
  // Get more styles from http://snazzymaps.com/style/29/light-monochrome
  // - Just replace and assign to 'MapStyles' the new style array

  var MapStyles = [{
    featureType: 'water',
    stylers: [{
      visibility: 'on'
    }, {
      color: '#bdd1f9'
    }]
  }, {
    featureType: 'all',
    elementType: 'labels.text.fill',
    stylers: [{
      color: '#334165'
    }]
  }, {
    featureType: 'landscape',
    stylers: [{
      color: '#e9ebf1'
    }]
  }, {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{
      color: '#c5c6c6'
    }]
  }, {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{
      color: '#fff'
    }]
  }, {
    featureType: 'road.local',
    elementType: 'geometry',
    stylers: [{
      color: '#fff'
    }]
  }, {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{
      color: '#d8dbe0'
    }]
  }, {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{
      color: '#cfd5e0'
    }]
  }, {
    featureType: 'administrative',
    stylers: [{
      visibility: 'on'
    }, {
      lightness: 33
    }]
  }, {
    featureType: 'poi.park',
    elementType: 'labels',
    stylers: [{
      visibility: 'on'
    }, {
      lightness: 20
    }]
  }, {
    featureType: 'road',
    stylers: [{
      color: '#d8dbe0',
      lightness: 20
    }]
  }];

  function initGoogleMaps() {
    if (!$.fn.gMap) return;
    var mapSelector = '[data-gmap]';
    var gMapRefs = [];
    $(mapSelector).each(function () {
      var $this = $(this),
          addresses = $this.data('address') && $this.data('address').split(';'),
          titles = $this.data('title') && $this.data('title').split(';'),
          zoom = $this.data('zoom') || 14,
          maptype = $this.data('maptype') || 'ROADMAP',
          // or 'TERRAIN'
      markers = [];

      if (addresses) {
        for (var a in addresses) {
          if (typeof addresses[a] == 'string') {
            markers.push({
              address: addresses[a],
              html: titles && titles[a] || '',
              popup: true
              /* Always popup */

            });
          }
        }

        var options = {
          controls: {
            panControl: true,
            zoomControl: true,
            mapTypeControl: true,
            scaleControl: true,
            streetViewControl: true,
            overviewMapControl: true
          },
          scrollwheel: false,
          maptype: maptype,
          markers: markers,
          zoom: zoom // More options https://github.com/marioestrada/jQuery-gMap

        };
        var gMap = $this.gMap(options);
        var ref = gMap.data('gMap.reference'); // save in the map references list

        gMapRefs.push(ref); // set the styles

        if ($this.data('styled') !== undefined) {
          ref.setOptions({
            styles: MapStyles
          });
        }
      }
    }); //each
  }
})(); // jVectorMap
// -----------------------------------


(function () {
  'use strict';

  $(initVectorMap);

  function initVectorMap() {
    var element = $('[data-vector-map]');
    var seriesData = {
      'CA': 11100,
      // Canada
      'DE': 2510,
      // Germany
      'FR': 3710,
      // France
      'AU': 5710,
      // Australia
      'GB': 8310,
      // Great Britain
      'RU': 9310,
      // Russia
      'BR': 6610,
      // Brazil
      'IN': 7810,
      // India
      'CN': 4310,
      // China
      'US': 839,
      // USA
      'SA': 410 // Saudi Arabia

    };
    var markersData = [{
      latLng: [41.90, 12.45],
      name: 'Vatican City'
    }, {
      latLng: [43.73, 7.41],
      name: 'Monaco'
    }, {
      latLng: [-0.52, 166.93],
      name: 'Nauru'
    }, {
      latLng: [-8.51, 179.21],
      name: 'Tuvalu'
    }, {
      latLng: [7.11, 171.06],
      name: 'Marshall Islands'
    }, {
      latLng: [17.3, -62.73],
      name: 'Saint Kitts and Nevis'
    }, {
      latLng: [3.2, 73.22],
      name: 'Maldives'
    }, {
      latLng: [35.88, 14.5],
      name: 'Malta'
    }, {
      latLng: [41.0, -71.06],
      name: 'New England'
    }, {
      latLng: [12.05, -61.75],
      name: 'Grenada'
    }, {
      latLng: [13.16, -59.55],
      name: 'Barbados'
    }, {
      latLng: [17.11, -61.85],
      name: 'Antigua and Barbuda'
    }, {
      latLng: [-4.61, 55.45],
      name: 'Seychelles'
    }, {
      latLng: [7.35, 134.46],
      name: 'Palau'
    }, {
      latLng: [42.5, 1.51],
      name: 'Andorra'
    }];
    new VectorMap(element, seriesData, markersData);
  }
})(); // JVECTOR MAP
// -----------------------------------


(function () {
  'use strict'; // Allow Global access

  window.VectorMap = VectorMap;
  var defaultColors = {
    markerColor: '#23b7e5',
    // the marker points
    bgColor: 'transparent',
    // the background
    scaleColors: ['#878c9a'],
    // the color of the region in the serie
    regionFill: '#bbbec6' // the base region color

  };

  function VectorMap(element, seriesData, markersData) {
    if (!element || !element.length) return;
    var attrs = element.data(),
        mapHeight = attrs.height || '300',
        options = {
      markerColor: attrs.markerColor || defaultColors.markerColor,
      bgColor: attrs.bgColor || defaultColors.bgColor,
      scale: attrs.scale || 1,
      scaleColors: attrs.scaleColors || defaultColors.scaleColors,
      regionFill: attrs.regionFill || defaultColors.regionFill,
      mapName: attrs.mapName || 'world_mill_en'
    };
    element.css('height', mapHeight);
    init(element, options, seriesData, markersData);

    function init($element, opts, series, markers) {
      $element.vectorMap({
        map: opts.mapName,
        backgroundColor: opts.bgColor,
        zoomMin: 1,
        zoomMax: 8,
        zoomOnScroll: false,
        regionStyle: {
          initial: {
            'fill': opts.regionFill,
            'fill-opacity': 1,
            'stroke': 'none',
            'stroke-width': 1.5,
            'stroke-opacity': 1
          },
          hover: {
            'fill-opacity': 0.8
          },
          selected: {
            fill: 'blue'
          },
          selectedHover: {}
        },
        focusOn: {
          x: 0.4,
          y: 0.6,
          scale: opts.scale
        },
        markerStyle: {
          initial: {
            fill: opts.markerColor,
            stroke: opts.markerColor
          }
        },
        onRegionLabelShow: function onRegionLabelShow(e, el, code) {
          if (series && series[code]) el.html(el.html() + ': ' + series[code] + ' visitors');
        },
        markers: markers,
        series: {
          regions: [{
            values: series,
            scale: opts.scaleColors,
            normalizeFunction: 'polynomial'
          }]
        }
      });
    } // end init

  }

  ;
})();
/**
 * Used for user pages
 * Login and Register
 */


(function () {
  'use strict';

  $(initParsleyForPages);

  function initParsleyForPages() {
    // Parsley options setup for bootstrap validation classes
    var parsleyOptions = {
      errorClass: 'is-invalid',
      successClass: 'is-valid',
      classHandler: function classHandler(ParsleyField) {
        var el = ParsleyField.$element.parents('.form-group').find('input');
        if (!el.length) // support custom checkbox
          el = ParsleyField.$element.parents('.c-checkbox').find('label');
        return el;
      },
      errorsContainer: function errorsContainer(ParsleyField) {
        return ParsleyField.$element.parents('.form-group');
      },
      errorsWrapper: '<div class="text-help">',
      errorTemplate: '<div></div>'
    }; // Login form validation with Parsley

    var loginForm = $("#loginForm");
    if (loginForm.length) loginForm.parsley(parsleyOptions); // Register form validation with Parsley

    var registerForm = $("#registerForm");
    if (registerForm.length) registerForm.parsley(parsleyOptions);
  }
})(); // BOOTGRID
// -----------------------------------


(function () {
  'use strict';

  $(initBootgrid);

  function initBootgrid() {
    if (!$.fn.bootgrid) return;
    $('#bootgrid-basic').bootgrid({
      templates: {
        // templates for BS4
        actionButton: '<button class="btn btn-secondary" type="button" title="{{ctx.text}}">{{ctx.content}}</button>',
        actionDropDown: '<div class="{{css.dropDownMenu}}"><button class="btn btn-secondary dropdown-toggle dropdown-toggle-nocaret" type="button" data-toggle="dropdown"><span class="{{css.dropDownMenuText}}">{{ctx.content}}</span></button><ul class="{{css.dropDownMenuItems}}" role="menu"></ul></div>',
        actionDropDownItem: '<li class="dropdown-item"><a href="" data-action="{{ctx.action}}" class="dropdown-link {{css.dropDownItemButton}}">{{ctx.text}}</a></li>',
        actionDropDownCheckboxItem: '<li class="dropdown-item"><label class="dropdown-item p-0"><input name="{{ctx.name}}" type="checkbox" value="1" class="{{css.dropDownItemCheckbox}}" {{ctx.checked}} /> {{ctx.label}}</label></li>',
        paginationItem: '<li class="page-item {{ctx.css}}"><a href="" data-page="{{ctx.page}}" class="page-link {{css.paginationButton}}">{{ctx.text}}</a></li>'
      }
    });
    $('#bootgrid-selection').bootgrid({
      selection: true,
      multiSelect: true,
      rowSelect: true,
      keepSelection: true,
      templates: {
        select: '<div class="custom-control custom-checkbox">' + '<input type="{{ctx.type}}" class="custom-control-input {{css.selectBox}}" id="customCheck1" value="{{ctx.value}}" {{ctx.checked}}>' + '<label class="custom-control-label" for="customCheck1"></label>' + '</div>',
        // templates for BS4
        actionButton: '<button class="btn btn-secondary" type="button" title="{{ctx.text}}">{{ctx.content}}</button>',
        actionDropDown: '<div class="{{css.dropDownMenu}}"><button class="btn btn-secondary dropdown-toggle dropdown-toggle-nocaret" type="button" data-toggle="dropdown"><span class="{{css.dropDownMenuText}}">{{ctx.content}}</span></button><ul class="{{css.dropDownMenuItems}}" role="menu"></ul></div>',
        actionDropDownItem: '<li class="dropdown-item"><a href="" data-action="{{ctx.action}}" class="dropdown-link {{css.dropDownItemButton}}">{{ctx.text}}</a></li>',
        actionDropDownCheckboxItem: '<li class="dropdown-item"><label class="dropdown-item p-0"><input name="{{ctx.name}}" type="checkbox" value="1" class="{{css.dropDownItemCheckbox}}" {{ctx.checked}} /> {{ctx.label}}</label></li>',
        paginationItem: '<li class="page-item {{ctx.css}}"><a href="" data-page="{{ctx.page}}" class="page-link {{css.paginationButton}}">{{ctx.text}}</a></li>'
      }
    });
    var grid = $('#bootgrid-command').bootgrid({
      formatters: {
        commands: function commands(column, row) {
          return '<button type="button" class="btn btn-sm btn-info mr-2 command-edit" data-row-id="' + row.id + '"><em class="fa fa-edit fa-fw"></em></button>' + '<button type="button" class="btn btn-sm btn-danger command-delete" data-row-id="' + row.id + '"><em class="fa fa-trash fa-fw"></em></button>';
        }
      },
      templates: {
        // templates for BS4
        actionButton: '<button class="btn btn-secondary" type="button" title="{{ctx.text}}">{{ctx.content}}</button>',
        actionDropDown: '<div class="{{css.dropDownMenu}}"><button class="btn btn-secondary dropdown-toggle dropdown-toggle-nocaret" type="button" data-toggle="dropdown"><span class="{{css.dropDownMenuText}}">{{ctx.content}}</span></button><ul class="{{css.dropDownMenuItems}}" role="menu"></ul></div>',
        actionDropDownItem: '<li class="dropdown-item"><a href="" data-action="{{ctx.action}}" class="dropdown-link {{css.dropDownItemButton}}">{{ctx.text}}</a></li>',
        actionDropDownCheckboxItem: '<li class="dropdown-item"><label class="dropdown-item p-0"><input name="{{ctx.name}}" type="checkbox" value="1" class="{{css.dropDownItemCheckbox}}" {{ctx.checked}} /> {{ctx.label}}</label></li>',
        paginationItem: '<li class="page-item {{ctx.css}}"><a href="" data-page="{{ctx.page}}" class="page-link {{css.paginationButton}}">{{ctx.text}}</a></li>'
      }
    }).on('loaded.rs.jquery.bootgrid', function () {
      /* Executes after data is loaded and rendered */
      grid.find('.command-edit').on('click', function () {
        console.log('You pressed edit on row: ' + $(this).data('row-id'));
      }).end().find('.command-delete').on('click', function () {
        console.log('You pressed delete on row: ' + $(this).data('row-id'));
      });
    });
  }
})(); // DATATABLES
// -----------------------------------


(function () {
  'use strict';

  $(initDatatables);

  function initDatatables() {
    if (!$.fn.DataTable) return; // Zero configuration

    $('#datatable1').DataTable({
      'paging': true,
      // Table pagination
      'ordering': true,
      // Column ordering
      'info': true,
      // Bottom left status text
      responsive: true,
      // Text translation options
      // Note the required keywords between underscores (e.g _MENU_)
      oLanguage: {
        sSearch: '<em class="fas fa-search"></em>',
        sLengthMenu: '_MENU_ records per page',
        info: 'Showing page _PAGE_ of _PAGES_',
        zeroRecords: 'Nothing found - sorry',
        infoEmpty: 'No records available',
        infoFiltered: '(filtered from _MAX_ total records)',
        oPaginate: {
          sNext: '<em class="fa fa-caret-right"></em>',
          sPrevious: '<em class="fa fa-caret-left"></em>'
        }
      }
    }); // Filter

    $('#datatable2').DataTable({
      'paging': true,
      // Table pagination
      'ordering': true,
      // Column ordering
      'info': true,
      // Bottom left status text
      responsive: true,
      // Text translation options
      // Note the required keywords between underscores (e.g _MENU_)
      oLanguage: {
        sSearch: 'Search all columns:',
        sLengthMenu: '_MENU_ records per page',
        info: 'Showing page _PAGE_ of _PAGES_',
        zeroRecords: 'Nothing found - sorry',
        infoEmpty: 'No records available',
        infoFiltered: '(filtered from _MAX_ total records)',
        oPaginate: {
          sNext: '<em class="fa fa-caret-right"></em>',
          sPrevious: '<em class="fa fa-caret-left"></em>'
        }
      },
      // Datatable Buttons setup
      dom: 'Bfrtip',
      buttons: [{
        extend: 'copy',
        className: 'btn-info'
      }, {
        extend: 'csv',
        className: 'btn-info'
      }, {
        extend: 'excel',
        className: 'btn-info',
        title: 'XLS-File'
      }, {
        extend: 'pdf',
        className: 'btn-info',
        title: $('title').text()
      }, {
        extend: 'print',
        className: 'btn-info'
      }]
    });
    $('#datatable3').DataTable({
      'paging': true,
      // Table pagination
      'ordering': true,
      // Column ordering
      'info': true,
      // Bottom left status text
      responsive: true,
      // Text translation options
      // Note the required keywords between underscores (e.g _MENU_)
      oLanguage: {
        sSearch: 'Search all columns:',
        sLengthMenu: '_MENU_ records per page',
        info: 'Showing page _PAGE_ of _PAGES_',
        zeroRecords: 'Nothing found - sorry',
        infoEmpty: 'No records available',
        infoFiltered: '(filtered from _MAX_ total records)',
        oPaginate: {
          sNext: '<em class="fa fa-caret-right"></em>',
          sPrevious: '<em class="fa fa-caret-left"></em>'
        }
      },
      // Datatable key setup
      keys: true
    });
  }
})(); // Custom Code
// -----------------------------------


(function () {
  'use strict';

  $(initCustom);

  function initCustom() {// custom code
  }
})();
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndyYXBwZXIuanMiLCJhcHAuaW5pdC5qcyIsImNoYXJ0cy9jaGFydC1rbm9iLmpzIiwiY2hhcnRzL2NoYXJ0LmpzIiwiY2hhcnRzL2NoYXJ0aXN0LmpzIiwiY2hhcnRzL2Vhc3lwaWVjaGFydC5qcyIsImNoYXJ0cy9mbG90LmpzIiwiY2hhcnRzL21vcnJpcy5qcyIsImNoYXJ0cy9yaWNrc2hhdy5qcyIsImNoYXJ0cy9zcGFya2xpbmUuanMiLCJjb21tb24vYm9vdHN0cmFwLXN0YXJ0LmpzIiwiY29tbW9uL2NhcmQtdG9vbHMuanMiLCJjb21tb24vY29uc3RhbnRzLmpzIiwiY29tbW9uL2Z1bGxzY3JlZW4uanMiLCJjb21tb24vbG9hZC1jc3MuanMiLCJjb21tb24vbG9jYWxpemUuanMiLCJjb21tb24vbmF2YmFyLXNlYXJjaC5qcyIsImNvbW1vbi9ub3cuanMiLCJjb21tb24vcnRsLmpzIiwiY29tbW9uL3NpZGViYXIuanMiLCJjb21tb24vc2xpbXNjcm9sbC5qcyIsImNvbW1vbi90YWJsZS1jaGVja2FsbC5qcyIsImNvbW1vbi90b2dnbGUtc3RhdGUuanMiLCJjb21tb24vdHJpZ2dlci1yZXNpemUuanMiLCJlbGVtZW50cy9jYXJkcy5qcyIsImVsZW1lbnRzL25lc3RhYmxlLmpzIiwiZWxlbWVudHMvbm90aWZ5LmpzIiwiZWxlbWVudHMvcG9ybGV0cy5qcyIsImVsZW1lbnRzL3NvcnRhYmxlLmpzIiwiZWxlbWVudHMvc3dlZXRhbGVydC5qcyIsImV4dHJhcy9jYWxlbmRhci5qcyIsImV4dHJhcy9qcWNsb3VkLmpzIiwiZXh0cmFzL3NlYXJjaC5qcyIsImZvcm1zL2NvbG9yLXBpY2tlci5qcyIsImZvcm1zL2Zvcm1zLmpzIiwiZm9ybXMvaW1hZ2Vjcm9wLmpzIiwiZm9ybXMvc2VsZWN0Mi5qcyIsImZvcm1zL3VwbG9hZC5qcyIsImZvcm1zL3dpemFyZC5qcyIsImZvcm1zL3hlZGl0YWJsZS5qcyIsIm1hcHMvZ21hcC5qcyIsIm1hcHMvdmVjdG9yLm1hcC5kZW1vLmpzIiwibWFwcy92ZWN0b3IubWFwLmpzIiwicGFnZXMvcGFnZXMuanMiLCJ0YWJsZXMvYm9vdGdyaWQuanMiLCJ0YWJsZXMvZGF0YXRhYmxlLmpzIiwiY3VzdG9tLmpzIl0sIm5hbWVzIjpbImdsb2JhbCIsImZhY3RvcnkiLCJleHBvcnRzIiwibW9kdWxlIiwialF1ZXJ5IiwiJCIsIndpbmRvdyIsImFycmF5RnJvbSIsIm9iaiIsInNsaWNlIiwiY2FsbCIsImZpbHRlciIsImN0eCIsImZuIiwibWFwIiwibWF0Y2hlcyIsIml0ZW0iLCJzZWxlY3RvciIsIkVsZW1lbnQiLCJwcm90b3R5cGUiLCJtc01hdGNoZXNTZWxlY3RvciIsIkV2ZW50SGFuZGxlciIsImV2ZW50cyIsImJpbmQiLCJldmVudCIsImxpc3RlbmVyIiwidGFyZ2V0IiwidHlwZSIsInNwbGl0IiwiYWRkRXZlbnRMaXN0ZW5lciIsInVuYmluZCIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJXcmFwIiwiX3NldHVwIiwiQ29uc3RydWN0b3IiLCJwYXJhbSIsImF0dHJzIiwiZWwiLCJpbml0IiwiY29uc3RydWN0b3IiLCJlbGVtIiwiX2NyZWF0ZSIsImF0dHIiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJub2RlVHlwZSIsInJlYWR5Iiwic3RyIiwibm9kZU5hbWUiLCJzdWJzdHIiLCJpbmRleE9mIiwicmVwbGFjZSIsImNyZWF0ZUVsZW1lbnQiLCJlbGVtZW50cyIsImkiLCJsZW5ndGgiLCJfZmlyc3QiLCJjYiIsInJldCIsImYiLCJfY2xhc3NlcyIsIm1ldGhvZCIsImNsYXNzbmFtZSIsImNscyIsImZvckVhY2giLCJjbGFzc0xpc3QiLCJjb250YWlucyIsImVhY2giLCJfYWNjZXNzIiwia2V5IiwidmFsdWUiLCJrIiwidW5kZWZpbmVkIiwiYXJyIiwiZXh0ZW5kIiwibWV0aG9kcyIsIk9iamVjdCIsImtleXMiLCJtIiwiYXR0YWNoRXZlbnQiLCJyZWFkeVN0YXRlIiwiY3NzIiwiZ2V0U3R5bGUiLCJlIiwic3R5bGUiLCJnZXRDb21wdXRlZFN0eWxlIiwidmFsIiwidW5pdCIsImdldEF0dHJpYnV0ZSIsInNldEF0dHJpYnV0ZSIsInByb3AiLCJwb3NpdGlvbiIsImxlZnQiLCJvZmZzZXRMZWZ0IiwidG9wIiwib2Zmc2V0VG9wIiwic2Nyb2xsVG9wIiwib3V0ZXJIZWlnaHQiLCJpbmNsdWRlTWFyZ2luIiwibWFyZ2lucyIsInBhcnNlSW50IiwibWFyZ2luVG9wIiwibWFyZ2luQm90dG9tIiwib2Zmc2V0SGVpZ2h0IiwiaW5kZXgiLCJwYXJlbnROb2RlIiwiY2hpbGRyZW4iLCJjaGlsZHMiLCJjb25jYXQiLCJzaWJsaW5ncyIsInNpYnMiLCJjaGlsZCIsInBhcmVudCIsInBhciIsInBhcmVudHMiLCJwIiwicGFyZW50RWxlbWVudCIsInB1c2giLCJmaW5kIiwiZm91bmQiLCJmaXRlbSIsInJlcyIsImlzIiwiYXBwZW5kVG8iLCJhcHBlbmRDaGlsZCIsImFwcGVuZCIsImluc2VydEFmdGVyIiwicXVlcnlTZWxlY3RvciIsImluc2VydEJlZm9yZSIsIm5leHRTaWJsaW5nIiwiY2xvbmUiLCJjbG9uZXMiLCJjbG9uZU5vZGUiLCJyZW1vdmUiLCJkYXRhIiwicmVtb3ZlQ2hpbGQiLCJoYXNKU09OIiwiZGF0YUF0dHIiLCJ0b0xvd2VyQ2FzZSIsInRlc3QiLCJKU09OIiwicGFyc2UiLCJ0cmlnZ2VyIiwiY3JlYXRlRXZlbnQiLCJpbml0RXZlbnQiLCJkaXNwYXRjaEV2ZW50IiwiYmx1ciIsImZvY3VzIiwib24iLCJjYWxsYmFjayIsImV2Iiwib2ZmIiwidG9nZ2xlQ2xhc3MiLCJhZGRDbGFzcyIsInJlbW92ZUNsYXNzIiwiaGFzQ2xhc3MiLCJjb2xsYXBzZSIsImFjdGlvbiIsIiRpdGVtIiwiY3VycmVudFRhcmdldCIsInByZXZlbnREZWZhdWx0IiwidGFiUGFuZSIsImRkIiwiJGJvZHkiLCJTdGF0ZVRvZ2dsZXIiLCJyZXN0b3JlU3RhdGUiLCJpbml0S25vYiIsImtub2IiLCJrbm9iTG9hZGVyT3B0aW9uczEiLCJ3aWR0aCIsImRpc3BsYXlJbnB1dCIsImZnQ29sb3IiLCJBUFBfQ09MT1JTIiwia25vYkxvYWRlck9wdGlvbnMyIiwicmVhZE9ubHkiLCJrbm9iTG9hZGVyT3B0aW9uczMiLCJiZ0NvbG9yIiwiYW5nbGVPZmZzZXQiLCJhbmdsZUFyYyIsImtub2JMb2FkZXJPcHRpb25zNCIsImRpc3BsYXlQcmV2aW91cyIsInRoaWNrbmVzcyIsImxpbmVDYXAiLCJpbml0Q2hhcnRKUyIsIkNoYXJ0IiwickZhY3RvciIsIk1hdGgiLCJyb3VuZCIsInJhbmRvbSIsImxpbmVEYXRhIiwibGFiZWxzIiwiZGF0YXNldHMiLCJsYWJlbCIsImJhY2tncm91bmRDb2xvciIsImJvcmRlckNvbG9yIiwicG9pbnRCb3JkZXJDb2xvciIsImxpbmVPcHRpb25zIiwibGVnZW5kIiwiZGlzcGxheSIsImxpbmVjdHgiLCJnZXRFbGVtZW50QnlJZCIsImdldENvbnRleHQiLCJsaW5lQ2hhcnQiLCJvcHRpb25zIiwiYmFyRGF0YSIsImJhck9wdGlvbnMiLCJiYXJjdHgiLCJiYXJDaGFydCIsImRvdWdobnV0RGF0YSIsImhvdmVyQmFja2dyb3VuZENvbG9yIiwiZG91Z2hudXRPcHRpb25zIiwiZG91Z2hudXRjdHgiLCJkb3VnaG51dENoYXJ0IiwicGllRGF0YSIsInBpZU9wdGlvbnMiLCJwaWVjdHgiLCJwaWVDaGFydCIsInBvbGFyRGF0YSIsInBvbGFyT3B0aW9ucyIsInBvbGFyY3R4IiwicG9sYXJDaGFydCIsInJhZGFyRGF0YSIsInJhZGFyT3B0aW9ucyIsInJhZGFyY3R4IiwicmFkYXJDaGFydCIsImluaXRDaGFydGlzdHMiLCJDaGFydGlzdCIsImRhdGExIiwic2VyaWVzIiwib3B0aW9uczEiLCJoaWdoIiwibG93IiwiaGVpZ2h0IiwiYXhpc1giLCJsYWJlbEludGVycG9sYXRpb25GbmMiLCJCYXIiLCJzZXJpZXNCYXJEaXN0YW5jZSIsInJldmVyc2VEYXRhIiwiaG9yaXpvbnRhbEJhcnMiLCJheGlzWSIsIm9mZnNldCIsIkxpbmUiLCJmdWxsV2lkdGgiLCJjaGFydFBhZGRpbmciLCJyaWdodCIsImNoYXJ0MSIsInNob3dBcmVhIiwic2hvd1BvaW50IiwiZWxlbWVudCIsImFuaW1hdGUiLCJkIiwiYmVnaW4iLCJkdXIiLCJmcm9tIiwicGF0aCIsInNjYWxlIiwidHJhbnNsYXRlIiwiY2hhcnRSZWN0Iiwic3RyaW5naWZ5IiwidG8iLCJlYXNpbmciLCJTdmciLCJFYXNpbmciLCJlYXNlT3V0UXVpbnQiLCJjaGFydCIsInNlcSIsImRlbGF5cyIsImR1cmF0aW9ucyIsIm9wYWNpdHkiLCJheGlzIiwieSIsIngiLCJ4MSIsIngyIiwicG9zMUFuaW1hdGlvbiIsInVuaXRzIiwicG9zIiwicG9zMkFuaW1hdGlvbiIsImFuaW1hdGlvbnMiLCJfX2V4YW1wbGVBbmltYXRlVGltZW91dCIsImNsZWFyVGltZW91dCIsInNldFRpbWVvdXQiLCJ1cGRhdGUiLCJpbml0RWFzeVBpZUNoYXJ0IiwiZWFzeVBpZUNoYXJ0IiwiJGVsZW0iLCJwaWVPcHRpb25zMSIsImR1cmF0aW9uIiwiZW5hYmxlZCIsImJhckNvbG9yIiwidHJhY2tDb2xvciIsInNjYWxlQ29sb3IiLCJsaW5lV2lkdGgiLCJwaWVPcHRpb25zMiIsInBpZU9wdGlvbnMzIiwicGllT3B0aW9uczQiLCJpbml0RmxvdFNwbGluZSIsImRhdGF2MiIsImRhdGF2MyIsImxpbmVzIiwic2hvdyIsInBvaW50cyIsInJhZGl1cyIsInNwbGluZXMiLCJ0ZW5zaW9uIiwiZmlsbCIsImdyaWQiLCJib3JkZXJXaWR0aCIsImhvdmVyYWJsZSIsInRvb2x0aXAiLCJ0b29sdGlwT3B0cyIsImNvbnRlbnQiLCJ4YXhpcyIsInRpY2tDb2xvciIsIm1vZGUiLCJ5YXhpcyIsIm1pbiIsIm1heCIsInRpY2tGb3JtYXR0ZXIiLCJ2Iiwic2hhZG93U2l6ZSIsInBsb3QiLCJjaGFydHYyIiwiY2hhcnR2MyIsImluaXRGbG90QXJlYSIsImluaXRGbG90QmFyIiwiYmFycyIsImFsaWduIiwiYmFyV2lkdGgiLCJpbml0RmxvdEJhclN0YWNrZWQiLCJzdGFjayIsImluaXRGbG90RG9udXQiLCJwaWUiLCJpbm5lclJhZGl1cyIsImluaXRGbG90TGluZSIsImluaXRGbG90UGllIiwiZm9ybWF0dGVyIiwicGVyY2VudCIsImJhY2tncm91bmQiLCJjb2xvciIsImluaXRNb3JyaXMiLCJNb3JyaXMiLCJjaGFydGRhdGEiLCJhIiwiYiIsImRvbnV0ZGF0YSIsInhrZXkiLCJ5a2V5cyIsImxpbmVDb2xvcnMiLCJyZXNpemUiLCJEb251dCIsImNvbG9ycyIsInhMYWJlbE1hcmdpbiIsImJhckNvbG9ycyIsIkFyZWEiLCJSaWNrc2hhdyIsInNlcmllc0RhdGEiLCJGaXh0dXJlcyIsIlJhbmRvbURhdGEiLCJhZGREYXRhIiwic2VyaWVzMSIsIm5hbWUiLCJncmFwaDEiLCJHcmFwaCIsInJlbmRlcmVyIiwicmVuZGVyIiwiZ3JhcGgyIiwic3Ryb2tlIiwiZ3JhcGgzIiwiZ3JhcGg0IiwiaW5pdFNwYXJrbGluZSIsImluaXRTcGFya0xpbmUiLCIkZWxlbWVudCIsInZhbHVlcyIsImRpc2FibGVIaWRkZW5DaGVjayIsInNwYXJrbGluZSIsImluaXRCb290c3RyYXAiLCJwb3BvdmVyIiwiY29udGFpbmVyIiwic3RvcFByb3BhZ2F0aW9uIiwiaW5pdENhcmREaXNtaXNzIiwiaW5pdENhcmRDb2xsYXBzZSIsImluaXRDYXJkUmVmcmVzaCIsImdldENhcmRQYXJlbnQiLCJ0cmlnZ2VyRXZlbnQiLCJDdXN0b21FdmVudCIsImRldGFpbCIsImluaXRDdXN0b21FdmVudCIsImNhcmR0b29sU2VsZWN0b3IiLCJjYXJkTGlzdCIsIkNhcmREaXNtaXNzIiwiRVZFTlRfUkVNT1ZFIiwiRVZFTlRfUkVNT1ZFRCIsImNhcmRQYXJlbnQiLCJyZW1vdmluZyIsImNsaWNrSGFuZGxlciIsImNvbmZpcm0iLCJjYW5jZWwiLCJjbGFzc05hbWUiLCJpbml0aWFsU3RhdGUiLCJoYXNBdHRyaWJ1dGUiLCJDYXJkQ29sbGFwc2UiLCJzdGFydENvbGxhcHNlZCIsIkVWRU5UX1NIT1ciLCJFVkVOVF9ISURFIiwic3RhdGUiLCJ3cmFwcGVyIiwidG9nZ2xlQ29sbGFwc2UiLCJtYXhIZWlnaHQiLCJzY3JvbGxIZWlnaHQiLCJ1cGRhdGVJY29uIiwiZmlyc3RFbGVtZW50Q2hpbGQiLCJpbml0U3R5bGVzIiwidHJhbnNpdGlvbiIsIm92ZXJmbG93IiwiQ2FyZFJlZnJlc2giLCJFVkVOVF9SRUZSRVNIIiwiV0hJUkxfQ0xBU1MiLCJERUZBVUxUX1NQSU5ORVIiLCJzcGlubmVyIiwiZGF0YXNldCIsInJlZnJlc2giLCJjYXJkIiwic2hvd1NwaW5uZXIiLCJyZW1vdmVTcGlubmVyIiwiYWRkIiwicyIsIkFQUF9NRURJQVFVRVJZIiwiaW5pdFNjcmVlbkZ1bGwiLCJzY3JlZW5mdWxsIiwiJGRvYyIsIiRmc1RvZ2dsZXIiLCJ1YSIsIm5hdmlnYXRvciIsInVzZXJBZ2VudCIsIm1hdGNoIiwidG9nZ2xlIiwidG9nZ2xlRlNJY29uIiwiY29uc29sZSIsImxvZyIsInJhdyIsImZ1bGxzY3JlZW5jaGFuZ2UiLCJpc0Z1bGxzY3JlZW4iLCJpbml0TG9hZENTUyIsInVyaSIsImxpbmsiLCJjcmVhdGVMaW5rIiwiZXJyb3IiLCJsaW5rSWQiLCJvbGRMaW5rIiwiaW5pdFRyYW5zbGF0aW9uIiwicGF0aFByZWZpeCIsIlNUT1JBR0VLRVkiLCJzYXZlZExhbmd1YWdlIiwiU3RvcmFnZXMiLCJsb2NhbFN0b3JhZ2UiLCJnZXQiLCJpMThuZXh0IiwidXNlIiwiaTE4bmV4dFhIUkJhY2tlbmQiLCJmYWxsYmFja0xuZyIsImJhY2tlbmQiLCJsb2FkUGF0aCIsIm5zIiwiZGVmYXVsdE5TIiwiZGVidWciLCJlcnIiLCJ0IiwiYXBwbHlUcmFubGF0aW9ucyIsImF0dGFjaENoYW5nZUxpc3RlbmVyIiwibGlzdCIsImV4aXN0cyIsImlubmVySFRNTCIsInRhZ05hbWUiLCJsYW5nIiwiY2hhbmdlTGFuZ3VhZ2UiLCJzZXQiLCJhY3RpdmF0ZURyb3Bkb3duIiwicHJldmlvdXNFbGVtZW50U2libGluZyIsImluaXROYXZiYXJTZWFyY2giLCJuYXZTZWFyY2giLCJuYXZiYXJTZWFyY2hJbnB1dCIsIiRzZWFyY2hPcGVuIiwiJHNlYXJjaERpc21pc3MiLCJpbnB1dFNlbGVjdG9yIiwia2V5Q29kZSIsImRpc21pc3MiLCJuYXZiYXJGb3JtU2VsZWN0b3IiLCJuYXZiYXJGb3JtIiwiaXNPcGVuIiwiaW5pdE5vd1RpbWVyIiwibW9tZW50IiwiZm9ybWF0IiwidXBkYXRlVGltZSIsImR0IiwiRGF0ZSIsInRleHQiLCJzZXRJbnRlcnZhbCIsImluaXRSVEwiLCJtYWluY3NzIiwiYnNjc3MiLCJjaGVja2VkIiwiaW5pdFNpZGViYXIiLCIkaHRtbCIsIiRzaWRlYmFyIiwic2lkZWJhckNvbGxhcHNlIiwiY3VycmVudEl0ZW0iLCJ1c2VBc2lkZUhvdmVyIiwiZXZlbnROYW1lIiwiaXNUb3VjaCIsInN1Yk5hdiIsImlzU2lkZWJhckNvbGxhcHNlZCIsInRvZ2dsZU1lbnVJdGVtIiwic2lkZWJhckFkZEJhY2tkcm9wIiwic2lkZWJhckFueWNsaWNrQ2xvc2UiLCIkdGFyZ2V0IiwiJGJhY2tkcm9wIiwicmVtb3ZlRmxvYXRpbmdOYXYiLCJ0b2dnbGVUb3VjaEl0ZW0iLCIkbGlzdEl0ZW0iLCJ1bCIsIiRhc2lkZSIsIiRhc2lkZUlubmVyIiwibWFyIiwiaXRlbVRvcCIsInZ3SGVpZ2h0IiwiYm9keSIsImNsaWVudEhlaWdodCIsImlzRml4ZWQiLCJib3R0b20iLCJpc1NpZGViYXJUb2dnbGVkIiwiaXNNb2JpbGUiLCJjbGllbnRXaWR0aCIsInRhYmxldCIsImluaXRTbGltc1Nyb2xsIiwic2xpbVNjcm9sbCIsImRlZmF1bHRIZWlnaHQiLCJpbml0VGFibGVDaGVja0FsbCIsIiR0aGlzIiwiY2hlY2tib3giLCJ0YWJsZSIsImluaXRUb2dnbGVTdGF0ZSIsIm5vUGVyc2lzdCIsInJlbW92ZVN0YXRlIiwiYWRkU3RhdGUiLCJFdmVudCIsInJlc2l6ZUV2ZW50IiwiaW5pdFVJRXZlbnQiLCJTVE9SQUdFX0tFWV9OQU1FIiwiQXJyYXkiLCJzcGxpY2UiLCJqb2luIiwiaW5pdFRyaWdnZXJSZXNpemUiLCJldnQiLCJpbml0Q2FyZERlbW8iLCJpbml0TmVzdGFibGUiLCJuZXN0YWJsZSIsInVwZGF0ZU91dHB1dCIsIm91dHB1dCIsImdyb3VwIiwiaW5pdE5vdGlmeSIsIlNlbGVjdG9yIiwiYXV0b2xvYWRTZWxlY3RvciIsImRvYyIsIm9ubG9hZCIsIm5vdGlmeU5vdyIsIm1lc3NhZ2UiLCJub3RpZnkiLCJjb250YWluZXJzIiwibWVzc2FnZXMiLCJhcmd1bWVudHMiLCJzdGF0dXMiLCJNZXNzYWdlIiwiY2xvc2VBbGwiLCJpbnN0YW50bHkiLCJpZCIsImNsb3NlIiwiZGVmYXVsdHMiLCJ1dWlkIiwiZ2V0VGltZSIsImNlaWwiLCJjdXJyZW50c3RhdHVzIiwidGltb3V0IiwicHJlcGVuZCIsIm1hcmdpbmJvdHRvbSIsInRpbWVvdXQiLCJjbG9zZWZuIiwiaG92ZXIiLCJmaW5hbGl6ZSIsImhpZGUiLCJodG1sIiwiaW5pdFBvcnRsZXRzIiwic29ydGFibGUiLCJjb25uZWN0V2l0aCIsIml0ZW1zIiwiaGFuZGxlIiwicGxhY2Vob2xkZXIiLCJmb3JjZVBsYWNlaG9sZGVyU2l6ZSIsImlmcmFtZUZpeCIsInRvbGVyYW5jZSIsImhlbHBlciIsInJldmVydCIsImZvcmNlSGVscGVyU2l6ZSIsInNhdmVQb3J0bGV0T3JkZXIiLCJjcmVhdGUiLCJsb2FkUG9ydGxldE9yZGVyIiwidWkiLCJwb3JsZXRJZCIsImNhcmRzIiwicG9ydGxldCIsInJlc2V0UG9ybGV0cyIsImxvY2F0aW9uIiwicmVsb2FkIiwiaW5pdFNvcnRhYmxlIiwiaW5pdFN3ZWV0QWxlcnQiLCJzd2FsIiwidGl0bGUiLCJpY29uIiwiYnV0dG9ucyIsInZpc2libGUiLCJjbG9zZU1vZGFsIiwidGhlbiIsImlzQ29uZmlybSIsIkZ1bGxDYWxlbmRhciIsImluaXRFeHRlcm5hbEV2ZW50cyIsImluaXRGdWxsQ2FsZW5kYXIiLCJDYWxlbmRhciIsIkRyYWdnYWJsZSIsIkZ1bGxDYWxlbmRhckludGVyYWN0aW9uIiwiY29udGFpbmVyRWwiLCJpdGVtU2VsZWN0b3IiLCJldmVudERhdGEiLCJldmVudEVsIiwiaW5uZXJUZXh0IiwidHJpbSIsImNhbGVuZGFyRWwiLCJjYWxlbmRhciIsImNyZWF0ZURlbW9FdmVudHMiLCJwbHVnaW5zIiwidGhlbWVTeXN0ZW0iLCJoZWFkZXIiLCJjZW50ZXIiLCJlZGl0YWJsZSIsImRyb3BwYWJsZSIsImV2ZW50UmVjZWl2ZSIsImluZm8iLCJzdHlsZXMiLCJkcmFnZ2VkRWwiLCJzZXRQcm9wIiwiY29sb3JTZWxlY3RvckNvbnRhaW5lciIsImFkZEV2ZW50QnV0dG9uIiwiZXZlbnROYW1lSW5wdXQiLCJjb2xvclNlbGVjdG9ycyIsImN1cnJlbnRTZWxlY3RvciIsInNlbCIsInNlbGVjdENvbG9yU2VsZWN0b3IiLCJhZGROZXdFeHRlcm5hbEV2ZW50IiwidW5zZWxlY3RBbGxDb2xvclNlbGVjdG9yIiwiZmlyc3RDaGlsZCIsImJhc2VFbGVtZW50IiwiZGF0ZSIsImdldERhdGUiLCJnZXRNb250aCIsImdldEZ1bGxZZWFyIiwic3RhcnQiLCJlbmQiLCJhbGxEYXkiLCJ1cmwiLCJpbml0V29yZENsb3VkIiwialFDbG91ZCIsIndvcmRfYXJyYXkiLCJ3ZWlnaHQiLCJzdGVwcyIsImluaXRTZWFyY2giLCJzbGlkZXIiLCJjaG9zZW4iLCJkYXRlcGlja2VyIiwib3JpZW50YXRpb24iLCJpY29ucyIsInRpbWUiLCJ1cCIsImRvd24iLCJwcmV2aW91cyIsIm5leHQiLCJ0b2RheSIsImNsZWFyIiwiaW5pdENvbG9yUGlja2VyIiwiY29sb3JwaWNrZXIiLCJpbml0Rm9ybXNEZW1vIiwiaW5wdXRtYXNrIiwiZmlsZXN0eWxlIiwid3lzaXd5ZyIsImluaXRJbWFnZUNyb3BwZXIiLCJjcm9wcGVyIiwiJGltYWdlIiwiJGRhdGFYIiwiJGRhdGFZIiwiJGRhdGFIZWlnaHQiLCIkZGF0YVdpZHRoIiwiJGRhdGFSb3RhdGUiLCJhc3BlY3RSYXRpbyIsInByZXZpZXciLCJjcm9wIiwicm90YXRlIiwiZHJhZ1R5cGUiLCJyZXN1bHQiLCJvcHRpb24iLCJtb2RhbCIsImlzUGxhaW5PYmplY3QiLCJ3aGljaCIsIiRpbnB1dEltYWdlIiwiVVJMIiwid2Via2l0VVJMIiwiYmxvYlVSTCIsImNoYW5nZSIsImZpbGVzIiwiZmlsZSIsImNyZWF0ZU9iamVjdFVSTCIsIm9uZSIsInJldm9rZU9iamVjdFVSTCIsImFsZXJ0IiwiaW5pdFNlbGVjdDIiLCJzZWxlY3QyIiwidGhlbWUiLCJhbGxvd0NsZWFyIiwiRHJvcHpvbmUiLCJhdXRvRGlzY292ZXIiLCJpbml0RHJvcHpvbmUiLCJkcm9wem9uZU9wdGlvbnMiLCJhdXRvUHJvY2Vzc1F1ZXVlIiwidXBsb2FkTXVsdGlwbGUiLCJwYXJhbGxlbFVwbG9hZHMiLCJtYXhGaWxlcyIsImRpY3REZWZhdWx0TWVzc2FnZSIsInBhcmFtTmFtZSIsIm1heEZpbGVzaXplIiwiYWRkUmVtb3ZlTGlua3MiLCJhY2NlcHQiLCJkb25lIiwiZHpIYW5kbGVyIiwicHJvY2Vzc1F1ZXVlIiwiZHJvcHpvbmVBcmVhIiwiaW5pdFdpemFyZCIsInZhbGlkYXRlIiwiZm9ybSIsImVycm9yUGxhY2VtZW50IiwiYmVmb3JlIiwicnVsZXMiLCJlcXVhbFRvIiwiaGVhZGVyVGFnIiwiYm9keVRhZyIsInRyYW5zaXRpb25FZmZlY3QiLCJvblN0ZXBDaGFuZ2luZyIsImN1cnJlbnRJbmRleCIsIm5ld0luZGV4Iiwic2V0dGluZ3MiLCJpZ25vcmUiLCJ2YWxpZCIsIm9uRmluaXNoaW5nIiwib25GaW5pc2hlZCIsInN1Ym1pdCIsInN0ZXBzT3JpZW50YXRpb24iLCJpbml0WEVkaXRhYmxlIiwiZWRpdGFibGVmb3JtIiwiY2xpY2siLCJwayIsInNvdXJjZSIsInNvdXJjZURhdGEiLCJncmVwIiwibyIsImVtcHR5Iiwic2hvd2J1dHRvbnMiLCJwbGFjZW1lbnQiLCJjb21ib2RhdGUiLCJmaXJzdEl0ZW0iLCJyZWFzb24iLCIkbmV4dCIsImNsb3Nlc3QiLCJpbml0R29vZ2xlTWFwcyIsIk1hcFN0eWxlcyIsImZlYXR1cmVUeXBlIiwic3R5bGVycyIsInZpc2liaWxpdHkiLCJlbGVtZW50VHlwZSIsImxpZ2h0bmVzcyIsImdNYXAiLCJtYXBTZWxlY3RvciIsImdNYXBSZWZzIiwiYWRkcmVzc2VzIiwidGl0bGVzIiwiem9vbSIsIm1hcHR5cGUiLCJtYXJrZXJzIiwiYWRkcmVzcyIsInBvcHVwIiwiY29udHJvbHMiLCJwYW5Db250cm9sIiwiem9vbUNvbnRyb2wiLCJtYXBUeXBlQ29udHJvbCIsInNjYWxlQ29udHJvbCIsInN0cmVldFZpZXdDb250cm9sIiwib3ZlcnZpZXdNYXBDb250cm9sIiwic2Nyb2xsd2hlZWwiLCJyZWYiLCJzZXRPcHRpb25zIiwiaW5pdFZlY3Rvck1hcCIsIm1hcmtlcnNEYXRhIiwibGF0TG5nIiwiVmVjdG9yTWFwIiwiZGVmYXVsdENvbG9ycyIsIm1hcmtlckNvbG9yIiwic2NhbGVDb2xvcnMiLCJyZWdpb25GaWxsIiwibWFwSGVpZ2h0IiwibWFwTmFtZSIsIm9wdHMiLCJ2ZWN0b3JNYXAiLCJ6b29tTWluIiwiem9vbU1heCIsInpvb21PblNjcm9sbCIsInJlZ2lvblN0eWxlIiwiaW5pdGlhbCIsInNlbGVjdGVkIiwic2VsZWN0ZWRIb3ZlciIsImZvY3VzT24iLCJtYXJrZXJTdHlsZSIsIm9uUmVnaW9uTGFiZWxTaG93IiwiY29kZSIsInJlZ2lvbnMiLCJub3JtYWxpemVGdW5jdGlvbiIsImluaXRQYXJzbGV5Rm9yUGFnZXMiLCJwYXJzbGV5T3B0aW9ucyIsImVycm9yQ2xhc3MiLCJzdWNjZXNzQ2xhc3MiLCJjbGFzc0hhbmRsZXIiLCJQYXJzbGV5RmllbGQiLCJlcnJvcnNDb250YWluZXIiLCJlcnJvcnNXcmFwcGVyIiwiZXJyb3JUZW1wbGF0ZSIsImxvZ2luRm9ybSIsInBhcnNsZXkiLCJyZWdpc3RlckZvcm0iLCJpbml0Qm9vdGdyaWQiLCJib290Z3JpZCIsInRlbXBsYXRlcyIsImFjdGlvbkJ1dHRvbiIsImFjdGlvbkRyb3BEb3duIiwiYWN0aW9uRHJvcERvd25JdGVtIiwiYWN0aW9uRHJvcERvd25DaGVja2JveEl0ZW0iLCJwYWdpbmF0aW9uSXRlbSIsInNlbGVjdGlvbiIsIm11bHRpU2VsZWN0Iiwicm93U2VsZWN0Iiwia2VlcFNlbGVjdGlvbiIsInNlbGVjdCIsImZvcm1hdHRlcnMiLCJjb21tYW5kcyIsImNvbHVtbiIsInJvdyIsImluaXREYXRhdGFibGVzIiwiRGF0YVRhYmxlIiwicmVzcG9uc2l2ZSIsIm9MYW5ndWFnZSIsInNTZWFyY2giLCJzTGVuZ3RoTWVudSIsInplcm9SZWNvcmRzIiwiaW5mb0VtcHR5IiwiaW5mb0ZpbHRlcmVkIiwib1BhZ2luYXRlIiwic05leHQiLCJzUHJldmlvdXMiLCJkb20iLCJpbml0Q3VzdG9tIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7Ozs7Ozs7Ozs7Ozs7QUFjQSxXQUFBQSxNQUFBLEVBQUFDLE9BQUEsRUFBQTtBQUNBLE1BQUEsUUFBQUMsT0FBQSx5Q0FBQUEsT0FBQSxPQUFBLFFBQUEsRUFBQTtBQUFBO0FBQ0FDLElBQUFBLE1BQUEsQ0FBQUQsT0FBQSxHQUFBRCxPQUFBLEVBQUE7QUFDQSxHQUZBLE1BRUE7QUFBQTtBQUNBLFFBQUEsT0FBQUQsTUFBQSxDQUFBSSxNQUFBLEtBQUEsV0FBQSxFQUNBSixNQUFBLENBQUFLLENBQUEsR0FBQUosT0FBQSxFQUFBO0FBQ0E7QUFDQSxDQVBBLEVBT0FLLE1BUEEsRUFPQSxZQUFBO0FBRUE7QUFDQSxXQUFBQyxTQUFBLENBQUFDLEdBQUEsRUFBQTtBQUNBLFdBQUEsWUFBQUEsR0FBQSxJQUFBQSxHQUFBLEtBQUFGLE1BQUEsR0FBQSxHQUFBRyxLQUFBLENBQUFDLElBQUEsQ0FBQUYsR0FBQSxDQUFBLEdBQUEsQ0FBQUEsR0FBQSxDQUFBO0FBQ0E7O0FBRUEsV0FBQUcsT0FBQSxDQUFBQyxHQUFBLEVBQUFDLEVBQUEsRUFBQTtBQUNBLFdBQUEsR0FBQUYsTUFBQSxDQUFBRCxJQUFBLENBQUFFLEdBQUEsRUFBQUMsRUFBQSxDQUFBO0FBQ0E7O0FBRUEsV0FBQUMsR0FBQSxDQUFBRixHQUFBLEVBQUFDLEVB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QU5BLEVBNUJBLENBNENBO0FBQ0E7O0FBQ0EsUUFBQWQsUUFBQSxDQUFBZSxJQUFBLENBQUEsV0FBQSxFQUFBO0FBQ0FuRCxNQUFBQSxNQUFBLEVBQUEsQ0FBQSxRQUFBLEVBQUEsU0FBQSxFQUFBLFdBQUEsRUFBQSxVQUFBLEVBQUEsUUFBQSxDQURBO0FBRUFzQyxNQUFBQSxNQUFBLEVBQUEsQ0FDQSxDQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBREEsRUFFQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkEsRUFHQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFGQSxLQUFBLEVBT0E7QUFDQWMsTUFBQUEsU0FBQSxFQUFBLElBREE7QUFFQVYsTUFBQUEsTUFBQSxFQUFBLEdBRkE7QUFHQVcsTUFBQUEsWUFBQSxFQUFBO0FBQ0FDLFFBQUFBLEtBQUEsRUFBQTtBQURBO0FBSEEsS0FQQSxFQTlDQSxDQThEQTtBQUNBOztBQUVBLFFBQUFDLE1BQUEsR0FBQSxJQUFBbkIsUUFBQSxDQUFBZSxJQUFBLENBQUEsV0FBQSxFQUFBO0FBQ0FuRCxNQUFBQSxNQUFBLEVBQUEsQ0FBQSxLQUFBLEVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxLQUFBLEVBQUEsS0FBQSxFQUFBLEtBQUEsQ0FEQTtBQUVBc0MsTUFBQUEsTUFBQSxFQUFBLENBQ0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FEQSxFQUVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkEsRUFHQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsR0FBQSxDQUhBO0FBRkEsS0FBQSxFQU9BO0FBQ0FHLE1BQUFBLEdBQUEsRUFBQSxDQURBO0FBRUFlLE1BQUFBLFFBQUEsRUFBQSxJQUZBO0FBR0FDLE1BQUFBLFNBQUEsRUFBQSxLQUhBO0FBSUFMLE1BQUFBLFNBQUEsRUFBQSxJQUpBO0FBS0FWLE1BQUFBLE1BQUEsRUFBQTtBQUxBLEtBUEEsQ0FBQTtBQWVBYSxJQUFBQSxNQUFBLENBQUFqRyxFQUFBLENBQUEsTUFBQSxFQUFBLFVBQUFkLElBQUEsRUFBQTtBQUNBLFVBQUFBLElBQUEsQ0FBQTNHLElBQUEsS0FBQSxNQUFBLElBQUEyRyxJQUFBLENBQUEzRyxJQUFBLEtBQUEsTUFBQSxFQUFBO0FBQ0EyRyxRQUFBQSxJQUFBLENBQUFrSCxPQUFBLENBQUFDLE9BQUEsQ0FBQTtBQUNBQyxVQUFBQSxDQUFBLEVBQUE7QUFDQUMsWUFBQUEsS0FBQSxFQUFBLE9BQUFySCxJQUFBLENBQUE5QixLQURBO0FBRUFvSixZQUFBQSxHQUFBLEVBQUEsSUFGQTtBQUdBQyxZQUFBQSxJQUFBLEVBQUF2SCxJQUFBLENBQUF3SCxJQUFBLENBQUE1SCxLQUFBLEdBQUE2SCxLQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQUMsU0FBQSxDQUFBLENBQUEsRUFBQTFILElBQUEsQ0FBQTJILFNBQUEsQ0FBQXpCLE1BQUEsRUFBQSxFQUFBMEIsU0FBQSxFQUhBO0FBSUFDLFlBQUFBLEVBQUEsRUFBQTdILElBQUEsQ0FBQXdILElBQUEsQ0FBQTVILEtBQUEsR0FBQWdJLFNBQUEsRUFKQTtBQUtBRSxZQUFBQSxNQUFBLEVBQUFsQyxRQUFBLENBQUFtQyxHQUFBLENBQUFDLE1BQUEsQ0FBQUM7QUFMQTtBQURBLFNBQUE7QUFTQTtBQUNBLEtBWkEsRUFoRkEsQ0ErRkE7QUFDQTs7QUFHQSxRQUFBQyxLQUFBLEdBQUEsSUFBQXRDLFFBQUEsQ0FBQWUsSUFBQSxDQUFBLFdBQUEsRUFBQTtBQUNBbkQsTUFBQUEsTUFBQSxFQUFBLENBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLENBREE7QUFFQXNDLE1BQUFBLE1BQUEsRUFBQSxDQUNBLENBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBREEsRUFFQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUZBLEVBR0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQSxFQUlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSkE7QUFGQSxLQUFBLEVBUUE7QUFDQUcsTUFBQUEsR0FBQSxFQUFBLENBREE7QUFFQUMsTUFBQUEsTUFBQSxFQUFBO0FBRkEsS0FSQSxDQUFBLENBbkdBLENBZ0hBOztBQUNBLFFBQUFpQyxHQUFBLEdBQUEsQ0FBQTtBQUFBLFFBQ0FDLE1BQUEsR0FBQSxFQURBO0FBQUEsUUFFQUMsU0FBQSxHQUFBLEdBRkEsQ0FqSEEsQ0FxSEE7O0FBQ0FILElBQUFBLEtBQUEsQ0FBQXBILEVBQUEsQ0FBQSxTQUFBLEVBQUEsWUFBQTtBQUNBcUgsTUFBQUEsR0FBQSxHQUFBLENBQUE7QUFDQSxLQUZBLEVBdEhBLENBMEhBOztBQUNBRCxJQUFBQSxLQUFB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QUEsS0FBQSxFQUFBLEVBQUEsQ0FEQSxFQUVBLENBQUEsS0FBQSxFQUFBLEVBQUEsQ0FGQSxFQUdBLENBQUEsS0FBQSxFQUFBLEVBQUEsQ0FIQSxFQUlBLENBQUEsS0FBQSxFQUFBLEVBQUEsQ0FKQSxFQUtBLENBQUEsS0FBQSxFQUFBLEVBQUEsQ0FMQSxFQU1BLENBQUEsS0FBQSxFQUFBLEVBQUEsQ0FOQSxFQU9BLENBQUEsS0FBQSxFQUFBLEVBQUEsQ0FQQTtBQUhBLEtBWkEsQ0FBQTtBQTBCQSxRQUFBbUssTUFBQSxHQUFBLENBQUE7QUFDQSxlQUFBLE9BREE7QUFFQSxlQUFBLFNBRkE7QUFHQSxjQUFBLENBQ0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQURBLEVBRUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQUZBLEVBR0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQUhBLEVBSUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQUpBLEVBS0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQUxBLEVBTUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQU5BLEVBT0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQVBBLEVBUUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQVJBLEVBU0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQVRBLEVBVUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQVZBLEVBV0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQVhBLEVBWUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQVpBO0FBSEEsS0FBQSxFQWlCQTtBQUNBLGVBQUEsU0FEQTtBQUVBLGVBQUEsU0FGQTtBQUdBLGNBQUEsQ0FDQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBREEsRUFFQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBRkEsRUFHQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBSEEsRUFJQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBSkEsRUFLQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBTEEsRUFNQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBTkEsRUFPQSxDQUFBLEtBQUEsRUFB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Q0FBQSxLQUFBLEVBQUEsRUFBQSxDQVJBLEVBU0EsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQVRBLEVBVUEsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQVZBLEVBV0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQVhBLEVBWUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQVpBO0FBSEEsS0FqQkEsRUFrQ0E7QUFDQSxlQUFBLElBREE7QUFFQSxlQUFBLFNBRkE7QUFHQSxjQUFBLENBQ0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQURBLEVBRUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQUZBLEVBR0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQUhBLEVBSUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQUpBLEVBS0EsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUxBLEVBTUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQU5BLEVBT0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQVBBLEVBUUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQVJBLEVBU0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQVRBLEVBVUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQVZBLEVBV0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQVhBLEVBWUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQVpBO0FBSEEsS0FsQ0EsQ0FBQTtBQXFEQSxRQUFBbUssTUFBQSxHQUFBLENBQUE7QUFDQSxlQUFBLFNBREE7QUFFQSxlQUFBLFNBRkE7QUFHQSxjQUFBLENBQ0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQURBLEVBRUEsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQUZBLEVBR0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQUhBLEVBSUEsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQUpBLEVBS0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQUxBLEVBTUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQU5BLEVBT0EsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQVBBLEVBUUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQVJBLEVBU0EsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQVRBLEVBVUEsQ0FBQSxNQUFBLEVBQUEsRUFBQSxDQVZBLEVBV0EsQ0FBQSxNQUFBLEVBQUEsRUFBQSxDQVhBLEVBWUEsQ0FBQSxNQUFBLEVBQUEsR0FBQSxDQVpBLEVBYUEsQ0FBQSxNQUFBLEVBQUEsRUFBQSxDQWJBO0FBSEEsS0FBQSxFQWtCQTtBQUNBLGVBQUEsVUFEQTtBQUVBLGVBQUEsU0FGQTtBQUdBLGNBQUEsQ0FDQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBREEsRUFFQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBRkEsRUFHQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBSEEsRUFJQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBSkEsRUFLQSxDQUFBLEtBQUEsRUFBQSxHQUFBLENBTEEsRUFNQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBTkEsRUFPQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBUEEsRUFRQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBUkEsRUFTQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBVEEsRUFVQSxDQUFBLE1BQUEsRUFBQSxFQUFBLENBVkEsRUFXQSxDQUFBLE1BQUEsRUFBQSxFQUFBLENBWEEsRUFZQSxDQUFBLE1BQUEsRUFBQSxFQUFBLENBWkEsRUFhQSxDQUFBLE1BQUEsRUFBQSxHQUFBLENBYkE7QUFIQSxLQWxCQSxFQW9DQTtBQUNBLGVBQUEsV0FEQTtBQUVBLGVBQUEsU0FGQTtBQUdBLGNBQUEsQ0FDQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBREEsRUFFQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBRkEsRUFHQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBSEEsRUFJQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBSkEsRUFLQSxDQUFBLEtBQUEsRUFBQSxDQUFBLENBTEEsRUFNQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBTkEsRUFPQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBUEEsRUFRQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBUkEsRUFTQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBVEEsRUFVQSxDQUFBLE1BQUEsRUFBQSxDQUFBLENBVkEsRUFXQSxDQUFBLE1BQUEsRUFBQSxFQUFBLENBWEEsRUFZQSxDQUFBLE1BQUEsRUFBQSxFQUFBLENBWkEsRUFhQSxDQUFBLE1BQUEsRUFBQSxDQUFBLENBYkE7QUFIQSxLQXBDQSxDQUFBO0FBd0RBLFFBQUE5RixPQUFBLEdBQUE7QUFDQXlCLE1BQUFBLE1BQUEsRUFBQTtBQUNBc0csUUFBQUEsS0FBQSxFQUFBLElBREE7QUFFQUosUUFBQUEsSUFBQSxFQUFBO0FBQ0FDLFVBQUFBLEtBQUEsRUFBQSxRQURBO0FBRUFuQyxVQUFBQSxTQUFBLEVBQUEsQ0FGQTtBQUdBUSxVQUFBQSxJQUFBLEVBQUEsSUFIQTtBQUlBNEIsVUFBQUEsUUFBQSxFQUFBLEdBSkE7QUFLQXZCLFVBQUFBLElBQUEsRUFBQTtBQUxBO0FBRkEsT0FEQTtBQVdBQyxNQUFBQSxJQUFBLEVBQUE7QUFDQWhILFFBQUFBLFdBQUEsRUFBQSxNQURBO0FBRUFpSCxRQUFBQSxXQUFBLEVBQUEsQ0FGQTtBQUdBQyxRQUFBQSxTQUFBLEVBQUEsSUFIQTtBQUlBbkgsUUFBQUEsZUFBQSxFQUFBO0FBSkEsT0FYQTtBQWlCQW9ILE1BQUFBLE9BQUEsRUFBQSxJQWpCQTtBQWtCQUMsTUFBQUEsV0FBQSxFQUFBO0FBQ0FDLFFBQUFBLE9BQUEsRUFBQSxpQkFBQXZILEtBQUEsRUFBQStFLENBQUEsRUFBQUQsQ0FBQSxFQUFBO0FBQUEsaUJBQUFDLENBQUEsR0FBQSxLQUFBLEdBQUFELENBQUE7QUFBQTtBQURBLE9BbEJBO0FBcUJBMEMsTUFBQUEsS0FBQSxFQUFBO0FBQ0FDLFFBQUFBLFNBQUEsRUFBQSxTQURBO0FBRUFDLFFBQUFBLElBQUEsRUFBQTtBQUZBLE9BckJBO0FBeUJBQyxNQUFBQSxLQUFBLEVBQUE7QUFDQTtBQUNBRixRQUFBQSxTQUFBLEVBQUE7QUFGQSxPQXpCQTtBQTZCQU8sTUFBQUEsVUFBQSxFQUFBO0FBN0JBLEtBQUE7QUFnQ0EsUUFBQXhELEtBQUEsR0FBQW5RLENBQUEsQ0FBQSxvQkFBQSxDQUFBO0FBQ0EsUUFBQW1RLEtBQUEsQ0FBQWpOLE1BQUEsRUFDQWxELENBQUEsQ0FBQTRULElBQUEsQ0FBQXpELEtBQUEsRUFBQWxJLElBQUEsRUFBQXFFLE9BQUE7QUFFQSxRQUFBdUgsT0FBQSxHQUFBN1QsQ0FBQSxDQUFBLHNCQUFBLENBQUE7QUFDQSxRQUFBNlQsT0FBQSxDQUFBM1EsTUFBQSxFQUNBbEQsQ0FBQSxDQUFBNFQsSUFBQSxDQUFBQyxPQUFBLEVBQUF6QixNQUFBLEVBQUE5RixPQUFBO0FBRUE7QUFFQSxDQS9KQSxJLENBaUtBO0FBQ0E7OztBQUNBLENBQUEsWUFBQTtBQUNBOztBQUdBdE0sRUFBQUEsQ0FBQSxDQUFBc1UsYUFBQSxDQUFBOztBQUVBLFdBQUFBLGFBQUEsR0FBQTtBQUVBLFFBQUFyTSxJQUFBLEdBQUEsQ0FBQTtBQUNBLGVBQUEsU0FEQTtBQUVBLGNBQUEsRUFGQTtBQUdBLGVBQUE7QUFIQSxLQUFBLEVBSUE7QUFDQSxlQUFBLFNBREE7QUFFQSxjQUFBLEVBRkE7QUFHQSxlQUFBO0FBSEEsS0FKQSxFQVFBO0FBQ0EsZUFBQSxTQURBO0FBRUEsY0FBQSxFQUZBO0FBR0EsZUFBQTtBQUhBLEtBUkEsRUFZQTtBQUNBLGVBQUEsU0FEQTtBQUVBLGNBQUEsRUFGQTtBQUdBLGVBQUE7QUFIQSxLQVpBLEVBZ0JBO0FBQ0EsZUFBQSxTQURBO0FBRUEsY0FBQSxHQUZBO0FBR0EsZUFBQTtBQUhBLEtBaEJBLENBQUE7QUFzQkEsUUFBQXFFLE9BQUEsR0FBQTtBQUNBeUIsTUFBQUEsTUFBQSxFQUFBO0FBQ0F3RyxRQUFBQSxHQUFBLEVBQUE7QUFDQWhDLFVBQUFBLElBQUEsRUFBQSxJQURBO0FBRUFpQyxVQUFBQSxXQUFBLEVBQUEsR0FGQSxDQUVBOztBQUZBO0FBREE7QUFEQSxLQUFBO0FBU0EsUUFBQXJFLEtBQUEsR0FBQW5RLENBQUEsQ0FBQSxjQUFBLENBQUE7QUFDQSxRQUFBbVEsS0FBQSxDQUFBak4sTUFBQSxFQUNBbEQsQ0FBQSxDQUFBNFQsSUFBQSxDQUFBekQsS0FBQSxFQUFBbEksSUFBQSxFQUFBcUUsT0FBQTtBQUVBO0FBRUEsQ0E3Q0EsSSxDQStDQTtBQUNBOzs7QUFDQSxDQUFBLFlBQUE7QUFDQTs7QUFHQXRNLEVBQUFBLENBQUEsQ0FBQXlVLFlBQUEsQ0FBQTs7QUFFQSxXQUFBQSxZQUFBLEdBQUE7QUFFQSxRQUFBeE0sSUFBQSxHQUFBLENBQUE7QUFDQSxlQUFBLFVBREE7QUFFQSxlQUFBLFNBRkE7QUFHQSxjQUFBLENBQ0EsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQURBLEVBRUEsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQUZBLEVBR0EsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQUhBLEVBSUEsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQUpBLEVBS0EsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQUxBLEVBTUEsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQU5BLEVBT0EsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQVBBLEVBUUEsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQVJBLEVBU0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQVRBO0FBSEEsS0FBQSxFQWNBO0FBQ0EsZUFBQSxhQURBO0FBRUEsZUFBQSxTQUZBO0FBR0EsY0FBQSxDQUNBLENBQUEsS0FBQSxFQUFBLEdBQUEsQ0FEQSxFQUVBLENBQUEsS0FBQSxFQUFBLEdBQUEsQ0FGQSxFQUdBLENBQUEsS0FBQSxFQUFBLEdBQUEsQ0FIQSxFQUlBLENBQUEsS0FBQSxFQUFBLEdBQUEsQ0FKQSxFQUtBLENBQUEsS0FBQSxFQUFBLEdBQUEsQ0FMQSxFQU1BLENBQUEsS0FBQSxFQUFBLEdBQUEsQ0FOQSxFQU9BLENBQUEsS0FBQSxFQUFBLEdBQUEsQ0FQQSxFQVFBLENBQUEsS0FBQSxFQUFBLEdBQUEsQ0FSQSxFQVNBLENBQUEsS0FBQSxFQUFBLEVBQUEsQ0FUQTtBQUhBLEtBZEEsRUE0QkE7QUFDQSxlQUFBLFdBREE7QUFFQSxlQUFBLFNBRkE7QUFHQSxjQUFBLENBQ0EsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQURBLEVBRUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQUZBLEVBR0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQUhBLEVBSUEsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQUpBLEVBS0EsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQUxBLEVBTUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQU5BLEVBT0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQVBBLEVBUUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQVJBLEVBU0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQVRBO0FBSEEsS0E1QkEsQ0FBQTtBQTRDQSxRQUFBcUUsT0FBQSxHQUFBO0FBQ0F5QixNQUFBQSxNQUFBLEVBQUE7QUFDQXVFLFFBQUFBLEtBQUEsRUFBQTtBQUNBQyxVQUFBQSxJQUFBLEVBQUEsSUFEQTtBQUVBSyxVQUFBQSxJQUFBLEVBQUE7QUFGQSxTQURBO0FBS0FKLFFBQUFBLE1BQUEsRUFBQTtBQUNBRCxVQUFBQSxJQUFBLEVBQUEsSUFEQTtBQUVBRSxVQUFBQSxNQUFBLEVBQUE7QUFGQTtBQUxBLE9BREE7QUFXQUksTUFBQUEsSUFBQSxFQUFBO0FBQ0FoSCxRQUFBQSxXQUFBLEVBQUEsTUFEQTtBQUVBaUgsUUFBQUEsV0FBQSxFQUFBLENBRkE7QUFHQUMsUUFBQUEsU0FBQSxFQUFBLElBSEE7QUFJQW5ILFFBQUFBLGVBQUEsRUFBQTtBQUpBLE9BWEE7QUFpQkFvSCxNQUFBQSxPQUFBLEVBQUEsSUFqQkE7QUFrQkFDLE1BQUFBLFdBQUEsRUFBQTtBQUNBQyxRQUFBQSxPQUFBLEVBQUEsaUJBQUF2SCxLQUFBLEVBQUErRSxDQUFBLEVBQUFELENBQUEsRUFBQTtBQUFBLGlCQUFBQyxDQUFBLEdBQUEsS0FBQSxHQUFBRCxDQUFBO0FBQUE7QUFEQSxPQWxCQTtBQXFCQTBDLE1BQUFBLEtBQUEsRUFBQTtBQUNBQyxRQUFBQSxTQUFBLEVBQUEsTUFEQTtBQUVBQyxRQUFBQSxJQUFBLEVBQUE7QUFGQSxPQXJCQTtBQXlCQUMsTUFBQUEsS0FBQSxFQUFBO0FBQ0E7QUFDQUYsUUFBQUEsU0FBQSxFQUFBO0FBRkEsT0F6QkE7QUE2QkFPLE1BQUFBLFVBQUEsRUFBQTtBQTdCQSxLQUFBO0FBZ0NBLFFBQUF4RCxLQUFBLEdBQUFuUSxDQUFBLENBQUEsYUFBQSxDQUFBO0FBQ0EsUUFBQW1RLEtBQUEsQ0FBQWpOLE1BQUEsRUFDQWxELENBQUEsQ0FBQTRULElBQUEsQ0FBQXpELEtBQUEsRUFBQWxJLElBQUEsRUFBQXFFLE9BQUE7QUFFQTtBQUVBLENBMUZBLEksQ0E2RkE7QUFDQTs7O0FBQ0EsQ0FBQSxZQUFBO0FBQ0E7O0FBR0F0TSxFQUFBQSxDQUFBLENBQUEwVSxXQUFBLENBQUE7O0FBRUEsV0FBQUEsV0FBQSxHQUFBO0FBRUEsUUFBQXpNLElBQUEsR0FBQSxDQUFBO0FBQ0EsZUFBQSxRQURBO0FBRUEsZUFBQSxTQUZBO0FBR0EsY0FBQTtBQUhBLEtBQUEsRUFJQTtBQUNBLGVBQUEsS0FEQTtBQUVBLGVBQUEsU0FGQTtBQUdBLGNBQUE7QUFIQSxLQUpBLEVBUUE7QUFDQSxlQUFBLE1BREE7QUFFQSxlQUFBLFNBRkE7QUFHQSxjQUFBO0FBSEEsS0FSQSxFQVlBO0FBQ0EsZUFBQSxNQURBO0FBRUEsZUFBQSxTQUZBO0FBR0EsY0FBQTtBQUhBLEtBWkEsRUFnQkE7QUFDQSxlQUFBLE1BREE7QUFFQSxlQUFBLFNBRkE7QUFHQSxjQUFBO0FBSEEsS0FoQkEsQ0FBQTtBQXNCQSxRQUFBcUUsT0FBQSxHQUFBO0FBQ0F5QixNQUFBQSxNQUFBLEVBQUE7QUFDQXdHLFFBQUFBLEdBQUEsRUFBQTtBQUNBaEMsVUFBQUEsSUFBQSxFQUFBLElBREE7QUFFQWlDLFVBQUFBLFdBQUEsRUFBQSxDQUZBO0FBR0E3SSxVQUFBQSxLQUFBLEVBQUE7QUFDQTRHLFlBQUFBLElBQUEsRUFBQSxJQURBO0FBRUFFLFlBQUFBLE1BQUEsRUFBQSxHQUZBO0FBR0FrQyxZQUFBQSxTQUFBLEVBQUEsbUJBQUFoSixLQUFBLEVBQUFvQyxNQUFBLEVBQUE7QUFDQSxxQkFBQSxpQ0FDQTtBQUNBMUMsY0FBQUEsSUFBQSxDQUFBQyxLQUFBLENBQUF5QyxNQUFBLENBQUE2RyxPQUFBLENBRkEsR0FHQSxTQUhBO0FBSUEsYUFSQTtBQVNBQyxZQUFBQSxVQUFBLEVBQUE7QUFDQXRFLGNBQUFBLE9BQUEsRUFBQSxHQURBO0FBRUF1RSxjQUFBQSxLQUFBLEVBQUE7QUFGQTtBQVRBO0FBSEE7QUFEQTtBQURBLEtBQUE7QUF1QkEsUUFBQTNFLEtBQUEsR0FBQW5RLENBQUEsQ0FBQSxZQUFBLENBQUE7QUFDQSxRQUFBbVEsS0FBQSxDQUFBak4sTUFBQSxFQUNBbEQsQ0FBQSxDQUFBNFQsSUFBQSxDQUFBekQsS0FBQSxFQUFBbEksSUFBQSxFQUFBcUUsT0FBQTtBQUVBO0FBRUEsQ0EzREEsSSxDQ25uQkE7QUFDQTs7O0FBRUEsQ0FBQSxZQUFBO0FBQ0E7O0FBRUF0TSxFQUFBQSxDQUFBLENBQUErVSxVQUFBLENBQUE7O0FBRUEsV0FBQUEsVUFBQSxHQUFBO0FBRUEsUUFBQSxPQUFBQyxNQUFBLEtBQUEsV0FBQSxFQUFBO0FBRUEsUUFBQUMsU0FBQSxHQUFBLENBQ0E7QUFBQXhFLE1BQUFBLENBQUEsRUFBQSxNQUFBO0FBQUF5RSxNQUFBQSxDQUFBLEVBQUEsR0FBQTtBQUFBQyxNQUFBQSxDQUFBLEVBQUE7QUFBQSxLQURBLEVBRUE7QUFBQTFFLE1BQUFBLENBQUEsRUFBQSxNQUFBO0FBQUF5RSxNQUFBQSxDQUFBLEVBQUEsRUFBQTtBQUFBQyxNQUFBQSxDQUFBLEVBQUE7QUFBQSxLQUZBLEVBR0E7QUFBQTFFLE1BQUFBLENBQUEsRUFBQSxNQUFBO0FBQUF5RSxNQUFBQSxDQUFBLEVBQUEsRUFBQTtBQUFBQyxNQUFBQSxDQUFBLEVBQUE7QUFBQSxLQUhBLEVBSUE7QUFBQTFFLE1BQUFBLENBQUEsRUFBQSxNQUFBO0FBQUF5RSxNQUFBQSxDQUFBLEVBQUEsRUFBQTtBQUFBQyxNQUFBQSxDQUFBLEVBQUE7QUFBQSxLQUpBLEVBS0E7QUFBQTFFLE1BQUFBLENBQUEsRUFBQSxNQUFBO0FBQUF5RSxNQUFBQSxDQUFBLEVBQUEsRUFBQTtBQUFBQyxNQUFBQSxDQUFBLEVBQUE7QUFBQSxLQUxBLEVBTUE7QUFBQTFFLE1BQUFBLENBQUEsRUFBQSxNQUFBO0FBQUF5RSxNQUFBQSxDQUFBLEVBQUEsRUFBQTtBQUFBQyxNQUFBQSxDQUFBLEVBQUE7QUFBQSxLQU5BLEVBT0E7QUFBQTFFLE1BQUFBLENBQUEsRUFBQSxNQUFBO0FBQUF5RSxNQUFBQSxDQUFBLEVBQUEsR0FBQTtBQUFBQyxNQUFBQSxDQUFBLEVBQUE7QUFBQSxLQVBBLENBQUE7QUFVQSxRQUFBQyxTQUFBLEdBQUEsQ0FDQTtBQUFBekosTUFBQUEsS0FBQSxFQUFBLGdCQUFBO0FBQUExSCxNQUFBQSxLQUFBLEVBQUE7QUFBQSxLQURBLEVBRUE7QUFBQTBILE1BQUFBLEtBQUEsRUFBQSxnQkFBQTtBQUFBMUgsTUFBQUEsS0FBQSxFQUFBO0FBQUEsS0FGQSxFQUdBO0FBQUEwSCxNQUFBQSxLQUFBLEVBQUEsa0JBQUE7QUFBQTFILE1BQUFBLEtBQUEsRUFBQTtBQUFBLEtBSEEsQ0FBQSxDQWRBLENBb0JBO0FBQ0E7O0FBRUEsUUFBQStRLE1BQUEsQ0FBQXBHLElBQUEsQ0FBQTtBQUNBTyxNQUFBQSxPQUFBLEVBQUEsYUFEQTtBQUVBbEgsTUFBQUEsSUFBQSxFQUFBZ04sU0FGQTtBQUdBSSxNQUFBQSxJQUFBLEVBQUEsR0FIQTtBQUlBQyxNQUFBQSxLQUFBLEVBQUEsQ0FBQSxHQUFBLEVBQUEsR0FBQSxDQUpBO0FBS0E3SixNQUFBQSxNQUFBLEVBQUEsQ0FBQSxTQUFBLEVBQUEsU0FBQSxDQUxBO0FBTUE4SixNQUFBQSxVQUFBLEVBQUEsQ0FBQSxTQUFBLEVBQUEsU0FBQSxDQU5BO0FBT0FDLE1BQUFBLE1BQUEsRUFBQTtBQVBBLEtBQUEsRUF2QkEsQ0FpQ0E7QUFDQTs7QUFDQSxRQUFBUixNQUFBLENBQUFTLEtBQUEsQ0FBQTtBQUNBdEcsTUFBQUEsT0FBQSxFQUFBLGNBREE7QUFFQWxILE1BQUFBLElBQUEsRUFBQW1OLFNBRkE7QUFHQU0sTUFBQUEsTUFBQSxFQUFBLENBQUEsU0FBQSxFQUFBLFNBQUEsRUFBQSxTQUFBLENBSEE7QUFJQUYsTUFBQUEsTUFBQSxFQUFBO0FBSkEsS0FBQSxFQW5DQSxDQTBDQTtBQUNBOztBQUNBLFFBQUFSLE1BQUEsQ0FBQTFHLEdBQUEsQ0FBQTtBQUNBYSxNQUFBQSxPQUFBLEVBQUEsWUFEQTtBQUVBbEgsTUFBQUEsSUFBQSxFQUFBZ04sU0FGQTtBQUdBSSxNQUFBQSxJQUFBLEVBQUEsR0FIQTtBQUlBQyxNQUFBQSxLQUFBLEVBQUEsQ0FBQSxHQUFBLEVBQUEsR0FBQSxDQUpBO0FBS0E3SixNQUFBQSxNQUFBLEVBQUEsQ0FBQSxVQUFBLEVBQUEsVUFBQSxDQUxBO0FBTUFrSyxNQUFBQSxZQUFBLEVBQUEsQ0FOQTtBQU9BQyxNQUFBQSxTQUFBLEVBQUEsQ0FBQSxTQUFBLEVBQUEsU0FBQSxDQVBBO0FBUUFKLE1BQUFBLE1BQUEsRUFBQTtBQVJBLEtBQUEsRUE1Q0EsQ0F1REE7QUFDQTs7QUFDQSxRQUFBUixNQUFBLENBQUFhLElBQUEsQ0FBQTtBQUNBMUcsTUFBQUEsT0FBQSxFQUFBLGFBREE7QUFFQWxILE1BQUFBLElBQUEsRUFBQWdOLFNBRkE7QUFHQUksTUFBQUEsSUFBQSxFQUFBLEdBSEE7QUFJQUMsTUFBQUEsS0FBQSxFQUFBLENBQUEsR0FBQSxFQUFBLEdBQUEsQ0FKQTtBQUtBN0osTUFBQUEsTUFBQSxFQUFBLENBQUEsU0FBQSxFQUFBLFNBQUEsQ0FMQTtBQU1BOEosTUFBQUEsVUFBQSxFQUFBLENBQUEsU0FBQSxFQUFBLFNBQUEsQ0FOQTtBQU9BQyxNQUFBQSxNQUFBLEVBQUE7QUFQQSxLQUFBO0FBVUE7QUFFQSxDQTFFQSxJLENDSEE7QUFDQTs7O0FBRUEsQ0FBQSxZQUFBO0FBQ0E7O0FBRUF4VixFQUFBQSxDQUFBLENBQUErVSxVQUFBLENBQUE7O0FBRUEsV0FBQUEsVUFBQSxHQUFBO0FBRUEsUUFBQSxPQUFBZSxRQUFBLEtBQUEsV0FBQSxFQUFBO0FBRUEsUUFBQUMsVUFBQSxHQUFBLENBQ0EsRUFEQSxFQUVBLEVBRkEsRUFHQSxFQUhBLENBQUE7QUFLQSxRQUFBeEssTUFBQSxHQUFBLElBQUF1SyxRQUFBLENBQUFFLFFBQUEsQ0FBQUMsVUFBQSxDQUFBLEdBQUEsQ0FBQTs7QUFFQSxTQUFBLElBQUFoVCxDQUFBLEdBQUEsQ0FBQSxFQUFBQSxDQUFBLEdBQUEsR0FBQSxFQUFBQSxDQUFBLEVBQUEsRUFBQTtBQUNBc0ksTUFBQUEsTUFBQSxDQUFBMkssT0FBQSxDQUFBSCxVQUFBO0FBQ0E7O0FBRUEsUUFBQUksT0FBQSxHQUFBLENBQUE7QUFDQXJCLE1BQUFBLEtBQUEsRUFBQSxTQURBO0FBRUE3TSxNQUFBQSxJQUFBLEVBQUE4TixVQUFBLENBQUEsQ0FBQSxDQUZBO0FBR0FLLE1BQUFBLElBQUEsRUFBQTtBQUhBLEtBQUEsRUFJQTtBQUNBdEIsTUFBQUEsS0FBQSxFQUFBLFNBREE7QUFFQTdNLE1BQUFBLElBQUEsRUFBQThOLFVBQUEsQ0FBQSxDQUFBLENBRkE7QUFHQUssTUFBQUEsSUFBQSxFQUFBO0FBSEEsS0FKQSxFQVFBO0FBQ0F0QixNQUFBQSxLQUFBLEVBQUEsU0FEQTtBQUVBN00sTUFBQUEsSUFBQSxFQUFBOE4sVUFBQSxDQUFBLENBQUEsQ0FGQTtBQUdBSyxNQUFBQSxJQUFBLEVBQUE7QUFIQSxLQVJBLENBQUE7QUFjQSxRQUFBQyxNQUFBLEdBQUEsSUFBQVAsUUFBQSxDQUFBUSxLQUFBLENBQUE7QUFDQW5ILE1BQUFBLE9BQUEsRUFBQTdNLFFBQUEsQ0FBQW9GLGFBQUEsQ0FBQSxZQUFBLENBREE7QUFFQXFHLE1BQUFBLE1BQUEsRUFBQW9JLE9BRkE7QUFHQUksTUFBQUEsUUFBQSxFQUFBO0FBSEEsS0FBQSxDQUFBO0FBTUFGLElBQUFBLE1BQUEsQ0FBQUcsTUFBQSxHQW5DQSxDQXNDQTtBQUNBOztBQUVBLFFBQUFDLE1BQUEsR0FBQSxJQUFBWCxRQUFBLENBQUFRLEtBQUEsQ0FBQTtBQUNBbkgsTUFBQUEsT0FBQSxFQUFBN00sUUFBQSxDQUFBb0YsYUFBQSxDQUFBLFlBQUEsQ0FEQTtBQUVBNk8sTUFBQUEsUUFBQSxFQUFBLE1BRkE7QUFHQUcsTUFBQUEsTUFBQSxFQUFBLElBSEE7QUFJQTNJLE1BQUFBLE1BQUEsRUFBQSxDQUFBO0FBQ0E5RixRQUFBQSxJQUFBLEVBQUEsQ0FBQTtBQUFBeUksVUFBQUEsQ0FBQSxFQUFBLENBQUE7QUFBQUQsVUFBQUEsQ0FBQSxFQUFBO0FBQUEsU0FBQSxFQUFBO0FBQUFDLFVBQUFBLENBQUEsRUFBQSxDQUFBO0FBQUFELFVBQUFBLENBQUEsRUFBQTtBQUFBLFNBQUEsRUFBQTtBQUFBQyxVQUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUFBRCxVQUFBQSxDQUFBLEVBQUE7QUFBQSxTQUFBLEVBQUE7QUFBQUMsVUFBQUEsQ0FBQSxFQUFBLENBQUE7QUFBQUQsVUFBQUEsQ0FBQSxFQUFBO0FBQUEsU0FBQSxFQUFBO0FBQUFDLFVBQUFBLENBQUEsRUFBQSxDQUFBO0FBQUFELFVBQUFBLENBQUEsRUFBQTtBQUFBLFNBQUEsQ0FEQTtBQUVBcUUsUUFBQUEsS0FBQSxFQUFBO0FBRkEsT0FBQSxFQUdBO0FBQ0E3TSxRQUFBQSxJQUFBLEVBQUEsQ0FBQTtBQUFBeUksVUFBQUEsQ0FBQSxFQUFBLENBQUE7QUFBQUQsVUFBQUEsQ0FBQSxFQUFBO0FBQUEsU0FBQSxFQUFBO0FBQUFDLFVBQUFBLENBQUEsRUFBQSxDQUFBO0FBQUFELFVBQUFBLENBQUEsRUFBQTtBQUFBLFNBQUEsRUFBQTtBQUFBQyxVQUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUFBRCxVQUFBQSxDQUFBLEVBQUE7QUFBQSxTQUFBLEVBQUE7QUFBQUMsVUFBQUEsQ0FBQSxFQUFBLENBQUE7QUFBQUQsVUFBQUEsQ0FBQSxFQUFBO0FBQUEsU0FBQSxFQUFBO0FBQUFDLFVBQUFBLENBQUEsRUFBQSxDQUFBO0FBQUFELFVBQUFBLENBQUEsRUFBQTtBQUFBLFNBQUEsQ0FEQTtBQUVBcUUsUUFBQUEsS0FBQSxFQUFBO0FBRkEsT0FIQTtBQUpBLEtBQUEsQ0FBQTtBQWFBMkIsSUFBQUEsTUFBQSxDQUFBRCxNQUFBLEdBdERBLENBd0RBO0FBQ0E7O0FBR0EsUUFBQUcsTUFBQSxHQUFBLElBQUFiLFFBQUEsQ0FBQVEsS0FBQSxDQUFBO0FBQ0FuSCxNQUFBQSxPQUFBLEVBQUE3TSxRQUFBLENBQUFvRixhQUFBLENBQUEsWUFBQSxDQURBO0FBRUE2TyxNQUFBQSxRQUFBLEVBQUEsTUFGQTtBQUdBeEksTUFBQUEsTUFBQSxFQUFBLENBQUE7QUFDQTlGLFFBQUFBLElBQUEsRUFBQSxDQUFBO0FBQUF5SSxVQUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUFBRCxVQUFBQSxDQUFBLEVBQUE7QUFBQSxTQUFBLEVBQUE7QUFBQUMsVUFBQUEsQ0FBQSxFQUFBLENBQUE7QUFBQUQsVUFBQUEsQ0FBQSxFQUFBO0FBQUEsU0FBQSxFQUFBO0FBQUFDLFVBQUFBLENBQUEsRUFBQSxDQUFBO0FBQUFELFVBQUFBLENBQUEsRUFBQTtBQUFBLFNBQUEsRUFBQTtBQUFBQyxVQUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUFBRCxVQUFBQSxDQUFBLEVBQUE7QUFBQSxTQUFBLEVBQUE7QUFBQUMsVUFBQUEsQ0FBQSxFQUFBLENBQUE7QUFBQUQsVUFBQUEsQ0FBQSxFQUFBO0FBQUEsU0FBQSxDQURBO0FBRUFxRSxRQUFBQSxLQUFBLEVBQUE7QUFGQSxPQUFBLEVBR0E7QUFDQTdNLFFBQUFBLElBQUEsRUFBQSxDQUFBO0FBQUF5SSxVQUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUFBRCxVQUFBQSxDQUFBLEVBQUE7QUFBQSxTQUFBLEVBQUE7QUFBQUMsVUFBQUEsQ0FBQSxFQUFBLENBQUE7QUFBQUQsVUFBQUEsQ0FBQSxFQUFBO0FBQUEsU0FBQSxFQUFBO0FBQUFDLFVBQUFBLENBQUEsRUFBQSxDQUFBO0FBQUFELFVBQUFBLENBQUEsRUFBQTtBQUFBLFNBQUEsRUFBQTtBQUFBQyxVQUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUFBRCxVQUFBQSxDQUFBLEVBQUE7QUFBQSxTQUFBLEVBQUE7QUFBQUMsVUFBQUEsQ0FBQSxFQUFBLENBQUE7QUFBQUQsVUFBQUEsQ0FBQSxFQUFBO0FBQUEsU0FBQSxDQURBO0FBRUFxRSxRQUFBQSxLQUFBLEVBQUE7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QUFBQTliLE1BQUFBLElBQUEsRUFBQTtBQUFBLEtBRkEsRUFHQTtBQUFBOGIsTUFBQUEsTUFBQSxFQUFBLENBQUEsQ0FBQSxJQUFBLEVBQUEsTUFBQSxDQUFBO0FBQUE5YixNQUFBQSxJQUFBLEVBQUE7QUFBQSxLQUhBLEVBSUE7QUFBQThiLE1BQUFBLE1BQUEsRUFBQSxDQUFBLENBQUEsSUFBQSxFQUFBLE1BQUEsQ0FBQTtBQUFBOWIsTUFBQUEsSUFBQSxFQUFBO0FBQUEsS0FKQSxFQUtBO0FBQUE4YixNQUFBQSxNQUFBLEVBQUEsQ0FBQSxJQUFBLEVBQUEsTUFBQSxDQUFBO0FBQUE5YixNQUFBQSxJQUFBLEVBQUE7QUFBQSxLQUxBLEVBTUE7QUFBQThiLE1BQUFBLE1BQUEsRUFBQSxDQUFBLElBQUEsRUFBQSxDQUFBLEtBQUEsQ0FBQTtBQUFBOWIsTUFBQUEsSUFBQSxFQUFBO0FBQUEsS0FOQSxFQU9BO0FBQUE4YixNQUFBQSxNQUFBLEVBQUEsQ0FBQSxHQUFBLEVBQUEsS0FBQSxDQUFBO0FBQUE5YixNQUFBQSxJQUFBLEVBQUE7QUFBQSxLQVBBLEVBUUE7QUFBQThiLE1BQUFBLE1BQUEsRUFBQSxDQUFBLEtBQUEsRUFBQSxJQUFBLENBQUE7QUFBQTliLE1BQUFBLElBQUEsRUFBQTtBQUFBLEtBUkEsRUFTQTtBQUFBOGIsTUFBQUEsTUFBQSxFQUFBLENBQUEsSUFBQSxFQUFBLENBQUEsS0FBQSxDQUFBO0FBQUE5YixNQUFBQSxJQUFBLEVBQUE7QUFBQSxLQVRBLEVBVUE7QUFBQThiLE1BQUFBLE1BQUEsRUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBLEtBQUEsQ0FBQTtBQUFBOWIsTUFBQUEsSUFBQSxFQUFBO0FBQUEsS0FWQSxFQVdBO0FBQUE4YixNQUFBQSxNQUFBLEVBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxLQUFBLENBQUE7QUFBQTliLE1BQUFBLElBQUEsRUFBQTtBQUFBLEtBWEEsRUFZQTtBQUFBOGIsTUFBQUEsTUFBQSxFQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsS0FBQSxDQUFBO0FBQUE5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LFlBQUE7QUFDQTs7QUFFQXhFLEVBQUFBLENBQUEsQ0FBQW0yQixVQUFBLENBQUE7O0FBRUEsV0FBQUEsVUFBQSxHQUFBLENBRUE7QUFFQTtBQUVBLENBWEEiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIFRoaXMgbGlicmFyeSB3YXMgY3JlYXRlZCB0byBlbXVsYXRlIHNvbWUgalF1ZXJ5IGZlYXR1cmVzXHJcbiAqIHVzZWQgaW4gdGhpcyB0ZW1wbGF0ZSBvbmx5IHdpdGggSmF2YXNjcmlwdCBhbmQgRE9NXHJcbiAqIG1hbmlwdWxhdGlvbiBmdW5jdGlvbnMgKElFMTArKS5cclxuICogQWxsIG1ldGhvZHMgd2VyZSBkZXNpZ25lZCBmb3IgYW4gYWRlcXVhdGUgYW5kIHNwZWNpZmljIHVzZVxyXG4gKiBhbmQgZG9uJ3QgcGVyZm9ybSBhIGRlZXAgdmFsaWRhdGlvbiBvbiB0aGUgYXJndW1lbnRzIHByb3ZpZGVkLlxyXG4gKlxyXG4gKiBJTVBPUlRBTlQ6XHJcbiAqID09PT09PT09PT1cclxuICogSXQncyBzdWdnZXN0ZWQgTk9UIHRvIHVzZSB0aGlzIGxpYnJhcnkgZXh0ZW5zaXZlbHkgdW5sZXNzIHlvdVxyXG4gKiB1bmRlcnN0YW5kIHdoYXQgZWFjaCBtZXRob2QgZG9lcy4gSW5zdGVhZCwgdXNlIG9ubHkgSlMgb3JcclxuICogeW91IG1pZ2h0IGV2ZW4gbmVlZCBqUXVlcnkuXHJcbiAqL1xyXG5cclxuKGZ1bmN0aW9uKGdsb2JhbCwgZmFjdG9yeSkge1xyXG4gICAgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JykgeyAvLyBDb21tb25KUy1saWtlXHJcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XHJcbiAgICB9IGVsc2UgeyAvLyBCcm93c2VyXHJcbiAgICAgICAgaWYgKHR5cGVvZiBnbG9iYWwualF1ZXJ5ID09PSAndW5kZWZpbmVkJylcclxuICAgICAgICAgICAgZ2xvYmFsLiQgPSBmYWN0b3J5KCk7XHJcbiAgICB9XHJcbn0od2luZG93LCBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvLyBIRUxQRVJTXHJcbiAgICBmdW5jdGlvbiBhcnJheUZyb20ob2JqKSB7XHJcbiAgICAgICAgcmV0dXJuICgnbGVuZ3RoJyBpbiBvYmopICYmIChvYmogIT09IHdpbmRvdykgPyBbXS5zbGljZS5jYWxsKG9iaikgOiBbb2JqXTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBmaWx0ZXIoY3R4LCBmbikge1xyXG4gICAgICAgIHJldHVybiBbXS5maWx0ZXIuY2FsbChjdHgsIGZuKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBtYXAoY3R4LCBmbikge1xyXG4gICAgICAgIHJldHVybiBbXS5tYXAuY2FsbChjdHgsIGZuKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBtYXRjaGVzKGl0ZW0sIHNlbGVjdG9yKSB7XHJcbiAgICAgICAgcmV0dXJuIChFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzIHx8IEVsZW1lbnQucHJvdG90eXBlLm1zTWF0Y2hlc1NlbGVjdG9yKS5jYWxsKGl0ZW0sIHNlbGVjdG9yKVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEV2ZW50cyBoYW5kbGVyIHdpdGggc2ltcGxlIHNjb3BlZCBldmVudHMgc3VwcG9ydFxyXG4gICAgdmFyIEV2ZW50SGFuZGxlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuZXZlbnRzID0ge307XHJcbiAgICB9XHJcbiAgICBFdmVudEhhbmRsZXIucHJvdG90eXBlID0ge1xyXG4gICAgICAgIC8vIGV2ZW50IGFjY2VwdHM6ICdjbGljaycgb3IgJ2NsaWNrLnNjb3BlJ1xyXG4gICAgICAgIGJpbmQ6IGZ1bmN0aW9uKGV2ZW50LCBsaXN0ZW5lciwgdGFyZ2V0KSB7XHJcbiAgICAgICAgICAgIHZhciB0eXBlID0gZXZlbnQuc3BsaXQoJy4nKVswXTtcclxuICAgICAgICAgICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIGZhbHNlKTtcclxuICAgICAgICAgICAgdGhpcy5ldmVudHNbZXZlbnRdID0ge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogdHlwZSxcclxuICAgICAgICAgICAgICAgIGxpc3RlbmVyOiBsaXN0ZW5lclxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICB1bmJpbmQ6IGZ1bmN0aW9uKGV2ZW50LCB0YXJnZXQpIHtcclxuICAgICAgICAgICAgaWYgKGV2ZW50IGluIHRoaXMuZXZlbnRzKSB7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0aGlzLmV2ZW50c1tldmVudF0udHlwZSwgdGhpcy5ldmVudHNbZXZlbnRdLmxpc3RlbmVyLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5ldmVudHNbZXZlbnRdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIE9iamVjdCBEZWZpbml0aW9uXHJcbiAgICB2YXIgV3JhcCA9IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RvciA9IHNlbGVjdG9yO1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR1cChbXSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ09OU1RSVUNUT1JcclxuICAgIFdyYXAuQ29uc3RydWN0b3IgPSBmdW5jdGlvbihwYXJhbSwgYXR0cnMpIHtcclxuICAgICAgICB2YXIgZWwgPSBuZXcgV3JhcChwYXJhbSk7XHJcbiAgICAgICAgcmV0dXJuIGVsLmluaXQoYXR0cnMpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBDb3JlIG1ldGhvZHNcclxuICAgIFdyYXAucHJvdG90eXBlID0ge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yOiBXcmFwLFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEluaXRpYWxpemUgdGhlIG9iamVjdCBkZXBlbmRpbmcgb24gcGFyYW0gdHlwZVxyXG4gICAgICAgICAqIFthdHRyc10gb25seSB0byBoYW5kbGUgJChodG1sU3RyaW5nLCB7YXR0cmlidXRlc30pXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgaW5pdDogZnVuY3Rpb24oYXR0cnMpIHtcclxuICAgICAgICAgICAgLy8gZW1wdHkgb2JqZWN0XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5zZWxlY3RvcikgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgIC8vIHNlbGVjdG9yID09PSBzdHJpbmdcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnNlbGVjdG9yID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICAgICAgLy8gaWYgbG9va3MgbGlrZSBtYXJrdXAsIHRyeSB0byBjcmVhdGUgYW4gZWxlbWVudFxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2VsZWN0b3JbMF0gPT09ICc8Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBlbGVtID0gdGhpcy5fc2V0dXAoW3RoaXMuX2NyZWF0ZSh0aGlzLnNlbGVjdG9yKV0pXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGF0dHJzID8gZWxlbS5hdHRyKGF0dHJzKSA6IGVsZW07XHJcbiAgICAgICAgICAgICAgICB9IGVsc2VcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fc2V0dXAoYXJyYXlGcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5zZWxlY3RvcikpKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIHNlbGVjdG9yID09PSBET01FbGVtZW50XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNlbGVjdG9yLm5vZGVUeXBlKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NldHVwKFt0aGlzLnNlbGVjdG9yXSlcclxuICAgICAgICAgICAgZWxzZSAvLyBzaG9ydGhhbmQgZm9yIERPTVJlYWR5XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMuc2VsZWN0b3IgPT09ICdmdW5jdGlvbicpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NldHVwKFtkb2N1bWVudF0pLnJlYWR5KHRoaXMuc2VsZWN0b3IpXHJcbiAgICAgICAgICAgIC8vIEFycmF5IGxpa2Ugb2JqZWN0cyAoZS5nLiBOb2RlTGlzdC9IVE1MQ29sbGVjdGlvbilcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NldHVwKGFycmF5RnJvbSh0aGlzLnNlbGVjdG9yKSlcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENyZWF0ZXMgYSBET00gZWxlbWVudCBmcm9tIGEgc3RyaW5nXHJcbiAgICAgICAgICogU3RyaWN0bHkgc3VwcG9ydHMgdGhlIGZvcm06ICc8dGFnPicgb3IgJzx0YWcvPidcclxuICAgICAgICAgKi9cclxuICAgICAgICBfY3JlYXRlOiBmdW5jdGlvbihzdHIpIHtcclxuICAgICAgICAgICAgdmFyIG5vZGVOYW1lID0gc3RyLnN1YnN0cihzdHIuaW5kZXhPZignPCcpICsgMSwgc3RyLmluZGV4T2YoJz4nKSAtIDEpLnJlcGxhY2UoJy8nLCAnJylcclxuICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQobm9kZU5hbWUpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLyoqIHNldHVwIHByb3BlcnRpZXMgYW5kIGFycmF5IHRvIGVsZW1lbnQgc2V0ICovXHJcbiAgICAgICAgX3NldHVwOiBmdW5jdGlvbihlbGVtZW50cykge1xyXG4gICAgICAgICAgICB2YXIgaSA9IDA7XHJcbiAgICAgICAgICAgIGZvciAoOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIGRlbGV0ZSB0aGlzW2ldOyAvLyBjbGVhbiB1cCBvbGQgc2V0XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHMgPSBlbGVtZW50cztcclxuICAgICAgICAgICAgdGhpcy5sZW5ndGggPSBlbGVtZW50cy5sZW5ndGg7XHJcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykgdGhpc1tpXSA9IGVsZW1lbnRzW2ldIC8vIG5ldyBzZXRcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBfZmlyc3Q6IGZ1bmN0aW9uKGNiLCByZXQpIHtcclxuICAgICAgICAgICAgdmFyIGYgPSB0aGlzLmVsZW1lbnRzWzBdO1xyXG4gICAgICAgICAgICByZXR1cm4gZiA/IChjYiA/IGNiLmNhbGwodGhpcywgZikgOiBmKSA6IHJldDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8qKiBDb21tb24gZnVuY3Rpb24gZm9yIGNsYXNzIG1hbmlwdWxhdGlvbiAgKi9cclxuICAgICAgICBfY2xhc3NlczogZnVuY3Rpb24obWV0aG9kLCBjbGFzc25hbWUpIHtcclxuICAgICAgICAgICAgdmFyIGNscyA9IGNsYXNzbmFtZS5zcGxpdCgnICcpO1xyXG4gICAgICAgICAgICBpZiAoY2xzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgICAgIGNscy5mb3JFYWNoKHRoaXMuX2NsYXNzZXMuYmluZCh0aGlzLCBtZXRob2QpKVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKG1ldGhvZCA9PT0gJ2NvbnRhaW5zJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBlbGVtID0gdGhpcy5fZmlyc3QoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWxlbSA/IGVsZW0uY2xhc3NMaXN0LmNvbnRhaW5zKGNsYXNzbmFtZSkgOiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiAoY2xhc3NuYW1lID09PSAnJykgPyB0aGlzIDogdGhpcy5lYWNoKGZ1bmN0aW9uKGksIGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICBpdGVtLmNsYXNzTGlzdFttZXRob2RdKGNsYXNzbmFtZSk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBNdWx0aSBwdXJwb3NlIGZ1bmN0aW9uIHRvIHNldCBvciBnZXQgYSAoa2V5LCB2YWx1ZSlcclxuICAgICAgICAgKiBJZiBubyB2YWx1ZSwgd29ya3MgYXMgYSBnZXR0ZXIgZm9yIHRoZSBnaXZlbiBrZXlcclxuICAgICAgICAgKiBrZXkgY2FuIGJlIGFuIG9iamVjdCBpbiB0aGUgZm9ybSB7a2V5OiB2YWx1ZSwgLi4ufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIF9hY2Nlc3M6IGZ1bmN0aW9uKGtleSwgdmFsdWUsIGZuKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2Yga2V5ID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgayBpbiBrZXkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hY2Nlc3Moaywga2V5W2tdLCBmbik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2ZpcnN0KGZ1bmN0aW9uKGVsZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZm4oZWxlbSwga2V5KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oaSwgaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgZm4oaXRlbSwga2V5LCB2YWx1ZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZWFjaDogZnVuY3Rpb24oZm4sIGFycikge1xyXG4gICAgICAgICAgICBhcnIgPSBhcnIgPyBhcnIgOiB0aGlzLmVsZW1lbnRzO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGZuLmNhbGwoYXJyW2ldLCBpLCBhcnJbaV0pID09PSBmYWxzZSlcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIEFsbG93cyB0byBleHRlbmQgd2l0aCBuZXcgbWV0aG9kcyAqL1xyXG4gICAgV3JhcC5leHRlbmQgPSBmdW5jdGlvbihtZXRob2RzKSB7XHJcbiAgICAgICAgT2JqZWN0LmtleXMobWV0aG9kcykuZm9yRWFjaChmdW5jdGlvbihtKSB7XHJcbiAgICAgICAgICAgIFdyYXAucHJvdG90eXBlW21dID0gbWV0aG9kc1ttXVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgLy8gRE9NIFJFQURZXHJcbiAgICBXcmFwLmV4dGVuZCh7XHJcbiAgICAgICAgcmVhZHk6IGZ1bmN0aW9uKGZuKSB7XHJcbiAgICAgICAgICAgIGlmIChkb2N1bWVudC5hdHRhY2hFdmVudCA/IGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScgOiBkb2N1bWVudC5yZWFkeVN0YXRlICE9PSAnbG9hZGluZycpIHtcclxuICAgICAgICAgICAgICAgIGZuKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZm4pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgIH0pXHJcbiAgICAvLyBBQ0NFU1NcclxuICAgIFdyYXAuZXh0ZW5kKHtcclxuICAgICAgICAvKiogR2V0IG9yIHNldCBhIGNzcyB2YWx1ZSAqL1xyXG4gICAgICAgIGNzczogZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xyXG4gICAgICAgICAgICB2YXIgZ2V0U3R5bGUgPSBmdW5jdGlvbihlLCBrKSB7IHJldHVybiBlLnN0eWxlW2tdIHx8IGdldENvbXB1dGVkU3R5bGUoZSlba107IH07XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9hY2Nlc3Moa2V5LCB2YWx1ZSwgZnVuY3Rpb24oaXRlbSwgaywgdmFsKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdW5pdCA9ICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykgPyAncHgnIDogJyc7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsID09PSB1bmRlZmluZWQgPyBnZXRTdHlsZShpdGVtLCBrKSA6IChpdGVtLnN0eWxlW2tdID0gdmFsICsgdW5pdCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvKiogR2V0IGFuIGF0dHJpYnV0ZSBvciBzZXQgaXQgKi9cclxuICAgICAgICBhdHRyOiBmdW5jdGlvbihrZXksIHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9hY2Nlc3Moa2V5LCB2YWx1ZSwgZnVuY3Rpb24oaXRlbSwgaywgdmFsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsID09PSB1bmRlZmluZWQgPyBpdGVtLmdldEF0dHJpYnV0ZShrKSA6IGl0ZW0uc2V0QXR0cmlidXRlKGssIHZhbClcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8qKiBHZXQgYSBwcm9wZXJ0eSBvciBzZXQgaXQgKi9cclxuICAgICAgICBwcm9wOiBmdW5jdGlvbihrZXksIHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9hY2Nlc3Moa2V5LCB2YWx1ZSwgZnVuY3Rpb24oaXRlbSwgaywgdmFsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsID09PSB1bmRlZmluZWQgPyBpdGVtW2tdIDogKGl0ZW1ba10gPSB2YWwpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcG9zaXRpb246IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZmlyc3QoZnVuY3Rpb24oZWxlbSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgbGVmdDogZWxlbS5vZmZzZXRMZWZ0LCB0b3A6IGVsZW0ub2Zmc2V0VG9wIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzY3JvbGxUb3A6IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9hY2Nlc3MoJ3Njcm9sbFRvcCcsIHZhbHVlLCBmdW5jdGlvbihpdGVtLCBrLCB2YWwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWwgPT09IHVuZGVmaW5lZCA/IGl0ZW1ba10gOiAoaXRlbVtrXSA9IHZhbCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSxcclxuICAgICAgICBvdXRlckhlaWdodDogZnVuY3Rpb24oaW5jbHVkZU1hcmdpbikge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZmlyc3QoZnVuY3Rpb24oZWxlbSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShlbGVtKTtcclxuICAgICAgICAgICAgICAgIHZhciBtYXJnaW5zID0gaW5jbHVkZU1hcmdpbiA/IChwYXJzZUludChzdHlsZS5tYXJnaW5Ub3AsIDEwKSArIHBhcnNlSW50KHN0eWxlLm1hcmdpbkJvdHRvbSwgMTApKSA6IDA7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbS5vZmZzZXRIZWlnaHQgKyBtYXJnaW5zO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEZpbmQgdGhlIHBvc2l0aW9uIG9mIHRoZSBmaXJzdCBlbGVtZW50IGluIHRoZSBzZXRcclxuICAgICAgICAgKiByZWxhdGl2ZSB0byBpdHMgc2libGluZyBlbGVtZW50cy5cclxuICAgICAgICAgKi9cclxuICAgICAgICBpbmRleDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9maXJzdChmdW5jdGlvbihlbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFycmF5RnJvbShlbC5wYXJlbnROb2RlLmNoaWxkcmVuKS5pbmRleE9mKGVsKVxyXG4gICAgICAgICAgICB9LCAtMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxuICAgIC8vIExPT0tVUFxyXG4gICAgV3JhcC5leHRlbmQoe1xyXG4gICAgICAgIGNoaWxkcmVuOiBmdW5jdGlvbihzZWxlY3Rvcikge1xyXG4gICAgICAgICAgICB2YXIgY2hpbGRzID0gW107XHJcbiAgICAgICAgICAgIHRoaXMuZWFjaChmdW5jdGlvbihpLCBpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICBjaGlsZHMgPSBjaGlsZHMuY29uY2F0KG1hcChpdGVtLmNoaWxkcmVuLCBmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW1cclxuICAgICAgICAgICAgICAgIH0pKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICByZXR1cm4gV3JhcC5Db25zdHJ1Y3RvcihjaGlsZHMpLmZpbHRlcihzZWxlY3Rvcik7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzaWJsaW5nczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBzaWJzID0gW11cclxuICAgICAgICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uKGksIGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIHNpYnMgPSBzaWJzLmNvbmNhdChmaWx0ZXIoaXRlbS5wYXJlbnROb2RlLmNoaWxkcmVuLCBmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjaGlsZCAhPT0gaXRlbTtcclxuICAgICAgICAgICAgICAgIH0pKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICByZXR1cm4gV3JhcC5Db25zdHJ1Y3RvcihzaWJzKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLyoqIFJldHVybiB0aGUgcGFyZW50IG9mIGVhY2ggZWxlbWVudCBpbiB0aGUgY3VycmVudCBzZXQgKi9cclxuICAgICAgICBwYXJlbnQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgcGFyID0gbWFwKHRoaXMuZWxlbWVudHMsIGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBpdGVtLnBhcmVudE5vZGU7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIHJldHVybiBXcmFwLkNvbnN0cnVjdG9yKHBhcilcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8qKiBSZXR1cm4gQUxMIHBhcmVudHMgb2YgZWFjaCBlbGVtZW50IGluIHRoZSBjdXJyZW50IHNldCAqL1xyXG4gICAgICAgIHBhcmVudHM6IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XHJcbiAgICAgICAgICAgIHZhciBwYXIgPSBbXTtcclxuICAgICAgICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uKGksIGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIHAgPSBpdGVtLnBhcmVudEVsZW1lbnQ7IHA7IHAgPSBwLnBhcmVudEVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyLnB1c2gocCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIHJldHVybiBXcmFwLkNvbnN0cnVjdG9yKHBhcikuZmlsdGVyKHNlbGVjdG9yKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogR2V0IHRoZSBkZXNjZW5kYW50cyBvZiBlYWNoIGVsZW1lbnQgaW4gdGhlIHNldCwgZmlsdGVyZWQgYnkgYSBzZWxlY3RvclxyXG4gICAgICAgICAqIFNlbGVjdG9yIGNhbid0IHN0YXJ0IHdpdGggXCI+XCIgKDpzY29wZSBub3Qgc3VwcG9ydGVkIG9uIElFKS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBmaW5kOiBmdW5jdGlvbihzZWxlY3Rvcikge1xyXG4gICAgICAgICAgICB2YXIgZm91bmQgPSBbXVxyXG4gICAgICAgICAgICB0aGlzLmVhY2goZnVuY3Rpb24oaSwgaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgZm91bmQgPSBmb3VuZC5jb25jYXQobWFwKGl0ZW0ucXVlcnlTZWxlY3RvckFsbCggLyonOnNjb3BlICcgKyAqLyBzZWxlY3RvciksIGZ1bmN0aW9uKGZpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZpdGVtXHJcbiAgICAgICAgICAgICAgICB9KSlcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgcmV0dXJuIFdyYXAuQ29uc3RydWN0b3IoZm91bmQpXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvKiogZmlsdGVyIHRoZSBhY3R1YWwgc2V0IGJhc2VkIG9uIGdpdmVuIHNlbGVjdG9yICovXHJcbiAgICAgICAgZmlsdGVyOiBmdW5jdGlvbihzZWxlY3Rvcikge1xyXG4gICAgICAgICAgICBpZiAoIXNlbGVjdG9yKSByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgdmFyIHJlcyA9IGZpbHRlcih0aGlzLmVsZW1lbnRzLCBmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbWF0Y2hlcyhpdGVtLCBzZWxlY3RvcilcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgcmV0dXJuIFdyYXAuQ29uc3RydWN0b3IocmVzKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLyoqIFdvcmtzIG9ubHkgd2l0aCBhIHN0cmluZyBzZWxlY3RvciAqL1xyXG4gICAgICAgIGlzOiBmdW5jdGlvbihzZWxlY3Rvcikge1xyXG4gICAgICAgICAgICB2YXIgZm91bmQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uKGksIGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAhKGZvdW5kID0gbWF0Y2hlcyhpdGVtLCBzZWxlY3RvcikpXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIHJldHVybiBmb3VuZDtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIC8vIEVMRU1FTlRTXHJcbiAgICBXcmFwLmV4dGVuZCh7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogYXBwZW5kIGN1cnJlbnQgc2V0IHRvIGdpdmVuIG5vZGVcclxuICAgICAgICAgKiBleHBlY3RzIGEgZG9tIG5vZGUgb3Igc2V0XHJcbiAgICAgICAgICogaWYgZWxlbWVudCBpcyBhIHNldCwgcHJlcGVuZHMgb25seSB0aGUgZmlyc3RcclxuICAgICAgICAgKi9cclxuICAgICAgICBhcHBlbmRUbzogZnVuY3Rpb24oZWxlbSkge1xyXG4gICAgICAgICAgICBlbGVtID0gZWxlbS5ub2RlVHlwZSA/IGVsZW0gOiBlbGVtLl9maXJzdCgpXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oaSwgaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgZWxlbS5hcHBlbmRDaGlsZChpdGVtKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEFwcGVuZCBhIGRvbU5vZGUgdG8gZWFjaCBlbGVtZW50IGluIHRoZSBzZXRcclxuICAgICAgICAgKiBpZiBlbGVtZW50IGlzIGEgc2V0LCBhcHBlbmQgb25seSB0aGUgZmlyc3RcclxuICAgICAgICAgKi9cclxuICAgICAgICBhcHBlbmQ6IGZ1bmN0aW9uKGVsZW0pIHtcclxuICAgICAgICAgICAgZWxlbSA9IGVsZW0ubm9kZVR5cGUgPyBlbGVtIDogZWxlbS5fZmlyc3QoKVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKGksIGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIGl0ZW0uYXBwZW5kQ2hpbGQoZWxlbSk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBJbnNlcnQgdGhlIGN1cnJlbnQgc2V0IG9mIGVsZW1lbnRzIGFmdGVyIHRoZSBlbGVtZW50XHJcbiAgICAgICAgICogdGhhdCBtYXRjaGVzIHRoZSBnaXZlbiBzZWxlY3RvciBpbiBwYXJhbVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGluc2VydEFmdGVyOiBmdW5jdGlvbihzZWxlY3Rvcikge1xyXG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oaSwgaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGl0ZW0sIHRhcmdldC5uZXh0U2libGluZyk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDbG9uZXMgYWxsIGVsZW1lbnQgaW4gdGhlIHNldFxyXG4gICAgICAgICAqIHJldHVybnMgYSBuZXcgc2V0IHdpdGggdGhlIGNsb25lZCBlbGVtZW50c1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNsb25lOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIGNsb25lcyA9IG1hcCh0aGlzLmVsZW1lbnRzLCBmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaXRlbS5jbG9uZU5vZGUodHJ1ZSlcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgcmV0dXJuIFdyYXAuQ29uc3RydWN0b3IoY2xvbmVzKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8qKiBSZW1vdmUgYWxsIG5vZGUgaW4gdGhlIHNldCBmcm9tIERPTS4gKi9cclxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmVhY2goZnVuY3Rpb24oaSwgaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIGl0ZW0uZXZlbnRzO1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIGl0ZW0uZGF0YTtcclxuICAgICAgICAgICAgICAgIGlmIChpdGVtLnBhcmVudE5vZGUpIGl0ZW0ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChpdGVtKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgdGhpcy5fc2V0dXAoW10pXHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxuICAgIC8vIERBVEFTRVRTXHJcbiAgICBXcmFwLmV4dGVuZCh7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRXhwZWN0ZWQga2V5IGluIGNhbWVsQ2FzZSBmb3JtYXRcclxuICAgICAgICAgKiBpZiB2YWx1ZSBwcm92aWRlZCBzYXZlIGRhdGEgaW50byBlbGVtZW50IHNldFxyXG4gICAgICAgICAqIGlmIG5vdCwgcmV0dXJuIGRhdGEgZm9yIHRoZSBmaXJzdCBlbGVtZW50XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xyXG4gICAgICAgICAgICB2YXIgaGFzSlNPTiA9IC9eKD86XFx7W1xcd1xcV10qXFx9fFxcW1tcXHdcXFddKlxcXSkkLyxcclxuICAgICAgICAgICAgICAgIGRhdGFBdHRyID0gJ2RhdGEtJyArIGtleS5yZXBsYWNlKC9bQS1aXS9nLCAnLSQmJykudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9maXJzdChmdW5jdGlvbihlbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlbC5kYXRhICYmIGVsLmRhdGFba2V5XSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsLmRhdGFba2V5XTtcclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBlbC5nZXRBdHRyaWJ1dGUoZGF0YUF0dHIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhID09PSAndHJ1ZScpIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YSA9PT0gJ2ZhbHNlJykgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YSA9PT0gK2RhdGEgKyAnJykgcmV0dXJuICtkYXRhO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaGFzSlNPTi50ZXN0KGRhdGEpKSByZXR1cm4gSlNPTi5wYXJzZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKGksIGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICBpdGVtLmRhdGEgPSBpdGVtLmRhdGEgfHwge307XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5kYXRhW2tleV0gPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxuICAgIC8vIEVWRU5UU1xyXG4gICAgV3JhcC5leHRlbmQoe1xyXG4gICAgICAgIHRyaWdnZXI6IGZ1bmN0aW9uKHR5cGUpIHtcclxuICAgICAgICAgICAgdHlwZSA9IHR5cGUuc3BsaXQoJy4nKVswXTsgLy8gaWdub3JlIG5hbWVzcGFjZVxyXG4gICAgICAgICAgICB2YXIgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnSFRNTEV2ZW50cycpO1xyXG4gICAgICAgICAgICBldmVudC5pbml0RXZlbnQodHlwZSwgdHJ1ZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKGksIGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIGl0ZW0uZGlzcGF0Y2hFdmVudChldmVudCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSxcclxuICAgICAgICBibHVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudHJpZ2dlcignYmx1cicpXHJcbiAgICAgICAgfSxcclxuICAgICAgICBmb2N1czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRyaWdnZXIoJ2ZvY3VzJylcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uOiBmdW5jdGlvbihldmVudCwgY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbihpLCBpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWl0ZW0uZXZlbnRzKSBpdGVtLmV2ZW50cyA9IG5ldyBFdmVudEhhbmRsZXIoKTtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnNwbGl0KCcgJykuZm9yRWFjaChmdW5jdGlvbihldikge1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uZXZlbnRzLmJpbmQoZXYsIGNhbGxiYWNrLCBpdGVtKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSxcclxuICAgICAgICBvZmY6IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oaSwgaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0uZXZlbnRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5ldmVudHMudW5iaW5kKGV2ZW50LCBpdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgaXRlbS5ldmVudHM7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxuICAgIC8vIENMQVNTRVNcclxuICAgIFdyYXAuZXh0ZW5kKHtcclxuICAgICAgICB0b2dnbGVDbGFzczogZnVuY3Rpb24oY2xhc3NuYW1lKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jbGFzc2VzKCd0b2dnbGUnLCBjbGFzc25hbWUpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYWRkQ2xhc3M6IGZ1bmN0aW9uKGNsYXNzbmFtZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY2xhc3NlcygnYWRkJywgY2xhc3NuYW1lKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlbW92ZUNsYXNzOiBmdW5jdGlvbihjbGFzc25hbWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NsYXNzZXMoJ3JlbW92ZScsIGNsYXNzbmFtZSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBoYXNDbGFzczogZnVuY3Rpb24oY2xhc3NuYW1lKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jbGFzc2VzKCdjb250YWlucycsIGNsYXNzbmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTb21lIGJhc2ljIGZlYXR1cmVzIGluIHRoaXMgdGVtcGxhdGUgcmVsaWVzIG9uIEJvb3RzdHJhcFxyXG4gICAgICogcGx1Z2lucywgbGlrZSBDb2xsYXBzZSwgRHJvcGRvd24gYW5kIFRhYi5cclxuICAgICAqIEJlbG93IGNvZGUgZW11bGF0ZXMgcGx1Z2lucyBiZWhhdmlvciBieSB0b2dnbGluZyBjbGFzc2VzXHJcbiAgICAgKiBmcm9tIGVsZW1lbnRzIHRvIGFsbG93IGEgbWluaW11bSBpbnRlcmFjdGlvbiB3aXRob3V0IGFuaW1hdGlvbi5cclxuICAgICAqIC0gT25seSBDb2xsYXBzZSBpcyByZXF1aXJlZCB3aGljaCBpcyB1c2VkIGJ5IHRoZSBzaWRlYmFyLlxyXG4gICAgICogLSBUYWIgYW5kIERyb3Bkb3duIGFyZSBvcHRpb25hbCBmZWF0dXJlcy5cclxuICAgICAqL1xyXG5cclxuICAgIC8vIEVtdWxhdGUgalF1ZXJ5IHN5bWJvbCB0byBzaW1wbGlmeSB1c2FnZVxyXG4gICAgdmFyICQgPSBXcmFwLkNvbnN0cnVjdG9yO1xyXG5cclxuICAgIC8vIEVtdWxhdGVzIENvbGxhcHNlIHBsdWdpblxyXG4gICAgV3JhcC5leHRlbmQoe1xyXG4gICAgICAgIGNvbGxhcHNlOiBmdW5jdGlvbihhY3Rpb24pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbihpLCBpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgJGl0ZW0gPSAkKGl0ZW0pLnRyaWdnZXIoYWN0aW9uICsgJy5icy5jb2xsYXBzZScpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGFjdGlvbiA9PT0gJ3RvZ2dsZScpICRpdGVtLmNvbGxhcHNlKCRpdGVtLmhhc0NsYXNzKCdzaG93JykgPyAnaGlkZScgOiAnc2hvdycpO1xyXG4gICAgICAgICAgICAgICAgZWxzZSAkaXRlbVthY3Rpb24gPT09ICdzaG93JyA/ICdhZGRDbGFzcycgOiAncmVtb3ZlQ2xhc3MnXSgnc2hvdycpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcbiAgICAvLyBJbml0aWFsaXphdGlvbnNcclxuICAgICQoJ1tkYXRhLXRvZ2dsZV0nKS5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgdmFyIHRhcmdldCA9ICQoZS5jdXJyZW50VGFyZ2V0KTtcclxuICAgICAgICBpZiAodGFyZ2V0LmlzKCdhJykpIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBzd2l0Y2ggKHRhcmdldC5kYXRhKCd0b2dnbGUnKSkge1xyXG4gICAgICAgICAgICBjYXNlICdjb2xsYXBzZSc6XHJcbiAgICAgICAgICAgICAgICAkKHRhcmdldC5hdHRyKCdocmVmJykpLmNvbGxhcHNlKCd0b2dnbGUnKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICd0YWInOlxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LnBhcmVudCgpLnBhcmVudCgpLmZpbmQoJy5hY3RpdmUnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHRhYlBhbmUgPSAkKHRhcmdldC5hdHRyKCdocmVmJykpO1xyXG4gICAgICAgICAgICAgICAgdGFiUGFuZS5zaWJsaW5ncygpLnJlbW92ZUNsYXNzKCdhY3RpdmUgc2hvdycpO1xyXG4gICAgICAgICAgICAgICAgdGFiUGFuZS5hZGRDbGFzcygnYWN0aXZlIHNob3cnKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdkcm9wZG93bic6XHJcbiAgICAgICAgICAgICAgICB2YXIgZGQgPSB0YXJnZXQucGFyZW50KCkudG9nZ2xlQ2xhc3MoJ3Nob3cnKTtcclxuICAgICAgICAgICAgICAgIGRkLmZpbmQoJy5kcm9wZG93bi1tZW51JykudG9nZ2xlQ2xhc3MoJ3Nob3cnKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxuXHJcblxyXG4gICAgcmV0dXJuIFdyYXAuQ29uc3RydWN0b3JcclxuXHJcbn0pKTsiLCIvKiFcclxuICpcclxuICogQW5nbGUgLSBCb290c3RyYXAgQWRtaW4gVGVtcGxhdGVcclxuICpcclxuICogVmVyc2lvbjogQHZlcnNpb25AXHJcbiAqIEF1dGhvcjogQGF1dGhvckBcclxuICogV2Vic2l0ZTogQHVybEBcclxuICogTGljZW5zZTogQGxpY2Vuc2VAXHJcbiAqXHJcbiAqL1xyXG5cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAkKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAvLyBSZXN0b3JlIGJvZHkgY2xhc3Nlc1xyXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgdmFyICRib2R5ID0gJCgnYm9keScpO1xyXG4gICAgICAgIG5ldyBTdGF0ZVRvZ2dsZXIoKS5yZXN0b3JlU3RhdGUoJGJvZHkpO1xyXG5cclxuICAgICAgICAvLyBlbmFibGUgc2V0dGluZ3MgdG9nZ2xlIGFmdGVyIHJlc3RvcmVcclxuICAgICAgICAkKCcjY2hrLWZpeGVkJykucHJvcCgnY2hlY2tlZCcsICRib2R5Lmhhc0NsYXNzKCdsYXlvdXQtZml4ZWQnKSk7XHJcbiAgICAgICAgJCgnI2Noay1jb2xsYXBzZWQnKS5wcm9wKCdjaGVja2VkJywgJGJvZHkuaGFzQ2xhc3MoJ2FzaWRlLWNvbGxhcHNlZCcpKTtcclxuICAgICAgICAkKCcjY2hrLWNvbGxhcHNlZC10ZXh0JykucHJvcCgnY2hlY2tlZCcsICRib2R5Lmhhc0NsYXNzKCdhc2lkZS1jb2xsYXBzZWQtdGV4dCcpKTtcclxuICAgICAgICAkKCcjY2hrLWJveGVkJykucHJvcCgnY2hlY2tlZCcsICRib2R5Lmhhc0NsYXNzKCdsYXlvdXQtYm94ZWQnKSk7XHJcbiAgICAgICAgJCgnI2Noay1mbG9hdCcpLnByb3AoJ2NoZWNrZWQnLCAkYm9keS5oYXNDbGFzcygnYXNpZGUtZmxvYXQnKSk7XHJcbiAgICAgICAgJCgnI2Noay1ob3ZlcicpLnByb3AoJ2NoZWNrZWQnLCAkYm9keS5oYXNDbGFzcygnYXNpZGUtaG92ZXInKSk7XHJcblxyXG4gICAgICAgIC8vIFdoZW4gcmVhZHkgZGlzcGxheSB0aGUgb2Zmc2lkZWJhclxyXG4gICAgICAgICQoJy5vZmZzaWRlYmFyLmQtbm9uZScpLnJlbW92ZUNsYXNzKCdkLW5vbmUnKTtcclxuXHJcbiAgICB9KTsgLy8gZG9jIHJlYWR5XHJcblxyXG59KSgpOyIsIi8vIEtub2IgY2hhcnRcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAkKGluaXRLbm9iKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0S25vYigpIHtcclxuXHJcbiAgICAgICAgaWYgKCEkLmZuLmtub2IpIHJldHVybjtcclxuXHJcbiAgICAgICAgdmFyIGtub2JMb2FkZXJPcHRpb25zMSA9IHtcclxuICAgICAgICAgICAgd2lkdGg6ICc1MCUnLCAvLyByZXNwb25zaXZlXHJcbiAgICAgICAgICAgIGRpc3BsYXlJbnB1dDogdHJ1ZSxcclxuICAgICAgICAgICAgZmdDb2xvcjogQVBQX0NPTE9SU1snaW5mbyddXHJcbiAgICAgICAgfTtcclxuICAgICAgICAkKCcja25vYi1jaGFydDEnKS5rbm9iKGtub2JMb2FkZXJPcHRpb25zMSk7XHJcblxyXG4gICAgICAgIHZhciBrbm9iTG9hZGVyT3B0aW9uczIgPSB7XHJcbiAgICAgICAgICAgIHdpZHRoOiAnNTAlJywgLy8gcmVzcG9uc2l2ZVxyXG4gICAgICAgICAgICBkaXNwbGF5SW5wdXQ6IHRydWUsXHJcbiAgICAgICAgICAgIGZnQ29sb3I6IEFQUF9DT0xPUlNbJ3B1cnBsZSddLFxyXG4gICAgICAgICAgICByZWFkT25seTogdHJ1ZVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgJCgnI2tub2ItY2hhcnQyJykua25vYihrbm9iTG9hZGVyT3B0aW9uczIpO1xyXG5cclxuICAgICAgICB2YXIga25vYkxvYWRlck9wdGlvbnMzID0ge1xyXG4gICAgICAgICAgICB3aWR0aDogJzUwJScsIC8vIHJlc3BvbnNpdmVcclxuICAgICAgICAgICAgZGlzcGxheUlucHV0OiB0cnVlLFxyXG4gICAgICAgICAgICBmZ0NvbG9yOiBBUFBfQ09MT1JTWydpbmZvJ10sXHJcbiAgICAgICAgICAgIGJnQ29sb3I6IEFQUF9DT0xPUlNbJ2dyYXknXSxcclxuICAgICAgICAgICAgYW5nbGVPZmZzZXQ6IC0xMjUsXHJcbiAgICAgICAgICAgIGFuZ2xlQXJjOiAyNTBcclxuICAgICAgICB9O1xyXG4gICAgICAgICQoJyNrbm9iLWNoYXJ0MycpLmtub2Ioa25vYkxvYWRlck9wdGlvbnMzKTtcclxuXHJcbiAgICAgICAgdmFyIGtub2JMb2FkZXJPcHRpb25zNCA9IHtcclxuICAgICAgICAgICAgd2lkdGg6ICc1MCUnLCAvLyByZXNwb25zaXZlXHJcbiAgICAgICAgICAgIGRpc3BsYXlJbnB1dDogdHJ1ZSxcclxuICAgICAgICAgICAgZmdDb2xvcjogQVBQX0NPTE9SU1sncGluayddLFxyXG4gICAgICAgICAgICBkaXNwbGF5UHJldmlvdXM6IHRydWUsXHJcbiAgICAgICAgICAgIHRoaWNrbmVzczogMC4xLFxyXG4gICAgICAgICAgICBsaW5lQ2FwOiAncm91bmQnXHJcbiAgICAgICAgfTtcclxuICAgICAgICAkKCcja25vYi1jaGFydDQnKS5rbm9iKGtub2JMb2FkZXJPcHRpb25zNCk7XHJcblxyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvLyBDaGFydCBKU1xyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoaW5pdENoYXJ0SlMpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRDaGFydEpTKCkge1xyXG5cclxuICAgICAgICBpZiAodHlwZW9mIENoYXJ0ID09PSAndW5kZWZpbmVkJykgcmV0dXJuO1xyXG5cclxuICAgICAgICAvLyByYW5kb20gdmFsdWVzIGZvciBkZW1vXHJcbiAgICAgICAgdmFyIHJGYWN0b3IgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIDEwMCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gTGluZSBjaGFydFxyXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgICAgIHZhciBsaW5lRGF0YSA9IHtcclxuICAgICAgICAgICAgbGFiZWxzOiBbJ0phbnVhcnknLCAnRmVicnVhcnknLCAnTWFyY2gnLCAnQXByaWwnLCAnTWF5JywgJ0p1bmUnLCAnSnVseSddLFxyXG4gICAgICAgICAgICBkYXRhc2V0czogW3tcclxuICAgICAgICAgICAgICAgIGxhYmVsOiAnTXkgRmlyc3QgZGF0YXNldCcsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICdyZ2JhKDExNCwxMDIsMTg2LDAuMiknLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6ICdyZ2JhKDExNCwxMDIsMTg2LDEpJyxcclxuICAgICAgICAgICAgICAgIHBvaW50Qm9yZGVyQ29sb3I6ICcjZmZmJyxcclxuICAgICAgICAgICAgICAgIGRhdGE6IFtyRmFjdG9yKCksIHJGYWN0b3IoKSwgckZhY3RvcigpLCByRmFjdG9yKCksIHJGYWN0b3IoKSwgckZhY3RvcigpLCByRmFjdG9yKCldXHJcbiAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiAnTXkgU2Vjb25kIGRhdGFzZXQnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAncmdiYSgzNSwxODMsMjI5LDAuMiknLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6ICdyZ2JhKDM1LDE4MywyMjksMSknLFxyXG4gICAgICAgICAgICAgICAgcG9pbnRCb3JkZXJDb2xvcjogJyNmZmYnLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogW3JGYWN0b3IoKSwgckZhY3RvcigpLCByRmFjdG9yKCksIHJGYWN0b3IoKSwgckZhY3RvcigpLCByRmFjdG9yKCksIHJGYWN0b3IoKV1cclxuICAgICAgICAgICAgfV1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgbGluZU9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIGxlZ2VuZDoge1xyXG4gICAgICAgICAgICAgICAgZGlzcGxheTogZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdmFyIGxpbmVjdHggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2hhcnRqcy1saW5lY2hhcnQnKS5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgICAgIHZhciBsaW5lQ2hhcnQgPSBuZXcgQ2hhcnQobGluZWN0eCwge1xyXG4gICAgICAgICAgICBkYXRhOiBsaW5lRGF0YSxcclxuICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxyXG4gICAgICAgICAgICBvcHRpb25zOiBsaW5lT3B0aW9uc1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBCYXIgY2hhcnRcclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgICAgICB2YXIgYmFyRGF0YSA9IHtcclxuICAgICAgICAgICAgbGFiZWxzOiBbJ0phbnVhcnknLCAnRmVicnVhcnknLCAnTWFyY2gnLCAnQXByaWwnLCAnTWF5JywgJ0p1bmUnLCAnSnVseSddLFxyXG4gICAgICAgICAgICBkYXRhc2V0czogW3tcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyMyM2I3ZTUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6ICcjMjNiN2U1JyxcclxuICAgICAgICAgICAgICAgIGRhdGE6IFtyRmFjdG9yKCksIHJGYWN0b3IoKSwgckZhY3RvcigpLCByRmFjdG9yKCksIHJGYWN0b3IoKSwgckZhY3RvcigpLCByRmFjdG9yKCldXHJcbiAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyM1ZDljZWMnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6ICcjNWQ5Y2VjJyxcclxuICAgICAgICAgICAgICAgIGRhdGE6IFtyRmFjdG9yKCksIHJGYWN0b3IoKSwgckZhY3RvcigpLCByRmFjdG9yKCksIHJGYWN0b3IoKSwgckZhY3RvcigpLCByRmFjdG9yKCldXHJcbiAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIGJhck9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIGxlZ2VuZDoge1xyXG4gICAgICAgICAgICAgICAgZGlzcGxheTogZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdmFyIGJhcmN0eCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjaGFydGpzLWJhcmNoYXJ0JykuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgICAgICB2YXIgYmFyQ2hhcnQgPSBuZXcgQ2hhcnQoYmFyY3R4LCB7XHJcbiAgICAgICAgICAgIGRhdGE6IGJhckRhdGEsXHJcbiAgICAgICAgICAgIHR5cGU6ICdiYXInLFxyXG4gICAgICAgICAgICBvcHRpb25zOiBiYXJPcHRpb25zXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vICBEb3VnaG51dCBjaGFydFxyXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgICAgIHZhciBkb3VnaG51dERhdGEgPSB7XHJcbiAgICAgICAgICAgIGxhYmVsczogW1xyXG4gICAgICAgICAgICAgICAgJ1B1cnBsZScsXHJcbiAgICAgICAgICAgICAgICAnWWVsbG93JyxcclxuICAgICAgICAgICAgICAgICdCbHVlJ1xyXG4gICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICBkYXRhc2V0czogW3tcclxuICAgICAgICAgICAgICAgIGRhdGE6IFszMDAsIDUwLCAxMDBdLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgJyM3MjY2YmEnLFxyXG4gICAgICAgICAgICAgICAgICAgICcjZmFkNzMyJyxcclxuICAgICAgICAgICAgICAgICAgICAnIzIzYjdlNSdcclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICBob3ZlckJhY2tncm91bmRDb2xvcjogW1xyXG4gICAgICAgICAgICAgICAgICAgICcjNzI2NmJhJyxcclxuICAgICAgICAgICAgICAgICAgICAnI2ZhZDczMicsXHJcbiAgICAgICAgICAgICAgICAgICAgJyMyM2I3ZTUnXHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIGRvdWdobnV0T3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgbGVnZW5kOiB7XHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiBmYWxzZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgZG91Z2hudXRjdHggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2hhcnRqcy1kb3VnaG51dGNoYXJ0JykuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgICAgICB2YXIgZG91Z2hudXRDaGFydCA9IG5ldyBDaGFydChkb3VnaG51dGN0eCwge1xyXG4gICAgICAgICAgICBkYXRhOiBkb3VnaG51dERhdGEsXHJcbiAgICAgICAgICAgIHR5cGU6ICdkb3VnaG51dCcsXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IGRvdWdobnV0T3B0aW9uc1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBQaWUgY2hhcnRcclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgICAgICB2YXIgcGllRGF0YSA9IHtcclxuICAgICAgICAgICAgbGFiZWxzOiBbXHJcbiAgICAgICAgICAgICAgICAnUHVycGxlJyxcclxuICAgICAgICAgICAgICAgICdZZWxsb3cnLFxyXG4gICAgICAgICAgICAgICAgJ0JsdWUnXHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgIGRhdGFzZXRzOiBbe1xyXG4gICAgICAgICAgICAgICAgZGF0YTogWzMwMCwgNTAsIDEwMF0sXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFtcclxuICAgICAgICAgICAgICAgICAgICAnIzcyNjZiYScsXHJcbiAgICAgICAgICAgICAgICAgICAgJyNmYWQ3MzInLFxyXG4gICAgICAgICAgICAgICAgICAgICcjMjNiN2U1J1xyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgIGhvdmVyQmFja2dyb3VuZENvbG9yOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgJyM3MjY2YmEnLFxyXG4gICAgICAgICAgICAgICAgICAgICcjZmFkNzMyJyxcclxuICAgICAgICAgICAgICAgICAgICAnIzIzYjdlNSdcclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgfV1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgcGllT3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgbGVnZW5kOiB7XHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiBmYWxzZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgcGllY3R4ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NoYXJ0anMtcGllY2hhcnQnKS5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgICAgIHZhciBwaWVDaGFydCA9IG5ldyBDaGFydChwaWVjdHgsIHtcclxuICAgICAgICAgICAgZGF0YTogcGllRGF0YSxcclxuICAgICAgICAgICAgdHlwZTogJ3BpZScsXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IHBpZU9wdGlvbnNcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gUG9sYXIgY2hhcnRcclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgICAgICB2YXIgcG9sYXJEYXRhID0ge1xyXG4gICAgICAgICAgICBkYXRhc2V0czogW3tcclxuICAgICAgICAgICAgICAgIGRhdGE6IFtcclxuICAgICAgICAgICAgICAgICAgICAxMSxcclxuICAgICAgICAgICAgICAgICAgICAxNixcclxuICAgICAgICAgICAgICAgICAgICA3LFxyXG4gICAgICAgICAgICAgICAgICAgIDNcclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFtcclxuICAgICAgICAgICAgICAgICAgICAnI2Y1MzJlNScsXHJcbiAgICAgICAgICAgICAgICAgICAgJyM3MjY2YmEnLFxyXG4gICAgICAgICAgICAgICAgICAgICcjZjUzMmU1JyxcclxuICAgICAgICAgICAgICAgICAgICAnIzcyNjZiYSdcclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICBsYWJlbDogJ015IGRhdGFzZXQnIC8vIGZvciBsZWdlbmRcclxuICAgICAgICAgICAgfV0sXHJcbiAgICAgICAgICAgIGxhYmVsczogW1xyXG4gICAgICAgICAgICAgICAgJ0xhYmVsIDEnLFxyXG4gICAgICAgICAgICAgICAgJ0xhYmVsIDInLFxyXG4gICAgICAgICAgICAgICAgJ0xhYmVsIDMnLFxyXG4gICAgICAgICAgICAgICAgJ0xhYmVsIDQnXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgcG9sYXJPcHRpb25zID0ge1xyXG4gICAgICAgICAgICBsZWdlbmQ6IHtcclxuICAgICAgICAgICAgICAgIGRpc3BsYXk6IGZhbHNlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIHZhciBwb2xhcmN0eCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjaGFydGpzLXBvbGFyY2hhcnQnKS5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgICAgIHZhciBwb2xhckNoYXJ0ID0gbmV3IENoYXJ0KHBvbGFyY3R4LCB7XHJcbiAgICAgICAgICAgIGRhdGE6IHBvbGFyRGF0YSxcclxuICAgICAgICAgICAgdHlwZTogJ3BvbGFyQXJlYScsXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IHBvbGFyT3B0aW9uc1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBSYWRhciBjaGFydFxyXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgICAgIHZhciByYWRhckRhdGEgPSB7XHJcbiAgICAgICAgICAgIGxhYmVsczogWydFYXRpbmcnLCAnRHJpbmtpbmcnLCAnU2xlZXBpbmcnLCAnRGVzaWduaW5nJywgJ0NvZGluZycsICdDeWNsaW5nJywgJ1J1bm5pbmcnXSxcclxuICAgICAgICAgICAgZGF0YXNldHM6IFt7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogJ015IEZpcnN0IGRhdGFzZXQnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAncmdiYSgxMTQsMTAyLDE4NiwwLjIpJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiAncmdiYSgxMTQsMTAyLDE4NiwxKScsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBbNjUsIDU5LCA5MCwgODEsIDU2LCA1NSwgNDBdXHJcbiAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgIGxhYmVsOiAnTXkgU2Vjb25kIGRhdGFzZXQnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAncmdiYSgxNTEsMTg3LDIwNSwwLjIpJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiAncmdiYSgxNTEsMTg3LDIwNSwxKScsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBbMjgsIDQ4LCA0MCwgMTksIDk2LCAyNywgMTAwXVxyXG4gICAgICAgICAgICB9XVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciByYWRhck9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIGxlZ2VuZDoge1xyXG4gICAgICAgICAgICAgICAgZGlzcGxheTogZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdmFyIHJhZGFyY3R4ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NoYXJ0anMtcmFkYXJjaGFydCcpLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICAgICAgdmFyIHJhZGFyQ2hhcnQgPSBuZXcgQ2hhcnQocmFkYXJjdHgsIHtcclxuICAgICAgICAgICAgZGF0YTogcmFkYXJEYXRhLFxyXG4gICAgICAgICAgICB0eXBlOiAncmFkYXInLFxyXG4gICAgICAgICAgICBvcHRpb25zOiByYWRhck9wdGlvbnNcclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9XHJcblxyXG59KSgpOyIsIi8vIENoYXJ0aXN0XHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgJChpbml0Q2hhcnRpc3RzKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0Q2hhcnRpc3RzKCkge1xyXG5cclxuICAgICAgICBpZiAodHlwZW9mIENoYXJ0aXN0ID09PSAndW5kZWZpbmVkJykgcmV0dXJuO1xyXG5cclxuICAgICAgICAvLyBCYXIgYmlwb2xhclxyXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgdmFyIGRhdGExID0ge1xyXG4gICAgICAgICAgICBsYWJlbHM6IFsnVzEnLCAnVzInLCAnVzMnLCAnVzQnLCAnVzUnLCAnVzYnLCAnVzcnLCAnVzgnLCAnVzknLCAnVzEwJ10sXHJcbiAgICAgICAgICAgIHNlcmllczogW1xyXG4gICAgICAgICAgICAgICAgWzEsIDIsIDQsIDgsIDYsIC0yLCAtMSwgLTQsIC02LCAtMl1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBvcHRpb25zMSA9IHtcclxuICAgICAgICAgICAgaGlnaDogMTAsXHJcbiAgICAgICAgICAgIGxvdzogLTEwLFxyXG4gICAgICAgICAgICBoZWlnaHQ6IDI4MCxcclxuICAgICAgICAgICAgYXhpc1g6IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsSW50ZXJwb2xhdGlvbkZuYzogZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGluZGV4ICUgMiA9PT0gMCA/IHZhbHVlIDogbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIG5ldyBDaGFydGlzdC5CYXIoJyNjdC1iYXIxJywgZGF0YTEsIG9wdGlvbnMxKTtcclxuXHJcbiAgICAgICAgLy8gQmFyIEhvcml6b250YWxcclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgIG5ldyBDaGFydGlzdC5CYXIoJyNjdC1iYXIyJywge1xyXG4gICAgICAgICAgICBsYWJlbHM6IFsnTW9uZGF5JywgJ1R1ZXNkYXknLCAnV2VkbmVzZGF5JywgJ1RodXJzZGF5JywgJ0ZyaWRheScsICdTYXR1cmRheScsICdTdW5kYXknXSxcclxuICAgICAgICAgICAgc2VyaWVzOiBbXHJcbiAgICAgICAgICAgICAgICBbNSwgNCwgMywgNywgNSwgMTAsIDNdLFxyXG4gICAgICAgICAgICAgICAgWzMsIDIsIDksIDUsIDQsIDYsIDRdXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIHNlcmllc0JhckRpc3RhbmNlOiAxMCxcclxuICAgICAgICAgICAgcmV2ZXJzZURhdGE6IHRydWUsXHJcbiAgICAgICAgICAgIGhvcml6b250YWxCYXJzOiB0cnVlLFxyXG4gICAgICAgICAgICBoZWlnaHQ6IDI4MCxcclxuICAgICAgICAgICAgYXhpc1k6IHtcclxuICAgICAgICAgICAgICAgIG9mZnNldDogNzBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBMaW5lXHJcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICBuZXcgQ2hhcnRpc3QuTGluZSgnI2N0LWxpbmUxJywge1xyXG4gICAgICAgICAgICBsYWJlbHM6IFsnTW9uZGF5JywgJ1R1ZXNkYXknLCAnV2VkbmVzZGF5JywgJ1RodXJzZGF5JywgJ0ZyaWRheSddLFxyXG4gICAgICAgICAgICBzZXJpZXM6IFtcclxuICAgICAgICAgICAgICAgIFsxMiwgOSwgNywgOCwgNV0sXHJcbiAgICAgICAgICAgICAgICBbMiwgMSwgMy41LCA3LCAzXSxcclxuICAgICAgICAgICAgICAgIFsxLCAzLCA0LCA1LCA2XVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSwge1xyXG4gICAgICAgICAgICBmdWxsV2lkdGg6IHRydWUsXHJcbiAgICAgICAgICAgIGhlaWdodDogMjgwLFxyXG4gICAgICAgICAgICBjaGFydFBhZGRpbmc6IHtcclxuICAgICAgICAgICAgICAgIHJpZ2h0OiA0MFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG5cclxuICAgICAgICAvLyBTVkcgQW5pbWF0aW9uXHJcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAgICAgdmFyIGNoYXJ0MSA9IG5ldyBDaGFydGlzdC5MaW5lKCcjY3QtbGluZTMnLCB7XHJcbiAgICAgICAgICAgIGxhYmVsczogWydNb24nLCAnVHVlJywgJ1dlZCcsICdUaHUnLCAnRnJpJywgJ1NhdCddLFxyXG4gICAgICAgICAgICBzZXJpZXM6IFtcclxuICAgICAgICAgICAgICAgIFsxLCA1LCAyLCA1LCA0LCAzXSxcclxuICAgICAgICAgICAgICAgIFsyLCAzLCA0LCA4LCAxLCAyXSxcclxuICAgICAgICAgICAgICAgIFs1LCA0LCAzLCAyLCAxLCAwLjVdXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIGxvdzogMCxcclxuICAgICAgICAgICAgc2hvd0FyZWE6IHRydWUsXHJcbiAgICAgICAgICAgIHNob3dQb2ludDogZmFsc2UsXHJcbiAgICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZSxcclxuICAgICAgICAgICAgaGVpZ2h0OiAzMDBcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY2hhcnQxLm9uKCdkcmF3JywgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICBpZiAoZGF0YS50eXBlID09PSAnbGluZScgfHwgZGF0YS50eXBlID09PSAnYXJlYScpIHtcclxuICAgICAgICAgICAgICAgIGRhdGEuZWxlbWVudC5hbmltYXRlKHtcclxuICAgICAgICAgICAgICAgICAgICBkOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlZ2luOiAyMDAwICogZGF0YS5pbmRleCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHVyOiAyMDAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmcm9tOiBkYXRhLnBhdGguY2xvbmUoKS5zY2FsZSgxLCAwKS50cmFuc2xhdGUoMCwgZGF0YS5jaGFydFJlY3QuaGVpZ2h0KCkpLnN0cmluZ2lmeSgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0bzogZGF0YS5wYXRoLmNsb25lKCkuc3RyaW5naWZ5KCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogQ2hhcnRpc3QuU3ZnLkVhc2luZy5lYXNlT3V0UXVpbnRcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuXHJcbiAgICAgICAgLy8gU2xpbSBhbmltYXRpb25cclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuXHJcbiAgICAgICAgdmFyIGNoYXJ0ID0gbmV3IENoYXJ0aXN0LkxpbmUoJyNjdC1saW5lMicsIHtcclxuICAgICAgICAgICAgbGFiZWxzOiBbJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5JywgJzEwJywgJzExJywgJzEyJ10sXHJcbiAgICAgICAgICAgIHNlcmllczogW1xyXG4gICAgICAgICAgICAgICAgWzEyLCA5LCA3LCA4LCA1LCA0LCA2LCAyLCAzLCAzLCA0LCA2XSxcclxuICAgICAgICAgICAgICAgIFs0LCA1LCAzLCA3LCAzLCA1LCA1LCAzLCA0LCA0LCA1LCA1XSxcclxuICAgICAgICAgICAgICAgIFs1LCAzLCA0LCA1LCA2LCAzLCAzLCA0LCA1LCA2LCAzLCA0XSxcclxuICAgICAgICAgICAgICAgIFszLCA0LCA1LCA2LCA3LCA2LCA0LCA1LCA2LCA3LCA2LCAzXVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSwge1xyXG4gICAgICAgICAgICBsb3c6IDAsXHJcbiAgICAgICAgICAgIGhlaWdodDogMzAwXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIExldCdzIHB1dCBhIHNlcXVlbmNlIG51bWJlciBhc2lkZSBzbyB3ZSBjYW4gdXNlIGl0IGluIHRoZSBldmVudCBjYWxsYmFja3NcclxuICAgICAgICB2YXIgc2VxID0gMCxcclxuICAgICAgICAgICAgZGVsYXlzID0gODAsXHJcbiAgICAgICAgICAgIGR1cmF0aW9ucyA9IDUwMDtcclxuXHJcbiAgICAgICAgLy8gT25jZSB0aGUgY2hhcnQgaXMgZnVsbHkgY3JlYXRlZCB3ZSByZXNldCB0aGUgc2VxdWVuY2VcclxuICAgICAgICBjaGFydC5vbignY3JlYXRlZCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBzZXEgPSAwO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBPbiBlYWNoIGRyYXduIGVsZW1lbnQgYnkgQ2hhcnRpc3Qgd2UgdXNlIHRoZSBDaGFydGlzdC5TdmcgQVBJIHRvIHRyaWdnZXIgU01JTCBhbmltYXRpb25zXHJcbiAgICAgICAgY2hhcnQub24oJ2RyYXcnLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgIHNlcSsrO1xyXG5cclxuICAgICAgICAgICAgaWYgKGRhdGEudHlwZSA9PT0gJ2xpbmUnKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgZHJhd24gZWxlbWVudCBpcyBhIGxpbmUgd2UgZG8gYSBzaW1wbGUgb3BhY2l0eSBmYWRlIGluLiBUaGlzIGNvdWxkIGFsc28gYmUgYWNoaWV2ZWQgdXNpbmcgQ1NTMyBhbmltYXRpb25zLlxyXG4gICAgICAgICAgICAgICAgZGF0YS5lbGVtZW50LmFuaW1hdGUoe1xyXG4gICAgICAgICAgICAgICAgICAgIG9wYWNpdHk6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhlIGRlbGF5IHdoZW4gd2UgbGlrZSB0byBzdGFydCB0aGUgYW5pbWF0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlZ2luOiBzZXEgKiBkZWxheXMgKyAxMDAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBEdXJhdGlvbiBvZiB0aGUgYW5pbWF0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1cjogZHVyYXRpb25zLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgdmFsdWUgd2hlcmUgdGhlIGFuaW1hdGlvbiBzaG91bGQgc3RhcnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgZnJvbTogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhlIHZhbHVlIHdoZXJlIGl0IHNob3VsZCBlbmRcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG86IDFcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChkYXRhLnR5cGUgPT09ICdsYWJlbCcgJiYgZGF0YS5heGlzID09PSAneCcpIHtcclxuICAgICAgICAgICAgICAgIGRhdGEuZWxlbWVudC5hbmltYXRlKHtcclxuICAgICAgICAgICAgICAgICAgICB5OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlZ2luOiBzZXEgKiBkZWxheXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1cjogZHVyYXRpb25zLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmcm9tOiBkYXRhLnkgKyAxMDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvOiBkYXRhLnksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlIGNhbiBzcGVjaWZ5IGFuIGVhc2luZyBmdW5jdGlvbiBmcm9tIENoYXJ0aXN0LlN2Zy5FYXNpbmdcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnZWFzZU91dFF1YXJ0J1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGRhdGEudHlwZSA9PT0gJ2xhYmVsJyAmJiBkYXRhLmF4aXMgPT09ICd5Jykge1xyXG4gICAgICAgICAgICAgICAgZGF0YS5lbGVtZW50LmFuaW1hdGUoe1xyXG4gICAgICAgICAgICAgICAgICAgIHg6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmVnaW46IHNlcSAqIGRlbGF5cyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHVyOiBkdXJhdGlvbnMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyb206IGRhdGEueCAtIDEwMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG86IGRhdGEueCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnZWFzZU91dFF1YXJ0J1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGRhdGEudHlwZSA9PT0gJ3BvaW50Jykge1xyXG4gICAgICAgICAgICAgICAgZGF0YS5lbGVtZW50LmFuaW1hdGUoe1xyXG4gICAgICAgICAgICAgICAgICAgIHgxOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlZ2luOiBzZXEgKiBkZWxheXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1cjogZHVyYXRpb25zLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmcm9tOiBkYXRhLnggLSAxMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG86IGRhdGEueCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnZWFzZU91dFF1YXJ0J1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgeDI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmVnaW46IHNlcSAqIGRlbGF5cyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHVyOiBkdXJhdGlvbnMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyb206IGRhdGEueCAtIDEwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0bzogZGF0YS54LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlYXNpbmc6ICdlYXNlT3V0UXVhcnQnXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBvcGFjaXR5OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlZ2luOiBzZXEgKiBkZWxheXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1cjogZHVyYXRpb25zLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmcm9tOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0bzogMSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnZWFzZU91dFF1YXJ0J1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGRhdGEudHlwZSA9PT0gJ2dyaWQnKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBVc2luZyBkYXRhLmF4aXMgd2UgZ2V0IHggb3IgeSB3aGljaCB3ZSBjYW4gdXNlIHRvIGNvbnN0cnVjdCBvdXIgYW5pbWF0aW9uIGRlZmluaXRpb24gb2JqZWN0c1xyXG4gICAgICAgICAgICAgICAgdmFyIHBvczFBbmltYXRpb24gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYmVnaW46IHNlcSAqIGRlbGF5cyxcclxuICAgICAgICAgICAgICAgICAgICBkdXI6IGR1cmF0aW9ucyxcclxuICAgICAgICAgICAgICAgICAgICBmcm9tOiBkYXRhW2RhdGEuYXhpcy51bml0cy5wb3MgKyAnMSddIC0gMzAsXHJcbiAgICAgICAgICAgICAgICAgICAgdG86IGRhdGFbZGF0YS5heGlzLnVuaXRzLnBvcyArICcxJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnZWFzZU91dFF1YXJ0J1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgcG9zMkFuaW1hdGlvbiA9IHtcclxuICAgICAgICAgICAgICAgICAgICBiZWdpbjogc2VxICogZGVsYXlzLFxyXG4gICAgICAgICAgICAgICAgICAgIGR1cjogZHVyYXRpb25zLFxyXG4gICAgICAgICAgICAgICAgICAgIGZyb206IGRhdGFbZGF0YS5heGlzLnVuaXRzLnBvcyArICcyJ10gLSAxMDAsXHJcbiAgICAgICAgICAgICAgICAgICAgdG86IGRhdGFbZGF0YS5heGlzLnVuaXRzLnBvcyArICcyJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnZWFzZU91dFF1YXJ0J1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgYW5pbWF0aW9ucyA9IHt9O1xyXG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uc1tkYXRhLmF4aXMudW5pdHMucG9zICsgJzEnXSA9IHBvczFBbmltYXRpb247XHJcbiAgICAgICAgICAgICAgICBhbmltYXRpb25zW2RhdGEuYXhpcy51bml0cy5wb3MgKyAnMiddID0gcG9zMkFuaW1hdGlvbjtcclxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbnNbJ29wYWNpdHknXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICBiZWdpbjogc2VxICogZGVsYXlzLFxyXG4gICAgICAgICAgICAgICAgICAgIGR1cjogZHVyYXRpb25zLFxyXG4gICAgICAgICAgICAgICAgICAgIGZyb206IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgdG86IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnZWFzZU91dFF1YXJ0J1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBkYXRhLmVsZW1lbnQuYW5pbWF0ZShhbmltYXRpb25zKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBGb3IgdGhlIHNha2Ugb2YgdGhlIGV4YW1wbGUgd2UgdXBkYXRlIHRoZSBjaGFydCBldmVyeSB0aW1lIGl0J3MgY3JlYXRlZCB3aXRoIGEgZGVsYXkgb2YgMTAgc2Vjb25kc1xyXG4gICAgICAgIGNoYXJ0Lm9uKCdjcmVhdGVkJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICh3aW5kb3cuX19leGFtcGxlQW5pbWF0ZVRpbWVvdXQpIHtcclxuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh3aW5kb3cuX19leGFtcGxlQW5pbWF0ZVRpbWVvdXQpO1xyXG4gICAgICAgICAgICAgICAgd2luZG93Ll9fZXhhbXBsZUFuaW1hdGVUaW1lb3V0ID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB3aW5kb3cuX19leGFtcGxlQW5pbWF0ZVRpbWVvdXQgPSBzZXRUaW1lb3V0KGNoYXJ0LnVwZGF0ZS5iaW5kKGNoYXJ0KSwgMTIwMDApO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH1cclxuXHJcbn0pKCk7IiwiLy8gRWFzeXBpZSBjaGFydCBMb2FkZXJcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAkKGluaXRFYXN5UGllQ2hhcnQpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRFYXN5UGllQ2hhcnQoKSB7XHJcblxyXG4gICAgICAgIGlmICghJC5mbi5lYXN5UGllQ2hhcnQpIHJldHVybjtcclxuXHJcbiAgICAgICAgLy8gVXNhZ2UgdmlhIGRhdGEgYXR0cmlidXRlc1xyXG4gICAgICAgIC8vIDxkaXYgY2xhc3M9XCJlYXN5cGllLWNoYXJ0XCIgZGF0YS1lYXN5cGllY2hhcnQgZGF0YS1wZXJjZW50PVwiWFwiIGRhdGEtb3B0aW9uTmFtZT1cInZhbHVlXCI+PC9kaXY+XHJcbiAgICAgICAgJCgnW2RhdGEtZWFzeXBpZWNoYXJ0XScpLmVhY2goZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciAkZWxlbSA9ICQodGhpcyk7XHJcbiAgICAgICAgICAgIHZhciBvcHRpb25zID0gJGVsZW0uZGF0YSgpO1xyXG4gICAgICAgICAgICAkZWxlbS5lYXN5UGllQ2hhcnQob3B0aW9ucyB8fCB7fSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIHByb2dyYW1tYXRpYyB1c2FnZVxyXG4gICAgICAgIHZhciBwaWVPcHRpb25zMSA9IHtcclxuICAgICAgICAgICAgYW5pbWF0ZToge1xyXG4gICAgICAgICAgICAgICAgZHVyYXRpb246IDgwMCxcclxuICAgICAgICAgICAgICAgIGVuYWJsZWQ6IHRydWVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYmFyQ29sb3I6IEFQUF9DT0xPUlNbJ3N1Y2Nlc3MnXSxcclxuICAgICAgICAgICAgdHJhY2tDb2xvcjogZmFsc2UsXHJcbiAgICAgICAgICAgIHNjYWxlQ29sb3I6IGZhbHNlLFxyXG4gICAgICAgICAgICBsaW5lV2lkdGg6IDEwLFxyXG4gICAgICAgICAgICBsaW5lQ2FwOiAnY2lyY2xlJ1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgJCgnI2Vhc3lwaWUxJykuZWFzeVBpZUNoYXJ0KHBpZU9wdGlvbnMxKTtcclxuXHJcbiAgICAgICAgdmFyIHBpZU9wdGlvbnMyID0ge1xyXG4gICAgICAgICAgICBhbmltYXRlOiB7XHJcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogODAwLFxyXG4gICAgICAgICAgICAgICAgZW5hYmxlZDogdHJ1ZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBiYXJDb2xvcjogQVBQX0NPTE9SU1snd2FybmluZyddLFxyXG4gICAgICAgICAgICB0cmFja0NvbG9yOiBmYWxzZSxcclxuICAgICAgICAgICAgc2NhbGVDb2xvcjogZmFsc2UsXHJcbiAgICAgICAgICAgIGxpbmVXaWR0aDogNCxcclxuICAgICAgICAgICAgbGluZUNhcDogJ2NpcmNsZSdcclxuICAgICAgICB9O1xyXG4gICAgICAgICQoJyNlYXN5cGllMicpLmVhc3lQaWVDaGFydChwaWVPcHRpb25zMik7XHJcblxyXG4gICAgICAgIHZhciBwaWVPcHRpb25zMyA9IHtcclxuICAgICAgICAgICAgYW5pbWF0ZToge1xyXG4gICAgICAgICAgICAgICAgZHVyYXRpb246IDgwMCxcclxuICAgICAgICAgICAgICAgIGVuYWJsZWQ6IHRydWVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYmFyQ29sb3I6IEFQUF9DT0xPUlNbJ2RhbmdlciddLFxyXG4gICAgICAgICAgICB0cmFja0NvbG9yOiBmYWxzZSxcclxuICAgICAgICAgICAgc2NhbGVDb2xvcjogQVBQX0NPTE9SU1snZ3JheSddLFxyXG4gICAgICAgICAgICBsaW5lV2lkdGg6IDE1LFxyXG4gICAgICAgICAgICBsaW5lQ2FwOiAnY2lyY2xlJ1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgJCgnI2Vhc3lwaWUzJykuZWFzeVBpZUNoYXJ0KHBpZU9wdGlvbnMzKTtcclxuXHJcbiAgICAgICAgdmFyIHBpZU9wdGlvbnM0ID0ge1xyXG4gICAgICAgICAgICBhbmltYXRlOiB7XHJcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogODAwLFxyXG4gICAgICAgICAgICAgICAgZW5hYmxlZDogdHJ1ZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBiYXJDb2xvcjogQVBQX0NPTE9SU1snZGFuZ2VyJ10sXHJcbiAgICAgICAgICAgIHRyYWNrQ29sb3I6IEFQUF9DT0xPUlNbJ3llbGxvdyddLFxyXG4gICAgICAgICAgICBzY2FsZUNvbG9yOiBBUFBfQ09MT1JTWydncmF5LWRhcmsnXSxcclxuICAgICAgICAgICAgbGluZVdpZHRoOiAxNSxcclxuICAgICAgICAgICAgbGluZUNhcDogJ2NpcmNsZSdcclxuICAgICAgICB9O1xyXG4gICAgICAgICQoJyNlYXN5cGllNCcpLmVhc3lQaWVDaGFydChwaWVPcHRpb25zNCk7XHJcblxyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvLyBDSEFSVCBTUExJTkVcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoaW5pdEZsb3RTcGxpbmUpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRGbG90U3BsaW5lKCkge1xyXG5cclxuICAgICAgICB2YXIgZGF0YSA9IFt7XHJcbiAgICAgICAgICAgIFwibGFiZWxcIjogXCJVbmlxdWVzXCIsXHJcbiAgICAgICAgICAgIFwiY29sb3JcIjogXCIjNzY4Mjk0XCIsXHJcbiAgICAgICAgICAgIFwiZGF0YVwiOiBbXHJcbiAgICAgICAgICAgICAgICBbXCJNYXJcIiwgNzBdLFxyXG4gICAgICAgICAgICAgICAgW1wiQXByXCIsIDg1XSxcclxuICAgICAgICAgICAgICAgIFtcIk1heVwiLCA1OV0sXHJcbiAgICAgICAgICAgICAgICBbXCJKdW5cIiwgOTNdLFxyXG4gICAgICAgICAgICAgICAgW1wiSnVsXCIsIDY2XSxcclxuICAgICAgICAgICAgICAgIFtcIkF1Z1wiLCA4Nl0sXHJcbiAgICAgICAgICAgICAgICBbXCJTZXBcIiwgNjBdXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIFwibGFiZWxcIjogXCJSZWN1cnJlbnRcIixcclxuICAgICAgICAgICAgXCJjb2xvclwiOiBcIiMxZjkyZmVcIixcclxuICAgICAgICAgICAgXCJkYXRhXCI6IFtcclxuICAgICAgICAgICAgICAgIFtcIk1hclwiLCAyMV0sXHJcbiAgICAgICAgICAgICAgICBbXCJBcHJcIiwgMTJdLFxyXG4gICAgICAgICAgICAgICAgW1wiTWF5XCIsIDI3XSxcclxuICAgICAgICAgICAgICAgIFtcIkp1blwiLCAyNF0sXHJcbiAgICAgICAgICAgICAgICBbXCJKdWxcIiwgMTZdLFxyXG4gICAgICAgICAgICAgICAgW1wiQXVnXCIsIDM5XSxcclxuICAgICAgICAgICAgICAgIFtcIlNlcFwiLCAxNV1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH1dO1xyXG5cclxuICAgICAgICB2YXIgZGF0YXYyID0gW3tcclxuICAgICAgICAgICAgXCJsYWJlbFwiOiBcIkhvdXJzXCIsXHJcbiAgICAgICAgICAgIFwiY29sb3JcIjogXCIjMjNiN2U1XCIsXHJcbiAgICAgICAgICAgIFwiZGF0YVwiOiBbXHJcbiAgICAgICAgICAgICAgICBbXCJKYW5cIiwgNzBdLFxyXG4gICAgICAgICAgICAgICAgW1wiRmViXCIsIDIwXSxcclxuICAgICAgICAgICAgICAgIFtcIk1hclwiLCA3MF0sXHJcbiAgICAgICAgICAgICAgICBbXCJBcHJcIiwgODVdLFxyXG4gICAgICAgICAgICAgICAgW1wiTWF5XCIsIDU5XSxcclxuICAgICAgICAgICAgICAgIFtcIkp1blwiLCA5M10sXHJcbiAgICAgICAgICAgICAgICBbXCJKdWxcIiwgNjZdLFxyXG4gICAgICAgICAgICAgICAgW1wiQXVnXCIsIDg2XSxcclxuICAgICAgICAgICAgICAgIFtcIlNlcFwiLCA2MF0sXHJcbiAgICAgICAgICAgICAgICBbXCJPY3RcIiwgNjBdLFxyXG4gICAgICAgICAgICAgICAgW1wiTm92XCIsIDEyXSxcclxuICAgICAgICAgICAgICAgIFtcIkRlY1wiLCA1MF1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgXCJsYWJlbFwiOiBcIkNvbW1pdHNcIixcclxuICAgICAgICAgICAgXCJjb2xvclwiOiBcIiM3MjY2YmFcIixcclxuICAgICAgICAgICAgXCJkYXRhXCI6IFtcclxuICAgICAgICAgICAgICAgIFtcIkphblwiLCAyMF0sXHJcbiAgICAgICAgICAgICAgICBbXCJGZWJcIiwgNzBdLFxyXG4gICAgICAgICAgICAgICAgW1wiTWFyXCIsIDMwXSxcclxuICAgICAgICAgICAgICAgIFtcIkFwclwiLCA1MF0sXHJcbiAgICAgICAgICAgICAgICBbXCJNYXlcIiwgODVdLFxyXG4gICAgICAgICAgICAgICAgW1wiSnVuXCIsIDQzXSxcclxuICAgICAgICAgICAgICAgIFtcIkp1bFwiLCA5Nl0sXHJcbiAgICAgICAgICAgICAgICBbXCJBdWdcIiwgMzZdLFxyXG4gICAgICAgICAgICAgICAgW1wiU2VwXCIsIDgwXSxcclxuICAgICAgICAgICAgICAgIFtcIk9jdFwiLCAxMF0sXHJcbiAgICAgICAgICAgICAgICBbXCJOb3ZcIiwgNzJdLFxyXG4gICAgICAgICAgICAgICAgW1wiRGVjXCIsIDMxXVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfV07XHJcblxyXG4gICAgICAgIHZhciBkYXRhdjMgPSBbe1xyXG4gICAgICAgICAgICBcImxhYmVsXCI6IFwiSG9tZVwiLFxyXG4gICAgICAgICAgICBcImNvbG9yXCI6IFwiIzFiYTNjZFwiLFxyXG4gICAgICAgICAgICBcImRhdGFcIjogW1xyXG4gICAgICAgICAgICAgICAgW1wiMVwiLCAzOF0sXHJcbiAgICAgICAgICAgICAgICBbXCIyXCIsIDQwXSxcclxuICAgICAgICAgICAgICAgIFtcIjNcIiwgNDJdLFxyXG4gICAgICAgICAgICAgICAgW1wiNFwiLCA0OF0sXHJcbiAgICAgICAgICAgICAgICBbXCI1XCIsIDUwXSxcclxuICAgICAgICAgICAgICAgIFtcIjZcIiwgNzBdLFxyXG4gICAgICAgICAgICAgICAgW1wiN1wiLCAxNDVdLFxyXG4gICAgICAgICAgICAgICAgW1wiOFwiLCA3MF0sXHJcbiAgICAgICAgICAgICAgICBbXCI5XCIsIDU5XSxcclxuICAgICAgICAgICAgICAgIFtcIjEwXCIsIDQ4XSxcclxuICAgICAgICAgICAgICAgIFtcIjExXCIsIDM4XSxcclxuICAgICAgICAgICAgICAgIFtcIjEyXCIsIDI5XSxcclxuICAgICAgICAgICAgICAgIFtcIjEzXCIsIDMwXSxcclxuICAgICAgICAgICAgICAgIFtcIjE0XCIsIDIyXSxcclxuICAgICAgICAgICAgICAgIFtcIjE1XCIsIDI4XVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSwge1xyXG4gICAgICAgICAgICBcImxhYmVsXCI6IFwiT3ZlcmFsbFwiLFxyXG4gICAgICAgICAgICBcImNvbG9yXCI6IFwiIzNhM2Y1MVwiLFxyXG4gICAgICAgICAgICBcImRhdGFcIjogW1xyXG4gICAgICAgICAgICAgICAgW1wiMVwiLCAxNl0sXHJcbiAgICAgICAgICAgICAgICBbXCIyXCIsIDE4XSxcclxuICAgICAgICAgICAgICAgIFtcIjNcIiwgMTddLFxyXG4gICAgICAgICAgICAgICAgW1wiNFwiLCAxNl0sXHJcbiAgICAgICAgICAgICAgICBbXCI1XCIsIDMwXSxcclxuICAgICAgICAgICAgICAgIFtcIjZcIiwgMTEwXSxcclxuICAgICAgICAgICAgICAgIFtcIjdcIiwgMTldLFxyXG4gICAgICAgICAgICAgICAgW1wiOFwiLCAxOF0sXHJcbiAgICAgICAgICAgICAgICBbXCI5XCIsIDExMF0sXHJcbiAgICAgICAgICAgICAgICBbXCIxMFwiLCAxOV0sXHJcbiAgICAgICAgICAgICAgICBbXCIxMVwiLCAxNl0sXHJcbiAgICAgICAgICAgICAgICBbXCIxMlwiLCAxMF0sXHJcbiAgICAgICAgICAgICAgICBbXCIxM1wiLCAyMF0sXHJcbiAgICAgICAgICAgICAgICBbXCIxNFwiLCAxMF0sXHJcbiAgICAgICAgICAgICAgICBbXCIxNVwiLCAyMF1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH1dO1xyXG5cclxuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgc2VyaWVzOiB7XHJcbiAgICAgICAgICAgICAgICBsaW5lczoge1xyXG4gICAgICAgICAgICAgICAgICAgIHNob3c6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgcG9pbnRzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2hvdzogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICByYWRpdXM6IDRcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBzcGxpbmVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2hvdzogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICB0ZW5zaW9uOiAwLjQsXHJcbiAgICAgICAgICAgICAgICAgICAgbGluZVdpZHRoOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIGZpbGw6IDAuNVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBncmlkOiB7XHJcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogJyNlZWUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyV2lkdGg6IDEsXHJcbiAgICAgICAgICAgICAgICBob3ZlcmFibGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZmNmY2ZjJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0b29sdGlwOiB0cnVlLFxyXG4gICAgICAgICAgICB0b29sdGlwT3B0czoge1xyXG4gICAgICAgICAgICAgICAgY29udGVudDogZnVuY3Rpb24obGFiZWwsIHgsIHkpIHsgcmV0dXJuIHggKyAnIDogJyArIHk7IH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgeGF4aXM6IHtcclxuICAgICAgICAgICAgICAgIHRpY2tDb2xvcjogJyNmY2ZjZmMnLFxyXG4gICAgICAgICAgICAgICAgbW9kZTogJ2NhdGVnb3JpZXMnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHlheGlzOiB7XHJcbiAgICAgICAgICAgICAgICBtaW46IDAsXHJcbiAgICAgICAgICAgICAgICBtYXg6IDE1MCwgLy8gb3B0aW9uYWw6IHVzZSBpdCBmb3IgYSBjbGVhciByZXByZXNldGF0aW9uXHJcbiAgICAgICAgICAgICAgICB0aWNrQ29sb3I6ICcjZWVlJyxcclxuICAgICAgICAgICAgICAgIC8vcG9zaXRpb246ICdyaWdodCcgb3IgJ2xlZnQnLFxyXG4gICAgICAgICAgICAgICAgdGlja0Zvcm1hdHRlcjogZnVuY3Rpb24odikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2IC8qICsgJyB2aXNpdG9ycycqLyA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNoYWRvd1NpemU6IDBcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgY2hhcnQgPSAkKCcuY2hhcnQtc3BsaW5lJyk7XHJcbiAgICAgICAgaWYgKGNoYXJ0Lmxlbmd0aClcclxuICAgICAgICAgICAgJC5wbG90KGNoYXJ0LCBkYXRhLCBvcHRpb25zKTtcclxuXHJcbiAgICAgICAgdmFyIGNoYXJ0djIgPSAkKCcuY2hhcnQtc3BsaW5ldjInKTtcclxuICAgICAgICBpZiAoY2hhcnR2Mi5sZW5ndGgpXHJcbiAgICAgICAgICAgICQucGxvdChjaGFydHYyLCBkYXRhdjIsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgICB2YXIgY2hhcnR2MyA9ICQoJy5jaGFydC1zcGxpbmV2MycpO1xyXG4gICAgICAgIGlmIChjaGFydHYzLmxlbmd0aClcclxuICAgICAgICAgICAgJC5wbG90KGNoYXJ0djMsIGRhdGF2Mywgb3B0aW9ucyk7XHJcblxyXG4gICAgfVxyXG5cclxufSkoKTtcclxuXHJcbi8vIENIQVJUIEFSRUFcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuXHJcbiAgICAkKGluaXRGbG90QXJlYSlcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0RmxvdEFyZWEoKSB7XHJcblxyXG4gICAgICAgIHZhciBkYXRhID0gW3tcclxuICAgICAgICAgICAgXCJsYWJlbFwiOiBcIlVuaXF1ZXNcIixcclxuICAgICAgICAgICAgXCJjb2xvclwiOiBcIiNhYWQ4NzRcIixcclxuICAgICAgICAgICAgXCJkYXRhXCI6IFtcclxuICAgICAgICAgICAgICAgIFtcIk1hclwiLCA1MF0sXHJcbiAgICAgICAgICAgICAgICBbXCJBcHJcIiwgODRdLFxyXG4gICAgICAgICAgICAgICAgW1wiTWF5XCIsIDUyXSxcclxuICAgICAgICAgICAgICAgIFtcIkp1blwiLCA4OF0sXHJcbiAgICAgICAgICAgICAgICBbXCJKdWxcIiwgNjldLFxyXG4gICAgICAgICAgICAgICAgW1wiQXVnXCIsIDkyXSxcclxuICAgICAgICAgICAgICAgIFtcIlNlcFwiLCA1OF1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgXCJsYWJlbFwiOiBcIlJlY3VycmVudFwiLFxyXG4gICAgICAgICAgICBcImNvbG9yXCI6IFwiIzdkYzdkZlwiLFxyXG4gICAgICAgICAgICBcImRhdGFcIjogW1xyXG4gICAgICAgICAgICAgICAgW1wiTWFyXCIsIDEzXSxcclxuICAgICAgICAgICAgICAgIFtcIkFwclwiLCA0NF0sXHJcbiAgICAgICAgICAgICAgICBbXCJNYXlcIiwgNDRdLFxyXG4gICAgICAgICAgICAgICAgW1wiSnVuXCIsIDI3XSxcclxuICAgICAgICAgICAgICAgIFtcIkp1bFwiLCAzOF0sXHJcbiAgICAgICAgICAgICAgICBbXCJBdWdcIiwgMTFdLFxyXG4gICAgICAgICAgICAgICAgW1wiU2VwXCIsIDM5XVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfV07XHJcblxyXG4gICAgICAgIHZhciBvcHRpb25zID0ge1xyXG4gICAgICAgICAgICBzZXJpZXM6IHtcclxuICAgICAgICAgICAgICAgIGxpbmVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2hvdzogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBmaWxsOiAwLjhcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBwb2ludHM6IHtcclxuICAgICAgICAgICAgICAgICAgICBzaG93OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIHJhZGl1czogNFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBncmlkOiB7XHJcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogJyNlZWUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyV2lkdGg6IDEsXHJcbiAgICAgICAgICAgICAgICBob3ZlcmFibGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZmNmY2ZjJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0b29sdGlwOiB0cnVlLFxyXG4gICAgICAgICAgICB0b29sdGlwT3B0czoge1xyXG4gICAgICAgICAgICAgICAgY29udGVudDogZnVuY3Rpb24obGFiZWwsIHgsIHkpIHsgcmV0dXJuIHggKyAnIDogJyArIHk7IH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgeGF4aXM6IHtcclxuICAgICAgICAgICAgICAgIHRpY2tDb2xvcjogJyNmY2ZjZmMnLFxyXG4gICAgICAgICAgICAgICAgbW9kZTogJ2NhdGVnb3JpZXMnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHlheGlzOiB7XHJcbiAgICAgICAgICAgICAgICBtaW46IDAsXHJcbiAgICAgICAgICAgICAgICB0aWNrQ29sb3I6ICcjZWVlJyxcclxuICAgICAgICAgICAgICAgIC8vIHBvc2l0aW9uOiAncmlnaHQnIG9yICdsZWZ0J1xyXG4gICAgICAgICAgICAgICAgdGlja0Zvcm1hdHRlcjogZnVuY3Rpb24odikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2ICsgJyB2aXNpdG9ycyc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNoYWRvd1NpemU6IDBcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgY2hhcnQgPSAkKCcuY2hhcnQtYXJlYScpO1xyXG4gICAgICAgIGlmIChjaGFydC5sZW5ndGgpXHJcbiAgICAgICAgICAgICQucGxvdChjaGFydCwgZGF0YSwgb3B0aW9ucyk7XHJcblxyXG4gICAgfVxyXG5cclxufSkoKTtcclxuXHJcbi8vIENIQVJUIEJBUlxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG5cclxuICAgICQoaW5pdEZsb3RCYXIpXHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdEZsb3RCYXIoKSB7XHJcblxyXG4gICAgICAgIHZhciBkYXRhID0gW3tcclxuICAgICAgICAgICAgXCJsYWJlbFwiOiBcIlNhbGVzXCIsXHJcbiAgICAgICAgICAgIFwiY29sb3JcIjogXCIjOWNkMTU5XCIsXHJcbiAgICAgICAgICAgIFwiZGF0YVwiOiBbXHJcbiAgICAgICAgICAgICAgICBbXCJKYW5cIiwgMjddLFxyXG4gICAgICAgICAgICAgICAgW1wiRmViXCIsIDgyXSxcclxuICAgICAgICAgICAgICAgIFtcIk1hclwiLCA1Nl0sXHJcbiAgICAgICAgICAgICAgICBbXCJBcHJcIiwgMTRdLFxyXG4gICAgICAgICAgICAgICAgW1wiTWF5XCIsIDI4XSxcclxuICAgICAgICAgICAgICAgIFtcIkp1blwiLCA3N10sXHJcbiAgICAgICAgICAgICAgICBbXCJKdWxcIiwgMjNdLFxyXG4gICAgICAgICAgICAgICAgW1wiQXVnXCIsIDQ5XSxcclxuICAgICAgICAgICAgICAgIFtcIlNlcFwiLCA4MV0sXHJcbiAgICAgICAgICAgICAgICBbXCJPY3RcIiwgMjBdXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9XTtcclxuXHJcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIHNlcmllczoge1xyXG4gICAgICAgICAgICAgICAgYmFyczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGFsaWduOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgICAgICBsaW5lV2lkdGg6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgc2hvdzogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBiYXJXaWR0aDogMC42LFxyXG4gICAgICAgICAgICAgICAgICAgIGZpbGw6IDAuOVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBncmlkOiB7XHJcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogJyNlZWUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyV2lkdGg6IDEsXHJcbiAgICAgICAgICAgICAgICBob3ZlcmFibGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZmNmY2ZjJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0b29sdGlwOiB0cnVlLFxyXG4gICAgICAgICAgICB0b29sdGlwT3B0czoge1xyXG4gICAgICAgICAgICAgICAgY29udGVudDogZnVuY3Rpb24obGFiZWwsIHgsIHkpIHsgcmV0dXJuIHggKyAnIDogJyArIHk7IH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgeGF4aXM6IHtcclxuICAgICAgICAgICAgICAgIHRpY2tDb2xvcjogJyNmY2ZjZmMnLFxyXG4gICAgICAgICAgICAgICAgbW9kZTogJ2NhdGVnb3JpZXMnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHlheGlzOiB7XHJcbiAgICAgICAgICAgICAgICAvLyBwb3NpdGlvbjogJ3JpZ2h0JyBvciAnbGVmdCdcclxuICAgICAgICAgICAgICAgIHRpY2tDb2xvcjogJyNlZWUnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNoYWRvd1NpemU6IDBcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgY2hhcnQgPSAkKCcuY2hhcnQtYmFyJyk7XHJcbiAgICAgICAgaWYgKGNoYXJ0Lmxlbmd0aClcclxuICAgICAgICAgICAgJC5wbG90KGNoYXJ0LCBkYXRhLCBvcHRpb25zKTtcclxuXHJcbiAgICB9XHJcblxyXG59KSgpO1xyXG5cclxuXHJcbi8vIENIQVJUIEJBUiBTVEFDS0VEXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcblxyXG4gICAgJChpbml0RmxvdEJhclN0YWNrZWQpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRGbG90QmFyU3RhY2tlZCgpIHtcclxuXHJcbiAgICAgICAgdmFyIGRhdGEgPSBbe1xyXG4gICAgICAgICAgICBcImxhYmVsXCI6IFwiVHdlZXRzXCIsXHJcbiAgICAgICAgICAgIFwiY29sb3JcIjogXCIjNTFiZmYyXCIsXHJcbiAgICAgICAgICAgIFwiZGF0YVwiOiBbXHJcbiAgICAgICAgICAgICAgICBbXCJKYW5cIiwgNTZdLFxyXG4gICAgICAgICAgICAgICAgW1wiRmViXCIsIDgxXSxcclxuICAgICAgICAgICAgICAgIFtcIk1hclwiLCA5N10sXHJcbiAgICAgICAgICAgICAgICBbXCJBcHJcIiwgNDRdLFxyXG4gICAgICAgICAgICAgICAgW1wiTWF5XCIsIDI0XSxcclxuICAgICAgICAgICAgICAgIFtcIkp1blwiLCA4NV0sXHJcbiAgICAgICAgICAgICAgICBbXCJKdWxcIiwgOTRdLFxyXG4gICAgICAgICAgICAgICAgW1wiQXVnXCIsIDc4XSxcclxuICAgICAgICAgICAgICAgIFtcIlNlcFwiLCA1Ml0sXHJcbiAgICAgICAgICAgICAgICBbXCJPY3RcIiwgMTddLFxyXG4gICAgICAgICAgICAgICAgW1wiTm92XCIsIDkwXSxcclxuICAgICAgICAgICAgICAgIFtcIkRlY1wiLCA2Ml1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgXCJsYWJlbFwiOiBcIkxpa2VzXCIsXHJcbiAgICAgICAgICAgIFwiY29sb3JcIjogXCIjNGE4ZWYxXCIsXHJcbiAgICAgICAgICAgIFwiZGF0YVwiOiBbXHJcbiAgICAgICAgICAgICAgICBbXCJKYW5cIiwgNjldLFxyXG4gICAgICAgICAgICAgICAgW1wiRmViXCIsIDEzNV0sXHJcbiAgICAgICAgICAgICAgICBbXCJNYXJcIiwgMTRdLFxyXG4gICAgICAgICAgICAgICAgW1wiQXByXCIsIDEwMF0sXHJcbiAgICAgICAgICAgICAgICBbXCJNYXlcIiwgMTAwXSxcclxuICAgICAgICAgICAgICAgIFtcIkp1blwiLCA2Ml0sXHJcbiAgICAgICAgICAgICAgICBbXCJKdWxcIiwgMTE1XSxcclxuICAgICAgICAgICAgICAgIFtcIkF1Z1wiLCAyMl0sXHJcbiAgICAgICAgICAgICAgICBbXCJTZXBcIiwgMTA0XSxcclxuICAgICAgICAgICAgICAgIFtcIk9jdFwiLCAxMzJdLFxyXG4gICAgICAgICAgICAgICAgW1wiTm92XCIsIDcyXSxcclxuICAgICAgICAgICAgICAgIFtcIkRlY1wiLCA2MV1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgXCJsYWJlbFwiOiBcIisxXCIsXHJcbiAgICAgICAgICAgIFwiY29sb3JcIjogXCIjZjA2OTNhXCIsXHJcbiAgICAgICAgICAgIFwiZGF0YVwiOiBbXHJcbiAgICAgICAgICAgICAgICBbXCJKYW5cIiwgMjldLFxyXG4gICAgICAgICAgICAgICAgW1wiRmViXCIsIDM2XSxcclxuICAgICAgICAgICAgICAgIFtcIk1hclwiLCA0N10sXHJcbiAgICAgICAgICAgICAgICBbXCJBcHJcIiwgMjFdLFxyXG4gICAgICAgICAgICAgICAgW1wiTWF5XCIsIDVdLFxyXG4gICAgICAgICAgICAgICAgW1wiSnVuXCIsIDQ5XSxcclxuICAgICAgICAgICAgICAgIFtcIkp1bFwiLCAzN10sXHJcbiAgICAgICAgICAgICAgICBbXCJBdWdcIiwgNDRdLFxyXG4gICAgICAgICAgICAgICAgW1wiU2VwXCIsIDI4XSxcclxuICAgICAgICAgICAgICAgIFtcIk9jdFwiLCA5XSxcclxuICAgICAgICAgICAgICAgIFtcIk5vdlwiLCAxMl0sXHJcbiAgICAgICAgICAgICAgICBbXCJEZWNcIiwgMzVdXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9XTtcclxuXHJcbiAgICAgICAgdmFyIGRhdGF2MiA9IFt7XHJcbiAgICAgICAgICAgIFwibGFiZWxcIjogXCJQZW5kaW5nXCIsXHJcbiAgICAgICAgICAgIFwiY29sb3JcIjogXCIjOTI4OWNhXCIsXHJcbiAgICAgICAgICAgIFwiZGF0YVwiOiBbXHJcbiAgICAgICAgICAgICAgICBbXCJQajFcIiwgODZdLFxyXG4gICAgICAgICAgICAgICAgW1wiUGoyXCIsIDEzNl0sXHJcbiAgICAgICAgICAgICAgICBbXCJQajNcIiwgOTddLFxyXG4gICAgICAgICAgICAgICAgW1wiUGo0XCIsIDExMF0sXHJcbiAgICAgICAgICAgICAgICBbXCJQajVcIiwgNjJdLFxyXG4gICAgICAgICAgICAgICAgW1wiUGo2XCIsIDg1XSxcclxuICAgICAgICAgICAgICAgIFtcIlBqN1wiLCAxMTVdLFxyXG4gICAgICAgICAgICAgICAgW1wiUGo4XCIsIDc4XSxcclxuICAgICAgICAgICAgICAgIFtcIlBqOVwiLCAxMDRdLFxyXG4gICAgICAgICAgICAgICAgW1wiUGoxMFwiLCA4Ml0sXHJcbiAgICAgICAgICAgICAgICBbXCJQajExXCIsIDk3XSxcclxuICAgICAgICAgICAgICAgIFtcIlBqMTJcIiwgMTEwXSxcclxuICAgICAgICAgICAgICAgIFtcIlBqMTNcIiwgNjJdXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIFwibGFiZWxcIjogXCJBc3NpZ25lZFwiLFxyXG4gICAgICAgICAgICBcImNvbG9yXCI6IFwiIzcyNjZiYVwiLFxyXG4gICAgICAgICAgICBcImRhdGFcIjogW1xyXG4gICAgICAgICAgICAgICAgW1wiUGoxXCIsIDQ5XSxcclxuICAgICAgICAgICAgICAgIFtcIlBqMlwiLCA4MV0sXHJcbiAgICAgICAgICAgICAgICBbXCJQajNcIiwgNDddLFxyXG4gICAgICAgICAgICAgICAgW1wiUGo0XCIsIDQ0XSxcclxuICAgICAgICAgICAgICAgIFtcIlBqNVwiLCAxMDBdLFxyXG4gICAgICAgICAgICAgICAgW1wiUGo2XCIsIDQ5XSxcclxuICAgICAgICAgICAgICAgIFtcIlBqN1wiLCA5NF0sXHJcbiAgICAgICAgICAgICAgICBbXCJQajhcIiwgNDRdLFxyXG4gICAgICAgICAgICAgICAgW1wiUGo5XCIsIDUyXSxcclxuICAgICAgICAgICAgICAgIFtcIlBqMTBcIiwgMTddLFxyXG4gICAgICAgICAgICAgICAgW1wiUGoxMVwiLCA0N10sXHJcbiAgICAgICAgICAgICAgICBbXCJQajEyXCIsIDQ0XSxcclxuICAgICAgICAgICAgICAgIFtcIlBqMTNcIiwgMTAwXVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSwge1xyXG4gICAgICAgICAgICBcImxhYmVsXCI6IFwiQ29tcGxldGVkXCIsXHJcbiAgICAgICAgICAgIFwiY29sb3JcIjogXCIjNTY0YWEzXCIsXHJcbiAgICAgICAgICAgIFwiZGF0YVwiOiBbXHJcbiAgICAgICAgICAgICAgICBbXCJQajFcIiwgMjldLFxyXG4gICAgICAgICAgICAgICAgW1wiUGoyXCIsIDU2XSxcclxuICAgICAgICAgICAgICAgIFtcIlBqM1wiLCAxNF0sXHJcbiAgICAgICAgICAgICAgICBbXCJQajRcIiwgMjFdLFxyXG4gICAgICAgICAgICAgICAgW1wiUGo1XCIsIDVdLFxyXG4gICAgICAgICAgICAgICAgW1wiUGo2XCIsIDI0XSxcclxuICAgICAgICAgICAgICAgIFtcIlBqN1wiLCAzN10sXHJcbiAgICAgICAgICAgICAgICBbXCJQajhcIiwgMjJdLFxyXG4gICAgICAgICAgICAgICAgW1wiUGo5XCIsIDI4XSxcclxuICAgICAgICAgICAgICAgIFtcIlBqMTBcIiwgOV0sXHJcbiAgICAgICAgICAgICAgICBbXCJQajExXCIsIDE0XSxcclxuICAgICAgICAgICAgICAgIFtcIlBqMTJcIiwgMjFdLFxyXG4gICAgICAgICAgICAgICAgW1wiUGoxM1wiLCA1XVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfV07XHJcblxyXG4gICAgICAgIHZhciBvcHRpb25zID0ge1xyXG4gICAgICAgICAgICBzZXJpZXM6IHtcclxuICAgICAgICAgICAgICAgIHN0YWNrOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgYmFyczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGFsaWduOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgICAgICBsaW5lV2lkdGg6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgc2hvdzogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBiYXJXaWR0aDogMC42LFxyXG4gICAgICAgICAgICAgICAgICAgIGZpbGw6IDAuOVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBncmlkOiB7XHJcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogJyNlZWUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyV2lkdGg6IDEsXHJcbiAgICAgICAgICAgICAgICBob3ZlcmFibGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZmNmY2ZjJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0b29sdGlwOiB0cnVlLFxyXG4gICAgICAgICAgICB0b29sdGlwT3B0czoge1xyXG4gICAgICAgICAgICAgICAgY29udGVudDogZnVuY3Rpb24obGFiZWwsIHgsIHkpIHsgcmV0dXJuIHggKyAnIDogJyArIHk7IH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgeGF4aXM6IHtcclxuICAgICAgICAgICAgICAgIHRpY2tDb2xvcjogJyNmY2ZjZmMnLFxyXG4gICAgICAgICAgICAgICAgbW9kZTogJ2NhdGVnb3JpZXMnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHlheGlzOiB7XHJcbiAgICAgICAgICAgICAgICAvLyBwb3NpdGlvbjogJ3JpZ2h0JyBvciAnbGVmdCdcclxuICAgICAgICAgICAgICAgIHRpY2tDb2xvcjogJyNlZWUnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNoYWRvd1NpemU6IDBcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgY2hhcnQgPSAkKCcuY2hhcnQtYmFyLXN0YWNrZWQnKTtcclxuICAgICAgICBpZiAoY2hhcnQubGVuZ3RoKVxyXG4gICAgICAgICAgICAkLnBsb3QoY2hhcnQsIGRhdGEsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgICB2YXIgY2hhcnR2MiA9ICQoJy5jaGFydC1iYXItc3RhY2tlZHYyJyk7XHJcbiAgICAgICAgaWYgKGNoYXJ0djIubGVuZ3RoKVxyXG4gICAgICAgICAgICAkLnBsb3QoY2hhcnR2MiwgZGF0YXYyLCBvcHRpb25zKTtcclxuXHJcbiAgICB9XHJcblxyXG59KSgpO1xyXG5cclxuLy8gQ0hBUlQgRE9OVVRcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuXHJcbiAgICAkKGluaXRGbG90RG9udXQpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRGbG90RG9udXQoKSB7XHJcblxyXG4gICAgICAgIHZhciBkYXRhID0gW3tcclxuICAgICAgICAgICAgXCJjb2xvclwiOiBcIiMzOUM1NThcIixcclxuICAgICAgICAgICAgXCJkYXRhXCI6IDYwLFxyXG4gICAgICAgICAgICBcImxhYmVsXCI6IFwiQ29mZmVlXCJcclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIFwiY29sb3JcIjogXCIjMDBiNGZmXCIsXHJcbiAgICAgICAgICAgIFwiZGF0YVwiOiA5MCxcclxuICAgICAgICAgICAgXCJsYWJlbFwiOiBcIkNTU1wiXHJcbiAgICAgICAgfSwge1xyXG4gICAgICAgICAgICBcImNvbG9yXCI6IFwiI0ZGQkU0MVwiLFxyXG4gICAgICAgICAgICBcImRhdGFcIjogNTAsXHJcbiAgICAgICAgICAgIFwibGFiZWxcIjogXCJMRVNTXCJcclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIFwiY29sb3JcIjogXCIjZmYzZTQzXCIsXHJcbiAgICAgICAgICAgIFwiZGF0YVwiOiA4MCxcclxuICAgICAgICAgICAgXCJsYWJlbFwiOiBcIkphZGVcIlxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgXCJjb2xvclwiOiBcIiM5MzdmYzdcIixcclxuICAgICAgICAgICAgXCJkYXRhXCI6IDExNixcclxuICAgICAgICAgICAgXCJsYWJlbFwiOiBcIkFuZ3VsYXJKU1wiXHJcbiAgICAgICAgfV07XHJcblxyXG4gICAgICAgIHZhciBvcHRpb25zID0ge1xyXG4gICAgICAgICAgICBzZXJpZXM6IHtcclxuICAgICAgICAgICAgICAgIHBpZToge1xyXG4gICAgICAgICAgICAgICAgICAgIHNob3c6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgaW5uZXJSYWRpdXM6IDAuNSAvLyBUaGlzIG1ha2VzIHRoZSBkb251dCBzaGFwZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIGNoYXJ0ID0gJCgnLmNoYXJ0LWRvbnV0Jyk7XHJcbiAgICAgICAgaWYgKGNoYXJ0Lmxlbmd0aClcclxuICAgICAgICAgICAgJC5wbG90KGNoYXJ0LCBkYXRhLCBvcHRpb25zKTtcclxuXHJcbiAgICB9XHJcblxyXG59KSgpO1xyXG5cclxuLy8gQ0hBUlQgTElORVxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG5cclxuICAgICQoaW5pdEZsb3RMaW5lKVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRGbG90TGluZSgpIHtcclxuXHJcbiAgICAgICAgdmFyIGRhdGEgPSBbe1xyXG4gICAgICAgICAgICBcImxhYmVsXCI6IFwiQ29tcGxldGVcIixcclxuICAgICAgICAgICAgXCJjb2xvclwiOiBcIiM1YWIxZWZcIixcclxuICAgICAgICAgICAgXCJkYXRhXCI6IFtcclxuICAgICAgICAgICAgICAgIFtcIkphblwiLCAxODhdLFxyXG4gICAgICAgICAgICAgICAgW1wiRmViXCIsIDE4M10sXHJcbiAgICAgICAgICAgICAgICBbXCJNYXJcIiwgMTg1XSxcclxuICAgICAgICAgICAgICAgIFtcIkFwclwiLCAxOTldLFxyXG4gICAgICAgICAgICAgICAgW1wiTWF5XCIsIDE5MF0sXHJcbiAgICAgICAgICAgICAgICBbXCJKdW5cIiwgMTk0XSxcclxuICAgICAgICAgICAgICAgIFtcIkp1bFwiLCAxOTRdLFxyXG4gICAgICAgICAgICAgICAgW1wiQXVnXCIsIDE4NF0sXHJcbiAgICAgICAgICAgICAgICBbXCJTZXBcIiwgNzRdXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIFwibGFiZWxcIjogXCJJbiBQcm9ncmVzc1wiLFxyXG4gICAgICAgICAgICBcImNvbG9yXCI6IFwiI2Y1OTk0ZVwiLFxyXG4gICAgICAgICAgICBcImRhdGFcIjogW1xyXG4gICAgICAgICAgICAgICAgW1wiSmFuXCIsIDE1M10sXHJcbiAgICAgICAgICAgICAgICBbXCJGZWJcIiwgMTE2XSxcclxuICAgICAgICAgICAgICAgIFtcIk1hclwiLCAxMzZdLFxyXG4gICAgICAgICAgICAgICAgW1wiQXByXCIsIDExOV0sXHJcbiAgICAgICAgICAgICAgICBbXCJNYXlcIiwgMTQ4XSxcclxuICAgICAgICAgICAgICAgIFtcIkp1blwiLCAxMzNdLFxyXG4gICAgICAgICAgICAgICAgW1wiSnVsXCIsIDExOF0sXHJcbiAgICAgICAgICAgICAgICBbXCJBdWdcIiwgMTYxXSxcclxuICAgICAgICAgICAgICAgIFtcIlNlcFwiLCA1OV1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgXCJsYWJlbFwiOiBcIkNhbmNlbGxlZFwiLFxyXG4gICAgICAgICAgICBcImNvbG9yXCI6IFwiI2Q4N2E4MFwiLFxyXG4gICAgICAgICAgICBcImRhdGFcIjogW1xyXG4gICAgICAgICAgICAgICAgW1wiSmFuXCIsIDExMV0sXHJcbiAgICAgICAgICAgICAgICBbXCJGZWJcIiwgOTddLFxyXG4gICAgICAgICAgICAgICAgW1wiTWFyXCIsIDkzXSxcclxuICAgICAgICAgICAgICAgIFtcIkFwclwiLCAxMTBdLFxyXG4gICAgICAgICAgICAgICAgW1wiTWF5XCIsIDEwMl0sXHJcbiAgICAgICAgICAgICAgICBbXCJKdW5cIiwgOTNdLFxyXG4gICAgICAgICAgICAgICAgW1wiSnVsXCIsIDkyXSxcclxuICAgICAgICAgICAgICAgIFtcIkF1Z1wiLCA5Ml0sXHJcbiAgICAgICAgICAgICAgICBbXCJTZXBcIiwgNDRdXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9XTtcclxuXHJcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIHNlcmllczoge1xyXG4gICAgICAgICAgICAgICAgbGluZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBzaG93OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGZpbGw6IDAuMDFcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBwb2ludHM6IHtcclxuICAgICAgICAgICAgICAgICAgICBzaG93OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIHJhZGl1czogNFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBncmlkOiB7XHJcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogJyNlZWUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyV2lkdGg6IDEsXHJcbiAgICAgICAgICAgICAgICBob3ZlcmFibGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZmNmY2ZjJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0b29sdGlwOiB0cnVlLFxyXG4gICAgICAgICAgICB0b29sdGlwT3B0czoge1xyXG4gICAgICAgICAgICAgICAgY29udGVudDogZnVuY3Rpb24obGFiZWwsIHgsIHkpIHsgcmV0dXJuIHggKyAnIDogJyArIHk7IH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgeGF4aXM6IHtcclxuICAgICAgICAgICAgICAgIHRpY2tDb2xvcjogJyNlZWUnLFxyXG4gICAgICAgICAgICAgICAgbW9kZTogJ2NhdGVnb3JpZXMnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHlheGlzOiB7XHJcbiAgICAgICAgICAgICAgICAvLyBwb3NpdGlvbjogJ3JpZ2h0JyBvciAnbGVmdCdcclxuICAgICAgICAgICAgICAgIHRpY2tDb2xvcjogJyNlZWUnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNoYWRvd1NpemU6IDBcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgY2hhcnQgPSAkKCcuY2hhcnQtbGluZScpO1xyXG4gICAgICAgIGlmIChjaGFydC5sZW5ndGgpXHJcbiAgICAgICAgICAgICQucGxvdChjaGFydCwgZGF0YSwgb3B0aW9ucyk7XHJcblxyXG4gICAgfVxyXG5cclxufSkoKTtcclxuXHJcblxyXG4vLyBDSEFSVCBQSUVcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuXHJcbiAgICAkKGluaXRGbG90UGllKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0RmxvdFBpZSgpIHtcclxuXHJcbiAgICAgICAgdmFyIGRhdGEgPSBbe1xyXG4gICAgICAgICAgICBcImxhYmVsXCI6IFwialF1ZXJ5XCIsXHJcbiAgICAgICAgICAgIFwiY29sb3JcIjogXCIjNGFjYWI0XCIsXHJcbiAgICAgICAgICAgIFwiZGF0YVwiOiAzMFxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgXCJsYWJlbFwiOiBcIkNTU1wiLFxyXG4gICAgICAgICAgICBcImNvbG9yXCI6IFwiI2ZmZWE4OFwiLFxyXG4gICAgICAgICAgICBcImRhdGFcIjogNDBcclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIFwibGFiZWxcIjogXCJMRVNTXCIsXHJcbiAgICAgICAgICAgIFwiY29sb3JcIjogXCIjZmY4MTUzXCIsXHJcbiAgICAgICAgICAgIFwiZGF0YVwiOiA5MFxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgXCJsYWJlbFwiOiBcIlNBU1NcIixcclxuICAgICAgICAgICAgXCJjb2xvclwiOiBcIiM4NzhiYjZcIixcclxuICAgICAgICAgICAgXCJkYXRhXCI6IDc1XHJcbiAgICAgICAgfSwge1xyXG4gICAgICAgICAgICBcImxhYmVsXCI6IFwiSmFkZVwiLFxyXG4gICAgICAgICAgICBcImNvbG9yXCI6IFwiI2IyZDc2N1wiLFxyXG4gICAgICAgICAgICBcImRhdGFcIjogMTIwXHJcbiAgICAgICAgfV07XHJcblxyXG4gICAgICAgIHZhciBvcHRpb25zID0ge1xyXG4gICAgICAgICAgICBzZXJpZXM6IHtcclxuICAgICAgICAgICAgICAgIHBpZToge1xyXG4gICAgICAgICAgICAgICAgICAgIHNob3c6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgaW5uZXJSYWRpdXM6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2hvdzogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmFkaXVzOiAwLjgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24obGFiZWwsIHNlcmllcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiZmxvdC1waWUtbGFiZWxcIj4nICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2xhYmVsICsgJyA6ICcgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1hdGgucm91bmQoc2VyaWVzLnBlcmNlbnQpICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnJTwvZGl2Pic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wYWNpdHk6IDAuOCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnIzIyMidcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBjaGFydCA9ICQoJy5jaGFydC1waWUnKTtcclxuICAgICAgICBpZiAoY2hhcnQubGVuZ3RoKVxyXG4gICAgICAgICAgICAkLnBsb3QoY2hhcnQsIGRhdGEsIG9wdGlvbnMpO1xyXG5cclxuICAgIH1cclxuXHJcbn0pKCk7IiwiLy8gTW9ycmlzXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgJChpbml0TW9ycmlzKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0TW9ycmlzKCkge1xyXG5cclxuICAgICAgICBpZiAodHlwZW9mIE1vcnJpcyA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybjtcclxuXHJcbiAgICAgICAgdmFyIGNoYXJ0ZGF0YSA9IFtcclxuICAgICAgICAgICAgeyB5OiBcIjIwMDZcIiwgYTogMTAwLCBiOiA5MCB9LFxyXG4gICAgICAgICAgICB7IHk6IFwiMjAwN1wiLCBhOiA3NSwgYjogNjUgfSxcclxuICAgICAgICAgICAgeyB5OiBcIjIwMDhcIiwgYTogNTAsIGI6IDQwIH0sXHJcbiAgICAgICAgICAgIHsgeTogXCIyMDA5XCIsIGE6IDc1LCBiOiA2NSB9LFxyXG4gICAgICAgICAgICB7IHk6IFwiMjAxMFwiLCBhOiA1MCwgYjogNDAgfSxcclxuICAgICAgICAgICAgeyB5OiBcIjIwMTFcIiwgYTogNzUsIGI6IDY1IH0sXHJcbiAgICAgICAgICAgIHsgeTogXCIyMDEyXCIsIGE6IDEwMCwgYjogOTAgfVxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIHZhciBkb251dGRhdGEgPSBbXHJcbiAgICAgICAgICAgIHsgbGFiZWw6IFwiRG93bmxvYWQgU2FsZXNcIiwgdmFsdWU6IDEyIH0sXHJcbiAgICAgICAgICAgIHsgbGFiZWw6IFwiSW4tU3RvcmUgU2FsZXNcIiwgdmFsdWU6IDMwIH0sXHJcbiAgICAgICAgICAgIHsgbGFiZWw6IFwiTWFpbC1PcmRlciBTYWxlc1wiLCB2YWx1ZTogMjAgfVxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIC8vIExpbmUgQ2hhcnRcclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgICAgICBuZXcgTW9ycmlzLkxpbmUoe1xyXG4gICAgICAgICAgICBlbGVtZW50OiAnbW9ycmlzLWxpbmUnLFxyXG4gICAgICAgICAgICBkYXRhOiBjaGFydGRhdGEsXHJcbiAgICAgICAgICAgIHhrZXk6ICd5JyxcclxuICAgICAgICAgICAgeWtleXM6IFtcImFcIiwgXCJiXCJdLFxyXG4gICAgICAgICAgICBsYWJlbHM6IFtcIlNlcmllIEFcIiwgXCJTZXJpZSBCXCJdLFxyXG4gICAgICAgICAgICBsaW5lQ29sb3JzOiBbXCIjMzFDMEJFXCIsIFwiIzdhOTJhM1wiXSxcclxuICAgICAgICAgICAgcmVzaXplOiB0cnVlXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIERvbnV0IENoYXJ0XHJcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICBuZXcgTW9ycmlzLkRvbnV0KHtcclxuICAgICAgICAgICAgZWxlbWVudDogJ21vcnJpcy1kb251dCcsXHJcbiAgICAgICAgICAgIGRhdGE6IGRvbnV0ZGF0YSxcclxuICAgICAgICAgICAgY29sb3JzOiBbJyNmMDUwNTAnLCAnI2ZhZDczMicsICcjZmY5MDJiJ10sXHJcbiAgICAgICAgICAgIHJlc2l6ZTogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBCYXIgQ2hhcnRcclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgIG5ldyBNb3JyaXMuQmFyKHtcclxuICAgICAgICAgICAgZWxlbWVudDogJ21vcnJpcy1iYXInLFxyXG4gICAgICAgICAgICBkYXRhOiBjaGFydGRhdGEsXHJcbiAgICAgICAgICAgIHhrZXk6ICd5JyxcclxuICAgICAgICAgICAgeWtleXM6IFtcImFcIiwgXCJiXCJdLFxyXG4gICAgICAgICAgICBsYWJlbHM6IFtcIlNlcmllcyBBXCIsIFwiU2VyaWVzIEJcIl0sXHJcbiAgICAgICAgICAgIHhMYWJlbE1hcmdpbjogMixcclxuICAgICAgICAgICAgYmFyQ29sb3JzOiBbJyMyM2I3ZTUnLCAnI2YwNTA1MCddLFxyXG4gICAgICAgICAgICByZXNpemU6IHRydWVcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gQXJlYSBDaGFydFxyXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgbmV3IE1vcnJpcy5BcmVhKHtcclxuICAgICAgICAgICAgZWxlbWVudDogJ21vcnJpcy1hcmVhJyxcclxuICAgICAgICAgICAgZGF0YTogY2hhcnRkYXRhLFxyXG4gICAgICAgICAgICB4a2V5OiAneScsXHJcbiAgICAgICAgICAgIHlrZXlzOiBbXCJhXCIsIFwiYlwiXSxcclxuICAgICAgICAgICAgbGFiZWxzOiBbXCJTZXJpZSBBXCIsIFwiU2VyaWUgQlwiXSxcclxuICAgICAgICAgICAgbGluZUNvbG9yczogWycjNzI2NmJhJywgJyMyM2I3ZTUnXSxcclxuICAgICAgICAgICAgcmVzaXplOiB0cnVlXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvLyBSaWNrc2hhd1xyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoaW5pdE1vcnJpcyk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdE1vcnJpcygpIHtcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBSaWNrc2hhdyA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybjtcclxuXHJcbiAgICAgICAgdmFyIHNlcmllc0RhdGEgPSBbXHJcbiAgICAgICAgICAgIFtdLFxyXG4gICAgICAgICAgICBbXSxcclxuICAgICAgICAgICAgW11cclxuICAgICAgICBdO1xyXG4gICAgICAgIHZhciByYW5kb20gPSBuZXcgUmlja3NoYXcuRml4dHVyZXMuUmFuZG9tRGF0YSgxNTApO1xyXG5cclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDE1MDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHJhbmRvbS5hZGREYXRhKHNlcmllc0RhdGEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHNlcmllczEgPSBbe1xyXG4gICAgICAgICAgICBjb2xvcjogXCIjYzA1MDIwXCIsXHJcbiAgICAgICAgICAgIGRhdGE6IHNlcmllc0RhdGFbMF0sXHJcbiAgICAgICAgICAgIG5hbWU6ICdOZXcgWW9yaydcclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIGNvbG9yOiBcIiMzMGMwMjBcIixcclxuICAgICAgICAgICAgZGF0YTogc2VyaWVzRGF0YVsxXSxcclxuICAgICAgICAgICAgbmFtZTogJ0xvbmRvbidcclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIGNvbG9yOiBcIiM2MDYwYzBcIixcclxuICAgICAgICAgICAgZGF0YTogc2VyaWVzRGF0YVsyXSxcclxuICAgICAgICAgICAgbmFtZTogJ1Rva3lvJ1xyXG4gICAgICAgIH1dO1xyXG5cclxuICAgICAgICB2YXIgZ3JhcGgxID0gbmV3IFJpY2tzaGF3LkdyYXBoKHtcclxuICAgICAgICAgICAgZWxlbWVudDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNyaWNrc2hhdzFcIiksXHJcbiAgICAgICAgICAgIHNlcmllczogc2VyaWVzMSxcclxuICAgICAgICAgICAgcmVuZGVyZXI6ICdhcmVhJ1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBncmFwaDEucmVuZGVyKCk7XHJcblxyXG5cclxuICAgICAgICAvLyBHcmFwaCAyXHJcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAgICAgdmFyIGdyYXBoMiA9IG5ldyBSaWNrc2hhdy5HcmFwaCh7XHJcbiAgICAgICAgICAgIGVsZW1lbnQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcmlja3NoYXcyXCIpLFxyXG4gICAgICAgICAgICByZW5kZXJlcjogJ2FyZWEnLFxyXG4gICAgICAgICAgICBzdHJva2U6IHRydWUsXHJcbiAgICAgICAgICAgIHNlcmllczogW3tcclxuICAgICAgICAgICAgICAgIGRhdGE6IFt7IHg6IDAsIHk6IDQwIH0sIHsgeDogMSwgeTogNDkgfSwgeyB4OiAyLCB5OiAzOCB9LCB7IHg6IDMsIHk6IDMwIH0sIHsgeDogNCwgeTogMzIgfV0sXHJcbiAgICAgICAgICAgICAgICBjb2xvcjogJyNmMDUwNTAnXHJcbiAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgIGRhdGE6IFt7IHg6IDAsIHk6IDQwIH0sIHsgeDogMSwgeTogNDkgfSwgeyB4OiAyLCB5OiAzOCB9LCB7IHg6IDMsIHk6IDMwIH0sIHsgeDogNCwgeTogMzIgfV0sXHJcbiAgICAgICAgICAgICAgICBjb2xvcjogJyNmYWQ3MzInXHJcbiAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGdyYXBoMi5yZW5kZXIoKTtcclxuXHJcbiAgICAgICAgLy8gR3JhcGggM1xyXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5cclxuICAgICAgICB2YXIgZ3JhcGgzID0gbmV3IFJpY2tzaGF3LkdyYXBoKHtcclxuICAgICAgICAgICAgZWxlbWVudDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNyaWNrc2hhdzNcIiksXHJcbiAgICAgICAgICAgIHJlbmRlcmVyOiAnbGluZScsXHJcbiAgICAgICAgICAgIHNlcmllczogW3tcclxuICAgICAgICAgICAgICAgIGRhdGE6IFt7IHg6IDAsIHk6IDQwIH0sIHsgeDogMSwgeTogNDkgfSwgeyB4OiAyLCB5OiAzOCB9LCB7IHg6IDMsIHk6IDMwIH0sIHsgeDogNCwgeTogMzIgfV0sXHJcbiAgICAgICAgICAgICAgICBjb2xvcjogJyM3MjY2YmEnXHJcbiAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgIGRhdGE6IFt7IHg6IDAsIHk6IDIwIH0sIHsgeDogMSwgeTogMjQgfSwgeyB4OiAyLCB5OiAxOSB9LCB7IHg6IDMsIHk6IDE1IH0sIHsgeDogNCwgeTogMTYgfV0sXHJcbiAgICAgICAgICAgICAgICBjb2xvcjogJyMyM2I3ZTUnXHJcbiAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZ3JhcGgzLnJlbmRlcigpO1xyXG5cclxuXHJcbiAgICAgICAgLy8gR3JhcGggNFxyXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5cclxuICAgICAgICB2YXIgZ3JhcGg0ID0gbmV3IFJpY2tzaGF3LkdyYXBoKHtcclxuICAgICAgICAgICAgZWxlbWVudDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNyaWNrc2hhdzRcIiksXHJcbiAgICAgICAgICAgIHJlbmRlcmVyOiAnYmFyJyxcclxuICAgICAgICAgICAgc2VyaWVzOiBbe1xyXG4gICAgICAgICAgICAgICAgZGF0YTogW3sgeDogMCwgeTogNDAgfSwgeyB4OiAxLCB5OiA0OSB9LCB7IHg6IDIsIHk6IDM4IH0sIHsgeDogMywgeTogMzAgfSwgeyB4OiA0LCB5OiAzMiB9XSxcclxuICAgICAgICAgICAgICAgIGNvbG9yOiAnI2ZhZDczMidcclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgZGF0YTogW3sgeDogMCwgeTogMjAgfSwgeyB4OiAxLCB5OiAyNCB9LCB7IHg6IDIsIHk6IDE5IH0sIHsgeDogMywgeTogMTUgfSwgeyB4OiA0LCB5OiAxNiB9XSxcclxuICAgICAgICAgICAgICAgIGNvbG9yOiAnI2ZmOTAyYidcclxuXHJcbiAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZ3JhcGg0LnJlbmRlcigpO1xyXG5cclxuICAgIH1cclxuXHJcbn0pKCk7IiwiLy8gU1BBUktMSU5FXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgJChpbml0U3BhcmtsaW5lKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0U3BhcmtsaW5lKCkge1xyXG5cclxuICAgICAgICAkKCdbZGF0YS1zcGFya2xpbmVdJykuZWFjaChpbml0U3BhcmtMaW5lKTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaW5pdFNwYXJrTGluZSgpIHtcclxuICAgICAgICAgICAgdmFyICRlbGVtZW50ID0gJCh0aGlzKSxcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSAkZWxlbWVudC5kYXRhKCksXHJcbiAgICAgICAgICAgICAgICB2YWx1ZXMgPSBvcHRpb25zLnZhbHVlcyAmJiBvcHRpb25zLnZhbHVlcy5zcGxpdCgnLCcpO1xyXG5cclxuICAgICAgICAgICAgb3B0aW9ucy50eXBlID0gb3B0aW9ucy50eXBlIHx8ICdiYXInOyAvLyBkZWZhdWx0IGNoYXJ0IGlzIGJhclxyXG4gICAgICAgICAgICBvcHRpb25zLmRpc2FibGVIaWRkZW5DaGVjayA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAkZWxlbWVudC5zcGFya2xpbmUodmFsdWVzLCBvcHRpb25zKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnJlc2l6ZSkge1xyXG4gICAgICAgICAgICAgICAgJCh3aW5kb3cpLnJlc2l6ZShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAkZWxlbWVudC5zcGFya2xpbmUodmFsdWVzLCBvcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvLyBTdGFydCBCb290c3RyYXAgSlNcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAkKGluaXRCb290c3RyYXApO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRCb290c3RyYXAoKSB7XHJcblxyXG4gICAgICAgIC8vIG5lY2Vzc2FyeSBjaGVjayBhdCBsZWFzdCB0aWwgQlMgZG9lc24ndCByZXF1aXJlIGpRdWVyeVxyXG4gICAgICAgIGlmICghJC5mbiB8fCAhJC5mbi50b29sdGlwIHx8ICEkLmZuLnBvcG92ZXIpIHJldHVybjtcclxuXHJcbiAgICAgICAgLy8gUE9QT1ZFUlxyXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgICAgICQoJ1tkYXRhLXRvZ2dsZT1cInBvcG92ZXJcIl0nKS5wb3BvdmVyKCk7XHJcblxyXG4gICAgICAgIC8vIFRPT0xUSVBcclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgICAgICAkKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCh7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lcjogJ2JvZHknXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIERST1BET1dOIElOUFVUU1xyXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgJCgnLmRyb3Bkb3duIGlucHV0Jykub24oJ2NsaWNrIGZvY3VzJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvLyBNb2R1bGU6IGNhcmQtdG9vbHNcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAkKGluaXRDYXJkRGlzbWlzcyk7XHJcbiAgICAkKGluaXRDYXJkQ29sbGFwc2UpO1xyXG4gICAgJChpbml0Q2FyZFJlZnJlc2gpO1xyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhlbHBlciBmdW5jdGlvbiB0byBmaW5kIHRoZSBjbG9zZXN0XHJcbiAgICAgKiBhc2NlbmRpbmcgLmNhcmQgZWxlbWVudFxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBnZXRDYXJkUGFyZW50KGl0ZW0pIHtcclxuICAgICAgICB2YXIgZWwgPSBpdGVtLnBhcmVudEVsZW1lbnQ7XHJcbiAgICAgICAgd2hpbGUgKGVsICYmICFlbC5jbGFzc0xpc3QuY29udGFpbnMoJ2NhcmQnKSlcclxuICAgICAgICAgICAgZWwgPSBlbC5wYXJlbnRFbGVtZW50XHJcbiAgICAgICAgcmV0dXJuIGVsXHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEhlbHBlciB0byB0cmlnZ2VyIGN1c3RvbSBldmVudFxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiB0cmlnZ2VyRXZlbnQodHlwZSwgaXRlbSwgZGF0YSkge1xyXG4gICAgICAgIHZhciBldjtcclxuICAgICAgICBpZiAodHlwZW9mIEN1c3RvbUV2ZW50ID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIGV2ID0gbmV3IEN1c3RvbUV2ZW50KHR5cGUsIHsgZGV0YWlsOiBkYXRhIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGV2ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0N1c3RvbUV2ZW50Jyk7XHJcbiAgICAgICAgICAgIGV2LmluaXRDdXN0b21FdmVudCh0eXBlLCB0cnVlLCBmYWxzZSwgZGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGl0ZW0uZGlzcGF0Y2hFdmVudChldik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEaXNtaXNzIGNhcmRzXHJcbiAgICAgKiBbZGF0YS10b29sPVwiY2FyZC1kaXNtaXNzXCJdXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGluaXRDYXJkRGlzbWlzcygpIHtcclxuICAgICAgICB2YXIgY2FyZHRvb2xTZWxlY3RvciA9ICdbZGF0YS10b29sPVwiY2FyZC1kaXNtaXNzXCJdJ1xyXG5cclxuICAgICAgICB2YXIgY2FyZExpc3QgPSBbXS5zbGljZS5jYWxsKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoY2FyZHRvb2xTZWxlY3RvcikpXHJcblxyXG4gICAgICAgIGNhcmRMaXN0LmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICAgICAgICBuZXcgQ2FyZERpc21pc3MoaXRlbSk7XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gQ2FyZERpc21pc3MoaXRlbSkge1xyXG4gICAgICAgICAgICB2YXIgRVZFTlRfUkVNT1ZFID0gJ2NhcmQucmVtb3ZlJztcclxuICAgICAgICAgICAgdmFyIEVWRU5UX1JFTU9WRUQgPSAnY2FyZC5yZW1vdmVkJztcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaXRlbSA9IGl0ZW07XHJcbiAgICAgICAgICAgIHRoaXMuY2FyZFBhcmVudCA9IGdldENhcmRQYXJlbnQodGhpcy5pdGVtKTtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmluZyA9IGZhbHNlOyAvLyBwcmV2ZW50cyBkb3VibGUgZXhlY3V0aW9uXHJcblxyXG4gICAgICAgICAgICB0aGlzLmNsaWNrSGFuZGxlciA9IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnJlbW92aW5nKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92aW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIC8vIHBhc3MgY2FsbGJhY2tzIHZpYSBldmVudC5kZXRhaWwgdG8gY29uZmlybS9jYW5jZWwgdGhlIHJlbW92YWxcclxuICAgICAgICAgICAgICAgIHRyaWdnZXJFdmVudChFVkVOVF9SRU1PVkUsIHRoaXMuY2FyZFBhcmVudCwge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpcm06IHRoaXMuY29uZmlybS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNhbmNlbDogdGhpcy5jYW5jZWwuYmluZCh0aGlzKVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jb25maXJtID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFuaW1hdGUodGhpcy5jYXJkUGFyZW50LCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyRXZlbnQoRVZFTlRfUkVNT1ZFRCwgdGhpcy5jYXJkUGFyZW50KTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZSh0aGlzLmNhcmRQYXJlbnQpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmNhbmNlbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0ZSA9IGZ1bmN0aW9uKGl0ZW0sIGNiKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoJ29uYW5pbWF0aW9uZW5kJyBpbiB3aW5kb3cpIHsgLy8gYW5pbWF0aW9uIHN1cHBvcnRlZFxyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignYW5pbWF0aW9uZW5kJywgY2IuYmluZCh0aGlzKSlcclxuICAgICAgICAgICAgICAgICAgICBpdGVtLmNsYXNzTmFtZSArPSAnIGFuaW1hdGVkIGJvdW5jZU91dCc7IC8vIHJlcXVpcmVzIGFuaW1hdGUuY3NzXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgY2IuY2FsbCh0aGlzKSAvLyBubyBhbmltYXRpb24sIGp1c3QgcmVtb3ZlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5yZW1vdmUgPSBmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICBpdGVtLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoaXRlbSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gYXR0YWNoIGxpc3RlbmVyXHJcbiAgICAgICAgICAgIGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmNsaWNrSGFuZGxlci5iaW5kKHRoaXMpLCBmYWxzZSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29sbGFwc2VkIGNhcmRzXHJcbiAgICAgKiBbZGF0YS10b29sPVwiY2FyZC1jb2xsYXBzZVwiXVxyXG4gICAgICogW2RhdGEtc3RhcnQtY29sbGFwc2VkXVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBpbml0Q2FyZENvbGxhcHNlKCkge1xyXG4gICAgICAgIHZhciBjYXJkdG9vbFNlbGVjdG9yID0gJ1tkYXRhLXRvb2w9XCJjYXJkLWNvbGxhcHNlXCJdJztcclxuICAgICAgICB2YXIgY2FyZExpc3QgPSBbXS5zbGljZS5jYWxsKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoY2FyZHRvb2xTZWxlY3RvcikpXHJcblxyXG4gICAgICAgIGNhcmRMaXN0LmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICAgICAgICB2YXIgaW5pdGlhbFN0YXRlID0gaXRlbS5oYXNBdHRyaWJ1dGUoJ2RhdGEtc3RhcnQtY29sbGFwc2VkJylcclxuICAgICAgICAgICAgbmV3IENhcmRDb2xsYXBzZShpdGVtLCBpbml0aWFsU3RhdGUpO1xyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIENhcmRDb2xsYXBzZShpdGVtLCBzdGFydENvbGxhcHNlZCkge1xyXG4gICAgICAgICAgICB2YXIgRVZFTlRfU0hPVyA9ICdjYXJkLmNvbGxhcHNlLnNob3cnO1xyXG4gICAgICAgICAgICB2YXIgRVZFTlRfSElERSA9ICdjYXJkLmNvbGxhcHNlLmhpZGUnO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IHRydWU7IC8vIHRydWUgLT4gc2hvdyAvIGZhbHNlIC0+IGhpZGVcclxuICAgICAgICAgICAgdGhpcy5pdGVtID0gaXRlbTtcclxuICAgICAgICAgICAgdGhpcy5jYXJkUGFyZW50ID0gZ2V0Q2FyZFBhcmVudCh0aGlzLml0ZW0pO1xyXG4gICAgICAgICAgICB0aGlzLndyYXBwZXIgPSB0aGlzLmNhcmRQYXJlbnQucXVlcnlTZWxlY3RvcignLmNhcmQtd3JhcHBlcicpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy50b2dnbGVDb2xsYXBzZSA9IGZ1bmN0aW9uKGFjdGlvbikge1xyXG4gICAgICAgICAgICAgICAgdHJpZ2dlckV2ZW50KGFjdGlvbiA/IEVWRU5UX1NIT1cgOiBFVkVOVF9ISURFLCB0aGlzLmNhcmRQYXJlbnQpXHJcbiAgICAgICAgICAgICAgICB0aGlzLndyYXBwZXIuc3R5bGUubWF4SGVpZ2h0ID0gKGFjdGlvbiA/IHRoaXMud3JhcHBlci5zY3JvbGxIZWlnaHQgOiAwKSArICdweCdcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBhY3Rpb247XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUljb24oYWN0aW9uKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlSWNvbiA9IGZ1bmN0aW9uKGFjdGlvbikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtLmZpcnN0RWxlbWVudENoaWxkLmNsYXNzTmFtZSA9IGFjdGlvbiA/ICdmYSBmYS1taW51cycgOiAnZmEgZmEtcGx1cydcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmNsaWNrSGFuZGxlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy50b2dnbGVDb2xsYXBzZSghdGhpcy5zdGF0ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5pbml0U3R5bGVzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLndyYXBwZXIuc3R5bGUubWF4SGVpZ2h0ID0gdGhpcy53cmFwcGVyLnNjcm9sbEhlaWdodCArICdweCc7XHJcbiAgICAgICAgICAgICAgICB0aGlzLndyYXBwZXIuc3R5bGUudHJhbnNpdGlvbiA9ICdtYXgtaGVpZ2h0IDAuNXMnO1xyXG4gICAgICAgICAgICAgICAgdGhpcy53cmFwcGVyLnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIHByZXBhcmUgc3R5bGVzIGZvciBjb2xsYXBzZSBhbmltYXRpb25cclxuICAgICAgICAgICAgdGhpcy5pbml0U3R5bGVzKClcclxuICAgICAgICAgICAgLy8gc2V0IGluaXRpYWwgc3RhdGUgaWYgcHJvdmlkZWRcclxuICAgICAgICAgICAgaWYgKHN0YXJ0Q29sbGFwc2VkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUNvbGxhcHNlKGZhbHNlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIGF0dGFjaCBsaXN0ZW5lclxyXG4gICAgICAgICAgICB0aGlzLml0ZW0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmNsaWNrSGFuZGxlci5iaW5kKHRoaXMpLCBmYWxzZSlcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlZnJlc2ggY2FyZHNcclxuICAgICAqIFtkYXRhLXRvb2w9XCJjYXJkLXJlZnJlc2hcIl1cclxuICAgICAqIFtkYXRhLXNwaW5uZXI9XCJzdGFuZGFyZFwiXVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBpbml0Q2FyZFJlZnJlc2goKSB7XHJcblxyXG4gICAgICAgIHZhciBjYXJkdG9vbFNlbGVjdG9yID0gJ1tkYXRhLXRvb2w9XCJjYXJkLXJlZnJlc2hcIl0nO1xyXG4gICAgICAgIHZhciBjYXJkTGlzdCA9IFtdLnNsaWNlLmNhbGwoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChjYXJkdG9vbFNlbGVjdG9yKSlcclxuXHJcbiAgICAgICAgY2FyZExpc3QuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICAgIG5ldyBDYXJkUmVmcmVzaChpdGVtKTtcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBDYXJkUmVmcmVzaChpdGVtKSB7XHJcbiAgICAgICAgICAgIHZhciBFVkVOVF9SRUZSRVNIID0gJ2NhcmQucmVmcmVzaCc7XHJcbiAgICAgICAgICAgIHZhciBXSElSTF9DTEFTUyA9ICd3aGlybCc7XHJcbiAgICAgICAgICAgIHZhciBERUZBVUxUX1NQSU5ORVIgPSAnc3RhbmRhcmQnXHJcblxyXG4gICAgICAgICAgICB0aGlzLml0ZW0gPSBpdGVtO1xyXG4gICAgICAgICAgICB0aGlzLmNhcmRQYXJlbnQgPSBnZXRDYXJkUGFyZW50KHRoaXMuaXRlbSlcclxuICAgICAgICAgICAgdGhpcy5zcGlubmVyID0gKCh0aGlzLml0ZW0uZGF0YXNldCB8fCB7fSkuc3Bpbm5lciB8fCBERUZBVUxUX1NQSU5ORVIpLnNwbGl0KCcgJyk7IC8vIHN1cHBvcnQgc3BhY2Ugc2VwYXJhdGVkIGNsYXNzZXNcclxuXHJcbiAgICAgICAgICAgIHRoaXMucmVmcmVzaCA9IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIHZhciBjYXJkID0gdGhpcy5jYXJkUGFyZW50O1xyXG4gICAgICAgICAgICAgICAgLy8gc3RhcnQgc2hvd2luZyB0aGUgc3Bpbm5lclxyXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93U3Bpbm5lcihjYXJkLCB0aGlzLnNwaW5uZXIpXHJcbiAgICAgICAgICAgICAgICAvLyBhdHRhY2ggYXMgcHVibGljIG1ldGhvZFxyXG4gICAgICAgICAgICAgICAgY2FyZC5yZW1vdmVTcGlubmVyID0gdGhpcy5yZW1vdmVTcGlubmVyLmJpbmQodGhpcyk7XHJcbiAgICAgICAgICAgICAgICAvLyBUcmlnZ2VyIHRoZSBldmVudCBhbmQgc2VuZCB0aGUgY2FyZFxyXG4gICAgICAgICAgICAgICAgdHJpZ2dlckV2ZW50KEVWRU5UX1JFRlJFU0gsIGNhcmQsIHsgY2FyZDogY2FyZCB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnNob3dTcGlubmVyID0gZnVuY3Rpb24oY2FyZCwgc3Bpbm5lcikge1xyXG4gICAgICAgICAgICAgICAgY2FyZC5jbGFzc0xpc3QuYWRkKFdISVJMX0NMQVNTKTtcclxuICAgICAgICAgICAgICAgIHNwaW5uZXIuZm9yRWFjaChmdW5jdGlvbihzKSB7IGNhcmQuY2xhc3NMaXN0LmFkZChzKSB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlU3Bpbm5lciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jYXJkUGFyZW50LmNsYXNzTGlzdC5yZW1vdmUoV0hJUkxfQ0xBU1MpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBhdHRhY2ggbGlzdGVuZXJcclxuICAgICAgICAgICAgdGhpcy5pdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5yZWZyZXNoLmJpbmQodGhpcyksIGZhbHNlKVxyXG5cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59KSgpOyIsIi8vIEdMT0JBTCBDT05TVEFOVFNcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbihmdW5jdGlvbigpIHtcclxuXHJcbiAgICB3aW5kb3cuQVBQX0NPTE9SUyA9IHtcclxuICAgICAgICAncHJpbWFyeSc6ICAgICAgICAgICAgICAgICcjNWQ5Y2VjJyxcclxuICAgICAgICAnc3VjY2Vzcyc6ICAgICAgICAgICAgICAgICcjMjdjMjRjJyxcclxuICAgICAgICAnaW5mbyc6ICAgICAgICAgICAgICAgICAgICcjMjNiN2U1JyxcclxuICAgICAgICAnd2FybmluZyc6ICAgICAgICAgICAgICAgICcjZmY5MDJiJyxcclxuICAgICAgICAnZGFuZ2VyJzogICAgICAgICAgICAgICAgICcjZjA1MDUwJyxcclxuICAgICAgICAnaW52ZXJzZSc6ICAgICAgICAgICAgICAgICcjMTMxZTI2JyxcclxuICAgICAgICAnZ3JlZW4nOiAgICAgICAgICAgICAgICAgICcjMzdiYzliJyxcclxuICAgICAgICAncGluayc6ICAgICAgICAgICAgICAgICAgICcjZjUzMmU1JyxcclxuICAgICAgICAncHVycGxlJzogICAgICAgICAgICAgICAgICcjNzI2NmJhJyxcclxuICAgICAgICAnZGFyayc6ICAgICAgICAgICAgICAgICAgICcjM2EzZjUxJyxcclxuICAgICAgICAneWVsbG93JzogICAgICAgICAgICAgICAgICcjZmFkNzMyJyxcclxuICAgICAgICAnZ3JheS1kYXJrZXInOiAgICAgICAgICAgICcjMjMyNzM1JyxcclxuICAgICAgICAnZ3JheS1kYXJrJzogICAgICAgICAgICAgICcjM2EzZjUxJyxcclxuICAgICAgICAnZ3JheSc6ICAgICAgICAgICAgICAgICAgICcjZGRlNmU5JyxcclxuICAgICAgICAnZ3JheS1saWdodCc6ICAgICAgICAgICAgICcjZTRlYWVjJyxcclxuICAgICAgICAnZ3JheS1saWdodGVyJzogICAgICAgICAgICcjZWRmMWYyJ1xyXG4gICAgfTtcclxuXHJcbiAgICB3aW5kb3cuQVBQX01FRElBUVVFUlkgPSB7XHJcbiAgICAgICAgJ2Rlc2t0b3BMRyc6ICAgICAgICAgICAgIDEyMDAsXHJcbiAgICAgICAgJ2Rlc2t0b3AnOiAgICAgICAgICAgICAgICA5OTIsXHJcbiAgICAgICAgJ3RhYmxldCc6ICAgICAgICAgICAgICAgICA3NjgsXHJcbiAgICAgICAgJ21vYmlsZSc6ICAgICAgICAgICAgICAgICA0ODBcclxuICAgIH07XHJcblxyXG59KSgpOyIsIi8vIEZVTExTQ1JFRU5cclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAkKGluaXRTY3JlZW5GdWxsKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0U2NyZWVuRnVsbCgpIHtcclxuICAgICAgICBpZiAodHlwZW9mIHNjcmVlbmZ1bGwgPT09ICd1bmRlZmluZWQnKSByZXR1cm47XHJcblxyXG4gICAgICAgIHZhciAkZG9jID0gJChkb2N1bWVudCk7XHJcbiAgICAgICAgdmFyICRmc1RvZ2dsZXIgPSAkKCdbZGF0YS10b2dnbGUtZnVsbHNjcmVlbl0nKTtcclxuXHJcbiAgICAgICAgLy8gTm90IHN1cHBvcnRlZCB1bmRlciBJRVxyXG4gICAgICAgIHZhciB1YSA9IHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50O1xyXG4gICAgICAgIGlmICh1YS5pbmRleE9mKFwiTVNJRSBcIikgPiAwIHx8ICEhdWEubWF0Y2goL1RyaWRlbnQuKnJ2XFw6MTFcXC4vKSkge1xyXG4gICAgICAgICAgICAkZnNUb2dnbGVyLmFkZENsYXNzKCdkLW5vbmUnKTsgLy8gaGlkZSBlbGVtZW50XHJcbiAgICAgICAgICAgIHJldHVybjsgLy8gYW5kIGFib3J0XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkZnNUb2dnbGVyLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHNjcmVlbmZ1bGwuZW5hYmxlZCkge1xyXG5cclxuICAgICAgICAgICAgICAgIHNjcmVlbmZ1bGwudG9nZ2xlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gU3dpdGNoIGljb24gaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICB0b2dnbGVGU0ljb24oJGZzVG9nZ2xlcik7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0Z1bGxzY3JlZW4gbm90IGVuYWJsZWQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAoc2NyZWVuZnVsbC5yYXcgJiYgc2NyZWVuZnVsbC5yYXcuZnVsbHNjcmVlbmNoYW5nZSlcclxuICAgICAgICAgICAgJGRvYy5vbihzY3JlZW5mdWxsLnJhdy5mdWxsc2NyZWVuY2hhbmdlLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHRvZ2dsZUZTSWNvbigkZnNUb2dnbGVyKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHRvZ2dsZUZTSWNvbigkZWxlbWVudCkge1xyXG4gICAgICAgICAgICBpZiAoc2NyZWVuZnVsbC5pc0Z1bGxzY3JlZW4pXHJcbiAgICAgICAgICAgICAgICAkZWxlbWVudC5jaGlsZHJlbignZW0nKS5yZW1vdmVDbGFzcygnZmEtZXhwYW5kJykuYWRkQ2xhc3MoJ2ZhLWNvbXByZXNzJyk7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICRlbGVtZW50LmNoaWxkcmVuKCdlbScpLnJlbW92ZUNsYXNzKCdmYS1jb21wcmVzcycpLmFkZENsYXNzKCdmYS1leHBhbmQnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvLyBMT0FEIENVU1RPTSBDU1NcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAkKGluaXRMb2FkQ1NTKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0TG9hZENTUygpIHtcclxuXHJcbiAgICAgICAgJCgnW2RhdGEtbG9hZC1jc3NdJykub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xyXG5cclxuICAgICAgICAgICAgdmFyIGVsZW1lbnQgPSAkKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuaXMoJ2EnKSlcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgICAgICAgIHZhciB1cmkgPSBlbGVtZW50LmRhdGEoJ2xvYWRDc3MnKSxcclxuICAgICAgICAgICAgICAgIGxpbms7XHJcblxyXG4gICAgICAgICAgICBpZiAodXJpKSB7XHJcbiAgICAgICAgICAgICAgICBsaW5rID0gY3JlYXRlTGluayh1cmkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFsaW5rKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJC5lcnJvcignRXJyb3IgY3JlYXRpbmcgc3R5bGVzaGVldCBsaW5rIGVsZW1lbnQuJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkLmVycm9yKCdObyBzdHlsZXNoZWV0IGxvY2F0aW9uIGRlZmluZWQuJyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY3JlYXRlTGluayh1cmkpIHtcclxuICAgICAgICB2YXIgbGlua0lkID0gJ2F1dG9sb2FkZWQtc3R5bGVzaGVldCcsXHJcbiAgICAgICAgICAgIG9sZExpbmsgPSAkKCcjJyArIGxpbmtJZCkuYXR0cignaWQnLCBsaW5rSWQgKyAnLW9sZCcpO1xyXG5cclxuICAgICAgICAkKCdoZWFkJykuYXBwZW5kKCQoJzxsaW5rLz4nKS5hdHRyKHtcclxuICAgICAgICAgICAgJ2lkJzogbGlua0lkLFxyXG4gICAgICAgICAgICAncmVsJzogJ3N0eWxlc2hlZXQnLFxyXG4gICAgICAgICAgICAnaHJlZic6IHVyaVxyXG4gICAgICAgIH0pKTtcclxuXHJcbiAgICAgICAgaWYgKG9sZExpbmsubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIG9sZExpbmsucmVtb3ZlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gJCgnIycgKyBsaW5rSWQpO1xyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvLyBUUkFOU0xBVElPTlxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoaW5pdFRyYW5zbGF0aW9uKTtcclxuXHJcblxyXG4gICAgdmFyIHBhdGhQcmVmaXggPSAnL0NvbnRlbnQvaTE4bic7IC8vIGZvbGRlciBvZiBqc29uIGZpbGVzXHJcbiAgICB2YXIgU1RPUkFHRUtFWSA9ICdqcS1hcHBMYW5nJztcclxuICAgIHZhciBzYXZlZExhbmd1YWdlID0gU3RvcmFnZXMubG9jYWxTdG9yYWdlLmdldChTVE9SQUdFS0VZKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0VHJhbnNsYXRpb24oKSB7XHJcbiAgICAgICAgaTE4bmV4dFxyXG4gICAgICAgICAgICAudXNlKGkxOG5leHRYSFJCYWNrZW5kKVxyXG4gICAgICAgICAgICAvLyAudXNlKExhbmd1YWdlRGV0ZWN0b3IpXHJcbiAgICAgICAgICAgIC5pbml0KHtcclxuICAgICAgICAgICAgICAgIGZhbGxiYWNrTG5nOiBzYXZlZExhbmd1YWdlIHx8ICdlbicsXHJcbiAgICAgICAgICAgICAgICBiYWNrZW5kOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9hZFBhdGg6IHBhdGhQcmVmaXggKyAnL3t7bnN9fS17e2xuZ319Lmpzb24nLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG5zOiBbJ3NpdGUnXSxcclxuICAgICAgICAgICAgICAgIGRlZmF1bHROUzogJ3NpdGUnLFxyXG4gICAgICAgICAgICAgICAgZGVidWc6IGZhbHNlXHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVyciwgdCkge1xyXG4gICAgICAgICAgICAgICAgLy8gaW5pdGlhbGl6ZSBlbGVtZW50c1xyXG4gICAgICAgICAgICAgICAgYXBwbHlUcmFubGF0aW9ucygpO1xyXG4gICAgICAgICAgICAgICAgLy8gbGlzdGVuIHRvIGxhbmd1YWdlIGNoYW5nZXNcclxuICAgICAgICAgICAgICAgIGF0dGFjaENoYW5nZUxpc3RlbmVyKCk7XHJcbiAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFwcGx5VHJhbmxhdGlvbnMoKSB7XHJcbiAgICAgICAgICAgIHZhciBsaXN0ID0gW10uc2xpY2UuY2FsbChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1sb2NhbGl6ZV0nKSlcclxuICAgICAgICAgICAgbGlzdC5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIHZhciBrZXkgPSBpdGVtLmdldEF0dHJpYnV0ZSgnZGF0YS1sb2NhbGl6ZScpXHJcbiAgICAgICAgICAgICAgICBpZiAoaTE4bmV4dC5leGlzdHMoa2V5KSkgaXRlbS5pbm5lckhUTUwgPSBpMThuZXh0LnQoa2V5KTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGF0dGFjaENoYW5nZUxpc3RlbmVyKCkge1xyXG4gICAgICAgICAgICB2YXIgbGlzdCA9IFtdLnNsaWNlLmNhbGwoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtc2V0LWxhbmddJykpXHJcbiAgICAgICAgICAgIGxpc3QuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaXRlbS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZS50YXJnZXQudGFnTmFtZSA9PT0gJ0EnKSBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxhbmcgPSBpdGVtLmdldEF0dHJpYnV0ZSgnZGF0YS1zZXQtbGFuZycpXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaTE4bmV4dC5jaGFuZ2VMYW5ndWFnZShsYW5nLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIGNvbnNvbGUubG9nKGVycilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcGx5VHJhbmxhdGlvbnMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdG9yYWdlcy5sb2NhbFN0b3JhZ2Uuc2V0KFNUT1JBR0VLRVksIGxhbmcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZhdGVEcm9wZG93bihpdGVtKVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWN0aXZhdGVEcm9wZG93bihpdGVtKSB7XHJcbiAgICAgICAgICAgIGlmIChpdGVtLmNsYXNzTGlzdC5jb250YWlucygnZHJvcGRvd24taXRlbScpKSB7XHJcbiAgICAgICAgICAgICAgICBpdGVtLnBhcmVudEVsZW1lbnQucHJldmlvdXNFbGVtZW50U2libGluZy5pbm5lckhUTUwgPSBpdGVtLmlubmVySFRNTDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG5cclxufSkoKTsiLCIvLyBOQVZCQVIgU0VBUkNIXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgJChpbml0TmF2YmFyU2VhcmNoKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0TmF2YmFyU2VhcmNoKCkge1xyXG5cclxuICAgICAgICB2YXIgbmF2U2VhcmNoID0gbmV3IG5hdmJhclNlYXJjaElucHV0KCk7XHJcblxyXG4gICAgICAgIC8vIE9wZW4gc2VhcmNoIGlucHV0XHJcbiAgICAgICAgdmFyICRzZWFyY2hPcGVuID0gJCgnW2RhdGEtc2VhcmNoLW9wZW5dJyk7XHJcblxyXG4gICAgICAgICRzZWFyY2hPcGVuXHJcbiAgICAgICAgICAgIC5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7IGUuc3RvcFByb3BhZ2F0aW9uKCk7IH0pXHJcbiAgICAgICAgICAgIC5vbignY2xpY2snLCBuYXZTZWFyY2gudG9nZ2xlKTtcclxuXHJcbiAgICAgICAgLy8gQ2xvc2Ugc2VhcmNoIGlucHV0XHJcbiAgICAgICAgdmFyICRzZWFyY2hEaXNtaXNzID0gJCgnW2RhdGEtc2VhcmNoLWRpc21pc3NdJyk7XHJcbiAgICAgICAgdmFyIGlucHV0U2VsZWN0b3IgPSAnLm5hdmJhci1mb3JtIGlucHV0W3R5cGU9XCJ0ZXh0XCJdJztcclxuXHJcbiAgICAgICAgJChpbnB1dFNlbGVjdG9yKVxyXG4gICAgICAgICAgICAub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkgeyBlLnN0b3BQcm9wYWdhdGlvbigpOyB9KVxyXG4gICAgICAgICAgICAub24oJ2tleXVwJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PSAyNykgLy8gRVNDXHJcbiAgICAgICAgICAgICAgICAgICAgbmF2U2VhcmNoLmRpc21pc3MoKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIGNsaWNrIGFueXdoZXJlIGNsb3NlcyB0aGUgc2VhcmNoXHJcbiAgICAgICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgbmF2U2VhcmNoLmRpc21pc3MpO1xyXG4gICAgICAgIC8vIGRpc21pc3NhYmxlIG9wdGlvbnNcclxuICAgICAgICAkc2VhcmNoRGlzbWlzc1xyXG4gICAgICAgICAgICAub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkgeyBlLnN0b3BQcm9wYWdhdGlvbigpOyB9KVxyXG4gICAgICAgICAgICAub24oJ2NsaWNrJywgbmF2U2VhcmNoLmRpc21pc3MpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB2YXIgbmF2YmFyU2VhcmNoSW5wdXQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbmF2YmFyRm9ybVNlbGVjdG9yID0gJ2Zvcm0ubmF2YmFyLWZvcm0nO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHRvZ2dsZTogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIG5hdmJhckZvcm0gPSAkKG5hdmJhckZvcm1TZWxlY3Rvcik7XHJcblxyXG4gICAgICAgICAgICAgICAgbmF2YmFyRm9ybS50b2dnbGVDbGFzcygnb3BlbicpO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBpc09wZW4gPSBuYXZiYXJGb3JtLmhhc0NsYXNzKCdvcGVuJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgbmF2YmFyRm9ybS5maW5kKCdpbnB1dCcpW2lzT3BlbiA/ICdmb2N1cycgOiAnYmx1ciddKCk7XHJcblxyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgZGlzbWlzczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKG5hdmJhckZvcm1TZWxlY3RvcilcclxuICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ29wZW4nKSAvLyBDbG9zZSBjb250cm9sXHJcbiAgICAgICAgICAgICAgICAgICAgLmZpbmQoJ2lucHV0W3R5cGU9XCJ0ZXh0XCJdJykuYmx1cigpIC8vIHJlbW92ZSBmb2N1c1xyXG4gICAgICAgICAgICAgICAgLy8gLnZhbCgnJykgICAgICAgICAgICAgICAgICAgIC8vIEVtcHR5IGlucHV0XHJcbiAgICAgICAgICAgICAgICA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgIH1cclxuXHJcbn0pKCk7IiwiLy8gTk9XIFRJTUVSXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgJChpbml0Tm93VGltZXIpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXROb3dUaW1lcigpIHtcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBtb21lbnQgPT09ICd1bmRlZmluZWQnKSByZXR1cm47XHJcblxyXG4gICAgICAgICQoJ1tkYXRhLW5vd10nKS5lYWNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgZWxlbWVudCA9ICQodGhpcyksXHJcbiAgICAgICAgICAgICAgICBmb3JtYXQgPSBlbGVtZW50LmRhdGEoJ2Zvcm1hdCcpO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gdXBkYXRlVGltZSgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBkdCA9IG1vbWVudChuZXcgRGF0ZSgpKS5mb3JtYXQoZm9ybWF0KTtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQudGV4dChkdCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHVwZGF0ZVRpbWUoKTtcclxuICAgICAgICAgICAgc2V0SW50ZXJ2YWwodXBkYXRlVGltZSwgMTAwMCk7XHJcblxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvLyBUb2dnbGUgUlRMIG1vZGUgZm9yIGRlbW9cclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgJChpbml0UlRMKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0UlRMKCkge1xyXG4gICAgICAgIHZhciBtYWluY3NzID0gJCgnI21haW5jc3MnKTtcclxuICAgICAgICB2YXIgYnNjc3MgPSAkKCcjYnNjc3MnKTtcclxuICAgICAgICAkKCcjY2hrLXJ0bCcpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgLy8gYXBwIHJ0bCBjaGVja1xyXG4gICAgICAgICAgICBtYWluY3NzLmF0dHIoJ2hyZWYnLCB0aGlzLmNoZWNrZWQgPyAnL0NvbnRlbnQvY3NzL2FwcC1ydGwuY3NzJyA6ICcvQ29udGVudC9jc3MvYXBwLmNzcycpO1xyXG4gICAgICAgICAgICAvLyBib290c3RyYXAgcnRsIGNoZWNrXHJcbiAgICAgICAgICAgIGJzY3NzLmF0dHIoJ2hyZWYnLCB0aGlzLmNoZWNrZWQgPyAnL0NvbnRlbnQvY3NzL2Jvb3RzdHJhcC1ydGwuY3NzJyA6ICcvQ29udGVudC9jc3MvYm9vdHN0cmFwLmNzcycpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvLyBTSURFQkFSXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoaW5pdFNpZGViYXIpO1xyXG5cclxuICAgIHZhciAkaHRtbDtcclxuICAgIHZhciAkYm9keTtcclxuICAgIHZhciAkc2lkZWJhcjtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0U2lkZWJhcigpIHtcclxuXHJcbiAgICAgICAgJGh0bWwgPSAkKCdodG1sJyk7XHJcbiAgICAgICAgJGJvZHkgPSAkKCdib2R5Jyk7XHJcbiAgICAgICAgJHNpZGViYXIgPSAkKCcuc2lkZWJhcicpO1xyXG5cclxuICAgICAgICAvLyBBVVRPQ09MTEFQU0UgSVRFTVNcclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgICAgICB2YXIgc2lkZWJhckNvbGxhcHNlID0gJHNpZGViYXIuZmluZCgnLmNvbGxhcHNlJyk7XHJcbiAgICAgICAgc2lkZWJhckNvbGxhcHNlLm9uKCdzaG93LmJzLmNvbGxhcHNlJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHJcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICBpZiAoJCh0aGlzKS5wYXJlbnRzKCcuY29sbGFwc2UnKS5sZW5ndGggPT09IDApXHJcbiAgICAgICAgICAgICAgICBzaWRlYmFyQ29sbGFwc2UuZmlsdGVyKCcuc2hvdycpLmNvbGxhcHNlKCdoaWRlJyk7XHJcblxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBTSURFQkFSIEFDVElWRSBTVEFURVxyXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgICAgIC8vIEZpbmQgY3VycmVudCBhY3RpdmUgaXRlbVxyXG4gICAgICAgIHZhciBjdXJyZW50SXRlbSA9ICQoJy5zaWRlYmFyIC5hY3RpdmUnKS5wYXJlbnRzKCdsaScpO1xyXG5cclxuICAgICAgICAvLyBob3ZlciBtb2RlIGRvbid0IHRyeSB0byBleHBhbmQgYWN0aXZlIGNvbGxhcHNlXHJcbiAgICAgICAgaWYgKCF1c2VBc2lkZUhvdmVyKCkpXHJcbiAgICAgICAgICAgIGN1cnJlbnRJdGVtXHJcbiAgICAgICAgICAgIC5hZGRDbGFzcygnYWN0aXZlJykgLy8gYWN0aXZhdGUgdGhlIHBhcmVudFxyXG4gICAgICAgICAgICAuY2hpbGRyZW4oJy5jb2xsYXBzZScpIC8vIGZpbmQgdGhlIGNvbGxhcHNlXHJcbiAgICAgICAgICAgIC5jb2xsYXBzZSgnc2hvdycpOyAvLyBhbmQgc2hvdyBpdFxyXG5cclxuICAgICAgICAvLyByZW1vdmUgdGhpcyBpZiB5b3UgdXNlIG9ubHkgY29sbGFwc2libGUgc2lkZWJhciBpdGVtc1xyXG4gICAgICAgICRzaWRlYmFyLmZpbmQoJ2xpID4gYSArIHVsJykub24oJ3Nob3cuYnMuY29sbGFwc2UnLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGlmICh1c2VBc2lkZUhvdmVyKCkpIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gU0lERUJBUiBDT0xMQVBTRUQgSVRFTSBIQU5ETEVSXHJcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcblxyXG4gICAgICAgIHZhciBldmVudE5hbWUgPSBpc1RvdWNoKCkgPyAnY2xpY2snIDogJ21vdXNlZW50ZXInO1xyXG4gICAgICAgIHZhciBzdWJOYXYgPSAkKCk7XHJcbiAgICAgICAgJHNpZGViYXIuZmluZCgnLnNpZGViYXItbmF2ID4gbGknKS5vbihldmVudE5hbWUsIGZ1bmN0aW9uKGUpIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChpc1NpZGViYXJDb2xsYXBzZWQoKSB8fCB1c2VBc2lkZUhvdmVyKCkpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBzdWJOYXYudHJpZ2dlcignbW91c2VsZWF2ZScpO1xyXG4gICAgICAgICAgICAgICAgc3ViTmF2ID0gdG9nZ2xlTWVudUl0ZW0oJCh0aGlzKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gVXNlZCB0byBkZXRlY3QgY2xpY2sgYW5kIHRvdWNoIGV2ZW50cyBvdXRzaWRlIHRoZSBzaWRlYmFyXHJcbiAgICAgICAgICAgICAgICBzaWRlYmFyQWRkQmFja2Ryb3AoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdmFyIHNpZGViYXJBbnljbGlja0Nsb3NlID0gJHNpZGViYXIuZGF0YSgnc2lkZWJhckFueWNsaWNrQ2xvc2UnKTtcclxuXHJcbiAgICAgICAgLy8gQWxsb3dzIHRvIGNsb3NlXHJcbiAgICAgICAgaWYgKHR5cGVvZiBzaWRlYmFyQW55Y2xpY2tDbG9zZSAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuXHJcbiAgICAgICAgICAgICQoJy53cmFwcGVyJykub24oJ2NsaWNrLnNpZGViYXInLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBkb24ndCBjaGVjayBpZiBzaWRlYmFyIG5vdCB2aXNpYmxlXHJcbiAgICAgICAgICAgICAgICBpZiAoISRib2R5Lmhhc0NsYXNzKCdhc2lkZS10b2dnbGVkJykpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgJHRhcmdldCA9ICQoZS50YXJnZXQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCEkdGFyZ2V0LnBhcmVudHMoJy5hc2lkZS1jb250YWluZXInKS5sZW5ndGggJiYgLy8gaWYgbm90IGNoaWxkIG9mIHNpZGViYXJcclxuICAgICAgICAgICAgICAgICAgICAhJHRhcmdldC5pcygnI3VzZXItYmxvY2stdG9nZ2xlJykgJiYgLy8gdXNlciBibG9jayB0b2dnbGUgYW5jaG9yXHJcbiAgICAgICAgICAgICAgICAgICAgISR0YXJnZXQucGFyZW50KCkuaXMoJyN1c2VyLWJsb2NrLXRvZ2dsZScpIC8vIHVzZXIgYmxvY2sgdG9nZ2xlIGljb25cclxuICAgICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICAgICRib2R5LnJlbW92ZUNsYXNzKCdhc2lkZS10b2dnbGVkJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc2lkZWJhckFkZEJhY2tkcm9wKCkge1xyXG4gICAgICAgIHZhciAkYmFja2Ryb3AgPSAkKCc8ZGl2Lz4nLCB7ICdjbGFzcyc6ICdzaWRlYWJyLWJhY2tkcm9wJyB9KTtcclxuICAgICAgICAkYmFja2Ryb3AuaW5zZXJ0QWZ0ZXIoJy5hc2lkZS1jb250YWluZXInKS5vbihcImNsaWNrIG1vdXNlZW50ZXJcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJlbW92ZUZsb2F0aW5nTmF2KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gT3BlbiB0aGUgY29sbGFwc2Ugc2lkZWJhciBzdWJtZW51IGl0ZW1zIHdoZW4gb24gdG91Y2ggZGV2aWNlc1xyXG4gICAgLy8gLSBkZXNrdG9wIG9ubHkgb3BlbnMgb24gaG92ZXJcclxuICAgIGZ1bmN0aW9uIHRvZ2dsZVRvdWNoSXRlbSgkZWxlbWVudCkge1xyXG4gICAgICAgICRlbGVtZW50XHJcbiAgICAgICAgICAgIC5zaWJsaW5ncygnbGknKVxyXG4gICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ29wZW4nKVxyXG4gICAgICAgICRlbGVtZW50XHJcbiAgICAgICAgICAgIC50b2dnbGVDbGFzcygnb3BlbicpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEhhbmRsZXMgaG92ZXIgdG8gb3BlbiBpdGVtcyB1bmRlciBjb2xsYXBzZWQgbWVudVxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIGZ1bmN0aW9uIHRvZ2dsZU1lbnVJdGVtKCRsaXN0SXRlbSkge1xyXG5cclxuICAgICAgICByZW1vdmVGbG9hdGluZ05hdigpO1xyXG5cclxuICAgICAgICB2YXIgdWwgPSAkbGlzdEl0ZW0uY2hpbGRyZW4oJ3VsJyk7XHJcblxyXG4gICAgICAgIGlmICghdWwubGVuZ3RoKSByZXR1cm4gJCgpO1xyXG4gICAgICAgIGlmICgkbGlzdEl0ZW0uaGFzQ2xhc3MoJ29wZW4nKSkge1xyXG4gICAgICAgICAgICB0b2dnbGVUb3VjaEl0ZW0oJGxpc3RJdGVtKTtcclxuICAgICAgICAgICAgcmV0dXJuICQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciAkYXNpZGUgPSAkKCcuYXNpZGUtY29udGFpbmVyJyk7XHJcbiAgICAgICAgdmFyICRhc2lkZUlubmVyID0gJCgnLmFzaWRlLWlubmVyJyk7IC8vIGZvciB0b3Agb2Zmc2V0IGNhbGN1bGF0aW9uXHJcbiAgICAgICAgLy8gZmxvYXQgYXNpZGUgdXNlcyBleHRyYSBwYWRkaW5nIG9uIGFzaWRlXHJcbiAgICAgICAgdmFyIG1hciA9IHBhcnNlSW50KCRhc2lkZUlubmVyLmNzcygncGFkZGluZy10b3AnKSwgMCkgKyBwYXJzZUludCgkYXNpZGUuY3NzKCdwYWRkaW5nLXRvcCcpLCAwKTtcclxuXHJcbiAgICAgICAgdmFyIHN1Yk5hdiA9IHVsLmNsb25lKCkuYXBwZW5kVG8oJGFzaWRlKTtcclxuXHJcbiAgICAgICAgdG9nZ2xlVG91Y2hJdGVtKCRsaXN0SXRlbSk7XHJcblxyXG4gICAgICAgIHZhciBpdGVtVG9wID0gKCRsaXN0SXRlbS5wb3NpdGlvbigpLnRvcCArIG1hcikgLSAkc2lkZWJhci5zY3JvbGxUb3AoKTtcclxuICAgICAgICB2YXIgdndIZWlnaHQgPSBkb2N1bWVudC5ib2R5LmNsaWVudEhlaWdodDtcclxuXHJcbiAgICAgICAgc3ViTmF2XHJcbiAgICAgICAgICAgIC5hZGRDbGFzcygnbmF2LWZsb2F0aW5nJylcclxuICAgICAgICAgICAgLmNzcyh7XHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogaXNGaXhlZCgpID8gJ2ZpeGVkJyA6ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgICAgICB0b3A6IGl0ZW1Ub3AsXHJcbiAgICAgICAgICAgICAgICBib3R0b206IChzdWJOYXYub3V0ZXJIZWlnaHQodHJ1ZSkgKyBpdGVtVG9wID4gdndIZWlnaHQpID8gMCA6ICdhdXRvJ1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgc3ViTmF2Lm9uKCdtb3VzZWxlYXZlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRvZ2dsZVRvdWNoSXRlbSgkbGlzdEl0ZW0pO1xyXG4gICAgICAgICAgICBzdWJOYXYucmVtb3ZlKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBzdWJOYXY7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcmVtb3ZlRmxvYXRpbmdOYXYoKSB7XHJcbiAgICAgICAgJCgnLnNpZGViYXItc3VibmF2Lm5hdi1mbG9hdGluZycpLnJlbW92ZSgpO1xyXG4gICAgICAgICQoJy5zaWRlYWJyLWJhY2tkcm9wJykucmVtb3ZlKCk7XHJcbiAgICAgICAgJCgnLnNpZGViYXIgbGkub3BlbicpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaXNUb3VjaCgpIHtcclxuICAgICAgICByZXR1cm4gJGh0bWwuaGFzQ2xhc3MoJ3RvdWNoJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaXNTaWRlYmFyQ29sbGFwc2VkKCkge1xyXG4gICAgICAgIHJldHVybiAkYm9keS5oYXNDbGFzcygnYXNpZGUtY29sbGFwc2VkJykgfHwgJGJvZHkuaGFzQ2xhc3MoJ2FzaWRlLWNvbGxhcHNlZC10ZXh0Jyk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaXNTaWRlYmFyVG9nZ2xlZCgpIHtcclxuICAgICAgICByZXR1cm4gJGJvZHkuaGFzQ2xhc3MoJ2FzaWRlLXRvZ2dsZWQnKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpc01vYmlsZSgpIHtcclxuICAgICAgICByZXR1cm4gZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aCA8IEFQUF9NRURJQVFVRVJZLnRhYmxldDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpc0ZpeGVkKCkge1xyXG4gICAgICAgIHJldHVybiAkYm9keS5oYXNDbGFzcygnbGF5b3V0LWZpeGVkJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gdXNlQXNpZGVIb3ZlcigpIHtcclxuICAgICAgICByZXR1cm4gJGJvZHkuaGFzQ2xhc3MoJ2FzaWRlLWhvdmVyJyk7XHJcbiAgICB9XHJcblxyXG59KSgpOyIsIi8vIFNMSU1TQ1JPTExcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAkKGluaXRTbGltc1Nyb2xsKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0U2xpbXNTcm9sbCgpIHtcclxuXHJcbiAgICAgICAgaWYgKCEkLmZuIHx8ICEkLmZuLnNsaW1TY3JvbGwpIHJldHVybjtcclxuXHJcbiAgICAgICAgJCgnW2RhdGEtc2Nyb2xsYWJsZV0nKS5lYWNoKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgdmFyIGVsZW1lbnQgPSAkKHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgZGVmYXVsdEhlaWdodCA9IDI1MDtcclxuXHJcbiAgICAgICAgICAgIGVsZW1lbnQuc2xpbVNjcm9sbCh7XHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IChlbGVtZW50LmRhdGEoJ2hlaWdodCcpIHx8IGRlZmF1bHRIZWlnaHQpXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbn0pKCk7IiwiLy8gVGFibGUgQ2hlY2sgQWxsXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgJChpbml0VGFibGVDaGVja0FsbCk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFRhYmxlQ2hlY2tBbGwoKSB7XHJcblxyXG4gICAgICAgICQoJ1tkYXRhLWNoZWNrLWFsbF0nKS5vbignY2hhbmdlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyksXHJcbiAgICAgICAgICAgICAgICBpbmRleCA9ICR0aGlzLmluZGV4KCkgKyAxLFxyXG4gICAgICAgICAgICAgICAgY2hlY2tib3ggPSAkdGhpcy5maW5kKCdpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKSxcclxuICAgICAgICAgICAgICAgIHRhYmxlID0gJHRoaXMucGFyZW50cygndGFibGUnKTtcclxuICAgICAgICAgICAgLy8gTWFrZSBzdXJlIHRvIGFmZmVjdCBvbmx5IHRoZSBjb3JyZWN0IGNoZWNrYm94IGNvbHVtblxyXG4gICAgICAgICAgICB0YWJsZS5maW5kKCd0Ym9keSA+IHRyID4gdGQ6bnRoLWNoaWxkKCcgKyBpbmRleCArICcpIGlucHV0W3R5cGU9XCJjaGVja2JveFwiXScpXHJcbiAgICAgICAgICAgICAgICAucHJvcCgnY2hlY2tlZCcsIGNoZWNrYm94WzBdLmNoZWNrZWQpO1xyXG5cclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9XHJcblxyXG59KSgpOyIsIi8vIFRPR0dMRSBTVEFURVxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoaW5pdFRvZ2dsZVN0YXRlKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0VG9nZ2xlU3RhdGUoKSB7XHJcblxyXG4gICAgICAgIHZhciAkYm9keSA9ICQoJ2JvZHknKTtcclxuICAgICAgICB2YXIgdG9nZ2xlID0gbmV3IFN0YXRlVG9nZ2xlcigpO1xyXG5cclxuICAgICAgICAkKCdbZGF0YS10b2dnbGUtc3RhdGVdJylcclxuICAgICAgICAgICAgLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIC8vIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgZWxlbWVudCA9ICQodGhpcyksXHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NuYW1lID0gZWxlbWVudC5kYXRhKCd0b2dnbGVTdGF0ZScpLFxyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldCA9IGVsZW1lbnQuZGF0YSgndGFyZ2V0JyksXHJcbiAgICAgICAgICAgICAgICAgICAgbm9QZXJzaXN0ID0gKGVsZW1lbnQuYXR0cignZGF0YS1uby1wZXJzaXN0JykgIT09IHVuZGVmaW5lZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gU3BlY2lmeSBhIHRhcmdldCBzZWxlY3RvciB0byB0b2dnbGUgY2xhc3NuYW1lXHJcbiAgICAgICAgICAgICAgICAvLyB1c2UgYm9keSBieSBkZWZhdWx0XHJcbiAgICAgICAgICAgICAgICB2YXIgJHRhcmdldCA9IHRhcmdldCA/ICQodGFyZ2V0KSA6ICRib2R5O1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChjbGFzc25hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoJHRhcmdldC5oYXNDbGFzcyhjbGFzc25hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR0YXJnZXQucmVtb3ZlQ2xhc3MoY2xhc3NuYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFub1BlcnNpc3QpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2dnbGUucmVtb3ZlU3RhdGUoY2xhc3NuYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGFyZ2V0LmFkZENsYXNzKGNsYXNzbmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbm9QZXJzaXN0KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9nZ2xlLmFkZFN0YXRlKGNsYXNzbmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBzb21lIGVsZW1lbnRzIG1heSBuZWVkIHRoaXMgd2hlbiB0b2dnbGVkIGNsYXNzIGNoYW5nZSB0aGUgY29udGVudCBzaXplXHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mKEV2ZW50KSA9PT0gJ2Z1bmN0aW9uJykgeyAvLyBtb2Rlcm4gYnJvd3NlcnNcclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ3Jlc2l6ZScpKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7IC8vIG9sZCBicm93c2VycyBhbmQgSUVcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzaXplRXZlbnQgPSB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ1VJRXZlbnRzJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzaXplRXZlbnQuaW5pdFVJRXZlbnQoJ3Jlc2l6ZScsIHRydWUsIGZhbHNlLCB3aW5kb3csIDApO1xyXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5kaXNwYXRjaEV2ZW50KHJlc2l6ZUV2ZW50KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIEhhbmRsZSBzdGF0ZXMgdG8vZnJvbSBsb2NhbHN0b3JhZ2VcclxuICAgIHZhciBTdGF0ZVRvZ2dsZXIgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgdmFyIFNUT1JBR0VfS0VZX05BTUUgPSAnanEtdG9nZ2xlU3RhdGUnO1xyXG5cclxuICAgICAgICAvKiogQWRkIGEgc3RhdGUgdG8gdGhlIGJyb3dzZXIgc3RvcmFnZSB0byBiZSByZXN0b3JlZCBsYXRlciAqL1xyXG4gICAgICAgIHRoaXMuYWRkU3RhdGUgPSBmdW5jdGlvbihjbGFzc25hbWUpIHtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSBTdG9yYWdlcy5sb2NhbFN0b3JhZ2UuZ2V0KFNUT1JBR0VfS0VZX05BTUUpO1xyXG4gICAgICAgICAgICBpZiAoZGF0YSBpbnN0YW5jZW9mIEFycmF5KSBkYXRhLnB1c2goY2xhc3NuYW1lKTtcclxuICAgICAgICAgICAgZWxzZSBkYXRhID0gW2NsYXNzbmFtZV07XHJcbiAgICAgICAgICAgIFN0b3JhZ2VzLmxvY2FsU3RvcmFnZS5zZXQoU1RPUkFHRV9LRVlfTkFNRSwgZGF0YSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICAvKiogUmVtb3ZlIGEgc3RhdGUgZnJvbSB0aGUgYnJvd3NlciBzdG9yYWdlICovXHJcbiAgICAgICAgdGhpcy5yZW1vdmVTdGF0ZSA9IGZ1bmN0aW9uKGNsYXNzbmFtZSkge1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IFN0b3JhZ2VzLmxvY2FsU3RvcmFnZS5nZXQoU1RPUkFHRV9LRVlfTkFNRSk7XHJcbiAgICAgICAgICAgIGlmIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSBkYXRhLmluZGV4T2YoY2xhc3NuYW1lKTtcclxuICAgICAgICAgICAgICAgIGlmIChpbmRleCAhPT0gLTEpIGRhdGEuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgICAgIFN0b3JhZ2VzLmxvY2FsU3RvcmFnZS5zZXQoU1RPUkFHRV9LRVlfTkFNRSwgZGF0YSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIC8qKiBMb2FkIHRoZSBzdGF0ZSBzdHJpbmcgYW5kIHJlc3RvcmUgdGhlIGNsYXNzbGlzdCAqL1xyXG4gICAgICAgIHRoaXMucmVzdG9yZVN0YXRlID0gZnVuY3Rpb24oJGVsZW0pIHtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSBTdG9yYWdlcy5sb2NhbFN0b3JhZ2UuZ2V0KFNUT1JBR0VfS0VZX05BTUUpO1xyXG4gICAgICAgICAgICBpZiAoZGF0YSBpbnN0YW5jZW9mIEFycmF5KVxyXG4gICAgICAgICAgICAgICAgJGVsZW0uYWRkQ2xhc3MoZGF0YS5qb2luKCcgJykpO1xyXG4gICAgICAgIH07XHJcbiAgICB9O1xyXG5cclxuICAgIHdpbmRvdy5TdGF0ZVRvZ2dsZXIgPSBTdGF0ZVRvZ2dsZXI7XHJcblxyXG59KSgpOyIsIi8qKj09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBNb2R1bGU6IHRyaWdnZXItcmVzaXplLmpzXHJcbiAqIFRyaWdnZXJzIGEgd2luZG93IHJlc2l6ZSBldmVudCBmcm9tIGFueSBlbGVtZW50XHJcbiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0qL1xyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoaW5pdFRyaWdnZXJSZXNpemUpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRUcmlnZ2VyUmVzaXplKCkge1xyXG4gICAgICAgIHZhciBlbGVtZW50ID0gJCgnW2RhdGEtdHJpZ2dlci1yZXNpemVdJyk7XHJcbiAgICAgICAgdmFyIHZhbHVlID0gZWxlbWVudC5kYXRhKCd0cmlnZ2VyUmVzaXplJylcclxuICAgICAgICBlbGVtZW50Lm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy8gYWxsIElFIGZyaWVuZGx5IGRpc3BhdGNoRXZlbnRcclxuICAgICAgICAgICAgICAgIHZhciBldnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnVUlFdmVudHMnKTtcclxuICAgICAgICAgICAgICAgIGV2dC5pbml0VUlFdmVudCgncmVzaXplJywgdHJ1ZSwgZmFsc2UsIHdpbmRvdywgMCk7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudChldnQpO1xyXG4gICAgICAgICAgICAgICAgLy8gbW9kZXJuIGRpc3BhdGNoRXZlbnQgd2F5XHJcbiAgICAgICAgICAgICAgICAvLyB3aW5kb3cuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ3Jlc2l6ZScpKTtcclxuICAgICAgICAgICAgfSwgdmFsdWUgfHwgMzAwKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbn0pKCk7IiwiLy8gRGVtbyBDYXJkc1xyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoaW5pdENhcmREZW1vKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0Q2FyZERlbW8oKSB7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRoaXMgZnVuY3Rpb25zIHNob3cgYSBkZW1vbnN0cmF0aW9uIG9mIGhvdyB0byB1c2VcclxuICAgICAgICAgKiB0aGUgY2FyZCB0b29scyBzeXN0ZW0gdmlhIGN1c3RvbSBldmVudC5cclxuICAgICAgICAgKi9cclxuICAgICAgICB2YXIgY2FyZExpc3QgPSBbXS5zbGljZS5jYWxsKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jYXJkLmNhcmQtZGVtbycpKTtcclxuICAgICAgICBjYXJkTGlzdC5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcclxuXHJcbiAgICAgICAgICAgIGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignY2FyZC5yZWZyZXNoJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIC8vIGdldCB0aGUgY2FyZCBlbGVtZW50IHRoYXQgaXMgcmVmcmVzaGluZ1xyXG4gICAgICAgICAgICAgICAgdmFyIGNhcmQgPSBldmVudC5kZXRhaWwuY2FyZDtcclxuICAgICAgICAgICAgICAgIC8vIHBlcmZvcm0gYW55IGFjdGlvbiBoZXJlLCB3aGVuIGl0IGlzIGRvbmUsXHJcbiAgICAgICAgICAgICAgICAvLyByZW1vdmUgdGhlIHNwaW5uZXIgY2FsbGluZyBcInJlbW92ZVNwaW5uZXJcIlxyXG4gICAgICAgICAgICAgICAgLy8gc2V0VGltZW91dCB1c2VkIHRvIHNpbXVsYXRlIGFzeW5jIG9wZXJhdGlvblxyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChjYXJkLnJlbW92ZVNwaW5uZXIsIDMwMDApO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NhcmQuY29sbGFwc2UuaGlkZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0NhcmQgQ29sbGFwc2UgSGlkZScpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NhcmQuY29sbGFwc2Uuc2hvdycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0NhcmQgQ29sbGFwc2UgU2hvdycpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NhcmQucmVtb3ZlJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIHZhciBjb25maXJtID0gZXZlbnQuZGV0YWlsLmNvbmZpcm07XHJcbiAgICAgICAgICAgICAgICB2YXIgY2FuY2VsID0gZXZlbnQuZGV0YWlsLmNhbmNlbDtcclxuICAgICAgICAgICAgICAgIC8vIHBlcmZvcm0gYW55IGFjdGlvbiAgaGVyZVxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1JlbW92aW5nIENhcmQnKTtcclxuICAgICAgICAgICAgICAgIC8vIENhbGwgY29uZmlybSgpIHRvIGNvbnRpbnVlIHJlbW92aW5nIGNhcmRcclxuICAgICAgICAgICAgICAgIC8vIG90aGVyd2lzZSBjYWxsIGNhbmNlbCgpXHJcbiAgICAgICAgICAgICAgICBjb25maXJtKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignY2FyZC5yZW1vdmVkJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdSZW1vdmVkIENhcmQnKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvLyBOZXN0YWJsZSBkZW1vXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgJChpbml0TmVzdGFibGUpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXROZXN0YWJsZSgpIHtcclxuXHJcbiAgICAgICAgaWYgKCEkLmZuLm5lc3RhYmxlKSByZXR1cm47XHJcblxyXG4gICAgICAgIHZhciB1cGRhdGVPdXRwdXQgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIHZhciBsaXN0ID0gZS5sZW5ndGggPyBlIDogJChlLnRhcmdldCksXHJcbiAgICAgICAgICAgICAgICBvdXRwdXQgPSBsaXN0LmRhdGEoJ291dHB1dCcpO1xyXG4gICAgICAgICAgICBpZiAod2luZG93LkpTT04pIHtcclxuICAgICAgICAgICAgICAgIG91dHB1dC52YWwod2luZG93LkpTT04uc3RyaW5naWZ5KGxpc3QubmVzdGFibGUoJ3NlcmlhbGl6ZScpKSk7IC8vLCBudWxsLCAyKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBvdXRwdXQudmFsKCdKU09OIGJyb3dzZXIgc3VwcG9ydCByZXF1aXJlZCBmb3IgdGhpcyBkZW1vLicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gYWN0aXZhdGUgTmVzdGFibGUgZm9yIGxpc3QgMVxyXG4gICAgICAgICQoJyNuZXN0YWJsZScpLm5lc3RhYmxlKHtcclxuICAgICAgICAgICAgICAgIGdyb3VwOiAxXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5vbignY2hhbmdlJywgdXBkYXRlT3V0cHV0KTtcclxuXHJcbiAgICAgICAgLy8gYWN0aXZhdGUgTmVzdGFibGUgZm9yIGxpc3QgMlxyXG4gICAgICAgICQoJyNuZXN0YWJsZTInKS5uZXN0YWJsZSh7XHJcbiAgICAgICAgICAgICAgICBncm91cDogMVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAub24oJ2NoYW5nZScsIHVwZGF0ZU91dHB1dCk7XHJcblxyXG4gICAgICAgIC8vIG91dHB1dCBpbml0aWFsIHNlcmlhbGlzZWQgZGF0YVxyXG4gICAgICAgIHVwZGF0ZU91dHB1dCgkKCcjbmVzdGFibGUnKS5kYXRhKCdvdXRwdXQnLCAkKCcjbmVzdGFibGUtb3V0cHV0JykpKTtcclxuICAgICAgICB1cGRhdGVPdXRwdXQoJCgnI25lc3RhYmxlMicpLmRhdGEoJ291dHB1dCcsICQoJyNuZXN0YWJsZTItb3V0cHV0JykpKTtcclxuXHJcbiAgICAgICAgJCgnLmpzLW5lc3RhYmxlLWFjdGlvbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgdmFyIHRhcmdldCA9ICQoZS50YXJnZXQpLFxyXG4gICAgICAgICAgICAgICAgYWN0aW9uID0gdGFyZ2V0LmRhdGEoJ2FjdGlvbicpO1xyXG4gICAgICAgICAgICBpZiAoYWN0aW9uID09PSAnZXhwYW5kLWFsbCcpIHtcclxuICAgICAgICAgICAgICAgICQoJy5kZCcpLm5lc3RhYmxlKCdleHBhbmRBbGwnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoYWN0aW9uID09PSAnY29sbGFwc2UtYWxsJykge1xyXG4gICAgICAgICAgICAgICAgJCgnLmRkJykubmVzdGFibGUoJ2NvbGxhcHNlQWxsJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9XHJcblxyXG59KSgpOyIsIi8qKj09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBNb2R1bGU6IG5vdGlmeS5qc1xyXG4gKiBDcmVhdGUgdG9nZ2xlYWJsZSBub3RpZmljYXRpb25zIHRoYXQgZmFkZSBvdXQgYXV0b21hdGljYWxseS5cclxuICogQmFzZWQgb24gTm90aWZ5IGFkZG9uIGZyb20gVUlLaXQgKGh0dHA6Ly9nZXR1aWtpdC5jb20vZG9jcy9hZGRvbnNfbm90aWZ5Lmh0bWwpXHJcbiAqIFtkYXRhLXRvZ2dsZT1cIm5vdGlmeVwiXVxyXG4gKiBbZGF0YS1vcHRpb25zPVwib3B0aW9ucyBpbiBqc29uIGZvcm1hdFwiIF1cclxuID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSovXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgJChpbml0Tm90aWZ5KTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0Tm90aWZ5KCkge1xyXG5cclxuICAgICAgICB2YXIgU2VsZWN0b3IgPSAnW2RhdGEtbm90aWZ5XScsXHJcbiAgICAgICAgICAgIGF1dG9sb2FkU2VsZWN0b3IgPSAnW2RhdGEtb25sb2FkXScsXHJcbiAgICAgICAgICAgIGRvYyA9ICQoZG9jdW1lbnQpO1xyXG5cclxuICAgICAgICAkKFNlbGVjdG9yKS5lYWNoKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKSxcclxuICAgICAgICAgICAgICAgIG9ubG9hZCA9ICR0aGlzLmRhdGEoJ29ubG9hZCcpO1xyXG5cclxuICAgICAgICAgICAgaWYgKG9ubG9hZCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vdGlmeU5vdygkdGhpcyk7XHJcbiAgICAgICAgICAgICAgICB9LCA4MDApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAkdGhpcy5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBub3RpZnlOb3coJHRoaXMpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG5vdGlmeU5vdygkZWxlbWVudCkge1xyXG4gICAgICAgIHZhciBtZXNzYWdlID0gJGVsZW1lbnQuZGF0YSgnbWVzc2FnZScpLFxyXG4gICAgICAgICAgICBvcHRpb25zID0gJGVsZW1lbnQuZGF0YSgnb3B0aW9ucycpO1xyXG5cclxuICAgICAgICBpZiAoIW1lc3NhZ2UpXHJcbiAgICAgICAgICAgICQuZXJyb3IoJ05vdGlmeTogTm8gbWVzc2FnZSBzcGVjaWZpZWQnKTtcclxuXHJcbiAgICAgICAgJC5ub3RpZnkobWVzc2FnZSwgb3B0aW9ucyB8fCB7fSk7XHJcbiAgICB9XHJcblxyXG5cclxufSkoKTtcclxuXHJcblxyXG4vKipcclxuICogTm90aWZ5IEFkZG9uIGRlZmluaXRpb24gYXMgalF1ZXJ5IHBsdWdpblxyXG4gKiBBZGFwdGVkIHZlcnNpb24gdG8gd29yayB3aXRoIEJvb3RzdHJhcCBjbGFzc2VzXHJcbiAqIE1vcmUgaW5mb3JtYXRpb24gaHR0cDovL2dldHVpa2l0LmNvbS9kb2NzL2FkZG9uc19ub3RpZnkuaHRtbFxyXG4gKi9cclxuXHJcbihmdW5jdGlvbigpIHtcclxuXHJcbiAgICB2YXIgY29udGFpbmVycyA9IHt9LFxyXG4gICAgICAgIG1lc3NhZ2VzID0ge30sXHJcblxyXG4gICAgICAgIG5vdGlmeSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcclxuXHJcbiAgICAgICAgICAgIGlmICgkLnR5cGUob3B0aW9ucykgPT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB7IG1lc3NhZ2U6IG9wdGlvbnMgfTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGFyZ3VtZW50c1sxXSkge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9ICQuZXh0ZW5kKG9wdGlvbnMsICQudHlwZShhcmd1bWVudHNbMV0pID09ICdzdHJpbmcnID8geyBzdGF0dXM6IGFyZ3VtZW50c1sxXSB9IDogYXJndW1lbnRzWzFdKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIChuZXcgTWVzc2FnZShvcHRpb25zKSkuc2hvdygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY2xvc2VBbGwgPSBmdW5jdGlvbihncm91cCwgaW5zdGFudGx5KSB7XHJcbiAgICAgICAgICAgIGlmIChncm91cCkge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaWQgaW4gbWVzc2FnZXMpIHsgaWYgKGdyb3VwID09PSBtZXNzYWdlc1tpZF0uZ3JvdXApIG1lc3NhZ2VzW2lkXS5jbG9zZShpbnN0YW50bHkpOyB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpZCBpbiBtZXNzYWdlcykgeyBtZXNzYWdlc1tpZF0uY2xvc2UoaW5zdGFudGx5KTsgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICB2YXIgTWVzc2FnZSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcclxuXHJcbiAgICAgICAgdmFyICR0aGlzID0gdGhpcztcclxuXHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIE1lc3NhZ2UuZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgICB0aGlzLnV1aWQgPSBcIklEXCIgKyAobmV3IERhdGUoKS5nZXRUaW1lKCkpICsgXCJSQU5EXCIgKyAoTWF0aC5jZWlsKE1hdGgucmFuZG9tKCkgKiAxMDAwMDApKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQgPSAkKFtcclxuICAgICAgICAgICAgLy8gYWxlcnQtZGlzbWlzc2FibGUgZW5hYmxlcyBicyBjbG9zZSBpY29uXHJcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwidWstbm90aWZ5LW1lc3NhZ2UgYWxlcnQtZGlzbWlzc2FibGVcIj4nLFxyXG4gICAgICAgICAgICAnPGEgY2xhc3M9XCJjbG9zZVwiPiZ0aW1lczs8L2E+JyxcclxuICAgICAgICAgICAgJzxkaXY+JyArIHRoaXMub3B0aW9ucy5tZXNzYWdlICsgJzwvZGl2PicsXHJcbiAgICAgICAgICAgICc8L2Rpdj4nXHJcblxyXG4gICAgICAgIF0uam9pbignJykpLmRhdGEoXCJub3RpZnlNZXNzYWdlXCIsIHRoaXMpO1xyXG5cclxuICAgICAgICAvLyBzdGF0dXNcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnN0YXR1cykge1xyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuYWRkQ2xhc3MoJ2FsZXJ0IGFsZXJ0LScgKyB0aGlzLm9wdGlvbnMuc3RhdHVzKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50c3RhdHVzID0gdGhpcy5vcHRpb25zLnN0YXR1cztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSB0aGlzLm9wdGlvbnMuZ3JvdXA7XHJcblxyXG4gICAgICAgIG1lc3NhZ2VzW3RoaXMudXVpZF0gPSB0aGlzO1xyXG5cclxuICAgICAgICBpZiAoIWNvbnRhaW5lcnNbdGhpcy5vcHRpb25zLnBvc10pIHtcclxuICAgICAgICAgICAgY29udGFpbmVyc1t0aGlzLm9wdGlvbnMucG9zXSA9ICQoJzxkaXYgY2xhc3M9XCJ1ay1ub3RpZnkgdWstbm90aWZ5LScgKyB0aGlzLm9wdGlvbnMucG9zICsgJ1wiPjwvZGl2PicpLmFwcGVuZFRvKCdib2R5Jykub24oXCJjbGlja1wiLCBcIi51ay1ub3RpZnktbWVzc2FnZVwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQodGhpcykuZGF0YShcIm5vdGlmeU1lc3NhZ2VcIikuY2xvc2UoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcblxyXG4gICAgJC5leHRlbmQoTWVzc2FnZS5wcm90b3R5cGUsIHtcclxuXHJcbiAgICAgICAgdXVpZDogZmFsc2UsXHJcbiAgICAgICAgZWxlbWVudDogZmFsc2UsXHJcbiAgICAgICAgdGltb3V0OiBmYWxzZSxcclxuICAgICAgICBjdXJyZW50c3RhdHVzOiBcIlwiLFxyXG4gICAgICAgIGdyb3VwOiBmYWxzZSxcclxuXHJcbiAgICAgICAgc2hvdzogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5lbGVtZW50LmlzKFwiOnZpc2libGVcIikpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIHZhciAkdGhpcyA9IHRoaXM7XHJcblxyXG4gICAgICAgICAgICBjb250YWluZXJzW3RoaXMub3B0aW9ucy5wb3NdLnNob3coKS5wcmVwZW5kKHRoaXMuZWxlbWVudCk7XHJcblxyXG4gICAgICAgICAgICB2YXIgbWFyZ2luYm90dG9tID0gcGFyc2VJbnQodGhpcy5lbGVtZW50LmNzcyhcIm1hcmdpbi1ib3R0b21cIiksIDEwKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5jc3MoeyBcIm9wYWNpdHlcIjogMCwgXCJtYXJnaW4tdG9wXCI6IC0xICogdGhpcy5lbGVtZW50Lm91dGVySGVpZ2h0KCksIFwibWFyZ2luLWJvdHRvbVwiOiAwIH0pLmFuaW1hdGUoeyBcIm9wYWNpdHlcIjogMSwgXCJtYXJnaW4tdG9wXCI6IDAsIFwibWFyZ2luLWJvdHRvbVwiOiBtYXJnaW5ib3R0b20gfSwgZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCR0aGlzLm9wdGlvbnMudGltZW91dCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgY2xvc2VmbiA9IGZ1bmN0aW9uKCkgeyAkdGhpcy5jbG9zZSgpOyB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dChjbG9zZWZuLCAkdGhpcy5vcHRpb25zLnRpbWVvdXQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkdGhpcy5lbGVtZW50LmhvdmVyKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbigpIHsgY2xlYXJUaW1lb3V0KCR0aGlzLnRpbWVvdXQpOyB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbigpIHsgJHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQoY2xvc2VmbiwgJHRoaXMub3B0aW9ucy50aW1lb3V0KTsgfVxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGNsb3NlOiBmdW5jdGlvbihpbnN0YW50bHkpIHtcclxuXHJcbiAgICAgICAgICAgIHZhciAkdGhpcyA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBmaW5hbGl6ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICR0aGlzLmVsZW1lbnQucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghY29udGFpbmVyc1skdGhpcy5vcHRpb25zLnBvc10uY2hpbGRyZW4oKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyc1skdGhpcy5vcHRpb25zLnBvc10uaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIG1lc3NhZ2VzWyR0aGlzLnV1aWRdO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnRpbWVvdXQpIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGluc3RhbnRseSkge1xyXG4gICAgICAgICAgICAgICAgZmluYWxpemUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5hbmltYXRlKHsgXCJvcGFjaXR5XCI6IDAsIFwibWFyZ2luLXRvcFwiOiAtMSAqIHRoaXMuZWxlbWVudC5vdXRlckhlaWdodCgpLCBcIm1hcmdpbi1ib3R0b21cIjogMCB9LCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBmaW5hbGl6ZSgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBjb250ZW50OiBmdW5jdGlvbihodG1sKSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgY29udGFpbmVyID0gdGhpcy5lbGVtZW50LmZpbmQoXCI+ZGl2XCIpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFodG1sKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY29udGFpbmVyLmh0bWwoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29udGFpbmVyLmh0bWwoaHRtbCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBzdGF0dXM6IGZ1bmN0aW9uKHN0YXR1cykge1xyXG5cclxuICAgICAgICAgICAgaWYgKCFzdGF0dXMpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRzdGF0dXM7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVDbGFzcygnYWxlcnQgYWxlcnQtJyArIHRoaXMuY3VycmVudHN0YXR1cykuYWRkQ2xhc3MoJ2FsZXJ0IGFsZXJ0LScgKyBzdGF0dXMpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50c3RhdHVzID0gc3RhdHVzO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgTWVzc2FnZS5kZWZhdWx0cyA9IHtcclxuICAgICAgICBtZXNzYWdlOiBcIlwiLFxyXG4gICAgICAgIHN0YXR1czogXCJub3JtYWxcIixcclxuICAgICAgICB0aW1lb3V0OiA1MDAwLFxyXG4gICAgICAgIGdyb3VwOiBudWxsLFxyXG4gICAgICAgIHBvczogJ3RvcC1jZW50ZXInXHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAkW1wibm90aWZ5XCJdID0gbm90aWZ5O1xyXG4gICAgJFtcIm5vdGlmeVwiXS5tZXNzYWdlID0gTWVzc2FnZTtcclxuICAgICRbXCJub3RpZnlcIl0uY2xvc2VBbGwgPSBjbG9zZUFsbDtcclxuXHJcbiAgICByZXR1cm4gbm90aWZ5O1xyXG5cclxufSgpKTsiLCIvKio9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogTW9kdWxlOiBwb3J0bGV0LmpzXHJcbiAqIERyYWcgYW5kIGRyb3AgYW55IGNhcmQgdG8gY2hhbmdlIGl0cyBwb3NpdGlvblxyXG4gKiBUaGUgU2VsZWN0b3Igc2hvdWxkIGNvdWxkIGJlIGFwcGxpZWQgdG8gYW55IG9iamVjdCB0aGF0IGNvbnRhaW5zXHJcbiAqIGNhcmQsIHNvIC5jb2wtKiBlbGVtZW50IGFyZSBpZGVhbC5cclxuID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSovXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgdmFyIFNUT1JBR0VfS0VZX05BTUUgPSAnanEtcG9ydGxldFN0YXRlJztcclxuXHJcbiAgICAkKGluaXRQb3J0bGV0cyk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFBvcnRsZXRzKCkge1xyXG5cclxuICAgICAgICAvLyBDb21wb25lbnQgaXMgTk9UIG9wdGlvbmFsXHJcbiAgICAgICAgaWYgKCEkLmZuLnNvcnRhYmxlKSByZXR1cm47XHJcblxyXG4gICAgICAgIHZhciBTZWxlY3RvciA9ICdbZGF0YS10b2dnbGU9XCJwb3J0bGV0XCJdJztcclxuXHJcbiAgICAgICAgJChTZWxlY3Rvcikuc29ydGFibGUoe1xyXG4gICAgICAgICAgICBjb25uZWN0V2l0aDogICAgICAgICAgU2VsZWN0b3IsXHJcbiAgICAgICAgICAgIGl0ZW1zOiAgICAgICAgICAgICAgICAnZGl2LmNhcmQnLFxyXG4gICAgICAgICAgICBoYW5kbGU6ICAgICAgICAgICAgICAgJy5wb3J0bGV0LWhhbmRsZXInLFxyXG4gICAgICAgICAgICBvcGFjaXR5OiAgICAgICAgICAgICAgMC43LFxyXG4gICAgICAgICAgICBwbGFjZWhvbGRlcjogICAgICAgICAgJ3BvcnRsZXQgYm94LXBsYWNlaG9sZGVyJyxcclxuICAgICAgICAgICAgY2FuY2VsOiAgICAgICAgICAgICAgICcucG9ydGxldC1jYW5jZWwnLFxyXG4gICAgICAgICAgICBmb3JjZVBsYWNlaG9sZGVyU2l6ZTogdHJ1ZSxcclxuICAgICAgICAgICAgaWZyYW1lRml4OiAgICAgICAgICAgIGZhbHNlLFxyXG4gICAgICAgICAgICB0b2xlcmFuY2U6ICAgICAgICAgICAgJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICBoZWxwZXI6ICAgICAgICAgICAgICAgJ29yaWdpbmFsJyxcclxuICAgICAgICAgICAgcmV2ZXJ0OiAgICAgICAgICAgICAgIDIwMCxcclxuICAgICAgICAgICAgZm9yY2VIZWxwZXJTaXplOiAgICAgIHRydWUsXHJcbiAgICAgICAgICAgIHVwZGF0ZTogICAgICAgICAgICAgICBzYXZlUG9ydGxldE9yZGVyLFxyXG4gICAgICAgICAgICBjcmVhdGU6ICAgICAgICAgICAgICAgbG9hZFBvcnRsZXRPcmRlclxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLy8gb3B0aW9uYWxseSBkaXNhYmxlcyBtb3VzZSBzZWxlY3Rpb25cclxuICAgICAgICAvLy5kaXNhYmxlU2VsZWN0aW9uKClcclxuICAgICAgICA7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNhdmVQb3J0bGV0T3JkZXIoZXZlbnQsIHVpKSB7XHJcblxyXG4gICAgICAgIHZhciBkYXRhID0gU3RvcmFnZXMubG9jYWxTdG9yYWdlLmdldChTVE9SQUdFX0tFWV9OQU1FKTtcclxuXHJcbiAgICAgICAgaWYgKCFkYXRhKSB7IGRhdGEgPSB7fTsgfVxyXG5cclxuICAgICAgICBkYXRhW3RoaXMuaWRdID0gJCh0aGlzKS5zb3J0YWJsZSgndG9BcnJheScpO1xyXG5cclxuICAgICAgICBpZiAoZGF0YSkge1xyXG4gICAgICAgICAgICBTdG9yYWdlcy5sb2NhbFN0b3JhZ2Uuc2V0KFNUT1JBR0VfS0VZX05BTUUsIGRhdGEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbG9hZFBvcnRsZXRPcmRlcigpIHtcclxuXHJcbiAgICAgICAgdmFyIGRhdGEgPSBTdG9yYWdlcy5sb2NhbFN0b3JhZ2UuZ2V0KFNUT1JBR0VfS0VZX05BTUUpO1xyXG5cclxuICAgICAgICBpZiAoZGF0YSkge1xyXG5cclxuICAgICAgICAgICAgdmFyIHBvcmxldElkID0gdGhpcy5pZCxcclxuICAgICAgICAgICAgICAgIGNhcmRzID0gZGF0YVtwb3JsZXRJZF07XHJcblxyXG4gICAgICAgICAgICBpZiAoY2FyZHMpIHtcclxuICAgICAgICAgICAgICAgIHZhciBwb3J0bGV0ID0gJCgnIycgKyBwb3JsZXRJZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgJC5lYWNoKGNhcmRzLCBmdW5jdGlvbihpbmRleCwgdmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKCcjJyArIHZhbHVlKS5hcHBlbmRUbyhwb3J0bGV0KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmVzZXQgcG9ybGV0IHNhdmUgc3RhdGVcclxuICAgIHdpbmRvdy5yZXNldFBvcmxldHMgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgU3RvcmFnZXMubG9jYWxTdG9yYWdlLnJlbW92ZShTVE9SQUdFX0tFWV9OQU1FKTtcclxuICAgICAgICAvLyByZWxvYWQgdGhlIHBhZ2VcclxuICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICB9XHJcblxyXG59KSgpOyIsIi8vIEhUTUw1IFNvcnRhYmxlIGRlbW9cclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAkKGluaXRTb3J0YWJsZSk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFNvcnRhYmxlKCkge1xyXG5cclxuICAgICAgICBpZiAodHlwZW9mIHNvcnRhYmxlID09PSAndW5kZWZpbmVkJykgcmV0dXJuO1xyXG5cclxuICAgICAgICBzb3J0YWJsZSgnLnNvcnRhYmxlJywge1xyXG4gICAgICAgICAgICBmb3JjZVBsYWNlaG9sZGVyU2l6ZTogdHJ1ZSxcclxuICAgICAgICAgICAgcGxhY2Vob2xkZXI6ICc8ZGl2IGNsYXNzPVwiYm94LXBsYWNlaG9sZGVyIHAwIG0wXCI+PGRpdj48L2Rpdj48L2Rpdj4nXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvLyBTd2VldCBBbGVydFxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoaW5pdFN3ZWV0QWxlcnQpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRTd2VldEFsZXJ0KCkge1xyXG5cclxuICAgICAgICAkKCcjc3dhbC1kZW1vMScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBzd2FsKFwiSGVyZSdzIGEgbWVzc2FnZSFcIilcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJCgnI3N3YWwtZGVtbzInKS5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgc3dhbChcIkhlcmUncyBhIG1lc3NhZ2UhXCIsIFwiSXQncyBwcmV0dHksIGlzbid0IGl0P1wiKVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkKCcjc3dhbC1kZW1vMycpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBzd2FsKFwiR29vZCBqb2IhXCIsIFwiWW91IGNsaWNrZWQgdGhlIGJ1dHRvbiFcIiwgXCJzdWNjZXNzXCIpXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICQoJyNzd2FsLWRlbW80Jykub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHN3YWwoe1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdBcmUgeW91IHN1cmU/JyxcclxuICAgICAgICAgICAgICAgIHRleHQ6ICdZb3VyIHdpbGwgbm90IGJlIGFibGUgdG8gcmVjb3ZlciB0aGlzIGltYWdpbmFyeSBmaWxlIScsXHJcbiAgICAgICAgICAgICAgICBpY29uOiAnd2FybmluZycsXHJcbiAgICAgICAgICAgICAgICBidXR0b25zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FuY2VsOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpcm06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJ1llcywgZGVsZXRlIGl0IScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwiYmctZGFuZ2VyXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlTW9kYWw6IHRydWVcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBzd2FsKCdCb295YWghJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJCgnI3N3YWwtZGVtbzUnKS5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgc3dhbCh7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0FyZSB5b3Ugc3VyZT8nLFxyXG4gICAgICAgICAgICAgICAgdGV4dDogJ1lvdXIgd2lsbCBub3QgYmUgYWJsZSB0byByZWNvdmVyIHRoaXMgaW1hZ2luYXJ5IGZpbGUhJyxcclxuICAgICAgICAgICAgICAgIGljb246ICd3YXJuaW5nJyxcclxuICAgICAgICAgICAgICAgIGJ1dHRvbnM6IHtcclxuICAgICAgICAgICAgICAgICAgICBjYW5jZWw6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJ05vLCBjYW5jZWwgcGx4IScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwiXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlTW9kYWw6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBjb25maXJtOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdZZXMsIGRlbGV0ZSBpdCEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcImJnLWRhbmdlclwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9zZU1vZGFsOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbihpc0NvbmZpcm0pIHtcclxuICAgICAgICAgICAgICAgIGlmIChpc0NvbmZpcm0pIHtcclxuICAgICAgICAgICAgICAgICAgICBzd2FsKCdEZWxldGVkIScsICdZb3VyIGltYWdpbmFyeSBmaWxlIGhhcyBiZWVuIGRlbGV0ZWQuJywgJ3N1Y2Nlc3MnKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3dhbCgnQ2FuY2VsbGVkJywgJ1lvdXIgaW1hZ2luYXJ5IGZpbGUgaXMgc2FmZSA6KScsICdlcnJvcicpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvLyBGdWxsIENhbGVuZGFyXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgaWYgKHR5cGVvZiBGdWxsQ2FsZW5kYXIgPT09ICd1bmRlZmluZWQnKSByZXR1cm47XHJcblxyXG4gICAgLy8gV2hlbiBkb20gcmVhZHksIGluaXQgY2FsZW5kYXIgYW5kIGV2ZW50c1xyXG4gICAgJChpbml0RXh0ZXJuYWxFdmVudHMpO1xyXG4gICAgJChpbml0RnVsbENhbGVuZGFyKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0RnVsbENhbGVuZGFyKCkge1xyXG5cclxuICAgICAgICB2YXIgQ2FsZW5kYXIgPSBGdWxsQ2FsZW5kYXIuQ2FsZW5kYXI7XHJcbiAgICAgICAgdmFyIERyYWdnYWJsZSA9IEZ1bGxDYWxlbmRhckludGVyYWN0aW9uLkRyYWdnYWJsZTtcclxuXHJcbiAgICAgICAgLyogaW5pdGlhbGl6ZSB0aGUgZXh0ZXJuYWwgZXZlbnRzICovXHJcbiAgICAgICAgdmFyIGNvbnRhaW5lckVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2V4dGVybmFsLWV2ZW50cy1saXN0Jyk7XHJcbiAgICAgICAgbmV3IERyYWdnYWJsZShjb250YWluZXJFbCwge1xyXG4gICAgICAgICAgICBpdGVtU2VsZWN0b3I6ICcuZmNlLWV2ZW50JyxcclxuICAgICAgICAgICAgZXZlbnREYXRhOiBmdW5jdGlvbihldmVudEVsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBldmVudEVsLmlubmVyVGV4dC50cmltKClcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLyogaW5pdGlhbGl6ZSB0aGUgY2FsZW5kYXIgKi9cclxuICAgICAgICB2YXIgY2FsZW5kYXJFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYWxlbmRhcicpO1xyXG4gICAgICAgIHZhciBjYWxlbmRhciA9IG5ldyBDYWxlbmRhcihjYWxlbmRhckVsLCB7XHJcbiAgICAgICAgICAgIGV2ZW50czogY3JlYXRlRGVtb0V2ZW50cygpLFxyXG4gICAgICAgICAgICBwbHVnaW5zOiBbJ2ludGVyYWN0aW9uJywgJ2RheUdyaWQnLCAndGltZUdyaWQnLCAnbGlzdCcsICdib290c3RyYXAnXSxcclxuICAgICAgICAgICAgdGhlbWVTeXN0ZW06ICdib290c3RyYXAnLFxyXG4gICAgICAgICAgICBoZWFkZXI6IHtcclxuICAgICAgICAgICAgICAgIGxlZnQ6ICdwcmV2LG5leHQgdG9kYXknLFxyXG4gICAgICAgICAgICAgICAgY2VudGVyOiAndGl0bGUnLFxyXG4gICAgICAgICAgICAgICAgcmlnaHQ6ICdkYXlHcmlkTW9udGgsdGltZUdyaWRXZWVrLHRpbWVHcmlkRGF5LGxpc3RXZWVrJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBlZGl0YWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgZHJvcHBhYmxlOiB0cnVlLCAvLyB0aGlzIGFsbG93cyB0aGluZ3MgdG8gYmUgZHJvcHBlZCBvbnRvIHRoZSBjYWxlbmRhclxyXG4gICAgICAgICAgICBldmVudFJlY2VpdmU6IGZ1bmN0aW9uKGluZm8pIHtcclxuICAgICAgICAgICAgICAgIHZhciBzdHlsZXMgPSBnZXRDb21wdXRlZFN0eWxlKGluZm8uZHJhZ2dlZEVsKTtcclxuICAgICAgICAgICAgICAgIGluZm8uZXZlbnQuc2V0UHJvcCgnYmFja2dyb3VuZENvbG9yJywgc3R5bGVzLmJhY2tncm91bmRDb2xvcik7XHJcbiAgICAgICAgICAgICAgICBpbmZvLmV2ZW50LnNldFByb3AoJ2JvcmRlckNvbG9yJywgc3R5bGVzLmJvcmRlckNvbG9yKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBpcyB0aGUgXCJyZW1vdmUgYWZ0ZXIgZHJvcFwiIGNoZWNrYm94IGNoZWNrZWQ/XHJcbiAgICAgICAgICAgICAgICBpZiAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Ryb3AtcmVtb3ZlJykuY2hlY2tlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIHNvLCByZW1vdmUgdGhlIGVsZW1lbnQgZnJvbSB0aGUgXCJEcmFnZ2FibGUgRXZlbnRzXCIgbGlzdFxyXG4gICAgICAgICAgICAgICAgICAgIGluZm8uZHJhZ2dlZEVsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoaW5mby5kcmFnZ2VkRWwpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY2FsZW5kYXIucmVuZGVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdEV4dGVybmFsRXZlbnRzKCkge1xyXG4gICAgICAgIHZhciBjb2xvclNlbGVjdG9yQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2V4dGVybmFsLWV2ZW50LWNvbG9yLXNlbGVjdG9yJyk7XHJcbiAgICAgICAgdmFyIGFkZEV2ZW50QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2V4dGVybmFsLWV2ZW50LWFkZC1idG4nKTtcclxuICAgICAgICB2YXIgZXZlbnROYW1lSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZXh0ZXJuYWwtZXZlbnQtbmFtZScpO1xyXG4gICAgICAgIHZhciBjb2xvclNlbGVjdG9ycyA9IFtdLnNsaWNlLmNhbGwoY29sb3JTZWxlY3RvckNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCcuY2lyY2xlJykpO1xyXG4gICAgICAgIHZhciBjdXJyZW50U2VsZWN0b3IgPSBjb2xvclNlbGVjdG9yQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5jaXJjbGUnKTsgLy8gc2VsZWN0IGZpcnN0IGFzIGRlZmF1bHRcclxuICAgICAgICB2YXIgY29udGFpbmVyRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZXh0ZXJuYWwtZXZlbnRzLWxpc3QnKTtcclxuXHJcbiAgICAgICAgLy8gY29udHJvbCB0aGUgY29sb3Igc2VsZWN0b3Igc2VsZWN0YWJsZSBiZWhhdmlvclxyXG4gICAgICAgIGNvbG9yU2VsZWN0b3JzLmZvckVhY2goZnVuY3Rpb24oc2VsKSB7XHJcbiAgICAgICAgICAgIHNlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNlbGVjdENvbG9yU2VsZWN0b3Ioc2VsKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gQ3JlYXRlIGFuZCBhZGQgYSBuZXcgZXZlbnQgdG8gdGhlIGxpc3RcclxuICAgICAgICBhZGRFdmVudEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFkZE5ld0V4dGVybmFsRXZlbnQpO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZWxlY3RDb2xvclNlbGVjdG9yKHNlbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gZGVzZWxlY3QgYWxsXHJcbiAgICAgICAgICAgICAgICBjb2xvclNlbGVjdG9ycy5mb3JFYWNoKHVuc2VsZWN0QWxsQ29sb3JTZWxlY3Rvcik7XHJcbiAgICAgICAgICAgICAgICAvLyBzZWxlY3QgY3VycmVudFxyXG4gICAgICAgICAgICAgICAgc2VsLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkJyk7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50U2VsZWN0b3IgPSBzZWw7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiB1bnNlbGVjdEFsbENvbG9yU2VsZWN0b3IoZWwpIHtcclxuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWQnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFkZE5ld0V4dGVybmFsRXZlbnQoKSB7XHJcbiAgICAgICAgICAgIHZhciBuYW1lID0gZXZlbnROYW1lSW5wdXQudmFsdWU7XHJcbiAgICAgICAgICAgIGlmIChuYW1lKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZWwgPSBjcmVhdGVFbGVtZW50KGN1cnJlbnRTZWxlY3Rvcik7XHJcbiAgICAgICAgICAgICAgICBlbC5pbm5lclRleHQgPSBuYW1lO1xyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyRWwuaW5zZXJ0QmVmb3JlKGVsLCBjb250YWluZXJFbC5maXJzdENoaWxkKTsgLy8gcHJlcHBlbmRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY3JlYXRlRWxlbWVudChiYXNlRWxlbWVudCkge1xyXG4gICAgICAgICAgICB2YXIgc3R5bGVzID0gZ2V0Q29tcHV0ZWRTdHlsZShjdXJyZW50U2VsZWN0b3IpO1xyXG4gICAgICAgICAgICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlLmJhY2tncm91bmRDb2xvciA9IHN0eWxlcy5iYWNrZ3JvdW5kQ29sb3I7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUuYm9yZGVyQ29sb3IgPSBzdHlsZXMuYm9yZGVyQ29sb3I7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUuY29sb3IgPSAnI2ZmZic7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NOYW1lID0gJ2ZjZS1ldmVudCc7IC8vIG1ha2UgZHJhZ2dhYmxlXHJcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgZXZlbnRzIHRvIGRpc3BsYXkgaW4gdGhlIGZpcnN0IGxvYWQgb2YgdGhlIGNhbGVuZGFyXHJcbiAgICAgKiBXcmFwIGludG8gdGhpcyBmdW5jdGlvbiBhIHJlcXVlc3QgdG8gYSBzb3VyY2UgdG8gZ2V0IHZpYSBhamF4IHRoZSBzdG9yZWQgZXZlbnRzXHJcbiAgICAgKiBAcmV0dXJuIEFycmF5IFRoZSBhcnJheSB3aXRoIHRoZSBldmVudHNcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gY3JlYXRlRGVtb0V2ZW50cygpIHtcclxuICAgICAgICAvLyBEYXRlIGZvciB0aGUgY2FsZW5kYXIgZXZlbnRzIChkdW1teSBkYXRhKVxyXG4gICAgICAgIHZhciBkYXRlID0gbmV3IERhdGUoKTtcclxuICAgICAgICB2YXIgZCA9IGRhdGUuZ2V0RGF0ZSgpLFxyXG4gICAgICAgICAgICBtID0gZGF0ZS5nZXRNb250aCgpLFxyXG4gICAgICAgICAgICB5ID0gZGF0ZS5nZXRGdWxsWWVhcigpO1xyXG5cclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0FsbCBEYXkgRXZlbnQnLFxyXG4gICAgICAgICAgICAgICAgc3RhcnQ6IG5ldyBEYXRlKHksIG0sIDEpLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2Y1Njk1NCcsIC8vcmVkXHJcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogJyNmNTY5NTQnIC8vcmVkXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAnTG9uZyBFdmVudCcsXHJcbiAgICAgICAgICAgICAgICBzdGFydDogbmV3IERhdGUoeSwgbSwgZCAtIDUpLFxyXG4gICAgICAgICAgICAgICAgZW5kOiBuZXcgRGF0ZSh5LCBtLCBkIC0gMiksXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZjM5YzEyJywgLy95ZWxsb3dcclxuICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiAnI2YzOWMxMicgLy95ZWxsb3dcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdNZWV0aW5nJyxcclxuICAgICAgICAgICAgICAgIHN0YXJ0OiBuZXcgRGF0ZSh5LCBtLCBkLCAxMCwgMzApLFxyXG4gICAgICAgICAgICAgICAgYWxsRGF5OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyMwMDczYjcnLCAvL0JsdWVcclxuICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiAnIzAwNzNiNycgLy9CbHVlXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAnTHVuY2gnLFxyXG4gICAgICAgICAgICAgICAgc3RhcnQ6IG5ldyBEYXRlKHksIG0sIGQsIDEyLCAwKSxcclxuICAgICAgICAgICAgICAgIGVuZDogbmV3IERhdGUoeSwgbSwgZCwgMTQsIDApLFxyXG4gICAgICAgICAgICAgICAgYWxsRGF5OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyMwMGMwZWYnLCAvL0luZm8gKGFxdWEpXHJcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogJyMwMGMwZWYnIC8vSW5mbyAoYXF1YSlcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdCaXJ0aGRheSBQYXJ0eScsXHJcbiAgICAgICAgICAgICAgICBzdGFydDogbmV3IERhdGUoeSwgbSwgZCArIDEsIDE5LCAwKSxcclxuICAgICAgICAgICAgICAgIGVuZDogbmV3IERhdGUoeSwgbSwgZCArIDEsIDIyLCAzMCksXHJcbiAgICAgICAgICAgICAgICBhbGxEYXk6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnIzAwYTY1YScsIC8vU3VjY2VzcyAoZ3JlZW4pXHJcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogJyMwMGE2NWEnIC8vU3VjY2VzcyAoZ3JlZW4pXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAnT3BlbiBHb29nbGUnLFxyXG4gICAgICAgICAgICAgICAgc3RhcnQ6IG5ldyBEYXRlKHksIG0sIDI4KSxcclxuICAgICAgICAgICAgICAgIGVuZDogbmV3IERhdGUoeSwgbSwgMjkpLFxyXG4gICAgICAgICAgICAgICAgdXJsOiAnLy9nb29nbGUuY29tLycsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjM2M4ZGJjJywgLy9QcmltYXJ5IChsaWdodC1ibHVlKVxyXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6ICcjM2M4ZGJjJyAvL1ByaW1hcnkgKGxpZ2h0LWJsdWUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICBdO1xyXG4gICAgfVxyXG59KSgpO1xyXG4iLCIvLyBKUUNsb3VkXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoaW5pdFdvcmRDbG91ZCk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFdvcmRDbG91ZCgpIHtcclxuXHJcbiAgICAgICAgaWYgKCEkLmZuLmpRQ2xvdWQpIHJldHVybjtcclxuXHJcbiAgICAgICAgLy9DcmVhdGUgYW4gYXJyYXkgb2Ygd29yZCBvYmplY3RzLCBlYWNoIHJlcHJlc2VudGluZyBhIHdvcmQgaW4gdGhlIGNsb3VkXHJcbiAgICAgICAgdmFyIHdvcmRfYXJyYXkgPSBbXHJcbiAgICAgICAgICAgIHsgdGV4dDogJ0xvcmVtJywgd2VpZ2h0OiAxMywgLypsaW5rOiAnaHR0cDovL3RoZW1pY29uLmNvJyovIH0sXHJcbiAgICAgICAgICAgIHsgdGV4dDogJ0lwc3VtJywgd2VpZ2h0OiAxMC41IH0sXHJcbiAgICAgICAgICAgIHsgdGV4dDogJ0RvbG9yJywgd2VpZ2h0OiA5LjQgfSxcclxuICAgICAgICAgICAgeyB0ZXh0OiAnU2l0Jywgd2VpZ2h0OiA4IH0sXHJcbiAgICAgICAgICAgIHsgdGV4dDogJ0FtZXQnLCB3ZWlnaHQ6IDYuMiB9LFxyXG4gICAgICAgICAgICB7IHRleHQ6ICdDb25zZWN0ZXR1cicsIHdlaWdodDogNSB9LFxyXG4gICAgICAgICAgICB7IHRleHQ6ICdBZGlwaXNjaW5nJywgd2VpZ2h0OiA1IH0sXHJcbiAgICAgICAgICAgIHsgdGV4dDogJ1NpdCcsIHdlaWdodDogOCB9LFxyXG4gICAgICAgICAgICB7IHRleHQ6ICdBbWV0Jywgd2VpZ2h0OiA2LjIgfSxcclxuICAgICAgICAgICAgeyB0ZXh0OiAnQ29uc2VjdGV0dXInLCB3ZWlnaHQ6IDUgfSxcclxuICAgICAgICAgICAgeyB0ZXh0OiAnQWRpcGlzY2luZycsIHdlaWdodDogNSB9XHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgJChcIiNqcWNsb3VkXCIpLmpRQ2xvdWQod29yZF9hcnJheSwge1xyXG4gICAgICAgICAgICB3aWR0aDogMjQwLFxyXG4gICAgICAgICAgICBoZWlnaHQ6IDIwMCxcclxuICAgICAgICAgICAgc3RlcHM6IDdcclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9XHJcblxyXG59KSgpOyIsIi8vIFNlYXJjaCBSZXN1bHRzXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoaW5pdFNlYXJjaCk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFNlYXJjaCgpIHtcclxuXHJcbiAgICAgICAgaWYgKCEkLmZuLnNsaWRlcikgcmV0dXJuO1xyXG4gICAgICAgIGlmICghJC5mbi5jaG9zZW4pIHJldHVybjtcclxuICAgICAgICBpZiAoISQuZm4uZGF0ZXBpY2tlcikgcmV0dXJuO1xyXG5cclxuICAgICAgICAvLyBCT09UU1RSQVAgU0xJREVSIENUUkxcclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgICAgICAkKCdbZGF0YS11aS1zbGlkZXJdJykuc2xpZGVyKCk7XHJcblxyXG4gICAgICAgIC8vIENIT1NFTlxyXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgICAgICQoJy5jaG9zZW4tc2VsZWN0JykuY2hvc2VuKCk7XHJcblxyXG4gICAgICAgIC8vIERBVEVUSU1FUElDS0VSXHJcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAgICAgJCgnI2RhdGV0aW1lcGlja2VyJykuZGF0ZXBpY2tlcih7XHJcbiAgICAgICAgICAgIG9yaWVudGF0aW9uOiAnYm90dG9tJyxcclxuICAgICAgICAgICAgaWNvbnM6IHtcclxuICAgICAgICAgICAgICAgIHRpbWU6ICdmYSBmYS1jbG9jay1vJyxcclxuICAgICAgICAgICAgICAgIGRhdGU6ICdmYSBmYS1jYWxlbmRhcicsXHJcbiAgICAgICAgICAgICAgICB1cDogJ2ZhIGZhLWNoZXZyb24tdXAnLFxyXG4gICAgICAgICAgICAgICAgZG93bjogJ2ZhIGZhLWNoZXZyb24tZG93bicsXHJcbiAgICAgICAgICAgICAgICBwcmV2aW91czogJ2ZhIGZhLWNoZXZyb24tbGVmdCcsXHJcbiAgICAgICAgICAgICAgICBuZXh0OiAnZmEgZmEtY2hldnJvbi1yaWdodCcsXHJcbiAgICAgICAgICAgICAgICB0b2RheTogJ2ZhIGZhLWNyb3NzaGFpcnMnLFxyXG4gICAgICAgICAgICAgICAgY2xlYXI6ICdmYSBmYS10cmFzaCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH1cclxuXHJcbn0pKCk7IiwiLy8gQ29sb3IgcGlja2VyXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgJChpbml0Q29sb3JQaWNrZXIpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRDb2xvclBpY2tlcigpIHtcclxuXHJcbiAgICAgICAgaWYgKCEkLmZuLmNvbG9ycGlja2VyKSByZXR1cm47XHJcblxyXG4gICAgICAgICQoJy5kZW1vLWNvbG9ycGlja2VyJykuY29sb3JwaWNrZXIoKTtcclxuXHJcbiAgICAgICAgJCgnI2RlbW9fc2VsZWN0b3JzJykuY29sb3JwaWNrZXIoe1xyXG4gICAgICAgICAgICBjb2xvclNlbGVjdG9yczoge1xyXG4gICAgICAgICAgICAgICAgJ2RlZmF1bHQnOiAnIzc3Nzc3NycsXHJcbiAgICAgICAgICAgICAgICAncHJpbWFyeSc6IEFQUF9DT0xPUlNbJ3ByaW1hcnknXSxcclxuICAgICAgICAgICAgICAgICdzdWNjZXNzJzogQVBQX0NPTE9SU1snc3VjY2VzcyddLFxyXG4gICAgICAgICAgICAgICAgJ2luZm8nOiBBUFBfQ09MT1JTWydpbmZvJ10sXHJcbiAgICAgICAgICAgICAgICAnd2FybmluZyc6IEFQUF9DT0xPUlNbJ3dhcm5pbmcnXSxcclxuICAgICAgICAgICAgICAgICdkYW5nZXInOiBBUFBfQ09MT1JTWydkYW5nZXInXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvLyBGb3JtcyBEZW1vXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoaW5pdEZvcm1zRGVtbyk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdEZvcm1zRGVtbygpIHtcclxuXHJcbiAgICAgICAgaWYgKCEkLmZuLnNsaWRlcikgcmV0dXJuO1xyXG4gICAgICAgIGlmICghJC5mbi5jaG9zZW4pIHJldHVybjtcclxuICAgICAgICBpZiAoISQuZm4uaW5wdXRtYXNrKSByZXR1cm47XHJcbiAgICAgICAgaWYgKCEkLmZuLmZpbGVzdHlsZSkgcmV0dXJuO1xyXG4gICAgICAgIGlmICghJC5mbi53eXNpd3lnKSByZXR1cm47XHJcbiAgICAgICAgaWYgKCEkLmZuLmRhdGVwaWNrZXIpIHJldHVybjtcclxuXHJcbiAgICAgICAgLy8gQk9PVFNUUkFQIFNMSURFUiBDVFJMXHJcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAgICAgJCgnW2RhdGEtdWktc2xpZGVyXScpLnNsaWRlcigpO1xyXG5cclxuICAgICAgICAvLyBDSE9TRU5cclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgICAgICAkKCcuY2hvc2VuLXNlbGVjdCcpLmNob3NlbigpO1xyXG5cclxuICAgICAgICAvLyBNQVNLRURcclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgICAgICAkKCdbZGF0YS1tYXNrZWRdJykuaW5wdXRtYXNrKCk7XHJcblxyXG4gICAgICAgIC8vIEZJTEVTVFlMRVxyXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgICAgICQoJy5maWxlc3R5bGUnKS5maWxlc3R5bGUoKTtcclxuXHJcbiAgICAgICAgLy8gV1lTSVdZR1xyXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgICAgICQoJy53eXNpd3lnJykud3lzaXd5ZygpO1xyXG5cclxuXHJcbiAgICAgICAgLy8gREFURVRJTUVQSUNLRVJcclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgICAgICAkKCcjZGF0ZXRpbWVwaWNrZXIxJykuZGF0ZXBpY2tlcih7XHJcbiAgICAgICAgICAgIG9yaWVudGF0aW9uOiAnYm90dG9tJyxcclxuICAgICAgICAgICAgaWNvbnM6IHtcclxuICAgICAgICAgICAgICAgIHRpbWU6ICdmYSBmYS1jbG9jay1vJyxcclxuICAgICAgICAgICAgICAgIGRhdGU6ICdmYSBmYS1jYWxlbmRhcicsXHJcbiAgICAgICAgICAgICAgICB1cDogJ2ZhIGZhLWNoZXZyb24tdXAnLFxyXG4gICAgICAgICAgICAgICAgZG93bjogJ2ZhIGZhLWNoZXZyb24tZG93bicsXHJcbiAgICAgICAgICAgICAgICBwcmV2aW91czogJ2ZhIGZhLWNoZXZyb24tbGVmdCcsXHJcbiAgICAgICAgICAgICAgICBuZXh0OiAnZmEgZmEtY2hldnJvbi1yaWdodCcsXHJcbiAgICAgICAgICAgICAgICB0b2RheTogJ2ZhIGZhLWNyb3NzaGFpcnMnLFxyXG4gICAgICAgICAgICAgICAgY2xlYXI6ICdmYSBmYS10cmFzaCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIG9ubHkgdGltZVxyXG4gICAgICAgICQoJyNkYXRldGltZXBpY2tlcjInKS5kYXRlcGlja2VyKHtcclxuICAgICAgICAgICAgZm9ybWF0OiAnbW0tZGQteXl5eSdcclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9XHJcblxyXG59KSgpOyIsIi8qKj09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBNb2R1bGU6IEltYWdlIENyb3BwZXJcclxuID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSovXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgJChpbml0SW1hZ2VDcm9wcGVyKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0SW1hZ2VDcm9wcGVyKCkge1xyXG5cclxuICAgICAgICBpZiAoISQuZm4uY3JvcHBlcikgcmV0dXJuO1xyXG5cclxuICAgICAgICB2YXIgJGltYWdlID0gJCgnLmltZy1jb250YWluZXIgPiBpbWcnKSxcclxuICAgICAgICAgICAgJGRhdGFYID0gJCgnI2RhdGFYJyksXHJcbiAgICAgICAgICAgICRkYXRhWSA9ICQoJyNkYXRhWScpLFxyXG4gICAgICAgICAgICAkZGF0YUhlaWdodCA9ICQoJyNkYXRhSGVpZ2h0JyksXHJcbiAgICAgICAgICAgICRkYXRhV2lkdGggPSAkKCcjZGF0YVdpZHRoJyksXHJcbiAgICAgICAgICAgICRkYXRhUm90YXRlID0gJCgnI2RhdGFSb3RhdGUnKSxcclxuICAgICAgICAgICAgb3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgIC8vIGRhdGE6IHtcclxuICAgICAgICAgICAgICAgIC8vICAgeDogNDIwLFxyXG4gICAgICAgICAgICAgICAgLy8gICB5OiA2MCxcclxuICAgICAgICAgICAgICAgIC8vICAgd2lkdGg6IDY0MCxcclxuICAgICAgICAgICAgICAgIC8vICAgaGVpZ2h0OiAzNjBcclxuICAgICAgICAgICAgICAgIC8vIH0sXHJcbiAgICAgICAgICAgICAgICAvLyBzdHJpY3Q6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgLy8gcmVzcG9uc2l2ZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAvLyBjaGVja0ltYWdlT3JpZ2luOiBmYWxzZVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIG1vZGFsOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIC8vIGd1aWRlczogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAvLyBoaWdobGlnaHQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgLy8gYmFja2dyb3VuZDogZmFsc2UsXHJcblxyXG4gICAgICAgICAgICAgICAgLy8gYXV0b0Nyb3A6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgLy8gYXV0b0Nyb3BBcmVhOiAwLjUsXHJcbiAgICAgICAgICAgICAgICAvLyBkcmFnQ3JvcDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAvLyBtb3ZhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIC8vIHJvdGF0YWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAvLyB6b29tYWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAvLyB0b3VjaERyYWdab29tOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIC8vIG1vdXNlV2hlZWxab29tOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIC8vIGNyb3BCb3hNb3ZhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIC8vIGNyb3BCb3hSZXNpemFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgLy8gZG91YmxlQ2xpY2tUb2dnbGU6IGZhbHNlLFxyXG5cclxuICAgICAgICAgICAgICAgIC8vIG1pbkNhbnZhc1dpZHRoOiAzMjAsXHJcbiAgICAgICAgICAgICAgICAvLyBtaW5DYW52YXNIZWlnaHQ6IDE4MCxcclxuICAgICAgICAgICAgICAgIC8vIG1pbkNyb3BCb3hXaWR0aDogMTYwLFxyXG4gICAgICAgICAgICAgICAgLy8gbWluQ3JvcEJveEhlaWdodDogOTAsXHJcbiAgICAgICAgICAgICAgICAvLyBtaW5Db250YWluZXJXaWR0aDogMzIwLFxyXG4gICAgICAgICAgICAgICAgLy8gbWluQ29udGFpbmVySGVpZ2h0OiAxODAsXHJcblxyXG4gICAgICAgICAgICAgICAgLy8gYnVpbGQ6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAvLyBidWlsdDogbnVsbCxcclxuICAgICAgICAgICAgICAgIC8vIGRyYWdzdGFydDogbnVsbCxcclxuICAgICAgICAgICAgICAgIC8vIGRyYWdtb3ZlOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgLy8gZHJhZ2VuZDogbnVsbCxcclxuICAgICAgICAgICAgICAgIC8vIHpvb21pbjogbnVsbCxcclxuICAgICAgICAgICAgICAgIC8vIHpvb21vdXQ6IG51bGwsXHJcblxyXG4gICAgICAgICAgICAgICAgYXNwZWN0UmF0aW86IDE2IC8gOSxcclxuICAgICAgICAgICAgICAgIHByZXZpZXc6ICcuaW1nLXByZXZpZXcnLFxyXG4gICAgICAgICAgICAgICAgY3JvcDogZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICRkYXRhWC52YWwoTWF0aC5yb3VuZChkYXRhLngpKTtcclxuICAgICAgICAgICAgICAgICAgICAkZGF0YVkudmFsKE1hdGgucm91bmQoZGF0YS55KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJGRhdGFIZWlnaHQudmFsKE1hdGgucm91bmQoZGF0YS5oZWlnaHQpKTtcclxuICAgICAgICAgICAgICAgICAgICAkZGF0YVdpZHRoLnZhbChNYXRoLnJvdW5kKGRhdGEud2lkdGgpKTtcclxuICAgICAgICAgICAgICAgICAgICAkZGF0YVJvdGF0ZS52YWwoTWF0aC5yb3VuZChkYXRhLnJvdGF0ZSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAkaW1hZ2Uub24oe1xyXG4gICAgICAgICAgICAnYnVpbGQuY3JvcHBlcic6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUudHlwZSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICdidWlsdC5jcm9wcGVyJzogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZS50eXBlKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgJ2RyYWdzdGFydC5jcm9wcGVyJzogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZS50eXBlLCBlLmRyYWdUeXBlKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgJ2RyYWdtb3ZlLmNyb3BwZXInOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlLnR5cGUsIGUuZHJhZ1R5cGUpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAnZHJhZ2VuZC5jcm9wcGVyJzogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZS50eXBlLCBlLmRyYWdUeXBlKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgJ3pvb21pbi5jcm9wcGVyJzogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZS50eXBlKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgJ3pvb21vdXQuY3JvcHBlcic6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUudHlwZSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICdjaGFuZ2UuY3JvcHBlcic6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUudHlwZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KS5jcm9wcGVyKG9wdGlvbnMpO1xyXG5cclxuXHJcbiAgICAgICAgLy8gTWV0aG9kc1xyXG4gICAgICAgICQoZG9jdW1lbnQuYm9keSkub24oJ2NsaWNrJywgJ1tkYXRhLW1ldGhvZF0nLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSAkKHRoaXMpLmRhdGEoKSxcclxuICAgICAgICAgICAgICAgICR0YXJnZXQsXHJcbiAgICAgICAgICAgICAgICByZXN1bHQ7XHJcblxyXG4gICAgICAgICAgICBpZiAoISRpbWFnZS5kYXRhKCdjcm9wcGVyJykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGRhdGEubWV0aG9kKSB7XHJcbiAgICAgICAgICAgICAgICBkYXRhID0gJC5leHRlbmQoe30sIGRhdGEpOyAvLyBDbG9uZSBhIG5ldyBvbmVcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGRhdGEudGFyZ2V0ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgICR0YXJnZXQgPSAkKGRhdGEudGFyZ2V0KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBkYXRhLm9wdGlvbiA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEub3B0aW9uID0gSlNPTi5wYXJzZSgkdGFyZ2V0LnZhbCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZS5tZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSAkaW1hZ2UuY3JvcHBlcihkYXRhLm1ldGhvZCwgZGF0YS5vcHRpb24pO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChkYXRhLm1ldGhvZCA9PT0gJ2dldENyb3BwZWRDYW52YXMnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnI2dldENyb3BwZWRDYW52YXNNb2RhbCcpLm1vZGFsKCkuZmluZCgnLm1vZGFsLWJvZHknKS5odG1sKHJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCQuaXNQbGFpbk9iamVjdChyZXN1bHQpICYmICR0YXJnZXQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGFyZ2V0LnZhbChKU09OLnN0cmluZ2lmeShyZXN1bHQpKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUubWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pLm9uKCdrZXlkb3duJywgZnVuY3Rpb24oZSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKCEkaW1hZ2UuZGF0YSgnY3JvcHBlcicpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHN3aXRjaCAoZS53aGljaCkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAzNzpcclxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJGltYWdlLmNyb3BwZXIoJ21vdmUnLCAtMSwgMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSAzODpcclxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJGltYWdlLmNyb3BwZXIoJ21vdmUnLCAwLCAtMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSAzOTpcclxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJGltYWdlLmNyb3BwZXIoJ21vdmUnLCAxLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlIDQwOlxyXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICAkaW1hZ2UuY3JvcHBlcignbW92ZScsIDAsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0pO1xyXG5cclxuXHJcbiAgICAgICAgLy8gSW1wb3J0IGltYWdlXHJcbiAgICAgICAgdmFyICRpbnB1dEltYWdlID0gJCgnI2lucHV0SW1hZ2UnKSxcclxuICAgICAgICAgICAgVVJMID0gd2luZG93LlVSTCB8fCB3aW5kb3cud2Via2l0VVJMLFxyXG4gICAgICAgICAgICBibG9iVVJMO1xyXG5cclxuICAgICAgICBpZiAoVVJMKSB7XHJcbiAgICAgICAgICAgICRpbnB1dEltYWdlLmNoYW5nZShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHZhciBmaWxlcyA9IHRoaXMuZmlsZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgZmlsZTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoISRpbWFnZS5kYXRhKCdjcm9wcGVyJykpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGZpbGVzICYmIGZpbGVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbGUgPSBmaWxlc1swXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKC9eaW1hZ2VcXC9cXHcrJC8udGVzdChmaWxlLnR5cGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJsb2JVUkwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGZpbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkaW1hZ2Uub25lKCdidWlsdC5jcm9wcGVyJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKGJsb2JVUkwpOyAvLyBSZXZva2Ugd2hlbiBsb2FkIGNvbXBsZXRlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLmNyb3BwZXIoJ3Jlc2V0JykuY3JvcHBlcigncmVwbGFjZScsIGJsb2JVUkwpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkaW5wdXRJbWFnZS52YWwoJycpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsZXJ0KCdQbGVhc2UgY2hvb3NlIGFuIGltYWdlIGZpbGUuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAkaW5wdXRJbWFnZS5wYXJlbnQoKS5yZW1vdmUoKTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvLyBPcHRpb25zXHJcbiAgICAgICAgJCgnLmRvY3Mtb3B0aW9ucyA6Y2hlY2tib3gnKS5vbignY2hhbmdlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XHJcblxyXG4gICAgICAgICAgICBpZiAoISRpbWFnZS5kYXRhKCdjcm9wcGVyJykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgb3B0aW9uc1skdGhpcy52YWwoKV0gPSAkdGhpcy5wcm9wKCdjaGVja2VkJyk7XHJcbiAgICAgICAgICAgICRpbWFnZS5jcm9wcGVyKCdkZXN0cm95JykuY3JvcHBlcihvcHRpb25zKTtcclxuICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgIC8vIFRvb2x0aXBzXHJcbiAgICAgICAgJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcclxuXHJcbiAgICB9XHJcblxyXG59KSgpOyIsIi8vIFNlbGVjdDJcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAkKGluaXRTZWxlY3QyKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0U2VsZWN0MigpIHtcclxuXHJcbiAgICAgICAgaWYgKCEkLmZuLnNlbGVjdDIpIHJldHVybjtcclxuXHJcbiAgICAgICAgLy8gU2VsZWN0IDJcclxuXHJcbiAgICAgICAgJCgnI3NlbGVjdDItMScpLnNlbGVjdDIoe1xyXG4gICAgICAgICAgICB0aGVtZTogJ2Jvb3RzdHJhcDQnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnI3NlbGVjdDItMicpLnNlbGVjdDIoe1xyXG4gICAgICAgICAgICB0aGVtZTogJ2Jvb3RzdHJhcDQnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnI3NlbGVjdDItMycpLnNlbGVjdDIoe1xyXG4gICAgICAgICAgICB0aGVtZTogJ2Jvb3RzdHJhcDQnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnI3NlbGVjdDItNCcpLnNlbGVjdDIoe1xyXG4gICAgICAgICAgICBwbGFjZWhvbGRlcjogJ1NlbGVjdCBhIHN0YXRlJyxcclxuICAgICAgICAgICAgYWxsb3dDbGVhcjogdHJ1ZSxcclxuICAgICAgICAgICAgdGhlbWU6ICdib290c3RyYXA0J1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH1cclxuXHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGlmICh0eXBlb2YgRHJvcHpvbmUgPT09ICd1bmRlZmluZWQnKSByZXR1cm47XHJcblxyXG4gICAgLy8gUHJldmVudCBEcm9wem9uZSBmcm9tIGF1dG8gZGlzY292ZXJpbmdcclxuICAgIC8vIFRoaXMgaXMgdXNlZnVsIHdoZW4geW91IHdhbnQgdG8gY3JlYXRlIHRoZVxyXG4gICAgLy8gRHJvcHpvbmUgcHJvZ3JhbW1hdGljYWxseSBsYXRlclxyXG4gICAgRHJvcHpvbmUuYXV0b0Rpc2NvdmVyID0gZmFsc2U7XHJcblxyXG4gICAgJChpbml0RHJvcHpvbmUpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXREcm9wem9uZSgpIHtcclxuXHJcbiAgICAgICAgLy8gRHJvcHpvbmUgc2V0dGluZ3NcclxuICAgICAgICB2YXIgZHJvcHpvbmVPcHRpb25zID0ge1xyXG4gICAgICAgICAgICBhdXRvUHJvY2Vzc1F1ZXVlOiBmYWxzZSxcclxuICAgICAgICAgICAgdXBsb2FkTXVsdGlwbGU6IHRydWUsXHJcbiAgICAgICAgICAgIHBhcmFsbGVsVXBsb2FkczogMTAwLFxyXG4gICAgICAgICAgICBtYXhGaWxlczogMTAwLFxyXG4gICAgICAgICAgICBkaWN0RGVmYXVsdE1lc3NhZ2U6ICc8ZW0gY2xhc3M9XCJmYSBmYS11cGxvYWQgdGV4dC1tdXRlZFwiPjwvZW0+PGJyPkRyb3AgZmlsZXMgaGVyZSB0byB1cGxvYWQnLCAvLyBkZWZhdWx0IG1lc3NhZ2VzIGJlZm9yZSBmaXJzdCBkcm9wXHJcbiAgICAgICAgICAgIHBhcmFtTmFtZTogJ2ZpbGUnLCAvLyBUaGUgbmFtZSB0aGF0IHdpbGwgYmUgdXNlZCB0byB0cmFuc2ZlciB0aGUgZmlsZVxyXG4gICAgICAgICAgICBtYXhGaWxlc2l6ZTogMiwgLy8gTUJcclxuICAgICAgICAgICAgYWRkUmVtb3ZlTGlua3M6IHRydWUsXHJcbiAgICAgICAgICAgIGFjY2VwdDogZnVuY3Rpb24oZmlsZSwgZG9uZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGZpbGUubmFtZSA9PT0gJ2p1c3RpbmJpZWJlci5qcGcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZG9uZSgnTmFoYSwgeW91IGRvbnQuIDopJyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgaW5pdDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZHpIYW5kbGVyID0gdGhpcztcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcignYnV0dG9uW3R5cGU9c3VibWl0XScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGR6SGFuZGxlci5wcm9jZXNzUXVldWUoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vbignYWRkZWRmaWxlJywgZnVuY3Rpb24oZmlsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdBZGRlZCBmaWxlOiAnICsgZmlsZS5uYW1lKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vbigncmVtb3ZlZGZpbGUnLCBmdW5jdGlvbihmaWxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1JlbW92ZWQgZmlsZTogJyArIGZpbGUubmFtZSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMub24oJ3NlbmRpbmdtdWx0aXBsZScsIGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vbignc3VjY2Vzc211bHRpcGxlJywgZnVuY3Rpb24oIC8qZmlsZXMsIHJlc3BvbnNlKi8gKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uKCdlcnJvcm11bHRpcGxlJywgZnVuY3Rpb24oIC8qZmlsZXMsIHJlc3BvbnNlKi8gKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIGRyb3B6b25lQXJlYSA9IG5ldyBEcm9wem9uZSgnI2Ryb3B6b25lLWFyZWEnLCBkcm9wem9uZU9wdGlvbnMpO1xyXG5cclxuICAgIH1cclxuXHJcbn0pKCk7IiwiLy8gRm9ybXMgRGVtb1xyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAkKGluaXRXaXphcmQpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRXaXphcmQoKSB7XHJcblxyXG4gICAgICAgIGlmICghJC5mbi52YWxpZGF0ZSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAvLyBGT1JNIEVYQU1QTEVcclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgIHZhciBmb3JtID0gJChcIiNleGFtcGxlLWZvcm1cIik7XHJcbiAgICAgICAgZm9ybS52YWxpZGF0ZSh7XHJcbiAgICAgICAgICAgIGVycm9yUGxhY2VtZW50OiBmdW5jdGlvbiBlcnJvclBsYWNlbWVudChlcnJvciwgZWxlbWVudCkgeyBlbGVtZW50LmJlZm9yZShlcnJvcik7IH0sXHJcbiAgICAgICAgICAgIHJ1bGVzOiB7XHJcbiAgICAgICAgICAgICAgICBjb25maXJtOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXF1YWxUbzogXCIjcGFzc3dvcmRcIlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZm9ybS5jaGlsZHJlbihcImRpdlwiKS5zdGVwcyh7XHJcbiAgICAgICAgICAgIGhlYWRlclRhZzogXCJoNFwiLFxyXG4gICAgICAgICAgICBib2R5VGFnOiBcImZpZWxkc2V0XCIsXHJcbiAgICAgICAgICAgIHRyYW5zaXRpb25FZmZlY3Q6IFwic2xpZGVMZWZ0XCIsXHJcbiAgICAgICAgICAgIG9uU3RlcENoYW5naW5nOiBmdW5jdGlvbihldmVudCwgY3VycmVudEluZGV4LCBuZXdJbmRleCkge1xyXG4gICAgICAgICAgICAgICAgZm9ybS52YWxpZGF0ZSgpLnNldHRpbmdzLmlnbm9yZSA9IFwiOmRpc2FibGVkLDpoaWRkZW5cIjtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmb3JtLnZhbGlkKCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uRmluaXNoaW5nOiBmdW5jdGlvbihldmVudCwgY3VycmVudEluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICBmb3JtLnZhbGlkYXRlKCkuc2V0dGluZ3MuaWdub3JlID0gXCI6ZGlzYWJsZWRcIjtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmb3JtLnZhbGlkKCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uRmluaXNoZWQ6IGZ1bmN0aW9uKGV2ZW50LCBjdXJyZW50SW5kZXgpIHtcclxuICAgICAgICAgICAgICAgIGFsZXJ0KFwiU3VibWl0dGVkIVwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBTdWJtaXQgZm9ybVxyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5zdWJtaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBWRVJUSUNBTFxyXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgICAgICQoXCIjZXhhbXBsZS12ZXJ0aWNhbFwiKS5zdGVwcyh7XHJcbiAgICAgICAgICAgIGhlYWRlclRhZzogXCJoNFwiLFxyXG4gICAgICAgICAgICBib2R5VGFnOiBcInNlY3Rpb25cIixcclxuICAgICAgICAgICAgdHJhbnNpdGlvbkVmZmVjdDogXCJzbGlkZUxlZnRcIixcclxuICAgICAgICAgICAgc3RlcHNPcmllbnRhdGlvbjogXCJ2ZXJ0aWNhbFwiXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvLyBYZWRpdGFibGUgRGVtb1xyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoaW5pdFhFZGl0YWJsZSk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFhFZGl0YWJsZSgpIHtcclxuXHJcbiAgICAgICAgaWYgKCEkLmZuLmVkaXRhYmxlKSByZXR1cm5cclxuXHJcbiAgICAgICAgLy8gRm9udCBBd2Vzb21lIHN1cHBvcnRcclxuICAgICAgICAkLmZuLmVkaXRhYmxlZm9ybS5idXR0b25zID1cclxuICAgICAgICAgICAgJzxidXR0b24gdHlwZT1cInN1Ym1pdFwiIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1zbSBlZGl0YWJsZS1zdWJtaXRcIj4nICtcclxuICAgICAgICAgICAgJzxpIGNsYXNzPVwiZmEgZmEtZncgZmEtY2hlY2tcIj48L2k+JyArXHJcbiAgICAgICAgICAgICc8L2J1dHRvbj4nICtcclxuICAgICAgICAgICAgJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi1zbSBlZGl0YWJsZS1jYW5jZWxcIj4nICtcclxuICAgICAgICAgICAgJzxpIGNsYXNzPVwiZmEgZmEtZncgZmEtdGltZXNcIj48L2k+JyArXHJcbiAgICAgICAgICAgICc8L2J1dHRvbj4nO1xyXG5cclxuICAgICAgICAvL2RlZmF1bHRzXHJcbiAgICAgICAgLy8kLmZuLmVkaXRhYmxlLmRlZmF1bHRzLnVybCA9ICd1cmwvdG8vc2VydmVyJztcclxuXHJcbiAgICAgICAgLy9lbmFibGUgLyBkaXNhYmxlXHJcbiAgICAgICAgJCgnI2VuYWJsZScpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcjdXNlciAuZWRpdGFibGUnKS5lZGl0YWJsZSgndG9nZ2xlRGlzYWJsZWQnKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy9lZGl0YWJsZXNcclxuICAgICAgICAkKCcjdXNlcm5hbWUnKS5lZGl0YWJsZSh7XHJcbiAgICAgICAgICAgIC8vIHVybDogJ3VybC90by9zZXJ2ZXInLFxyXG4gICAgICAgICAgICB0eXBlOiAndGV4dCcsXHJcbiAgICAgICAgICAgIHBrOiAxLFxyXG4gICAgICAgICAgICBuYW1lOiAndXNlcm5hbWUnLFxyXG4gICAgICAgICAgICB0aXRsZTogJ0VudGVyIHVzZXJuYW1lJyxcclxuICAgICAgICAgICAgbW9kZTogJ2lubGluZSdcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJCgnI2ZpcnN0bmFtZScpLmVkaXRhYmxlKHtcclxuICAgICAgICAgICAgdmFsaWRhdGU6IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoJC50cmltKHZhbHVlKSA9PT0gJycpIHJldHVybiAnVGhpcyBmaWVsZCBpcyByZXF1aXJlZCc7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG1vZGU6ICdpbmxpbmUnXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICQoJyNzZXgnKS5lZGl0YWJsZSh7XHJcbiAgICAgICAgICAgIHByZXBlbmQ6IFwibm90IHNlbGVjdGVkXCIsXHJcbiAgICAgICAgICAgIHNvdXJjZTogW1xyXG4gICAgICAgICAgICAgICAgeyB2YWx1ZTogMSwgdGV4dDogJ01hbGUnIH0sXHJcbiAgICAgICAgICAgICAgICB7IHZhbHVlOiAyLCB0ZXh0OiAnRmVtYWxlJyB9XHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgIGRpc3BsYXk6IGZ1bmN0aW9uKHZhbHVlLCBzb3VyY2VEYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY29sb3JzID0geyBcIlwiOiBcImdyYXlcIiwgMTogXCJncmVlblwiLCAyOiBcImJsdWVcIiB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGVsZW0gPSAkLmdyZXAoc291cmNlRGF0YSwgZnVuY3Rpb24obykgeyByZXR1cm4gby52YWx1ZSA9PSB2YWx1ZTsgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGVsZW0ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS50ZXh0KGVsZW1bMF0udGV4dCkuY3NzKFwiY29sb3JcIiwgY29sb3JzW3ZhbHVlXSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICQodGhpcykuZW1wdHkoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgbW9kZTogJ2lubGluZSdcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJCgnI3N0YXR1cycpLmVkaXRhYmxlKHtcclxuICAgICAgICAgICAgbW9kZTogJ2lubGluZSdcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJCgnI2dyb3VwJykuZWRpdGFibGUoe1xyXG4gICAgICAgICAgICBzaG93YnV0dG9uczogZmFsc2UsXHJcbiAgICAgICAgICAgIG1vZGU6ICdpbmxpbmUnXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICQoJyNkb2InKS5lZGl0YWJsZSh7XHJcbiAgICAgICAgICAgIG1vZGU6ICdpbmxpbmUnXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICQoJyNldmVudCcpLmVkaXRhYmxlKHtcclxuICAgICAgICAgICAgcGxhY2VtZW50OiAncmlnaHQnLFxyXG4gICAgICAgICAgICBjb21ib2RhdGU6IHtcclxuICAgICAgICAgICAgICAgIGZpcnN0SXRlbTogJ25hbWUnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG1vZGU6ICdpbmxpbmUnXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICQoJyNjb21tZW50cycpLmVkaXRhYmxlKHtcclxuICAgICAgICAgICAgc2hvd2J1dHRvbnM6ICdib3R0b20nLFxyXG4gICAgICAgICAgICBtb2RlOiAnaW5saW5lJ1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkKCcjbm90ZScpLmVkaXRhYmxlKHtcclxuICAgICAgICAgICAgbW9kZTogJ2lubGluZSdcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcjcGVuY2lsJykuY2xpY2soZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICQoJyNub3RlJykuZWRpdGFibGUoJ3RvZ2dsZScpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkKCcjdXNlciAuZWRpdGFibGUnKS5vbignaGlkZGVuJywgZnVuY3Rpb24oZSwgcmVhc29uKSB7XHJcbiAgICAgICAgICAgIGlmIChyZWFzb24gPT09ICdzYXZlJyB8fCByZWFzb24gPT09ICdub2NoYW5nZScpIHtcclxuICAgICAgICAgICAgICAgIHZhciAkbmV4dCA9ICQodGhpcykuY2xvc2VzdCgndHInKS5uZXh0KCkuZmluZCgnLmVkaXRhYmxlJyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoJCgnI2F1dG9vcGVuJykuaXMoJzpjaGVja2VkJykpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkbmV4dC5lZGl0YWJsZSgnc2hvdycpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIDMwMCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICRuZXh0LmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gVEFCTEVcclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgICAgICAkKCcjdXNlcnMgYScpLmVkaXRhYmxlKHtcclxuICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxyXG4gICAgICAgICAgICBuYW1lOiAndXNlcm5hbWUnLFxyXG4gICAgICAgICAgICB0aXRsZTogJ0VudGVyIHVzZXJuYW1lJyxcclxuICAgICAgICAgICAgbW9kZTogJ2lubGluZSdcclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9XHJcblxyXG59KSgpOyIsIi8qKj09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBNb2R1bGU6IGdtYXAuanNcclxuICogSW5pdCBHb29nbGUgTWFwIHBsdWdpblxyXG4gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ki9cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAkKGluaXRHb29nbGVNYXBzKTtcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBNYXAgU3R5bGUgZGVmaW5pdGlvblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gR2V0IG1vcmUgc3R5bGVzIGZyb20gaHR0cDovL3NuYXp6eW1hcHMuY29tL3N0eWxlLzI5L2xpZ2h0LW1vbm9jaHJvbWVcclxuICAgIC8vIC0gSnVzdCByZXBsYWNlIGFuZCBhc3NpZ24gdG8gJ01hcFN0eWxlcycgdGhlIG5ldyBzdHlsZSBhcnJheVxyXG4gICAgdmFyIE1hcFN0eWxlcyA9IFt7IGZlYXR1cmVUeXBlOiAnd2F0ZXInLCBzdHlsZXJzOiBbeyB2aXNpYmlsaXR5OiAnb24nIH0sIHsgY29sb3I6ICcjYmRkMWY5JyB9XSB9LCB7IGZlYXR1cmVUeXBlOiAnYWxsJywgZWxlbWVudFR5cGU6ICdsYWJlbHMudGV4dC5maWxsJywgc3R5bGVyczogW3sgY29sb3I6ICcjMzM0MTY1JyB9XSB9LCB7IGZlYXR1cmVUeXBlOiAnbGFuZHNjYXBlJywgc3R5bGVyczogW3sgY29sb3I6ICcjZTllYmYxJyB9XSB9LCB7IGZlYXR1cmVUeXBlOiAncm9hZC5oaWdod2F5JywgZWxlbWVudFR5cGU6ICdnZW9tZXRyeScsIHN0eWxlcnM6IFt7IGNvbG9yOiAnI2M1YzZjNicgfV0gfSwgeyBmZWF0dXJlVHlwZTogJ3JvYWQuYXJ0ZXJpYWwnLCBlbGVtZW50VHlwZTogJ2dlb21ldHJ5Jywgc3R5bGVyczogW3sgY29sb3I6ICcjZmZmJyB9XSB9LCB7IGZlYXR1cmVUeXBlOiAncm9hZC5sb2NhbCcsIGVsZW1lbnRUeXBlOiAnZ2VvbWV0cnknLCBzdHlsZXJzOiBbeyBjb2xvcjogJyNmZmYnIH1dIH0sIHsgZmVhdHVyZVR5cGU6ICd0cmFuc2l0JywgZWxlbWVudFR5cGU6ICdnZW9tZXRyeScsIHN0eWxlcnM6IFt7IGNvbG9yOiAnI2Q4ZGJlMCcgfV0gfSwgeyBmZWF0dXJlVHlwZTogJ3BvaScsIGVsZW1lbnRUeXBlOiAnZ2VvbWV0cnknLCBzdHlsZXJzOiBbeyBjb2xvcjogJyNjZmQ1ZTAnIH1dIH0sIHsgZmVhdHVyZVR5cGU6ICdhZG1pbmlzdHJhdGl2ZScsIHN0eWxlcnM6IFt7IHZpc2liaWxpdHk6ICdvbicgfSwgeyBsaWdodG5lc3M6IDMzIH1dIH0sIHsgZmVhdHVyZVR5cGU6ICdwb2kucGFyaycsIGVsZW1lbnRUeXBlOiAnbGFiZWxzJywgc3R5bGVyczogW3sgdmlzaWJpbGl0eTogJ29uJyB9LCB7IGxpZ2h0bmVzczogMjAgfV0gfSwgeyBmZWF0dXJlVHlwZTogJ3JvYWQnLCBzdHlsZXJzOiBbeyBjb2xvcjogJyNkOGRiZTAnLCBsaWdodG5lc3M6IDIwIH1dIH1dO1xyXG5cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0R29vZ2xlTWFwcygpIHtcclxuXHJcbiAgICAgICAgaWYgKCEkLmZuLmdNYXApIHJldHVybjtcclxuXHJcbiAgICAgICAgdmFyIG1hcFNlbGVjdG9yID0gJ1tkYXRhLWdtYXBdJztcclxuICAgICAgICB2YXIgZ01hcFJlZnMgPSBbXTtcclxuXHJcbiAgICAgICAgJChtYXBTZWxlY3RvcikuZWFjaChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyksXHJcbiAgICAgICAgICAgICAgICBhZGRyZXNzZXMgPSAkdGhpcy5kYXRhKCdhZGRyZXNzJykgJiYgJHRoaXMuZGF0YSgnYWRkcmVzcycpLnNwbGl0KCc7JyksXHJcbiAgICAgICAgICAgICAgICB0aXRsZXMgPSAkdGhpcy5kYXRhKCd0aXRsZScpICYmICR0aGlzLmRhdGEoJ3RpdGxlJykuc3BsaXQoJzsnKSxcclxuICAgICAgICAgICAgICAgIHpvb20gPSAkdGhpcy5kYXRhKCd6b29tJykgfHwgMTQsXHJcbiAgICAgICAgICAgICAgICBtYXB0eXBlID0gJHRoaXMuZGF0YSgnbWFwdHlwZScpIHx8ICdST0FETUFQJywgLy8gb3IgJ1RFUlJBSU4nXHJcbiAgICAgICAgICAgICAgICBtYXJrZXJzID0gW107XHJcblxyXG4gICAgICAgICAgICBpZiAoYWRkcmVzc2VzKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBhIGluIGFkZHJlc3Nlcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgYWRkcmVzc2VzW2FdID09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcmtlcnMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRyZXNzOiBhZGRyZXNzZXNbYV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBodG1sOiAodGl0bGVzICYmIHRpdGxlc1thXSkgfHwgJycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3B1cDogdHJ1ZSAvKiBBbHdheXMgcG9wdXAgKi9cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHZhciBvcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhbkNvbnRyb2w6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHpvb21Db250cm9sOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXBUeXBlQ29udHJvbDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2NhbGVDb250cm9sOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJlZXRWaWV3Q29udHJvbDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3ZlcnZpZXdNYXBDb250cm9sOiB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBzY3JvbGx3aGVlbDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFwdHlwZTogbWFwdHlwZSxcclxuICAgICAgICAgICAgICAgICAgICBtYXJrZXJzOiBtYXJrZXJzLFxyXG4gICAgICAgICAgICAgICAgICAgIHpvb206IHpvb21cclxuICAgICAgICAgICAgICAgICAgICAvLyBNb3JlIG9wdGlvbnMgaHR0cHM6Ly9naXRodWIuY29tL21hcmlvZXN0cmFkYS9qUXVlcnktZ01hcFxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgZ01hcCA9ICR0aGlzLmdNYXAob3B0aW9ucyk7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIHJlZiA9IGdNYXAuZGF0YSgnZ01hcC5yZWZlcmVuY2UnKTtcclxuICAgICAgICAgICAgICAgIC8vIHNhdmUgaW4gdGhlIG1hcCByZWZlcmVuY2VzIGxpc3RcclxuICAgICAgICAgICAgICAgIGdNYXBSZWZzLnB1c2gocmVmKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBzZXQgdGhlIHN0eWxlc1xyXG4gICAgICAgICAgICAgICAgaWYgKCR0aGlzLmRhdGEoJ3N0eWxlZCcpICE9PSB1bmRlZmluZWQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmVmLnNldE9wdGlvbnMoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZXM6IE1hcFN0eWxlc1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9KTsgLy9lYWNoXHJcblxyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvLyBqVmVjdG9yTWFwXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoaW5pdFZlY3Rvck1hcCk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFZlY3Rvck1hcCgpIHtcclxuXHJcbiAgICAgICAgdmFyIGVsZW1lbnQgPSAkKCdbZGF0YS12ZWN0b3ItbWFwXScpO1xyXG5cclxuICAgICAgICB2YXIgc2VyaWVzRGF0YSA9IHtcclxuICAgICAgICAgICAgJ0NBJzogMTExMDAsIC8vIENhbmFkYVxyXG4gICAgICAgICAgICAnREUnOiAyNTEwLCAvLyBHZXJtYW55XHJcbiAgICAgICAgICAgICdGUic6IDM3MTAsIC8vIEZyYW5jZVxyXG4gICAgICAgICAgICAnQVUnOiA1NzEwLCAvLyBBdXN0cmFsaWFcclxuICAgICAgICAgICAgJ0dCJzogODMxMCwgLy8gR3JlYXQgQnJpdGFpblxyXG4gICAgICAgICAgICAnUlUnOiA5MzEwLCAvLyBSdXNzaWFcclxuICAgICAgICAgICAgJ0JSJzogNjYxMCwgLy8gQnJhemlsXHJcbiAgICAgICAgICAgICdJTic6IDc4MTAsIC8vIEluZGlhXHJcbiAgICAgICAgICAgICdDTic6IDQzMTAsIC8vIENoaW5hXHJcbiAgICAgICAgICAgICdVUyc6IDgzOSwgLy8gVVNBXHJcbiAgICAgICAgICAgICdTQSc6IDQxMCAvLyBTYXVkaSBBcmFiaWFcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgbWFya2Vyc0RhdGEgPSBbXHJcbiAgICAgICAgICAgIHsgbGF0TG5nOiBbNDEuOTAsIDEyLjQ1XSwgbmFtZTogJ1ZhdGljYW4gQ2l0eScgfSxcclxuICAgICAgICAgICAgeyBsYXRMbmc6IFs0My43MywgNy40MV0sIG5hbWU6ICdNb25hY28nIH0sXHJcbiAgICAgICAgICAgIHsgbGF0TG5nOiBbLTAuNTIsIDE2Ni45M10sIG5hbWU6ICdOYXVydScgfSxcclxuICAgICAgICAgICAgeyBsYXRMbmc6IFstOC41MSwgMTc5LjIxXSwgbmFtZTogJ1R1dmFsdScgfSxcclxuICAgICAgICAgICAgeyBsYXRMbmc6IFs3LjExLCAxNzEuMDZdLCBuYW1lOiAnTWFyc2hhbGwgSXNsYW5kcycgfSxcclxuICAgICAgICAgICAgeyBsYXRMbmc6IFsxNy4zLCAtNjIuNzNdLCBuYW1lOiAnU2FpbnQgS2l0dHMgYW5kIE5ldmlzJyB9LFxyXG4gICAgICAgICAgICB7IGxhdExuZzogWzMuMiwgNzMuMjJdLCBuYW1lOiAnTWFsZGl2ZXMnIH0sXHJcbiAgICAgICAgICAgIHsgbGF0TG5nOiBbMzUuODgsIDE0LjVdLCBuYW1lOiAnTWFsdGEnIH0sXHJcbiAgICAgICAgICAgIHsgbGF0TG5nOiBbNDEuMCwgLTcxLjA2XSwgbmFtZTogJ05ldyBFbmdsYW5kJyB9LFxyXG4gICAgICAgICAgICB7IGxhdExuZzogWzEyLjA1LCAtNjEuNzVdLCBuYW1lOiAnR3JlbmFkYScgfSxcclxuICAgICAgICAgICAgeyBsYXRMbmc6IFsxMy4xNiwgLTU5LjU1XSwgbmFtZTogJ0JhcmJhZG9zJyB9LFxyXG4gICAgICAgICAgICB7IGxhdExuZzogWzE3LjExLCAtNjEuODVdLCBuYW1lOiAnQW50aWd1YSBhbmQgQmFyYnVkYScgfSxcclxuICAgICAgICAgICAgeyBsYXRMbmc6IFstNC42MSwgNTUuNDVdLCBuYW1lOiAnU2V5Y2hlbGxlcycgfSxcclxuICAgICAgICAgICAgeyBsYXRMbmc6IFs3LjM1LCAxMzQuNDZdLCBuYW1lOiAnUGFsYXUnIH0sXHJcbiAgICAgICAgICAgIHsgbGF0TG5nOiBbNDIuNSwgMS41MV0sIG5hbWU6ICdBbmRvcnJhJyB9XHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgbmV3IFZlY3Rvck1hcChlbGVtZW50LCBzZXJpZXNEYXRhLCBtYXJrZXJzRGF0YSk7XHJcblxyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvLyBKVkVDVE9SIE1BUFxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIC8vIEFsbG93IEdsb2JhbCBhY2Nlc3NcclxuICAgIHdpbmRvdy5WZWN0b3JNYXAgPSBWZWN0b3JNYXBcclxuXHJcbiAgICB2YXIgZGVmYXVsdENvbG9ycyA9IHtcclxuICAgICAgICBtYXJrZXJDb2xvcjogJyMyM2I3ZTUnLCAvLyB0aGUgbWFya2VyIHBvaW50c1xyXG4gICAgICAgIGJnQ29sb3I6ICd0cmFuc3BhcmVudCcsIC8vIHRoZSBiYWNrZ3JvdW5kXHJcbiAgICAgICAgc2NhbGVDb2xvcnM6IFsnIzg3OGM5YSddLCAvLyB0aGUgY29sb3Igb2YgdGhlIHJlZ2lvbiBpbiB0aGUgc2VyaWVcclxuICAgICAgICByZWdpb25GaWxsOiAnI2JiYmVjNicgLy8gdGhlIGJhc2UgcmVnaW9uIGNvbG9yXHJcbiAgICB9O1xyXG5cclxuICAgIGZ1bmN0aW9uIFZlY3Rvck1hcChlbGVtZW50LCBzZXJpZXNEYXRhLCBtYXJrZXJzRGF0YSkge1xyXG5cclxuICAgICAgICBpZiAoIWVsZW1lbnQgfHwgIWVsZW1lbnQubGVuZ3RoKSByZXR1cm47XHJcblxyXG4gICAgICAgIHZhciBhdHRycyA9IGVsZW1lbnQuZGF0YSgpLFxyXG4gICAgICAgICAgICBtYXBIZWlnaHQgPSBhdHRycy5oZWlnaHQgfHwgJzMwMCcsXHJcbiAgICAgICAgICAgIG9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICBtYXJrZXJDb2xvcjogYXR0cnMubWFya2VyQ29sb3IgfHwgZGVmYXVsdENvbG9ycy5tYXJrZXJDb2xvcixcclxuICAgICAgICAgICAgICAgIGJnQ29sb3I6IGF0dHJzLmJnQ29sb3IgfHwgZGVmYXVsdENvbG9ycy5iZ0NvbG9yLFxyXG4gICAgICAgICAgICAgICAgc2NhbGU6IGF0dHJzLnNjYWxlIHx8IDEsXHJcbiAgICAgICAgICAgICAgICBzY2FsZUNvbG9yczogYXR0cnMuc2NhbGVDb2xvcnMgfHwgZGVmYXVsdENvbG9ycy5zY2FsZUNvbG9ycyxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbkZpbGw6IGF0dHJzLnJlZ2lvbkZpbGwgfHwgZGVmYXVsdENvbG9ycy5yZWdpb25GaWxsLFxyXG4gICAgICAgICAgICAgICAgbWFwTmFtZTogYXR0cnMubWFwTmFtZSB8fCAnd29ybGRfbWlsbF9lbidcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZWxlbWVudC5jc3MoJ2hlaWdodCcsIG1hcEhlaWdodCk7XHJcblxyXG4gICAgICAgIGluaXQoZWxlbWVudCwgb3B0aW9ucywgc2VyaWVzRGF0YSwgbWFya2Vyc0RhdGEpO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBpbml0KCRlbGVtZW50LCBvcHRzLCBzZXJpZXMsIG1hcmtlcnMpIHtcclxuXHJcbiAgICAgICAgICAgICRlbGVtZW50LnZlY3Rvck1hcCh7XHJcbiAgICAgICAgICAgICAgICBtYXA6IG9wdHMubWFwTmFtZSxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogb3B0cy5iZ0NvbG9yLFxyXG4gICAgICAgICAgICAgICAgem9vbU1pbjogMSxcclxuICAgICAgICAgICAgICAgIHpvb21NYXg6IDgsXHJcbiAgICAgICAgICAgICAgICB6b29tT25TY3JvbGw6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgcmVnaW9uU3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICBpbml0aWFsOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdmaWxsJzogb3B0cy5yZWdpb25GaWxsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnZmlsbC1vcGFjaXR5JzogMSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ3N0cm9rZSc6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ3N0cm9rZS13aWR0aCc6IDEuNSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ3N0cm9rZS1vcGFjaXR5JzogMVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgaG92ZXI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ2ZpbGwtb3BhY2l0eSc6IDAuOFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQ6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsbDogJ2JsdWUnXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZEhvdmVyOiB7fVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGZvY3VzT246IHsgeDogMC40LCB5OiAwLjYsIHNjYWxlOiBvcHRzLnNjYWxlIH0sXHJcbiAgICAgICAgICAgICAgICBtYXJrZXJTdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgIGluaXRpYWw6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsbDogb3B0cy5tYXJrZXJDb2xvcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3Ryb2tlOiBvcHRzLm1hcmtlckNvbG9yXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uUmVnaW9uTGFiZWxTaG93OiBmdW5jdGlvbihlLCBlbCwgY29kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzZXJpZXMgJiYgc2VyaWVzW2NvZGVdKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5odG1sKGVsLmh0bWwoKSArICc6ICcgKyBzZXJpZXNbY29kZV0gKyAnIHZpc2l0b3JzJyk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgbWFya2VyczogbWFya2VycyxcclxuICAgICAgICAgICAgICAgIHNlcmllczoge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbnM6IFt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlczogc2VyaWVzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY2FsZTogb3B0cy5zY2FsZUNvbG9ycyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbm9ybWFsaXplRnVuY3Rpb246ICdwb2x5bm9taWFsJ1xyXG4gICAgICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgfSAvLyBlbmQgaW5pdFxyXG4gICAgfTtcclxuXHJcbn0pKCk7IiwiLyoqXHJcbiAqIFVzZWQgZm9yIHVzZXIgcGFnZXNcclxuICogTG9naW4gYW5kIFJlZ2lzdGVyXHJcbiAqL1xyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgJChpbml0UGFyc2xleUZvclBhZ2VzKVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRQYXJzbGV5Rm9yUGFnZXMoKSB7XHJcblxyXG4gICAgICAgIC8vIFBhcnNsZXkgb3B0aW9ucyBzZXR1cCBmb3IgYm9vdHN0cmFwIHZhbGlkYXRpb24gY2xhc3Nlc1xyXG4gICAgICAgIHZhciBwYXJzbGV5T3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgZXJyb3JDbGFzczogJ2lzLWludmFsaWQnLFxyXG4gICAgICAgICAgICBzdWNjZXNzQ2xhc3M6ICdpcy12YWxpZCcsXHJcbiAgICAgICAgICAgIGNsYXNzSGFuZGxlcjogZnVuY3Rpb24oUGFyc2xleUZpZWxkKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZWwgPSBQYXJzbGV5RmllbGQuJGVsZW1lbnQucGFyZW50cygnLmZvcm0tZ3JvdXAnKS5maW5kKCdpbnB1dCcpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFlbC5sZW5ndGgpIC8vIHN1cHBvcnQgY3VzdG9tIGNoZWNrYm94XHJcbiAgICAgICAgICAgICAgICAgICAgZWwgPSBQYXJzbGV5RmllbGQuJGVsZW1lbnQucGFyZW50cygnLmMtY2hlY2tib3gnKS5maW5kKCdsYWJlbCcpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBlcnJvcnNDb250YWluZXI6IGZ1bmN0aW9uKFBhcnNsZXlGaWVsZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFBhcnNsZXlGaWVsZC4kZWxlbWVudC5wYXJlbnRzKCcuZm9ybS1ncm91cCcpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBlcnJvcnNXcmFwcGVyOiAnPGRpdiBjbGFzcz1cInRleHQtaGVscFwiPicsXHJcbiAgICAgICAgICAgIGVycm9yVGVtcGxhdGU6ICc8ZGl2PjwvZGl2PidcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBMb2dpbiBmb3JtIHZhbGlkYXRpb24gd2l0aCBQYXJzbGV5XHJcbiAgICAgICAgdmFyIGxvZ2luRm9ybSA9ICQoXCIjbG9naW5Gb3JtXCIpO1xyXG4gICAgICAgIGlmIChsb2dpbkZvcm0ubGVuZ3RoKVxyXG4gICAgICAgICAgICBsb2dpbkZvcm0ucGFyc2xleShwYXJzbGV5T3B0aW9ucyk7XHJcblxyXG4gICAgICAgIC8vIFJlZ2lzdGVyIGZvcm0gdmFsaWRhdGlvbiB3aXRoIFBhcnNsZXlcclxuICAgICAgICB2YXIgcmVnaXN0ZXJGb3JtID0gJChcIiNyZWdpc3RlckZvcm1cIik7XHJcbiAgICAgICAgaWYgKHJlZ2lzdGVyRm9ybS5sZW5ndGgpXHJcbiAgICAgICAgICAgIHJlZ2lzdGVyRm9ybS5wYXJzbGV5KHBhcnNsZXlPcHRpb25zKTtcclxuXHJcbiAgICB9XHJcblxyXG59KSgpOyIsIi8vIEJPT1RHUklEXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgJChpbml0Qm9vdGdyaWQpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRCb290Z3JpZCgpIHtcclxuXHJcbiAgICAgICAgaWYgKCEkLmZuLmJvb3RncmlkKSByZXR1cm47XHJcblxyXG4gICAgICAgICQoJyNib290Z3JpZC1iYXNpYycpLmJvb3RncmlkKHtcclxuICAgICAgICAgICAgdGVtcGxhdGVzOiB7XHJcbiAgICAgICAgICAgICAgICAvLyB0ZW1wbGF0ZXMgZm9yIEJTNFxyXG4gICAgICAgICAgICAgICAgYWN0aW9uQnV0dG9uOiAnPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCIgdHlwZT1cImJ1dHRvblwiIHRpdGxlPVwie3tjdHgudGV4dH19XCI+e3tjdHguY29udGVudH19PC9idXR0b24+JyxcclxuICAgICAgICAgICAgICAgIGFjdGlvbkRyb3BEb3duOiAnPGRpdiBjbGFzcz1cInt7Y3NzLmRyb3BEb3duTWVudX19XCI+PGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5IGRyb3Bkb3duLXRvZ2dsZSBkcm9wZG93bi10b2dnbGUtbm9jYXJldFwiIHR5cGU9XCJidXR0b25cIiBkYXRhLXRvZ2dsZT1cImRyb3Bkb3duXCI+PHNwYW4gY2xhc3M9XCJ7e2Nzcy5kcm9wRG93bk1lbnVUZXh0fX1cIj57e2N0eC5jb250ZW50fX08L3NwYW4+PC9idXR0b24+PHVsIGNsYXNzPVwie3tjc3MuZHJvcERvd25NZW51SXRlbXN9fVwiIHJvbGU9XCJtZW51XCI+PC91bD48L2Rpdj4nLFxyXG4gICAgICAgICAgICAgICAgYWN0aW9uRHJvcERvd25JdGVtOiAnPGxpIGNsYXNzPVwiZHJvcGRvd24taXRlbVwiPjxhIGhyZWY9XCJcIiBkYXRhLWFjdGlvbj1cInt7Y3R4LmFjdGlvbn19XCIgY2xhc3M9XCJkcm9wZG93bi1saW5rIHt7Y3NzLmRyb3BEb3duSXRlbUJ1dHRvbn19XCI+e3tjdHgudGV4dH19PC9hPjwvbGk+JyxcclxuICAgICAgICAgICAgICAgIGFjdGlvbkRyb3BEb3duQ2hlY2tib3hJdGVtOiAnPGxpIGNsYXNzPVwiZHJvcGRvd24taXRlbVwiPjxsYWJlbCBjbGFzcz1cImRyb3Bkb3duLWl0ZW0gcC0wXCI+PGlucHV0IG5hbWU9XCJ7e2N0eC5uYW1lfX1cIiB0eXBlPVwiY2hlY2tib3hcIiB2YWx1ZT1cIjFcIiBjbGFzcz1cInt7Y3NzLmRyb3BEb3duSXRlbUNoZWNrYm94fX1cIiB7e2N0eC5jaGVja2VkfX0gLz4ge3tjdHgubGFiZWx9fTwvbGFiZWw+PC9saT4nLFxyXG4gICAgICAgICAgICAgICAgcGFnaW5hdGlvbkl0ZW06ICc8bGkgY2xhc3M9XCJwYWdlLWl0ZW0ge3tjdHguY3NzfX1cIj48YSBocmVmPVwiXCIgZGF0YS1wYWdlPVwie3tjdHgucGFnZX19XCIgY2xhc3M9XCJwYWdlLWxpbmsge3tjc3MucGFnaW5hdGlvbkJ1dHRvbn19XCI+e3tjdHgudGV4dH19PC9hPjwvbGk+JyxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkKCcjYm9vdGdyaWQtc2VsZWN0aW9uJykuYm9vdGdyaWQoe1xyXG4gICAgICAgICAgICBzZWxlY3Rpb246IHRydWUsXHJcbiAgICAgICAgICAgIG11bHRpU2VsZWN0OiB0cnVlLFxyXG4gICAgICAgICAgICByb3dTZWxlY3Q6IHRydWUsXHJcbiAgICAgICAgICAgIGtlZXBTZWxlY3Rpb246IHRydWUsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlczoge1xyXG4gICAgICAgICAgICAgICAgc2VsZWN0OlxyXG4gICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiY3VzdG9tLWNvbnRyb2wgY3VzdG9tLWNoZWNrYm94XCI+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAnPGlucHV0IHR5cGU9XCJ7e2N0eC50eXBlfX1cIiBjbGFzcz1cImN1c3RvbS1jb250cm9sLWlucHV0IHt7Y3NzLnNlbGVjdEJveH19XCIgaWQ9XCJjdXN0b21DaGVjazFcIiB2YWx1ZT1cInt7Y3R4LnZhbHVlfX1cIiB7e2N0eC5jaGVja2VkfX0+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAnPGxhYmVsIGNsYXNzPVwiY3VzdG9tLWNvbnRyb2wtbGFiZWxcIiBmb3I9XCJjdXN0b21DaGVjazFcIj48L2xhYmVsPicgK1xyXG4gICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nXHJcbiAgICAgICAgICAgICAgICAsXHJcbiAgICAgICAgICAgICAgICAvLyB0ZW1wbGF0ZXMgZm9yIEJTNFxyXG4gICAgICAgICAgICAgICAgYWN0aW9uQnV0dG9uOiAnPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCIgdHlwZT1cImJ1dHRvblwiIHRpdGxlPVwie3tjdHgudGV4dH19XCI+e3tjdHguY29udGVudH19PC9idXR0b24+JyxcclxuICAgICAgICAgICAgICAgIGFjdGlvbkRyb3BEb3duOiAnPGRpdiBjbGFzcz1cInt7Y3NzLmRyb3BEb3duTWVudX19XCI+PGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5IGRyb3Bkb3duLXRvZ2dsZSBkcm9wZG93bi10b2dnbGUtbm9jYXJldFwiIHR5cGU9XCJidXR0b25cIiBkYXRhLXRvZ2dsZT1cImRyb3Bkb3duXCI+PHNwYW4gY2xhc3M9XCJ7e2Nzcy5kcm9wRG93bk1lbnVUZXh0fX1cIj57e2N0eC5jb250ZW50fX08L3NwYW4+PC9idXR0b24+PHVsIGNsYXNzPVwie3tjc3MuZHJvcERvd25NZW51SXRlbXN9fVwiIHJvbGU9XCJtZW51XCI+PC91bD48L2Rpdj4nLFxyXG4gICAgICAgICAgICAgICAgYWN0aW9uRHJvcERvd25JdGVtOiAnPGxpIGNsYXNzPVwiZHJvcGRvd24taXRlbVwiPjxhIGhyZWY9XCJcIiBkYXRhLWFjdGlvbj1cInt7Y3R4LmFjdGlvbn19XCIgY2xhc3M9XCJkcm9wZG93bi1saW5rIHt7Y3NzLmRyb3BEb3duSXRlbUJ1dHRvbn19XCI+e3tjdHgudGV4dH19PC9hPjwvbGk+JyxcclxuICAgICAgICAgICAgICAgIGFjdGlvbkRyb3BEb3duQ2hlY2tib3hJdGVtOiAnPGxpIGNsYXNzPVwiZHJvcGRvd24taXRlbVwiPjxsYWJlbCBjbGFzcz1cImRyb3Bkb3duLWl0ZW0gcC0wXCI+PGlucHV0IG5hbWU9XCJ7e2N0eC5uYW1lfX1cIiB0eXBlPVwiY2hlY2tib3hcIiB2YWx1ZT1cIjFcIiBjbGFzcz1cInt7Y3NzLmRyb3BEb3duSXRlbUNoZWNrYm94fX1cIiB7e2N0eC5jaGVja2VkfX0gLz4ge3tjdHgubGFiZWx9fTwvbGFiZWw+PC9saT4nLFxyXG4gICAgICAgICAgICAgICAgcGFnaW5hdGlvbkl0ZW06ICc8bGkgY2xhc3M9XCJwYWdlLWl0ZW0ge3tjdHguY3NzfX1cIj48YSBocmVmPVwiXCIgZGF0YS1wYWdlPVwie3tjdHgucGFnZX19XCIgY2xhc3M9XCJwYWdlLWxpbmsge3tjc3MucGFnaW5hdGlvbkJ1dHRvbn19XCI+e3tjdHgudGV4dH19PC9hPjwvbGk+JyxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB2YXIgZ3JpZCA9ICQoJyNib290Z3JpZC1jb21tYW5kJykuYm9vdGdyaWQoe1xyXG4gICAgICAgICAgICBmb3JtYXR0ZXJzOiB7XHJcbiAgICAgICAgICAgICAgICBjb21tYW5kczogZnVuY3Rpb24oY29sdW1uLCByb3cpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zbSBidG4taW5mbyBtci0yIGNvbW1hbmQtZWRpdFwiIGRhdGEtcm93LWlkPVwiJyArIHJvdy5pZCArICdcIj48ZW0gY2xhc3M9XCJmYSBmYS1lZGl0IGZhLWZ3XCI+PC9lbT48L2J1dHRvbj4nICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1zbSBidG4tZGFuZ2VyIGNvbW1hbmQtZGVsZXRlXCIgZGF0YS1yb3ctaWQ9XCInICsgcm93LmlkICsgJ1wiPjxlbSBjbGFzcz1cImZhIGZhLXRyYXNoIGZhLWZ3XCI+PC9lbT48L2J1dHRvbj4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZXM6IHtcclxuICAgICAgICAgICAgICAgIC8vIHRlbXBsYXRlcyBmb3IgQlM0XHJcbiAgICAgICAgICAgICAgICBhY3Rpb25CdXR0b246ICc8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIiB0eXBlPVwiYnV0dG9uXCIgdGl0bGU9XCJ7e2N0eC50ZXh0fX1cIj57e2N0eC5jb250ZW50fX08L2J1dHRvbj4nLFxyXG4gICAgICAgICAgICAgICAgYWN0aW9uRHJvcERvd246ICc8ZGl2IGNsYXNzPVwie3tjc3MuZHJvcERvd25NZW51fX1cIj48YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnkgZHJvcGRvd24tdG9nZ2xlIGRyb3Bkb3duLXRvZ2dsZS1ub2NhcmV0XCIgdHlwZT1cImJ1dHRvblwiIGRhdGEtdG9nZ2xlPVwiZHJvcGRvd25cIj48c3BhbiBjbGFzcz1cInt7Y3NzLmRyb3BEb3duTWVudVRleHR9fVwiPnt7Y3R4LmNvbnRlbnR9fTwvc3Bhbj48L2J1dHRvbj48dWwgY2xhc3M9XCJ7e2Nzcy5kcm9wRG93bk1lbnVJdGVtc319XCIgcm9sZT1cIm1lbnVcIj48L3VsPjwvZGl2PicsXHJcbiAgICAgICAgICAgICAgICBhY3Rpb25Ecm9wRG93bkl0ZW06ICc8bGkgY2xhc3M9XCJkcm9wZG93bi1pdGVtXCI+PGEgaHJlZj1cIlwiIGRhdGEtYWN0aW9uPVwie3tjdHguYWN0aW9ufX1cIiBjbGFzcz1cImRyb3Bkb3duLWxpbmsge3tjc3MuZHJvcERvd25JdGVtQnV0dG9ufX1cIj57e2N0eC50ZXh0fX08L2E+PC9saT4nLFxyXG4gICAgICAgICAgICAgICAgYWN0aW9uRHJvcERvd25DaGVja2JveEl0ZW06ICc8bGkgY2xhc3M9XCJkcm9wZG93bi1pdGVtXCI+PGxhYmVsIGNsYXNzPVwiZHJvcGRvd24taXRlbSBwLTBcIj48aW5wdXQgbmFtZT1cInt7Y3R4Lm5hbWV9fVwiIHR5cGU9XCJjaGVja2JveFwiIHZhbHVlPVwiMVwiIGNsYXNzPVwie3tjc3MuZHJvcERvd25JdGVtQ2hlY2tib3h9fVwiIHt7Y3R4LmNoZWNrZWR9fSAvPiB7e2N0eC5sYWJlbH19PC9sYWJlbD48L2xpPicsXHJcbiAgICAgICAgICAgICAgICBwYWdpbmF0aW9uSXRlbTogJzxsaSBjbGFzcz1cInBhZ2UtaXRlbSB7e2N0eC5jc3N9fVwiPjxhIGhyZWY9XCJcIiBkYXRhLXBhZ2U9XCJ7e2N0eC5wYWdlfX1cIiBjbGFzcz1cInBhZ2UtbGluayB7e2Nzcy5wYWdpbmF0aW9uQnV0dG9ufX1cIj57e2N0eC50ZXh0fX08L2E+PC9saT4nLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSkub24oJ2xvYWRlZC5ycy5qcXVlcnkuYm9vdGdyaWQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgLyogRXhlY3V0ZXMgYWZ0ZXIgZGF0YSBpcyBsb2FkZWQgYW5kIHJlbmRlcmVkICovXHJcbiAgICAgICAgICAgIGdyaWQuZmluZCgnLmNvbW1hbmQtZWRpdCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1lvdSBwcmVzc2VkIGVkaXQgb24gcm93OiAnICsgJCh0aGlzKS5kYXRhKCdyb3ctaWQnKSk7XHJcbiAgICAgICAgICAgIH0pLmVuZCgpLmZpbmQoJy5jb21tYW5kLWRlbGV0ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1lvdSBwcmVzc2VkIGRlbGV0ZSBvbiByb3c6ICcgKyAkKHRoaXMpLmRhdGEoJ3Jvdy1pZCcpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvLyBEQVRBVEFCTEVTXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgJChpbml0RGF0YXRhYmxlcyk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdERhdGF0YWJsZXMoKSB7XHJcblxyXG4gICAgICAgIGlmICghJC5mbi5EYXRhVGFibGUpIHJldHVybjtcclxuXHJcbiAgICAgICAgLy8gWmVybyBjb25maWd1cmF0aW9uXHJcblxyXG4gICAgICAgICQoJyNkYXRhdGFibGUxJykuRGF0YVRhYmxlKHtcclxuICAgICAgICAgICAgJ3BhZ2luZyc6IHRydWUsIC8vIFRhYmxlIHBhZ2luYXRpb25cclxuICAgICAgICAgICAgJ29yZGVyaW5nJzogdHJ1ZSwgLy8gQ29sdW1uIG9yZGVyaW5nXHJcbiAgICAgICAgICAgICdpbmZvJzogdHJ1ZSwgLy8gQm90dG9tIGxlZnQgc3RhdHVzIHRleHRcclxuICAgICAgICAgICAgcmVzcG9uc2l2ZTogdHJ1ZSxcclxuICAgICAgICAgICAgLy8gVGV4dCB0cmFuc2xhdGlvbiBvcHRpb25zXHJcbiAgICAgICAgICAgIC8vIE5vdGUgdGhlIHJlcXVpcmVkIGtleXdvcmRzIGJldHdlZW4gdW5kZXJzY29yZXMgKGUuZyBfTUVOVV8pXHJcbiAgICAgICAgICAgIG9MYW5ndWFnZToge1xyXG4gICAgICAgICAgICAgICAgc1NlYXJjaDogJzxlbSBjbGFzcz1cImZhcyBmYS1zZWFyY2hcIj48L2VtPicsXHJcbiAgICAgICAgICAgICAgICBzTGVuZ3RoTWVudTogJ19NRU5VXyByZWNvcmRzIHBlciBwYWdlJyxcclxuICAgICAgICAgICAgICAgIGluZm86ICdTaG93aW5nIHBhZ2UgX1BBR0VfIG9mIF9QQUdFU18nLFxyXG4gICAgICAgICAgICAgICAgemVyb1JlY29yZHM6ICdOb3RoaW5nIGZvdW5kIC0gc29ycnknLFxyXG4gICAgICAgICAgICAgICAgaW5mb0VtcHR5OiAnTm8gcmVjb3JkcyBhdmFpbGFibGUnLFxyXG4gICAgICAgICAgICAgICAgaW5mb0ZpbHRlcmVkOiAnKGZpbHRlcmVkIGZyb20gX01BWF8gdG90YWwgcmVjb3JkcyknLFxyXG4gICAgICAgICAgICAgICAgb1BhZ2luYXRlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc05leHQ6ICc8ZW0gY2xhc3M9XCJmYSBmYS1jYXJldC1yaWdodFwiPjwvZW0+JyxcclxuICAgICAgICAgICAgICAgICAgICBzUHJldmlvdXM6ICc8ZW0gY2xhc3M9XCJmYSBmYS1jYXJldC1sZWZ0XCI+PC9lbT4nXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgIC8vIEZpbHRlclxyXG5cclxuICAgICAgICAkKCcjZGF0YXRhYmxlMicpLkRhdGFUYWJsZSh7XHJcbiAgICAgICAgICAgICdwYWdpbmcnOiB0cnVlLCAvLyBUYWJsZSBwYWdpbmF0aW9uXHJcbiAgICAgICAgICAgICdvcmRlcmluZyc6IHRydWUsIC8vIENvbHVtbiBvcmRlcmluZ1xyXG4gICAgICAgICAgICAnaW5mbyc6IHRydWUsIC8vIEJvdHRvbSBsZWZ0IHN0YXR1cyB0ZXh0XHJcbiAgICAgICAgICAgIHJlc3BvbnNpdmU6IHRydWUsXHJcbiAgICAgICAgICAgIC8vIFRleHQgdHJhbnNsYXRpb24gb3B0aW9uc1xyXG4gICAgICAgICAgICAvLyBOb3RlIHRoZSByZXF1aXJlZCBrZXl3b3JkcyBiZXR3ZWVuIHVuZGVyc2NvcmVzIChlLmcgX01FTlVfKVxyXG4gICAgICAgICAgICBvTGFuZ3VhZ2U6IHtcclxuICAgICAgICAgICAgICAgIHNTZWFyY2g6ICdTZWFyY2ggYWxsIGNvbHVtbnM6JyxcclxuICAgICAgICAgICAgICAgIHNMZW5ndGhNZW51OiAnX01FTlVfIHJlY29yZHMgcGVyIHBhZ2UnLFxyXG4gICAgICAgICAgICAgICAgaW5mbzogJ1Nob3dpbmcgcGFnZSBfUEFHRV8gb2YgX1BBR0VTXycsXHJcbiAgICAgICAgICAgICAgICB6ZXJvUmVjb3JkczogJ05vdGhpbmcgZm91bmQgLSBzb3JyeScsXHJcbiAgICAgICAgICAgICAgICBpbmZvRW1wdHk6ICdObyByZWNvcmRzIGF2YWlsYWJsZScsXHJcbiAgICAgICAgICAgICAgICBpbmZvRmlsdGVyZWQ6ICcoZmlsdGVyZWQgZnJvbSBfTUFYXyB0b3RhbCByZWNvcmRzKScsXHJcbiAgICAgICAgICAgICAgICBvUGFnaW5hdGU6IHtcclxuICAgICAgICAgICAgICAgICAgICBzTmV4dDogJzxlbSBjbGFzcz1cImZhIGZhLWNhcmV0LXJpZ2h0XCI+PC9lbT4nLFxyXG4gICAgICAgICAgICAgICAgICAgIHNQcmV2aW91czogJzxlbSBjbGFzcz1cImZhIGZhLWNhcmV0LWxlZnRcIj48L2VtPidcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgLy8gRGF0YXRhYmxlIEJ1dHRvbnMgc2V0dXBcclxuICAgICAgICAgICAgZG9tOiAnQmZydGlwJyxcclxuICAgICAgICAgICAgYnV0dG9uczogW1xyXG4gICAgICAgICAgICAgICAgeyBleHRlbmQ6ICdjb3B5JywgY2xhc3NOYW1lOiAnYnRuLWluZm8nIH0sXHJcbiAgICAgICAgICAgICAgICB7IGV4dGVuZDogJ2NzdicsIGNsYXNzTmFtZTogJ2J0bi1pbmZvJyB9LFxyXG4gICAgICAgICAgICAgICAgeyBleHRlbmQ6ICdleGNlbCcsIGNsYXNzTmFtZTogJ2J0bi1pbmZvJywgdGl0bGU6ICdYTFMtRmlsZScgfSxcclxuICAgICAgICAgICAgICAgIHsgZXh0ZW5kOiAncGRmJywgY2xhc3NOYW1lOiAnYnRuLWluZm8nLCB0aXRsZTogJCgndGl0bGUnKS50ZXh0KCkgfSxcclxuICAgICAgICAgICAgICAgIHsgZXh0ZW5kOiAncHJpbnQnLCBjbGFzc05hbWU6ICdidG4taW5mbycgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICQoJyNkYXRhdGFibGUzJykuRGF0YVRhYmxlKHtcclxuICAgICAgICAgICAgJ3BhZ2luZyc6IHRydWUsIC8vIFRhYmxlIHBhZ2luYXRpb25cclxuICAgICAgICAgICAgJ29yZGVyaW5nJzogdHJ1ZSwgLy8gQ29sdW1uIG9yZGVyaW5nXHJcbiAgICAgICAgICAgICdpbmZvJzogdHJ1ZSwgLy8gQm90dG9tIGxlZnQgc3RhdHVzIHRleHRcclxuICAgICAgICAgICAgcmVzcG9uc2l2ZTogdHJ1ZSxcclxuICAgICAgICAgICAgLy8gVGV4dCB0cmFuc2xhdGlvbiBvcHRpb25zXHJcbiAgICAgICAgICAgIC8vIE5vdGUgdGhlIHJlcXVpcmVkIGtleXdvcmRzIGJldHdlZW4gdW5kZXJzY29yZXMgKGUuZyBfTUVOVV8pXHJcbiAgICAgICAgICAgIG9MYW5ndWFnZToge1xyXG4gICAgICAgICAgICAgICAgc1NlYXJjaDogJ1NlYXJjaCBhbGwgY29sdW1uczonLFxyXG4gICAgICAgICAgICAgICAgc0xlbmd0aE1lbnU6ICdfTUVOVV8gcmVjb3JkcyBwZXIgcGFnZScsXHJcbiAgICAgICAgICAgICAgICBpbmZvOiAnU2hvd2luZyBwYWdlIF9QQUdFXyBvZiBfUEFHRVNfJyxcclxuICAgICAgICAgICAgICAgIHplcm9SZWNvcmRzOiAnTm90aGluZyBmb3VuZCAtIHNvcnJ5JyxcclxuICAgICAgICAgICAgICAgIGluZm9FbXB0eTogJ05vIHJlY29yZHMgYXZhaWxhYmxlJyxcclxuICAgICAgICAgICAgICAgIGluZm9GaWx0ZXJlZDogJyhmaWx0ZXJlZCBmcm9tIF9NQVhfIHRvdGFsIHJlY29yZHMpJyxcclxuICAgICAgICAgICAgICAgIG9QYWdpbmF0ZToge1xyXG4gICAgICAgICAgICAgICAgICAgIHNOZXh0OiAnPGVtIGNsYXNzPVwiZmEgZmEtY2FyZXQtcmlnaHRcIj48L2VtPicsXHJcbiAgICAgICAgICAgICAgICAgICAgc1ByZXZpb3VzOiAnPGVtIGNsYXNzPVwiZmEgZmEtY2FyZXQtbGVmdFwiPjwvZW0+J1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAvLyBEYXRhdGFibGUga2V5IHNldHVwXHJcbiAgICAgICAgICAgIGtleXM6IHRydWVcclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9XHJcblxyXG59KSgpOyIsIi8vIEN1c3RvbSBDb2RlXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgJChpbml0Q3VzdG9tKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0Q3VzdG9tKCkge1xyXG5cclxuICAgICAgICAvLyBjdXN0b20gY29kZVxyXG5cclxuICAgIH1cclxuXHJcbn0pKCk7Il19
