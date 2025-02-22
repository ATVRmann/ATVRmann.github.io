let N = 3;
let numSquares = N * N;
let numAgents = 2;
const grid = document.getElementById("grid");
let startingState = 68;
let endState = 47;
let gameState = startingState;  // Initial game state
//let currentPuzzleId = Math.floor(Math.random() * 100); //Change later
//let currentPuzzleId = 100;
let currentPuzzleId;
let currentSolution;
let shareString;
const moveInput = document.getElementById("moveInput");
const leftArrowBtn = document.getElementById('left-arrow-btn');
const rightArrowBtn = document.getElementById('right-arrow-btn');
const submitButton = document.getElementById("submitButton");

const numberOfConditions = 4;

// Add event listener to all buttons
const buttons = document.querySelectorAll(".input-btn");

const API_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : "https://orders-2gm0.onrender.com";

let spaceConditions;
let g;

function createGrid(N) {
    grid.innerHTML = "";
    /*
    grid.style.gridTemplateColumns = `repeat(${N}, 150px)`;
    grid.style.gridTemplateRows = `repeat(${N}, 150px)`;
    */
    grid.style.gridTemplateColumns = `repeat(${N}, 0.5fr)`;
    grid.style.gridTemplateRows = `repeat(${N}, 0.5fr)`;

    const reverseMapping = ['A', 'B', 'C', 'D'];    
    for (let i = 0; i < N * N; i++) {
        let cell = document.createElement("div");
        cell.className = "grid-cell";
        cell.id = `cell-${i}`;
        let letter = reverseMapping[spaceConditions[i][0]];
        let number = spaceConditions[i][1];
        cell.textContent = `${letter}${number}`;
        
        grid.appendChild(cell);
    }
    let targetColorMapping = getColorMapping(endState);    
    for (let i = 0; i < targetColorMapping.length; i++) {
      let cell = document.getElementById(`cell-${i}`);
      if (targetColorMapping[i] !== 0) {
          cell.classList.add(`target-${targetColorMapping[i]}`);
      }
  }
}

function updateColors(state) {
    let colorMapping = getColorMapping(state);
    let counter = 0;
    for (let i = 0; i < colorMapping.length; i++) {
        let cell = document.getElementById(`cell-${i}`);
        if(cell) {
          cell.classList.remove(`overlap-triggered`);     
        
          for(let j = 1; j <= 6; ++j)
            cell.classList.remove(`agent-${j}`);
          if(colorMapping[i] !== 0)
          {
            ++counter;
            if (state != endState) {
                cell.classList.add(`agent-${colorMapping[i]}`);            
            }
            else
            {
              cell.classList.add(`agent-6`)
            }
          }
        }
    }
    if(counter < numAgents)
    {
      for(let i = 0; i < numSquares; ++i)
      {
          let cell = document.getElementById(`cell-${i}`);
          if(cell)
            cell.classList.add(`overlap-triggered`);  
      }
    }
}

function getColorMapping(state) {
    let arr = Array(N*N).fill(0);
    let s = state;
    for(let i = 1; i <= numAgents; ++i)
    {      
        arr[s % numSquares] = i;
        s = Math.floor(s / numSquares);
    }
    return arr;    
}

moveInput.addEventListener("input", (event) => {
    let input = event.target.value.toUpperCase();
    input = input.replace(/[^ABCD0123]/g, '');
    event.target.value = input;
    let moves = input.split('');
    document.getElementById("inputLength").textContent = input.length;
    
    let newState = processMoves(moves, gameState);
    if (newState !== null) {
        gameState = newState;
        submitAvailabilityCheck();
        updateColors(newState);
    }
});

moveInput.addEventListener("selectionchange", (event) => {
  let input = event.target.value.toUpperCase();
  const cursorPosition = moveInput.selectionStart;
  input = input.substring(0, cursorPosition);
  let moves = input.split('');
    
    let newState = processMoves(moves, gameState);
    if (newState !== null) {
        gameState = newState;
        submitAvailabilityCheck();
        updateColors(newState);
    }
});

function submitAvailabilityCheck(){
  if(gameState === endState){
    submitButton.disabled = false;
  }
  else{
    submitButton.disabled = true;    
  }
}

buttons.forEach(button => {
  button.addEventListener("click", (event) => {
    const char = event.target.getAttribute("data-char");

    if (char === "backspace") {
      // Remove the last character when backspace is clicked
      moveInput.value = moveInput.value.slice(0, -1);
    } 
    else if (button.id === 'left-arrow-btn' || button.id === 'right-arrow-btn')
    {}
    else {
      // Append the character to the input field
      moveInput.value += char;
      //moveInput.setSelectionRange(currentPosition, currentPosition);
      //console.log(moveInput.selectionStart);
    }
    if (button.id !== 'left-arrow-btn' && button.id !== 'right-arrow-btn')
      moveInput.dispatchEvent(new Event('input'));
  });
});

// Move the cursor left
leftArrowBtn.addEventListener('click', () => {
  moveInput.blur();
  const currentPosition = moveInput.selectionStart;
  if (currentPosition > 0) {
    moveInput.setSelectionRange(currentPosition - 1, currentPosition - 1);
  }
  moveInput.focus();
});

// Move the cursor right
rightArrowBtn.addEventListener('click', () => {
  moveInput.blur();
  const currentPosition = moveInput.selectionStart;
  if (currentPosition < moveInput.value.length) {
    moveInput.setSelectionRange(currentPosition + 1, currentPosition + 1);
  }
  moveInput.focus();
});

/*
function oldProcessMoves(moves, state) {
    const mapping = {
      'A': 0, 'B': 1, 'C': 2, 'D': 3,
      '0': 4, '1': 5, '2': 6, '3': 7
    };
   let movesNum = moves.map(char => mapping[char]);
   let newState = startingState;
   for(let i = 0; i < movesNum.length; ++i)
   {
      newState = g[newState][movesNum[i]];
   }
   return newState;
}
*/
function processMoves(moves, state) {
  const mapping = {
    'A': 0, 'B': 1, 'C': 2, 'D': 3,
    '0': 4, '1': 5, '2': 6, '3': 7
  };
 let movesNum = moves.map(char => mapping[char]);
 let newState = startingState;
 for(let i = 0; i < movesNum.length; ++i)
 {
    //newState = g[newState][movesNum[i]];
    let agentPositions = getAgentPos(newState);
    let step = movesNum[i];
    for(let j = 0; j < numAgents; ++j)
    {
      let aPos = agentPositions[j];
      if(aPos >= N && spaceConditions[aPos - N][Math.floor(step / numberOfConditions)] === step % numberOfConditions) {
        newState -= N * Math.pow(numSquares, j);
      }
      else if(aPos + N < numSquares && spaceConditions[aPos + N][Math.floor(step / numberOfConditions)] === step % numberOfConditions) {
        newState += N * Math.pow(numSquares, j);
      }
      else if((aPos % N) > 0 && spaceConditions[aPos - 1][Math.floor(step / numberOfConditions)] === step % numberOfConditions) {        
        newState -= Math.pow(numSquares, j);
      }
      else if((aPos % N) < N - 1 && spaceConditions[aPos + 1][Math.floor(step / numberOfConditions)] === step % numberOfConditions) {
        newState += Math.pow(numSquares, j);
      }
    }
 }
 return newState;
}

function getAgentPos(state) {
  let arr = Array(numAgents);
  let s = state;
  for(let i = 0; i < numAgents; ++i)
  {
    arr[i] = s % numSquares;
    s = Math.floor(s / numSquares);
  }
  return arr;
}

function initializePuzzle(puzzle, isTheDaily = false) {
  N = puzzle.N;
  numAgents = puzzle.numAgents;
  startingState = puzzle.startingState;
  endState = puzzle.endState;
  spaceConditions = puzzle.spaceConditions;
  currentPuzzleId = puzzle.id;
  document.getElementById("practicePuzzleId").textContent = "Puzzle ID: " + currentPuzzleId;
  moveInput.value = "";
  document.getElementById("inputLength").textContent = 0;
  moveInput.disabled = false;
  moveInput.focus();
  buttons.forEach(button => {
    button.disabled = false;
  });
  if(!isTheDaily) {
    updateUrl(currentPuzzleId);
  }
  else {
    clearUrlParams();
  }
  //g = puzzle.g;
}

/*
async function loadPuzzle(puzzleId){
  try {
    currentPuzzleId = puzzleId;
    const response = await fetch(`${API_URL}/api/puzzle/${puzzleId}`);
    const puzzle = await response.json();
    initializePuzzle(puzzle);
    gameState = startingState;
    numSquares = N * N;
    createGrid(N);
    cssAdjustments();
    submitAvailabilityCheck();

    console.log(puzzle);
  } catch (error) {
    console.error('Error fetching puzzle:', error);
  }
}
*/

function adjustGridGap() {
  const grid = document.getElementById('grid');
  const gridCells = document.querySelectorAll('.grid-cell');
  
  // Assuming all grid cells have the same size, we can get the size of the first cell
  const cellSize = gridCells[0].getBoundingClientRect().width; // Get the width of the first grid cell

  // Calculate the gap as 10% of the cell size
  const gapSize = cellSize * 0.1; // 10% of the cell's width
  
  // Set the grid gap dynamically
  grid.style.gap = `${gapSize}px`;
}

// Run again on window resize to adjust for changes

function cssAdjustments() {
  adjustFontSize();
  adjustBorders();
  adjustBorderRadius();
  adjustGridGap();
  updateColors(gameState);
}

function adjustFontSize() {
  const gridCells = document.querySelectorAll('.grid-cell');

  gridCells.forEach(cell => {
    const cellHeight = cell.offsetHeight;
    const fontSize = cellHeight * 0.5;  // 50% of the cell height

    cell.style.fontSize = `${fontSize}px`;
  });
}

function adjustBorders() {
  const gridCells = document.querySelectorAll('.grid-cell');
  
  gridCells.forEach(cell => {
    const cellSize = cell.getBoundingClientRect().width; // Get the width of the cell
    const borderWidth = cellSize * 0.03; // 1% of the cell width for normal border
    const targetBorderWidth = cellSize * 0.06; // 3% of the cell width for target border

    // Set normal border width
    cell.style.borderWidth = `${borderWidth}px`;

    // For target classes, adjust the border width
    const targetClassList = cell.classList;
    targetClassList.forEach(className => {
      if (className.startsWith('target-')) {
        const targetCell = document.getElementById(cell.id);
        targetCell.style.borderWidth = `${targetBorderWidth}px`;
      }
    });
  });
}

function adjustBorderRadius() {
  const gridCells = document.querySelectorAll('.grid-cell');
  
  gridCells.forEach(cell => {
    const cellSize = cell.getBoundingClientRect().width; // Get the width of the cell
    const borderRadius = cellSize * 0.1; // 10% of the cell width for border-radius
    
    // Set the border-radius dynamically
    cell.style.borderRadius = `${borderRadius}px`;
  });
}

function initializeSolutionInfo(solution, userSolLen) {
 document.getElementById("dialogPuzzleId").textContent = "Puzzle ID: " + currentPuzzleId;
 document.getElementById("ySolLenStr").textContent = "You got it in " + userSolLen + " moves.";
 document.getElementById("optSolLenStr").textContent = "The optimal solution is " + solution.solutionLength + " moves.";
 document.getElementById("revealOpt").addEventListener("click", () => {
  document.getElementById("optSol").textContent = "An optimal solution: " + solution.optimalSolution;
  document.getElementById("optSol").style.display = "grid";
  document.getElementById("revealOpt").style.display = "none";        
});
}

function initializeSuccessDialog() {
  document.getElementById("successDialog").style.display = "block";
  document.getElementById("closeDialog").removeEventListener("click", onCloseDialog);
  document.getElementById("closeDialog").addEventListener("click", onCloseDialog);
  document.getElementById("practiceBtn").removeEventListener('click', onPracticeButtonClicked);          
  document.getElementById("practiceBtn").addEventListener('click', onPracticeButtonClicked); 
}

function initializeDailySolutionInfo(success) {
  document.getElementById("ddTotalSolved").textContent = getSolvedCount();
  document.getElementById("ddTotalOptimal").textContent = getOptimalSolvedCount();
  document.getElementById("ddStreak").textContent = getStreak();
  
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {   
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  document.getElementById("ddDate").textContent = formattedDate;

  if(success && getUserDailySolution().length === getOptimalSolutionCookie().length) {
    document.getElementById("ddFoundOpt").textContent = "✨You found an optimal solution!✨";
    document.getElementById("ddUserSolLabel").textContent = "🥳 Your Solution:";
    document.getElementById("ddUserSolLenStr").textContent = "(+" + (getUserDailySolution().length - getOptimalSolutionCookie().length) + ")";
    document.getElementById("ddUserSol").textContent = getUserDailySolution();
    document.getElementById("ddRevealOpt").style.display = "none";
    document.getElementById("ddOptSol").style.display = "none";
  }
  else if(success) {    
    document.getElementById("ddUserSolLabel").textContent = "🥳 Your Solution:";
    document.getElementById("ddUserSolLenStr").textContent = "(+" + (getUserDailySolution().length - getOptimalSolutionCookie().length) + ")";
    document.getElementById("ddUserSol").textContent = getUserDailySolution();
    try {
      document.getElementById("ddFoundOpt").remove();
    } catch (error) {  
    }
  }
  else {
    document.getElementById("ddUserSolLabel").textContent = "You gave up 😭";
    document.getElementById("ddRevealOpt").style.display = "none";
    document.getElementById("ddOptSol").style.display = "grid";   
    try {
      document.getElementById("ddFoundOpt").remove();
    } catch (error) {  
    }
  }

  document.getElementById("ddOptSolLenStr").textContent = getOptimalSolutionCookie().length;
  document.getElementById("ddOptSol").textContent = getOptimalSolutionCookie();
  document.getElementById("ddRevealOpt").addEventListener("click", () => {
    document.getElementById("ddOptSol").textContent = getOptimalSolutionCookie();;
    document.getElementById("ddOptSol").style.display = "grid";
    document.getElementById("ddRevealOpt").style.display = "none";        
  });
  document.getElementById("ddShareBtn").removeEventListener("click", onShareButtonClicked);
  document.getElementById("ddShareBtn").addEventListener("click", onShareButtonClicked);
  setShareString(getUserDailySolution(), getOptimalSolutionCookie());
  updateCountdown();
}

function initializeDailyDialog() {
  document.getElementById("dailyDialog").style.display = "block";
  document.getElementById("ddCloseDialog").removeEventListener("click", onCloseDailyDialog);
  document.getElementById("ddCloseDialog").addEventListener("click", onCloseDailyDialog);
  document.getElementById("ddPracticeBtn").removeEventListener('click', onDailyPracticeButtonClicked);          
  document.getElementById("ddPracticeBtn").addEventListener('click', onDailyPracticeButtonClicked); 
}

function updateCountdown() {
  const now = new Date();
  const nextMidnight = new Date();
  nextMidnight.setHours(24, 0, 0, 0); // Midnight

  const diff = nextMidnight - now;
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  document.getElementById("ddCountdown").textContent =
    `⏳ Next puzzle in: ${hours}h ${minutes}m ${seconds}s`;

  setTimeout(updateCountdown, 1000);
}

function onShareButtonClicked() {
  // Assuming shareString is the string you want to copy
  navigator.clipboard.writeText(shareString)
    .then(() => {
      console.log('Share string copied to clipboard!');
      
      // Show the toast
      const toast = document.getElementById('toast');
      toast.classList.add('show');
      
      // Hide the toast after 3 seconds
      setTimeout(() => {
        toast.classList.remove('show');
      }, 3000);
    })
    .catch(err => {
      console.error('Failed to copy: ', err);
      // Optionally, show an error message in the toast
      const toast = document.getElementById('toast');
      toast.textContent = 'Failed to copy to clipboard.';
      toast.classList.add('show');
      
      setTimeout(() => {
        toast.classList.remove('show');
      }, 3000);
    });
}

function setShareString(userSolution, optimalSolution) {
  let arr = getColorMapping(endState);
  const emojiMap = {
    0: '⬛️',
    1: '🟨',
    2: '🟥',
    3: '🟦',
    4: '🟪',
    5: '🟧'
  };
  let result = 'Daily Orders\n';
  const date = new Date();
  const dateString = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  result += dateString + '\n';
  for (let i = 0; i < N; i++) {
    let row = '';
    for (let j = 0; j < N; j++) {
      const index = i * N + j;
      row += emojiMap[arr[index]];
    }
    result += row + '\n';
  }
  if(!userSolution) {
    result += "🥺I gave up😭\n"
  }
  else if(userSolution.length === optimalSolution.length) {
    result += "I found an ✨Optimal Solution✨\n"
  }
  else {
    result += "I was ";
    result += userSolution.length - optimalSolution.length;
    result += " steps away from the optimal solution.\n"
  }
  result += `\nPlay at: ${window.location.href}`;
  shareString = result;
}

function initializeFailureSolutionInfo(solution) {
 document.getElementById("failureDialogPuzzleId").textContent = "Puzzle ID: " + currentPuzzleId; 
 document.getElementById("failureOptSolLenStr").textContent = "The optimal solution is " + solution.solutionLength + " moves.";
 document.getElementById("failureOptSol").textContent = "An optimal solution: " + solution.optimalSolution;
}

function onCloseDialog() {
  document.getElementById("dialogPuzzleId").textContent = "";
  document.getElementById("ySolLenStr").textContent = "";
  document.getElementById("optSolLenStr").textContent = "";
  document.getElementById("optSol").style.display = "none";
  document.getElementById("revealOpt").style.display = "grid";    
  document.getElementById("successDialog").style.display = "none";
 }

function onCloseDailyDialog() {
 document.getElementById("ddUserSolLenStr").textContent = "";
 document.getElementById("ddOptSolLenStr").textContent = "";
 document.getElementById("ddOptSol").style.display = "none";
 document.getElementById("ddRevealOpt").style.display = "grid";    
 document.getElementById("dailyDialog").style.display = "none";
}

function onCloseFailureDialog() {
  document.getElementById("failureDialogPuzzleId").textContent = "";  
  document.getElementById("failureOptSolLenStr").textContent = "";
  document.getElementById("failureOptSol").textContent = "";
  document.getElementById("failureDialog").style.display = "none";
 }

submitButton.addEventListener("click", function () {
  const clientDate = new Date().toISOString().split("T")[0];  
  const cursorPosition = moveInput.selectionStart;  // Get cursor position
    const inputSubstring = moveInput.value.substring(0, cursorPosition); // Extract substring    
    const payload = {
        puzzleId: currentPuzzleId,          
        input: inputSubstring,
        dailyAttempted: hasAttemptedDailyPuzzle(),
        clientLocalDate: clientDate
    };

    //console.log(JSON.stringify(payload));

    fetch(`${API_URL}/verify-solution`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        if(data.canIncrement) {
          markPuzzleSolved(data.isOptimal);
          setDailyPuzzleAttempted();
          incrementStreak();
        }      
        if (data.success) {
          getSolutionByKey(data.key).then(loadedSolution => {
            currentSolution = loadedSolution;

            if(data.isDaily) {
              setUserDailySolution(inputSubstring);
              setDailySuccess(true);
              setDailyOptimal(data.isOptimal);
              setOptimalSolutionCookie(loadedSolution.optimalSolution);
              initializeDailySolutionInfo(true);
              initializeDailyDialog();
            }
            else {                      
              initializeSolutionInfo(loadedSolution, inputSubstring.length);    
              initializeSuccessDialog();
            }
          });                              
        } else {
            alert("Incorrect. Try again!");
        }
       
    })
    .catch(error => console.error("Error:", error));
});

function onPracticeButtonClicked() {
  initializePracticeMode();
  onCloseDialog();
}

function onDailyPracticeButtonClicked() {
  initializePracticeMode();
  onCloseDailyDialog();
}

function onFailurePracticeButtonClicked() {
  initializePracticeMode();
  onCloseFailureDialog();
}

async function getSolutionByKey(key){
  const payload = {
    key: key
  };

  const response = fetch(`${API_URL}/getSolutionById`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })
  const data = (await response).json();
  return data;
}

function initializePracticeMode(query = "") {
  document.getElementById("topTitle").style.display = "none";
  if(query === "") {
    loadRandomPracticePuzzle();
  }
  else {
    loadPuzzleFromId(query);
  }
  const pid = document.getElementById("practicePuzzleId");
  pid.style.display = "grid";
  document.getElementById("newPuzzleButton").style.display = "grid";
  document.getElementById("puzzleByIdButton").style.display = "grid";
  document.getElementById("newPuzzleButton").removeEventListener("click", onNewButtonClicked);
  document.getElementById("newPuzzleButton").addEventListener("click", onNewButtonClicked);
  document.getElementById("puzzleByIdButton").removeEventListener("click", openIdDialog);
  document.getElementById("puzzleByIdButton").addEventListener("click", openIdDialog);
}

function onNewButtonClicked() {
  clearUrlParams();
  initializePracticeMode();
}

function openIdDialog() {
  document.getElementById("idDialog").style.display = "block";
  document.getElementById("closeIdDialog").removeEventListener("click", onCloseIdDialog);
  document.getElementById("closeIdDialog").addEventListener("click", onCloseIdDialog);
  document.getElementById("idLoadButton").addEventListener('click', () => {
    let id = document.getElementById("idInput").value.toUpperCase();
    //clearUrlParams();
    loadPuzzleFromId(id);
    onCloseIdDialog();
  });
  document.getElementById("idInput").focus();
}

function onCloseIdDialog() {
  document.getElementById("idDialog").style.display = "none";
}

function onGiveUp() {
  moveInput.disabled = true;
  buttons.forEach(button => {
    button.disabled = true;
  });

  const clientDate = new Date().toISOString().split("T")[0];
  const payload = {
    puzzleId: currentPuzzleId,  
    clientLocalDate: clientDate        
  };

  fetch(`${API_URL}/give-up`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json" 
    },
    body: JSON.stringify(payload)
  }) 
  .then(response => response.json())
  .then(data => {
    //console.log("Response from backend:", data);
    
    getSolutionByKey(data.key).then(loadedSolution => {    
      currentSolution = loadedSolution;
      if(data.dailyAttempt) {
        setDailyPuzzleAttempted();
        setDailySuccess(false);
        setDailyOptimal(false);
        setOptimalSolutionCookie(loadedSolution.optimalSolution);
        initializeDailySolutionInfo(false);
        initializeDailyDialog();
      }
      else{
        initializeFailureSolutionInfo(loadedSolution); 
        document.getElementById("failureDialog").style.display = "block";
        document.getElementById("failureCloseDialog").addEventListener("click", () => {
          onCloseFailureDialog();          
        });
        document.getElementById("failurePracticeBtn").removeEventListener('click', onFailurePracticeButtonClicked);          
        document.getElementById("failurePracticeBtn").addEventListener('click', onFailurePracticeButtonClicked);  
      }           
    });          

           
  })
  .catch(error => console.error("Error:", error));
}

function loadPuzzleFromId(puzzleId) {
  const payload = {
    puzzleId: puzzleId             
  };

  fetch(`${API_URL}/getPuzzleById`, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })
  .then(response => response.json())
  .then(data => {
    initializePuzzle(data);
    gameState = startingState;
    numSquares = N * N;
    createGrid(N);
    cssAdjustments();
    submitAvailabilityCheck();
  })
  .catch(error => {
    console.error('Error fetching puzzle:', error);
  });
}

function loadRandomPracticePuzzle() {
  fetch(`${API_URL}/getRandomPracticePuzzle`, {
    method: 'POST'      
  })
  .then(response => response.json())
  .then(data => {
    initializePuzzle(data);
    gameState = startingState;
    numSquares = N * N;
    createGrid(N);
    cssAdjustments();
    submitAvailabilityCheck();
  })
  .catch (error => {
    console.error('Error fetching puzzle:', error);
  });
}

async function loadDaily() {
  const clientDate = new Date().toISOString().split("T")[0];

  try {
    const response = await fetch(`${API_URL}/getDailyPuzzle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientLocalDate: clientDate }),
    });    
    const data = await response.json();

    if (!data) throw new Error("Failed to load daily puzzle.");
 
    await new Promise((resolve) => {
      initializePuzzle(data, true);
      resolve();
    });

    gameState = startingState;
    numSquares = N * N;
    createGrid(N);
    cssAdjustments();
    submitAvailabilityCheck();

    return data;
  } catch (error) {
    return null;
  }
}


function updateUrl(puzzleId) {  
  const params = new URLSearchParams(window.location.search);
  params.delete("puzzle");
  params.set("puzzle", puzzleId);  
  window.history.replaceState({}, "", `${window.location.pathname}?${params}`);
}

function clearUrlParams() {
  const params = new URLSearchParams(window.location.search);
  params.delete("puzzle");
}

function setCookie(name, value, days) {
  let expires = "";
  if (days) {
      let date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie(name) {
  let nameEQ = name + "=";
  let cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
      let c = cookies[i].trim();
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
  }
  return null;
}

function deleteCookie(name) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

function checkFirstVisit() {
  if (!getCookie("visitedBefore")) {
      setCookie("visitedBefore", "true", 365);
      howToDialog();      
  }
  else {
    deleteCookie("visitedBefore");
    setCookie("visitedBefore", "true", 365);
  }
}

function hasAttemptedDailyPuzzle() {
  return getCookie("dailyPuzzleAttempted") !== null;
}

function setDailyPuzzleAttempted() {
  let now = new Date();
  let midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0); // Set time to midnight

  document.cookie = `dailyPuzzleAttempted=true; expires=${midnight.toUTCString()}; path=/`;
}

function setUserDailySolution(moves) {
  let now = new Date();
  let midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0); // Set time to midnight

  document.cookie = `userDailySolution=${moves}; expires=${midnight.toUTCString()}; path=/`;
}

function getUserDailySolution() {  
  return getCookie("userDailySolution");
}

function setDailySuccess(success) {
  let now = new Date();
  let midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0); // Set time to midnight

  document.cookie = `dailySuccess=${success}; expires=${midnight.toUTCString()}; path=/`;
}

function getDailySuccess() {
  return getCookie("dailySuccess") === "true";
}

function setDailyOptimal(isOptimal) {
  let now = new Date();
  let midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0); // Set time to midnight

  document.cookie = `dailyOptimal=${isOptimal}; expires=${midnight.toUTCString()}; path=/`;
}

function getDailyOptimal() {
  return getCookie("dailyOptimal");
}

function incrementStreak() {
  let currStreak = getStreak() + 1;
  let now = new Date();
  let midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0); // Set time to midnight
  midnight.setDate(midnight.getDate() + 1);  
  document.cookie = `streak=${currStreak}; expires=${midnight.toUTCString()}; path=/`;
}

function getStreak() {
  return parseInt(getCookie("streak")) || 0;
}

function setOptimalSolutionCookie(solutionString){
  let now = new Date();
  let midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0); // Set time to midnight
  document.cookie = `optimalSolution=${solutionString}; expires=${midnight.toUTCString()}; path=/`;
}

function getOptimalSolutionCookie() {
  return getCookie("optimalSolution");
}

function incrementCookieValue(cookieName) {
  let currentValue = parseInt(getCookie(cookieName)) || 0;
  setCookie(cookieName, currentValue + 1, 365);
}

function getSolvedCount() {
  return parseInt(getCookie("dailyPuzzlesSolved")) || 0;
}

function getOptimalSolvedCount() {
  return parseInt(getCookie("optimalSolutions")) || 0;
}

function markPuzzleSolved(isOptimal) {
  incrementCookieValue("dailyPuzzlesSolved");
  if (isOptimal) {
      incrementCookieValue("optimalSolutions");
  }
}

function howToDialog() {
  //Setja upp html og þetta...
}

// Run again on window resize to adjust for changes
window.addEventListener('resize', adjustBorderRadius);

// Run again on window resize to adjust for changes
window.addEventListener('resize', adjustBorders);

// Call the function initially and on window resize
window.addEventListener('resize', adjustFontSize);

window.addEventListener('resize', adjustGridGap);

document.getElementById("giveUpButton").addEventListener("click", onGiveUp);

//loadPuzzle(0);
//loadPuzzle(currentPuzzleId);

async function startUp() {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("puzzle");

  if(query) {
    initializePracticeMode(query);
    moveInput.focus();
  }
  else {
    await loadDaily();
    if(hasAttemptedDailyPuzzle()) {              
      initializeDailyDialog();
      initializeDailySolutionInfo(getDailySuccess());
      if(getDailySuccess()) {        
        moveInput.value = getUserDailySolution();      
      }      
    }
    else {
      moveInput.focus();
    }
  }
  checkFirstVisit();  
}

startUp();
