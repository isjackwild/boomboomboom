#Maybe change this to use the backbone events module — it's already included in two.js
Signal = signals.Signal

$(window).on 'blur', =>
	console.log 'disable events'
	for key of window.events
		window.events[key].active = false

$(window).on 'focus', =>
	console.log 'enable events'
	for key of window.events
		window.events[key].active = true

window.events = {
	micAccepted: new Signal()
	automatic: new Signal()
	peak: new Signal()
	bass: new Signal()
	break: new Signal()
	BPM: new Signal()
	BPMDrop: new Signal()
	BPMJump: new Signal()
	changeFreqVar: new Signal()
	volume: new Signal()
	frequency: new Signal()
	inverseCols: new Signal()
	makeSpecial: new Signal()
	showText: new Signal()
	showIllustration: new Signal()
	filter: new Signal()
	transform: new Signal()
	angela: new Signal()
}