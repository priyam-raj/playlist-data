function formatDuration(duration) {
	let seconds = duration;

	let hours = Math.floor(seconds / 3600);
	seconds -= hours * 3600;
	let minutes = Math.floor(seconds / 60);
	seconds -= minutes * 60;
	seconds = Math.floor(seconds);

	return {  hours, minutes, seconds };
}

module.exports = { formatDuration }
