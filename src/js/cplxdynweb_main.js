
function onResize() {
  Drawer.resize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", onResize, true);

window.onload = function() {

  Maths.updateFunction();

  var gui = new dat.GUI();
  /*{load: JSON, preset: "Default"}*/
  //gui.remember(Maths);
  //gui.remember(Drawer);
  //gui.remember(GUIData);

  //initGL();

  configGUI(gui);

  Drawer.updateBGColor();

  onResize();
};
