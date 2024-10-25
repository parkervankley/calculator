function operate(a, b, operator) {
  a = Number(a.replace(/[()]/g, ''));
  b = Number(b.replace(/[()]/g, ''));
  let answer;
    
  switch (operator) {
    case '+':
      answer = a + b;
      break;
    case '−':
    case '-':
      answer =  a - b;
      break;
    case '×':
    case '*':
      answer = a * b;
      break;
    case '÷':
    case '/':
      if (b === 0) return "You thought"
      answer = a / b;
      break;
  }

  return answer.toString();
}

const display = document.getElementById("display");

function updateDisplay(value) {
  let displayValue = display.textContent;
  const MAX_LENGTH = 15;

  if (displayValue === '' && /[÷×−+]/.test(value)) return;

  if (displayValue.length >= MAX_LENGTH && !/[÷×−+]/.test(value)) return;

  if (displayValue.slice(-1) === ')' && !/[÷×−+]/.test(value)) return;

  if (displayValue === 'NaN') return;

  // Handle decimal point
  if (value === '.') {
    const numbers = displayValue.split(/[÷×−+]/);
    const currentNumber = numbers[numbers.length - 1];
    
    // Prevent multiple decimals in current number
    if (currentNumber.includes('.')) {
      return;
    }

    // Add leading zero if decimal is first character or after operator
    if (displayValue === '' || /[÷×−+]/.test(displayValue.slice(-1))) {
      displayValue += '0';
    }
  }

  // Prevent multiple operators
  if (/[÷×−+]/.test(displayValue) && /[÷×−+]/.test(value)) {
    return;
  }

  display.textContent = fitToDisplay(displayValue + value);
}

function equal() {
  displayValue = display.textContent;

  const parts = displayValue.split(/([÷×−+])/);

  if (displayValue === 'NaN') return;

  if (parts.length != 3 || parts[parts.length - 1] === '') return;

  const firstNumber = parts[0];
  const lastNumber = parts[parts.length - 1];
  const operator = parts[1];

  display.textContent = fitToDisplay(operate(firstNumber, lastNumber, operator));
}

function clearDisplay() {
  display.textContent = '';
}

function switchSign() {
  displayValue = display.textContent;

  const parts = displayValue.split(/([÷×−+])/);
  const lastNumber = parts[parts.length - 1];

  if (displayValue === 'NaN') return;

  if (lastNumber) {
    if (lastNumber.startsWith('(') && lastNumber.endsWith(')')) {
      parts[parts.length - 1] = lastNumber.slice(2, -1);
    } else if (displayValue.length <= 12) {
      parts[parts.length - 1] = `(-${lastNumber})`
    }
  }

  display.textContent = fitToDisplay(parts.join(''));
}

function percent() {
  displayValue = display.textContent;

  const parts = displayValue.split(/([÷×−+])/);
  const lastNumber = parts[parts.length - 1];

  if (displayValue === 'NaN') return;

  if (lastNumber) {
    parts[parts.length - 1] = lastNumber * .01;
  }

  display.textContent = fitToDisplay(parts.join(''));
}

function backspace() {
  displayValue = display.textContent;

  const parts = displayValue.split(/([÷×−+])/);
  const lastNumber = parts[parts.length - 1];

  if (displayValue === 'NaN') {
    clearDisplay();
  } else if (lastNumber) {
    if (lastNumber.startsWith('(') && lastNumber.endsWith(')')) {
      parts[parts.length - 1] = lastNumber.slice(2, -1);
    } else {
      parts[parts.length - 1] = lastNumber.slice(0, -1)
    }
    display.textContent = fitToDisplay(parts.join(''));
  } else {
    display.textContent = displayValue.slice(0, -1);
  }
}

function fitToDisplay(value) {
  const MAX_LENGTH = 15;
  
  // If already fits, return as is
  if (value.length <= MAX_LENGTH) {
    return value;
  }

  const parts = value.split(/([÷×−+*])/);
  const lastNumber = parts[parts.length - 1];
  const restOfExpression = parts.slice(0, -1).join('');
  
  // Calculate available space for last number
  const availableSpace = MAX_LENGTH - restOfExpression.length;
  
  if (availableSpace <= 0) {
    return value.slice(0, MAX_LENGTH);
  }

  // Handle the last number, keeping significant digits
  const num = parseFloat(lastNumber);
  if (isNaN(num)) return value.slice(0, MAX_LENGTH);
  
  // For very small numbers, use exponential notation
  if (Math.abs(num) < 0.000001) {
    return restOfExpression + num.toExponential(Math.max(0, availableSpace - 7));
  }
  
  // For regular numbers, use fixed notation with appropriate precision
  const decimalPos = lastNumber.indexOf('.');
  if (decimalPos !== -1) {
    const integerPart = lastNumber.slice(0, decimalPos);
    const maxDecimals = availableSpace - integerPart.length - 1; // -1 for decimal point
    return restOfExpression + num.toFixed(Math.max(0, maxDecimals));
  }
  
  return restOfExpression + num.toPrecision(availableSpace);
}
