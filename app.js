const can = document.querySelector("canvas")
const scoreElm = document.querySelector("#scoreElm")
const btn = document.querySelector("#btn")
const ui = document.querySelector("#ui")
const h1 = document.querySelector("h1")
//getting the canvas api
const ctx = can.getContext('2d')
can.width = window.innerWidth;
can.height = window.innerHeight;
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

class Particle extends Projectile {
    constructor(x, y, radius, color, velocity) {
        super(x, y, radius, color, velocity)
        this.alpha = 1
        this.friction = 0.99
    }
    draw() {
        ctx.save()
        ctx.globalAlpha = this.alpha
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        ctx.fillStyle = this.color
        ctx.fill()
        ctx.restore()
    }
    update() {
        this.draw()
        this.velocity.x *= this.friction
        this.velocity.y *= this.friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}
//canvas initialization and resizing
let player
let x
let y
function resizeCanvas() {
    can.width = window.innerWidth;
    can.height = window.innerHeight;
    x = can.width / 2
    y = can.height / 2
    player = new Player(x, y, 15, "white")
}
resizeCanvas()
window.addEventListener('resize', resizeCanvas)

let projectiles = []
let enemies = []
let particles = []

function init() {
    projectiles = []
    enemies = []
    particles = []
    player = new Player(x, y, 15, "white")
}

function spawnEnemies() {
    let timer = 2000
    setInterval(() => {
        if (timer > 1500) {
            timer -= 100
        } else if (timer > 1000) {
            timer -= 50
        } else if (timer > 850) {
            timer -= 2.5
        }
        console.log(timer)
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

        color = `hsl(${Math.random() * 360},50%,50%)`

        const angle = Math.atan2(can.height / 2 - y, can.width / 2 - x)
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }

        enemies.push(new Enemie(x, y, radius, color, velocity))
        //console.log(enemies)
    }, timer);
}

let animationId = null
let score = 0
function animate() {
    animationId = requestAnimationFrame(animate)
    ctx.fillStyle = 'rgba(0,0,0,0.1)'
    ctx.fillRect(0, 0, can.width, can.height)
    player.draw()
    //Moving projectiles
    projectiles.forEach((projectile, index) => {
        projectile.update()
        // Removing offscreen projectiles
        if (projectile.x + projectile.radius < 0 || projectile.x - projectile.radius > can.width
            || projectile.y + projectile.radius < 0 || projectile.y - projectile.radius > can.height
        ) {
            setTimeout(() => {
                projectiles.splice(index, 1)
            }, 0)
        }
    });
    // Moving enemy
    enemies.forEach((enm, eIndex) => {
        enm.update()
        //detecting enemy->player collsion
        const dist = Math.hypot(player.x - enm.x, player.y - enm.y)
        if (dist <= player.radius + enm.radius) {
            cancelAnimationFrame(animationId)
            ui.style.display = 'flex'
            h1.innerHTML = score
            audio.stop()
            score = 0
        }
        //Detecting projectile and enemy collsion 
        projectiles.forEach((projectile, pIndex) => {
            const dist = Math.hypot(projectile.x - enm.x, projectile.y - enm.y)
            if (dist <= projectile.radius + enm.radius) {
                //particle adding on collsion
                for (let index = 0; index < enm.radius * 2; index++) {
                    particles.push(new Particle(enm.x, enm.y, Math.random() * 2, enm.color, { x: (Math.random() - 0.5) * Math.random() * 8, y: (Math.random() - 0.5) * Math.random() * 8 }))
                }
                //shrinking effect
                if (enm.radius - 10 > 10) {
                    score += 100
                    scoreElm.innerHTML = score
                    gsap.to(enm, {
                        radius: enm.radius - 10
                    })
                    setTimeout(() => {
                        projectiles.splice(pIndex, 1)
                    }, 0)
                } else {
                    score += 250
                    scoreElm.innerHTML = score
                    setTimeout(() => {
                        projectiles.splice(pIndex, 1)
                        enemies.splice(eIndex, 1)
                    }, 0)
                }
            }
        })
    })
    particles.forEach((p, i) => {
        if (p.alpha <= 0) {
            particles.splice(i, 0)
        } else {
            p.update()
        }
    })
}

window.addEventListener('click', (e) => {
    const angle = Math.atan2(e.clientY - can.height / 2, e.clientX - can.width / 2)
    const velocity = {
        x: Math.cos(angle) * 6,
        y: Math.sin(angle) * 6
    }
    projectiles.push(new Projectile(can.width / 2, can.height / 2, 5, "white", velocity))
})

const audio = new Howl({
    src: './res/audio.mp3',
    volume: 0.2
})

btn.addEventListener("click", () => {
    init()
    animate()
    spawnEnemies()
    ui.style.display = "none"
    audio.play()
    scoreElm.innerHTML = 0
    h1.innerHTML = 0
})