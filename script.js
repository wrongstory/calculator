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
    const num2 = parseFloat(second);
    switch(operate) {
        case '+':
            return num1 + num2;
        break;

        case '-':
            return num1 - num2;
        break;

        case '*':
            return num1 * num2;
        break;

        case '/':
            return num2 !== 0 ? num1 / num2 : 'Error';
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
                if(firstOperand !== null && operator !== null) {
                    secondOperand = display.textContent;

                    if(!gotOperator || (gotOperator && secondOperand !== firstOperand)){
                        // 오류1 문자열을 숫자로 (number로 변환 해서 해결)
                        const result = calculate(firstOperand, secondOperand, operator);
                        // 결과값 표시
                        display.textContent = result;
                        // 연속 계산
                        firstOperand = result;
                    }             
                    gotOperator = true;

                    // 계산 후 모든 연산자 강조 해제
                    buttons.forEach(btn => btn.classList.remove('active-operator'));
                }
                return; // 여기서 return 안 하면 아래 operator = '=' 되는 문제 생김
            }   
            if(firstOperand !== null && operator !== null && !gotOperator) {
                // 두 번째 연산자 눌럿을 때 (이전계산 수행)
                secondOperand = display.textContent;
                const result = calculate(firstOperand, secondOperand, operator);
                display.textContent = result;
                firstOperand = result;
            } else if(firstOperand === null) firstOperand = display.textContent;

            // 연산자 저장
            operator = value;
            gotOperator = true;

            // 🔥 연산자 버튼 강조 표시
            buttons.forEach(btn => btn.classList.remove('active-operator')); // 이전 것 제거
            button.classList.add('active-operator'); // 현재 버튼 강조

            // 확인 로그
            console.log(`${firstOperand} ${operator}`);
        }
        // 클래스가 number인 경우에만 처리
        else if(button.classList.contains('number')) {

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

        else if(button.classList.contains('function')){ 
            // C 버튼
            if(value === 'C') {
                firstOperand = null;
                operator = null;
                gotOperator = null; 
                display.textContent = '0';
                display.classList.remove('small', 'medium', 'large');
                buttons.forEach(btn => btn.classList.remove('active-operator')); // 이전 것 제거
                console.clear();
                console.log('C버튼');
            }
            else if(value === '%') {
                display.textContent = parseFloat(display.textContent) / 100;
                resizeFont();
                return;
            }
            else if (value === '±') {
                let current = parseFloat(display.textContent);
                if (current !== 0) {
                    display.textContent = (current * -1).toString();
                }
                resizeFont();
                return;
            }
        }
        // 폰트 크기 조절
        resizeFont();
    }); 
});
