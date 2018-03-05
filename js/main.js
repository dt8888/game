
// 手指开始位置
var startX = 0;
var startY = 0;

// 手指移动路径
var moveX = 0;
var moveY = 0;

// 差值
var diffX = 0;
var diffY = 0;

var snakeW = 10;
var snakeH = 10;
var offScreenCanvas = null;

let ctx = canvas.getContext('2d')

var image = wx.createImage()
// 蛇头
var snakeHead = {
  image: image,
  x: 0,
  y: 0,
  w: snakeW,
  h: snakeH
};
// 蛇身 数组 
var snakeBodys = [];
// 窗口宽/高
var windowW = 0;
var windowH =0;
// 食物
var foods = [];
// 蛇头移动方向
var snakeMoveDirection = "right";
// 总得分(吃到的食物大小-宽度的总和)
var score = 0;
// 蛇身总长(每得perSocre分 +1)
var snakeLength = 0;
// 是否变长/即移除蛇身 (每得perSocre分 变长-蛇身+1)
var shouldRemoveBody = true;
// (每得perSocre分 变长-蛇身+1)
var perSocre = 5;
// 得了count个perSocre分 
var count = 1;
// 蛇移动的速度(帧频率-----越大越慢)
var defaultSpeedLevel =10;
var moveSpeedLevel = defaultSpeedLevel;
//   减慢动画
var perform = 0;
// 吃到食物的次数
var eatFoodCount = 0;
// 每 speederPerFood 次吃到食物加速
var speederPerFood = 2;
//用户头像
var avatarUrl;

 wx.onTouchStart(function (e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    })

    //移动方向
    wx.onTouchMove(function (e) {
      moveX = e.touches[0].clientX;
      moveY = e.touches[0].clientY;

      diffX = moveX - startX;
      diffY = moveY - startY;
      if (Math.abs(diffX) > Math.abs(diffY) && diffX > 0 && !(snakeMoveDirection == "left")) {
        //  向右
        snakeMoveDirection = "right";
          //console.log("向右"); 
      } else if (Math.abs(diffX) > Math.abs(diffY) && diffX < 0 && !(snakeMoveDirection == "right")) {
        //  向左
        snakeMoveDirection = "left";
          //console.log("向左");
      } else if (Math.abs(diffX) < Math.abs(diffY) && diffY > 0 && !(snakeMoveDirection == "top")) {
        //  向下
        snakeMoveDirection = "bottom";
           //console.log("向下");
      } else if (Math.abs(diffX) < Math.abs(diffY) && diffY < 0 && !(snakeMoveDirection == "bottom")) {
        //  向上
        snakeMoveDirection = "top";
          //console.log("向上");
      }
    })
 
 wx.getUserInfo({
   success: function (res) {  
     avatarUrl = res.userInfo.avatarUrl;
   }
 })

 wx.getSystemInfo({
   success: function (res) {
     windowW = res.windowWidth;
     windowH = res.windowHeight;

   }
 })


/**
 * 游戏主函数
 */
//主函数开始游戏
export default class Main {

  constructor() {
    var _this = this;
    wx.showModal({
      title: '请开始游戏',
      content: "每得" + perSocre + "分,蛇身增长1 ",
      success: function (res) {
        if (res.confirm) {
          ctx.fillStyle = "white"
          _this.beginGame();
        } else {
          _this.initGame();
        }
      }
    });
  }
  
 beginGame() {
  // 初始化游戏环境
  this.initGame();
  function drawObj(obj) {
    if (obj == snakeHead)
    {
       image.src = avatarUrl 
       ctx.drawImage(image, obj.x, obj.y, obj.w, obj.h)
       image.onload = function () {
     }
      
    }else
    {
      var offScreenCanvas = wx.createCanvas()
      var offContext = offScreenCanvas.getContext('2d')
      offContext.fillStyle = obj.color
      offContext.fillRect(obj.x, obj.y, obj.w, obj.h)
      ctx.drawImage(offScreenCanvas, 0, 0)
    }
    
  }
  var _this = this;
  function beginDraw() {
    // 绘制食物 20个
    for (var i = 0; i < foods.length; i++) {
      var food = foods[i];
       drawObj(food);
      // 吃食物
       if (_this.eatFood(snakeHead, food)) {

         //清除吃掉的食物
         ctx.clearRect(food.x, food.y, food.w, food.h);
        // 食物重置
        _this.reset(food);
        wx.showToast({
          title: "+" + food.w + "分",
          icon: 'succes',
          duration: 500
        })
        score += food.w;
        //吃到食物的次数
        eatFoodCount++
        if (eatFoodCount % speederPerFood == 0) {
          // 每吃到speederPerFood次食物 蛇移动速度变快                      
          moveSpeedLevel -= 1;
          if (moveSpeedLevel <= 2) {
            moveSpeedLevel = 2;
          }
        }
      }
    }
    if (++perform % moveSpeedLevel == 0) {
        // 添加蛇身
        snakeBodys.push({
          color: "green",
          x: snakeHead.x,
          y: snakeHead.y,
          w: snakeW,
          h: snakeH
        });
        
        //删除绘制的多余步奏
        for (var i = 0; i < snakeBodys.length-5; i++)
        {
          var snakeBody = snakeBodys[i];
          ctx.clearRect(snakeBody.x, snakeBody.y, snakeBody.w, snakeBody.h);
        }
        ctx.fillRect(snakeHead.x, snakeHead.y, snakeHead.w, snakeHead.h);
        ctx.fillStyle = 'white'
     
      // 移除蛇身
      if (snakeBodys.length > 5) {
        if (score / perSocre >= count) { // 得分
          count++;
          shouldRemoveBody = false;
        }
        if (shouldRemoveBody) {
          //清除吃掉的食物
          snakeBodys.shift();
        }
        shouldRemoveBody = true;
       
      }
      switch (snakeMoveDirection) {
        case "left":
          snakeHead.x -= snakeHead.w;
          break;
        case "right":
          snakeHead.x += snakeHead.w;
          break;
        case "top":
          snakeHead.y -= snakeHead.h;
          break;
        case "bottom":
          snakeHead.y += snakeHead.h;
          break;
      }

      // 游戏失败
      if (snakeHead.x > windowW || snakeHead.x < 0 || snakeHead.y > windowH || snakeHead.y < 0) {
        // console.log("游戏结束");
        wx.showModal({
          title: "总得分:" + score + "分-----蛇身总长:" + snakeBodys.length + "",
          content: '游戏失败, 重新开始, 咱又是一条好🐍',
          success: function (res) {
            console.log(res)
            if (res.confirm) {
             _this.beginGame();

            } else {
              _this.initGame();
            }
          }
        })

        return;
      }
    }
    // 绘制蛇头
    drawObj(snakeHead);
  
    // 绘制蛇身体
    for (var i = 0; i < snakeBodys.length; i++) {
      var snakeBody = snakeBodys[i];
      drawObj(snakeBody);
    }
      // 循环执行动画绘制
      requestAnimationFrame(beginDraw);
  }
  beginDraw();
}
  // (A,B)中随机一个数 
  randomAB(A, B) {
    return parseInt(Math.random() * (B - A) + A);
  }
  // 食物方法
   food() {
      var food = {};
      food["color"] = "rgb(" + this.randomAB(0, 255) + "," + this.randomAB(0, 255) + "," + this.randomAB(0, 255) + ")";
      food["x"] = this.randomAB(0, windowW);
      food["y"] = this.randomAB(0, windowH);
      var w = this.randomAB(10, 20);
      food["w"] = w;
      food["h"] = w;
      return food;
  }
  //吃完食物，食物随机产生
   reset(food){
    food["color"] = "rgb(" + this.randomAB(0, 255) + "," + this.randomAB(0, 255) + "," + this.randomAB(0, 255) + ")";
    food["x"] = this.randomAB(0, windowW);
    food["y"] = this.randomAB(0, windowH);
    var w = this.randomAB(10, 20);
    food["w"] = w;
    food["h"] = w;
  }

  // 吃到食物函数
  eatFood(snakeHead, food) {
    var sL = snakeHead.x;
    var sR = sL + snakeHead.w;
    var sT = snakeHead.y;
    var sB = sT + snakeHead.h;
    var fL = food.x;
    var fR = fL + food.w;
    var fT = food.y;
    var fB = fT + food.h;
    if (sR > fL && sB > fT && sL < fR && sT < fB && sL < fR) {
      return true;
    } else {
      return false;
    }
  }
// 初始化游戏环境
 initGame() {
  snakeHead.x = 0;
  snakeHead.y = 0;
  snakeBodys.splice(0, snakeBodys.length);//清空数组 
  snakeMoveDirection = "right";
  // 上下文
  offScreenCanvas = wx.createCanvas();
  foods.splice(0, foods.length);

  score = 0;
  count = 1;
  moveSpeedLevel = defaultSpeedLevel;  // 恢复默认帧频率
  perform = 0;
  eatFoodCount = 0;


  // 创建食物 20个
  for (var i = 0; i < 20; i++) {
    
    var food = this.food();
      
      foods.push(food);
     }
  }
}
