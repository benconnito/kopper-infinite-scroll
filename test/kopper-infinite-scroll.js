require.config({
	paths: {
		qunit: 'https://cdnjs.cloudflare.com/ajax/libs/qunit/2.0.0/qunit.min',
		jquery: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.0/jquery.min',
		underscore: 'https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min',
		bluebird: 'https://cdnjs.cloudflare.com/ajax/libs/bluebird/3.4.1/bluebird.min'
	}
});

require([
	'qunit',
	'jquery',
	'underscore',
	'../dist/kopper-infinite-scroll.min'
], function (QUnit, $, _, KopperInfiniteScroll) {
	QUnit.start();

	var view = $('body');
	var k = new KopperInfiniteScroll(view);

	var collection = {
		state: {
			totalPages: 1,
			currentPage: 1
		},
		links: {},
		getPage: function (page) {
			if (page >= this.state.totalPages) {
				this.state.totalPages = page;
			}

			this.state.currentPage = page;
			this.links[page] = true;
			this.links[page + 1] = true;

			return _.map(_.range(10), function (index) {
				return {
					page: page,
					index: index
				};
			});
		}
	};

	k.getPaginatedCollection = function () {
		return collection;
	};

	k.populatePaginatedList = function (collection, container, isNew) {
		if (collection && collection.length > 0) {
			_.each(collection, function (item) {
				var element = $(document.createElement('p'));
				element.text('page: ' + item.page + ' - index: ' + item.index);

				container.append(element);
			});

			if (isNew) {
				view.append(container);
			}
		} else {
			throw new Error('collection has no items');
		}
	};

	QUnit.test('test created', function (assert) {
		assert.ok(k);
	});

	QUnit.test('test clearPageCounts', function (assert) {
		k.clearPageCounts();

		assert.equal(k.lowestPage, 1);
		assert.equal(k.highestPage, 1);
	});

	QUnit.test('test view height', function (assert) {
		assert.equal(view.scrollTop() + view.outerHeight(), 0);
	});

	QUnit.test('test getActualHeight', function (assert) {
		assert.equal(k.getActualHeight(), 0);
	});

	QUnit.test('test populatePaginatedList with new container on page 1', function (assert) {
		var done = assert.async();

		k.getPage(1).then(function (collection) {
			k.managePaginatedContainers(collection);
			
			assert.equal(view.find('#1-container').length, 1);
			assert.equal(view.find('.paginated-page-container').length, 1);

			assert.equal(view.find('#1-container p').length, 10);
			assert.equal(view.find('#1-container p').eq(0).text(), 'page: 1 - index: 0');
		}).catch(function (error) {
			console.log(error);
		}).then(done);
	});

	QUnit.test('test testScrollPosition for page 2', function (assert) {
		var done = assert.async();

		k.testScrollPosition().then(function () {
			assert.equal(view.find('#2-container').length, 1);
			assert.equal(view.find('.paginated-page-container').length, 2);
		}).catch(function (error) {
			console.log(error);
		}).then(done);
	});

	QUnit.test('test isScrolledIntoView', function (assert) {
		assert.ok(k.isScrolledIntoView(view.find('#1-container')));
	});
	
	QUnit.test('test testScrollPosition for page 3', function (assert) {
		var done = assert.async();

		k.testScrollPosition().then(function () {
			assert.equal(view.find('#3-container').length, 1);
			assert.equal(view.find('.paginated-page-container').length, 3);
		}).catch(function (error) {
			console.log(error);
		}).then(done);
	});
	
	QUnit.test('test testScrollPosition for page 4 and drop page 1', function (assert) {
		var done = assert.async();

		k.testScrollPosition().then(function () {
			assert.equal(view.find('#4-container').length, 1);
			assert.equal(view.find('.paginated-page-container').length, 4);
			
			assert.ok(view.find('#1-container').hasClass('empty'));
		}).catch(function (error) {
			console.log(error);
		}).then(done);
	});
	
	QUnit.test('test testScrollPosition for gettingPrevious page 1 and drop page 4', function (assert) {
		var done = assert.async();
		
		view.css({
			height: '10px'
		});
		
		k.testScrollPosition().then(function () {
			assert.equal(view.find('#4-container').length, 0);
			assert.equal(view.find('#3-container').length, 0);
			assert.equal(view.find('.paginated-page-container').length, 2);
			
			assert.notOk(view.find('#1-container').hasClass('empty'));
		}).catch(function (error) {
			console.log(error);
		}).then(done);
	});
});