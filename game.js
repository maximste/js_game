'use strict';
/*
	Класс Vector создает объект со свойствами x и y, равными переданным в конструктор координатам.
*/
class Vector {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	/*
		Принимает один аргумент — вектор, объект Vector.
		Если передать аргумент другого типа, то бросает исключение "Можно прибавлять к вектору только вектор типа Vector".
		Создает и возвращает новый объект типа Vector, координаты которого будут суммой соответствующих координат суммируемых векторов.
	*/
	plus(vector) {
		if (vector instanceof Vector) {
			return new Vector(this.x + vector.x, this.y + vector.y);
		} else {
			throw new Error('Можно прибавлять к вектору только вектор типа Vector');
		}    
  }

	/*
	  Принимает один аргумент — множитель, число.
	  Создает и возвращает новый объект типа Vector, координаты которого будут равны соответствующим координатам исходного вектора, умноженным на множитель.
	*/
  times(multiplier) {
    return new Vector(this.x * multiplier, this.y * multiplier);
  }
}

/*
	Класс Actor позволяет контролировать все движущиеся объекты на игровом поле и контролировать их пересечение.
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
