let move_speed = 3, grativy = 0.5;
let bird = document.querySelector('.bird');
let img = document.getElementById('bird-1');
let sound_point = new Audio('sounds effect/point.mp3');
let sound_die = new Audio('sounds effect/die.mp3');

// getting bird element properties
let bird_props = bird.getBoundingClientRect();

// This method returns DOMReact -> top, right, bottom, left, x, y, width and height
let background = document.querySelector('.background').getBoundingClientRect();

let score_val = document.querySelector('.score_val');
let message = document.querySelector('.message');
let score_title = document.querySelector('.score_title');

let game_state = 'Start';
img.style.display = 'none';
message.classList.add('messageStyle');

// =================================================================
// 1. DUAL INPUT LISTENERS (TOUCH AND KEYBOARD)
// =================================================================

// Mobile Touch Events
document.addEventListener('touchstart', handleInputStart);
document.addEventListener('touchend', handleInputEnd);

// Desktop Keyboard Events
document.addEventListener('keydown', handleInputStart);
document.addEventListener('keyup', handleInputEnd);


function handleInputStart(e) {
    // Determine if the event is a key press or a touch.
    const isStartKey = (e.key === 'Enter');
    const isFlapKey = (e.key === 'ArrowUp' || e.key === ' ');
    const isTouch = (e.type === 'touchstart');

    // Prevent default browser actions for touches and key presses
    if (isTouch || isFlapKey) {
        e.preventDefault(); 
    }

    // --- GAME START / RESTART LOGIC ---
    // Triggered by 'Enter' key OR any 'touchstart'
    if (game_state !== 'Play' && (isStartKey || isTouch)) {
        document.querySelectorAll('.pipe_sprite').forEach((el) => {
            el.remove();
        });
        img.style.display = 'block';
        bird.style.top = '40vh';
        game_state = 'Play';
        message.innerHTML = '';
        score_title.innerHTML = 'Score : ';
        score_val.innerHTML = '0';
        message.classList.remove('messageStyle');
        play();
        
    } 
    // --- FLAP UP LOGIC ---
    // Triggered by 'ArrowUp'/'Space' key OR any 'touchstart'
    else if (game_state === 'Play' && (isFlapKey || isTouch)) {
        img.src = 'images/Bird-2.png'; // Change bird image for flap animation
        // bird_dy is only available inside the play function's scope.
        // We need to trigger the gravity function to apply the jump.
        if (typeof window.triggerJump === 'function') {
            window.triggerJump(); 
        }
    }
}

function handleInputEnd(e) {
    const isFlapKeyRelease = (e.key === 'ArrowUp' || e.key === ' ');
    const isTouchEnd = (e.type === 'touchend');

    // Reset bird image after key release or touch release
    if (game_state === 'Play' && (isFlapKeyRelease || isTouchEnd)) {
        img.src = 'images/Bird.png'; // Reset bird image
    }
}


// =================================================================
// 2. MODIFIED PLAY FUNCTION (Exposing the jump function globally)
// =================================================================

let bird_dy = 0; // Move bird_dy to global scope or outside apply_gravity for access

function play(){
    
    // Define the jump trigger function
    window.triggerJump = function() {
        bird_dy = -7.6; // Apply upward velocity
    };
    
    function move(){
        if(game_state != 'Play') return;

        let pipe_sprite = document.querySelectorAll('.pipe_sprite');
        pipe_sprite.forEach((element) => {
            let pipe_sprite_props = element.getBoundingClientRect();
            bird_props = bird.getBoundingClientRect();

            if(pipe_sprite_props.right <= 0){
                element.remove();
            }else{
                if(bird_props.left < pipe_sprite_props.left + pipe_sprite_props.width && bird_props.left + bird_props.width > pipe_sprite_props.left && bird_props.top < pipe_sprite_props.top + pipe_sprite_props.height && bird_props.top + bird_props.height > pipe_sprite_props.top){
                    game_state = 'End';
                    message.innerHTML = '<span style="color: red;">Game Over</span>' + '<br>Touch or Press Enter To Restart';
                    message.classList.add('messageStyle');
                    img.style.display = 'none';
                    sound_die.play();
                    return;
                }else{
                    if(pipe_sprite_props.right < bird_props.left && pipe_sprite_props.right + move_speed >= bird_props.left && element.increase_score == '1'){
                        score_val.innerHTML = parseInt(score_val.innerHTML) + 1;
                        sound_point.play();
                    }
                    element.style.left = pipe_sprite_props.left - move_speed + 'px';
                }
            }
        });
        requestAnimationFrame(move);
    }
    requestAnimationFrame(move);

    
    function apply_gravity(){
        if(game_state != 'Play') return;
        bird_dy = bird_dy + grativy;
        
        // Removed old keydown/keyup listeners here!
        
        if(bird_props.top <= 0 || bird_props.bottom >= background.bottom){
            game_state = 'End';
            message.style.left = '28vw';
            // Note: window.location.reload() immediately restarts the game.
            // If you want to show the 'Game Over' message longer, remove this line.
            window.location.reload(); 
            message.classList.remove('messageStyle');
            return;
        }
        bird.style.top = bird_props.top + bird_dy + 'px';
        bird_props = bird.getBoundingClientRect();
        requestAnimationFrame(apply_gravity);
    }
    requestAnimationFrame(apply_gravity);

    let pipe_seperation = 0;

    let pipe_gap = 35;

    function create_pipe(){
        if(game_state != 'Play') return;

        if(pipe_seperation > 115){
            pipe_seperation = 0;

            let pipe_posi = Math.floor(Math.random() * 43) + 8;
            let pipe_sprite_inv = document.createElement('div');
            pipe_sprite_inv.className = 'pipe_sprite';
            pipe_sprite_inv.style.top = pipe_posi - 70 + 'vh';
            pipe_sprite_inv.style.left = '100vw';

            document.body.appendChild(pipe_sprite_inv);
            let pipe_sprite = document.createElement('div');
            pipe_sprite.className = 'pipe_sprite';
            pipe_sprite.style.top = pipe_posi + pipe_gap + 'vh';
            pipe_sprite.style.left = '100vw';
            pipe_sprite.increase_score = '1';

            document.body.appendChild(pipe_sprite);
        }
        pipe_seperation++;
        requestAnimationFrame(create_pipe);
    }
    requestAnimationFrame(create_pipe);
}