// ==UserScript==
// @name         Confluence Page Properties table colorizer
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Script helps to colorize table based on cells values
// @author       You
// @match        https://wiki.tcsbank.ru/pages/viewpage.action?pageId=1609125452
// @icon         https://cdn.iconscout.com/icon/free/png-256/confluence-3629294-3031878.png
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const KEY_WORD = 'test6'

    const COLUMN_NAME = {
        colorize: 'name 2',
        highlight: 'name 1'
    }

    const GRADIENT = {
        left: '#ff6200', //red
        middle: '#ffe200', //yellow
        right: '#9dff00', //green
        alpha: 0.6
    }

    const STYLE_HIGHLIGHT = {
        backgroundClip: 'padding-box',
        backgroundColor: '#369',
        color: 'white',
        border: '5px solid #AA80FF',
        borderRadius: '5px'
    }

    const setCSS = function(element, style) {
        for (const property in style) {
            element.style[property] = style[property];
        }
    }

    const hexToRGB = function(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

        return result ? {
            red: parseInt(result[1], 16),
            green: parseInt(result[2], 16),
            blue: parseInt(result[3], 16)
        } : null;
    }

    const getMixedColor = function(weight) {

        const MID_POSITION = 50;

        let mixedColor1, mixedColor2;

        if (weight >= MID_POSITION) {
            weight = ((weight - MID_POSITION) / MID_POSITION) * 100;
            mixedColor1 = hexToRGB(GRADIENT.right);
            mixedColor2 = hexToRGB(GRADIENT.middle);
        } else {
            weight = (weight / MID_POSITION) * 100;
            mixedColor1 = hexToRGB(GRADIENT.middle);
            mixedColor2 = hexToRGB(GRADIENT.left);
        }

        const w1 = weight/100;
        const w2 = 1 - w1;
        const mixedColorResultRGB = [
            Math.round(mixedColor1.red * w1 + mixedColor2.red * w2),
            Math.round(mixedColor1.green * w1 + mixedColor2.green * w2),
            Math.round(mixedColor1.blue * w1 + mixedColor2.blue * w2)];

        return `rgba(${mixedColorResultRGB.join()}, ${GRADIENT.alpha})`;
    }

    const getCellIndex = (value) => {
        let result = null;

        Array.from(targetTable.tHead.rows[0].cells).forEach((cell) => {
            if (cell.textContent === value) {
                result = cell.cellIndex + 1;
            }
        });
        
        return result;
    }

    const targetTable = document.querySelector('#main-content>.table-wrap>table');

    const cellToColorizeValues = targetTable.querySelectorAll(`td:nth-child(${getCellIndex(COLUMN_NAME.colorize)})`);
    cellToColorizeValues.forEach(el => {
        const cellValue = parseInt(el.textContent, 10);
        el.style.backgroundColor = getMixedColor(cellValue);
        // el.parentElement.style.backgroundColor - закрасит всю строку.
    });

    const cellToHighlightValues = targetTable.querySelectorAll(`td:nth-child(${getCellIndex(COLUMN_NAME.highlight)})`);
    cellToHighlightValues.forEach(el => {
        if (!el.textContent.includes(KEY_WORD) && (el.textContent.replace(/\s+/g, '').length > 0)) {
            setCSS(el, STYLE_HIGHLIGHT);
        }
    });
})();