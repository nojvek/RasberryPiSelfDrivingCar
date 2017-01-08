import {h, render} from 'preact'
import {AppView} from './appView'

const load = () => render(h(AppView, null), document.body)

// Safari fires DomContentLoaded too early
if (document.body) {
    load()
}
// Chrome
else {
    document.addEventListener("DOMContentLoaded", load)
}

