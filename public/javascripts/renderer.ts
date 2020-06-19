type Question = {
    penalty: number;
    content: string;
    answer: string;

};

import { Timer } from "./timer"

export class Renderer {
    private containerQuestions: HTMLElement
    private questionsEl: HTMLCollection
    private timeDisplay: HTMLElement
    finishLocked: boolean
    private prvsButton: HTMLButtonElement
    private nextButton: HTMLButtonElement
    private finishButton: HTMLButtonElement
    private maxNumber: number
    private input: HTMLInputElement[]
    private timerContainer: HTMLElement
    private imageBoardContainer: HTMLElement
    private afterQuiz: HTMLElement
    private resultTable: HTMLElement
    private startContainer: HTMLElement
    private scoreList: HTMLElement
    private questionString: string
    private buttonContainer: HTMLElement


    constructor(timer: Timer, questions: Question[]) {
        this.containerQuestions = document.getElementById('questions') as HTMLElement
        this.finishLocked = true

        this.maxNumber = questions.length
        this.scoreList = document.getElementById('score-list') as HTMLElement
        this.startContainer = document.getElementById('start-container') as HTMLElement
        this.prvsButton = document.getElementById('prvs') as HTMLButtonElement
        this.finishButton = document.getElementById('finish') as HTMLButtonElement
        this.nextButton = document.getElementById('next') as HTMLButtonElement

        this.imageBoardContainer = document.getElementById('image-board-container') as HTMLElement
        this.timerContainer = document.getElementById('timer-container') as HTMLElement
        this.afterQuiz = document.getElementById('after-quiz') as HTMLElement
        this.resultTable = document.getElementById('result-table') as HTMLElement
        this.buttonContainer = document.getElementById('button-container') as HTMLElement
        this.timeDisplay = document.getElementById('time-display') as HTMLElement
        this.questionString = questions.reduce((acc: string, q: Question, i: number) => {
            return acc + `<div class='question hidden'><h1 class='question-number'>Pytanie ` + (i + 1) + `/` + (this.maxNumber) + `</h1>
                <p>Kara za błędną odpowiedź: `+ q.penalty + `s</p>
                <label class='question-content'>`+ q.content + `=</label><input type="number"></div>`
        }, ``)




    }

    public start(): void {
        this.containerQuestions.innerHTML = this.questionString

        const tempInput = document.getElementsByTagName('input')

        this.input = [].slice.call(tempInput);
        this.questionsEl = document.getElementsByClassName('question')

        this.questionsEl[0].classList.remove('hidden')
        this.buttonContainer.classList.remove('hidden')
        this.startContainer.classList.add('hidden')
        this.imageBoardContainer.classList.add('hidden')

        this.nextButton.classList.remove('invisible')
        this.prvsButton.classList.add('invisible')

        this.finishButton.disabled = true
        this.finishButton.classList.add('invisible')


    }

    public nextQuestion(curr: number, max: number): void {


        if (curr === 0)
            this.prvsButton.classList.remove('invisible')

        this.questionsEl[curr].classList.add('hidden')
        curr++
        this.questionsEl[curr].classList.remove('hidden')

        if (curr === max)
            this.nextButton.classList.add('invisible')

    }

    public prvsQuestion(curr: number, max: number): void {
        if (curr === max)
            this.nextButton.classList.remove('invisible')

        this.questionsEl[curr].classList.add('hidden')
        curr--
        this.questionsEl[curr].classList.remove('hidden')

        if (curr === 0)
            this.prvsButton.classList.add('invisible')


    }

    public checkForEmpty(): boolean {
        let res: boolean = true

        this.input.forEach((el) => {
            if (el.value === '')
                res = false
        })
        return res
    }

    public getAnswer(index: number): string {
        return this.input[index].value
    }

    static timeToString(score: number): string {
        score = Math.floor(score / 10)

        const min = Math.floor(score / 60 / 100)
        score -= min * 60 * 100
        const sec = Math.floor(score / 100)
        score -= sec * 100

        let res = ``

        if (min < 10)
            res += `0`
        res += min + `:`

        if (sec < 10)
            res += `0`
        res += sec + `:`

        if (score < 10)
            res += `0`
        res += score + ``

        return res
    }

    public renderTime(time: number) {
        this.timeDisplay.innerHTML = Renderer.timeToString(time)
    }

    public unlockFinish(): void {
        this.finishButton.disabled = false
        this.finishButton.classList.remove('invisible')
        this.finishLocked = false

    }

    public lockFinish(): void {
        this.finishButton.disabled = true
        this.finishLocked = true
    }

    public cancel(): void {
        this.containerQuestions.innerHTML = ``
        this.buttonContainer.classList.add('hidden')
    }

    public reset(): void {
        this.imageBoardContainer.classList.remove('hidden')
        this.startContainer.classList.remove('hidden')
        this.timerContainer.classList.remove('hidden')
        this.afterQuiz.classList.add(`hidden`)
        this.timeDisplay.innerText = `00:00:00`
    }

    public renderError(message: string) {
        //TODO
    }

    public startLoading() {
        //TODO
    }
}