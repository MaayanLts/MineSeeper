'use strict'

const LEFT_CLICK = 1
const RIGHT_CLICK = 3

var gBoard = []
var gMarkedMinesCount = 0
var gShownCells = 0
var gIsGameOver = false
var gIsVictory = false
var gLevel = {
    size: 16,
    mines: 2
}

function initGame() {
    buildBoard()
    renderBoard()
}

function renderBoard() {
    var strHTML = '';

    for (var i = 0; i < gBoard.length; i++) {
        strHTML += `<tr>\n`

        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j];
            strHTML += `\t<td class="${className(cell)}" onmousedown="cellClicked(event, this, ${i}, ${j})" >${displayData(cell)}</td>\n`
        }

        strHTML += `</tr>\n`
    }

    var elmMinesField = document.querySelector('.minesField');
    elmMinesField.innerHTML = strHTML;
}

function cellClicked(event, elm, i, j) {
    if (event.which === LEFT_CLICK) {
        gBoard[i][j].isShown = true

        if (gBoard[i][j].isMine) {
            gBoard[i][j].isExploded = true
            gIsGameOver = true
        }else{
            gShownCells ++;
        }
    }
    else if (event.which === RIGHT_CLICK) {
        //Mark/Unmark cell
        gBoard[i][j].isMarked = !gBoard[i][j].isMarked

        //Check if applied action was on mine cell
        if (gBoard[i][j].isMine) {
            if (gBoard[i][j].isMarked)
                gMarkedMinesCount++
            else
                gMarkedMinesCount--
        }

    }

    checkVictory()
    renderBoard()
}

function checkVictory(){
    gIsVictory = (gMarkedMinesCount == gLevel.mines) || (gShownCells === gLevel.size - gLevel.mines);

    if(gIsVictory || gIsGameOver)
        showMessage()
}

function showMessage(){
    var elm;
    if(gIsGameOver){
        elm = document.querySelector('.gameOver')
    }
    if(gIsVictory){
        elm = document.querySelector('.victory')
    }

    elm.style.display = 'block'
}

function displayData(cell) {
    var data = ''
    if (cell.isShown || gIsGameOver || gIsVictory) {
        if (cell.minesAroundCount > 0)
            data = cell.minesAroundCount
    }

    return data;
}

function className(cell) {
    var classes = 'cell';

    //Marked cell always unshown
    if (cell.isMarked) {
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