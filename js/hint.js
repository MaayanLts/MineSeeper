'use strict'

function hintUsed() {
    gIsHintClicked = false

    var cell = document.querySelector('.cell.hint')
    cell.classList.remove('ligth')
}

function hintClicked(elm) {
    if (gIsHintClicked)
        return

    gHintEffect.play()

    gIsHintClicked = true
    elm.style.display = 'none'

    var cell = document.querySelector('.cell.hint')
    cell.classList.add('ligth')
}

function displayHints() {
    var elmts = document.querySelectorAll('.hint')
    for (var i = 0; i < elmts.length; i++) {
        elmts[i].style.display = ''
    }
}