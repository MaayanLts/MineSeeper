'use strict'

const LEFT_CLICK = 1
const RIGHT_CLICK = 3
const BEGINNER_LEVEL = 4
const INTERMEDIATE_LEVEL = 8
const EXPERT_LEVEL = 12

var gBoard = []
var gLevel = {
    size: 4,
    mines: 2
}
var gMinesLocations = []
var gIsGameOver
var gIsVictory
var gIsFirstClick
var gGameStart

function changeGameLevel(boardSize, minesCount) {
    gLevel.size = boardSize
    gLevel.mines = minesCount

    setSoldierLevelImage()
    restartGame()
}

function restartGame() {
    var elmEmoji = document.querySelector('.emoji')
    elmEmoji.src = 'img/emjStartGame.png'
    elmEmoji.setAttribute('emoji-level', 0)

    updateLifes()
    initGame()
}

function initGame() {
    gBoard = []
    gMinesLocations = []
    gIsFirstClick = true
    gIsGameOver = false
    gIsVictory = false
    gGameStart = new Date()

    createEmptyBoard()
    renderBoard()
    startTimer()
}

function updateLifes() {
    var elmts = document.querySelectorAll('.heart')
    for (var i = 0; i < elmts.length; i++) {
        elmts[i].classList.add('life');
        elmts[i].src = 'img/heartLife.png'
    }
}

function renderBoard() {
    var strHTML = '';

    for (var i = 0; i < gBoard.length; i++) {
        strHTML += `<tr>\n`

        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j];
            var cellClasses = classesName(cell)
            var elmImg = '';
            if (cellClasses === 'cell shown mine')
                elmImg = "<img src='img/bomb.png' style='width: 45px;' />";
            if (cellClasses === 'cell shown mine exploded')
                elmImg = "<img src='img/explosion.png' style='width: 50px;' />";
            if (cellClasses === 'cell marked')
                elmImg = "<img src='img/flag.png' style='width: 40px;' />";

            var data = displayData(cell)
            strHTML += `\t<td class="${classesName(cell)}" oncontextmenu='return false' onmousedown="cellClicked(event, ${i}, ${j})" >${data}${elmImg}</td>\n`
        }

        strHTML += `</tr>\n`
    }

    var elmMinesField = document.querySelector('.minesField');
    elmMinesField.innerHTML = strHTML;
}

function cellClicked(event, i, j) {
    event.preventDefault()

    if (gIsFirstClick) {
        mineField({ i, j })
        gIsFirstClick = false
    }

    var clickedCell = gBoard[i][j]
    if (clickedCell.isShown || clickedCell.isExploded) {
        return
    }

    if (event.which === LEFT_CLICK) {
        clickedCell.isMarked = false
        clickedCell.isShown = true

        if (clickedCell.isMine) {
            checkGameOver(i, j)
        } else {
            if (gBoard[i][j].minesAroundCount === 0) {
                uncoverNeighbours(i, j)
            }
        }
    }
    else if (event.which === RIGHT_CLICK) {
        //Mark/Unmark cell
        if (gIsVictory || gIsGameOver) {
            return
        }

        clickedCell.isMarked = !clickedCell.isMarked
    }

    checkVictory()
    renderBoard()
}

function checkGameOver(i, j) {
    gBoard[i][j].isExploded = true
    var elmLife = document.querySelector('.heart.life')
    var elmEmoji = document.querySelector('.emoji')

    if (!elmLife) {
        gIsGameOver = true
        elmEmoji.src = 'img/emjGameOver.png'
    } else {
        elmLife.classList.remove('life')
        elmLife.src = 'img/heartDead.png'

        var emjLevel = + elmEmoji.getAttribute('emoji-level')
        if (emjLevel === 0) {
            elmEmoji.src = 'img/emjMistake1.png'
            elmEmoji.setAttribute('emoji-level', 1)
        } else if (emjLevel === 1) {
            elmEmoji.src = 'img/emjMistake2.png'
            elmEmoji.setAttribute('emoji-level', 2)
        } else if (emjLevel === 2) {
            elmEmoji.src = 'img/emjMistake3.png'
            elmEmoji.setAttribute('emoji-level', 3)
        }
    }

}

function checkVictory() {
    //Check if exists unmarked and uncover mines
    var isUncoverMinesExist = false
    for (var i = 0; i < gMinesLocations.length; i++) {
        var cell = gBoard[gMinesLocations[i].i][gMinesLocations[i].j]
        isUncoverMinesExist = (cell.isMine && !cell.isExploded && !cell.isMarked && !cell.isShown)
        if (isUncoverMinesExist) {
            break
        }
    }

    gIsVictory = !isUncoverMinesExist

    if (gIsVictory) {
        var elmEmoji = document.querySelector('.emoji')
        elmEmoji.src = 'img/emjVictory.png'
    }
}

function uncoverNeighbours_Prev(i, j) {
    uncover(i - 1, j - 1);
    uncover(i - 1, j);
    uncover(i - 1, j + 1);

    uncover(i, j - 1);
    uncover(i, j + 1);

    uncover(i + 1, j - 1);
    uncover(i + 1, j);
    uncover(i + 1, j + 1);
}

function uncoverNeighbours(i, j) {
    if (gBoard[i][j].isMarked || gBoard[i][j].isMine)
        return

    gBoard[i][j].isShown = true
    gBoard[i][j].isMarked = false

    uncoverRight(i, j + 1)
    uncoverLeft(i, j - 1)

    uncoverUp(i - 1, j)
    uncoverDown(i + 1, j)
}

function uncoverUp(i, j) {
    if (i < 0)
        return;

    if (gBoard[i][j].isMarked || gBoard[i][j].isMine)
        return

    gBoard[i][j].isShown = true
    gBoard[i][j].isMarked = false

    if (gBoard[i][j].minesAroundCount == 0) {
        uncoverRight(i, j + 1)
        uncoverLeft(i, j - 1)
        uncoverUp(i - 1, j)
    }
}

function uncoverDown(i, j) {
    if (i > gBoard.length - 1)
        return;

    if (gBoard[i][j].isMarked || gBoard[i][j].isMine)
        return

    gBoard[i][j].isShown = true
    gBoard[i][j].isMarked = false

    if (gBoard[i][j].minesAroundCount == 0) {
        uncoverRight(i, j + 1)
        uncoverLeft(i, j - 1)
        uncoverDown(i + 1, j)
    }
}

function uncoverRight(i, j) {
    if (j > gBoard.length - 1)
        return;

    if (gBoard[i][j].isMarked || gBoard[i][j].isMine)
        return

    gBoard[i][j].isShown = true
    gBoard[i][j].isMarked = false

    if (gBoard[i][j].minesAroundCount == 0)
        uncoverRight(i, j + 1)
}

function uncoverLeft(i, j) {
    if (j < 0)
        return;

    if (gBoard[i][j].isMarked || gBoard[i][j].isMine)
        return

    gBoard[i][j].isShown = true
    gBoard[i][j].isMarked = false

    if (gBoard[i][j].minesAroundCount == 0)
        uncoverLeft(i, j - 1)
}

function displayData(cell) {
    var data = ''
    if (!cell.isMine && (cell.isShown || gIsGameOver || gIsVictory)) {
        if (cell.minesAroundCount > 0)
            data = cell.minesAroundCount
    }

    return data;
}

function classesName(cell) {
    var classes = 'cell';

    //Marked cell always unshown
    if (cell.isMarked && !(gIsGameOver || gIsVictory)) {
        classes += ' marked'
    }
    else if (cell.isShown || gIsGameOver || gIsVictory) {
        classes += ' shown'

        if (cell.isMine) {
            classes += ' mine'
        }

        if (cell.isExploded) {
            classes += ' exploded'
        }
    }

    return classes;
}

function startTimer() {
    // Update the count down every 1 second
    var x = setInterval(function () {
        // Get today's date and times
        var now = (new Date() - gGameStart) 
        var minutes = Math.floor(now/60000)
        var seconds = Math.floor(now/1000) - minutes*60

        minutes = minutes < 10 ? '0'+minutes : minutes
        seconds = seconds < 10 ? '0'+seconds : seconds

        document.querySelector(".timer").innerHTML = `${minutes} : ${seconds}`
    }, 1000);
}

function setSoldierLevelImage() {
    var solderImg = document.querySelector('.solder');
    if (gLevel.size === BEGINNER_LEVEL) {
        solderImg.src = '../img/solderBeginner.png'
    } else if (gLevel.size === INTERMEDIATE_LEVEL) {
        solderImg.src = '../img/solderInterm.png'
    } else if (gLevel.size === EXPERT_LEVEL) {
        solderImg.src = '../img/solderExpert.png'
    }
}