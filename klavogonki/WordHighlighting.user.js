// ==UserScript==
// @name         WordHighlighting
// @namespace    klavogonki
// @version      0.04
// @author       490344
// @include      http://klavogonki.ru/g/*
// @include      https://klavogonki.ru/g/*
// @grant        none
// ==/UserScript==

(function() {

//settings initialization

	if (localStorage.wordHighlighting === undefined) {
		localStorage.wordHighlighting = JSON.stringify({
			color: '#6fff7d',
			transparency: 128,
			highlightMode: 'слово + слово',
			transparencyBF: 0.4
		});
	} else {
		let data = JSON.parse(localStorage.wordHighlighting);
		if ((data.color.slice(0, 1) !== '#') && (data.color.length !== 7)) {
			data.color = '#6fff7d';
		}
		if ((data.transparency < 0) || (data.transparency > 255)) {
			data.transparency = 128;
		}
		if (!['слово + слово', 'слово + символ', 'символ + символ', 'нет'].includes(data.highlightMode)) {
			data.highlightMode = 'слово + слово';
		}
		if ((data.transparencyBF > 1) || (data.transparencyBF < 0)) {
			data.transparencyBF = 0.4;
		}
		localStorage.wordHighlighting = JSON.stringify(data);
	}

//#typefocus change observation

	var targetNode = document.getElementById('typetext');
	var config = { attributes: true, childList: true, subtree: true };
	const callback = function(mutationsList, observer) {
		for(let mutation of mutationsList) {
			if (mutation.type === 'childList') {
				observer.disconnect();
				if (document.getElementById('WH-span') !== null) {
					document.getElementById('WH-span').remove();
				}
				var el = document.createElement('span');
				el.setAttribute('id', 'WH-span');
				document.getElementById('typefocus').insert(el);
				highlightCss();
				observer.observe(targetNode, config);
			}
		}
	};
	var observer = new MutationObserver(callback);

//making error observation

	var ifError = function(mutationsList, observer) {
		for(let mutation of mutationsList) {
			if (mutation.target.className === 'highlight_error') {
				observerIfError.disconnect();
				highlightBtn.click();
				observerIfNotError.observe(targetNode, config);
			}
		}
	};
	var ifNotError = function(mutationsList, observer) {
		for(let mutation of mutationsList) {
			if (mutation.target.className === 'highlight') {
				observerIfNotError.disconnect();
				highlightBtn.click();
				observerIfError.observe(targetNode, config);
			}
		}
	};
	var observerIfError = new MutationObserver(ifError);
	var observerIfNotError = new MutationObserver(ifNotError);
	var highlightBtn = document.getElementById('param_highlight');
	highlightBtn.style.setProperty('display', 'none');

//color button and transparency range

	var injPlace = document.getElementById('param_highlight').parentNode;

	var settingsContainer = document.createElement('div');
	var color = document.createElement('input');
	var transparency = document.createElement('input');

	settingsContainer.setAttribute('id', 'WH-settingsContainer');

	color.setAttribute('id', 'WH-color');
	color.type = 'color';
	color.addEventListener('input', function() {
		highlightCss();
		let data = JSON.parse(localStorage.wordHighlighting);
		data.color = color.value;
		localStorage.wordHighlighting = JSON.stringify(data);
	});
	color.value = JSON.parse(localStorage.wordHighlighting).color;

	transparency.setAttribute('id', 'WH-transparency');
	transparency.type = 'range';
	transparency.min = 0;
	transparency.max = 255;
	transparency.step = 1;
	transparency.valueAsNumber = 0;
	transparency.addEventListener('input', function() {
		highlightCss();
		let data = JSON.parse(localStorage.wordHighlighting);
		data.transparency = transparency.valueAsNumber;
		localStorage.wordHighlighting = JSON.stringify(data);
	});
	transparency.value = JSON.parse(localStorage.wordHighlighting).transparency;

	settingsContainer.insert(color);
	settingsContainer.insert(transparency);
	injPlace.insertBefore(settingsContainer, injPlace.getElementsByTagName('br')[0]);

//error highlight button

	var eHighlightContainer = document.createElement('div');
	var eHighlightBtn = document.createElement('a');
	//var eHighlightBtnLabel = document.createElement('div');

	eHighlightBtn.setAttribute('id', 'WH-eHLBtn');
	eHighlightBtn.innerText = JSON.parse(localStorage.wordHighlighting).highlightMode;
	eHighlightBtn.addEventListener('click', function() {
		if (this.innerText === 'нет') {
			this.innerText = 'слово + слово';
			observer.observe(targetNode, config);
			changeHL('слово');
			observerIfError.disconnect();
		} else if (this.innerText === 'слово + слово') {
			this.innerText = 'слово + символ';
			changeHL('слово');
			observerIfError.disconnect();
			observerIfError.observe(targetNode, config);
		} else if (this.innerText === 'слово + символ') {
			this.innerText = 'символ + символ';
			changeHL('символ');
			observerIfError.disconnect();
		} else if (this.innerText === 'символ + символ') {
			this.innerText = 'нет';
			changeHL('выкл');
			observerIfError.disconnect();
			observer.disconnect();
			try {
				document.getElementById('WH-style').remove();
			} catch(e) {}
		}
		let data = JSON.parse(localStorage.wordHighlighting);
		data.highlightMode = this.innerText;
		localStorage.wordHighlighting = JSON.stringify(data);
	});

	eHighlightContainer.style.setProperty('display', 'inline');

	//eHighlightBtnLabel.setAttribute('id', 'WH-eHLLabel');
	//eHighlightBtnLabel.innerText = 'Подсветка ошибок — ';

	//eHighlightContainer.insert(eHighlightBtтакnLabel);
	eHighlightContainer.insert(eHighlightBtn);
	injPlace.insertBefore(eHighlightContainer, injPlace.getElementsByTagName('div')[0]);

//transparency #beforefocus

	var transparencyBFContainer = document.createElement('div');
	var transparencyBFRange = document.createElement('input');
	var transparencyBFLabel = document.createElement('div');

	transparencyBFRange.type = 'range';
	transparencyBFRange.value = JSON.parse(localStorage.wordHighlighting).transparencyBF * 100;
	transparencyBFRange.addEventListener('input', function () {
		document.getElementById('beforefocus').style.setProperty('opacity', this.value / 100)
		let data = JSON.parse(localStorage.wordHighlighting);
		data.transparencyBF = this.value / 100;
		localStorage.wordHighlighting = JSON.stringify(data);
	});

	transparencyBFContainer.insert(transparencyBFLabel);
	transparencyBFContainer.insert(transparencyBFRange);
    injPlace.insert(transparencyBFContainer);

//
	injPlace.getElementsByTagName('br')[0].remove();
	waitingForStart();
	settingsCss();
	if (eHighlightBtn.innerText === 'слово + символ') {
		observerIfError.observe(targetNode, config);
	}

//FUNCTIONS

	async function waitingForStart() {
		if (!document.getElementById('typefocus')) {
			await sleep(100);
			waitingForStart();
		} else {
			observer.observe(targetNode, config);
		}
	}

	function changeHL(mode) {
		while (highlightBtn.innerText !== mode) {
			highlightBtn.click();
		}
	}

	function highlightCss() {
		if (document.getElementById('WH-style') !== null) {
			document.getElementById('WH-style').remove();
		}
		var css =
			' #typeblock { ' +
			' z-index: 10; } ' +

			' .highlight { ' +
			' position: relative; ' +
			' text-decoration: none !important; ' +
			' color: #222222 !important; }' +

			' #WH-span::before { ' +
			' content: ""; ' +
			' position: absolute; ' +
			' border-radius: 10px; ' +
			' background: ' + color.value + decimalToHex(transparency.valueAsNumber) + '; ' +
			' top: -2px; ' +
			' left: -4px; ' +
			' width: ' + (document.getElementById('typefocus').getWidth() + 6) + 'px; ' +
			' height: ' + (document.getElementById('typefocus').getHeight() + 5) + 'px; ' +
			' z-index: -1; } ' +

			' .highlight_error { ' +
			' position: relative; ' +
			' text-decoration: none !important; ';


		var style = document.createElement('style');
		style.setAttribute('id', 'WH-style');
		if (style.styleSheet) {
			style.stylesheet.cssText = css;
		} else {
			style.appendChild(document.createTextNode(css));
		}
		document.getElementsByTagName('head')[0].appendChild(style);
	}

	function settingsCss() {
		var css =
			' #WH-color { ' +
			' border: none; ' +
			' padding: 0 0; ' +
			' width: 15px; ' +
			' height: 15px; ' +
			' top: 3px !important; ' +
			' left: 10px; } ' +

			' #WH-transparency { ' +
			' padding: 0 0; ' +
			' left: 20px; ' +
			' top: 8px !important; } ' +

			' #param_highlight { ' +
			' position: absolute; ' +
			' margin: 0 5px; ' +
			' height: 20px; } ' +

			' #WH-eHLLabel { ' +
			' display: ; } ' +

			' #WH-settingsContainer { ' +
			' position: relative; ' +
			' top: -6px; ' +
			' left: -10px; } ' +

			' #typetext { ' +
			' word-break: keep-all; } ' +

			' #beforefocus { ' +
			' opacity: ' + transparencyBFRange.value / 100 + '; } ';

		var style = document.createElement('style');
		if (style.styleSheet) {
			style.stylesheet.cssText = css;
		} else {
			style.appendChild(document.createTextNode(css));
		}
		document.getElementsByTagName('head')[0].appendChild(style);
	}

	function decimalToHex(d) {
		var hex = d.toString(16);
		while (hex.length < 2) {
			hex = "0" + hex;
		}
		return hex;
	}

	function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
})();
