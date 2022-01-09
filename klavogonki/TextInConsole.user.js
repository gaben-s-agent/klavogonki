// ==UserScript==
// @name         TextInConsole
// @version      0.04
// @namespace    klavogonki
// @description  Вывод текста заезда в консоль и по нажатии на инопланетянина
// @author       490344
// @include      http://klavogonki.ru/g/*
// @grant        none
// ==/UserScript==


(function() {
	new Promise(function(resolve, reject) {
		var proxied = window.XMLHttpRequest.prototype.send;
		window.XMLHttpRequest.prototype.send = function () {
			this.addEventListener('load', function () {
				try {
					var json = JSON.parse(this.responseText);
					if ('text' in json) {
						resolve(json.text);
					}
				} catch (e) {}
			}.bind(this));
			return proxied.apply(this, [].slice.call(arguments));
		}
	}).then(result => {
		//result is text
		console.log(result);
		var alien = document.getElementById('hidden_alien');
		//var alien = document.getElementById('status').getElementsByClassName('gametype-sign')[0];
		var ht = document.getElementById('hiddentext');
		function a() {
			ht.innerText = result.text;
            ht.style.setProperty('text-align', 'left');
            ht.style.setProperty('background-color', '#ebebeb');
            ht.style.setProperty('padding', '0px');
            ht.style.setProperty('font-weight', 'normal');
            ht.style.setProperty('text-shadow', 'none');
            ht.style.setProperty('color', '#222');
			ht.style.setProperty('opacity', '.5');
			alien.removeEventListener('click', a);
			alien.addEventListener('click', b);
		}
		function b() {
			ht.innerText = 'Текст скрыт до начала игры';
            ht.style.setProperty('text-align', 'center');
            ht.style.setProperty('background-color', '#aaa');
            ht.style.setProperty('padding', '15px');
            ht.style.setProperty('font-weight', 'bold');
            ht.style.setProperty('text-shadow', '1px 1px 0 #888');
            ht.style.setProperty('color', 'white');
			ht.style.setProperty('opacity', '1');
			alien.removeEventListener('click', b);
			alien.addEventListener('click', a);
		}
		alien.addEventListener('click', a);
	});
})();
