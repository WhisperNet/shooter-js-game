const can = document.querySelector("canvas")

//getting the canvas api
const ctx = can.getContext('2d')

can.height = window.innerHeight
can.width = window.innerWidth

class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }
    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        ctx.fillStyle = this.color
        ctx.fill()
    }
}

class Projectile extends Player {
    constructor(x, y, radius, color, velocity) {
        super(x, y, radius, color)
        this.velocity = velocity
    }
    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

class Enemie extends Projectile {
    constructor(x, y, radius, color, velocity) {
        super(x, y, radius, color, velocity)
    }
}

const x = can.width / 2
const y = can.height / 2
const player = new Player(x, y, 30, "blue")

const projectiles = []
const enemies = []

function spawnEnemies() {
    setInterval(() => {
        const radius = (Math.random() * 20) + 10
        let x
        let y

        if (Math.random() > 0.5) {
            x = Math.random() > .5 ? 0 - radius : can.width + radius
            y = can.height * Math.random()
        } else {
            x = can.width * Math.random()
            y = Math.random() > 0.5 ? 0 - radius : can.height + radius
        }

        color = "green"

        const angle = Math.atan2(can.height / 2 - y, can.width / 2 - x)
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }

        enemies.push(new Enemie(x, y, radius, color, velocity))
        //console.log(enemies)
    }, 1000);
}

function animate() {
    requestAnimationFrame(animate)
    ctx.clearRect(0, 0, can.width, can.height)
    player.draw()
    projectiles.forEach(projectile => {
        projectile.update()
    });
    enemies.forEach(enm => enm.update())
}

window.addEventListener('click', (e) => {
    const angle = Math.atan2(e.clientY - can.height / 2, e.clientX - can.width / 2)
    const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle)
    }
    projectiles.push(new Projectile(can.width / 2, can.height / 2, 5, "red", velocity))
})

animate()
spawnEnemies()