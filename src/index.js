export default class ReplicatedList {
	constructor(list) {
		this.mutate = this.mutate.bind(this);

		this._handlers = new Set();

		this._state = [];

		if(Array.isArray(list)) {
			this._state = this._state.concat(list);
		}
	}

	push(item) {
		this._state.push(item);

		this._emit('add', this._state.length - 1, item);
	}

	pop() {
		let removedItem = this._state.pop();

		this._emit('remove', this._state.length, removedItem);

		return removedItem;
	}

	unshift(item) {
		this._state.unshift(item);

		this._emit('add', 0, item);
	}

	shift() {
		let removedItem = this._state.shift();

		this._emit('remove', 0, removedItem);

		return removedItem;
	}

	splice(startIndex, removeCount, ...addItems) {
		let removedItems = this._state.splice(startIndex, removeCount, ...addItems);

		removedItems.forEach((item, i) => {
			this._emit('remove', startIndex + i, item);
		});

		addItems.forEach((item, i) => {
			this._emit('add', startIndex + i, item);
		});

		return removedItems;
	}

	clear() {
		while(this._state.length > 0) {
			this.pop();
		}
	}


	get(index = 0) {
		return this._state[index];
	}

	get length() {
		return this._state.length;
	}

	forEach(fn) {
		this._state.forEach(fn);
	}

	map(fn) {
		return this._state.map(fn);
	}


	mutate(type, index, item) {
		switch(type) {
		case 'add':
			this.splice(index, 0, item);
			break;
		case 'remove':
			this.splice(index, 1);
		}
	}

	replicate(fn) {
		if(typeof fn !== 'function') {
			throw new Error('Argument must be a function, ' + fn + ' is a ' + typeof fn);
		}

		this._handlers.add(fn);

		this._state.forEach((item, i) => {
			fn('add', i, item);
		});

		return () => {
			this._handlers.delete(fn);
		};
	}

	_emit(type, index, item) {
		this._handlers.forEach(fn => {
			fn(type, index, item);
		});
	}
}
