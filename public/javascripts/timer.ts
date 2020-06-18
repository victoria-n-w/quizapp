
export class Timer {
    private startTime: number = 0
    private subMeasureTime: number = 0

    public start(): void {
        const date = new Date()
        this.startTime = date.getTime()
        this.subMeasureTime = this.startTime
    }

    public measureTime(): number {
        const date = new Date()
        return date.getTime() - this.startTime;
    }

    public subMeasure(): number {
        const date = new Date()
        const res: number = date.getTime() - this.subMeasureTime
        this.subMeasureTime = date.getTime()
        return res
    }
}

