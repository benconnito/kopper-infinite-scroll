var view = $('body');
var k = new KopperInfiniteScroll(view);

var collection = {
	state: {
		totalPages: 1,
		currentPage: 1
	},
	links: {},
	getPage: function (page) {
		if (page >= this.state.totalPages && page <= 4) {
			this.state.totalPages = page;
		}

		this.state.currentPage = page;
		this.links[page] = true;

		if (page < 4) {
			this.links[page + 1] = true;
		}

		return _.map(_.range(10), function (index) {
			return {
				page: page,
				index: index
			};
		});
	}
};

var setUpOverrides = function () {
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
};

QUnit.test('test methods to be overriden', function (assert) {
	assert.throws(function () {
		k.getPaginatedCollection();
	});

	assert.throws(function () {
		k.populatePaginatedList();
	});

	setUpOverrides()
});

QUnit.test('test created', function (assert) {
	assert.ok(k);
});

QUnit.test('test clearPageCounts', function (assert) {
	k.clearPageCounts();

	assert.equal(k.lowestPage, 1);
	assert.equal(k.highestPage, 1);
});

QUnit.test('test attach/detach scroll listener', function (assert) {
	k.attachScrollListener();
	k.detachScrollListener();

	assert.ok(true);
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
		assert.equal(view.find('#1-container').length, 1);
		assert.equal(view.find('#2-container').length, 1);
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
		assert.equal(view.find('#1-container').length, 1);
		assert.equal(view.find('#2-container').length, 1);
		assert.equal(view.find('#3-container').length, 1);

		assert.ok(view.find('#1-container').hasClass('empty'));
		assert.notOk(view.find('#2-container').hasClass('empty'));
		assert.notOk(view.find('#3-container').hasClass('empty'));
	}).catch(function (error) {
		console.log(error);
	}).then(done);
});

QUnit.test('test testScrollPosition for page 4', function (assert) {
	var done = assert.async();

	k.testScrollPosition().then(function () {
		assert.equal(view.find('#1-container').length, 1);
		assert.equal(view.find('#2-container').length, 1);
		assert.equal(view.find('#3-container').length, 1);
		assert.equal(view.find('#4-container').length, 1);

		assert.ok(view.find('#1-container').hasClass('empty'));
		assert.ok(view.find('#2-container').hasClass('empty'));
		assert.notOk(view.find('#3-container').hasClass('empty'));
		assert.notOk(view.find('#4-container').hasClass('empty'));
	}).catch(function (error) {
		console.log(error);
	}).then(done);
});

QUnit.test('test testScrollPosition for page 5 doesnt exist', function (assert) {
	var done = assert.async();

	k.testScrollPosition().then(function () {
		assert.ok(false, 'there is no page 5, test should have failed');
	}).catch(function (error) {
		assert.equal(view.find('#5-container').length, 0);
	}).then(done);
});

QUnit.test('test testScrollPosition for gettingPrevious page 1 and drop pages', function (assert) {
	var done = assert.async();

	view.css({
		height: '20px'
	});

	k.testScrollPosition().then(function () {
		assert.equal(view.find('#1-container').length, 1);
		assert.equal(view.find('#2-container').length, 1);
		assert.equal(view.find('#3-container').length, 0);
		assert.equal(view.find('#4-container').length, 0);

		assert.notOk(view.find('#1-container').hasClass('empty'));
		assert.notOk(view.find('#2-container').hasClass('empty'));
	}).catch(function (error) {
		console.log(error);
	}).then(done);
});

QUnit.test('test retrievePreviousItesm on too low a page', function (assert) {
	var done = assert.async();

	k.retrievePreviousItems().then(function () {
		assert.ok(false, 'there is no page 0, test should have failed');
	}).catch(function (error) {
		assert.equal(view.find('#0-container').length, 0);
	}).then(done);
});

QUnit.test('test testScrollPosition for already on page 1', function (assert) {
	var done = assert.async();

	k.testScrollPosition().then(function () {
		assert.equal(view.find('#1-container').length, 1);
		assert.equal(view.find('#2-container').length, 1);
		assert.equal(view.find('#3-container').length, 0);
		assert.equal(view.find('#4-container').length, 0);

		assert.notOk(view.find('#1-container').hasClass('empty'));
		assert.notOk(view.find('#2-container').hasClass('empty'));
	}).catch(function (error) {
		console.log(error);
	}).then(done);
});

QUnit.test('test testScrollPosition for not on a page', function (assert) {
	var done = assert.async();

	view.css({
		height: '10px'
	});

	k.testScrollPosition().then(function () {
		assert.equal(view.find('#1-container').length, 1);
		assert.equal(view.find('#2-container').length, 1);
		assert.equal(view.find('#3-container').length, 0);
		assert.equal(view.find('#4-container').length, 0);

		assert.notOk(view.find('#1-container').hasClass('empty'));
		assert.notOk(view.find('#2-container').hasClass('empty'));
	}).catch(function (error) {
		console.log(error);
	}).then(done);
});