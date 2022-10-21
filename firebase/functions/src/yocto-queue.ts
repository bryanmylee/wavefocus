// CREDIT https://github.com/sindresorhus/yocto-queue/blob/main/index.js
class Node<TValue> {
	value: TValue;
	next?: Node<TValue>;

	constructor(value: TValue) {
		this.value = value;
	}
}

export default class Queue<TValue> {
	#head?: Node<TValue>;
	#tail?: Node<TValue>;
	#size!: number;

	constructor() {
		this.clear();
	}

	enqueue(value: TValue) {
		const node = new Node(value);

		if (this.#head) {
			this.#tail!.next = node;
			this.#tail = node;
		} else {
			this.#head = node;
			this.#tail = node;
		}

		this.#size++;
	}

	dequeue() {
		const current = this.#head;
		if (!current) {
			return;
		}

		this.#head = current.next;
		this.#size--;
		return current.value;
	}

	clear() {
		this.#head = undefined;
		this.#tail = undefined;
		this.#size = 0;
	}

	get size() {
		return this.#size;
	}

	*[Symbol.iterator]() {
		let current = this.#head;

		while (current) {
			yield current.value;
			current = current.next;
		}
	}
}
