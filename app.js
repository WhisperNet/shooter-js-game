const can = document.querySelector("canvas")

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

//canvas initialization and resizing
let player
function resizeCanvas() {
    can.width = window.innerWidth;
    can.height = window.innerHeight;
    const x = can.width / 2
    const y = can.height / 2
    player = new Player(x, y, 15, "white")
}
resizeCanvas()
window.addEventListener('resize', resizeCanvas)

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

        color = `hsl(${Math.random() * 360},50%,50%)`

        const angle = Math.atan2(can.height / 2 - y, can.width / 2 - x)
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }

        enemies.push(new Enemie(x, y, radius, color, velocity))
        //console.log(enemies)
    }, 1000);
}

let animationId = null
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
        }
        //Detecting projectile and enemy collsion 
        projectiles.forEach((projectile, pIndex) => {
            const dist = Math.hypot(projectile.x - enm.x, projectile.y - enm.y)
            if (dist <= projectile.radius + enm.radius) {
                //Turns off the flicker effect
                setTimeout(() => {
                    projectiles.splice(pIndex, 1)
                    enemies.splice(eIndex, 1)
                }, 0)
            }
        })
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

animate()
spawnEnemies()