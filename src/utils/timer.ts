class Timer {
	static wait(ms: number) {
		return new Promise((resolve) => {
			setTimeout(resolve, ms);
		});
	}
}

export default Timer;
