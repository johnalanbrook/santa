var background_color = [100/255,149/255,237/255,1];
var btn_size = [100,100];

function reset()
{
  entry = "";
  for (var p in puzzles) puzzles[p].done = undefined;
}

var camera = {};
camera.pos = [0,0]; // cameras are in world coordinates
camera.size = [1024,758]; // size the camera sees in world units
camera.zoom = 1;
var center = camera.size.scale(0.5);
center = center.sub([0,100])
render._main.logical_size(camera.size);
function santa_button(img)
{
  return clay.draw([0,0], _ => {
    clay.vstack({}, _ => {
      clay.image(img, {size:btn_size,hovered:{color:Color.red}});
    });
  });
}

var img_tick = 1/7;

/*Object.defineProperty(Object.getPrototypeOf(Float32Array.prototype), 'add', {
  value: function(arr2) {
    var ret = this.slice();
    for (var i = 0; i < this.length; i++)
      ret[i] += arr2[i];
    return ret;
  },
});
*/
var btn_dist = 300;
var startvec = [];
var startrot = img_tick*3;
var santa = santa_button("santa");

var zoom = 1;

function drawtext(string, font, pos, color = Color.white)
{
  var entrymesh = os.make_text_buffer(string, pos, 0, color, -1, font);
  render._main.geometry(font.texture, entrymesh);
}

var puzzles = {
  toys: {
    answer:'furby',
    desc: "What was the hottest toy of the year 1998?",
  },
  coal: {
    answer:'krampus',
    desc:"Who is your enemy #1?"
  },
  reindeer: {
    answer:'633275',
    desc: "How many days has it been since the last accident?",
  },
  bellows: {
    answer:'smith',
    desc: "What is the maiden name of your wife, Mrs. Claus?",
  },
  stockings: {
    answer:'7052000000000',
    desc: "How many total presents have we delivered?",
  },
  glasses: {
    answer:'1753',
    desc: "How old are you?",
  },
  map: {
    answer:'superclaus3000',
    desc: "What is your go-to master password?"
  },
};

var img_dim = {
  width:100,
  height:100,
  anchor_y:0.5,
  anchor_x:0.5
}

var selected_puzz = undefined;
var hovered_puzz = undefined;
//render._main.viewport({x:0,y:0,height:1,width:1})
render._main.viewport()
var rotspeed = 0.01;
self.update = function(dt)
{
  bg_offset = bg_offset.add([1,1].scale(-dt*bg_speed));
  if (bg_offset.x < -tiletex.width)
    bg_offset = bg_offset.add([tiletex.width,tiletex.width]);
    
  render._main.scale([1,1])
  
  render._main.campos(camera.pos);
  startrot += rotspeed*dt;
}
var usefont = 'dos.ttf'
var myfont = os.make_font(io.slurpbytes(usefont), 32);
myfont.texture = render._main.load_texture(myfont.surface);
var bigfont = os.make_font(io.slurpbytes(usefont), 80);
bigfont.texture = render._main.load_texture(bigfont.surface)
var textmesh = os.make_text_buffer("grandma got ran over by a reindeer", [100,300], 0, Color.white, -1, myfont);

var line = os.make_line_prim([[0,0],[100,100],[0,500],[300,500]], 20, 0);  
line.color = os.make_color_buffer(Color.white, 10); 

var tileimg = os.make_texture(io.slurpbytes("candycane.jpg"));
var tiletex = render._main.load_texture(tileimg);

var bg_offset = [0,0];
var bg_speed = 30;
var bg_rect = {x:0,y:0,width:2000,height:2000};

var manysprites = [];
var wholesrc = {x:0,y:0,width:1,height:1};
for (var i = 0; i < 10000; i++)
  manysprites.push({
    dst: {x:Math.random()*1024,y:Math.random()*1024,width:10,height:10},
  });

var spritebatch;

self.draw = function()
{
//  render.image(santaimg, {x:300,y:100,anchor_y:0,anchor_x:0,width:100,height:100});
}

var entry = "";

var letter_rectangle = function(rect, letter) {
  render._main.fillrect(rect, Color.white)
}

var submitstate = ""

function checksubmit() {
  var puzz = puzzles[selected_puzz];
  if (!puzz) { 
    entry  = "";
    return;
  }

  if (entry == puzz.answer) {
    puzz.done = true;
    selected_puzz = undefined;
  }
  else
    submitstate = "TRY AGAIN!";

  entry = "";  
}

self.hud = function()
{
  game.engine_input(e => {
    switch(e.type) {
      case "quit":
        os.exit(0);
        break;
      case "mouse":
        input.mouse.pos = e.mouse;
        break;
      case "mouse_button":
        selected_puzz = hovered_puzz;
        entry = ""
        break;
      case "text":
        if (entry.length >= 5) break;
        entry += e.text;
        break;
      case "key":
        if (e.scancode == 42) entry.length--;
        if (e.scancode == 76) entry.length--;
        if (e.scancode == 40) checksubmit();
        if (e.scancode == 30) {
          for (var p in puzzles) puzzles[p].done = true
        }
        if (e.scancode == 63) reset();
        break;
    }
  });

  var mousepos = render._main.coords(input.mouse.pos);
  var hudpos = mousepos.slice();
  hudpos.y *= -1;
  var screenpos = mousepos.slice();
  screenpos.y *= -1;
  screenpos.y += camera.size.y;
  var viewpos = screenpos.slice();
  viewpos.x /= camera.size.x;
  viewpos.y /= camera.size.y;
  
//  mousepos.y *= -1;
//  mousepos.y += camera.size.y;
  render._main.tile(tiletex, geometry.rect_move(bg_rect,bg_offset), undefined, 1);
//  render.image(santaimg, {x:center.x, y:center.y,anchor_y:0.5,anchor_x:0.5,width:20,height:20});
//  render._main.texture(santaimg.texture, {x:center.x,y:center.y,anchor_y:1,anchor_x:0.5,width:30,height:30}, undefined, Color.red);
  
  var idx = 0;
  var pos = center.add(startvec);
  pos.anchor_x =0.5;
  pos.anchor_y = 0.5;
  hovered_puzz = undefined;
  var alldone = true;
  drawtext("SECRET SANTA COMPUTER", bigfont, [80,720], Color.red)  
  for (var p in puzzles) alldone &&= puzzles[p].done;
  if (alldone) {
    drawtext("THE SECRET WORD IS", bigfont, center.add([-300,200]), Color.green);
    drawtext("TOOTHPASTE", bigfont, center.add([-200,100]), Color.red);
    return;
  }

  var userot = startrot;

  for (var puzz in puzzles) {
    userot += img_tick;
    
    var dist = 1 + 0.3*Math.cos(4*Math.PI*userot);
    var startvec = vector.rotate([0,1], userot).scale(btn_dist/dist);
    var renderpos = startvec.add(center.add([0,20]));  
    var color = Color.white;
    var rect = {x:renderpos.x,y:renderpos.y};
    rect.__proto__ = img_dim;
    

    if (puzzles[puzz].done)
      color = Color.red;
    else if (geometry.rect_point_inside(rect,screenpos)) {
      color = Color.green;
      hovered_puzz = puzz;
    }
    if (selected_puzz === puzz) {
      var drawrect = geometry.rect_move(rect, [-5,-5]);
      drawrect.width += 10;
      drawrect.height += 10;
      render._main.fillrect(drawrect, Color.green);
    }
    render.image(puzz, rect, 0, color);
    console.log(json.encode(rect.width))
    startvec = vector.rotate(startvec, -img_tick);
  }

  if (selected_puzz) {
    var size = render.text_size("enter code and press return", myfont, 0, 0, -1);
    drawtext("enter code and press return", myfont, center.sub([size.x/2,100]), Color.green);

    var letterwidth  =40;
    var gap = 20;
    var totalwidth = letterwidth*5 + gap*4;
    var leftrect = {};
    leftrect.x = center.x - totalwidth/2
    leftrect.y = center.y;
    leftrect.width = letterwidth;
    leftrect.height = 70;
    for (var i = 0; i < 5; i++) {
      letter_rectangle(leftrect);

      var letter = entry[i];
      letter ??= ""
      var letterpos = [leftrect.x,leftrect.y];
      letterpos.x += 10;
      letterpos.y += 40
      drawtext(letter, myfont, letterpos, Color.red)
      leftrect.x += gap + letterwidth;      
    }
    drawtext(submitstate, myfont, center.add([-60,-30]), Color.green);
  } else {
    drawtext("SELECT A BOX TO TRY A CODE!", myfont, center.add([-200,30]), Color.white)
  }

//  render.image(myfont, [0,0]);
//  spritebatch = os.make_sprite_mesh(manysprites, spritebatch);
//  render._main.geometry(game.texture("santa").texture, spritebatch);

//  render._main.geometry(game.texture("santa").texture, line);
//  var textmesh = os.make_text_buffer("King santa is here", [350,100], 0, Color.white, -1, myfont);
/*  render._main.fasttext(mousepos.map(Math.round), screenpos, Color.white);
  render._main.fasttext(screenpos.map(Math.round), screenpos.sub([0,10]), Color.yellow)
  render._main.fasttext(viewpos, screenpos.sub([0,20]), Color.purple)
  render._main.fasttext(hudpos.map(Math.round), screenpos.sub([0,30]), Color.green)
*/
}
console.log("MADE GAME");
