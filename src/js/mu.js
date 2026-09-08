(function() {

    let muQuery = function(query) {

        let _els = [];

        if ( query instanceof Object ) { _els = [query] }
        else {

            let _matches = query.match(/^<(\w+)>$/);
            _els = (_matches)
                ? [document.createElement(_matches[1])]
                : Array.from(document.querySelectorAll(query));
        }
        return new muNodeCollection(_els);

    }

    let muNodeCollection = function(els) {

        this.els = els;

            this.attr = function (name, value) {
                if (typeof value !== 'undefined') {
                    this.els.forEach( (el) => { el.setAttribute(name, value) });
                    return this;
                } else {
                    return (els.length) ? this.els[0].getAttribute(name) : '';
                }
            };

            this.html = function (str) {
                if (typeof str !== 'undefined') {
                    this.els.forEach( (el) => { el.innerHTML = str });
                    return this;
                } else {
                    return this.els[0].innerHTML;
                }
            };

            this.text = function(str) {
                if (typeof str !== 'undefined') {
                    this.els.forEach( (el) => { el.innerText = str });
                    return this;
                } else {
                    let _txt = "";
                    this.els.forEach( (el) => { _txt += el.innerText });
                    return _txt;
                }
            };

            this.val = function(val) {

                if (typeof val !== 'undefined') {
                    this.els.forEach( (el) => { el.value = val });
                    return this;
                } else {
                    return (els.length) ? this.els[0].value : '';
                }
            };

            this.append = function (arg) {
                if (arg instanceof muNodeCollection) { arg.els.forEach( (el) => { this.els[0].appendChild(el.cloneNode(true)) }); }
                else if (arg instanceof HTMLElement) { this.els[0].appendChild(arg.cloneNode(true)); }
                else if (typeof arg === "string") { this.els.forEach( (el) => { el.innerHTML += arg }); }
                return this;
            };

            this.remove = function () {
                this.els.forEach( (el) => { el.remove() });
            };

            this.on = function(ev, fn) {
                this.els.forEach((el) => { el.addEventListener(ev, fn) });
                return this;
            };

            this.addClass = function(cl) {
                this.els.forEach( (el) => { el.classList.add(cl) });
                return this;
            };

            this.removeClass = function(cl) {
                this.els.forEach( (el) => { el.classList.remove(cl) });
                return this;
            };

        return this;
    };

    // Extend µ / mu Object
    Object.assign(muQuery, {

        randomInt : function(min, max) { // Returns int between @min and @max, inclusive.
        	let _max = parseInt(max);
        	let _min = parseInt(min);
        	return Math.floor(Math.random() * ((_max - _min) + 1)) + _min;
        },

    });

    window.µ = muQuery;

}());

export default µ;
