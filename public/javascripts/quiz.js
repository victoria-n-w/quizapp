import { Renderer } from "./renderer.js";
import { Timer } from "./timer.js";
export class QuizManager {
    constructor(questions) {
        this.score = 0;
        this.questions = questions;
        this.timer = new Timer();
        this.renderer = new Renderer(this.timer, this.questions);
        this.questionsCorrect = [];
        this.questionsTimes = [];
        this.currentQuestion = 0;
        this.maxQuestion = this.questions.length - 1;
        this.questions.forEach(() => {
            this.questionsTimes.push(0);
            this.questionsCorrect.push(false);
        });
    }
    start() {
        this.currentQuestion = 0;
        this.renderer.start();
        this.score = 0;
        this.questionsTimes.forEach((v, i) => {
            this.questionsTimes[i] = 0;
            this.questionsCorrect[i] = false;
        });
        this.timer.start();
        this.interval = setInterval(() => {
            this.renderer.renderTime(this.timer.measureTime());
            if (this.renderer.checkForEmpty() && this.renderer.finishLocked) {
                this.renderer.unlockFinish();
            }
            else if (!this.renderer.finishLocked && (!this.renderer.checkForEmpty())) {
                this.renderer.lockFinish();
            }
        }, 10);
    }
    next() {
        if (this.currentQuestion === this.maxQuestion)
            return;
        this.questionsTimes[this.currentQuestion] += this.timer.subMeasure();
        this.renderer.nextQuestion(this.currentQuestion, this.maxQuestion);
        this.currentQuestion++;
    }
    prvs() {
        if (this.currentQuestion === 0)
            return;
        this.questionsTimes[this.currentQuestion] += this.timer.subMeasure();
        this.renderer.prvsQuestion(this.currentQuestion, this.maxQuestion);
        this.currentQuestion--;
    }
    finish() {
        if (!this.renderer.checkForEmpty())
            return;
        clearInterval(this.interval);
        alert('skończono quiz xd');
    }
    cancel() {
        this.renderer.cancel();
        this.reset();
    }
    reset() {
        this.renderer.reset();
        clearInterval(this.interval);
    }
}
//# sourceMappingURL=quiz.js.map