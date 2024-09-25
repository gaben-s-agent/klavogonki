// ==UserScript==
// @name         ZenMode
// @version      0.04
// @namespace    klavogonki
// @description  Максимальная концентрация, максимальный дзен
// @author       https://klavogonki.ru/u/#/490344/
// @include      http://klavogonki.ru/g/*
// @include      https://klavogonki.ru/g/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(() => {


    function initSettings() {
        if (localStorage[localStorageName] === undefined) {
            localStorage[localStorageName] = defaultSettings;
        } else {
            let data = JSON.parse(localStorage[localStorageName]);
            if (data.version !== JSON.parse(defaultSettings).version) {
                localStorage[localStorageName] = defaultSettings;
            } else {
                console.log(data.theme !== 'classic');
                if (!((data.theme === 'classic') || (data.theme === 'night')))
                    data.theme = 'classic';
                console.log(data.theme);
                if (typeof(data.enabled) !== 'boolean')
                    data.enabled = true;
                localStorage[localStorageName] = JSON.stringify(data);
            }
        }
    }


    function updateSettings(param, value) {
        let data = JSON.parse(localStorage[localStorageName]);
        data[param] = value;
        localStorage[localStorageName] = JSON.stringify(data);
    }


    function hideAllElements() {
        for (let e of document.body.childElements()) {
            e.style.display = 'none';
        }
    }

    function moveMainBlock() {
        document.body.insert(document.querySelector('#main-block'));
    }

    function beautifyMainBlock() {
        document.querySelector('#hiddentext').innerText = 'ctrl + enter';
        document.querySelector('#inputtext').value = '';
    }

    function applyStyle() {
        let style = '<style id="ZenModeMainStyle">'+
            '#game-minifier, #main-block{position:absolute !important;top:50%;left:50%;transform:translate(-50%,-50%);}'+
            'body {transition:.3s;opacity:'+globalOpacity+';background:'+bgColor+';}'+
            '.tl, .tr, .bl, .br {background:none !important;}'+
            '#typeblock {background:none !important;}'+
            '#keyboard_cont, #report, #errorwork, #errors_tab, #book, #again, #next-competition-2077,'+
                '.note, .handle, .bar, .hotkey{display:none;}'+
            '#game-minifier span {transition:.3s;color:'+fontColor+';margin:20px !important;font-size:14pt;font-family:calibri,sans-serif;}'+
            '#game-minifier {margin:auto !important;text-align:center;}'+
            '#main-block {margin:auto !important;}'+
            '#typeblock #bookinfo #again td {padding:10px 20px !important;}'+
            '#typeblock #bookinfo a {text-decoration:none;}'+
            '#typetext {color:'+fontColor+';}'+
            '#hiddentext {background-color:#00000000 !important;text-shadow:none !important;color:#888 !important;font-weight:normal !important;border:2px solid #555;}'+
            '#waiting_timeout {margin:auto !important;display:table;font-size:3em;}'+
            '#inputtext {color:'+fontColor+';outline:none;border:2px solid #555;box-shadow:none !important;background:none !important;margin:10px auto !important;display:table;width:400px;text-align:center;font-family:monospace !important;}'+
            '#inputtext.error {color:'+errorFontColor+' !important;background:'+errorBgColor+' !important;}'+
            '#ZenModeOnOff {transition:.3s;height:40px;border-radius:100px;outline:none;border:none;margin-top:10px;font-family:cursive;background:limegreen;}'+
            '</style>';
        if (document.querySelector('#ZenModeMainStyle'))
            document.querySelector('#ZenModeMainStyle').outerHTML = style;
        else
            document.head.insert(style);
    }


    function changeTheme(e) {
        let data = JSON.parse(localStorage[localStorageName]);

        if (arguments[0]===true){}else{
            if (data.theme === 'classic')
                data.theme = 'night';
            else
                data.theme = 'classic';
        }



        switch(data.theme) {
            case 'classic':
                bgColor = 'none';
                fontColor = '#222';
                errorBgColor = 'rgb(170,0,0)';
                errorFontColor = 'white';
                break;
            case 'night':
                bgColor = '#222';
                fontColor = '#ccc';
                errorBgColor = '#660000';
                errorFontColor = '#ccc';
                break;
        }
        localStorage[localStorageName] = JSON.stringify(data);
        applyStyle();
    }


    function doTimer() {
        let timer = document.querySelector('#waiting_timeout');
        let inputtext = document.querySelector('#inputtext');
        //document.querySelector('#typeplayblock').insert(timer);
        new MutationObserver(function(muts, observer) {
            for(let mut of muts) {
                inputtext.placeholder = document.querySelector('#waiting_timeout').innerText;
                if ((+timer.innerText.replace(' ', '') === 0) || (+timer.innerText.replace(':', '') === 0)) {
                    inputtext.style.textAlign = 'left';
                    inputtext.style.setProperty('font-family', document.querySelector('#fontsize_cont').style['font-family'], 'important');
                    inputtext.placeholder = '';
                    timer.style.display = 'none';
                }
            }
        }).observe(timer, {attributes: true, childList: true});
    }

    function beautifyTitle() {
        document.title = '.';
        document.querySelector('[rel=icon]').href = 'http://google.com/favicon.ico';
        let observer = new MutationObserver(function(muts, observer) {
            observer.disconnect();
            document.title = '.';
            console.log('a');
            observer.observe(document.querySelector('title'), {attributes: true, childList: true});
        }).observe(document.querySelector('title'), {attributes: true, childList: true});
    }


    function mainSwitch() {
        let data = JSON.parse(localStorage[localStorageName]);
        let btn = document.querySelector('#ZenModeOnOff');
        if (btn.tagName === "A") {
            if (btn.innerText === 'OFF') {
                data.enabled = true;
                btn.innerText = 'ON';
            } else {
                data.enabled = false;
                btn.innerText = 'OFF';
            }
        } else {
            console.log(btn.tagName);
            if (getComputedStyle(btn).backgroundColor === 'rgb(50, 205, 50)') {
                data.enabled = false;
                btn.style.background = 'darkred';
                btn.style.color = 'white';
            } else {
                console.log(btn.tagName);
                data.enabled = true;
                btn.style.background = 'limegreen';
                btn.style.color = 'black';
            }
        }
        localStorage[localStorageName] = JSON.stringify(data);
    }


    function addToggleStyle() {
        let style = '<style id="ZenModeThemeToggleStyle">#ZenModeMenuCont{display:grid;position:absolute;right:0;padding:0 0 100px 100px;margin:10px;z-index:10000;opacity:.05;transition:.3s;}#ZenModeMenuCont:hover{opacity:1;}#ZenModeThemeToggle{position:absolute;right:100vw}#ZenModeThemeToggle+label{--i:0;--j:calc(1 - var(--i));display:grid;grid-gap:.5em .25em;overflow:hidden;padding:.5em;height:45px;border-radius:1.75em;background:hsl(199,98%,calc(var(--j)*48%));color:transparent;user-select:none;transition:.3s;cursor:pointer}#ZenModeThemeToggle+label:before,#ZenModeThemeToggle+label:after{width:2.5em;height:2.5em;transition:inherit;content:""}#ZenModeThemeToggle+label:before{transform-origin:20% 20%;transform:translate(calc(var(--i)*(100% + 0.25em))) scale(calc(1 - var(--i)*.7));background:yellow;--poly:polygon(44.52479% 15.43091%,50% 0%,55.47521% 15.43091%,59.05867% 16.1926%,62.54288% 17.32469%,65.88967% 18.81477%,79.38926% 9.54915%,74.74874% 25.25126%,77.20011% 27.97379%,79.35347% 30.93763%,81.18523% 34.11033%,97.55283% 34.54915%,84.56909% 44.52479%,84.95203% 48.16824%,84.95203% 51.83176%,84.56909% 55.47521%,97.55283% 65.45085%,81.18523% 65.88967%,79.35347% 69.06237%,77.20011% 72.02621%,74.74874% 74.74874%,79.38926% 90.45085%,65.88967% 81.18523%,62.54288% 82.67531%,59.05867% 83.8074%,55.47521% 84.56909%,50% 100%,44.52479% 84.56909%,40.94133% 83.8074%,37.45712% 82.67531%,34.11033% 81.18523%,20.61074% 90.45085%,25.25126% 74.74874%,22.79989% 72.02621%,20.64653% 69.06237%,18.81477% 65.88967%,2.44717% 65.45085%,15.43091% 55.47521%,15.04797% 51.83176%,15.04797% 48.16824%,15.43091% 44.52479%,2.44717% 34.54915%,18.81477% 34.11033%,20.64653% 30.93763%,22.79989% 27.97379%,25.25126% 25.25126%,20.61074% 9.54915%,34.11033% 18.81477%,37.45712% 17.32469%,40.94133% 16.1926%);-webkit-clip-path:var(--poly);clip-path:var(--poly)}#ZenModeThemeToggle+label:after{grid-column:2;border-radius:50%;transform:translatey(calc(var(--i)*(-100% - 0.5em)));background:radial-gradient(circle at 19% 19%,rgba(0,0,0,0) 41%,#ffffff 43%)}#ZenModeThemeToggle:checked+label{--i:1}</style>';
        document.head.insert(style);
    }


    function addZenModeToggle() {
        let e = '<div id="ZenModeMenuCont"><input type="checkbox" id="ZenModeThemeToggle"/><label for="ZenModeThemeToggle">Night</label><input id="ZenModeOnOff" type="button" value="ZenMode"></div>';
        document.body.insert(e);
        if (JSON.parse(localStorage[localStorageName]).theme === 'night')
            document.querySelector('#ZenModeThemeToggle').checked = true;
        document.querySelector('#ZenModeThemeToggle').addEventListener('click', changeTheme);
        document.querySelector('#ZenModeOnOff').addEventListener('click', mainSwitch);
    }


    function addMenu() {
        addToggleStyle();
        addZenModeToggle();
    }


    function minify() {
        hideAllElements();
        moveMainBlock();
        beautifyMainBlock();
        changeTheme(true);
        doTimer();
        beautifyTitle();
        addMenu();
    }

    function waitForStats() {

        if (document.querySelector('.you'))
            if (document.querySelector('.you').querySelector('.rating'))
                new MutationObserver(function(muts, observer) {
                    for(let mut of muts) {
                        if (mut.addedNodes.length > 0) {

                            // hide voc info
                            document.querySelector('#bookinfo').childElements()[0].style.display = 'none';

                            let result = document.createElement('div');
                            result.id = 'game-minifier';

                            if (document.querySelector('#gamedesc').innerText.match(/соревнование/) !== null) {
                                result.append((()=>{
                                    let count = document.querySelector('#players-count-lbl').firstElementChild.innerText.replace(/([^0-9])+/g, '');
                                    let e=document.createElement('span');
                                    e.innerText='Место: '+mut.addedNodes[0].innerText.replace(/([^0-9])+/g, '')+' / '+count;
                                    return e;
                                })()); // place
                            }
                            result.append((()=>{let e=document.createElement('span');e.innerText=mut.target.querySelector('.stats').childElements()[0].innerText;return e;})()); // time
                            result.append((()=>{let e=document.createElement('span');e.innerText=mut.target.querySelector('.stats').childElements()[1].innerText;return e;})()); // speed
                            result.append((()=>{let e=document.createElement('span');e.innerText=mut.target.querySelector('.stats').childElements()[2].innerText;return e;})()); // error

                            let mb = document.querySelector('#main-block');
                            document.body.insertBefore(result, mb);
                            mb.style.display = 'none';

                        }
                    }
                }).observe(document.querySelector('.you').querySelector('.rating'), {attributes: true, childList: true});
            else
                setTimeout(waitForStats, 500);
        else
            setTimeout(waitForStats, 500);

    }

    function init() {
        if (document.querySelector('#typeblock')) {
            minify();
            waitForStats();
        } else {
            setTimeout(init, 100);
        }

    }


    function addOnOffParam() {
        let place = document.querySelector('#params').querySelector('h4');
        let e = '<span>ZenMode: </span><a id="ZenModeOnOff">OFF</a><br>';
        place.insertAdjacentHTML('afterend', e);
        document.querySelector('#ZenModeOnOff').addEventListener('click', mainSwitch);
    }


    function huinit() {
        if (document.querySelector('#params').querySelector('.rc').childNodes[2]) {
            addOnOffParam();
        } else
            setTimeout(huinit, 500);
    }


    const localStorageName = 'ZenMode';
    const defaultSettings = JSON.stringify({
        theme: 'classic',
        enabled: true,
        version: 0.3
    });

    let globalOpacity = '100%';
    let bgColor, fontColor, errorBgColor, errorFontColor;


    initSettings();
    if (JSON.parse(localStorage[localStorageName]).enabled)
        init();
    else
        huinit();

})();
