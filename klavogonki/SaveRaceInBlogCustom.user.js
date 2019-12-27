// ==UserScript==
// @name          save_race_in_blog_custom
// @namespace     klavogonki
// @version       1.1.5
// @description   добавляет кнопку для сохранения результата любого заезда в бортжурнале
// @include       http://klavogonki.ru/g/*
// @author        Lexin13, agile, 490344
// ==/UserScript==

function saveRaceInBlog () {
	var link = document.querySelector('.dropmenu a');
	if (!link) {
		throw new Error('.dropmenu a element not found.');
	}

	var userId = parseInt(link.href.match(/\/u\/#\/(\d+)/)[1]);

	function checkJSON (response) {
		try {
			var json = JSON.parse(response);
			if (!('players' in json)) {
				return false;
			}

			for (var i = 0; i < json.players.length; i++) {
				if ('record' in json.players[i] && json.players[i].record.user === userId) {
					return json.players[i].record.id;
				}
			}

			return false;
		} catch (e) {
			return false;
		}
	}

	function saveResult (res) {
		if (document.getElementById('spectrumCanvas') !== null) {
			if (document.getElementById('spectrumCanvas').firstElementChild !== null) {
				new Promise(function(resolve, reject) {
					document.getElementById('spectrumCanvas').firstElementChild.toBlob(function(blob) {
						resolve(blob);
					});
				}).then(result => {
					var reader = new FileReader();
					reader.readAsDataURL(result);
					reader.onloadend = function() {
						var gameTypes = {
							normal: 'Oбычный',
							abra: 'Абракадабра',
							referats: 'Яндекс.Рефераты',
							noerror: 'Безошибочный',
							marathon: 'Марафон',
							chars: 'Буквы',
							digits: 'Цифры',
							sprint: 'Спринт',
						};

						var text = '';//'Результат #' + res.id + ' в режиме ';
						var comp = document.getElementById("complexity-panel")
						comp = comp.innerText.slice(18, 23).trim();
						if (res.gameType === 'voc') {
							text += '*[' + res.vocName + '](/vocs/' + res.vocId + '/ "Перейти на страницу словаря")* | **' + comp + '** | **';
						} else {
							text += '*' + gameTypes[res.gameType] + '* | **' + comp + '** | **';
						}
						text += res.stats.speed + '&nbsp;зн/мин** | *' +
							res.stats.errors.replace(')', '&#41;* | *') +
							res.stats.time + '*\n\n' +
							'*![сложнограмма](' + reader.result + ')*\n\n';

						var typedMarked = res.typedHtml
						.replace(/<span class="error">|<\/span>/g, '**')
						.replace(/<s class="error">/g, '~~**')
						.replace(/<\/s>/g, '**~~');

						text += '> ' + typedMarked;

						//if (confirm('Добавить запись в бортжурнал?')) {
						var xhr = new XMLHttpRequest();
						xhr.open('POST', '/api/profile/add-journal-post');
						xhr.onload = function () {
							if (this.status !== 200) {
								throw new Error('Something went wrong.');
							}

							alert('Запись успешно добавлена.');
						};
						xhr.send(JSON.stringify({
							userId: userId,
							text: text,
							hidden: false,
						}));
					}
				});
				return;
			}
		}
		var gameTypes = {
			normal: 'Oбычный',
			abra: 'Абракадабра',
			referats: 'Яндекс.Рефераты',
			noerror: 'Безошибочный',
			marathon: 'Марафон',
			chars: 'Буквы',
			digits: 'Цифры',
			sprint: 'Спринт',
		};

		var text = '';//'Результат #' + res.id + ' в режиме ';
		if (res.gameType === 'voc') {
			text += '*[' + res.vocName + '](/vocs/' + res.vocId + '/ "Перейти на страницу словаря")* | **';
		} else {
			text += '*' + gameTypes[res.gameType] + '* | **';
		}
		text += res.stats.speed + '&nbsp;зн/мин** | *' +
			res.stats.errors.replace(')', '&#41;* | *') +
			res.stats.time + '*\n\n'

		var typedMarked = res.typedHtml
		.replace(/<span class="error">|<\/span>/g, '**')
		.replace(/<s class="error">/g, '~~**')
		.replace(/<\/s>/g, '**~~');

		text += '> ' + typedMarked;

		//if (confirm('Добавить запись в бортжурнал?')) {
		var xhr = new XMLHttpRequest();
		xhr.open('POST', '/api/profile/add-journal-post');
		xhr.onload = function () {
			if (this.status !== 200) {
				throw new Error('Something went wrong.');
			}

			alert('Запись успешно добавлена.');
		};
		xhr.send(JSON.stringify({
			userId: userId,
			text: text,
			hidden: false,
		}));
	}
//}

function init (resultId) {
	var container = document.createElement('div');
	container.style.fontSize = '10pt';
	var link = document.createElement('a');
	link.style.color = '#ff3855';
	link.textContent = 'Сохранить в бортжурнале';

	var typed = document.querySelector('#errors_text p');
	if (!typed) {
		throw new Error('#errors_text p element not found.');
	}

	var statsContainer = document.querySelector('.player.you .stats');
	if (!statsContainer) {
		throw new Error('.player.you .stats element not found.');
	}

	var matches = statsContainer.textContent.match(/(\d{2}:\d{2}\.\d)(\d+) зн\/мин(\d+ ошиб\S+ \([\d,%]+\))/);
	if (!matches) {
		throw new Error('result stats were not parsed.');
	}

	var span = document.querySelector('#gamedesc span');
	if (!span) {
		throw new Error('#gamedesc span element not found.');
	}

	var gameType = span.className.split('-').pop();
	var vocName = gameType === 'voc' ? span.textContent.replace(/[«»]/g, '') : '';
	var vocId = gameType === 'voc' ? parseInt(span.querySelector('a').href.match(/vocs\/(\d+)/)[1]) : '';

	var stats = {
		time: matches[1],
		speed: matches[2],
		errors: matches[3],
	};

	var resultData = {
		id: resultId,
		stats: stats,
		typedHtml: typed.innerHTML,
		gameType: gameType,
		vocName: vocName,
		vocId: vocId,
	};

	link.addEventListener('click', saveResult.bind(null, resultData));
	container.appendChild(link);

	var again = document.getElementById('again');
	if (!again) {
		throw new Error('#again element not found.');
	}

	var cell = again.querySelector('td');
	if (cell) {
		container.style.float = 'left';
		again.insertBefore(container, again.firstChild);
	} else {
		again.parentNode.appendChild(container);
	}
}

// Saving the original prototype method:
var proxied = window.XMLHttpRequest.prototype.send;

window.XMLHttpRequest.prototype.send = function () {
	this.addEventListener('load', function () {
		var resultId = checkJSON(this.responseText);
		if (resultId) {
			init(resultId);
		}
	}.bind(this));
	return proxied.apply(this, [].slice.call(arguments));
};
}

var script = document.createElement('script');
script.textContent = '(' + saveRaceInBlog.toString() + ')();';
document.body.appendChild(script);
