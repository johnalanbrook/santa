gamestate.load_config = function () {
  var cnf = json.decode(io.slurp(config_file));
  for (var i in cnf) {
    if (!globalThis[i]) continue;
    Object.merge(globalThis[i], cnf[i]);
  }
};

globalThis.audio = {}
globalThis.acciodbg = {}

gamestate.save_config = function () {
  var config = {};
  config.debug = debug;
  config.audio = audio;
  config.acciodbg = acciodbg;
  config.prosperon = prosperon;
  io.slurpwrite(config_file, json.encode(config));
};

var config_file = ".prosperon/config.json";

var cnf = io.slurp(config_file);
if (!cnf) {
  gamestate.save_config();
  cnf = io.slurp(config_file);
}

cnf = json.decode(cnf);
cnf.prosperon ??= {};

if (prosperon.date < cnf.prosperon.date) {
  console.warn(`Need a newer version of Prosperon. This game was made with ${cnf.prosperon.version} [${cnf.prosperon.revision}]`);
  os.exit(0);
}

game.size = [640, 360];

gamestate.resolutions = [[640, 360], [640, 360].scale(2), [2732, 2048].scale(0.5)];
gamestate.msaa = [1, 2, 4, 8];
gamestate.load_config();
