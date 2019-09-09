/**************************************************
** GAME PLAYER CLASS
**************************************************/
var shipLength = 60;

var Player = function(startX, startY, colorChar) {
	var x = startX,
		y = startY,
		id,
		typeID;
        looperVar = 0,
        animateMove = 0,
        moveAmount = 5,
        bullets = [],
        playerSpeed = 30;

    var moving = false;
    var startDrag = {x:-1, y:-1};
    var endDrag = {x:-1, y:-1};

    switch(colorChar)
    {
        case 'b':
        case 506:
            typeID = 506;
            break;
        case 'r':
        case 566:
            typeID = 566;
            break;
        case 'g':
        case 626:
            typeID = 626;
            break;
        case 'y':
        case 686:
            typeID = 686;
            break;
        default:
            console.log("color " + colorChar + " not found");
            typeID = 506;
    }

    var getX = function() {   return x;        };
    var getY = function() {   return y;        };
    var getType = function(){ return typeID;   };
    var getBullets = function(){
        var bulletObject = [];
        var i;
        for (i = 0; i < bullets.length; i++) {
          bulletObject.push({ x: bullets[i].getX(), y: bullets[i].getY(), run: bullets[i].getRun(), rise: bullets[i].getRise()} );
        };
        return bulletObject;
    };

    var setX = function(newX) {      x = newX; };
    var setY = function(newY) {      y = newY; };
    var setType = function(id){ typeID = id    };
    var setBullets = function(bulletArray){
        for(var i = 0; i < bulletArray.length; i++){
            bullets.push(bulletArray[i]);
        }
    };

    var addBullet = function(clickX, clickY){
        bullets.push(new Bullet(clickX,clickY,x,y));
    };

    var update = function(keys) {
        var prevX = x,
            prevY = y;

    	// Up key takes priority over down
    	if (keys.up && !(y < 0)) {
    		y -= moveAmount;
            endDrag.x = -1;
    	} else if (keys.down && !(y > canvas.height - shipLength)) {
    		y += moveAmount;
            endDrag.x = -1;
    	};
    	// Left key takes priority over right
    	if (keys.left && !(x < 0)) {
    		x -= moveAmount;
            endDrag.x = -1;
    	} else if (keys.right && !(x > canvas.width - shipLength)) {
    		x += moveAmount;
            endDrag.x = -1;
    	};

        if(endDrag.x != -1){
            var run = (startDrag.x - endDrag.x),
                rise = (startDrag.y - endDrag.y),
                r = (rise*rise) + (run*run),
                alpha = Math.sqrt(playerSpeed/r);

                var xvel = run * alpha * 2;
                var yvel = rise * alpha * 2;


                if(!moving){
                    if(xvel || yvel){
                        if(x-xvel < 0){
                            x = 0;
                        }else if(x-xvel > canvas.width - shipLength){
                            x = canvas.width - shipLength;
                        }else{
                            x -= run * alpha * 2;
                        }

                        if(y-yvel < 0){
                            y = 0
                        }else if(y-yvel > canvas.height - shipLength){
                            y = canvas.height - shipLength;
                        }else{
                            y -= rise * alpha * 2;
                        }
                    }       
                }else{

                    x -= run * alpha * 2 * Math.sin(animateMove);
                    console.log("x: "+run * alpha * 2 * Math.sin(animateMove));
                    if(animateMove == Math.PI / 2){ 
                        moveing = false;
                        animateMove = 0;
                    }else{
                        animateMove += Math.PI / 32;
                    }
                }
        }
        // Update all bullets
        var i;
        for (i = 0; i < bullets.length; i++) {
            var cur = bullets[i];
            cur.update();
            if(cur.getX() > canvas.width || cur.getX() < 0){
              bullets.splice(i,1);
            }else if(cur.getY () > canvas.height || cur.getY < 0){
              bullets.splice(i,1);
            }
        };

		return (prevX != x || prevY != y) ? true : false;
	};

	var draw = function(ctx) {
        for (var i = 0; i < bullets.length; i++) {
            bullets[i].draw(ctx);
        };

        if(looperVar < 8){
          ctx.drawImage(imgSprite,0,typeID+2,shipLength,shipLength,x,y,shipLength,shipLength);
        }else if(looperVar < 16){
          ctx.drawImage(imgSprite,60,typeID+2,shipLength,shipLength,x,y,shipLength,shipLength);
        }else if(looperVar < 24){
          ctx.drawImage(imgSprite,120,typeID+2,shipLength,shipLength,x,y,shipLength,shipLength);
        }else{
          ctx.drawImage(imgSprite,180,typeID+2,shipLength,shipLength,x,y,shipLength,shipLength);
          looperVar=0;
        }

        looperVar++;
	};

    var isMoving = function(){
        return moving;
    }

    var setDragstart = function(x, y){
        startDrag.x = x;
        startDrag.y = y;
    }

    var setDragend = function(x, y){
        endDrag.x = x;
        endDrag.y = y;
        console.log("EDX:"+endDrag.x+" EDY:"+endDrag.y);
        console.log("    - SDX:"+startDrag.x+" SDY:"+startDrag.y);
    }

    var intersect = function(bulletX, bulletY){
        //if(bulletX)
    }

	return {
        getX: getX,
        getY: getY,
        getType: getType,
        getBullets: getBullets,
        setX: setX,
        setY: setY,
        setType: setType,
        setBullets: setBullets,
        addBullet: addBullet,
        setDragstart: setDragstart,
        setDragend: setDragend,
        isMoving: isMoving,
        intersect: intersect,
        update: update,
        draw: draw,
	}
};


var Bullet = function(clickX, clickY, startX, startY){
	var x = startX,
		y = startY,
        missleSpeed = 20,
		run = (x - clickX),
		rise = (y - clickY),
        r = (rise*rise) + (run*run),
        alpha = Math.sqrt(missleSpeed/r),
        bulletFrameCounter=0;

    var hasCollided = false; //when colide turn this on
    var deathAnimation = 0;


    // var bulletXOffset = shipLength/2 - 13; //position bullet in the middle of char
    // var bulletYOffset = shipLength/2 - 13; //position bullet in the middle of char
    var bulletXOffset = 0; //position bullet in the middle of char
    var bulletYOffset = 0; //position bullet in the middle of char


    var getX = function() { return x; };
    var getY = function() { return y; };
    var setX = function(newX) { x = newX; };
    var setY = function(newY) { y = newY; };
    var getRun = function(){ return run; };
    var getRise = function(){ return rise; };

	var draw = function(ctx) {
        if(!hasCollided){
          if(bulletFrameCounter < 20){
            ctx.drawImage(imgSprite,15,798,26,27,x+bulletXOffset,y+bulletYOffset,26,27);
          }else if(bulletFrameCounter < 60){
            ctx.drawImage(imgSprite,79,798,37,27,x+bulletXOffset,y+bulletYOffset,37,27);
          }else{
            ctx.drawImage(imgSprite,144,798,48,27,x+bulletXOffset,y+bulletYOffset,48,27);
            return;
          }
          bulletFrameCounter++;
        }
        //Demilition animation
        else{
          if(deathAnimation < 20){
            ctx.drawImage(imgSprite,236,798,26,27,x+bulletXOffset,y+bulletYOffset,26,27);      
          }
          else if(deathAnimation < 40){
            ctx.drawImage(imgSprite,275,798,31,27,x+bulletXOffset,y+bulletYOffset,31,27);      
          }
          else if(deathAnimation < 60){
            ctx.drawImage(imgSprite,324,798,32,36,x+bulletXOffset,y+bulletYOffset,32,36);      
          }
          else{
            ctx.drawImage(imgSprite,369,798,33,38,x+bulletXOffset,y+bulletYOffset,33,38);      
            return;
          }
          deathAnimation++;
        }
	};

	var update = function(){
        x -= run * alpha * 2;      
        y -= rise * alpha * 2;
        for (var i = 0; i < remotePlayers.length; i++) {
            if(remotePlayers[i].intersect(x, y)){
                alert("Got um");
            }
        };
	};

	return {
    getX: getX,
    getY: getY,
    setX: setX,
    setY: setY,
    getRun: getRun,
    getRise: getRise,
    update: update,
    draw: draw
	}
};
