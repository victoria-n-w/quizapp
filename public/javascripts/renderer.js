export class Renderer {
    constructor(timer, questions) {
        this.containerQuestions = document.getElementById('questions');
        this.finishLocked = true;
        this.maxNumber = questions.length;
        this.scoreList = document.getElementById('score-list');
        this.startContainer = document.getElementById('start-container');
        this.prvsButton = document.getElementById('prvs');
        this.finishButton = document.getElementById('finish');
        this.nextButton = document.getElementById('next');
        this.imageBoardContainer = document.getElementById('image-board-container');
        this.timerContainer = document.getElementById('timer-container');
        this.afterQuiz = document.getElementById('after-quiz');
        this.resultTable = document.getElementById('result-table');
        this.buttonContainer = document.getElementById('button-container');
        this.timeDisplay = document.getElementById('time-display');
        this.questionString = questions.reduce((acc, q, i) => {
            return acc + `<div class='question hidden'><h1 class='question-number'>Pytanie ` + (i + 1) + `/` + (this.maxNumber) + `</h1>
                <p>Kara za błędną odpowiedź: ` + q.penalty + `s</p>
                <label class='question-content'>` + q.content + `=</label><input type="number"></div>`;
        }, ``);
    }
    start() {
        this.containerQuestions.innerHTML = this.questionString;
        const tempInput = document.getElementsByTagName('input');
        this.input = [].slice.call(tempInput);
        this.questionsEl = document.getElementsByClassName('question');
        this.questionsEl[0].classList.remove('hidden');
        this.buttonContainer.classList.remove('hidden');
        this.startContainer.classList.add('hidden');
        this.imageBoardContainer.classList.add('hidden');
        this.nextButton.classList.remove('invisible');
        this.prvsButton.classList.add('invisible');
        this.finishButton.disabled = true;
        this.finishButton.classList.add('invisible');
    }
    score_to_string(acc, el, i) {
        return acc + `<li>` + Renderer.timeToString(el) + `</li>`;
    }
    renderScores(scoreboard) {
        if (scoreboard === [])
            this.scoreList.innerHTML = `<li>--:--:--</li>`;
        else
            this.scoreList.innerHTML = scoreboard.reduce(this.score_to_string, ``);
    }
    nextQuestion(curr, max) {
        if (curr === 0)
            this.prvsButton.classList.remove('invisible');
        this.questionsEl[curr].classList.add('hidden');
        curr++;
        this.questionsEl[curr].classList.remove('hidden');
        if (curr === max)
            this.nextButton.classList.add('invisible');
    }
    prvsQuestion(curr, max) {
        if (curr === max)
            this.nextButton.classList.remove('invisible');
        this.questionsEl[curr].classList.add('hidden');
        curr--;
        this.questionsEl[curr].classList.remove('hidden');
        if (curr === 0)
            this.prvsButton.classList.add('invisible');
    }
    checkForEmpty() {
        let res = true;
        this.input.forEach((el) => {
            if (el.value === '')
                res = false;
        });
        return res;
    }
    getAnswer(index) {
        return this.input[index].value;
    }
    renderTable(questions, questionsCorrect) {
        questions.forEach((el, i) => {
            let res = `<td>` + el.content + `</td>`;
            res += `<td>` + this.input[i].value + `</td>`;
            res += `<td>` + el.answer + `</td>`;
            if (!questionsCorrect[i]) {
                res += `<td>` + el.penalty + '</td>';
            }
            else {
                res += `<td>--</td>`;
            }
            const table = document.getElementById('result-table');
            const row = table.insertRow();
            row.innerHTML = res;
            if (!questionsCorrect[i])
                row.classList.add('wrong-answer');
        });
    }
    renderScore(score, questions, questionsCorrect) {
        this.buttonContainer.classList.add('hidden');
        this.timerContainer.classList.add('hidden');
        this.containerQuestions.innerHTML = ``;
        this.afterQuiz.classList.remove('hidden');
        document.getElementById('score-display').innerText = Renderer.timeToString(score);
        this.renderTable(questions, questionsCorrect);
    }
    static timeToString(score) {
        score = Math.floor(score / 10);
        const min = Math.floor(score / 60 / 100);
        score -= min * 60 * 100;
        const sec = Math.floor(score / 100);
        score -= sec * 100;
        let res = ``;
        if (min < 10)
            res += `0`;
        res += min + `:`;
        if (sec < 10)
            res += `0`;
        res += sec + `:`;
        if (score < 10)
            res += `0`;
        res += score + ``;
        return res;
    }
    renderTime(time) {
        this.timeDisplay.innerHTML = Renderer.timeToString(time);
    }
    unlockFinish() {
        this.finishButton.disabled = false;
        this.finishButton.classList.remove('invisible');
        this.finishLocked = false;
    }
    lockFinish() {
        this.finishButton.disabled = true;
        this.finishLocked = true;
    }
    cancel() {
        this.containerQuestions.innerHTML = ``;
        this.buttonContainer.classList.add('hidden');
    }
    reset() {
        this.imageBoardContainer.classList.remove('hidden');
        this.startContainer.classList.remove('hidden');
        this.timerContainer.classList.remove('hidden');
        this.afterQuiz.classList.add(`hidden`);
        this.timeDisplay.innerText = `00:00:00`;
        this.resultTable.innerHTML = ` <tr>
        <th>
            Pytanie
        </th>
        <th>
            Twoja <br>odpowiedź
        </th>
        <th>
            Prawidłowa <br>odpowiedź
        </th>
        <th>
            Kara
        </th>
    </tr>`;
    }
}
//# sourceMappingURL=renderer.js.map