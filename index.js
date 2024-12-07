// Global player count
let playerCount = 0;

// Function to add a new player row
const addPlayer = () => {
    const playerRows = document.querySelector('#playerRows');

    // Prevent adding more than 8 players
    if (playerCount >= 8) {
        alert("Maximum of 8 players allowed!");
        return;
    }

    // Increment player count
    playerCount++;

    // Create a new row for the player
    const newRow = document.createElement('tr');
    newRow.classList.add('playerRow');

    // Add content to the row
    newRow.innerHTML = `
        <td contenteditable="true" class="playerName"><b>Player ${playerCount}</b></td>
        ${Array.from({ length: 9 }, () => `
            <td>
                <input type="text" maxlength="1" class="roll" style="border-color:black;">
                <input type="text" maxlength="1" class="roll" style="border-color:black;">
                <span class="frameTotal"></span>
            </td>
        `).join('')}
        <td>
            <input type="text" maxlength="1" class="roll" style="border-color:black;">
            <input type="text" maxlength="1" class="roll" style="border-color:black;">
            <input type="text" maxlength="1" class="roll" style="border-color:black;">
            <span class="frameTotal"></span>
        </td>
    `;

    // Append the new row
    playerRows.appendChild(newRow);

    // Reapply styles to all rows
    applyRowStyles();
};

// Function to clear the scorecard and start a new game
const newGame = () => {
    const playerRows = document.querySelector('#playerRows');
    playerRows.innerHTML = ''; // Clear all existing rows
    playerCount = 0; // Reset the player count
};

// Function to apply alternating styles to player rows
const applyRowStyles = () => {
    const playerRows = document.querySelectorAll('.playerRow');
    playerRows.forEach((row, index) => {
        const isEven = index % 2 === 0;

        // Apply background and text color for the row
        row.style.backgroundColor = isEven ? '#B62626' : '#F3DA73';
        row.style.color = isEven ? '#F3DA73' : '#B62626';

        // Apply style to player name cell
        const playerName = row.querySelector('.playerName');
        playerName.style.backgroundColor = row.style.backgroundColor;
        playerName.style.color = row.style.color;
        playerName.style.fontWeight = 'bold'; // Make player name bold

        // Ensure input text matches the row text color
        row.querySelectorAll('input').forEach(input => {
            input.style.color = row.style.color;
            input.style.backgroundColor = 'transparent'; // Transparent background
        });
    });
};

// Function to update scores dynamically
const updateScores = (row) => {
    const cells = row.querySelectorAll('td');
    let cumulativeScore = 0;
    const rolls = [];

    // Parse rolls for scoring (Frames 1–10)
    for (let i = 1; i <= 10; i++) {
        const inputs = cells[i].querySelectorAll('input');
        const roll1 = inputs[0]?.value.trim().toUpperCase() || "";
        const roll2 = inputs[1]?.value.trim().toUpperCase() || "";
        const roll3 = inputs[2]?.value.trim().toUpperCase() || ""; // For 10th frame only

        if (i === 10) {
            // Handle Frame 10 (up to 3 rolls)
            if (roll1 === 'X') rolls.push(10);
            else rolls.push(parseInt(roll1) || 0);

            if (roll2 === 'X') rolls.push(10);
            else if (roll2 === '/') rolls.push(10 - rolls[rolls.length - 1]);
            else rolls.push(parseInt(roll2) || 0);

            if (roll3 === 'X') rolls.push(10);
            else if (roll3 === '/') rolls.push(10 - rolls[rolls.length - 1]);
            else rolls.push(parseInt(roll3) || 0);
        } else {
            // Handle Frames 1–9
            if (roll1 === 'X') {
                rolls.push(10); // Strike
            } else if (roll2 === '/') {
                const firstRoll = parseInt(roll1) || 0;
                rolls.push(firstRoll, 10 - firstRoll); // Spare
            } else {
                rolls.push(parseInt(roll1) || 0, parseInt(roll2) || 0); // Open frame
            }
        }
    }

    // Calculate cumulative scores
    for (let frameIndex = 0, i = 0; frameIndex < 10; frameIndex++) {
        const roll1 = rolls[i];
        const roll2 = rolls[i + 1] || 0;
        const roll3 = rolls[i + 2] || 0;
        const frameTotal = cells[frameIndex + 1]?.querySelector('.frameTotal');

        // Strike
        if (roll1 === 10) {
            cumulativeScore += 10 + roll2 + roll3;
            if (frameIndex < 9) {
                if (roll2 !== 0 && roll3 !== 0) {
                    frameTotal.textContent = cumulativeScore; // Show score if strike bonuses exist
                } else {
                    frameTotal.textContent = ""; // Hide if incomplete
                }
            }
            i += 1; // Move to the next roll
        }
        // Spare
        else if (roll1 + roll2 === 10) {
            cumulativeScore += 10 + roll3;
            if (frameIndex < 9) {
                if (roll3 !== 0) {
                    frameTotal.textContent = cumulativeScore; // Show score if spare bonus exists
                } else {
                    frameTotal.textContent = ""; // Hide if incomplete
                }
            }
            i += 2; // Move to the next frame
        }
        // Open Frame
        else {
            cumulativeScore += roll1 + roll2;
            if (frameIndex < 9) {
                if (roll1 !== 0 || roll2 !== 0) {
                    frameTotal.textContent = cumulativeScore;
                } else {
                    frameTotal.textContent = ""; // Hide if incomplete
                }
            }
            i += 2; // Move to the next frame
        }

        // Special handling for Frame 10
        if (frameIndex === 9) {
            const frame10Rolls = rolls.slice(i); // Extract rolls for the 10th frame
            const frame10Score = frame10Rolls.reduce((sum, roll) => sum + roll, 0);

            cumulativeScore += frame10Score;

            // Always display cumulative score in Frame 10
            if (frameTotal) frameTotal.textContent = cumulativeScore;

            break; // Stop after processing the 10th frame
        }
    }
};

// Event listener for adding players
document.getElementById('addPlayer').addEventListener('click', () => {
    addPlayer(); // Add a single player
});

// Event listener to start a new game
document.getElementById('newGame').addEventListener('click', () => {
    newGame(); // Reset the scorecard
});

// Event listener to update scores dynamically
document.querySelector('#playerRows').addEventListener('input', (e) => {
    const row = e.target.closest('.playerRow');
    if (row) updateScores(row);
});
