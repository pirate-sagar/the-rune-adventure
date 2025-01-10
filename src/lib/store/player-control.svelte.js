import { Player } from '$lib/classes/Player.js'

export const keys = $state({

    w: {
        pressed: false,
    },
    a: {
        pressed: false,
    },
    d: {
        pressed: false,
    },

})

export const player = $state({
    player: new Player({
        x: 100,
        y: 100,
        size: 32,
        velocity: { x: 0, y: 0 },
    })
}
)