'use strict'

class cell {
    // define a constructor inside class
    constructor(minesAroundCount, isShown, isMine, isMarked, isExploded) {
        this.minesAroundCount = minesAroundCount
        this.isShown = isShown
        this.isMine = isMine
        this.isMarked = isMarked
        this.isExploded = isExploded
    }
}

function mineField(openCellLocation) {
    setMines(gLevel.mines, openCellLocation)
    updateNeighboursMinesCount()
}

function updateNeighboursMinesCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            gBoard[i][j].minesAroundCount = minesAroundCount(i, j)
        }
    }
}

function uncoverCellAndCloseNeighbours(i,j){
    uncoverCell(i - 1, j - 1)
    uncoverCell(i - 1, j)
    uncoverCell(i - 1, j + 1)

    uncoverCell(i, j - 1)
    uncoverCell(i, j)
    uncoverCell(i, j + 1)

    uncoverCell(i + 1, j - 1)
    uncoverCell(i + 1, j)
    uncoverCell(i + 1, j + 1)
}

function uncoverCell(i, j) {
    if (i < 0 || j < 0 || i > gBoard.length - 1 || j > gBoard.length - 1)
        return 0;

    gBoard[i][j].isShown = true
}

function minesAroundCount(i, j) {
    var count = 0

    count += cellMineCount(i - 1, j - 1)
    count += cellMineCount(i - 1, j)
    count += cellMineCount(i - 1, j + 1)

    count += cellMineCount(i, j - 1)
    count += cellMineCount(i, j + 1)

    count += cellMineCount(i + 1, j - 1)
    count += cellMineCount(i + 1, j)
    count += cellMineCount(i + 1, j + 1)

    return count;
}

function cellMineCount(i, j) {
    if (i < 0 || j < 0 || i > gBoard.length - 1 || j > gBoard.length - 1)
        return 0;

    return gBoard[i][j].isMine ? 1 : 0
}

function setMines(minesCount, openCellLocation) {
    //Create array of mines location
    fillMinesLocation(minesCount, openCellLocation)

    //Update main board with mines
    for (var i = 0; i < gMinesLocations.length; i++) {
        gBoard[gMinesLocations[i].i][gMinesLocations[i].j].isMine = true
    }
}

function fillMinesLocation(minesCount, openCellLocation) {
    var minesLocations = [];
    minesLocations.length = gLevel.size ** 2;
    minesLocations.fill(0, 0, minesLocations.length) //Fill array with zero values

    while (minesCount > 0) {
        //Get next location for mine
        var mineNextIndx = getMineNextLocation(minesLocations)

        //Conver 1D array location to the 2D array location
        var indxI = Math.floor(mineNextIndx / gBoard.length)
        var indxJ = mineNextIndx % gBoard.length

        //Check if mine index is not as clicked cell index
        if (indxI !== openCellLocation.i && indxJ !== openCellLocation.j) {
            minesLocations[mineNextIndx] = 1
            gMinesLocations.push({ i: indxI, j: indxJ })
            minesCount--
        }
    }
}

function getMineNextLocation(minesLocations) {
    var emptyCells = []
    for (var i = 0; i < minesLocations.length; i++) {
        var cell = minesLocations[i]
        if (cell !== 1) {
            emptyCells.push(i)
        }
    }

    var randIdx = getRandomInt(0, emptyCells.length)
    return emptyCells[randIdx]
}

function createEmptyBoard() {
    gBoard = []

    for (var i = 0; i < gLevel.size; i++) {
        gBoard[i] = []
        for (var j = 0; j < gLevel.size; j++) {
            gBoard[i][j] = new cell(0, false, false, false, false)
        }
    }
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



