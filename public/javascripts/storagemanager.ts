export class StorageManager {

    private quizScores: string
    private quizStats: string

    constructor(quizScores: string, quizStats: string) {
        this.quizScores = quizScores
        this.quizStats = quizStats
    }

    public getScores(): number[] {
        const temp = localStorage.getItem(this.quizScores)
        if (temp === null)
            return []
        else
            return JSON.parse(temp as string)
    }

    public saveScore(score: number) {
        let scores
        const temp = localStorage.getItem(this.quizScores)
        if (temp === null) {
            scores = []
        } else {
            scores = JSON.parse(temp as string)
        }

        scores.push(score)

        scores.sort((a: number, b: number) => { return a - b })
        localStorage.setItem('quizScores', JSON.stringify(scores))
    }

    public saveStats(times: number[]): void {
        const temp = localStorage.getItem(this.quizStats)
        let stats
        if (temp === null) {
            stats = []
        } else {
            stats = JSON.parse(temp as string)
        }

        stats.push(times)

        localStorage.setItem(this.quizStats, JSON.stringify(stats))
    }
}

