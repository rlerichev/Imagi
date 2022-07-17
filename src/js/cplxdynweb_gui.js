
var GUIData = (function() { //  GUI Data Closure
  this.escape_crit_list = {
    "|z|^2>M^2":              0,
    "|Re(z)|>M":              1,
    "Re(z)>M":                2,
    "|Im(z)|>M":              3,
    "Im(z)>M":                4,
    "max{|Re(z)|,|Im(z)|}>M": 5,
    "|Re(z)|+|Im(z)|>M":      6
  };
  this.escape_crit = 0;
  this.escape_crit_mandel = 1;

  this.orbit_set = 0;

  this.color_map = 16;
  this.color_map_list = {
    "Rainbow":            0,
    "Rainbow Ext.":       1,
    "Rainbow Inv. Ext.":  2,
    "Black-White":        3,
    "Blue-Yellow":        4,
    "Green-Magenta":      5,
    "Red-Cyan":           6,
    "Blue-White-Red":     7,
    "Green-White-Orange": 8,
    "Violet-White-Green": 9,
    "Cold":              10,
    "Heat":              11,
    "Spring":            12,
    "Summer":            13,
    "Autum":             14,
    "Winter":            15,
    "Pastel":            16,
    "Dark Jet":          17,
    "Custom":            18
  };

  this.ccmi = 18 //this.color_map_list.length - 1
  this.invert_color_map = false;

  // Return closure
  return this;
})();


function configGUI(gui/*, Maths, Drawer*/) {

  // Used in "for" statements
  var i = 0;

  // Hide GUI controller
  this.hide = function(c) {
    c.domElement.parentElement.parentElement.style.height = "0px";
    //c.domElement.parentElement.parentElement.style.visibility = "hidden";
    c.domElement.parentElement.parentElement.style.display = "none";
  };

  // Show GUI controller
  this.show = function(c) {
    c.domElement.parentElement.parentElement.style.height = "";
    //c.domElement.parentElement.parentElement.style.visibility = "visible";
    c.domElement.parentElement.parentElement.style.display = "block";
  };

  // Hide GUI folder
  this.hideFolder = function(c) {
    c.domElement.parentElement.style.height = "0px";
    c.domElement.parentElement.style.visibility = "hidden";
  };

  // Show GUI folder
  this.showFolder = function(c) {
    c.domElement.parentElement.style.height = "";
    c.domElement.parentElement.style.visibility = "visible";
  };

  //
  // Function kind
  //
  var fun_kind_drop = gui
    .add(Maths, "function_kind", {"Piecewise Möbius": 0, "Piecewise general": 1, "General": 2})
    .name("Function kind");

  //
  // Function
  //

  // Piecewise Mobius Function
  //var pwmT_folder = gui.addFolder("Piecewise Möbius transformation");
  var pwmT_f_folder = gui.addFolder("f(z)"); //pwmT_folder
  pwmT_f_folder.add(Maths, "af_expr").name("a").onFinishChange(Maths.updatedFunction);
  pwmT_f_folder.add(Maths, "bf_expr").name("b").onFinishChange(Maths.updatedFunction);
  pwmT_f_folder.add(Maths, "cf_expr").name("c").onFinishChange(Maths.updatedFunction);
  pwmT_f_folder.add(Maths, "df_expr").name("d").onFinishChange(Maths.updatedFunction);
  var pwmT_g_folder = gui.addFolder("g(z)"); //pwmT_folder
  pwmT_g_folder.add(Maths, "ag_expr").name("a").onFinishChange(Maths.updatedFunction);
  pwmT_g_folder.add(Maths, "bg_expr").name("b").onFinishChange(Maths.updatedFunction);
  pwmT_g_folder.add(Maths, "cg_expr").name("c").onFinishChange(Maths.updatedFunction);
  pwmT_g_folder.add(Maths, "dg_expr").name("d").onFinishChange(Maths.updatedFunction);

  // General function
  var gT_f_text = gui.add(Maths, "hk_expr").name("f(z)").onFinishChange(Maths.updatedFunction);
  hide(gT_f_text);

  // Piecewise General Function
  var gT_g_text = gui.add(Maths, "h2k_expr").name("g(z)").onFinishChange(Maths.updatedFunction);
  hide(gT_g_text);

  // Piecewise domains
  var pw_dom_folder = gui.addFolder("Domain pieces"); //pwmT_folder
  pw_dom_folder.add(Maths, "r", -2.0, 8.05, 0.25)
    .step(0.05)
    .name("Radius")
    .onFinishChange(Drawer.updateDomain);
  pw_dom_folder.add(Maths, "c_expr")
    .name("Center")
    .onFinishChange(Drawer.updateDomain);

  //
  // Algorithms
  //
  var algos_folder = gui.addFolder("Algorithms");

  //
  // Algorithms Left Canvas Settings (Mandelbrot)
  //
  var algosetmandel_folder = algos_folder.addFolder("Left canvas (Mandelbrot)");
  algosetmandel_folder.add(Drawer, "drawMandelbrot").name("Mandelbrot");
  algosetmandel_folder.add(Maths, "seed_expr")
    .name("Seed Mandelbrot")
    .onFinishChange(Drawer.updateSeed)
    .listen();
  var max_its_mandel_sldr = algosetmandel_folder
    .add(Drawer, "max_its_mandel", 1, 1000)
    .step(1)
    .name("Iterations max");
  algosetmandel_folder
    .add(Maths, "max_mod_mandel", 0.5, 50.0)
    .step(0.5)
    .name("Modulus max.")
    .onFinishChange(Drawer.updateMaxModL);
  algosetmandel_folder
    .add(GUIData, "escape_crit_mandel", GUIData.escape_crit_list)
    .name("Escape criterion")
    .onChange(Drawer.updateEscapeL);

  //
  // Algorithms Right Canvas Settings
  //
  var algoset_folder = algos_folder.addFolder("Right canvas (Julia & more)");

  var julia_btn = algoset_folder.add(Drawer, "drawJulia").name("Trapped Points");
  var spid_btn = algoset_folder.add(Drawer, "drawSpiderweb").name("Spiderweb");
  var per_btn = algoset_folder.add(Drawer, "drawPeriodics").name("Periodic points");
  var preimmod_btn = algoset_folder.add(Drawer, "drawPreImage").name("Preimage modulus");
  var preimcri_btn = algoset_folder.add(Drawer, "drawPreImageCriticals").name("Preimage critical points");
  var preimarg_btn = algoset_folder.add(Drawer, "drawPreImageArg").name("Preimage argument");
  var spidp_btn = algoset_folder.add(Drawer, "drawSpiderwebPre").name("Preimage boundary");
  var itn_btn = algoset_folder.add(Drawer, "drawItineraries").name("Itineraries");

  julia_btn.domElement.parentElement.children[0].style.width = "128px";
  preimmod_btn.domElement.parentElement.children[0].style.width = "128px";
  preimcri_btn.domElement.parentElement.children[0].style.width = "128px";
  preimarg_btn.domElement.parentElement.children[0].style.width = "128px";
  spidp_btn.domElement.parentElement.children[0].style.width = "128px";
  per_btn.domElement.parentElement.children[0].style.width = "128px";

  algoset_folder
    .add(Maths, "k_expr")
    .name("k parameter")
    .onFinishChange(Drawer.updatedK)
    .listen();
  var max_its_sldr = algoset_folder
    .add(Drawer, "max_its", 1, 1000)
    .step(1)
    .name("Iterations max.");
  algoset_folder
    .add(Maths, "max_mod", 0.5, 50.0)
    .step(0.5)
    .name("Modulus max.")
    .onFinishChange(Drawer.updateMaxModR);
  algoset_folder
    .add(GUIData, "escape_crit", GUIData.escape_crit_list)
    .name("Escape criterion")
    .onChange(Drawer.updateEscapeR);
  algoset_folder
    .add(Drawer, "num_preimages", 1,200)
    .step(1)
    .name("Num. Pre.")
    .onChange(Drawer.updatePreimage);
  var bdry_thick_sldr = algoset_folder
    .add(Drawer, "boundary_thick", 0.2,4.0,0.1)
    .name("Thickness")
    .onFinishChange(Drawer.update);
  var bdry_thick_sldr2 = algoset_folder
    .add(Drawer, "boundary_thick2", 0.2,4.0,0.1)
    .name("Thickness Final")
    .onFinishChange(Drawer.update);    
  var over_spid_chck = algoset_folder
    .add(Drawer, "overlay_spiderweb")
    .name("Spid. over.")

  //
  // Orbits
  //
  var orbit_folder = algos_folder.addFolder("Orbits");
  orbit_folder.add(Drawer, "orbit_its", 1,2000,1).name("Iterations").onFinishChange(Drawer.update);
  orbit_folder.add(Drawer, "draw_lines").name("Draw lines").onChange(Drawer.update);

  var orbit_set_drop = orbit_folder
    .add(GUIData, "orbit_set", {"Point": 0, "Line": 1, "Rectangle": 2, "Circle": 3})
    .name("Orbit set");

  var orbit_points_drop = orbit_folder
    .add(Drawer, "orbit_points", 4, 2000, 2)
    .name("Num. points")
    .onFinishChange(Drawer.update);
  hide(orbit_points_drop);

  orbit_folder.add(Drawer, "z0_expr").name("z0").onFinishChange(Drawer.update).listen();
  var orbit_z1_text = orbit_folder.add(Drawer, "z1_expr").name("z1").onFinishChange(Drawer.update);
  hide(orbit_z1_text);
  orbit_folder.add(Drawer, "point_size", 0.5, 8.0, 0.5).name("Point size").onFinishChange(Drawer.update);
  orbit_folder.add(Drawer, "eraseOrbit").name("Erase orbit");

  orbit_set_drop.onChange(
    function(value) {
      Drawer.orbit_type = value;
      if(value == 0) {
        hide(orbit_z1_text);
        hide(orbit_points_drop);
      }
      else {
        show(orbit_z1_text);
        show(orbit_points_drop);
      }
      Drawer.drawOrbit();
    }
  );


  //
  // Canvases & Colors settings
  //
  var gsettings_folder = gui.addFolder("Canvases & colors");
  var resetlc_btn = gsettings_folder.add(Drawer, "resetLeftView").name("Reset left canvas");
  var resetrc_btn = gsettings_folder.add(Drawer, "resetRightView").name("Reset right canvas");
  resetlc_btn.domElement.parentElement.children[0].style.width = "128px";
  resetrc_btn.domElement.parentElement.children[0].style.width = "128px";

  gsettings_folder.add(Drawer, "show_axes").name("Axes").onChange(Drawer.update);
  gsettings_folder.add(Drawer, "show_labels").name("Labels").onChange(Drawer.update);
  var show_dom_opt = gsettings_folder
    .add(Drawer, "show_domain")
    .name("Domain")
    .onChange(Drawer.update)
    .listen();
  gsettings_folder.add(Drawer, "axes_thick", 0.2,4.0,0.2).name("Thickness").onFinishChange(Drawer.update);
  gsettings_folder.addColor(Drawer, "bg_color").name("Background").onFinishChange(Drawer.updateBGColor);
  gsettings_folder.addColor(Drawer, "fg_color").name("Foreground").onFinishChange(Drawer.updateFGColor);

  // Color Maps
  Drawer.createPalette(16, false);
  Drawer.createPaletteMandel(16, false);
  var color_map_folder = gsettings_folder.addFolder("Color map");
  var color_map_drop = color_map_folder
    .add(GUIData, "color_map", GUIData.color_map_list)
    .name("Color map");

  // Custom Color Map
  var custom_color_map_folder = color_map_folder.addFolder("Custom color map");
  var num_custom_colors_sldr = custom_color_map_folder
    .add(Drawer, "num_custom_colors", 2,8,5)
    .step(1)
    .name("Num. colors");

  var color_ctrls = [];
  var createCustomColorMap = function() {
    Drawer.createPalette(GUIData.ccmi, GUIData.invert_color_map);
    Drawer.createPaletteMandel(GUIData.ccmi, GUIData.invert_color_map);
    Drawer.update_canvas_l = true;
    Drawer.update_canvas_r = true;
  }
  for(i=0; i < 8; ++i)
    color_ctrls[i] = custom_color_map_folder
      .addColor(Drawer, "color"+(i+1))
      .name("Color "+(i+1))
      .onFinishChange(createCustomColorMap);
  hide(color_ctrls[5]); hide(color_ctrls[6]); hide(color_ctrls[7]);

  num_custom_colors_sldr.onFinishChange(
    function(value) {
      for(i=0; i < value; ++i)
        show(color_ctrls[i]);
      for(i=value; i < 8; ++i)
        hide(color_ctrls[i]);
      createCustomColorMap();
    }
  );

  color_map_drop.onChange(
    function(value) {
      if(value == GUIData.ccmi) {
        showFolder(custom_color_map_folder);
        custom_color_map_folder.open();
      }
      else {
        custom_color_map_folder.close();
        hideFolder(custom_color_map_folder);
      }
      GUIData.color_map = value;
      Drawer.createPalette(value, GUIData.invert_color_map);
      Drawer.createPaletteMandel(value, GUIData.invert_color_map);
      Drawer.update_canvas_l = true;
      Drawer.update_canvas_r = true;
    }
  );

  hideFolder(custom_color_map_folder);

  color_map_folder.add(GUIData, "invert_color_map").name("Invert").onChange(
    function(value) {
      Drawer.createPalette(GUIData.color_map, value);
      Drawer.createPaletteMandel(GUIData.color_map, value);
      Drawer.update_canvas_l = true;
      Drawer.update_canvas_r = true;
    }
  );

  max_its_sldr.onFinishChange(
    function(value) {
      Drawer.createPalette(GUIData.color_map, GUIData.invert_color_map);
      Drawer.update_canvas_r = true;
    }
  );
  max_its_mandel_sldr.onFinishChange(
    function(value) {
      Drawer.createPaletteMandel(GUIData.color_map, GUIData.invert_color_map);
      Drawer.update_canvas_l = true;
    }
  );

  //
  // Image sequences for video
  //
  //gsettings_folder.add(Drawer, "createImageSeq").name("Video");

  //
  // Languages
  //
  //language: ["English", "Spanish"]
  //gsettings_folder.add(gset_prms, "language", gset_prms.language).name("Language");
  //gui_folders_names[general][en])

  //
  // Help
  //
  var help_folder = gui.addFolder("Help");
  //gui.add(help_prms, "show_help").name("Help");
  this.showManual = function() { window.open("doc/Presentation.pdf","_blank"); };
  help_folder.add(this, "showManual").name("Manual");
  this.showAbout = function() {
    alert(
      "iMagi\n" +
      "A piecewise Möbius transformations families (and general families) asociated dynamics sets visualizator.\n" +
      "Developed by Renato Leriche Vázquez.\n" +
      "Facultad de Ciencias, UNAM.\n"
    );
  };
  //help_folder.add(this, "showAbout").name("About");

  //
  // Changing function kind
  //
  fun_kind_drop.onChange(
    function(value) {
      if(value == 0) { // Piecewise Möbius
        showFolder(pwmT_f_folder);
        showFolder(pwmT_g_folder);
        hide(gT_f_text);
        hide(gT_g_text);
        showFolder(pw_dom_folder);
        show(spid_btn);
        show(spidp_btn);
        show(itn_btn);
        Maths.seed_expr = "0.5";
        Drawer.show_domain = true;
        show(show_dom_opt);
      }
      else if(value == 1) { // Piecewise general
        hideFolder(pwmT_f_folder);
        hideFolder(pwmT_g_folder);
        show(gT_f_text);
        show(gT_g_text);
        hide(spid_btn);
        show(spidp_btn);
        show(itn_btn);
        showFolder(pw_dom_folder);
        Maths.seed_expr = "-0.5";
        Drawer.show_domain = true;
        show(show_dom_opt);
      }
      else { // General
        hideFolder(pwmT_f_folder);
        hideFolder(pwmT_g_folder);
        show(gT_f_text);
        hide(gT_g_text);
        hide(spid_btn);
        hide(spidp_btn);
        hide(itn_btn);
        hideFolder(pw_dom_folder);
        Maths.seed_expr = "0.0";
        Drawer.show_domain = false;
        hide(show_dom_opt);
      }

      //Maths.setFunctionKind(value);
      Maths.updateFunction();
      Drawer.right_kind = 0;
      //Drawer.drawMandelbrot();
      Drawer.resetLeftView();
      Drawer.resetRightView();
      //Drawer.update();
    }
  );
}
