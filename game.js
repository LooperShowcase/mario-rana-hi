kaboom({
  global: true,
  fullscreen: true,
  clearColor: [0, 0.5, 1, 1],
  debug: true,
  scale: 2,
});
loadRoot("./sprites/");
loadSprite("playermario", "mario.png");
loadSprite("block", "ground.png");
loadSprite("coin", "coin.png");
loadSprite("surprise", "surprise.png");
loadSprite("goomba", "evil_mushroom.png");
loadSprite("unboxed", "unboxed.png");
loadSprite("mushroom", "mushroom.png");
loadSprite("coin", "coin.png");
loadSprite("loop", "loop.png");
loadSprite("coin2", "coin2.png");
loadSprite("castle", "castle.png");
loadSprite("cloud", "cloud.png");

loadSound("gamesound", "gameSound.mp3");
loadSound("jumpsound", "jumpSound.mp3");

scene("begin", () => {
  add([
    text("Welllllllcome", 30),
    origin("center"),
    pos(width() / 2, height() / 2),
  ]);
  // الستطيل
  const bg = add([
    pos(width() / 2, height() / 2 + 100),
    rect(60, 30),
    origin("center"),
    color(1, 1, 1),
  ]);
  //الكلمات التي بداخل المستطيل
  const texts = add([
    pos(width() / 2, height() / 2 + 100),
    text("start", 10),
    origin("center"),
    color(0.2, 0.2, 0.2),
  ]);
  bg.action(() => {
    if (bg.isHovered()) {
      bg.color = rgba(0, 0.8, 0.8);
      if (mouseIsClicked()) {
        go("game");
      }
    } else {
      bg.color = rgb(1, 1, 1);
    }
  });
});

scene("death", (score) => {
  add([
    text("Game Over!!!!!!\n" + "score: " + score, 30),
    origin("center"),
    pos(width() / 2, height() / 2),
  ]);
  const bg = add([
    pos(width() / 2, height() / 2 + 150),
    rect(60, 30),
    origin("center"),
    color(1, 1, 1),
  ]);
  const texts = add([
    text("restart", 10),
    pos(width() / 2, height() / 2 + 150),
    origin("center"),
    color(0.2, 0.2, 0.2),
  ]);

  bg.action(() => {
    if (bg.isHovered()) {
      bg.color = rgba(0, 0.8, 0.8);
      if (mouseIsClicked()) {
        go("game");
      }
    } else {
      bg.color = rgb(1, 1, 1);
    }
  });
});

scene("win", () => {
  add([
    text("mario wooooon", 60),
    pos(width() / 2, height() / 2),
    origin("center"),
  ]);
});

scene("game", () => {
  play("gamesound");
  layers(["bg", "obj", "ui"], "obj");

  const symbolMap = {
    width: 20,
    height: 20,
    "=": [sprite("block"), solid(), scale(1.3)],
    "?": [sprite("surprise"), solid(), "surprise-coin"],
    "!": [sprite("surprise"), solid(), "surprise-mushroom"],
    $: [sprite("coin"), "coin"],
    M: [sprite("mushroom"), body(), "mush"],
    x: [sprite("unboxed"), solid()],
    G: [sprite("goomba"), body(), solid(), "goomba"],
    c: [sprite("castle"), layer("bg"), "castle"],
    o: [sprite("cloud", layer("bg"), solid())],
  };
  const map = [
    "   o                       oo           ",
    "      o           oo                 ",
    "      ===                             ",
    "                      G               ",
    "                      =    ====?     ",
    "            G                         ",
    "               ?==!        ???  c ",
    "     !=!!!         ===                 ",
    "                =                     ",
    "                              G      ",
    "======================================",
    "======================================",
    "===================================== ",
    "===================================== ",
    "======================================",
    "======================================",
    "======================================",
  ];
  const jumpForce = 400;
  let isJumping = false;
  let goombaSpeed = 20;
  const speed = 120;
  const fallDown = 500;
  let score = 0;
  const coinLabel = add([sprite("coin2"), pos(5, 10)]);
  const scoreLabel = add([
    text("score:" + score),
    pos(50, 10),
    layer("ui"),
    {
      value: score,
    },
  ]);
  const player = add([
    sprite("playermario"),
    solid(),
    pos(30, 0),
    body(),
    origin("bot"),
    big(jumpForce),
  ]);

  const gameLevel = addLevel(map, symbolMap);

  let timer = 0;

  keyDown("right", () => {
    player.move(speed, 0);
  });

  const speed2 = 120;
  keyDown("left", () => {
    if (player.pos.x > 10) {
      player.move(-speed2, 0);
    }
  });

  keyPress("space", () => {
    if (player.grounded()) {
      player.jump(jumpForce);
      play("jumpsound");
      isJumping = true;
    }
  });
  player.on("headbump", (obj) => {
    if (obj.is("surprise-coin")) {
      console.log("We are here");
      gameLevel.spawn("$", obj.gridPos.sub(0, 1));
      destroy(obj);
      gameLevel.spawn("x", obj.gridPos);
    }

    if (obj.is("surprise-mushroom")) {
      gameLevel.spawn("M", obj.gridPos.sub(0, 1));
      destroy(obj);
      gameLevel.spawn("x", obj.gridPos);
    }
  });

  player.collides("coin", (x) => {
    destroy(x);
    scoreLabel.value += 1;
    scoreLabel.text = "score: " + scoreLabel.value;
  });

  player.collides("mush", (y) => {
    destroy(y);
    player.biggify(5);
  });
  player.collides("goomba", (x) => {
    if (isJumping) {
      destroy(x);
    } else {
      if (player.isBig()) {
        player.smallify();
        destroy(x);
      } else {
        destroy(player);
        go("death", score.value);
      }
    }
  });

  action("mush", (mush) => {
    mush.move(30, 0);
  });
  action("goomba", (gege) => {
    gege.move(-goombaSpeed, 0);
  });

  player.action(() => {
    camPos(player.pos);
    scoreLabel.pos.x = player.pos.x - 100;
    console.log(player.pos.x);
    if (player.pos.x >= 678.4907999999994 && scoreLabel.value == 5) {
      go("win");
    }
    if (player.grounded()) {
      isJumping = false; // ماريو على الارض او بالهواءهدا المتغير لكي نعرف اذا
    } else {
      isJumping = true;
    }
    if (player.pos.y >= fallDown) {
      go("death", score.value);
    }
  });
  loop(3, () => {
    goombaSpeed = goombaSpeed * -1;
  });
});

start("begin");
