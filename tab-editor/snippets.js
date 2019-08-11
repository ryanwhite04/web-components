ace.define("ace/snippets/tabscii", ["require", "exports", "module"], function (require, exports, module) {
	"use strict";
	exports.snippetText = `
snippet guitar
	|E5 |I3{1:0}|---
	|B4 |I3{1:0}|---
	|G4 |I3{1:0}|---
	|D4 |I3{1:0}|---
	|A3 |I3{1:0}|---
	|E3 |I3{1:0}|---
snippet bass
	|E5 |I3{1:0}|---
	|B4 |I3{1:0}|---
	|G4 |I3{1:0}|---
	|D4 |I3{1:0}|---
snippet ukulele
	|E5 |I3{1:0}|---
	|B4 |I3{1:0}|---
	|G4 |I3{1:0}|---
	|D4 |I3{1:0}|---
snippet violin
	|E5 |I3{1:0}|---
	|B4 |I3{1:0}|---
	|G4 |I3{1:0}|---
	|D4 |I3{1:0}|---
`.replace(/\{\d:[^\}]+\}/g, a => `$${a}`);
	exports.scope = "tabscii";
});
(function () {
	ace.require(["ace/snippets/tabscii"], function (m) {
		if (typeof module == "object" && typeof exports == "object" && module) {
			module.exports = m;
		}
	});
})();