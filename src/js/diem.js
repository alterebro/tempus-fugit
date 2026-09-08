class Diem {

    constructor(timestamp) {
        this._timestamp = ( this.checkTimestamp(timestamp) ) ? timestamp : Date.now();
        this._date = new Date(this._timestamp);
    }

    checkTimestamp(timestamp) {
        return !isNaN( new Date(timestamp).getTime() )
    }

    output() {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return this._date.toLocaleDateString("en-US", options);
    }

    gimmeDay() {
        const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
        return this._date.toLocaleDateString("en-US", options);
    }

    instant() {
        return this._timestamp;
    }

    year() {
        return this._date.getFullYear();
    }
}

export default function diem(timestamp) {
    return new Diem(timestamp);
}
