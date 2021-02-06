'use strict'
function togglePower() {
	let isOff = document.getElementById("active").classList.contains("off");
	if (isOff) {
		on()
	} else {
		off()
	}
}


async function on() {
	clear();
	document.getElementById("active").classList.remove("off");
	power();

	await pause(1);
	clear();
	await main();
	await pause(1);
	clear();
	pushToTerminal();
	document.querySelector('.math').classList.toggle('shadow')
}

async function off() {

	document.querySelector('.math').classList.toggle('shadow')

	power(false);
	document.getElementById("active").classList.add('off')
	document.querySelector('.output').style.display = 'none'
	document.querySelector('.math').append(document.querySelector('.output'));

	clear()

	await pause(0.3)
}

function power(on = true) {
	// @FIXME use a single class on the #monitor to detect on/off
	document.querySelector("#active").classList.toggle("on", on);
	return;
}

document.querySelector("#power").addEventListener('click', togglePower)


Promise.delay = (ms) => new Promise(resolve => { setTimeout(resolve, ms); });

async function printer(cssSelector, text, r2l) {
	let el = document.querySelector(cssSelector);
	if (r2l) {
		for (let i = text.length - 1; i >= 0; i--) {
			let c = text[i];
			await Promise.delay(10);
			el.innerHTML = c + el.textContent;
		}
	}
	else {
		for (let c of text) {
			await Promise.delay(10);
			el.innerHTML = el.textContent + c;
		}
	}
}

async function main() {
	let str = `${[text.textContent]}`;
	await printer(".terminal", str);
}

/** Clear the terminal screen */
function clear(screen = document.querySelector(".terminal")) {
	screen.innerHTML = "";
}


function pause(s = 1) {
	return new Promise(resolve => setTimeout(resolve, 1000 * Number(s)));
}
async function pushToTerminal() {
	await pause(1);
	let saiHy = document.createElement('p');
	saiHy.innerHTML = 'welcome<br>calculator(TM) 3000......................';
	document.querySelector('.terminal').append(saiHy);
	await pause(3);
	clear();

	document.querySelector('.terminal').append(document.querySelector('.output'));
	document.querySelector('.output').style.display = 'block'


}


async function error() {
	await pause(1);

	let err = document.createElement('p');
	err.innerHTML = 'error44';
	err.className = 'err'
	document.querySelector('.terminal').prepend(err)
	await pause(5)
	err.remove();

}




class Calculator {
	constructor(previousOperandTextElement, currentOperandTextElement) {
		this.previousOperandTextElement = previousOperandTextElement;
		this.currentOperandTextElement = currentOperandTextElement;
		this.readyToReset = false;
		this.clear();
	}

	clear() {
		this.currentOperand = '';
		this.previousOperand = '';
		this.operation = undefined;
	}

	delete() {
		this.currentOperand = this.currentOperand.toString().slice(0, -1);
	}

	appendNumber(number) {
		if (number === '.' && this.currentOperand.includes('.')) return;
		this.currentOperand = this.currentOperand.toString() + number.toString();
	}

	chooseOperation(operation) {
		if (this.previousOperand !== '' && this.previousOperand !== '') {
			this.compute();
		}
		this.operation = operation;
		this.previousOperand = this.currentOperand;
		this.currentOperand = '';
	}
	compute() {
		let computation;
		const prev = parseFloat(this.previousOperand);
		const current = parseFloat(this.currentOperand);
		switch (this.operation) {
			case '+':
				computation = (prev + current).toFixed(Math.max(`${prev}`.length - 1, `${current}`.length - 1));
				break
			case '-':
				computation = (prev - current).toFixed(Math.max(`${prev}`.length - 1, `${current}`.length - 1));
				break
			case '*':
				computation = (prev * current).toFixed(Math.max(`${prev}`.length - 1, `${current}`.length - 1));
				break
			case '÷':
				if (current == 0) {
					computation = error()
					break
				}
				else computation = (prev / current).toFixed(Math.max(`${prev}`.length, `${current}`.length));
				break
			case 'pow':
				computation = Math.pow(prev, current).toFixed(Math.max(`${prev}`.length - 1, `${current}`.length - 1));
				break
			case 'sqrt':
				if (prev >= 0) {
					computation = Math.sqrt(prev).toFixed((`${prev}`.length + 3))
					break
				}
				if (prev <= 0) computation = error()
				if (current <= 0) computation = error()
				break

			default:
				return;
		}
		if (isNaN(prev) && this.operation == 'sqrt') { computation = Math.sqrt(current) }
		else if (isNaN(current) && this.operation != 'sqrt') { computation = prev }
		else if (isNaN(prev) && this.operation == '-') { computation = -current }
		else if (isNaN(prev) && this.operation != '-') { computation = current }
		this.readyToReset = true;
		this.currentOperand = computation;
		this.operation = undefined;
		this.previousOperand = '';
	}

	getDisplayNumber(number) {
		const stringNumber = number.toString()
		const integerDigits = parseFloat(stringNumber.split('.')[0])
		const decimalDigits = stringNumber.split('.')[1]
		let integerDisplay
		if (isNaN(integerDigits)) {
			integerDisplay = ''
		} else {
			integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 })
		}
		if (decimalDigits != null) {
			return `${integerDisplay}.${decimalDigits}`
		} else {
			return integerDisplay
		}
	}

	updateDisplay() {
		this.currentOperandTextElement.innerText =
			this.getDisplayNumber(this.currentOperand)
		if (this.operation != null) {
			this.previousOperandTextElement.innerText =
				`${this.getDisplayNumber(this.previousOperand)} ${this.operation}`
		} else {
			this.previousOperandTextElement.innerText = ''
		}
	}
}


const numberButtons = document.querySelectorAll('[data-number]');
const operationButtons = document.querySelectorAll('[data-operation]');
const equalsButton = document.querySelector('[data-equals]');
const deleteButton = document.querySelector('[data-delete]');
const allClearButton = document.querySelector('[data-all-clear]');
const previousOperandTextElement = document.querySelector('[data-previous-operand]');
const currentOperandTextElement = document.querySelector('[data-current-operand]');

const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement)

numberButtons.forEach(button => {
	button.addEventListener("click", () => {

		if (calculator.previousOperand === "" &&
			calculator.currentOperand !== "" &&
			calculator.readyToReset) {
			calculator.currentOperand = "";
			calculator.readyToReset = false;
		}
		calculator.appendNumber(button.innerText)
		calculator.updateDisplay();
	})
})

operationButtons.forEach(button => {
	button.addEventListener('click', () => {
		calculator.chooseOperation(button.innerText);
		calculator.updateDisplay();
	})
})

equalsButton.addEventListener('click', button => {
	calculator.compute();
	calculator.updateDisplay();
})

allClearButton.addEventListener('click', button => {
	calculator.clear();
	calculator.updateDisplay();
})

deleteButton.addEventListener('click', button => {
	calculator.delete();
	calculator.updateDisplay();
})


//info
let infoOn = document.querySelector('.info-button')

infoOn.addEventListener('click', showInfo)

function showInfo() {
	let information = document.querySelector('.info')
	information.classList.toggle('open')
}