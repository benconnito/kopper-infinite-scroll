(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module unless amdModuleId is set
    define(["jquery","underscore","bluebird"], function (a0,b1,c2) {
      return (root['KopperInfiniteScroll'] = factory(a0,b1,c2));
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require("jquery"),require("underscore"),require("bluebird"));
  } else {
    root['KopperInfiniteScroll'] = factory($,_,Promise);
  }
}(this, function ($, _, Promise) {

function KopperInfiniteScroll(view, pageStart) {
	this.view = view;
	this.lock = false;
	this.pageStart = pageStart || 1;

	this.clearPageCounts();
}

KopperInfiniteScroll.prototype.clearPageCounts = function () {
	this.lowestPage = this.pageStart;
	this.highestPage = this.pageStart;
};

KopperInfiniteScroll.prototype.attachScrollListener = function () {
	this.view.on('scroll', _.debounce(_.bind(this.testScrollPosition, this), 300));
};

KopperInfiniteScroll.prototype.detachScrollListener = function () {
	this.view.off('scroll');
};

KopperInfiniteScroll.prototype.getActualHeight = function () {
	var totalHeight = 0;

	this.view.find('.paginated-page-container').each(function () {
		totalHeight = totalHeight + $(this).height();
	});

	return totalHeight;
};

KopperInfiniteScroll.prototype.isScrolledIntoView = function (element) {
	var docTop = this.view.scrollTop();
	var docBottom = docTop + this.view.outerHeight();

	var elemTop = element.position().top + docTop;
	var elemBottom = elemTop + element.height();

	return (elemBottom >= docBottom && elemTop <= docTop) || (elemBottom >= docTop && elemTop <= docTop) || (elemTop <= docBottom && elemBottom >= docBottom) || (elemTop >= docTop && elemBottom <= docBottom);
};

KopperInfiniteScroll.prototype.testScrollPosition = function () {
	var self = this;

	if (this.lock === false) {
		this.lock = true;

		if (this.view.scrollTop() + this.view.outerHeight() >= this.getActualHeight()) {
			console.debug('get next collection page', this.highestPage + 1);

			return this.retrieveNextItems().finally(function () {
				self.lock = false;
			});
		} else {
			//find what container we are on
			var page = this.pageStart;

			var container = this.view.find('#' + this.getPaginatedContainerId(page));			
			while (container.length > 0 && this.isScrolledIntoView(container) === false && page < this.getCurrentTotalPages()) {				
				page++;
				container = this.view.find('#' + this.getPaginatedContainerId(page));
			}

			var getPreviousPageAndCheckForChildren = function () {
				console.debug('loop to get previous collection pages', page, 'the collection is getting', self.lowestPage - 1);

				return self.retrievePreviousItems().then(function () {
					if (container.children().length === 0) {
						return getPreviousPageAndCheckForChildren();
					}
				});
			};

			if (page < this.lowestPage) {
				return getPreviousPageAndCheckForChildren().finally(function () {
					self.lock = false;
				});
			} else {
				console.debug('we already have page', page, 'or it is not in the collection - the collection is on page', self.getCurrentPage());

				this.lock = false;

				return Promise.resolve();
			}
		}
	}
};

KopperInfiniteScroll.prototype.retrieveNextItems = function () {
	var self = this;

	if (this.hasPage(this.highestPage + 1) === true) {
		this.showLoader();

		if (this.lowestPage < this.highestPage) {
			this.emptyPaginatedContainer(this.getPaginatedContainerId(this.lowestPage));
			this.lowestPage++;
		}

		return this.getPage(this.highestPage + 1).then(function (collection) {
			self.highestPage++;

			return self.managePaginatedContainers(collection);
		});
	} else {
		return Promise.reject('could not get next or there is no next collection page');
	}
};

KopperInfiniteScroll.prototype.retrievePreviousItems = function () {
	var self = this;

	if (this.hasPage(this.lowestPage - 1) === true) {
		this.showLoader();

		this.removePaginatedContainer(this.getPaginatedContainerId(this.highestPage));
		this.highestPage = Math.max(this.pageStart, this.highestPage - 1);

		return this.getPage(this.lowestPage - 1).then(function (collection) {
			self.lowestPage = Math.max(self.pageStart, self.lowestPage - 1);

			return self.managePaginatedContainers(collection);
		});
	} else {
		return Promise.reject('could not get previous or there is no previous collection page');
	}
};

KopperInfiniteScroll.prototype.getPage = function (page) {
	return Promise.resolve(this.getPaginatedCollection().getPage(page));
};

KopperInfiniteScroll.prototype.hasPage = function (page) {
	var collection = this.getPaginatedCollection();

	if (collection && page >= this.pageStart) {
		if (page <= this.getCurrentTotalPages()) {
			return true;
		} else if (collection.links) {
			return collection.links[page] ? true : false;
		}
	}

	return false;
};

KopperInfiniteScroll.prototype.getCurrentPage = function () {
	return this.getPaginatedCollection().state.currentPage;
};

KopperInfiniteScroll.prototype.getCurrentTotalPages = function () {
	return this.getPaginatedCollection().state.totalPages;
};


KopperInfiniteScroll.prototype.getPaginatedCollection = function () {
	throw new Error('getPaginatedCollection should be implemented');
};

KopperInfiniteScroll.prototype.getPaginatedContainerId = function (page) {
	var prefix = this.getPaginationContainerPrefix();

	return (prefix ? (prefix + '-') : '') + page + '-container';
};

KopperInfiniteScroll.prototype.getPaginationContainerPrefix = function () {
	return null;
};

KopperInfiniteScroll.prototype.createPaginatedContainer = function (page) {
	var container = $(document.createElement('div'));
	container.attr('id', this.getPaginatedContainerId(page));
	container.addClass('paginated-page-container');

	return container;
};

KopperInfiniteScroll.prototype.emptyPaginatedContainer = function (id) {
	var container = this.view.find('#' + id);

	if (container.length > 0) {
		var height = container.height();

		container.css({
			height: height + 'px'
		});

		container.addClass('empty');

		container.empty();
	}
};

KopperInfiniteScroll.prototype.removePaginatedContainer = function (id) {
	var container = this.view.find('#' + id);
	container.remove();
};

KopperInfiniteScroll.prototype.managePaginatedContainers = function (collection, id) {
	if (!id) {
		id = this.getPaginatedContainerId(this.getCurrentPage());
	}

	var isNew = false;
	var container = this.view.find('#' + id);

	if (container.length > 0) {
		container.removeAttr('style');
		container.removeClass('empty');
	} else {
		isNew = true;
		container = this.createPaginatedContainer(this.getCurrentPage());
	}

	this.populatePaginatedList(collection, container, isNew);
};

KopperInfiniteScroll.prototype.populatePaginatedList = function (collection, container, isNew) {
	throw new Error('populatePaginatedList should be implmented');
};

KopperInfiniteScroll.prototype.showLoader = function () {
};



return KopperInfiniteScroll;

}));
