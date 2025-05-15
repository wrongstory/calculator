// 모든 버튼 요소와 디스플레이 요소 선택
const display = document.querySelector('.display');
const buttons = document.querySelectorAll('.button');
const redBtn = document.getElementById("red-dot");
const yellowBtn = document.getElementById("yellow-dot");
const greenBtn = document.getElementById("green-dot");
const staffTrack = document.getElementById("staff-track");
const calculator = document.querySelector(".calculator-container");

const scene = document.getElementById("scene");
const fallenCalc = scene.querySelector('.fallen-calc');

let firstOperand = null;
let secondOperand = null;
let operator = null;
let isNewInput = false;
let isFallen = false; // 동작 상태 저장(빨간버튼)
let musicMode = false;
let musicInput = ""; // 노래 모드용 입력값 저장
let musicReady = false;
let musicPlayed = false;

const musicFreqMap = {
      '1': 261.63,  // C4
      '2': 293.66,  // D4
      '3': 329.63,  // E4
      '4': 349.23,  // F4
      '5': 392.00,  // G4
      '6': 440.00,  // A4
      '7': 493.88,  // B4
      '8': 523.25,  // C5
      '9': 587.33,  // D5
      '0': 659.26,  // E5
      '+': 698.46,  // F5
      '-': 783.99,  // G5
      '*': 880.00,  // A5
      '/': 987.77,  // B5
      '%': 1046.50, // C6
      'C': 1174.66, // D6
      '±': 1318.51, // E6
      '.': 1396.91  // F6
    };
const END_NOTE = 1661.22; // 종료음 (E6~F#6)

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
  musicMode = true;
  musicInput = "";
  musicReady = true;   // 연주 대기 상태
  musicPlayed = false; // 아직 연주 안됨
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

        let noteValue = value;
        if (musicMode) {       
            // 첫 입력이 숫자가 아니거나 0이면 10으로 간주
            if (musicInput.length === 0 && (!/^[1-9]$/.test(value))) {
                noteValue = '10';
            }

            if (value === '=') {
                playNote(END_NOTE);
                // 결과를 정수로 만들고 앞 8자리만 추출해 노래방 번호처럼 표시
                let result = parseFloat(display.textContent);
                result = isNaN(result) ? 0 : Math.floor(result).toString().padStart(8, '0');
                display.textContent = "🔢" + result.slice(0, 8);
                musicMode = false;
                return;
            }

            const freq = musicFreqMap[noteValue];
            if (freq) playNote(freq);
            musicInput += value;
        }

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
  calculator.classList.add("hidden");   // 기존 계산기 숨김
  staffTrack.classList.add("hidden");
  scene.classList.remove("hidden");     // 떨어진 장면 보여줌
  disableButtons();
});


// 계산기 클릭 시 다시 복원
scene.addEventListener("click", () => {
  fallenCalc.classList.add("pick-up");

  fallenCalc.addEventListener("animationend", function handler() {
    fallenCalc.classList.remove("pick-up");
    scene.classList.add("hidden");        // 장면 숨기기
    calculator.classList.remove("hidden"); // 계산기 복원
    calculator.classList.add("unfolding");

    calculator.addEventListener("animationend", function handler2() {
      calculator.classList.remove("unfolding");
      enableButtons();
      calculator.removeEventListener("animationend", handler2);
    });

    fallenCalc.removeEventListener("animationend", handler);
  });
});

// 음계 처리
function playNote(freq) {
  const context = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.value = freq;
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.start();
  gainNode.gain.setValueAtTime(0.2, context.currentTime); // 소리 크기
  gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.4); // 감쇠
  oscillator.stop(context.currentTime + 0.4);
}

function playSongWithChords(songArray) {
  let i = 0;
  function step() {
    if (i >= songArray.length) return;
    const { notes, duration } = songArray[i];

    // 하이라이트 적용
    notes.forEach(note => {
      const btn = [...buttons].find(b => b.textContent === note);
      if (btn) btn.classList.add("highlight");
    });

    // 사운드 출력
    playChord(notes, duration);

    setTimeout(() => {
      // 하이라이트 제거
      notes.forEach(note => {
        const btn = [...buttons].find(b => b.textContent === note);
        if (btn) btn.classList.remove("highlight");
      });
      i++;
      step();
    }, duration);
  }
  step();
}


function playChord(notes, duration) {
  const context = new (window.AudioContext || window.webkitAudioContext)();
  const now = context.currentTime;

  notes.forEach(note => {
    const freq = musicFreqMap[note];
    if (!freq) return;

    const osc = context.createOscillator();
    const gain = context.createGain();

    osc.type = "sine";
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(context.destination);

    osc.start(now);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration / 1000);
    osc.stop(now + duration / 1000);
  });
}


function mapToSymbol(key) {
  if (key === '±') return '±';
  if (key === '%') return '%';
  return key;
}

staffTrack.addEventListener("click", () => {
  if (musicMode && musicReady && !musicPlayed) {
    fetch('./to_zanarkand_full_1min.json')
      .then(res => res.json())
      .then(song => {
        playSongWithChords(song);
        musicPlayed = true;  // 1회 연주 완료
      });
  }
});