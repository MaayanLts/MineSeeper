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

function minesAroundCount(i, j) {
    var count = 0

    count += countNeighbours(i - 1, j - 1);
    count += countNeighbours(i - 1, j);
    count += countNeighbours(i - 1, j + 1);

    count += countNeighbours(i, j - 1);
    count += countNeighbours(i, j + 1);

    count += countNeighbours(i + 1, j - 1);
    count += countNeighbours(i + 1, j);
    count += countNeighbours(i + 1, j + 1);

    return count;
}

function countNeighbours(i, j) {
    if (i < 0 || j < 0 || i > gBoard.length - 1 || j > gBoard.length - 1)
        return 0;

    return gBoard[i][j].isMine ? 1 : 0
}

function setMines(minesCount, openCellLocation) {
    //Create array of mines location
    fillMinesLocation(minesCount, openCellLocation)

    for (var i = 0; i < gMinesLocations.length; i++) {
        gBoard[gMinesLocations[i].i][gMinesLocations[i].j].isMine = true
    }
}

function fillMinesLocation(minesCount, openCellLocation) {
    var emptyLocations = [];
    emptyLocations.length = gLevel.size ** 2;
    emptyLocations.fill(0, 0, emptyLocations.length) //Fill array with zero values

    while (minesCount > 0) {
        //Get next location for mine
        var mineNextIndx = getMineNextLocation(emptyLocations);
        var indxI = Math.floor(mineNextIndx / gBoard.length)
        var indxJ = mineNextIndx % gBoard.length

        if (indxI !== openCellLocation.i && indxJ !== openCellLocation.j) {
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


