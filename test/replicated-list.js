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
		var rl = new ReplicatedList([0, true, 'test']);

		assert.equal(rl.length, 3);

		rl.push(4);

		assert.equal(rl.length, 4);
	});

	it('gets', function() {
		var rl = new ReplicatedList([0, true, 'test']);

		assert.equal(rl.get(0), 0);

		assert.equal(rl.get(1), true);

		assert.equal(rl.get(2), 'test');

		assert.equal(rl.get(3), undefined);
	});

	it('pushes', function() {
		var rl = new ReplicatedList();

		rl.push(0);

		rl.push('test');

		rl.push(true);

		rl.push([5]);

		rl.push({t: 1});

		assert.deepEqual(rl._state, [
			0,
			'test',
			true,
			[5],
			{t: 1}
		]);
	});

	it('pops', function() {
		var rl = new ReplicatedList();

		rl.push(0);

		rl.push('test');

		assert.equal(rl.pop(), 'test');

		assert.deepEqual(rl._state, [0]);
	});

	it('unshifts', function() {
		var rl = new ReplicatedList();

		rl.unshift(0);

		rl.unshift('test');

		rl.unshift(true);

		rl.unshift([5]);

		rl.unshift({t: 1});

		assert.deepEqual(rl._state, [
			{t: 1},
			[5],
			true,
			'test',
			0
		]);
	});

	it('shifts', function() {
		var rl = new ReplicatedList(['test', 0]);

		assert.equal(rl.shift(), 'test');

		assert.equal(rl.shift(), 0);
	});

	it('splices', function() {
		var rl = new ReplicatedList([true, 'test', 0, 5, 8, 3]);

		assert.deepEqual(rl.splice(1, 2), ['test', 0]);

		assert.equal(rl.length, 4);

		assert.deepEqual(rl.splice(0, 0, 'added', false), []);

		assert.deepEqual(rl._state, ['added', false, true, 5, 8, 3]);
	});

	it('clears', function() {
		var rl = new ReplicatedList(['j', 'k', 2]);

		assert.deepEqual(rl._state, ['j', 'k', 2]);

		rl.clear();

		assert.deepEqual(rl._state, []);

		assert.equal(rl.length, 0);
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
