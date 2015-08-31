describe('<md-toolbar>', function() {

  var pageScope, element, controller;
  var $rootScope, $timeout;

  beforeEach(module('material.components.toolbar'));
  beforeEach(inject(function(_$rootScope_, _$timeout_) {
    $rootScope = _$rootScope_;
    $timeout = _$timeout_;
  }));

  it('with scrollShrink, it should shrink scrollbar when going to bottom', inject(function($compile, $rootScope, $mdConstant, mdToolbarDirective, $$rAF) {

    var parent = angular.element('<div>');
    var toolbar = angular.element('<md-toolbar>');
    var contentEl = angular.element('<div>');
    // Make content and toolbar siblings
    parent.append(toolbar).append(contentEl);

    //Prop will be used for offsetHeight, give a fake offsetHeight
    spyOn(toolbar, 'prop').and.callFake(function() {
      return 100;
    });

    // Fake the css function so we can read css values properly,
    // no matter which browser the tests are being run on.
    // (IE, firefox, chrome all give different results when reading element.style)
    var toolbarCss = {};
    spyOn(toolbar, 'css').and.callFake(function(k, v) {
      toolbarCss[k] = v;
    });
    var contentCss = {};
    spyOn(contentEl, 'css').and.callFake(function(k, v) {
      contentCss[k] = v;
    });

    // Manually link so we can give our own elements with spies on them
    mdToolbarDirective[0].link($rootScope, toolbar, {
      mdScrollShrink: true,
      mdShrinkSpeedFactor: 1
    });

    $rootScope.$apply();
    $rootScope.$broadcast('$mdContentLoaded', contentEl);
    $$rAF.flush();


    //Expect everything to be in its proper initial state.
    expect(toolbarCss[$mdConstant.CSS.TRANSFORM]).toEqual('translate3d(0,0px,0)');
    expect(contentCss['margin-top']).toEqual('-100px');
    expect(contentCss['margin-bottom']).toEqual('-100px');
    expect(contentCss[$mdConstant.CSS.TRANSFORM]).toEqual('translate3d(0,100px,0)');

    // Fake scroll to the bottom
    contentEl.triggerHandler({
      type: 'scroll',
      target: {scrollTop: 500}
    });
    $$rAF.flush();

    expect(toolbarCss[$mdConstant.CSS.TRANSFORM]).toEqual('translate3d(0,-100px,0)');
    expect(contentCss[$mdConstant.CSS.TRANSFORM]).toEqual('translate3d(0,0px,0)');

    // Fake scroll back to the top
    contentEl.triggerHandler({
      type: 'scroll',
      target: {scrollTop: 0}
    });
    $$rAF.flush();

    expect(toolbarCss[$mdConstant.CSS.TRANSFORM]).toEqual('translate3d(0,0px,0)');
    expect(contentCss[$mdConstant.CSS.TRANSFORM]).toEqual('translate3d(0,100px,0)');

  }));

  it('works without ng-if', inject(function() {
    build(
      '<div>' +
      '  <md-toolbar md-scroll-shrink="true"></md-toolbar>' +
      '  <md-content></md-content>' +
      '</div>'
    );

    expect(element.find('md-content').attr('scroll-shrink')).toEqual('true');
  }));

  it('works with ng-if', inject(function() {
    build(
      '<div>' +
      '  <md-toolbar md-scroll-shrink="true" ng-if="shouldShowToolbar"></md-toolbar>' +
      '  <md-content></md-content>' +
      '</div>'
    );

    // It starts out undefined
    expect(element.find('md-content').attr('scroll-shrink')).toEqual(undefined);

    // Change the ng-if to add the toolbar
    pageScope.$apply('shouldShowToolbar = true');
    expect(element.find('md-content').attr('scroll-shrink')).toEqual('true');

    // Change the ng-if to remove the toolbar
    pageScope.$apply('shouldShowToolbar = false');
    expect(element.find('md-content').attr('scroll-shrink')).toEqual('false');
  }));

  it('enables scroll shrink when the attribute has no value', function() {
    build(
      '<div>' +
      '  <md-toolbar md-scroll-shrink></md-toolbar>' +
      '  <md-content></md-content>' +
      '</div>'
    );

    expect(element.find('md-content').attr('scroll-shrink')).toEqual('true');
  });

  it('watches the value of scroll shrink', function() {
    build(
      '<div>' +
      '  <md-toolbar md-scroll-shrink="shouldShrink"></md-toolbar>' +
      '  <md-content></md-content>' +
      '</div>'
    );

    // It starts out undefined which SHOULD add the scroll shrink because it acts as if no value
    // was specified
    expect(element.find('md-content').attr('scroll-shrink')).toEqual('true');

    // Change the scrollShink to false
    pageScope.$apply('shouldShrink = false');
    expect(element.find('md-content').attr('scroll-shrink')).toEqual('false');

    // Change the scrollShink to true
    pageScope.$apply('shouldShrink = true');
    expect(element.find('md-content').attr('scroll-shrink')).toEqual('true');
  });

  function build(template) {
    inject(function($compile) {
      pageScope = $rootScope.$new();
      element = $compile(template)(pageScope);
      controller = element.controller('mdToolbar');

      pageScope.$apply();
      $timeout.flush();
    });
  }
});
