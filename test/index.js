var ReplicatedList = require('../');

var assert = require('assert');


describe('ReplicatedList', function() {
	it('is creatable', function() {
		var el = new ReplicatedList();

		assert(el instanceof ReplicatedList);
	});

	it('has a get method', function() {
		var el = new ReplicatedList();

		assert(el.get);
	});

	it('has an replicate method', function() {
		var el = new ReplicatedList();

		assert(el.replicate);
	});

	it('has an mutate method', function() {
		var el = new ReplicatedList();

		assert(el.mutate);
	});

	it('has a push method', function() {
		var el = new ReplicatedList();

		assert(el.push);
	});

	it('has a pop method', function() {
		var el = new ReplicatedList();

		assert(el.pop);
	});

	it('has a unshift method', function() {
		var el = new ReplicatedList();

		assert(el.unshift);
	});

	it('has a shift method', function() {
		var el = new ReplicatedList();

		assert(el.shift);
	});

	it('has a splice method', function() {
		var el = new ReplicatedList();

		assert(el.splice);
	});

	it('has a clear method', function() {
		var el = new ReplicatedList();

		assert(el.clear);
	});

	it('can initialize with a list', function() {
		var el = new ReplicatedList([4, 5, 1]);

		assert.equal(el.get(0), 4);
		assert.equal(el.get(1), 5);
		assert.equal(el.get(2), 1);
	});

	it('has a length property', function() {
		var el = new ReplicatedList([4, 5, 1]);

		assert.equal(el.length, 3);
	});

	it('can append items', function() {
		var el = new ReplicatedList();

		el.push('test');

		assert.equal(el.get(0), 'test');
	});

	it('can remove items from end', function() {
		var el = new ReplicatedList([false, true]);

		assert.equal(el.pop(), true);

		assert(!el.get(1));
	});

	it('can prepend items', function() {
		var el = new ReplicatedList([5, 6]);

		el.unshift(8);

		assert.equal(el.get(0), 8);
	});

	it('can remove items from start', function() {
		var el = new ReplicatedList([5, 6]);

		assert.equal(el.shift(), 5);

		assert.equal(el.get(0), 6);
	});

	it('can splice items out', function() {
		var el = new ReplicatedList([5, 6, 2, 't']);

		assert.deepEqual(el.splice(1, 2), [6, 2]);

		assert.equal(el.get(0), 5);
		assert.equal(el.get(1), 't');
		assert(!el.get(2));
	});

	it('can splice items in', function() {
		var el = new ReplicatedList([5, 6]);

		assert.deepEqual(el.splice(1, 0, true, 'grow'), []);

		assert.equal(el.get(0), 5);
		assert.equal(el.get(1), true);
		assert.equal(el.get(2), 'grow');
		assert.equal(el.get(3), 6);
		assert(!el.get(4));
	});

	it('emits events when listened to', function(done) {
		var el = new ReplicatedList([1, 4]);

		var total = 0;
		el.replicate(function(type, index, item) {
			assert.equal(type, 'add');

			total += item;

			if(total === 5) {
				done();
			}
		});
	});

	it('stops emitting events when no longer listened too', function(done) {
		var el = new ReplicatedList([1, 4]);

		var total = 0;
		var removeListener = el.replicate(function(type, index, item) {
			assert.equal(type, 'add');

			total += item;
		});

		el.push(6);

		removeListener();

		el.push(3);

		setTimeout(function() {
			if(total === 11) {
				done();
			}
		}, 10);
	});

	it('emits an event when pushed', function(done) {
		var el = new ReplicatedList();

		el.replicate(function(type, index, item) {
			assert.equal(type, 'add');
			assert.equal(index, 0);
			assert.equal(item, 3);

			done();
		});

		setTimeout(function() {
			el.push(3);
		}, 10);
	});

	it('emits an event when popped', function(done) {
		var el = new ReplicatedList([4]);

		el.replicate(function(type, index, item) {
			if(type === 'add') return;

			assert.equal(type, 'remove');
			assert.equal(index, 0);
			assert.equal(item, 4);

			done();
		});

		el.pop();
	});

	it('emits an event when unshifted', function(done) {
		var el = new ReplicatedList();

		el.replicate(function(type, index, item) {
			assert.equal(type, 'add');
			assert.equal(index, 0);
			assert.equal(item, 3);

			done();
		});

		el.unshift(3);
	});

	it('emits an event when shifted', function(done) {
		var el = new ReplicatedList([4]);

		el.replicate(function(type, index, item) {
			if(type === 'add') return;

			assert.equal(type, 'remove');
			assert.equal(index, 0);
			assert.equal(item, 4);

			done();
		});

		el.shift();
	});

	it('emits events when spliced', function(done) {
		var el = new ReplicatedList([4, 2, 8, 3]);

		var addTotal = 0;
		var removeTotal = 0;
		el.replicate(function(type, index, item) {
			if(type === 'add') {
				addTotal += item;
			} else {
				removeTotal += item;
			}

			if(addTotal === 29 && removeTotal === 10) {
				done();
			}
		});

		el.splice(1, 2, 5, 7);
	});

	it('accepts mutations from a compatible list', function() {
		var el = new ReplicatedList([4, 2, 8, 3]);

		el.mutate('remove', 2);
		el.mutate('remove', 1);

		assert.equal(el.length, 2);
		assert.equal(el.get(0), 4);
		assert.equal(el.get(1), 3);

		el.mutate('add', 0, 1);
		el.mutate('add', 3, 0);

		assert.equal(el.length, 4);
		assert.equal(el.get(0), 1);
		assert.equal(el.get(1), 4);
		assert.equal(el.get(2), 3);
		assert.equal(el.get(3), 0);
	});
});
