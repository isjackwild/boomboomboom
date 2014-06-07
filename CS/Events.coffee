#Maybe change this to use the backbone events module — it's already included in two.js

Signal = signals.Signal
window.events = {
	lowPeak: new Signal()
	highPeak: new Signal()
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



# test = =>
# 	console.log 'event system works'

# window.events.softPeak.add(test);