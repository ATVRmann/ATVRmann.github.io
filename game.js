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
  /*
        <p id="ySolLenStr"></p>
        <p id="optSolLenStr"></p>
        <p id="optSol"></p>
  */
 document.getElementById("dialogPuzzleId").textContent = "Puzzle ID: " + currentPuzzleId;
 document.getElementById("ySolLenStr").textContent = "You got it in " + userSolLen + " moves.";
 document.getElementById("optSolLenStr").textContent = "The optimal solution is " + solution.solutionLength + " moves.";
 document.getElementById("revealOpt").addEventListener("click", () => {
  document.getElementById("optSol").textContent = "An optimal solution: " + solution.optimalSolution;
  document.getElementById("optSol").style.display = "grid";
  document.getElementById("revealOpt").style.display = "none";        
});
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

function onCloseFailureDialog() {
  document.getElementById("failureDialogPuzzleId").textContent = "";  
  document.getElementById("failureOptSolLenStr").textContent = "";
  document.getElementById("failureOptSol").textContent = "";
  document.getElementById("failureDialog").style.display = "none";
 }

submitButton.addEventListener("click", function () {
  const cursorPosition = moveInput.selectionStart;  // Get cursor position
    const inputSubstring = moveInput.value.substring(0, cursorPosition); // Extract substring    
    const payload = {
        puzzleId: currentPuzzleId,          
        input: inputSubstring
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
        //console.log("Response from backend:", data);

        if (data.success) {

          getSolutionByKey(data.key).then(loadedSolution => {
            currentSolution = loadedSolution;
            initializeSolutionInfo(loadedSolution, inputSubstring.length);            
          });          

          document.getElementById("successDialog").style.display = "block";
          document.getElementById("closeDialog").addEventListener("click", () => {
            onCloseDialog();          
          });
          document.getElementById("practiceBtn").addEventListener('click', () => {
            initializePracticeMode();
            onCloseDialog();
          });          
        } else {
            alert("Incorrect. Try again!");
        }
       
    })
    .catch(error => console.error("Error:", error));
});

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
    console.log("yes");
  }
  else {
    loadPuzzleFromId(query);
    console.log("here");
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


  const payload = {
    puzzleId: currentPuzzleId,          
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
      initializeFailureSolutionInfo(loadedSolution);            
    });          

    document.getElementById("failureDialog").style.display = "block";
    document.getElementById("failureCloseDialog").addEventListener("click", () => {
      onCloseFailureDialog();          
    });
    document.getElementById("failurePracticeBtn").addEventListener('click', () => {
      initializePracticeMode();
      onCloseFailureDialog();
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

async function loadDaily(){
  /*
  try {    
    const response = await fetch(`${API_URL}/getDailyPuzzle`);
    const puzzle = await response.json();
*/
    fetch(`${API_URL}/getDailyPuzzle`, {
      method: 'POST'      
    })
    .then(response => response.json())
    .then(data => {
      initializePuzzle(data, true);
      gameState = startingState;
      numSquares = N * N;
      createGrid(N);
      cssAdjustments();
      submitAvailabilityCheck();
    })
    .catch (error => {
      console.error('Error fetching puzzle:', error);
    });

/*
    initializePuzzle(puzzle);
    gameState = startingState;
    numSquares = N * N;
    createGrid(N);
    cssAdjustments();
    submitAvailabilityCheck();
    //console.log(puzzle);
  } catch (error) {
    console.error('Error fetching puzzle:', error);
  }
  */
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

moveInput.focus();


const params = new URLSearchParams(window.location.search);
const query = params.get("puzzle");

if(query) {
  initializePracticeMode(query);
}
else {
  loadDaily();
}
