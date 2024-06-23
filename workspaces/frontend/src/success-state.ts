import {
	type Invalidator,
	type Subscriber,
	type Unsubscriber,
	writable,
} from 'svelte/store';

type SuccessState =
	| {
			type: 'success';
	  }
	| {
			type: 'error';
			error: string;
	  }
	| undefined;

export function createSuccessState(): {
	subscribe: (
		this: void,
		run: Subscriber<SuccessState>,
		invalidate?: Invalidator<SuccessState> | undefined,
	) => Unsubscriber;
	setSuccess(): void;
	setError(error: string): void;
} {
	const {subscribe, set} = writable<SuccessState>(undefined);

	let timeout: ReturnType<typeof setTimeout> | undefined;

	function schedule(callback: () => void, delay: number): void {
		if (timeout) {
			clearTimeout(timeout);
		}

		timeout = setTimeout(() => {
			timeout = undefined;
			callback();
		}, delay);
	}

	function setValue(value: SuccessState, delay: number): void {
		// Clear immediately
		if (value === undefined) {
			if (timeout) {
				timeout = undefined;
				clearTimeout(timeout);
			}

			set(undefined);

			// If the state is already set, temporarily set it to undefined for 200ms
			// before updating it to the new value. This way it is clear that the
			// state was updated, even if the state remains the same.
		} else if (timeout) {
			set(undefined);

			schedule(() => {
				setValue(value, delay);
			}, 200);

			// Otherwise just set it instantly and clear it after `delay`
		} else {
			set(value);

			schedule(() => {
				set(undefined);
			}, delay);
		}
	}

	return {
		subscribe,
		setSuccess(): void {
			setValue({type: 'success'}, 5000);
		},
		setError(error: string): void {
			setValue(
				{
					type: 'error',
					error,
				},
				10_000,
			);
		},
	};
}
