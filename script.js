// 모든 버튼 요소와 디스플레이 요소 선택
const display = document.querySelector('.display');
const buttons = document.querySelectorAll('.button');

let firstOperand = null;
let secondOperand = null;
let operator = null;
let gotOperator = null;

// 디스플레이 이탈 입력 시, 폰트 크기 조절
function resizeFont() {
    display.classList.remove('small', 'medium', 'large');

    const length = display.textContent.length;

    if(length <= 12) display.classList.add('large');
    else if(length <= 38) display.classList.add('medium');
    else display.classList.add('small');
}

function calculate(first, second, operate) {
    const num1 = Number(first);
    switch(operate) {
        case '+':
            console.log(num1+second);
            return num1 + second;
        break;

        case '-':
            return num1 - second;
        break;

        case '*':
            return num1 * second;
        break;

        case '/':
            return second !== 0 ? num1 / second : 'Error';
        break;
        default:
            return 'Error';
    }
}

// 버튼 클릭 이벤트 리스터 추가
buttons.forEach(button => {
    button.addEventListener('click', () => {
        // 클릭 이벤트 발생하면 클릭 값 가져옴
        const value = button.textContent;
        console.log(`${value}버튼`);
 
        // 클래스가 operator인 경우에만 처리
        if(button.classList.contains('operator')) {
            if(value === '=') {
                secondOperand = display.textContent;
                console.log(operator);
                // 오류1 문자열을 숫자로 (number로 변환 해서 해결)
                const result = calculate(firstOperand, parseFloat(secondOperand), operator);
                // 결과값 표시
                display.textContent = result;
                // 연속 계산
                firstOperand = result;
                gotOperator = true;
            }   
            if(firstOperand === null) firstOperand = display.textContent;
            operator = value;
            gotOperator = true;
            console.log(`${firstOperand}`);
            console.log(`${operator}`);
        }
        // 클래스가 number인 경우에만 처리
        if(button.classList.contains('number')) {

            // 소수점 처리. .이 눌려졋고 이미 디스플레이에 .이 있을 경우
            if(value === '.' && display.textContent.includes('.')) return; // 아무것도 안함

            // 디스플레이가 초기값인 경우 클릭한 숫자로 바뀜
            if(display.textContent === '0') {
                // .이 가장 처음 눌렸다면 0. 으로 시작
                display.textContent = value === '.' ? '0.' : value;
            }
            // 연산자 입력 후 첫 숫자 입력 시, 초기화
            else if(gotOperator) {
                display.textContent = value === '.' ? '0.' : value;
                gotOperator = false;
            }
            // 0이 아닌 경우 클릭한 숫자를 뒤에 추가
            else {
                display.textContent += value;
            }
        }
        // C 버튼
        if(value === 'C') {
            firstOperand = null;
            operator = null;
            gotOperator = null; 
            display.textContent = '0';
            display.classList.remove('small', 'medium', 'large');
            console.clear();
            console.log('C버튼');
        }
             
        // 폰트 크기 조절
        resizeFont();
    }); 
});
