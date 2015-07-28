var EventEmitter = require('events').EventEmitter;


var slice = Array.prototype.slice;


function ReplicatedList(array) {
	if(!(this instanceof ReplicatedList)) {
		return new ReplicatedList();
	}

	EventEmitter.call(this);

	// Bind so people can shortcut events handlers
	this.cmd = this.cmd.bind(this);

	this._state = array || [];

	Object.defineProperty(this, 'length', {
		get: function() {
			return this._state.length;
		}
	});
}

ReplicatedList.prototype = Object.create(EventEmitter.prototype);

ReplicatedList.prototype.get = function(index) {
	return this._state[index];
};

ReplicatedList.prototype.push = function(value) {
	this._state.push(value);

	this.emit('push', value);
};

ReplicatedList.prototype.pop = function() {
	var value = this._state.pop();

	this.emit('pop', value);

	return value;
};

ReplicatedList.prototype.unshift = function(value) {
	this._state.unshift(value);

	this.emit('unshift', value);
};

ReplicatedList.prototype.shift = function() {
	var value = this._state.shift();

	this.emit('shift', value);

	return value;
};

ReplicatedList.prototype.splice = function(start, count) {
	var args = slice.call(arguments);

	var removed = this._state.splice.apply(this._state, args);

	this.emit.apply(this, ['splice'].concat(args));

	return removed;
};

ReplicatedList.prototype.clear = function() {
	this._state = [];

	this.emit('clear');
};

ReplicatedList.prototype.forEach = function(fn) {
	this._state.forEach(fn);
};

ReplicatedList.prototype.map = function(fn) {
	return this._state.map(fn);
};

// This should be called by a function bringing in new
// data from a remote location
ReplicatedList.prototype.cmd = function(cmd, args) {
	switch(cmd) {
	case 'push':
	case 'pop':
	case 'unshift':
	case 'shift':
	case 'splice':
	case 'clear':
		this[cmd].apply(this, args);
	}
};

ReplicatedList.prototype.replicate = function(fn) {
	var self = this;

	self._state.forEach(function(value) {
		fn('push', [value]);
	});

	function push(value) {
		fn('push', [value]);
	}

	function pop() {
		fn('pop', []);
	}

	function unshift(value) {
		fn('unshift', [value]);
	}

	function shift() {
		fn('shift', []);
	}

	function splice() {
		fn('splice', slice.call(arguments));
	}

	function clear() {
		fn('clear', []);
	}

	self.on('push', push);
	self.on('pop', pop);
	self.on('unshift', unshift);
	self.on('shift', shift);
	self.on('splice', splice);
	self.on('clear', clear);

	// Call this to stop replicating
	return function() {
		self.removeListener('push', push);
		self.removeListener('pop', pop);
		self.removeListener('unshift', unshift);
		self.removeListener('shift', shift);
		self.removeListener('splice', splice);
		self.removeListener('clear', clear);
	};
};


module.exports = ReplicatedList;
