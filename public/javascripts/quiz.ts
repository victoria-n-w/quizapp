import { Renderer } from "./renderer.js";
import { Timer } from "./timer.js";


export type Question = {
    penalty: number;
    content: string;
};

type resultQuestion = {
    answer: number
    time: number
    timePercent: number
}

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
        this.renderer = new Renderer(this.timer, this.questions)

        this.questionsCorrect = []
        this.questionsTimes = []
        this.currentQuestion = 0
        this.maxQuestion = this.questions.length - 1

        this.questions.forEach(() => {
            this.questionsTimes.push(0)
            this.questionsCorrect.push(false)
        });

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



    public finish(quizId: number): void {
        if (!this.renderer.checkForEmpty())
            return

        clearInterval(this.interval)

        let timeSum = 0;
        this.questionsTimes.forEach((t) => {
            timeSum += t
        })

        let result: resultQuestion[] = []

        this.questions.forEach((t, i) => {
            let x = {} as resultQuestion
            x.answer = parseInt(this.renderer.getAnswer(i))
            x.time = this.questionsTimes[i]
            x.timePercent = x.time / timeSum
            result.push(x)
        })

        this.renderer.startLoading()

        let xhr = new XMLHttpRequest()

        xhr.open('POST', '/quiz/' + quizId.toString() + '/solve', true)
        xhr.send(JSON.stringify({ 'result': result }))

        console.log(JSON.stringify({ 'result': result }))

        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status == 200) {
                let res = JSON.parse(xhr.responseText)
                console.log(res)
                if (res.ok) {
                    window.location.href = '/quiz/' + quizId.toString() + '/score'
                }
            }
        }
    }


    public cancel() {
        this.renderer.cancel()
        this.reset()
    }

    public reset() {
        this.renderer.reset()
        clearInterval(this.interval)
    }
}