let N = 3;
let numSquares = N * N;
let numAgents = 2;
const grid = document.getElementById("grid");
let startingState = 68;
let endState = 47;
let gameState = startingState;  // Initial game state
const moveInput = document.getElementById("moveInput");

let spaceConditions;
let g;

function createGrid(N) {
    grid.innerHTML = "";
    grid.style.gridTemplateColumns = `repeat(${N}, 150px)`;
    grid.style.gridTemplateRows = `repeat(${N}, 150px)`;
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
    if(counter < numAgents)
    {
      for(let i = 0; i < numSquares; ++i)
      {
          let cell = document.getElementById(`cell-${i}`);
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
    
    let newState = processMoves(moves, gameState);
    if (newState !== null) {
        gameState = newState;
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
        updateColors(newState);
    }
});

function processMoves(moves, state) {
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

function initializePuzzle(puzzle) {
  N = puzzle.N;
  numAgents = puzzle.numAgents;
  startingState = puzzle.startingState;
  endState = puzzle.endState;
  spaceConditions = puzzle.spaceConditions;
  g = puzzle.g;
}

async function loadPuzzle(puzzleId){
  try {
    //const response = await fetch(`http://localhost:3000/api/puzzle/${puzzleId}`);
    const response = await fetch(`https://orders-2gm0.onrender.com/api/puzzle/${puzzleId}`);
    const puzzle = await response.json();
    initializePuzzle(puzzle);
    gameState = startingState;
    numSquares = N * N;
    createGrid(N);
    updateColors(gameState);
  } catch (error) {
    console.error('Error fetching puzzle:', error);
  }
}

//loadPuzzle(0);
loadPuzzle(Math.floor(Math.random() * 7));