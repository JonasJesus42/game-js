kaboom({
    global: true,
    fullscreen: true,
    scale: 2,
    debug: true,
    clearColor: [0, 0, 0, 1],
})

const ENEMY_SPEED = 20
const MOVE_SPEED = 120
const JUMP_FORCE = 400
const BIG_JUMP_FORCE = 550
let CURRENT_JUMP_FORCE = JUMP_FORCE
let isJump = false
const FAIL_DEATH = 400

loadRoot('./assets/')

loadSprite('coin', 'coin.png')
loadSprite('evil-shroom', 'evil-shroom.png')
loadSprite('brick', 'brick.png')
loadSprite('block', 'block.png')
loadSprite('mario', 'mario.png')
loadSprite('mushroom', 'mushroom.png')
loadSprite('surprise', 'surprise.png')
loadSprite('unboxed', 'unboxed.png')
loadSprite('pipe-top-left', 'pipe-top-left.png')
loadSprite('pipe-top-right', 'pipe-top-right.png')
loadSprite('pipe-bottom-left', 'pipe-bottom-left.png')
loadSprite('pipe-bottom-right', 'pipe-bottom-right.png')

loadSprite('blue-block', 'blue-block.png')
loadSprite('blue-brick', 'blue-brick.png')
loadSprite('blue-steel', 'blue-steel.png')
loadSprite('blue-evil-shroom', 'blue-evil-shroom.png')
loadSprite('blue-surprise', 'blue-surpise.png')

scene("game", ({level, score}) => {
    layers(['bg', 'obj', 'ui'], 'obj')
    const maps = [
        [
            '                                         ', 
            '                                         ', 
            '                                         ', 
            '                                         ', 
            '                                         ', 
            '    %    =*=%=                           ', 
            '                                         ', 
            '                             -+          ', 
            '                 ^    ^      ()          ',
            '================================    =====',
        ],
        [
            '°                                         °', 
            '°                                         °', 
            '°                                         °', 
            '°                                         °', 
            '°                                         °', 
            '°         @@@@@@             x            °', 
            '°                           xx            °', 
            '°                          xxx          -+°', 
            '°                 z    z  xxxx          ()°',
            '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
        ],
        [
            '                                         ', 
            '                                         ', 
            '                                         ', 
            '                                         ', 
            '                                         ', 
            '         =*=%=                           ', 
            '                                         ', 
            '                             -+          ', 
            '                 ^    ^      ()          ',
            '================================    =====',
        ],
    ]

    const levelCfg = {
        width: 20,
        height: 20,
        '=': [sprite('block'), solid()],
        '$': [sprite('coin'), 'coin'],
        '%': [sprite('surprise'), solid(), 'coin-surprise'],
        '*': [sprite('surprise'), solid(), 'mushroom-surprise'],
        '+': [sprite('pipe-top-right'), solid(), scale(0.5), 'pipe'],
        '-': [sprite('pipe-top-left'), solid(), scale(0.5), 'pipe'],
        ')': [sprite('pipe-bottom-right'), solid(), scale(0.5)],
        '(': [sprite('pipe-bottom-left'), solid(), scale(0.5)],
        '^': [sprite('evil-shroom'), solid(), "dangerous"],
        '}': [sprite('unboxed'), solid()],
        '#': [sprite('mushroom'), solid(), 'mushroom', body()],
        '!': [sprite('blue-block'), solid(), scale(0.5)],
        '°': [sprite('blue-brick'), solid(), scale(0.5)],
        'z': [sprite('blue-evil-shroom'), solid(), scale(0.5), "dangerous"],
        '@': [sprite('blue-surprise'), solid(), scale(0.5), "coin-surprise"],
        'x': [sprite('blue-steel'), solid(), scale(0.5)],
    }

    const gameLevel = addLevel(maps[level], levelCfg)

    const scoreLavel = add([
        text(score),
        pos(6, 6),
        layer("ui"),
        {
            value: score,
        },
    ])

    add([text('level' +  parseInt(level + 1)), pos(40,6)])

    function big(){
        let timer = 0
        let isBig = false

        return{
            id: big,
            require: ["scale"],
            update(){
                if(isBig){
                    CURRENT_JUMP_FORCE = BIG_JUMP_FORCE
                    timer -= dt()
                    if (timer <= 0){
                        this.smallify()
                    }
                }
            },
            isBig(){
                return isBig
            },
            smallify(){
                this.scale = vec2(1)
                CURRENT_JUMP_FORCE = JUMP_FORCE
                timer = 0
                isBig = false
            },
            biggify(time){
                this.scale = vec2(2)
                
                timer = time
                isBig = true
            }
        }
    }


    const player = add([
        sprite('mario'), area(), pos(30, 0), big(), body(), origin('bot')
    ])

    action('mushroom', (m) =>{
        m.move(20, 0)
    })
    player.on('headbutt', (obj) => {
        if(obj.is("coin-surprise")){
            gameLevel.spawn("$", obj.gridPos.sub(0,1))
            destroy(obj)
            gameLevel.spawn("}", obj.gridPos.sub(0))
        }
        if(obj.is("mushroom-surprise")){
            gameLevel.spawn("#", obj.gridPos.sub(0,1))
            destroy(obj)
            gameLevel.spawn("}", obj.gridPos.sub(0))
        }
    })
    player.collides('mushroom', (m) => {
        destroy(m)
        player.biggify(6)
    })
    player.collides('coin', (c) => {
        destroy(c)
        scoreLavel.value++
        scoreLavel.text = scoreLavel.value
    })
    
    action("dangerous", (d) =>{

        d.move(-ENEMY_SPEED, 0)
    })

    player.collides("dangerous", (d) => {
        if(isJump){
            destroy(d)
        }else{
            go("lose", { score: scoreLavel.value, })
        }
    })

    player.action(() => {
        camPos(player.pos)
        if(player.pos.y >= FAIL_DEATH){
            go("lose", { score: scoreLavel.value, })
        }
    })

    player.collides('pipe', () =>{
        keyPress('down', () => {
            go('game', {
                level: (level + 1) % maps.length,
                score: scoreLavel.value,
            })
        })
    })

    keyDown('right', () =>{
        player.move(MOVE_SPEED, 0)
    })

    keyDown('left', () =>{
        player.move(-MOVE_SPEED, 0)
    })
    player.action(() => {
        if (player.grounded()){
            isJump = false
        }
    })

    keyPress("space", () => {
    	if (player.grounded()) {
            player.jump(CURRENT_JUMP_FORCE);
            isJump = true
        }
    })
}) 

scene('lose', ({score}) => {
    add([text(score, 32),
        origin('center'), 
        pos(width()/2, height()/2)])
})

go("game", {level: 0, score: 0})