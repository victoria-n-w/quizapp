export class Timer {
    constructor() {
        this.startTime = 0;
        this.subMeasureTime = 0;
    }
    start() {
        const date = new Date();
        this.startTime = date.getTime();
        this.subMeasureTime = this.startTime;
    }
    measureTime() {
        const date = new Date();
        return date.getTime() - this.startTime;
    }
    subMeasure() {
        const date = new Date();
        const res = date.getTime() - this.subMeasureTime;
        this.subMeasureTime = date.getTime();
        return res;
    }
}
//# sourceMappingURL=timer.js.map