'use strict';
/*
	Класс Vector создает объект со свойствами x и y, равными переданным в конструктор координатам.
	
	Метод plus принимает один аргумент — вектор, объект Vector.
	Если передать аргумент другого типа, то бросает исключение "Можно прибавлять к вектору только вектор типа Vector".
	Создает и возвращает новый объект типа Vector, координаты которого будут суммой соответствующих координат суммируемых векторов.

	Метод times gринимает один аргумент — множитель, число.
	Создает и возвращает новый объект типа Vector, координаты которого будут равны соответствующим координатам исходного вектора, умноженным на множитель.
*/
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

/*
	Класс Actor, который позволит контролировать все движущиеся объекты на игровом поле и контролировать их пересечение.
	Конструктор принимает три аргумента - объекты типа Vector: расположение (pos), размер (size) и скорость (speed).
	По умолчанию создается объект с координатами 0:0, размером 1x1 и скоростью 0:0. 
	Если в качестве первого, второго или третьего аргумента передать не объект типа Vector, то конструктор бросает исключение.
	
	Свойства:
	- pos, в котором размещен Vector. 
	- size, в котором размещен Vector.
	- speed, в котором размещен Vector.
	Определен метод act, который ничего не делает.
	Определены свойства только для чтения left, top, right, bottom, в которых установлены границы объекта по осям X и Y с учетом его расположения и размера.
	Свойство type — строка со значением actor, только для чтения.
	
	Метод isIntersect проверяет, пересекается ли текущий объект с переданным объектом, и если да, возвращает true, иначе false.
	Принимает один аргумент — движущийся объект типа Actor. Если передать аргумент другого типа или вызвать без аргументов, то метод бросает исключение. Если передать в качестве аргумента этот же объект, то всегда возвращает false. Объект не пересекается сам с собой. Объекты, имеющие смежные границы, не пересекаются.
*/
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