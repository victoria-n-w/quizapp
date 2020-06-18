export class StorageManager {
    constructor(quizScores, quizStats) {
        this.quizScores = quizScores;
        this.quizStats = quizStats;
    }
    getScores() {
        const temp = localStorage.getItem(this.quizScores);
        if (temp === null)
            return [];
        else
            return JSON.parse(temp);
    }
    saveScore(score) {
        let scores;
        const temp = localStorage.getItem(this.quizScores);
        if (temp === null) {
            scores = [];
        }
        else {
            scores = JSON.parse(temp);
        }
        scores.push(score);
        scores.sort((a, b) => { return a - b; });
        localStorage.setItem('quizScores', JSON.stringify(scores));
    }
    saveStats(times) {
        const temp = localStorage.getItem(this.quizStats);
        let stats;
        if (temp === null) {
            stats = [];
        }
        else {
            stats = JSON.parse(temp);
        }
        stats.push(times);
        localStorage.setItem(this.quizStats, JSON.stringify(stats));
    }
}
//# sourceMappingURL=storagemanager.js.map