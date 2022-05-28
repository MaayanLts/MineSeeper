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
var gTimerInterval
var gIsFirstClick
var gGameStart
var gIsHintClicked
var gBoardStepsCount //for undo and hint
var gFlagedCellsCount

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
    displayHints()

    initGame()
}

function initGame() {
    gBoard = []
    gMinesLocations = []
    gIsFirstClick = true
    gIsGameOver = false
    gIsVictory = false
    gGameStart = new Date()
    gIsHintClicked = false
    gBoardStepsCount = 0

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
        if (gIsHintClicked) {
            uncoverNeighboursWithHint(i, j);
            hintUsed()
            return

        } else {
            clickedCell.isMarked = false
            clickedCell.isShown = true

            if (clickedCell.isMine) {
                gBoard[i][j].isExploded = true
                var explosionSound = new Audio('sound/mineExplosion.wav')
                explosionSound.play()

                checkGameOver(i, j)
            } else {
                if (gBoard[i][j].minesAroundCount === 0) {
                    uncoverNeighbours(i, j)
                }
            }

            checkVictory()
        }
    }
    else if (event.which === RIGHT_CLICK) {
        //Mark/Unmark cell
        if (gIsVictory || gIsGameOver) {
            return
        }

        clickedCell.isMarked = !clickedCell.isMarked
        if (clickedCell.isMine) {
            checkVictory()
        }
    }

    renderBoard()
}

function checkVictory() {
    //Check if exists unmarked and uncover mines
    //var isUnknownMinesExist = false
    var explodeMinesCount = 0
    //var flagedMinesCount = 0
    //var isAllMinesMarked = true
    var isAllMinesDiscoverd = true

    for (var i = 0; i < gMinesLocations.length; i++) {
        var cell = gBoard[gMinesLocations[i].i][gMinesLocations[i].j]

        var isCellDiscoverd = cell.isMarked || cell.isShown || cell.isExploded
        if(isAllMinesDiscoverd && !isCellDiscoverd){
            isAllMinesDiscoverd = cell.isMarked || cell.isShown || cell.isExploded
        }
        
        explodeMinesCount += cell.isExploded ? 1 : 0
        //isUnknownMinesExist = (!cell.isExploded || !cell.isMarked)
        //if (isUnknownMinesExist) {
        //    break
        //}


        //if (cell.isMine) {
        //flagedMinesCount += cell.isMarked ? 1 : 0
        //explodeMinesCount += cell.isExploded ? 1 : 0
        //isUncoverMinesExist = (!cell.isExploded && !cell.isMarked && !cell.isShown)

        // }
        //if(!cell.isMarked)
          //  isAllMinesMarked = false
    }

    // var isAllMinesFlaged = (flagedMinesCount === gLevel.mines)
    //gIsVictory = (!isUnknownMinesExist && !isExtraCellsFlaged())
    //gVIctory = !(isUnknownMinesExist || )

    gIsVictory = (isAllMinesDiscoverd && !isExtraCellsFlaged(explodeMinesCount)) || explodeMinesCount === gLevel.mines

    if (gIsVictory) {
        var elmEmoji = document.querySelector('.emoji')
        elmEmoji.src = 'img/emjVictory.png'
        clearInterval(gTimerInterval)

        gVictorySound.play()
    }
}

function isExtraCellsFlaged(explodeMinesCount) {
    var count = 0

    //Check if board has more flagged cells then mines or unexplode mines
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            count += gBoard[i][j].isMarked ? 1 : 0
            if (count > gLevel.mines - explodeMinesCount)
                return true
        }
    }

    return false
}

function uncoverNeighboursWithHint(i, j) {
    //keep previous border state
    var borderStep = `borderHintStep_ ${gBoardStepsCount}`
    if (typeof (Storage) !== "undefined") {
        if (!sessionStorage[borderStep]) {
            sessionStorage.setItem(borderStep, JSON.stringify(gBoard));
        }

        uncoverCellAndCloseNeighbours(i, j)
        renderBoard()

        setTimeout(
            function () {
                gBoard = JSON.parse(sessionStorage.getItem(borderStep) || "[]");
                sessionStorage.removeItem(borderStep)
                renderBoard()
            }, 500)
    }
}

function checkGameOver(i, j) {
    var elmLife = document.querySelector('.heart.life')

    //Check if gamer hs extra life
    if (!elmLife) {
        gIsGameOver = true
        var elmEmoji = document.querySelector('.emoji')
        elmEmoji.src = 'img/emjGameOver.png'
        clearInterval(gTimerInterval)

        gGameOverSound.play()
        gGameOverDemonSound.play()

    } else {
        elmLife.classList.remove('life')
        elmLife.src = 'img/heartDead.png'

        setDisappointedEmoji()
    }
}

function setDisappointedEmoji() {
    var elmEmoji = document.querySelector('.emoji')
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
    gTimerInterval = setInterval(function () {
        // Get today's date and times
        var now = (new Date() - gGameStart)
        var minutes = Math.floor(now / 60000)
        var seconds = Math.floor(now / 1000) - minutes * 60

        minutes = minutes < 10 ? '0' + minutes : minutes
        seconds = seconds < 10 ? '0' + seconds : seconds

        document.querySelector(".timer").innerHTML = `${minutes} : ${seconds}`
    }, 500);
}

function setSoldierLevelImage() {
    var solderImg = document.querySelector('.solder');
    if (gLevel.size === BEGINNER_LEVEL) {
        solderImg.src = 'img/solderBeginner.png'
    } else if (gLevel.size === INTERMEDIATE_LEVEL) {
        solderImg.src = 'img/solderInterm.png'
    } else if (gLevel.size === EXPERT_LEVEL) {
        solderImg.src = 'img/solderExpert.png'
    }
}

