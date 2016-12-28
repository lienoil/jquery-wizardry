/**
 * jQuery Wizardry
 * v1.0.0
 *
 * The most powerful (form) wizard to graze the land.
 *
 */
(function ($, document) {
	if (!$) {
		return console.warn('Wizardry needs jQuery');
	}

	var Winterhold = {
		init: function (options, elem) {
			var self = this;
			self.options = $.extend({}, $.fn.wizardry.options, options);
			self.elem = elem;
			self.$elem = $(elem);
			self.$form = self.$elem;

			if ( typeof self.$elem.data('wizardry') == 'object' ) self.options = $.extend({}, self.options, self.$elem.data('wizardry'));

			/**
			 * Sections, Navs, & Buttons
			 *
			 * @return {Object}
			 */
			self.setSections(self);
			self.handleSections(self.$sections, self);
			self.getCurrentActiveSection(self);

			self.setSectionsParent(self);
			self.handleSectionsParent(self);
			self.onWindowResize(self);

			if (self.options.hasNav) {
				self.setNav(self);
				self.handleNav(self);
			}

			self.setNextButton(self);
			self.setPrevButton(self);
			self.handleNextButton(self);
			self.handlePrevButton(self);

			/**
			 * Wizardry Conditional Inputs
			 * These inputs lets you hide/show other input fields
			 * based on value.
			 */
			self.setConditionalInputs(self);
			self.handleConditionalInputs(self);

			/**
			 * Validation
			 *
			 * @param  {boolean} self.options.validate Whether to use the jquery.validattion plugin or not.
			 * @return {void}
			 */
			if (self.options.validate) {
				self.setValidations(self);
			}

			self.onFormSubmit(self);

			self.plugins(self);

			return true;
		},

		setNav: function (self, donotbypass) {
			donotbypass = donotbypass ? donotbypass : true;
			if ( self.$elem.find(self.options.nav).length > 0 && donotbypass) return self.$elem.find(self.options.nav);

			var $form = self.$elem;
			var navClass = (self.options.nav).replace(/^\./, "");
			var $nav = $('<ul class="'+navClass+'" />');
			var sections = self.$sections;
			for (var i = 0; i < sections.length; i++) {
				var id = $( sections[i] ).attr('id');
				var title = $( sections[i] ).find('.wizard-step-title').text();
				$nav.append( '<li class="wizard-nav-item"><a role="button" class="wizard-nav-link" href="#'+id+'">' + title + '</a></li>' );
			}
			$nav.find('.wizard-nav-item').first().addClass('active');

			if ( $form.find('.wizard-title').length == 0 ) {
				$form.prepend( $nav );
			} else {
				$form.find('.wizard-title').after($nav);
			}

			var options = self.options;

			$form.find(options.nav).css({'overflow-x': 'hidden'});

			self.$nav = $form.find($nav);
		},

		getNav: function () {
			return this.$nav;
		},

		handleNav: function (self) {
			var $nav = self.getNav();
			var options = self.options;

			$nav.find('.wizard-nav-link, .wizard-nav-item [role=button], .wizard-nav-item [type=button]').on('click', function (e) {
				if ( ! self.validateOnClick(self, e) ) return false;

				var target = $(this).attr('href');
				var $currentSection = $(target);

				var idOfCurrentSection = "#"+self.getCurrentActiveSection().attr('id');
				var hrefOfCurrentClickedNav = $(this).attr('href');
				if ( idOfCurrentSection != hrefOfCurrentClickedNav ) {
					self.setCurrentActiveSection( $currentSection );

					var currentActiveNav = target.replace('#', '');
					self.setCurrentActiveNav(currentActiveNav);
				}

				// if options.hash is set to false
				if ( ! options.hasUrlHash ) {
					e.preventDefault();
				} else {
					window.location.hash = target;
					e.preventDefault();
				}

				/**
				 * Centers the current active Nav item.
				 *
				 */
				self.scrollNavToCenter(self, $(this).parent());
			});
		},

		scrollNavToCenter: function (self, item) {
			var container = item.parent();
			var p = container.scrollLeft() + item.position().left;
			var w = item.outerWidth();
			var c = container.width();
			var s = Math.max(p - ( (c - w) / 2), 0);
			container.animate({scrollLeft:s}, 100);
		},

		getCurrentActiveNav: function () {
			var $nav = this.getNav();
			return $nav.parent().find('.active');
		},

		setCurrentActiveNav: function (currentActiveNav) {
			var $nav = this.getNav();
			$nav.find('.active').removeClass('active');
			$nav.find('[href="#'+currentActiveNav+'"]').parent('.wizard-nav-item').addClass('active');

			// this.$currentActiveNav = this.getCurrentActiveNav();
		},

		setNextButton: function (self) {
			self.$nextButton = self.$elem.find( '.wizard-footer ' + self.options.footerButtons.next );
		},

		setPrevButton: function (self) {
			self.$prevButton = self.$elem.find( '.wizard-footer ' + self.options.footerButtons.prev );
		},

		getNextButton: function () {
			return this.$nextButton;
		},

		getPrevButton: function () {
			return this.$prevButton;
		},

		handlePrevButton: function (self) {
			$prevButton = self.getPrevButton();

			self.handleButtonsAbility(self);

			$prevButton.on('click', function (e) {
				if ( ! self.validateOnClick(self, e) ) return false;

				var $activeSection = self.getCurrentActiveSection();
				if ( $activeSection.prev().length > 0 ) {
					var $newActiveSection = $activeSection.prev();
					self.setCurrentActiveSection( $newActiveSection );

					var $currentActiveNav = self.getCurrentActiveNav();
					$currentActiveNav = self.getCurrentActiveSection().attr('id');
					self.setCurrentActiveNav($currentActiveNav);
				}

				self.handleButtonsAbility(self);
			});
		},

		handleNextButton: function (self) {
			$nextButton = self.getNextButton();

			self.handleButtonsAbility(self);

			$nextButton.on('click', function (e) {
				if ( ! self.validateOnClick(self, e) ) return false;

				var $activeSection = self.getCurrentActiveSection();
				if ( $activeSection.next().length > 0 ) {
					var $newActiveSection = $activeSection.next();
					self.setCurrentActiveSection( $newActiveSection );

					var $currentActiveNav = self.getCurrentActiveNav();
					$currentActiveNav = self.getCurrentActiveSection().attr('id');
					self.setCurrentActiveNav($currentActiveNav);
				}

				self.handleButtonsAbility(self);
			});
		},

		handleButtonsAbility: function (self) {
			$nextButton = self.getNextButton();
			$prevButton = self.getPrevButton();
			$sections = self.getSections();

			if ( $sections.first().hasClass('active') ) {
				_toggleButtonAbility($prevButton, true);
			} else {
				_toggleButtonAbility($prevButton, false);
			}

			if ( $sections.last().hasClass('active') ) {
				_toggleButtonAbility($nextButton, true);
			} else {
				_toggleButtonAbility($nextButton, false);
			}
		},

		setSectionsParent: function (self) {
			self.$sectionsParent = self.$elem.find('.wizard-steps');
		},

		getSectionsParent: function () {
			return this.$sectionsParent;
		},

		handleSectionsParent: function (self) {
			var $sectionsParent = self.getSectionsParent();
			var $sections = self.getSections();
			var origSectionWidth = $sections.outerWidth();
			var parentWidth = origSectionWidth;//$sectionsParent.outerWidth();
			// $sectionsParent.css({'overflow-x':'hidden'});
			$sectionsParent.outerWidth(parentWidth * $sections.length);
			$sections.outerWidth(origSectionWidth);
			console.log($sections.outerWidth());
		},

		onWindowResize: function (self) {
			// $(document).ready(function () {
				var resizeTimer;
				$(window).on('resize wizardryResize', function (e) {
					clearTimeout( resizeTimer );
					resizeTimer = setTimeout( function () {

						self.handleSectionsParent(self);

					}, 250);
				});//.triggerHandler('wizardryResize');
			// });
		},

		setSections: function (self) {
			self.$sections = self.$elem.find(self.options.section+':visible');
		},

		getSections: function () {
			return this.$sections;
		},

		getCurrentActiveSection: function () {
			$sections = this.getSections();
			return $sections.parent().find('.active');
		},

		setCurrentActiveSection: function ($newCurrentSection) {
			$sections = this.getSections();
			$currentSection = $sections.parent().find('.active');

			$newCurrentSection.addClass(this.options.activeSectionClass);

			this.slideSections(this, $newCurrentSection);

			$currentSection.removeClass(this.options.activeSectionClass);
		},

		handleSections: function ($sections, self) {
			// $sections.
		},

		slideSections: function (self, $section) {
			var $parent = self.getSectionsParent();
			var position = $section.position().left;
			$parent.animate({left: -position}, self.options.animationDuration);
			self.animateSectionHeight(self, $section);
		},

		animateSectionHeight: function (self, $section) {
			if (self.options.autoHeight) {
				var $parent = self.getSectionsParent();
				$parent.animate({height: $section.outerHeight()}, self.options.animationDuration);
			}
		},

		setValidations: function (self) {
			self.$elem.attr('novalidate', true);

			if ( self.options.validatePerSlide ) {
				self.$elem.find(':input').addClass('ignored');
			}

			self.validate(self);
		},

		validate: function (self) {
			if ( self.options.validate ) {
				$(document).ready(function (e) {
					if ( ! $.fn.validate ) {
						$(options.form).find('[type=submit]').attr('disabled', false);

						self._validationErrorMessage();
						return false;
					}

					if ( self.options.validatePerSlide ) {
						var $currentSection = self.getCurrentActiveSection();
						$currentSection.find(':input').removeClass('ignored');

						self.onFormSubmit(self);
					}

					self.$form.validate({
						ignore: '.ignored, :hidden',
						errorPlacement: function (error, element) {
							error.insertAfter(element);

							if ( $(element).hasClass('error') ) {
								var $parent = $(element).parents(self.options.section);
								$parent.addClass("has-error");

								var href = "#" + $parent.attr('id');
								var currentNav = self.$nav.find('.wizard-nav-link[href="'+href+'"]');
								currentNav.addClass('has-error').append("<span class='badge-error'></span>");

								self.scrollNavToCenter(self, currentNav.parent(), self.$nav);
							}
						},

						success: function(error, element) {
							var $parent = error.parents(self.options.section);
							error.remove();

							if ( $parent.find(':input.error').length == 0 ) {
								$parent.removeClass('has-error');
								var href = "#" + $parent.attr('id');
								self.$nav.find('.wizard-nav-link[href="'+href+'"]').removeClass('has-error').find('.badge-error').remove();
							}
						}
					});
				});
			}
		},

		validateOnClick: function (self, element) {
			if (self.options.validatePerSlide) {
				self.validate(self);
				if ( ! self.$form.valid() ) {
					element.preventDefault();
					return false;
				}
				return true;
			}
			return true;
		},

		onFormSubmit: function (self) {
			self.$form.on('submit', function () {
				$(this).find(':input:hidden').prop('disabled', true);

				if ( self.options.validatePerSlide ) {
					$(this).find(':input').removeClass('ignored');
				}
			});
		},

		_validationErrorMessage: function () {
			console.log("[jQuery Wizardry]", "You need to add jQuery Validation for form validations to work. or add an option {validate: false} upon initialization to disable the validation.");
		},

		setConditionalInputs: function (self) {
			self.$conditionalInputs = self.$form.find('[data-on]:input');
		},

		getConditionalInputs: function () {
			return this.$conditionalInputs;
		},

		handleConditionalInputs: function (self) {
			var conditionalInputs = self.getConditionalInputs();
			for (var i = conditionalInputs.length - 1; i >= 0; i--) {
				var $currentInput = $(conditionalInputs[i]);
				$currentInput.addClass('conditional-control');

				$currentInput.on('change triggerTheConditionalInputsEventNow', function (e) {
					var hideTargets = $(this).data('hide');
					var showTargets = $(this).data('show');
					var value = $(this).data('on');

					if (typeof hideTargets !== 'undefined') {
						hideTargets = hideTargets.split(',');
						for (var i = hideTargets.length - 1; i >= 0; i--) {
							if ( value == $(this).val() ) {
								$(hideTargets[i]).fadeOut();
							} else {
								$(hideTargets[i]).fadeIn();
							}
						}
					}

					if (typeof showTargets !== 'undefined') {
						showTargets = showTargets.split(',');
						for (var i = showTargets.length - 1; i >= 0; i--) {
							if ( value == $(this).val() ) {
								$(showTargets[i]).fadeIn();
							} else {
								$(showTargets[i]).fadeOut();
							}
						}
					}

					// self.setNav(self, false);

				}).triggerHandler('triggerTheConditionalInputsEventNow');
			}
		},

		plugins: function (self) {
			/**
			 * Mousewheel plugin.
			 *
			 * @param  {object} $.fn.mousewheel
			 * @return
			 */
			if ( $.fn.mousewheel ) {
				container.mousewheel(function(e){
					var d = e.deltaY * e.deltaFactor * -1;
					self.$nav.scrollLeft( self.$nav.scrollLeft() + d );
				});
			}

			/**
			 * Ladda
			 *
			 * @param  {object}
			 * @return
			 */
			self.$form.on('click', '[type=submit]', function (e) {
				if ( typeof Ladda !== 'undefined' ) {
					var l = Ladda.create(this);
					l.start();
					if ( self.options.validate ) {
						if ( ! self.$form.valid() ) {
							l.stop();
						}
					}
				}
			});
		},

		avadakedavra: function () {
           	var self = this;
           	self.$elem.off('wizardry');
		}

	}

	$.fn.wizardry = function (options, elem) {
		var wizard = Object.create( Winterhold );
		return this.each(function () {
			wizard.init(options, this);
		})
	};

	$.fn.wizardry.options = {
		debug: false,
		section: '.wizard-step',
		activeSectionClass: 'active',
		enterSectionAnimationClass: 'animated slideInLeft',
		exitSectionAnimationClass: 'animated slideOutRight',
		activeNavClass: 'active',
		hasNav: true,
		nav: '.wizard-nav',
		hasUrlHash: true,
		autoHeight: true,
		animationDuration: 50,
		footerButtons: {
			next: '.btn-next',
			prev: '.btn-prev',
		},
		validate: true,
		validatePerSlide: false,
	};

	function _toggleButtonAbility($button, $ability) {
		$button.prop('disabled', $ability);
	}

	$('[data-wizardry]').wizardry();

})(jQuery, document);