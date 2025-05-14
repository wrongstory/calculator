// 모든 버튼 요소와 디스플레이 요소 선택
const display = document.querySelector('.display');
const buttons = document.querySelectorAll('.button');
const redBtn = document.getElementById("red-dot");
const yellowBtn = document.getElementById("yellow-dot");
const greenBtn = document.getElementById("green-dot");
const staffTrack = document.getElementById("staff-track");
const calculator = document.querySelector(".calculator-container");

let firstOperand = null;
let secondOperand = null;
let operator = null;
let isNewInput = false;
let isFallen = false; // 동작 상태 저장(빨간버튼)

// 초기에는 악보 숨기기
staffTrack.classList.add("hidden");

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
        case '+': return num1 + num2; break;
        case '-': return num1 - num2; break;
        case '*': return num1 * num2; break;
        case '/': return num2 !== 0 ? num1 / num2 : 'Error'; break;
        default:
            return 'Error';
    }
}
// 상태 초기화
function clearAll() {
    firstOperand = null;
    secondOperand = null;
    operator = null;
    isNewInput = false;
    display.textContent = '0';
    buttons.forEach(btn => btn.classList.remove('active-operator'));
    display.classList.remove('small', 'medium', 'large');
}

// 노란 버튼 → 악보 애니메이션 보이기
yellowBtn.addEventListener("click", () => {
  staffTrack.classList.remove("hidden");
  calculator.classList.remove("fallen");
});

// 초록 버튼 → 악보 숨기고 계산기만 보이기
greenBtn.addEventListener("click", () => {
  staffTrack.classList.add("hidden");
  calculator.classList.remove("fallen");
});

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
                    if(secondOperand === null) {
                        secondOperand = display.textContent;
                    }
                    // 오류1 문자열을 숫자로 (number로 변환 해서 해결)
                    const result = calculate(firstOperand, secondOperand, operator);
                    // 결과값 표시
                    display.textContent = result;
                    // 연속 계산
                    firstOperand = result;            
                    isNewInput = true;

                    // 계산 후 모든 연산자 강조 해제
                    buttons.forEach(btn => {
                        if(btn.classList.contains('operator') && btn.textContent !== operator) {
                            btn.classList.remove('active-operator');
                        }
                    });
                }
                resizeFont();
                return; // 여기서 return 안 하면 아래 operator = '=' 되는 문제 생김
            }   
            // 연산자가 눌리는 경우 secondOperand가 있으면 초기화
            // 오류 2. 없을 경우 연속 계산 수행중, 이탈 시 계산 불능됨
            if(isNewInput && secondOperand !== null) {
                firstOperand = display.textContent;
                secondOperand = null;
                isNewInput = true;
            }

            // 기존 연산자 누르고 숫자 안누른 상태면 그냥 operator만 갱신함
            if(isNewInput && secondOperand === null) {
                operator = value;
                buttons.forEach(btn => btn.classList.remove('active-operator'));
                button.classList.add('active-operator');
                return;
            }
            
            // 두 번째 연산자 눌럿을 때 (이전계산 수행)
            if(firstOperand !== null && operator !== null && !isNewInput) {
                secondOperand = display.textContent;
                const result = calculate(firstOperand, secondOperand, operator);
                display.textContent = result;
                firstOperand = result;
            } else firstOperand = display.textContent;

            // 연산자 저장
            operator = value;
            isNewInput = true;

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
            if(display.textContent === '0' || isNewInput) {
                isNewInput = false;
                
                // .이 가장 처음 눌렸다면 0. 으로 시작
                secondOperand = value === '.' ? '0.' : value;
                display.textContent = secondOperand;
            }
            // 0이 아닌 경우 클릭한 숫자를 뒤에 추가
            else {
                display.textContent += value;

                if(firstOperand !== null && operator !== null) {
                    secondOperand = display.textContent;
                }
            }
        }

        // 클래스가 function일 경우에만 처리
        else if(button.classList.contains('function')){ 
            // C 버튼
            if(value === 'C') {
                clearAll()
                console.clear();
                console.log('C버튼');
            }
            else if (value === '±') {
                const current = parseFloat(display.textContent);
                const inverted = (current * -1).toString();
                display.textContent = inverted;
            
                // = 중복 입력 계산 기능으로 
                if (isNewInput) {
                    // 연산자 입력 후 숫자를 입력 중이면 → secondOperand 반영
                    secondOperand = inverted;
                } else {
                    // 연산자 누르기 전이거나 연산 직후라면 → firstOperand 반영
                    firstOperand = inverted;
                }
                console.log(`${firstOperand} ${secondOperand}`);
                resizeFont();
                return;
            }
            else if (value === '%') {
                const current = parseFloat(display.textContent);
                const percent = current / 100;
                display.textContent = percent.toString();
                
                // = 중복 입력 계산으로 인한 추가
                if (isNewInput) secondOperand = percent;
                    else firstOperand = percent;
                resizeFont(); // 글자 수 바뀌니까 호출
                return;
            }
        }
        // 폰트 크기 조절
        resizeFont();
    }); 
});
function disableButtons() {
  buttons.forEach(btn => {
    btn.style.pointerEvents = "none";
    btn.style.opacity = "0.3";
  });
}

function enableButtons() {
  buttons.forEach(btn => {
    btn.style.pointerEvents = "auto";
    btn.style.opacity = "1";
  });
}

// 빨간 버튼 누르면 접힘
redBtn.addEventListener("click", () => {
  calculator.classList.add("iconified");
  calculator.classList.remove("restoring");
  staffTrack.classList.add("hidden");
  disableButtons(); // 버튼 비활성화
});


// 계산기 클릭 시 다시 복원
calculator.addEventListener("dblclick", () => {
  if (calculator.classList.contains("iconified")) {
    calculator.classList.remove("iconified");
    calculator.classList.add("restoring");

    calculator.addEventListener("animationend", function handler() {
      calculator.classList.remove("restoring");
      enableButtons(); // 버튼 다시 활성화
      calculator.removeEventListener("animationend", handler);
    });
  }
});