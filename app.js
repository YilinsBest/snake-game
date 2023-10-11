const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d"); //2d平面的游戏
//getContext()用于回传一个canvas的drawing context
//drawing context可以用来在canvas里面画图
const unit = 20; //设定每一格的单位
const row = canvas.height / unit; //320 / 20 = 16
const column = canvas.width / unit; //320 / 20 = 16

//画蛇，记录填充每个元素的颜色
let snake = []; //array中每一个元素都是一个物件

function createSnake() {
  //物件用来储存身体的（x，y）坐标
  snake[0] = {
    x: 80,
    y: 0,
  };
  snake[1] = {
    x: 60,
    y: 0,
  };
  snake[2] = {
    x: 40,
    y: 0,
  };
  snake[3] = {
    x: 20,
    y: 0,
  };
}

class Fruit {
  constructor() {
    this.x = Math.floor(Math.random() * column) * unit;
    this.y = Math.floor(Math.random() * row) * unit;
  }

  drawFruit() {
    ctx.fillStyle = "yellow";
    ctx.fillRect(this.x, this.y, unit, unit);
  }

  pickALocation() {
    let overlapping = false;
    let new_x;
    let new_y;

    function checkOverLap(new_x, new_y) {
      for (let i = 0; i < snake.length; i++) {
        if (new_x == snake[i].x && new_y == snake[i].y) {
          overlapping = true;
          return;
        } else {
          overlapping = false;
        }
      }
    }

    do {
      new_x = Math.floor(Math.random() * column) * unit;
      new_y = Math.floor(Math.random() * row) * unit;
      checkOverLap(new_x, new_y);
    } while (overlapping);

    this.x = new_x;
    this.y = new_y;
  }
}

//初始设定
createSnake();
let myFruit = new Fruit();
window.addEventListener("keydown", changeDirection);
let d = "Right";
function changeDirection(event) {
  if (event.key == "ArrowLeft" && d != "Right") {
    d = "Left";
  } else if (event.key == "ArrowRight" && d != "Left") {
    d = "Right";
  } else if (event.key == "ArrowUp" && d != "Down") {
    d = "Up";
  } else if (event.key == "ArrowDown" && d != "Up") {
    d = "Down";
  }
  //每次按下上下左右之后，在下一帧被画出来之前
  //不接受任何keydown事件
  //可以防止连续按键导致蛇在逻辑上自杀
  window.removeEventListener("keydown", changeDirection);
}

let highestScore;
loadHighestScore();
let score = 0;
document.getElementById("myScore").innerHTML = "MyScore: " + score;
document.getElementById("myScore2").innerHTML = "Score record: " + highestScore;
function draw() {
  //每次画图之前，确认蛇有没有咬到自己
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x == snake[0].x && snake[i].y == snake[0].y) {
      clearInterval(myGame);
      alert("游戏结束");
      return;
    }
  }

  //背景全设定为黑色
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  myFruit.drawFruit();

  for (let i = 0; i < snake.length; i++) {
    //填充的颜色
    if (i == 0) {
      ctx.fillStyle = "rgb(163,92,143)";
    } else {
      ctx.fillStyle = "rgb(225,108,150)";
    }
    //蛇的外框的颜色
    ctx.strokeStyle = "rgb(90,18,22)";

    //这里就要放穿墙功能，先确定x和y需不需要更新，再去更新xy
    //穿墙功能：
    //x>=canvas.width的时候x变为0
    //x<0, x = width-unit
    //y>= height, y = 0
    //y<0, y = height-unit
    if (snake[i].x >= canvas.width) {
      snake[i].x = 0;
    } else if (snake[i].x < 0) {
      snake[i].x = canvas.width - unit;
    } else if (snake[i].y >= canvas.height) {
      snake[i].y = 0;
    } else if (snake[i].y < 0) {
      snake[i].y = canvas.height - unit;
    }

    //x,y,width,height
    //画出蛇
    ctx.fillRect(snake[i].x, snake[i].y, unit, unit);
    ctx.strokeRect(snake[i].x, snake[i].y, unit, unit);
  }

  //蛇的移动就是pop掉最后一个框，然后unshift新的框
  //往左走，新增的框x坐标减1个unit，y坐标不变
  //往右走，新增的框x坐标加1个unit，y坐标不变
  //往下走，新增的框x坐标不变，y坐标加一个unit
  //往上走，新增的框x坐标不变，y坐标减一个unit
  //以目前d的方向，来决定蛇下一帧要放在哪个坐标
  let snakeX = snake[0].x; //snake[0]是一个物件，但snake[0].x是一个number
  let snakeY = snake[0].y;
  if (d == "Left") {
    snakeX -= unit;
  } else if (d == "Right") {
    snakeX += unit;
  } else if (d == "Up") {
    snakeY -= unit;
  } else if (d == "Down") {
    snakeY += unit;
  }

  let newHead = {
    x: snakeX,
    y: snakeY,
  };

  //如果蛇吃到果实，就只需要执行snake.unshift()，这样就会越来越长
  //没吃到果实就执行unshift()和pop()
  //这里需要if确定是否吃到果实
  if (snake[0].x == myFruit.x && snake[0].y == myFruit.y) {
    myFruit.pickALocation();
    myFruit.drawFruit();
    //只要分数有增加就更新分数
    score++;
    setHighestScore(score);
    document.getElementById("myScore").innerHTML = "MyScore:" + score;
    document.getElementById("myScore2").innerHTML =
      "Score record: " + highestScore;
    //画出新果实
    //更新分数
  } else {
    snake.pop();
  }
  snake.unshift(newHead);
  window.addEventListener("keydown", changeDirection); //再添加改方向的event
}

//蛇要自动移动
let myGame = setInterval(draw, 100);

function loadHighestScore() {
  if (localStorage.getItem("highestScore") == null) {
    highestScore = 0;
  } else {
    highestScore = Number(localStorage.getItem("highestScore"));
  }
}

function setHighestScore(score) {
  if (score > highestScore) {
    localStorage.setItem("highestScore", score);
    highestScore = score;
  }
}
