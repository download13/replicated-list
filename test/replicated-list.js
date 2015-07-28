var ReplicatedList = require('../index');

var assert = require('assert');

var through2 = require('through2');

var EventEmitter = require('events').EventEmitter;


describe('ReplicatedList', function() {
	it('is creatable', function() {
		var rl1 = new ReplicatedList();

		var rl2 = ReplicatedList();

		var rl3 = new ReplicatedList(['testelement']);

		assert(rl1 instanceof ReplicatedList);

		assert(rl2 instanceof ReplicatedList);

		assert.deepEqual(rl3._state, ['testelement']);
	});

	it('has length', function() {
		var list = new ReplicatedList([0, true, 'test']);

		assert.equal(list.length, 3);

		list.push(4);

		assert.equal(list.length, 4);
	});

	it('gets', function() {
		var list = new ReplicatedList([0, true, 'test']);

		assert.equal(list.get(0), 0);

		assert.equal(list.get(1), true);

		assert.equal(list.get(2), 'test');

		assert.equal(list.get(3), undefined);
	});

	it('pushes', function() {
		var list = new ReplicatedList();

		var events = [];

		list.on('push', function(v) {
			events.push(v);
		});

		list.push(0);

		list.push('test');

		list.push(true);

		list.push([5]);

		list.push({t: 1});

		assert.deepEqual(list._state, [
			0,
			'test',
			true,
			[5],
			{t: 1}
		]);

		assert.deepEqual(events, [
			0,
			'test',
			true,
			[5],
			{t: 1}
		]);
	});

	it('pops', function() {
		var list = new ReplicatedList();

		var events = [];

		list.on('pop', function(v) {
			events.push(v);
		});

		list.push(0);

		list.push('test');

		assert.equal(list.pop(), 'test');

		assert.deepEqual(list._state, [0]);

		assert.deepEqual(events, ['test']);
	});

	it('unshifts', function() {
		var list = new ReplicatedList();

		var events = [];

		list.on('unshift', function(v) {
			events.push(v);
		});

		list.unshift(0);

		list.unshift('test');

		list.unshift(true);

		list.unshift([5]);

		list.unshift({t: 1});

		assert.deepEqual(list._state, [
			{t: 1},
			[5],
			true,
			'test',
			0
		]);

		assert.deepEqual(events, [
			0,
			'test',
			true,
			[5],
			{t: 1}
		]);
	});

	it('shifts', function() {
		var list = new ReplicatedList(['test', 0]);

		var events = [];

		list.on('shift', function(v) {
			events.push(v);
		});

		assert.equal(list.shift(), 'test');

		assert.equal(list.shift(), 0);

		assert.deepEqual(events, [
			'test',
			0
		]);
	});

	it('splices', function() {
		var list = new ReplicatedList([true, 'test', 0, 5, 8, 3]);

		var events = [];

		list.on('splice', function(start, remove, firstItem) {
			events.push({s: start, r: remove, fi: firstItem});
		});

		assert.deepEqual(list.splice(1, 2), ['test', 0]);

		assert.equal(list.length, 4);

		assert.deepEqual(list.splice(0, 0, 'added', false), []);

		assert.deepEqual(list._state, ['added', false, true, 5, 8, 3]);

		assert.deepEqual(events, [
			{s: 1, r: 2, fi: undefined},
			{s: 0, r: 0, fi: 'added'}
		]);
	});

	it('clears', function() {
		var list = new ReplicatedList(['j', 'k', 2]);

		var events = [];

		list.on('clear', function() {
			events.push(true);
		});

		assert.deepEqual(list._state, ['j', 'k', 2]);

		list.clear();

		assert.deepEqual(list._state, []);

		assert.equal(list.length, 0);

		assert.deepEqual(events, [true]);
	});

	it('loops', function() {
		var r = [];

		var rl = new ReplicatedList(['j', 'k', 2]);

		rl.forEach(function(value, index) {
			r.push({v: value, i: index});
		});

		assert.deepEqual(r, [
			{v: 'j', i: 0},
			{v: 'k', i: 1},
			{v: 2, i: 2},
		]);

		r = rl.map(function(value, index) {
			return {v: value, i: index};
		});

		assert.deepEqual(r, [
			{v: 'j', i: 0},
			{v: 'k', i: 1},
			{v: 2, i: 2},
		]);
	});

	it('takes cmds', function() {
		var rl = new ReplicatedList();

		rl.cmd('push', [4]);

		assert.equal(rl.get(0), 4);

		rl.cmd('pop', []);

		assert.equal(rl.get(0), undefined);

		assert.equal(rl.length, 0);
	});

	it('replicates cmds', function(done) {
		var rlSender = new ReplicatedList(['original']);

		var rlRecver = new ReplicatedList();


		rlSender.push('existing');

		// Use a stream to simulate a network connection
		var s = pretendNetwork();

		s.on('data', function(msg) {
			rlRecver.cmd(msg.cmd, msg.args);
		});

		var stop = rlSender.replicate(function(cmd, args) {
			s.write({cmd: cmd, args: args});
		});

		rlSender.unshift('new');

		rlSender.pop();


		setTimeout(function() {
			assert.deepEqual(rlRecver._state, ['new', 'original']);

			done();
		}, 50);
	});
});


function pretendNetwork() {
	return through2.obj(function(item, enc, next) {
		var self = this;

		setTimeout(function() {
			self.push(item);

			next();
		}, 5);
	});
}
