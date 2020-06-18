import { Renderer } from "./renderer.js";
import { Timer } from "./timer.js";
import { StorageManager } from "./storagemanager.js"

type Question = {
    penalty: number;
    content: string;
    answer: string;
};


export class QuizManager {
    private renderer: Renderer
    private questions: Question[]
    private currentQuestion: number
    private maxQuestion: number
    private timer: Timer
    private questionsTimes: number[]
    private questionsCorrect: boolean[]
    private storage: StorageManager
    private score: number = 0
    private interval: NodeJS.Timeout


    constructor(questions: Question[]) {
        this.questions = questions
        this.timer = new Timer()
        this.storage = new StorageManager('quizScores', 'quizStats')
        this.renderer = new Renderer(this.timer, this.questions)

        this.questionsCorrect = []
        this.questionsTimes = []
        this.currentQuestion = 0
        this.maxQuestion = this.questions.length - 1

        this.questions.forEach(() => {
            this.questionsTimes.push(0)
            this.questionsCorrect.push(false)
        });

        this.renderer.renderScores(this.storage.getScores())

    }

    public start() {
        this.currentQuestion = 0
        this.renderer.start()
        this.score = 0
        this.questionsTimes.forEach((v, i) => {
            this.questionsTimes[i] = 0;
            this.questionsCorrect[i] = false;
        })

        this.timer.start()

        this.interval = setInterval(() => {
            this.renderer.renderTime(this.timer.measureTime())
            if (this.renderer.checkForEmpty() && this.renderer.finishLocked) {
                this.renderer.unlockFinish()
            }
            else if (!this.renderer.finishLocked && (!this.renderer.checkForEmpty())) {
                this.renderer.lockFinish()
            }
        }, 10)
    }


    public next() {

        if (this.currentQuestion === this.maxQuestion)
            return

        this.questionsTimes[this.currentQuestion] += this.timer.subMeasure()
        this.renderer.nextQuestion(this.currentQuestion, this.maxQuestion)
        this.currentQuestion++

    }

    public prvs(): void {
        if (this.currentQuestion === 0)
            return
        this.questionsTimes[this.currentQuestion] += this.timer.subMeasure()

        this.renderer.prvsQuestion(this.currentQuestion, this.maxQuestion)
        this.currentQuestion--;

    }

    private checkAnswers(): number {
        let penalty: number = 0
        this.questions.forEach((element, i) => {
            this.questionsCorrect[i] = (this.renderer.getAnswer(i) === this.questions[i].answer)
            if (!this.questionsCorrect[i])
                penalty += this.questions[i].penalty
        });

        return penalty
    }

    public finish(): void {
        if (!this.renderer.checkForEmpty())
            return

        clearInterval(this.interval)
        this.score = this.timer.measureTime() + this.checkAnswers() * 1000;
        this.questionsTimes[this.currentQuestion] += this.timer.subMeasure();

        this.checkAnswers()

        this.renderer.renderScore(this.score, this.questions, this.questionsCorrect)
    }

    public save(stats: boolean): void {
        this.storage.saveScore(this.score)
        if (stats) {
            this.storage.saveStats(this.questionsTimes)
        }
    }

    public cancel() {
        this.renderer.cancel()
        this.reset()
    }

    public reset() {
        this.renderer.renderScores(this.storage.getScores())
        this.renderer.reset()
        clearInterval(this.interval)
    }
}