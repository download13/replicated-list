# replicated-list

ReplicatedList is an Array/List-like structure, but with helper methods that make it easy to replicate it's state from one list to the next. Even across the network!


## Basic List Example

```javascript
var ReplicatedList = require('replicated-list');

// Initial state can be passed during construction
var list = new ReplicatedList(['some', 'initial', 'items']);

list.push('fourthvalue');

console.log(list.get(1)); // initial

console.log(list.pop()); // fourthvalue

console.log(list.shift()); // some
```

Pretty standard stuff for a list type. Here's what makes this one interesting though.


## Replication Example

### Leader

```javascript
var list = new ReplicatedList();

list.push(0);

// Start replicating
list.replicate(function(type, index, item) {
	// This function will be called every time
	// there's a new command to replicate

	// Just pretend we set this network connection up earlier
	network.write(JSON.stringify([type, index, item]));
});

// All mutating commands will be replicated to the follower
// keeping it in a consistent state with this one
list.unshift('another_new_element');
```

### Follower

```javascript
var list = new ReplicatedList();

// Again, just pretend
network.on('data', function(message) {
	message = JSON.parse(message);

	list.cmd(message[0], message[1], message[2]);
});

// list will now follow the leader at the other end of the
// network stream and stay in sync with it

// Give it some time to replicate
setTimeout(function() {
	console.log(list.length); // 2

	console.log(list.get(0)); // another_new_element

	console.log(list.get(1)); // 0
}, 100);
```


## Events

You may also listen to changes in the list for arbitrary purposes.

```javascript
list.replicate(function(type, index, item) {
	// type will be 'add' or 'remove'
	switch(type) {
	case 'add':
		addElementToView(item, index);
		break;
	case 'remove':
		removeElementFromView(index);
	}
});
```

## Methods

* `.push(value)` - Pushes a value onto the end of the list
* `.pop()` - Removes and returns the last value in the list
* `.unshift(value)` - Adds a value to the beginning of the list
* `.shift()` - Removes and returns the first element in the list
* `.splice(startIndex, count, elements...)` - Removes `count` elements starting at `startIndex` while adding additional elements
* `.clear()` - Clears all elements from the list
* `.forEach(fn)` - fn(value, index) is executed once for each item in the list
* `.map(fn)` - fn(value, index) is executed once for each item in the list returning an array of the results of fn
* `.cmd(command, arguments)` - Executes the given command on this map
* `.replicate(fn)` - Calls fn(cmd, args) once for each command needed to replicate the state of this map to another map


## Notes

The method used to stream data must carry the messages IN ORDER. If the messages are out of order the accuracy of the replication cannot be guaranteed. Imagine doing `push 3` and `push 7`. If they are out of the order the older the array contents will be out of order as well.

Do not call the mutating methods on a following list, this will result in the follower getting out of sync with the leader.
