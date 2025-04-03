export function throttle(mainFunction, delay) {
	let timerFlag = null;

	return (...args) => {
		if (timerFlag === null) {
			mainFunction(...args);
			timerFlag = setTimeout(() => {
				timerFlag = null;
			}, delay);
		}
	};
}
