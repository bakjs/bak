/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Sebastian Ullrich
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// Based on table-master

const _ = require('lodash');
const chalk = require('chalk');
const stripAnsi = require('strip-ansi');

/**
 * Default (white)space constant.
 *
 * @type {string}
 */
const SPACE = "\u0020";

/**
 * The default settings.
 *
 * @type {{indent: number, rowSpace: number}}
 */
const defaultSettings = {
    indent: 3,
    rowSpace: 1
};

/**
 * Function to overload the default settings.
 *
 * @param newDefaults The new default settings.
 */
const setDefaults = function (newDefaults) {
    Object.assign(defaultSettings, newDefaults);
};

/**
 * Creates an empty string with the specified length.
 *
 * @param {number} length The length of the string.
 * @returns {string} The string with the specified length.
 */
function emptyString(length) {
    return new Array(++length).join(SPACE);
}

/**
 * Removes all colour commands from a given string.
 *
 * @param str The string to be cleaned.
 * @returns {string} The cleaned string.
 */
function cleanString(str) {
    return stripAnsi(str.toString());
}

/**
 * Returns all keys for a given object.
 *
 * @param objArray Object to get the keys of.
 * @returns {*} Array, containing all keys as string values.
 */
function getAllKeys(objArray) {
    let keys = [];
    _.forEach(objArray, function (row) {
        if (!row || typeof row === 'string') return;
        keys = keys.concat(Object.keys(row))
    });
    return _.union(keys);
}

/**
 * Determines the longest value for each key.
 *
 * @param keys The keys of the objects within the array.
 * @param objArray The object array.
 * @returns {Object} JSON object containing the max length for each key.
 */
function getMaxLength(keys, objArray) {
    const maxRowLength = {};
    _.forEach(keys, function (key) {
        maxRowLength[key] = cleanString(key).length;
    });

    _.forEach(objArray, function (objRow) {
        _.forEach(objRow, function (val, key) {
            const rowLength = cleanString(val).length;
            if (maxRowLength[key] < rowLength) {
                maxRowLength[key] = rowLength;
            }
        });
    });

    return maxRowLength;
}

/**
 * Trims/extends a given string to the specified length.
 * If string is too long it will be trimmed with elepsies.
 *
 * @param str The string to be trimmed/extended
 * @param length The desired length of the string
 * @param format The align of the string, whether (l)eft, (r)ight or (c)enter aligned.
 * @returns {string} The trimmed/extended and aligned string.
 */
function toLength(str, length, format) {
    if (!str) {
        return emptyString(length);
    }
    let newStr = str.toString();
    let diff = cleanString(str).length - length;
    if (diff < 0) {
        diff *= -1;
    }
    if (!format || format === "l") {
        newStr = newStr + emptyString(diff);
    }
    else if (format === "r") {
        newStr = emptyString(diff) + newStr;
    }
    else { // (format === "c")
        const s = diff / 2;
        newStr = emptyString(Math.ceil(s)) + newStr + emptyString(Math.floor(s));
    }
    return newStr;
}

/**
 * Prints a given array of json objects.
 * @param printArray The array of json objects to be printed.
 * @param format
 * @param preProcessor
 * @param settings
 */
const printTable = function (printArray, format, preProcessor, settings) {
    format = format || "";
    preProcessor = preProcessor || [];
    settings = settings || defaultSettings;

    const INDENT = emptyString(settings.indent);
    const ROW_SPACER = emptyString(settings.rowSpace);

    const headings = getAllKeys(printArray);
    const maxLength = getMaxLength(headings, printArray);
    const maxLengths = Object.keys(maxLength).reduce((s, k) => s + maxLength[k], 0);

    // print headline
    const headline = [];
    const seperator = [];

    _.forEach(headings, function (header, i) {
        headline.push(toLength(header, maxLength[header], 'c'));
        seperator.push(new Array(maxLength[header] + 1).join('-'));
    });

    console.log(INDENT + seperator.join(ROW_SPACER));
    console.log(INDENT + headline.join(ROW_SPACER));
    console.log(INDENT + seperator.join(ROW_SPACER));

    // print rows
    _.forEach(printArray, function (row) {
        const line = [];

        if (row === null || typeof row === 'string') {
            if (row === null || row === '') {
                return console.log('');
            }
            return console.log(chalk.grey.bold(toLength(row || '', maxLengths, 'l')));
        }

        _.forEach(headings, function (header, i) {
            let str = row[header] || "";

            if (_.isFunction(preProcessor[i])) {
                str = preProcessor[i](str) || str;
            }

            line.push(toLength(str, maxLength[header], format.substr(i, 1)));
        });
        console.log(INDENT + line.join(ROW_SPACER));
    });
};

/**
 * Exports the printTable function via module export.
 * @type {Function} The printTable function.
 */
exports.printTable = printTable;

/**
 * Exports the setDefaults function via module export.
 * @type {Function} The setDefaults function.
 */
exports.setDefaults = setDefaults;