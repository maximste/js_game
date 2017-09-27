'use strict';
class Vector {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	plus(vector) {
		if (vector instanceof Vector) {
			return new Vector(this.x + vector.x, this.y + vector.y);
		} else {
			throw new Error('Можно прибавлять к вектору только вектор типа Vector');
		}    
  }

  times(multiplier) {
    return new Vector(this.x * multiplier, this.y * multiplier);
  }
}

class Actor {
	constructor(pos = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
		this.pos = pos;
		this.size = size;
		this.speed = speed;

		if (!(this.pos instanceof Vector) || !(this.size instanceof Vector) || !(this.speed instanceof Vector)) {
			throw new Error('Расположение, размер и скорость должны быть объектами типа Vector');
		}			
	}

	act() {}

	get left() {
		return this.pos.x;
	}

	get right() {
		return (this.pos.x + this.size.x);
	}

	get top() {
		return this.pos.y;
	}	

	get bottom() {
		return (this.pos.y + this.size.y);
	}

	get type() {
		return 'actor';
	}

	isIntersect(actor) {
		if (!(actor instanceof Actor)) {
			throw new Error('Передан аргумент, отличный от типа Actor');
		} else if (!actor) {
			throw new new Error('Не передан аргумент в функцию isIntersect()');
		}

    if (actor === this) {
      return false;
    }
    return actor.right > this.left &&
      actor.left < this.right &&
      actor.bottom > this.top &&
      actor.top < this.bottom;
  }
}

class Level {
	constructor(grid = [], actors = []) {
		this.grid = grid;
		this.actors = actors;
		this.player = this.actors.find(function(actor) {
			return actor.type == "player";
		});
		this.height = grid.length;
		this.width = this.height > 0 ? Math.max.apply(Math, this.grid.map(function(el) {
      return el.length;
    })) : 0;
		this.status = null;
		this.finishDelay = 1;
	}

	isFinished() {
		return this.status !== null && this.finishDelay < 0;
	}

	actorAt(actor) {
		if (!(actor instanceof Actor) || actor === undefined) {
			throw new Error('Аргумент, переданный в функцию actorAt должен являться оъектом типа Actor');
		}
  	return this.actors.find(other => other.isIntersect(actor));
	}

	obstacleAt(pos, size) {
		if(!(pos instanceof Vector) || !(size instanceof Vector)) {
			throw new Error('Аргументы, переданные в функцию obstacleAt должны являться оъектами типа Vector');
		}

		let xStart = Math.floor(pos.x);
	  let xEnd = Math.ceil(pos.x + size.x);
	  let yStart = Math.floor(pos.y);
	  let yEnd = Math.ceil(pos.y + size.y);

	  if (xStart < 0 || xEnd > this.width || yStart < 0) {
	  	return "wall";
	  }

	  if (yEnd > this.height) {
			return "lava";
	  }
	  // Вернет строку wall если площадь пересекается со стеной и строку lava если площадь пересекается с лавой.
	  // Вернет строку wall если площадь пересекается со стеной и объект имеет не целочисленные координаты или не целочисленный размер
		for (let y = yStart; y < yEnd; y++) {
			for (let x = xStart; x < xEnd; x++) {
				let fieldType = this.grid[y][x];
				if (fieldType) {
					return fieldType;
				}
			}
		}
	}

	removeActor(actor) {
		this.actors = this.actors.filter(function(other) {
			return other != actor;
		});
	}

	noMoreActors(type) {
		return !this.actors.some(actor => actor.type === type);
	}

	playerTouched(type, actor) {
		if (this.status !== null) {
			return;
		} else if (type === 'lava' || type === 'fireball') {
				this.status = 'lost';
				this.finishDelay = 1;
		} else if (type = 'coin') {
			this.actors = this.actors.filter(other => other != actor);
			if (this.noMoreActors('coin')) {
				this.status = 'won';
				this.finishDelay = 1;
			}
		}
	}
}

class LevelParser {
	constructor(dictionary) {
		this.dictionary = dictionary;
	}

	actorFromSymbol(char) {
		if (char === undefined) {
			return undefined;
		} else {
			return this.dictionary[char];
		}
	}

	obstacleFromSymbol(char) {
		switch(char) {
			case 'x' :
				return 'wall';
			case '!' :
				return 'lava';
			default :
				return undefined;
		}
	}

	createGrid(plan) {
    let levelGrid = plan.map(str => str.split(''));
    // levelGrid.map(str => str = str.map(el => this.obstacleFromSymbol(el))); не работает
    for (let i = 0; i < levelGrid.length; i++) {
      levelGrid[i] = levelGrid[i].map(el => this.obstacleFromSymbol(el));
    }
    return levelGrid;
  }

	createActors(plan) {
		const actors = [];
		if (this.dictionary) {
			plan.forEach((row, y) => {
				row.split('').forEach((char, x) => {
  				if (typeof(this.dictionary[char]) === 'function') {
						const actor = new this.dictionary[char](new Vector(x, y));
						if (actor instanceof Actor) {
							actors.push(actor);
						}						
					}
				});
			});  		
  	}
  	return actors;
  }

	parse(plan) {
  	return new Level(this.createGrid(plan), this.createActors(plan));
  }
}

class Fireball extends Actor {
	constructor(pos = new Vector(0, 0), speed = new Vector(0, 0)) {
		super(pos, new Vector(1, 1), speed);
		Object.defineProperty(this, 'type', {value: 'fireball', writable: false});
	}

	getNextPosition(time = 1) {
		return new Vector( (this.speed.x * time + this.pos.x), (this.speed.y * time + this.pos.y) );
	}

	handleObstacle() {
		this.speed.x *= -1;
		this.speed.y *= -1;
	}

	act(time, level) {
		let newPos = this.getNextPosition(time);
		if (level.obstacleAt(newPos, this.size)) {
			this.handleObstacle();
		} else {
			this.pos = newPos;
		}
	}
}

class HorizontalFireball extends Fireball {
	constructor(pos = new Vector(0, 0)) {
		super(pos, new Vector(2, 0));
	}
}

class VerticalFireball extends Fireball {
	constructor(pos = new Vector(0, 0)) {
		super(pos, new Vector(0, 2));
	}
}

class FireRain extends Fireball {
	constructor(pos = new Vector(0, 0)) {
		super(pos, new Vector(0, 3));
		this.startPos = this.pos;
	}
	handleObstacle() {		
		this.pos = this.startPos;
	}
}

class Coin extends Actor {
	constructor(pos = new Vector(0, 0)) {
		super(pos)
		Object.defineProperty(this, 'type', {value: 'coin', writable: false});
		this.pos = this.pos.plus(new Vector(0.2, 0.1));
		this.size = new Vector(0.6, 0.6);
		this.springSpeed = 8;
		this.springDist = 0.07;
		this.spring = Math.random() * 2 * Math.PI;
	}

	updateSpring(time = 1) {
		this.spring += this.springSpeed * time;
	}

	getSpringVector() {
		return new Vector(0, Math.sin(this.spring) * this.springDist);
	}

	getNextPosition(time = 1) {
		this.updateSpring(time);
		return this.pos.plus(this.getSpringVector());
	}

	act(time) {
		this.pos = this.getNextPosition(time);
	}
}

class Player extends Actor {
	constructor(pos = new Vector(0, 0)) {
		super(pos, new Vector(0.8, 1.5), new Vector(0, 0));
		this.pos = this.pos.plus(new Vector(0, -0.5));
	}
	get type() {
		return 'player';
	}
}