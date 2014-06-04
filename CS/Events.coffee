Signal = signals.Signal

window.events = {
	hiPeak: new Signal()
	loPeak: new Signal()
	hardPeak: new Signal()
	softPeak: new Signal()
	bass: new Signal()
	shortBreak: new Signal()
	longBreak: new Signal()
	BPM: new Signal()
	BPMDrop: new Signal()
	BPMJump: new Signal()
	changeFreqVar: new Signal()
	volume: new Signal()
}



test = =>
	console.log 'lkjhasdlfkjslkj'
events.softPeak.add(test);