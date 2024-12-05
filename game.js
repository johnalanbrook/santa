var background_color = [100/255,149/255,237/255,1];
var btn_size = [100,100];

function reset()
{
  entry = "";
  for (var p in puzzles) puzzles[p].done = undefined;
  lastfound = false;
}

function accept_match()
{
  lastfound = true;
  tween(0,1,1, x => {
    bgfill.a = x;
  })
}

var camera = {};
camera.pos = [0,0]; // cameras are in world coordinates
camera.size = [1024,758]; // size the camera sees in world units
camera.zoom = 1;
var center = camera.size.scale(0.5);
var merry = false

self.delay(_ => {
  merry = !merry;
  return 0.3;
}, 0.3);
var merrycolor = Object.create(Color.green);
merrycolor[3] = merry;

/*var bjork = io.slurpbytes("bjork.mpg");
var bvideo = os.make_video(bjork);

bvideo.callback = function(surf)
{
  bvideo.texture = render._main.load_texture(surf);
}
*/

var bgfill = Object.create(Color.red);
bgfill[3] = 0;

var santagif = io.slurpbytes("santa.gif")
santagif = os.make_gif(santagif);
for (var frame of santagif.frames)
  frame.texture = render._main.load_texture(frame.surface);

var santaframe = 0;

self.delay(_ => {
  santaframe++;
  santaframe %= santagif.frames.length;
  return santagif.frames[santaframe].time;
}, 0);

center = center.sub([0,100])
render._main.logical_size(camera.size);

var cams = game.cameras();
var webcam;
if (cams)
  webcam = game.open_camera(cams[0])
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
    answer:'639845',
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
    answer:'supersanta3000',
    desc: "What is your go-to master password?"
  },
};

for (var puzz in puzzles) {
  //fill with correct images
  var p = puzzles[puzz];
  var scaledsurf = game.texture(puzz).surface.scale([100,100]);
  p.texture = render._main.load_texture(scaledsurf);
}

var img_dim = []
img_dim.width = 100;
img_dim.height = 100;
img_dim.anchor_y = 0.5;
img_dim.anchor_x = 0.5;

var selected_puzz = undefined;
var hovered_puzz = undefined;
render.viewport()
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

var myfont = 'dos.32'
var bigfont = 'dos.80'

var donecolor = [0.5,0.5,0.5,1]

var redfont = {color:Color.red, background_color:Color.green};
var greenfont = {color:Color.green, background_color:Color.red};
var smallstyle = {font:myfont}
var bigstyle = {font:bigfont}

var line = os.make_line_prim([[0,0],[100,100],[0,500],[300,500]], 20, 0);  
line.color = os.make_color_buffer(Color.white, 10); 

var tileimg = os.make_texture(io.slurpbytes("candycane.jpg"));
var tiletex = render._main.load_texture(tileimg);

var bg_offset = [0,0];
var bg_speed = 30;
var bg_rect = {x:0,y:0,width:2000,height:2000};

var entry = "";

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
  else {
    self.delay(_ => submitstate = "", 1)
    submitstate = "TRY AGAIN!";
  }

  entry = "";  
}

var approved_cam = false;
self.hud = function()
{
  game.engine_input(e => {
    switch(e.type) {
      case "camera approved":
         approved_cam = true;
         break;
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
        var letters = puzzles[selected_puzz].answer.length;      
        if (entry.length >= letters) break;
        entry += e.text.toLowerCase();
        break;
      case "key":
        if (!e.down) return;
        if (e.scancode == 42) entry = entry.substring(0, entry.length-1)
        if (e.scancode == 76) entry = entry.substring(0, entry.length-1)
        if (e.scancode == 40) checksubmit();
        if (e.scancode == 30)
          for (var p in puzzles) puzzles[p].done = true
        if (e.scancode == 31) {
          lastfound = true;
          tween(0,1,1, x => {
            bgfill.a = x;
          })
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
  
  render.tile(tiletex, geometry.rect_move(bg_rect,bg_offset), undefined, 1);
  
  var idx = 0;
  var pos = center.add(startvec);
  pos.anchor_x =0.5;
  pos.anchor_y = 0.5;
  hovered_puzz = undefined;
  var alldone = true;
  layout.draw_commands(clay.draw(camera.size, _ => {
    clay.text("SECRET SANTA COMPUTER", {font:bigfont, color:Color.red, background_color:Color.white, padding:10, offset:[0,320]})
}));
  for (var p in puzzles) alldone &&= puzzles[p].done;
  if (alldone) {
    render_camera();
    return;
  }

  var userot = startrot;

  for (var puzz in puzzles) {
    var p = puzzles[puzz];
    userot += img_tick;
    
    var dist = 1 + 0.3*Math.cos(4*Math.PI*userot);
    var startvec = vector.rotate([0,1], userot).scale(btn_dist/dist);
    var rect = startvec.add(center.add([0,20]));
    rect.__proto__ = img_dim;
    var color = Color.white;

    if (puzzles[puzz].done)
      color = donecolor;
    else if (geometry.rect_point_inside(rect,screenpos)) {
      color = Color.green;
      hovered_puzz = puzz;
    }
    if (selected_puzz === puzz) {
      var drawrect = geometry.rect_move(rect, [-5,-5]);
      drawrect.width += 10;
      drawrect.height += 10;
      render.rectangle(drawrect, Color.green);
    }
    render.image(p, rect, 0, color);
    if (puzzles[puzz].done) render.image('check', rect, 0, Color.green)
  }

  if (selected_puzz) {
    var size = render.text_size("enter code and press return", myfont, 0, 0, -1);
    layout.draw_commands(clay.draw(camera.size, _ => {
      clay.text("enter code and press return", smallstyle);
    }))
    
    var letters = puzzles[selected_puzz].answer.length;

    var letterwidth = 40;
    var gap = 20;
    var totalwidth = letterwidth*letters + gap*(letters-1);
    var leftrect = {};
    leftrect.x = center.x - totalwidth/2
    leftrect.y = center.y;
    leftrect.width = letterwidth;
    leftrect.height = 70;
    for (var i = 0; i < letters; i++) {
      render.rectangle(leftrect, Color.white)
      var letter = entry[i];
      letter ??= ""
      var letterpos = [leftrect.x,leftrect.y];
      letterpos.x += 10;
      letterpos.y += 23
      render.text(letter,letterpos, myfont, 0, Color.red)
      leftrect.x += gap + letterwidth;      
    }
    render.text(submitstate, center.add([-60,-30]),myfont, 0, Color.green);
    
    layout.draw_commands(clay.draw(camera.size, _ => {
      clay.text(puzzles[selected_puzz].desc, smallstyle, greenfont,{ offset:[0,-150]});
    }))

  } else
    layout.draw_commands(clay.draw(camera.size, _ => {
      clay.text("SELECT A BOX TO TRY A CODE!", smallstyle,greenfont);
    }))
}

function render_camera()
{
  if (camgpu)
  layout.draw_commands(clay.draw(camera.size, _ => {
    clay.image(camgpu, {size:[640,480]});
  }));

  layout.draw_commands(clay.draw(camera.size, _ => {
    clay.image('border', {size:[800,640]});
  }));
  
  layout.draw_commands(clay.draw(camera.size, _ => {
    clay.text("PLEASE SHOW PRESET KEY", bigstyle,{offset:[0,-320]},redfont);
  }));

  if (lastfound) {
    render.rectangle({x:0,y:0,width:camera.size.x, height:camera.size.y},bgfill)
    layout.draw_commands(clay.draw(camera.size, _ => {
      clay.vstack({}, _ => {
      clay.text("VALID ID SHOWN!!", {font:bigfont});
      clay.text("THE CODE IS 9941!", {font:bigfont});
      clay.text("MERRY CHRISTMAS!", {font:bigfont, color:merrycolor})      

      clay.image(santagif.frames[santaframe], {x:0,y:0,width:200,height:200});
      merrycolor.a = merry ? 1 : 0

     });
    }));
  }

  if (!approved_cam) return;
  var camsurf = webcam.frame();
  if (!camsurf)
    return;
 
  camsurfs.push(camsurf)
  var cc = camsurf.dup();
  if (!lastfound)
    if (os.match_img(cc, detect.surface, 15)) accept_match();
    
  camgpu = {
    texture: render._main.load_texture(cc),
    surface: cc
  }

  webcam.release_frame(camsurf)
}

var camsurfs = [];
var camgpu;
var lastfound = false;
var detect = game.texture('find.jpg');
