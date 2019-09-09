var Player = function(startX, startY, type) {
    var x = startX,
        y = startY,
        typeID = type,
        id,
        bullets = [];


    var getX = function() {
        return x;
    };

    var getY = function() {
        return y;
    };

    var setX = function(newX) {
        x = newX;
    };

    var setY = function(newY) {
        y = newY;
    };

    var getType = function(){
        return typeID;
    };

    var setType = function(type){
        typeID = type;
    };

    var addBullet = function(startX, startY, clickX, clickY){
        bullets.push({startX: startX, startY: startY, clickX: clickX, clickY: clickY});
    }

    var getBullet = function(){
        return bullets[bullets.length-1];
    }

    return {
        getX: getX,
        getY: getY,
        setX: setX,
        setY: setY,
        getType: getType,
        setType: setType,
        addBullet: addBullet,
        getBullet: getBullet,
        id: id,
    }
};

exports.Player = Player;
