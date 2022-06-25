 function toSeconds(input) {
	try {
		const regex = /^P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
		let days = 0; 
		let hours = 0;
		let minutes = 0;
		let seconds = 0;
		let totalSeconds;

		if (regex.test(input)) {
			let matches = regex.exec(input);

			if (matches[1]) days = Number(matches[1]);
			if (matches[2]) hours = Number(matches[2]);
			if (matches[3]) minutes = Number(matches[3]);
			if (matches[4]) seconds = Number(matches[4]);

			totalSeconds = days * 86400 + hours * 3600 + minutes * 60 + seconds;
		} else {
			console.log(toSeconds);
		}
		
		// totalSecondsTwo /= 1.25;
		// totalSecondsThree /= 1.50;
		// totalSecondsFour /= 1.75;
		// totalSecondsFive /= 2.0;

		return totalSeconds;
	} catch (e) {
		
		console.error(e);
		if (e.message.includes("Invalid date")) {
			return "Invalid date";
		}
	}
 }
    module.exports = {toSeconds}