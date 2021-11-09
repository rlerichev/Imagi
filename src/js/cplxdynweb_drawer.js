
var Drawer = (function() { //  drawerClosure

  /////////////////////////////////////////////////////////////////////////////
  // Inner Variables and Functions
  //

  //
  // "Private" variables
  //
  var
    canvas_2d_l = document.getElementById("canvas_2d_l"),
    canvas_2d_r = document.getElementById("canvas_2d_r");

/*var imageMimes = ['image/png', 'image/jpeg', 'image/tiff']; //Extend as necessary
var acceptedMimes = new Array();
for(i = 0; i < imageMimes.length; i++) {
  if(canvas_2d_r.toDataURL(imageMimes[i]).search(imageMimes[i])>=0) {
    acceptedMimes[acceptedMimes.length] = imageMimes[i];
  }
}*/

  var
    c2dl = canvas_2d_l.getContext("2d"),
    c2dr = canvas_2d_r.getContext("2d");

  c2dl.imageSmoothingEnabled = true;
  c2dr.imageSmoothingEnabled = true;

  var
    imgl = c2dl.getImageData(0,0,1,1),
    imgr = c2dr.getImageData(0,0,1,1);

  var
    left0 = 0, top0 = 0, right0 = 0,
    min_xl = -2.0, max_xl = 2.0, min_yl = -2.0, max_yl = 2.0,
    min_xr = -2.0, max_xr = 2.0, min_yr = -2.0, max_yr = 2.0,
    canvas_side = 500;

  var color_maps = [
    [ [0,0,255], [0,255,255], [0,255,0], [255,255,0], [255,0,0] ],
    [ [0,0,0], [0,0,255], [0,255,255], [0,255,0], [255,255,0], [255,0,0], [255,255,255] ],
    [ [0,0,0], [255,0,0], [255,255,0], [0,255,0], [0,255,255], [0,0,255], [255,255,255] ],
    [ [0,0,0], [255,255,255] ],
    [ [0,0,128], [252,248,32] ],
    [ [0,128,0], [248,32,252] ],
    [ [128,0,0], [32,252,248] ],
    [ [0,24,128], [255,255,255], [248,16,8] ],
    [ [0,128,16], [255,255,255], [220,128,8] ],
    [ [128,0,128], [255,255,255], [0,240,0] ],
    [ [0,0,0], [8,16,220], [255,255,255] ],
    [ [0,0,0], [224,16,4], [255,255,0] ],
    [ [248,80,200], [8,64,16], [252,248,80] ],
    [ [32,164,16], [16,32,64], [112,248,100] ],
    [ [128,32,0], [80,128,16], [248,224,64] ],
    [ [248,248,248], [4,0,32], [64,152,248] ],
    [ [255,255,255], [192,220,220], [64,160,220], [160,220,128], [248,255,0], [255,0,0] ],
    [ ]
  ];

  var palette = [];
  var palette_mandel = [];

  var palette_id = 16;
  var palette_inv = false;

  var img_pix = c2dr.createImageData(1,1); // only do this once per page //3,3
  var img_pix_data = img_pix.data;         // only do this once per page
  var current_color = [255,255,255];

  //var pwm_flag = true;
  //var type_r = 0;
  var right_kind_list = ["Trapped Points", "Preimage Modulus", "Preimage Argument",
    "Spiderweb", "Preimage Boundary", "Itineraries", "Periodic Points", "Preimage Critics"];
  var box = null;

  //var canvas_gl = document.getElementById("canvas_gl"), gl = canvas_gl.getContext("webgl");
  //var vertex_shader, fragment_shader,

  function wToXL(w) { return min_xl + (max_xl-min_xl)*w/canvas_side; }
  function hToYL(h) { return min_yl + (max_yl-min_yl)*(canvas_side-h)/canvas_side; }
  function wToXR(w) { return min_xr + (max_xr-min_xr)*w/canvas_side; }
  function hToYR(h) { return min_yr + (max_yr-min_yr)*(canvas_side-h)/canvas_side; }
  function xToWL(x) { return canvas_side*(x-min_xl)/(max_xl-min_xl); }
  function yToHL(y) { return canvas_side - canvas_side*(y-min_yl)/(max_yl-min_yl); }
  function xToWR(x) { return canvas_side*(x-min_xr)/(max_xr-min_xr); }
  function yToHR(y) { return canvas_side - canvas_side*(y-min_yr)/(max_yr-min_yr); }
  function sToWHL(s){ return canvas_side*s/(max_xl-min_xl); }
  function sToWHR(s){ return canvas_side*s/(max_xr-min_xr); }
  function zOutsideCanvasR(z) { return (z.r < min_xr || z.i < min_yr || z.r > max_xr || z.i > max_yr); }

  //
  // "Public" variables, binded with GUI
  //
  this.mths = {}; // Extern "Maths" object
  this.right_kind = 0;
  this.update_canvas_l = true;
  this.update_canvas_r = true;

  // Colors
  this.bg_color = "#ffffff"; //"#fefefe";
  this.fg_color = "#000000"; //"#f0f0f0";

  // Palette
  this.num_custom_colors = 5;
  this.color1 = "#000000";
  this.color2 = "#00c0ff";//"#102040";
  this.color3 = "#400040";//"#40d0f0";
  this.color4 = "#c0ff00";//"#f02010";
  this.color5 = "#ff0000";//"#f8f8a0";
  this.color6 = "#00ff00";//"#40d0f0";
  this.color7 = "#002040";//"#f02010";
  this.color8 = "#ffffff";//"#f8f8a0";

  // Show drawing elements
  this.show_axes = true;
  this.show_labels = true;
  this.show_domain = true;
  this.axes_thick = 1.0;
  this.boundary_thick = 1.0;

  this.max_its = 64;
  //this.max_mod = 2.0;
  this.max_its_mandel = 64;

  this.num_preimages = 12;
  var update_preimages = true;

  this.overlay_spiderweb = false;

  // Orbits
  this.orbit_type = 0; //0: Point, 1: Line, 2: Rectangle, 3: Circunference
  this.orbit_points = 256;
  this.z0_expr = "1+i";
  this.z1_expr = "0";
  this.point_size = 2;
  this.draw_lines = true;
  this.orbit_its = 64;
  this.show_orbit = false;

  /////////////////////////////////////////////////////////////////////////////
  // Redraw and Update
  //

  //
  //
  //
  function redrawImageL() {
    update_canvas_l = true;
    drawMandelbrot();
  }

  //
  //
  //
  function redrawImageR() {
    update_canvas_r = true;
         if(right_kind == 1) drawPreImage(); //drawImageJulia(Maths.pwmT);
    else if(right_kind == 2) drawPreImageArg();
    else if(right_kind == 3) drawSpiderweb();
    else if(right_kind == 4) drawSpiderwebPre();
    else if(right_kind == 5) drawItineraries();
    else if(right_kind == 6) drawPeriodics();
    else if(right_kind == 7) drawPreImageCriticals();
    else                     drawJulia();
  }

  //
  // Resize
  //
  this.resize = function(ww, wh) {
    ww -= 280;

    var need_redraw = false;

    if( ww > 2*wh ) {
      if( canvas_side != wh - 16 ) {
        canvas_side = wh - 16;
        left0 = Math.floor((ww/2 - canvas_side));
        top0 = 8;
        need_redraw = true;
      }
    }
    else {
      if( canvas_side != Math.floor(ww/2) ) {
        canvas_side = Math.floor(ww/2);
        left0 = 8;
        top0 = Math.floor((wh - canvas_side)/2);
        need_redraw = true;
      }
    }

    right0 = left0 + canvas_side + 8;

    canvas_2d_l.style.left = "" + left0 + "px";
    canvas_2d_l.style.top = "" + top0 + "px";
    canvas_2d_r.style.left = "" + right0 + "px";
    canvas_2d_r.style.top = "" + top0 + "px";

    canvas_2d_l.width = canvas_side;//viewport_width;
    canvas_2d_l.height = canvas_side;//viewport_height;

    canvas_2d_r.width = canvas_side;//viewport_width;
    canvas_2d_r.height = canvas_side;//viewport_height;

    //gl.uniform1f(viewport_width_loc, viewport_width);
    //gl.uniform1f(viewport_height_loc, viewport_height);

    //if(gl) {
    //  gl.viewport(0, 0, canvas_gl.width, canvas_gl.height);
    //  drawScene();
    //}

    if(need_redraw) {
      redrawImageL();
      redrawImageR();
    }

    //document.getElementById('divcoords').style.right = left0 + canvas_side;

    update();
  }; // Resize

  //
  // Update foreground color
  //
  this.updateFGColor = function() {
    canvas_2d_l.style.foregroundColor = fg_color;
    canvas_2d_r.style.foregroundColor = fg_color;
    update();
  };

  //
  // Update background color
  //
  this.updateBGColor = function() {
    canvas_2d_l.style.backgroundColor = bg_color;
    canvas_2d_r.style.backgroundColor = bg_color;
    update();
  };

  //
  //
  //
  this.updateDomain = function() {
    Maths.updateDomainData();
    update_canvas_l = true;
    update_canvas_r = true;
    update();
  };

  //
  //
  //
  this.updatedK = function() {
    Maths.updateFunction();
    Maths.parseK();
    update_canvas_l = false;
    update_canvas_r = true;
    update();
  };

  //
  //
  //
  this.updateSeed = function() {
    Maths.parseSeed();
    update_canvas_l = true;
    update();
  };

  //
  //
  //
  this.updatedFunction = function() {
    Maths.updateFunction();
    update_canvas_l = true;
    update_canvas_r = true;
    update();
  };

  //
  //
  //
  this.updateMaxModL = function(n) {
    Maths.max_mod_mandel = n;
    Maths.max_mod2_mandel = n*n;
    Maths.setEscapeCriterionMandel(Maths.escape_crit_mandel);
    update_canvas_l = true;
    update();
  };

  //
  //
  //
  this.updateEscapeL = function(sc) {
    if(sc == -1)
      Maths.setEscapeCriterionMandel(Maths.escape_crit_mandel);
    else
      Maths.setEscapeCriterionMandel(sc);
    update_canvas_l = true;
    update();
  };

  //
  //
  //
  this.updateMaxModR = function(n) {
    Maths.max_mod = n;
    Maths.max_mod2 = n*n;
    Maths.setEscapeCriterion(Maths.escape_crit);
    update_canvas_r = true;
    update();
  };

  //
  //
  //
  this.updateEscapeR = function(sc) {
    if(sc == -1)
      Maths.setEscapeCriterion(Maths.escape_crit);
    else
      Maths.setEscapeCriterion(sc);
    update_canvas_r = true;
    update();
  };

  //
  //
  //
  this.updatePreimage = function() {
    update_preimages = true;
    update_canvas_r = true;
    update();
  };

  //
  //
  //
  function clearAll() {
    c2dl.clearRect(0, 0, canvas_side, canvas_side);
    c2dr.clearRect(0, 0, canvas_side, canvas_side);
    //show_orbit = false;
  }

  //
  //
  //
  this.eraseOrbit = function() {
    show_orbit = false;
    update();
  };

  //
  //
  //
  this.update = function() {
    clearAll();

    c2dl.putImageData(imgl, 0, 0);
    c2dr.putImageData(imgr, 0, 0);

    if(show_axes)
      drawAxes();

    if(show_labels)
      drawLabels();

    if(show_domain)
      drawDomain();

    if(show_orbit)
      drawOrbit();

    drawS();
  };

  //
  //
  //
  this.resetLeftView = function() {
    min_xl = -2.0;
    max_xl =  2.0;
    min_yl = -2.0;
    max_yl =  2.0;
    redrawImageL();
    update();
  };

  //
  //
  //
  this.resetRightView = function() {
    min_xr = -2.0;
    max_xr =  2.0;
    min_yr = -2.0;
    max_yr =  2.0;
    redrawImageR();
    update();
  };


  /////////////////////////////////////////////////////////////////////////////
  // Draw Elements
  //

  //
  //
  //
  function drawLine( ctx, x0, y0, x1, y1 ) {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }

  //
  //
  //
  function drawCirc( ctx, x0, y0, r ) {
    ctx.beginPath();
    ctx.arc(x0, y0, r, 0, Maths.PI2);
    ctx.stroke();
  }

  //
  //
  //
  function drawDot( ctx, x0, y0, r ) {
    ctx.beginPath();
    ctx.arc(x0, y0, r, 0, Maths.PI2);
    ctx.fill();
    //ctx.lineWidth = 2;
    //ctx.stroke();
  }

  //
  //
  //
  function drawPixel( ctx, x0, y0 ) {
    img_pix_data[0] = current_color[0];
    img_pix_data[1] = current_color[1];
    img_pix_data[2] = current_color[2];
    img_pix_data[3] = 255;
    ctx.putImageData( img_pix, x0, y0 );
  }

  //
  //
  //
  function drawArc( ctx, x0, y0, r, ab, ae ) {
    ctx.beginPath();
    ctx.arc(x0, y0, r, ab, ae);
    ctx.stroke();
  }

  //
  //
  //
  function drawAxes() {
    c2dl.strokeStyle = fg_color;
    c2dl.lineWidth = axes_thick;
    drawLine(c2dl, xToWL(min_xl), yToHL(0.0),    xToWL(max_xl), yToHL(0.0));
    drawLine(c2dl, xToWL(0.0),    yToHL(min_yl), xToWL(0.0),    yToHL(max_yl));

    c2dr.strokeStyle = fg_color;
    c2dr.lineWidth = axes_thick;
    drawLine(c2dr, xToWR(min_xr), yToHR(0.0),    xToWR(max_xr), yToHR(0.0));
    drawLine(c2dr, xToWR(0.0),    yToHR(min_yr), xToWR(0.0),    yToHR(max_yr));
  }

  //
  //
  //
  function drawLabels() {
    c2dl.fillStyle = fg_color;
    c2dl.font="20px Arial";
    c2dl.textAlign = "center";
    c2dl.fillText("Mandelbrot", canvas_side/2, 20);

    c2dl.font="16px Arial";
    c2dl.fillText("seed = " + Maths.seed_expr, canvas_side/2, 40);

    c2dl.textAlign = "right";
    c2dl.fillText((new Complex(max_xl,max_yl)).toString(true,6),canvas_side-10,20);

    c2dl.textAlign = "left";
    c2dl.fillText((new Complex(min_xl,min_yl)).toString(true,6),10,canvas_side-10);

    c2dr.fillStyle = fg_color;

    c2dr.font="20px Arial";
    c2dr.textAlign = "center";
    c2dr.fillText(right_kind_list[right_kind], canvas_side/2, 20);

    c2dr.font="16px Arial";
    c2dr.fillText("k = " + Maths.k_expr, canvas_side/2, 40);

    c2dr.textAlign = "right";
    c2dr.fillText((new Complex(max_xr,max_yr)).toString(true,6),canvas_side-10,20);

    c2dr.textAlign = "left";
    c2dr.fillText((new Complex(min_xr,min_yr)).toString(true,6),10,canvas_side-10);
  } // drawLabels

  //
  //
  //
  function drawDomain() {
    var c = Maths.c;
    var r = Maths.r;

    c2dl.strokeStyle = fg_color;
    c2dl.lineWidth = 1.1*axes_thick;
    c2dr.strokeStyle = fg_color;
    c2dr.lineWidth = 1.1*axes_thick;

    if( r <= 0.001 ) {
      var angle = -r*Math.PI, l = 2.0*Math.max(max_xl-min_xl,max_xr-min_xr);
      var ca = Math.cos(angle), sa = Math.sin(angle);
      var vx = l*ca, vy = l*sa;
      drawLine(c2dl, xToWL(c.r - vx), yToHL(c.i - vy), xToWL(c.r + vx), yToHL(c.i + vy));
      drawLine(c2dr, xToWR(c.r - vx), yToHR(c.i - vy), xToWR(c.r + vx), yToHR(c.i + vy));
      c2dl.lineWidth = 1.5*axes_thick;
      c2dr.lineWidth = 1.5*axes_thick;
      drawLine(c2dl, xToWL(c.r), yToHL(c.i), xToWL(c.r)+10*sa, yToHL(c.i)+10*ca);
      drawLine(c2dr, xToWR(c.r), yToHR(c.i), xToWR(c.r)+10*sa, yToHR(c.i)+10*ca);
    }
    else {
      drawCirc(c2dl, xToWL(c.r), yToHL(c.i), sToWHL(r));
      drawCirc(c2dr, xToWR(c.r), yToHR(c.i), sToWHR(r));
    }

    c2dl.strokeStyle = fg_color;
    c2dl.lineWidth = axes_thick/2.0;
    drawCirc(c2dl, xToWL(0.0), yToHL(0.0), sToWHL(1.0));
  } // drawDomain

  //
  // Draw cross for ubication of family parameter k
  //
  function drawS() {
    var ws = xToWL(Maths.k.r), hs = yToHL(Maths.k.i);
    c2dl.strokeStyle = fg_color;
    c2dl.lineWidth = axes_thick;
    drawLine(c2dl, ws-10, hs,    ws+10, hs   );
    drawLine(c2dl, ws,    hs-10, ws,    hs+10);
  }

  ////////////////////////////////////////////////////////////////////////////
  // Palette
  //

  //
  //
  //
  /*function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }*/
  function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ?
      [ parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16) ]
    : [0,0,0];
  }

  //
  // Create colors palette for Julia, Spiderweb, etc.
  //
  this.createPalette = function(cmi, inv) {
    var i=0, n=0, index=0, delta=0.0;
    var ctrl_colors = [];

    palette_id = cmi;
    palette_inv = inv;

    if(!color_maps[cmi]) ctrl_colors = [ [0,0,255], [0,255,255], [0,255,0], [255,255,0], [255,0,0] ];
    else {
      if( cmi == 17 ) {
        var custom_colors = [];
        custom_colors[0] = color1;
        custom_colors[1] = color2;
        custom_colors[2] = color3;
        custom_colors[3] = color4;
        custom_colors[4] = color5;
        custom_colors[5] = color6;
        custom_colors[6] = color7;
        custom_colors[7] = color8;
        color_maps[17] = [];
        for(i=0;i<num_custom_colors;++i) {
          ctrl_colors[i] = hexToRgb(custom_colors[i]);
          color_maps[17][i] = ctrl_colors[i];
        }
      }
      else
        ctrl_colors = color_maps[cmi].slice();
    }

    var n_ctrl_colors = ctrl_colors.length-1,
      N = max_its/(ctrl_colors.length-1), //N0 = 0,
      rstep = 0.0, gstep = 0.0, bstep = 0.0;

    palette = [];

    if(inv) //ctrl_colors.reverse();
      for(i=0; i < color_maps[cmi].length; ++i)
        ctrl_colors[i] = color_maps[cmi][color_maps[cmi].length-1-i];

    for(i = 0; i < n_ctrl_colors; ++i) {
      rstep = (ctrl_colors[i+1][0] - ctrl_colors[i][0]) / N;
      gstep = (ctrl_colors[i+1][1] - ctrl_colors[i][1]) / N;
      bstep = (ctrl_colors[i+1][2] - ctrl_colors[i][2]) / N;

      //N0 = Math.floor((i+1)*N)/(i+1);
      for(n = 0; n < N; ++n) {
        palette[index] = [
          Math.floor(ctrl_colors[i][0] + rstep*n),
          Math.floor(ctrl_colors[i][1] + gstep*n),
          Math.floor(ctrl_colors[i][2] + bstep*n)
        ];
        ++index;
      }
    }

    for(n = index < max_its ? index : max_its-1; n <= max_its+2; ++n)
      palette[n] = ctrl_colors[n_ctrl_colors];

    palette[0] = ctrl_colors[0];
  }; // createPalette

  //
  // Create colors palette for Mandelbrot
  //
  this.createPaletteMandel = function(cmi, inv) {
    var i=0, n=0, index=0, delta=0.0;
    var ctrl_colors = [];

    if(!color_maps[cmi]) ctrl_colors = [ [0,0,255], [0,255,255], [0,255,0], [255,255,0], [255,0,0] ];
    else {
      if( cmi == 17 ) {
        var custom_colors = [];
        custom_colors[0] = color1;
        custom_colors[1] = color2;
        custom_colors[2] = color3;
        custom_colors[3] = color4;
        custom_colors[4] = color5;
        custom_colors[5] = color6;
        custom_colors[6] = color7;
        custom_colors[7] = color8;
        color_maps[17] = [];
        for(i=0;i<num_custom_colors;++i) {
          ctrl_colors[i] = hexToRgb(custom_colors[i]);
          color_maps[17][i] = ctrl_colors[i];
        }
      }
      else
        ctrl_colors = color_maps[cmi].slice();
    }

    var n_ctrl_colors = ctrl_colors.length-1,
      N = max_its_mandel/(ctrl_colors.length-1), //N0 = 0,
      rstep = 0.0, gstep = 0.0, bstep = 0.0;

    palette_mandel = [];

    if(inv) //ctrl_colors.reverse();
      for(i=0; i < color_maps[cmi].length; ++i)
        ctrl_colors[i] = color_maps[cmi][color_maps[cmi].length-1-i];

    for(i = 0; i < n_ctrl_colors; ++i) {
      rstep = (ctrl_colors[i+1][0] - ctrl_colors[i][0]) / N;
      gstep = (ctrl_colors[i+1][1] - ctrl_colors[i][1]) / N;
      bstep = (ctrl_colors[i+1][2] - ctrl_colors[i][2]) / N;

      //N0 = Math.floor((i+1)*N)/(i+1);
      for(n = 0; n < N; ++n) {
        palette_mandel[index] = [
          Math.floor(ctrl_colors[i][0] + rstep*n),
          Math.floor(ctrl_colors[i][1] + gstep*n),
          Math.floor(ctrl_colors[i][2] + bstep*n)
        ];
        ++index;
      }
    }

    for(n = index < max_its_mandel ? index : max_its_mandel-1; n <= max_its_mandel+2; ++n)
      palette_mandel[n] = ctrl_colors[n_ctrl_colors];

    palette_mandel[0] = ctrl_colors[0];
  }; // createPaletteMandel


  /////////////////////////////////////////////////////////////////////////////
  // Drawing Algortihms
  // Using zr and zi, because of slow (?) access to member z.r and z.i
  //

  //
  // Mandelbot set
  //
  this.drawMandelbrot = function() {
    if(!update_canvas_l) return 0;
    update_canvas_l = false;

    var i = 0, j = 0, n = 0, index = 0/*, N = max_its_mandel-1*/;
    var dx = (max_xl-min_xl)/canvas_side, dy = (max_yl-min_yl)/canvas_side;
    var s = Complex.ZERO, z = Complex.ZERO;
    var sr = 0.0, si  = 0.0;

    imgl = c2dl.createImageData(canvas_side, canvas_side);

    Maths.parseSeed();
    Maths.updateFunction();

    index = 0;
    si = max_yl
    for(j = 0; j < canvas_side; ++j) {

      sr = min_xl;
      for(i = 0; i < canvas_side; ++i) {
        s.r = sr;
        s.i = si;

        z = Maths.Fk(s, Maths.seed);

        n = 0;
        while(n < max_its_mandel && Maths.bounded_mandel(z) ) {
          z = Maths.Fk(s, z);
          ++n;
        }

        imgl.data[  index] = palette_mandel[n][0]; // red
        imgl.data[++index] = palette_mandel[n][1]; // green
        imgl.data[++index] = palette_mandel[n][2]; // blue
        imgl.data[++index] = 255;          // alpha
        ++index;

        sr += dx;
      }

      si -= dy;
    }

    update();
  }; // drawMandelbrot

  //
  // Julia set
  //
  this.drawJulia = function() {
    if(!update_canvas_r && right_kind == 0) return 0;
    update_canvas_r = false;
    right_kind = 0;

    var i = 0, j = 0, n = 0, index = 0/*, N = max_its-1*/;
    var dx = (max_xr-min_xr)/canvas_side, dy = (max_yr-min_yr)/canvas_side;
    var z = Complex.ZERO;
    var zr = 0.0, zi = 0.0;

    imgr = c2dr.createImageData(canvas_side, canvas_side);

    index = 0;
    zi = max_yr;
    for(j = 0; j < canvas_side; ++j) {

      zr = min_xr;
      for(i = 0; i < canvas_side; ++i) {
        z.r = zr;
        z.i = zi;

        n = 0;
        while(n < max_its && Maths.bounded(z)) {
          z = Maths.F(z);
          ++n;
        }

        imgr.data[  index] = palette[n][0]; // red
        imgr.data[++index] = palette[n][1]; // green
        imgr.data[++index] = palette[n][2]; // blue
        imgr.data[++index] = 255;          // alpha
        ++index;

        zr += dx;
      }

      zi -= dy;
    }

    if( overlay_spiderweb )
      drawSpiderwebMono();

    update();
  }; // drawJulia

  //
  // Gauss Bell Color gradient
  //
  function cExp(c_max,c_min,x) {
    return Math.floor(c_min+(c_max-c_min)*Math.exp(-x*x));
  }

  //
  // Pre Image
  //
  this.drawPreImage = function() {
    if(!update_preimages && !update_canvas_r && right_kind == 1) return 0;
    update_preimages = false;
    update_canvas_r = false;
    right_kind = 1;

    var i = 0, j = 0, m = 0, n = 0, index = 0;
    var dx = (max_xr-min_xr)/canvas_side, dy = (max_yr-min_yr)/canvas_side;
    var z = Complex.ZERO;
    var zr = 0.0, zi = 0.0, z_mod2 = 0.0, M = Maths.max_mod2*4;

    imgr = c2dr.createImageData(canvas_side, canvas_side);

    index = 0;
    zi = max_yr;
    for(j = 0; j < canvas_side; ++j) {

      zr = min_xr;
      for(i = 0; i < canvas_side; ++i) {
        z.r = zr;
        z.i = zi;

        z_mod2 = 0.0;
        m = 0;
        while(m < num_preimages && z_mod2 < M) {
          z = Maths.F(z);
          z_mod2 = z.r*z.r + z.i*z.i;
          ++m;
        }

        if( z_mod2 < Maths.max_mod2 ) {
          n = max_its - Math.ceil(max_its*Math.sqrt(z_mod2)/Maths.max_mod);
          imgr.data[  index] = palette[n][0]; // red
          imgr.data[++index] = palette[n][1]; // green
          imgr.data[++index] = palette[n][2]; // blue
          imgr.data[++index] = 255; // alpha
        }
        else {
          imgr.data[  index] = palette[0][0]; //cExp(255,palette[0][0],z_mod); // red
          imgr.data[++index] = palette[0][1]; //cExp(255,palette[0][1],z_mod); // green
          imgr.data[++index] = palette[0][2]; //cExp(255,palette[0][2],z_mod); // blue
          imgr.data[++index] = cExp(192, 128, Maths.max_mod2 - z_mod2); // alpha
        }

        ++index;

        zr += dx;
      }

      zi -= dy;
    }

    if( overlay_spiderweb )
      drawSpiderwebMono();

    update();
  }; // drawPreImage

  //
  // Pre Image & Argument
  //
  this.drawPreImageArg = function() {
    if(!update_preimages && !update_canvas_r && right_kind == 2) return 0;
    update_preimages = false;
    update_canvas_r = false;
    right_kind = 2;

    var i = 0, j = 0, n = 0, m = 0, index = 0, alpha = 255;
    var dx = (max_xr-min_xr)/canvas_side, dy = (max_yr-min_yr)/canvas_side;
    var z = Complex.ZERO;
    var zr = 0.0, zi = 0.0, a = 0.0, A = max_its/(2.01*Math.PI), z_mod2=0.0, M=1024*Maths.max_mod2;

    imgr = c2dr.createImageData(canvas_side, canvas_side);

    index = 0;
    zi = max_yr;
    for(j = 0; j < canvas_side; ++j) {

      zr = min_xr;
      for(i = 0; i < canvas_side; ++i) {
        z.r = zr;
        z.i = zi;

        z_mod2 = 0.0;
        for(m=0; m < num_preimages; ++m) {
          if(z_mod2 > M /*isNaN(z_mod2) || z_mod2 == Infinity*/) break;
          z = Maths.F(z);
          z_mod2 = z.r*z.r + z.i*z.i;
        }

        if(z_mod2 > M /*isNaN(z_mod2) || z_mod2 == Infinity*/) {
          //a = 0.0;
          n = 0;
          alpha = 128;
        }
        else {
          a = Math.atan2(z.i, z.r);
          if( a < 0.0 ) a += Maths.PI2;
          n = Math.floor(a*A);
          alpha = (z_mod2 <= Maths.max_mod2) ? 255 : cExp(192,128, Maths.max_mod2-z_mod2);
        }

        imgr.data[  index] = palette[n][0]; // red
        imgr.data[++index] = palette[n][1]; // green
        imgr.data[++index] = palette[n][2]; // blue
        imgr.data[++index] = alpha; // alpha
        ++index;

        zr += dx;
      }

      zi -= dy;
    }

    if( overlay_spiderweb )
      drawSpiderwebMono();

    update();
  }; // drawPreImageArg


  //
  // Spiderweb
  //
  this.drawSpiderweb = function() {
    if(!update_canvas_r && right_kind == 3) return 0;
    update_canvas_r = false;
    right_kind = 3;

    var n = 0, i = 0, index = 0, N = 0;
    var psz = boundary_thick, epsilon = (max_xr-min_xr)/(2.0*canvas_side);//(max_xr-min_xr+0.0001)/(2.0*canvas_side-2.0);

    epsilon *= epsilon;

    c2dr.clearRect(0, 0, canvas_side, canvas_side);

    Maths.updatePWMTInv();

// Disc domain or F with inversion
    if( Maths.r > 0.0 || ( Maths.r < 0.001 && ( Maths.f_has_inv || Maths.g_has_inv ) ) ) {

      var N2 = 0, n_points = 0, incr=1;
      var points_prev = [], points_next = [];
      var z = Complex.ZERO, z_prev = Complex.ZERO;
      var r2 = 0.0001, r2_ = -0.0001, max_mod2 = Math.max((max_xr-min_xr)*(max_xr-min_xr), 25.0);

      c2dr.fillStyle = 'rgb('+palette[0][0]+','+palette[0][1]+','+palette[0][2]+')';
      c2dr.strokeStyle = 'rgb('+palette[0][0]+','+palette[0][1]+','+palette[0][2]+')';

      if( Maths.r < 0.001 ) { // Half-plane domain
        N = 10*canvas_side;
        z = (Maths.boundary.ze.sub(Maths.boundary.zb)).rDiv(N);
        for(n=0; n<=N; ++n) {
          points_prev[n] = Maths.boundary.zb.add(z.rMult(n));
          //drawDot(c2dr, xToWR(points_prev[n].r), yToHR(points_prev[n].i), psz);
        }
        c2dr.lineWidth = psz;
        drawLine( c2dr, xToWR(Maths.boundary.zb.r), yToHR(Maths.boundary.zb.i),
                        xToWR(Maths.boundary.ze.r), yToHR(Maths.boundary.ze.i));
      }
      else { // Disc domain
        r2 = Maths.r*Maths.r + 0.0001;
        r2_ = Maths.r*Maths.r - 0.0001;
        N = Math.floor(Maths.PI2*Maths.r*canvas_side/(max_xr-min_xr));
        var a = 0;

        for(n=0; n<N; ++n) {
          a = (Maths.PI2*n)/N;
          points_prev[n] = Maths.c.add(new Complex(Maths.r*Math.cos(a), Maths.r*Math.sin(a)));
          drawDot(c2dr, xToWR(points_prev[n].r), yToHR(points_prev[n].i), psz);
        }
      }

      N2 = 3*N;

      for(n=1; n <= max_its; ++n) {
        n_points = points_prev.length;

        if( n_points <= 1 ) break;

        c2dr.fillStyle = 'rgb('+palette[n][0]+','+palette[n][1]+','+palette[n][2]+')';
        //current_color = palette[n]; // for drawPixel

        index = 0;

        psz = boundary_thick - (0.75*boundary_thick)*n/max_its;

        z = Maths.f_1(points_prev[0]);
        if( Maths.distanceToDomain(z) < r2_ /*&& (z.r*z.r+z.i*z.i) < max_mod2*/ ) {
          //drawPixel(c2dr, xToWR(z.r), yToHR(z.i));
          drawDot(c2dr, xToWR(z.r), yToHR(z.i), psz);
          points_next[index++] = z;
        }
        z_prev = z;

        for(i=1; i<n_points; i+=incr) {
          z = Maths.f_1(points_prev[i]);
          if( Maths.dist2(z,z_prev) < epsilon ) continue;
          //if( (z.r*z.r+z.i*z.i) > max_mod2 ) continue;
          if( Maths.distanceToDomain(z) < r2_ ) {
          //if( !(z.r < min_xr || z.i < min_yr || z.r > max_xr || z.i > max_yr ) )
            //drawPixel(c2dr, xToWR(z.r), yToHR(z.i));
            drawDot(c2dr, xToWR(z.r), yToHR(z.i), psz);
          points_next[index++] = z;
          }
          z_prev = z;
        }

        z = Maths.g_1(points_prev[0]);
        if( Maths.distanceToDomain(z) > r2 /*&& (z.r*z.r+z.i*z.i) < max_mod2*/ ) {
          //drawPixel(c2dr, xToWR(z.r), yToHR(z.i));
          drawDot(c2dr, xToWR(z.r), yToHR(z.i), psz);
          points_next[index++] = z;
        }
        z_prev = z;

        for(i=1; i<n_points; i+=incr) {
          z = Maths.g_1(points_prev[i]);
          if( Maths.dist2(z,z_prev) < epsilon ) continue;
          //if( (z.r*z.r+z.i*z.i) > max_mod2 ) continue;
          if( Maths.distanceToDomain(z) > r2 ) {
          //if( !(z.r < min_xr || z.i < min_yr || z.r > max_xr || z.i > max_yr ) )
            //drawPixel(c2dr, xToWR(z.r), yToHR(z.i));
            drawDot(c2dr, xToWR(z.r), yToHR(z.i), psz);
            points_next[index++] = z;
          }
          z_prev = z;
        }

        if( points_next.length > N2 )
          incr = 2;
        else
          incr = 1;

        // Update points lists
        points_prev = [];
        points_prev = points_next;
        points_next = [];
      }
    }

    else { // Hemiplane domain and F without inversion
      var j=0, n_segs = 0, M = 1000*max_its;
      var f_1 = Maths.f_1_ls, g_1 = Maths.g_1_ls;
      var f_1_seg = Maths.boundary, g_1_seg = Maths.boundary;
      var segs_in = [], segs_out = [], spiderweb_level_prev = [], spiderweb_level_next = [];

      spiderweb_level_prev[0] = Maths.boundary;

      c2dr.lineWidth = psz;
      c2dr.strokeStyle = 'rgb('+palette[0][0]+','+palette[0][1]+','+palette[0][2]+')';

      drawLine( c2dr,
        xToWR(Maths.boundary.zb.r), yToHR(Maths.boundary.zb.i),
        xToWR(Maths.boundary.ze.r), yToHR(Maths.boundary.ze.i));

      for(n=1; n<=max_its; ++n) {
        n_segs = spiderweb_level_prev.length;

        if( n_segs === 0 ) break;
        if( n_segs > M) n = max_its;

        c2dr.strokeStyle = 'rgb('+palette[n][0]+','+palette[n][1]+','+palette[n][2]+')';
       //c2dr.fillStyle = 'rgb('+palette[n][0]+','+palette[n][1]+','+palette[n][2]+')';

        //psz = 1.05 - 0.55*n/max_its;
        psz = boundary_thick - (0.75*boundary_thick)*n/max_its;

        c2dr.lineWidth = psz;

        index = 0;
        for(i=0; i<n_segs; ++i) {

          f_1_seg = f_1(spiderweb_level_prev[i]);
          if( Maths.dist2(f_1_seg.zb, f_1_seg.ze) > epsilon ) {
            segs_in = Maths.cutInLDomainLS(f_1_seg);
            for(j=0; j<segs_in.length; ++j) {
              spiderweb_level_next[index++] = segs_in[j];
              drawLine( c2dr,
                xToWR(segs_in[j].zb.r), yToHR(segs_in[j].zb.i),
                xToWR(segs_in[j].ze.r), yToHR(segs_in[j].ze.i));
            }
          }

          g_1_seg = g_1(spiderweb_level_prev[i]);
          if( Maths.dist2(g_1_seg.zb, g_1_seg.ze) > epsilon ) {
            segs_out = Maths.cutOutLDomainLS(g_1_seg);
            for(j=0; j<segs_out.length; ++j) {
              spiderweb_level_next[index++] = segs_out[j];
              drawLine( c2dr,
                xToWR(segs_out[j].zb.r), yToHR(segs_out[j].zb.i),
                xToWR(segs_out[j].ze.r), yToHR(segs_out[j].ze.i));
            }
          }

          segs_in = [];
          segs_out = [];
        }

        spiderweb_level_prev = [];
        spiderweb_level_prev = spiderweb_level_next;
        spiderweb_level_next = [];
      }
    }

    imgr = c2dr.getImageData(0,0,canvas_side,canvas_side);

    update();
  }; // drawSpiderweb


  //
  // Spiderweb Monochromatic
  //
  this.drawSpiderwebMono = function() {
    //if(!update_canvas_r && right_kind == 3) return 0;
    update_canvas_r = true;
    //right_kind = 3;

    var n = 0, i = 0, index = 0, N = 0;
    var psz = boundary_thick, epsilon = (max_xr-min_xr)/(2.0*canvas_side);

    epsilon *= epsilon;

    Maths.updatePWMTInv();

    c2dr.clearRect(0, 0, canvas_side, canvas_side);
    c2dr.putImageData(imgr, 0, 0);

    c2dr.fillStyle = fg_color;
    c2dr.strokeStyle = fg_color;

    // Disc domain or F with inversion
    if( Maths.r > 0.0 || ( Maths.r < 0.001 && ( Maths.f_has_inv || Maths.g_has_inv ) ) ) {

      var N2 = 0, n_points = 0, incr=1;
      var points_prev = [], points_next = [];
      var z = Complex.ZERO, z_prev = Complex.ZERO;
      var r2 = 0.0001, r2_ = -0.0001, max_mod2 = Math.max((max_xr-min_xr)*(max_xr-min_xr), 25.0);

      if( Maths.r < 0.001 ) { // Half-plane domain
      N = 10*canvas_side;
      z = (Maths.boundary.ze.sub(Maths.boundary.zb)).rDiv(N);
      for(n=0; n<=N; ++n) {
        points_prev[n] = Maths.boundary.zb.add(z.rMult(n));
      }
      c2dr.lineWidth = psz;
      drawLine( c2dr, xToWR(Maths.boundary.zb.r), yToHR(Maths.boundary.zb.i),
                      xToWR(Maths.boundary.ze.r), yToHR(Maths.boundary.ze.i));
    }
    else { // Disc domain
      r2 = Maths.r*Maths.r + 0.0001;
      r2_ = Maths.r*Maths.r - 0.0001;
      N = Math.floor(Maths.PI2*Maths.r*canvas_side/(max_xr-min_xr));
      var a = 0;

      for(n=0; n<N; ++n) {
        a = (Maths.PI2*n)/N;
        points_prev[n] = Maths.c.add(new Complex(Maths.r*Math.cos(a), Maths.r*Math.sin(a)));
        drawDot(c2dr, xToWR(points_prev[n].r), yToHR(points_prev[n].i), psz);
      }
    }

    N2 = 3*N;

    for(n=1; n <= max_its; ++n) {
      n_points = points_prev.length;

      if( n_points <= 1 ) break;

      index = 0;

      psz = boundary_thick - (0.75*boundary_thick)*n/max_its;

      z = Maths.f_1(points_prev[0]);
      if( Maths.distanceToDomain(z) < r2_ ) {
        drawDot(c2dr, xToWR(z.r), yToHR(z.i), psz);
        points_next[index++] = z;
      }
      z_prev = z;

      for(i=1; i<n_points; i+=incr) {
        z = Maths.f_1(points_prev[i]);
        if( Maths.dist2(z,z_prev) < epsilon ) continue;
        if( Maths.distanceToDomain(z) < r2_ ) {
          drawDot(c2dr, xToWR(z.r), yToHR(z.i), psz);
        points_next[index++] = z;
        }
        z_prev = z;
      }

      z = Maths.g_1(points_prev[0]);
      if( Maths.distanceToDomain(z) > r2 ) {
        drawDot(c2dr, xToWR(z.r), yToHR(z.i), psz);
        points_next[index++] = z;
      }
      z_prev = z;

      for(i=1; i<n_points; i+=incr) {
        z = Maths.g_1(points_prev[i]);
        if( Maths.dist2(z,z_prev) < epsilon ) continue;
        if( Maths.distanceToDomain(z) > r2 ) {
          drawDot(c2dr, xToWR(z.r), yToHR(z.i), psz);
          points_next[index++] = z;
        }
        z_prev = z;
      }

      if( points_next.length > N2 )
        incr = 2;
      else
        incr = 1;

      // Update points lists
      points_prev = [];
      points_prev = points_next;
      points_next = [];
    }
  }

  else { // Hemiplane domain and F without inversion
    var j=0, n_segs = 0, M = 1000*max_its;
    var f_1 = Maths.f_1_ls, g_1 = Maths.g_1_ls;
    var f_1_seg = Maths.boundary, g_1_seg = Maths.boundary;
    var segs_in = [], segs_out = [], spiderweb_level_prev = [], spiderweb_level_next = [];

    spiderweb_level_prev[0] = Maths.boundary;

    c2dr.lineWidth = psz;

    drawLine( c2dr,
      xToWR(Maths.boundary.zb.r), yToHR(Maths.boundary.zb.i),
      xToWR(Maths.boundary.ze.r), yToHR(Maths.boundary.ze.i));

    for(n=1; n<=max_its; ++n) {
      n_segs = spiderweb_level_prev.length;

      if( n_segs === 0 ) break;
      if( n_segs > M) n = max_its;

      psz = boundary_thick - (0.75*boundary_thick)*n/max_its;

      c2dr.lineWidth = psz;

      index = 0;
      for(i=0; i<n_segs; ++i) {

        f_1_seg = f_1(spiderweb_level_prev[i]);
        if( Maths.dist2(f_1_seg.zb, f_1_seg.ze) > epsilon ) {
          segs_in = Maths.cutInLDomainLS(f_1_seg);
          for(j=0; j<segs_in.length; ++j) {
            spiderweb_level_next[index++] = segs_in[j];
            drawLine( c2dr,
              xToWR(segs_in[j].zb.r), yToHR(segs_in[j].zb.i),
              xToWR(segs_in[j].ze.r), yToHR(segs_in[j].ze.i));
          }
        }

        g_1_seg = g_1(spiderweb_level_prev[i]);
        if( Maths.dist2(g_1_seg.zb, g_1_seg.ze) > epsilon ) {
          segs_out = Maths.cutOutLDomainLS(g_1_seg);
          for(j=0; j<segs_out.length; ++j) {
            spiderweb_level_next[index++] = segs_out[j];
            drawLine( c2dr,
              xToWR(segs_out[j].zb.r), yToHR(segs_out[j].zb.i),
              xToWR(segs_out[j].ze.r), yToHR(segs_out[j].ze.i));
          }
        }

        segs_in = [];
        segs_out = [];
      }

        spiderweb_level_prev = [];
        spiderweb_level_prev = spiderweb_level_next;
        spiderweb_level_next = [];
      }
    }

    imgr = c2dr.getImageData(0,0,canvas_side,canvas_side);

    update();
  }; // drawSpiderwebMono


  //
  // Itineraries
  //
  this.drawItineraries = function() {
    if(!update_preimages && !update_canvas_r && right_kind == 5) return 0;
    update_preimages = false;
    update_canvas_r = false;
    right_kind = 5;

    var n = 0, i = 0, j = 0, index=0, m=0, N = 0;
    var z = Complex.ZERO;
    var d2 = 0.0, d2_ = 0.0, x = 0.0, y = 0.0, bin=0.0, M=0.0, z_mod2=0.0, dis=0.0,
        dx = (max_xr-min_xr)/canvas_side, dy = (max_yr-min_yr)/canvas_side, R=1024*Maths.z_mod2;
    var on_boundary = false;

    //c2dr.clearRect(0, 0, canvas_side, canvas_side);
    imgr = c2dr.createImageData(canvas_side, canvas_side);

    if( Maths.r > 0.001 ) { // Disc domain
      d2  = Maths.r*Maths.r + dx;
      d2_ = Maths.r*Maths.r - dx;
    }
    else {
      d2  =  dx;
      d2_ = -dx;
    }

    index = 0;
    y = max_yr;
    for(j=0; j<canvas_side; ++j) {

      x = min_xr;
      for(i=0; i<canvas_side; ++i) {

        z.r = x;
        z.i = y;
        z_mod2 = 0.0
        //itn = 0;
        //draw_pixel = true;

        M = max_its/2.01;
        bin = 0.0;
        //on_boundary = false;
        for(m=0; m < num_preimages; ++m) {
          if( R > z_mod2/*isNaN(z_mod) || z_mod2 == Infinity*/ ) {
            bin = 0.0;
            break;
          }

          if( M < 0.000001 || isNaN(M) ) break;

          dis = Maths.distanceToDomain(z);
          /*if( dis < d2 && dis > d2_ ) {
             on_boundary = true;
             break;
          }
          else*/
            if( dis < d2 ) bin += M;

          z = Maths.F(z);
          z_mod2 = z.r*z.r + z.i*z.i;
          M *= 0.5;

          /*if( Maths.distanceToDomain(z) < r2_ ) {
            itn += 1;
            itn <<= 1;
          }
          else if( Maths.distanceToDomain(z) > r2 ) {
            itn <<= 1;
          }
          else {
            draw_pixel = false;
            break;
          }*/
        }

        /*if( draw_pixel ) {
          n = Math.floor(itn*M2);
          current_color = palette[n];
          drawPixel(c2dr, i, j);
        }*/
        /*if(on_boundary) {
          imgr.data[  index] = 0; // red
          imgr.data[++index] = 0; // green
          imgr.data[++index] = 0; // blue
          imgr.data[++index] = 128; // alpha
        }
        else {*/
          n = Math.floor(bin);
          imgr.data[  index] = palette[n][0]; // red
          imgr.data[++index] = palette[n][1]; // green
          imgr.data[++index] = palette[n][2]; // blue
          imgr.data[++index] = 255;          // alpha
        //}
        ++index;

        x += dx;
      }

      y -= dy;
    }

    if( overlay_spiderweb )
      drawSpiderwebMono();

    //imgr = c2dr.getImageData(0,0,canvas_side,canvas_side);
    update();
  }; // Itineraries

  //
  // Spiderweb from Boundary PreImage
  //
  this.drawSpiderwebPre = function() {
    if(!update_preimages && !update_canvas_r && right_kind == 4) return 0;
    update_preimages = false;
    update_canvas_r = false;
    right_kind = 4;

    var i = 0, j = 0, index = 0, n = 0, m = 0, N = max_its-1;
    var z = Complex.ZERO;
    var d2 = 0.5, d2_ = -0.5, zr = 0.0, zi = 0.0, z_mod2 = 0.0,
        a=0.0, A = max_its/(2.01*Math.PI),
        dx = (max_xr-min_xr)/canvas_side, dy = (max_yr-min_yr)/canvas_side,
        dis=0.0, M=1024*Maths.z_mod2;
    var on_boundary = false, is_disc = true;
    var bgc = [], fgc = [];

    //c2dr.clearRect(0, 0, canvas_side, canvas_side);
    imgr = c2dr.createImageData(canvas_side, canvas_side);

    is_disc = Maths.r > 0.001;
    if( is_disc ) { // Disc
      d2  = Maths.r*Maths.r + dx;
      d2_ = Maths.r*Maths.r - dx;
    }
    else { // Hemiplane
      d2  =  dx;
      d2_ = -dx;
    }

    bgc = hexToRgb(bg_color);
    fgc = hexToRgb(fg_color);

    /*N2 = N*2+1;
    for(n=0; n<N2; ++n) {
      dc = n/(N2-1);
      palette_gray[n] = [
        Math.floor(bgc[0] + (fgc[0]-bgc[0])*dc),
        Math.floor(bgc[1] + (fgc[1]-bgc[1])*dc),
        Math.floor(bgc[2] + (fgc[2]-bgc[2])*dc)
      ];
    }*/

    index = 0;
    zi = max_yr;
    for(j=0; j<canvas_side; ++j) {

      zr = min_xr;
      for(i=0; i<canvas_side; ++i) {

        z.r = zr;
        z.i = zi;
        on_boundary = false;
        z_mod2 = 0.0;
        for(m=0; m < num_preimages; ++m) {
          if(z_mod2 >= M/*isNaN(z_mod) || z_mod == Infinity*/) {
            break;
            dis = M;
          }
          /*if( Maths.distanceToDomain(z) < r2_ ) {
            itn += 1;
          }
          else if( Maths.distanceToDomain(z) > r2 ) {
            itn -= 1;
          }
          else {*/
          dis = Maths.distanceToDomain(z);
          if( dis < d2 && dis > d2_ ) {
            on_boundary = true;
            break;
          }

          z = Maths.F(z);
          z_mod2 = z.r*z.r + z.i*z.i;
        }

//if( z_mod2 >= M/*isNaN(z_mod) || z_mod == Infinity*/) {
  //a = 0.0;
//  n = N;
//}
//else {
        if( on_boundary ) {
          //current_color = palette[n];
          //drawPixel(c2dr, i, j);

          if(is_disc) { // Disc
            a = Math.atan2(z.i-Maths.c.i, z.r-Maths.c.r);
            if( a < 0.0 ) a += Maths.PI2;
            n = Math.floor(a*A);
          }
          else { // Hemiplane
            z.r -= Maths.c.r;
            z.i -= Maths.c.i;
            z_mod2 = z.r*z.r+z.i*z.i;
            n = Math.floor(N*(1.0-Math.exp(-z_mod2)));
          }

          imgr.data[  index] = palette[n][0]; // red
          imgr.data[++index] = palette[n][1]; // green
          imgr.data[++index] = palette[n][2]; // blue
          imgr.data[++index] = 255;          // alpha
        }
        else {
          //current_color = palette_gray[itn];
          //drawPixel(c2dr, i, j);

          if(dis < d2) {
            imgr.data[  index] = fgc[0];//cExp(palette[n][0],fgc[0],64*(dis-d2)); // red
            imgr.data[++index] = fgc[1];//cExp(palette[n][1],fgc[1],64*(dis-d2)); // green
            imgr.data[++index] = fgc[2];//cExp(palette[n][2],fgc[2],64*(dis-d2)); // blue
          }
          else { //if(dis > r2_) {
            imgr.data[  index] = bgc[0];//cExp(palette[n][0],bgc[0],64*(dis-d2_)); // red
            imgr.data[++index] = bgc[1];//cExp(palette[n][1],bgc[1],64*(dis-d2_)); // green
            imgr.data[++index] = bgc[2];//cExp(palette[n][2],bgc[2],64*(dis-d2_)); // blue
          }
          imgr.data[++index] = 192;//cExp(224,64,dis-d2);          // alpha
        }

        ++index;

        zr += dx;
      }

      zi -= dy;
    }

    //imgr = c2dr.getImageData(0,0,canvas_side,canvas_side);

    update();
  }; // drawSpiderwebPre


  //
  // Orbit
  //
  this.drawOrbit = function() {
    var n = 0, i = 0, j = 0, N = Math.floor(orbit_points);
    var point_set = [];
    var x = 0.0, y = 0.0;
    var z0 = Complex.parseFunction(z0_expr)(),
        z1 = Complex.parseFunction(z1_expr)(),
        z_prev = z0;

    show_orbit = false;
    update();

    //c2dr.clearRect(0, 0, canvas_side, canvas_side);

    if( orbit_type == 1 ) { // Line segment
      var v = z1.sub(z0).rDiv(N-1.0);
      for(i=0; i<N; ++i)
        point_set[i] = z0.add(v.rMult(i));
    }
    else if( orbit_type == 2 ) { // Square
      N = Math.floor(Math.sqrt(N));
      var dx = (z1.r-z0.r)/(N-1);
      var dy = (z1.i-z0.i)/(N-1);
      for(j=0; j<N; ++j)
        for(i=0; i<N; ++i)
          point_set[i+j*N] = new Complex(z0.r+i*dx, z0.i+j*dy);
      N = N*N;
    }
    else if( orbit_type == 3) { // Circle
      var da = Maths.PI2/(N-1);
      var r = z1.sub(z0).mag();
      point_set[0] = z0;
      for(i=0; i<N; ++i)
        point_set[i+1] = new Complex(z0.r+r*Math.cos(i*da), z0.i+r*Math.sin(i*da));
    }
    else { // Point
      point_set[0] = z0;
      N = 1;
    }

    c2dr.fillStyle = bg_color;
    c2dr.strokeStyle = fg_color;
    c2dr.lineWidth = 1.0;

    for(n=0; n<orbit_its; ++n) {
      //c2dr.fillStyle = 'rgb('+palette[n][0]+','+palette[n][1]+','+palette[n][2]+')';
      for(i=0; i<N; ++i) {
        x = xToWR(point_set[i].r);
        y = yToHR(point_set[i].i);
        drawDot(c2dr, x, y, point_size);
        drawCirc(c2dr, x, y, point_size);
        point_set[i] = Maths.F(point_set[i]);
      }
      if(draw_lines) {
        drawLine(c2dr, xToWR(z_prev.r), yToHR(z_prev.i), xToWR(point_set[0].r), yToHR(point_set[0].i));
        z_prev = point_set[0];
      }
    }
    drawDot(c2dr, xToWR(point_set[0].r), yToHR(point_set[0].i), point_size);
    drawCirc(c2dr, xToWR(point_set[0].r), yToHR(point_set[0].i), point_size+1);

    //imgr = c2dr.getImageData(0,0,canvas_side,canvas_side);

    show_orbit = true;
  }; // drawOrbit


  //
  // Periodic points ("finding" F^n(z)-z = 0).
  //
  this.drawPeriodics = function() {
    if(!update_preimages && !update_canvas_r && right_kind == 6) return 0;
    update_preimages = false;
    update_canvas_r = false;
    right_kind = 6;

    var i = 0, j = 0, m = 0, n = 0, index = 0/*, N=max_its-1*/;
    var dx = (max_xr-min_xr)/canvas_side, dy = (max_yr-min_yr)/canvas_side;
    var z = Complex.ZERO;
    var zr = 0.0, zi = 0.0, z_mod2 = 0.0, M=1024*Maths.max_mod2;

    imgr = c2dr.createImageData(canvas_side, canvas_side);

    index = 0;
    zi = max_yr;
    for(j = 0; j < canvas_side; ++j) {

      zr = min_xr;
      for(i = 0; i < canvas_side; ++i) {
        z.r = zr;
        z.i = zi;

        z_mod2 = 0.0;
        m=0;
        while( m < num_preimages && z_mod2 < M) {
          z = Maths.F(z);
          z_mod2 = z.r*z.r + z.i*z.i;
          ++m;
        }

        z.r = z.r - zr;
        z.i = z.i - zi;
        z_mod2 = z.r*z.r + z.i*z.i;

        //if(isNaN(z_mod) || z_mod == Infinity) z_mod = Maths.max_mod2;

        if( z_mod2 < Maths.max_mod2 ) {
          //z_mod = Math.sqrt(z_mod);
          n = max_its - Math.ceil(max_its*Math.sqrt(z_mod2)/Maths.max_mod);
          //if(n >= max_its) n = max_its-1;
          imgr.data[  index] = palette[n][0]; // red
          imgr.data[++index] = palette[n][1]; // green
          imgr.data[++index] = palette[n][2]; // blue
          imgr.data[++index] = 255; // alpha
        }
        else {
          //z_mod = Maths.max_mod2-z_mod;
          imgr.data[  index] = palette[0][0]; // red
          imgr.data[++index] = palette[0][1]; // green
          imgr.data[++index] = palette[0][2]; // blue
          imgr.data[++index] = cExp(192,128,Maths.max_mod2-z_mod2); // alpha
        }

        ++index;

        zr += dx;
      }

      zi -= dy;
    }

    if( overlay_spiderweb )
      drawSpiderwebMono();

    update();
  }; // drawPeriodics

//
// Pre Image Critic points
//
this.drawPreImageCriticals = function() {
  if(!update_preimages && !update_canvas_r && right_kind == 7) return 0;
  update_preimages = false;
  update_canvas_r = false;
  right_kind = 7;

  var i = 0, j = 0, m = 0, n = 0, index = 0;
  var dx = (max_xr-min_xr)/canvas_side, dy = (max_yr-min_yr)/canvas_side;
  var z=Complex.ZERO, z_nor=Complex.ZERO, z_sou=Complex.ZERO, z_wes=Complex.ZERO, z_eas=Complex.ZERO;
  var zr = 0.0, zi = 0.0, z_mod2 = 0.0, M=1024*Maths.max_mod2;

  imgr = c2dr.createImageData(canvas_side, canvas_side);

  index = 0;
  zi = max_yr;
  for(j = 0; j < canvas_side; ++j) {

    zr = min_xr;
    for(i = 0; i < canvas_side; ++i) {
      z.r = zr;
      z.i = zi;

      z_mod2 = 0.0;
      m=0;
      while(m < num_preimages && z_mod2 < M) {
        z = Maths.F(z);
        z_mod2 = z.r*z.r + z.i*z.i;
        ++m;
      }

      z_nor.r = z.r; z_nor.i = z.i + dy;
      z_sou.r = z.r; z_sou.i = z.i - dy;
      z_wes.r = z.r - dx; z_wes.i = z.i;
      z_eas.r = z.r + dx; z_eas.i = z.i;

      z_nor = Maths.F(z_nor);
      z_sou = Maths.F(z_sou);
      z_wes = Maths.F(z_wes);
      z_eas = Maths.F(z_eas);

      z.r = ((z_eas.r - z_wes.r)/dx + (z_nor.r - z_sou.r)/dy)/4.0;
      z.i = ((z_nor.i - z_sou.i)/dy + (z_eas.i - z_wes.i)/dx)/4.0;
      z_mod2 = z.r*z.r + z.i*z.i;

      if( z_mod2 < Maths.max_mod2 ) {
        n = max_its - Math.ceil(max_its*Math.sqrt(z_mod2)/*z_mod*//Maths.max_mod);
        imgr.data[  index] = palette[n][0]; // red
        imgr.data[++index] = palette[n][1]; // green
        imgr.data[++index] = palette[n][2]; // blue
        imgr.data[++index] = 255; // alpha
      }
      else {
        imgr.data[  index] = palette[0][0]; //cExp(255,palette[0][0],z_mod); // red
        imgr.data[++index] = palette[0][1]; //cExp(255,palette[0][1],z_mod); // green
        imgr.data[++index] = palette[0][2]; //cExp(255,palette[0][2],z_mod); // blue
        imgr.data[++index] = cExp(192,128,Maths.max_mod2-z_mod2); // alpha
      }

      ++index;

      zr += dx;
    }

    zi -= dy;
  }

  update();
};


  /////////////////////////////////////////////////////////////////////////////
  // Events
  //

  //
  // Left Canvas 2D Events
  //
  canvas_2d_l.ondblclick = function(e) {
    if(!(e.ctrlKey || e.shiftKey)) {
      var k_loc = new Complex(wToXL(e.clientX-left0), hToYL(e.clientY-top0));
      Maths.k_expr = k_loc.toString(true,6);
      Maths.updateFunction();
      Maths.k = k_loc;
      //update();
      redrawImageR();
      update();
    }

    box = null;
  };

  canvas_2d_l.onmousedown = function(e) {
    if( (e.ctrlKey || e.shiftKey) && box == null )
      box = [e.clientX, e.clientY, 0, 0];
  };

  canvas_2d_l.onmousemove = function(e) {
    document.getElementById('divcoords').textContent =
      (new Complex(wToXL(e.clientX-left0), hToYL(e.clientY-top0))).toString(true,8);

    if( /*e.ctrlKey &&*/ box != null ) {
      // clear out old box first
      update();

      // draw new box
      var l = Math.min(e.clientX-box[0], e.clientY-box[1]);
      box[2] = box[0]+l;
      box[3] = box[1]+l;

      c2dl.lineWidth = 2;
      c2dl.strokeStyle = fg_color;
      c2dl.strokeRect(box[0]-left0, box[1]-top0, l, l);
    }
  };

  canvas_2d_l.onmouseup = function(e) {
    if ( /*e.ctrlKey &&*/ box != null ) {
      var lw = box[2]-box[0], lh = box[3]-box[1], l=0.0;
      var min_xl_tmp = 0.0, max_yl_tmp = 0.0,
          max_xl_tmp = 0.0, min_yl_tmp = 0.0;

      if( lw > 0.0 && lh > 0.0 ) { // Zoom in
        min_xl_tmp = wToXL(box[0]-left0);
        max_yl_tmp = hToYL(box[1]-top0);
        max_xl_tmp = wToXL(box[2]-left0);
        min_yl_tmp = hToYL(box[3]-top0);

        l = Math.min(max_xl_tmp - min_xl_tmp, max_yl_tmp - min_yl_tmp);

        min_xl = min_xl_tmp;
        max_yl = max_yl_tmp;
        max_xl = min_xl_tmp + l;
        min_yl = max_yl_tmp - l;

        redrawImageL();
        update();
      }
      else { // Zoom out
        min_xl_tmp = wToXL(box[2]-left0);
        max_yl_tmp = hToYL(box[3]-top0);
        max_xl_tmp = wToXL(box[0]-left0);
        min_yl_tmp = hToYL(box[1]-top0);

        l = Math.min(max_xl_tmp - min_xl_tmp, max_yl_tmp - min_yl_tmp);
        var d = -l*canvas_side/Math.max(lw,lh);

        min_xl = (min_xl_tmp+max_xl_tmp)/2.0 - d;
        min_yl = (min_yl_tmp+max_yl_tmp)/2.0 - d;
        max_xl = (min_xl_tmp+max_xl_tmp)/2.0 + d;
        max_yl = (min_yl_tmp+max_yl_tmp)/2.0 + d;

        redrawImageL();
        update();
      }
    }

    box = null;
  };

  //
  // Right Canvas 2D Events
  //
  canvas_2d_r.ondblclick = function(e) {
    if(!(e.ctrlKey || e.shiftKey)) {
      var z0 = new Complex(wToXR(e.clientX-right0), hToYR(e.clientY-top0));
      z0_expr = z0.toString(true,6);
      show_orbit = true;
      //drawOrbit();
      update();
    }

    box = null;
  };

  canvas_2d_r.onmousedown = function(e) {
    if( (e.ctrlKey || e.shiftKey) && box == null )
      box = [e.clientX, e.clientY, 0, 0];
  };

  canvas_2d_r.onmousemove = function(e) {
    document.getElementById('divcoords').textContent =
      (new Complex(wToXR(e.clientX-right0), hToYR(e.clientY-top0))).toString(true,8);

    if( /*e.ctrlKey &&*/ box != null ) {
      // clear out old box first
      update();

      // draw new box
      var l = Math.min(e.clientX-box[0], e.clientY-box[1]);
      box[2] = box[0]+l;
      box[3] = box[1]+l;

      c2dr.lineWidth = 2;
      c2dr.strokeStyle = fg_color;
      c2dr.strokeRect(box[0]-right0, box[1]-top0, l, l);
    }
  };

  canvas_2d_r.onmouseup = function(e) {
    if ( /*e.ctrlKey &&*/ box != null ) {
      var lw = box[2]-box[0], lh = box[3]-box[1], l=0.0;
      var min_xr_tmp = 0.0, max_yr_tmp = 0.0,
          max_xr_tmp = 0.0, min_yr_tmp = 0.0;

      if( lw > 0.0 && lh > 0.0 ) { // Zoom in
        min_xr_tmp = wToXR(box[0]-right0);
        max_yr_tmp = hToYR(box[1]-top0);
        max_xr_tmp = wToXR(box[2]-right0);
        min_yr_tmp = hToYR(box[3]-top0);

        l = Math.min(max_xr_tmp - min_xr_tmp, max_yr_tmp - min_yr_tmp);

        min_xr = min_xr_tmp;
        max_yr = max_yr_tmp;
        max_xr = min_xr_tmp + l;
        min_yr = max_yr_tmp - l;

        redrawImageR();
        update();
      }
      else { // Zoom out
        min_xr_tmp = wToXR(box[2]-right0);
        max_yr_tmp = hToYR(box[3]-top0);
        max_xr_tmp = wToXR(box[0]-right0);
        min_yr_tmp = hToYR(box[1]-top0);

        l = Math.min(max_xr_tmp - min_xr_tmp, max_yr_tmp - min_yr_tmp);
        var d = -l*canvas_side/Math.max(lw,lh);

        min_xr = (min_xr_tmp+max_xr_tmp)/2.0 - d;
        min_yr = (min_yr_tmp+max_yr_tmp)/2.0 - d;
        max_xr = (min_xr_tmp+max_xr_tmp)/2.0 + d;
        max_yr = (min_yr_tmp+max_yr_tmp)/2.0 + d;

        redrawImageR();
        update();
      }
    }

    box = null;
  };


  //
  // Create Image Sequence for videos
  //
  this.createImageSeq = function() {
    var n=0, N=500;
    var data_url;
    var h=0.5, t=0.0, c=0.0, s=0.0;

    var a = document.createElement('a');
    document.body.appendChild(a);

    //setType(true,2); //PWMT && Spiderweb points
    setType(false,0); //General && Julia

    //var z = Complex.parseFunction(Maths.k_expr)();
    //h = Math.sqrt(z.r*z.r+z.i*z.i); // Spiderwebs & Julias
    //h = 0.21; // Julia carpets
    h = 0.85; // Julias

    /*t = 1.95/N;
    Maths.r   = 0.05;
    Maths.c.r = 0.55;
    Maths.c.i = 0.0;*/ // Mandelbrots PWMT

    //t = 2.25; // Mandelbrots zoom

    for(n=0; n<=N; ++n) {
      t = n*Math.PI/N;
      //c = h*Math.cos(t) - 0.095;
      //s = h*Math.sin(t);
// center=-0.018+0.068i, radius=0.15
      //c = h*Math.cos(t) - 0.018;
      //s = h*Math.sin(t) + 0.068;
// Mndelbrot quad cardiod: (1 - (e^(it) - 1)^2) / 4 = (2e^(it) - e^(2it)) / 4
//      c = h*(2.0*Math.cos(t) - Math.cos(2*t));
//      s = h*(2.0*Math.sin(t) - Math.sin(2*t));
      c = h*Math.cos(t) - 0.4;
      s = h*Math.sin(t);
      if(Math.abs(c) < 0.001) c = 0.0;
      if(Math.abs(s) < 0.001) s = 0.0;
      Maths.k.r = c;
      Maths.k.i = s;
      Maths.k_expr = Maths.k.toString(true); // Spiderwebs & Julias

      /*Maths.r   += t;
      Maths.c.r += t;
      Maths.c_expr = Maths.c.toString(true);*/  // Mandelbrots PWMT

      //max_its = 50 + 10*n; // Mandelbrots zoom

      //createPalette(1,false); // Mandelbrots zoom

/*      min_xl = -0.135253 - t;
      max_xl = -0.135252 + t;
      min_yl =  0.979185 - t;
      max_yl =  0.979186 + t;*/
/*      min_xl = -0.748042 - t;
      max_xl = -0.748041 + t;
      min_yl =  0.115266 - t;
      max_yl =  0.115267 + t;*/ // Mandelbrots zoom

      //Maths.updatePWMT(); // Mandelbrots PWMT
      //Maths.updatePWMTInv(); // Spiderwebs
      Maths.updateGenF();

      //drawImageMandelbrot(Maths.hk);
      //drawImageMandelbrot(Maths.pwmTk);
      //drawSpiderwebPoints();
      drawImageJuliaArg(Maths.h);
      update();

      //t /= 1.1; // Mandelbrots zoom

      //data_url = canvas_2d_l.toDataURL();//("image/jpeg"); // Mandelbrot
      data_url = canvas_2d_r.toDataURL();//("image/jpeg"); // Julia, Spiderwebs
      a.download = "img" + n + ".png";
      a.href = data_url;
      a.click();

      //imgl = null;
      //imgr = null;

      data_url = null;
    }

    a.remove();
    a.parentNode.removeChild(a);
    a = null;
  };


  // Return closure
  return this;
}
)();
