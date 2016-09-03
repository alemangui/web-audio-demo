(function() {

	var sineWave; 
	var triangleWave; 
	var delay;
	var flanger;
	var leapMotionNotes = [293.665, 349.228, 391.995, 440.00, 466.164, 523.251];
	var output = document.getElementById('output');
	var bars = document.getElementsByClassName('bar');

	setupSoundsAndEffects();
	setupLeapMotion();


	/**
	 * Initializes the Pizzicato Sound objects, the effects
	 * that apply to them and the necessary key bindings.
	 */
	function setupSoundsAndEffects() {
		setupLeapSounds();
		setupBeat();
		setupKeyboardSounds();
	};


	/**
	 * Initializes sounds used by the Leap Motion.
	 */
	function setupLeapSounds() {
		sineWave = new Pizzicato.Sound({ wave: { frequency: 200 } });
		triangleWave = new Pizzicato.Sound({ wave: { type: 'triangle', frequency: 200 } });
		delay = new Pizzicato.Effects.Delay();
		flanger = new Pizzicato.Effects.Flanger();
		sineWave.addEffect(delay);
		triangleWave.addEffect(flanger);
		triangleWave.volume = 0.18;
		sineWave.volume = 0.26;
	};


	/**
	 * Initializes the beat from an external file and 
	 * the bindings that toggle it.
	 */
	function setupBeat() {
		var beat = new Pizzicato.Sound('./beat-natural.wav', function() {
			beat.loop = true;
			
			window.addEventListener('keydown', function(e) {
				if (e.keyCode !== 81) 
					return;

				beat.playing ? beat.stop() : beat.play();
				document.getElementById('beat').classList.toggle('on');
			});

		});
	};

	/**
	 * Initializes the sounds bound to the keyboard and
	 * the bindings that play them.
	 */
	function setupKeyboardSounds() {
		var keyboardMapping = {
			'65': new Pizzicato.Sound({ wave: { frequency: 87.3071 }, sustain: 0.3 }),
			'83': new Pizzicato.Sound({ wave: { frequency: 97.9989 }, sustain: 0.3 }),
			'68': new Pizzicato.Sound({ wave: { frequency: 110.000 }, sustain: 0.3 }),
			'70': new Pizzicato.Sound({ wave: { frequency: 116.541 }, sustain: 0.3 }),
			'71': new Pizzicato.Sound({ wave: { frequency: 130.813 }, sustain: 0.3 }),
			'72': new Pizzicato.Sound({ wave: { frequency: 146.832 }, sustain: 0.3 }),
			'74': new Pizzicato.Sound({ wave: { frequency: 196.00 }, sustain: 0.3 }),
			'75': new Pizzicato.Sound({ wave: { frequency: 392.00 }, sustain: 0.3 }),
			'76': new Pizzicato.Sound({ wave: { frequency: 783.99 }, sustain: 0.3 })
		};

		window.addEventListener('keydown', function(e) {
			mappedSound = keyboardMapping[e.keyCode.toString()];
			keyIcon = document.getElementById('key-code-' + e.keyCode);

			if (mappedSound)
				mappedSound.play();

			if (keyIcon)
				keyIcon.classList.add('pressed');
		});

		window.addEventListener('keyup', function(e) {
			mappedSound = keyboardMapping[e.keyCode.toString()];
			keyIcon = document.getElementById('key-code-' + e.keyCode);

			if (mappedSound)
				mappedSound.stop();

			if (keyIcon)
				keyIcon.classList.remove('pressed');
		});
	};


	/**
	 * If the Leap Motion is connected the event loop will start.
	 */
	function setupLeapMotion() {
		Leap.loop(onLeapCapturedData);
	};


	/**
	 * This function is called for the Leap Motion loop
	 * event. leapData contains information on the hands detected
	 * by the Leap Motion device.
	 */
	function onLeapCapturedData(leapData) {
		if (!leapData.hands || leapData.hands.length === 0) {		
			clearLeapMotionOutput();
			return;
		}

		var verticalPosition = leapData.hands[0].palmPosition[1];
		var percentage = Math.min((verticalPosition / 400), 1);

		playNoteAtPosition(percentage);
		hightlightBarsUpTo(percentage);

		output.innerHTML = 'Position: ' + verticalPosition; // TEMP
	};


	/**
	 * Used when there are no hands detected by the Leap Motion.
	 */
	function clearLeapMotionOutput() {
		output.innerHTML = '';
		sineWave.pause();
		triangleWave.pause();
		hightlightBarsUpTo(0);
	};


	/**
	 * Plays the note corresponding to the given percetile 
	 * position (0 to 1).
	 */
	function playNoteAtPosition(position) {
		if (position <= 0) return;
		var note = leapMotionNotes[Math.floor(position * (leapMotionNotes.length - 1))];
		
		sineWave.frequency = triangleWave.frequency = note;
		sineWave.play();
		triangleWave.play();
	};


	/**
	 * Highlights the bars corresponding to the given
	 * percentile position (0 to 1).
	 */
	function hightlightBarsUpTo(position) {
		var barsToHighlight = Math.floor(position * bars.length - 1);

		for (var i = bars.length - 1; i >= 0; i--) {
			var shouldHighlight = !!(bars.length - i <= barsToHighlight);
			
			if (shouldHighlight)
				bars[i].classList.add('highlighted');
			else
				bars[i].classList.remove('highlighted');
		}
	};

})();