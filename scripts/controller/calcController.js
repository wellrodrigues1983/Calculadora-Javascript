class CalcController {

    constructor() { //  Métodos adicionados aqui são iniciados jundo com o projeto

        this._audio = new Audio('click.mp3'); // define qual audio será executado
        this._audioOnOff = false;
        this._lastOperator = '';
        this._lastNumber = '';

        this._operation = [];
        this._locale = 'pt-BR';
        this._displayCalcEl = document.querySelector("#display");
        this._dateEl = document.querySelector("#data");
        this._timeEl = document.querySelector("#hora");
        this._currentDate;
        this.initialize();
        this.initButtonsEvent();
        this.initKeyboard();

    }

    pasteFromClipboard(){ // colar no display

        document.addEventListener('paste', e=>{

            let text = e.clipboardData.getData('Text');

            this.displayCalc = parseFloat(text);

            
        })
    }

    copyToClipboard() { // copiar valores do display

        let input = document.createElement('input');

        input.value = this.displayCalc;

        document.body.appendChild(input);

        input.select();

        document.execCommand("Copy");

        input.remove();
    }

    initialize() {

        this.setDisplayDateTime();

        setInterval(() => {

            this.setDisplayDateTime();

        }, 1000); // intervalo de 1 segundo(1000 ms) de atualização da tela dando efeito de que a hora esta em tempo real

        this.setLastNumberToDisplay();
        this.pasteFromClipboard();

        document.querySelectorAll('.btn-ac').forEach(btn => {

            btn.addEventListener('dblclick', e=>{

                this.toggleAudio();
            });
        });
    }

    toggleAudio() {

        this._audioOnOff = !this._audioOnOff; // if ternário ou é do jeito que foi definido lá no constructor ou não é(true ou false)     
    }

    playAudio() { // executa o audio

        if (this._audioOnOff) {

            this._audio.currentTime = 0; // caso a tecla seja pressionada muito rápida o audio retorna para zero e é novamente executado.
            this._audio.play();
        }
    }

    initKeyboard() { // capturando eventos de teclado

        document.addEventListener('keyup', e => {

            this.playAudio();

            switch (e.key) {

                case 'Escape':
                    this.clearAll();
                    break;

                case 'Backspace':
                    this.clearEntry();
                    break;

                case '+':
                case '-':
                case '*':
                case '/':
                case '%':
                    this.addOperation(e.key);
                    break;

                case 'Enter':
                case '=':
                    this.calc();
                    break;

                case '.':
                case ',':
                    this.addDot();
                    break;

                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(parseInt(e.key));
                    break;

                case 'c':
                    if (e.ctrlKey) this.copyToClipboard();                      
                    break;
            }
        });
    }

    addEventListenerALLEvents(element, events, fn) {

        events.split(' ').forEach(event => {

            element.addEventListener(event, fn, false);
        });
    }

    clearAll() {
        this._operation = []; // Aqui traz o array zerado

        this.setLastNumberToDisplay();

    }

    clearEntry() {
        this._operation.pop(); //método pop apaga o ultimo valor adicionado.

        this.setLastNumberToDisplay();

    }

    getLastOperation() {
        return this._operation[this._operation.length - 1]; //Retorna o ultimo valor adicionado.

    }

    setLastOperation(value) {
        this._operation[this._operation.length - 1] = value; // aqui depois de concatenar ele remore o valor anterior e coloca o novo valor concatenado .
    }

    isOperator(value) {
        return (['+', '-', '*', '/', '%'].indexOf(value) > -1); // Array de operadores disponiveis, se for operado o digitado o return é true.
    }

    pushOperation(value) {

        this._operation.push(value);

        if (this._operation.length > 3) {

            this.calc();
        }

    }

    getResult() {

        try {
            return eval(this._operation.join(""));
            
        } catch (e) {
            setTimeout(() =>{
                this.setError();
            }, 1);
        }
    }

    calc() {

        let last = '';

        this._lastOperator = this.getLastItem();

        if (this._operation.length < 3) { //pegar ultimo item e guardar na posição zero do array

            let firstItem = this._operation[0];
            this._operation = [firstItem, this._lastOperator, this._lastNumber];

        }

        if (this._operation.length > 3) { // fazer a conta se ultrapassar a quantidade de 3 itens no array

            this._operation.pop();
            this._lastNumber = this.getResult();

        } else if (this._operation.length == 3) { // ultima item pego é usado para o "igual" ficar lançando como se fosse o ultimo item digitado, fazendo a conta ser repetida em looping

            this._lastNumber = this.getLastItem(false);

        }

        let result = this.getResult(); // pega os 2 valores do array junta com o join e faz o calculo com eval

        if (last == '%') {

            result /= 100; // forma de calcular a porcentagem para não trazer módulo ao invés do porcento

            this._operation = [result];

        } else {

            this._operation = [result]; // cria um novo array apenas com o result e o last number

            if (last) this._operation.push(last);
        }

        this.setLastNumberToDisplay();

    }

    getLastItem(isOperator = true) {

        let lastItem;

        for (let i = this._operation.length - 1; i >= 0; i--) { // pega os valore dentro do array e varre de trás pra frente

            if (this.isOperator(this._operation[i]) == isOperator) {
                lastItem = this._operation[i];
                break;
            }

        }

        if (!lastItem) {
            lastItem = (isOperator) ? this._lastOperator : this._lastNumber = 0;
        }



        return lastItem;
    }

    setLastNumberToDisplay() {

        let lastNumber = this.getLastItem(false);

        if (!lastNumber) lastNumber = 0;  // se não tem um ultimo número é definido um valor para zero no display.      

        this.displayCalc = lastNumber;
    }

    addOperation(value) {

        if (isNaN(this.getLastOperation())) { // Aqui verifica se é número ou não
            // String
            if (this.isOperator(value)) {
                //Trocar o Operador
                this.setLastOperation(value);

            } else {
                this.pushOperation(value);

                this.setLastNumberToDisplay();

            }

        } else {
            //Numérico
            if (this.isOperator(value)) { // verifica se é operado e add no array

                this.pushOperation(value);

            } else {

                let newValue = this.getLastOperation().toString() + value.toString(); //Aqui concatena o ultimo valor do array com o novo valor, para não somar os valores.
                this.setLastOperation(newValue);

                // Atualizar Display
                this.setLastNumberToDisplay();
            }

        }
    }

    setError() {
        this.displayCalc = "Error"; //exibir msg erro no display
    }

    addDot() { // método para conversão quando usado o ponto, concatenar quando é iniciado a conta já com o ponto(exemplo 1) ou quando o ponto é adicionado quando esta ocorrendo a operação(exemplo 2)

        let lastOperation = this.getLastOperation();

        if (typeof lastOperation === 'string' && lastOperation.split('').indexOf('.') > -1) return; // Bloqueia o uso do ponto por mais de uma vez

        if (this.isOperator(lastOperation) || !lastOperation) { //Exemplo 1
            this.pushOperation('0.');
        } else {
            this.setLastOperation(lastOperation.toString() + '.'); // Exemplo 2
        }

        this.setLastNumberToDisplay();

    }

    execBtn(value) {

        this.playAudio();

        switch (value) {

            case 'ac':
                this.clearAll();
                break;

            case 'ce':
                this.clearEntry();
                break;

            case 'soma':
                this.addOperation('+');
                break;

            case 'subtracao':
                this.addOperation('-');
                break;

            case 'divisao':
                this.addOperation('/');
                break;

            case 'multiplicacao':
                this.addOperation('*');
                break;

            case 'porcento':
                this.addOperation('%');
                break;

            case 'igual':
                this.calc();
                break;

            case 'ponto':
                this.addDot();
                break;

            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(parseInt(value));
                break;

            default:
                this.setError();
                break;
        }
    }

    initButtonsEvent() {

        let buttons = document.querySelectorAll("#buttons > g, #parts > g"); // aqui vai ler tds os buttons das tags g 

        buttons.forEach((btn, index) => {

            this.addEventListenerALLEvents(btn, "click drag", e => {

                let textBtn = btn.className.baseVal.replace("btn-", ""); // aqui vamos fazer um replace para deixar a descrição do botão mais simples

                this.execBtn(textBtn);

            });

            this.addEventListenerALLEvents(btn, "mouseover mouseup mousedown", e => { // aqui vamos dar efeitos do mouse sobre os botões

                btn.style.cursor = "pointer";

            });

        });

    }

    setDisplayDateTime() { // definindo a data do display

        this.displayDate = this.currentDate.toLocaleDateString(this._locale, {
            day: "2-digit",
            month: "long",
            year: "numeric"

        });
        this.displayTime = this.currentDate.toLocaleTimeString(this._locale); // definindo a hora do display
    }

    get displayTime() {
        return this._timeEl.innerHTML;
    }

    set displayTime(value) {
        return this._timeEl.innerHTML = value;
    }


    get displayDate() {
        return this._dateEl.innerHTML;
    }

    set displayDate(value) {
        return this._dateEl.innerHTML = value;
    }

    get displayCalc() {
        return this._displayCalcEl.innerHTML;
    }

    set displayCalc(value) {

        if (value.toString().length > 10) {
            this.setError();
            return false;
        }
        return this._displayCalcEl.innerHTML = value;
    }

    get currentDate() {
        return new Date();
    }

    set currentDate(value) {
        return new Date(value);
    }
}