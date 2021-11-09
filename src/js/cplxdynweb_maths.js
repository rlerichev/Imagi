
function cabs2(z) { return z.r*z.r + z.i*z.i; }
function cdifabs2(z,w) { return (z.r-w.r)*(z.r-w.r) + (z.i-w.i)*(z.i-w.i); }
function cdot(z,w) { return z.r*w.r + z.i*w.i; }
function cminusConj(z) { return new Complex(-z.r, z.i); }

var Maths = (function() { // mathsClosure

  //
  // "Private" variables
  //
  var
    af = Complex.ONE, bf = Complex.ZERO, cf = Complex.ZERO, df = Complex.ONE,
    ag = Complex.ONE, bg = Complex.ZERO, cg = Complex.ZERO, dg = Complex.ONE,
    alphaf = Complex.ONE, betaf = Complex.ZERO, mf = 1.0, anglef = 0.0,
    alphag = Complex.ONE, betag = Complex.ZERO, mg = 1.0, angleg = 0.0;

  var
    kx = "(-0.27+0.99i)",
    //f_expr = kx+"*z",
    //g_expr = kx+"-"+kx+"*z",
    f_1_expr = kx+"*z",
    g_1_expr = kx+"-"+kx+"*z",
    h_expr = "z*z+"+kx;
    h2_expr = kx+"*conj(z)+"+kx;

  //var
    //fk = Complex.parseFunction(f_expr, ["k","z"]),
    //gk = Complex.parseFunction(g_expr, ["k","z"]),
    //f  = Complex.parseFunction(f_expr,     ["z"]),
    //g  = Complex.parseFunction(g_expr,     ["z"]);

  var r2 = 0.125;
  var normal = new Complex(1.0,0.0);

  //
  // "Public" variables, binded with GUI
  //
  this.PI2 = 2.0*Math.PI;
  this.function_kind = 0;

  this.af_expr = "k";
  this.bf_expr = "0";
  this.cf_expr = "0";
  this.df_expr = "1";
  this.ag_expr = "-k";
  this.bg_expr = "k";
  this.cg_expr = "0";
  this.dg_expr = "1";
  this.fk_expr = "k*z";
  this.gk_expr = "k-k*z";

  this.r = 0.35; // Domain radius
  this.c_expr = "0.15"; // Domain center
  this.c = new Complex(0.15,0.0);

  this.k_expr = "-0.27+0.99i"; //"0.055+1.035i"; //"0.125+1.095i"; // "-0.275+1.025i" Transformations family parameter
  this.k = new Complex(-0.27,0.99);
  this.parseK = function() {
    try { Maths.k = Complex.parseFunction(Maths.k_expr)(); }
    catch(err) { alert("Error parsing k expression:\n" + err); }
  };

  //this.pwmTk = function(s,z) { return z; };
  //this.pwmT = function(z) { return z; };

  this.f_1 = function(z) { return z; };
  this.g_1 = function(z) { return z; };
  this.f_1_ls  = function(ls)  { return ls; };
  this.g_1_ls  = function(ls)  { return ls; };
  this.f_1_arc = function(arc) { return arc; };
  this.g_1_arc = function(arc) { return arc; };
  this.f_has_inv = false;
  this.g_has_inv = false;

  this.distanceToDomain = function(z) { return 0.0; };

  this.hk_expr = "z*z+k";
  this.h2k_expr = "z*z+k*conj(z)";
  this.hk = Complex.parseFunction(hk_expr, ["k","z"]);
  this.h = Complex.parseFunction(h_expr, ["z"]);
  this.h2k = Complex.parseFunction(h2k_expr, ["k","z"]);
  this.h2 = Complex.parseFunction(h2_expr, ["z"]);
  //this.pwTk = function(k,z) { return z; };
  //this.pwT = function(z) { return z; };

  this.Fk = function(k,z) { return z; };
  this.F = function(z) { return z; };

  //
  // Mandelbrot seed
  //
  this.seed_expr = "0.5";
  this.seed = new Complex(0.5,0.0);
  this.parseSeed = function() {
    try { seed = Complex.parseFunction(seed_expr)(); }
    catch(err) { alert("Error parsing seed expression:\n" + err); }
  };

  this.dist2 = function(z,w) { return (z.r-w.r)*(z.r-w.r) + (z.i-w.i)*(z.i-w.i); };

  this.max_mod = 2.001;
  this.max_mod2 = 4.001;
  this.max_mod_mandel = 2.001;
  this.max_mod2_mandel = 4.001;

  //
  // Escape Criterion
  //
  var escape_funs = [];
  escape_funs[0] = function(z) { return (z.r*z.r+z.i*z.i) < max_mod2; };
  escape_funs[1] = function(z) { return z.r*z.r < max_mod2; }
  escape_funs[2] = function(z) { return z.r < max_mod; };
  escape_funs[3] = function(z) { return z.i*z.i < max_mod2; };
  escape_funs[4] = function(z) { return z.i < max_mod; };
  escape_funs[5] = function(z) { return Math.max(Math.abs(z.r),Math.abs(z.i)) < max_mod; };
  escape_funs[6] = function(z) { return (Math.abs(z.r)+Math.abs(z.i)) < max_mod; };
  var escape_funs_mandel = [];
  escape_funs_mandel[0] = function(z) { return (z.r*z.r+z.i*z.i) < max_mod2_mandel; };
  escape_funs_mandel[1] = function(z) { return z.r*z.r < max_mod2_mandel; }
  escape_funs_mandel[2] = function(z) { return z.r < max_mod_mandel; };
  escape_funs_mandel[3] = function(z) { return z.i*z.i < max_mod2_mandel; };
  escape_funs_mandel[4] = function(z) { return z.i < max_mod_mandel; };
  escape_funs_mandel[5] = function(z) { return Math.max(Math.abs(z.r),Math.abs(z.i)) < max_mod_mandel; };
  escape_funs_mandel[6] = function(z) { return (Math.abs(z.r)+Math.abs(z.i)) < max_mod_mandel; };

  this.bounded = escape_funs[0];
  this.bounded_mandel = escape_funs_mandel[1];

  this.setEscapeCriterion = function(n) {
    max_mod2 = max_mod*max_mod;
    bounded = escape_funs[n];
  };

  this.setEscapeCriterionMandel = function(n) {
    max_mod2_mandel = max_mod_mandel*max_mod_mandel;
    bounded_mandel = escape_funs_mandel[n];
  };

  //
  // Arc
  //
  var Arc = function(center, radius, angle_b, angle_e) {
    this.z0 = center;
    this.r  = radius;
    this.ab = angle_b;
    this.ae = angle_e;
  };

  //
  // LineSeg
  //
  var LineSeg = function(begin, end) {
    this.zb = begin;
    this.ze = end;
  };

  this.boundary = new LineSeg(c,c);

  //
  //
  //
  var distanceLDomain = function(z) {
    return cdot(normal, z.sub(c));
  };

  //
  //
  //
  var insideCDomain = function(z) {
    return cabs2(z.sub(c)) < r2;
  };

  //
  //
  //
  var arcInsideCDomain = function(arc) {
    return cabs2( c.sub(arc.z0) ) <= (r - arc.r)*(r - arc.r);
  };

  //
  //
  //
  var arcOutsideCDomain = function(arc) {
    return cabs2( c.sub(arc.z0) ) >= (r + arc.r)*(r + arc.r);
  };

  //
  //
  //
  var intersectLDomainLS = function(ls) {
    var
      a1 = normal.r,          b1 = normal.i,          c1 = cdot(normal, c),
      a2 = ls.zb.i - ls.ze.i, b2 = ls.ze.r - ls.zb.r, c2 = ls.zb.r*a2 + ls.zb.i*b2,
      det = a1*b2 - a2*b1;

    return new Complex((b2*c1-b1*c2)/det, (a1*c2-a2*c1)/det);
  };

  //
  //
  //
  var intersectCDomainLS = function(arc) {
    return new Complex();
  };

  //
  //
  //
  var intersectCDomainArc = function(arc) {
    return new Complex();
  };

  //
  //
  //
  this.cutInLDomainLS = function(ls) {
    var db = distanceLDomain(ls.zb), de = distanceLDomain(ls.ze);
    var segs = [];

    if( db < 0.0 && de > 0.0 )
      segs[0] = new LineSeg(ls.zb, intersectLDomainLS(ls));
    else if(db > 0.0 && de < 0.0)
      segs[0] = new LineSeg(intersectLDomainLS(ls), ls.ze);
    else if( db <= 0.0 && de <= 0.0 )
      segs[0] = ls;
    //else
      //return 0; // Must be empty!!!

    return segs;
  };

  //
  //
  //
  this.cutOutLDomainLS = function(ls) {
    var db = distanceLDomain(ls.zb), de = distanceLDomain(ls.ze);
    var segs = [];

    if( db > 0.0 && de < 0.0 )
      segs[0] = new LineSeg(ls.zb, intersectLDomainLS(ls));
    else if(db < 0.0 && de > 0.0)
      segs[0] = new LineSeg(intersectLDomainLS(ls), ls.ze);
    else if( db >= 0.0 && de >= 0.0 )
      segs[0] = ls;
    //else
      //return 0; // Must be empty!!!

    return segs;
  };

  //
  //
  //
  this.cutInLDomainArc = function(arc) {
    var dc = distanceLDomain(arc.z0);
    var arcs = [];

    if( dc + arc.r <= 0.0 )
      arcs[0] = arc;
    else if( dc > arc.r )
      return arcs; // Must be empty!!!
    else {
      var z0_angle = Math.atan2(arc.z0.i, arc.z0.r);
      if( dc < 0.0 )
        return 0.0; // Intersection
      else // dc > 0.0
        return 0.0; // Intersection
    }

    return arcs;
  };

  //
  //
  //
  this.cutOutLDomainArc = function(arc) {
    var dc = distanceLDomain(arc.z0);
    var arcs = [];
    if( dc + arc.r <= 0.0 ) {
      arcs[0] = arc;
      return arcs;
    }
    else if( dc > arc.r )
      return arcs; // Must be empty!!!
    else {
      var z0_angle = Math.atan2(arc.z0.i, arc.z0.r);
      if( dc < 0.0 )
        return 0.0; // Intersection
      else // dc > 0.0
        return 0.0; // Intersection
    }
  };

  //
  // Very rare...
  //
  var cutCDomainLS = function(ls) {
    var inside_b = insideCDomain(ls.zb), inside_e = insideCDomain(ls.ze);
    if( inside_b && inside_e )
      return ls;
    else {
      var x = 0.0, y = 0.0;
      if(inside_b) {
        //x =
        return new LineSeg();
      }
    }

    if( inside_b || inside_e ) {
    }
    else {
      if( inside_b ) // Outside but intersecting...
        return new LineSeg();
      else
        return new LineSeg(c, c); // Must be empty!!!
    }
  };

  //
  //
  //
  this.cutInCDomainArc = function(arc) {
    var dc2 = cabs2(c.sub(arc.z0));
    var arcs = [];
    if( dc2 <= (arc.r - r)*(arc.r - r) ) // inside
      return arc;
    else if( dc2 > (arc.r + r)*(arc.r + r) ) // outside
      return new Arc(arc.z0, 0.0, 0.0, 0.0); // Must be empty!!!
    else { // Intersect
      var c_z0 = c.sub(arc.z0), c_z0_angle = Math.atan2(c_z0.i, c_z0.r);
      return arcs; // Must be empty!!!
    }
  };

  this.cutOutCDomainArc = function(arc) {
    var dc2 = cabs2(c.sub(arc.z0));
    var arcs = [];
    if( dc2 <= (arc.r - r)*(arc.r - r) ) // inside
      return arc;
    else if( dc2 > (arc.r + r)*(arc.r + r) ) // outside
      return new Arc(arc.z0, 0.0, 0.0, 0.0); // Must be empty!!!
    else { // Intersect
      var c_z0 = c.sub(arc.z0), c_z0_angle = Math.atan2(c_z0.i, c_z0.r);
      return arcs; // Must be empty!!!
    }
  };

  //
  //        az+b
  // T(z) = ----
  //        cz+d
  //
  this.createMobiusExpression = function(a,b,c,d) {
    var expr = "";

    if( a != "0" ) {
      if( a == "1" )
        expr = expr + "z";
      else
        expr = expr + "(" + a + ")*z";

      if( b != "0" )
        expr = expr + "+(" + b + ")";
    }
    else {
      if( b != "0" )
        expr = expr + b;
      else
        expr = expr + "1";
    }

    if( c != "0" ) {
      expr = "(" + expr + ")/("

      if( c == "1" )
        expr = expr + "z";
      else
        expr = expr + "(" + c + ")*z";

      if( d != "0" )
        expr = expr + "+(" + d + ")";

      expr = expr + ")";
    }
    else {
      if( d != "1" && d != "0" )
        expr = "(" + expr + ")/(" + d + ")";
    }

    return expr;
  };

  //
  //         dz-b
  // T(z) = -----
  //        -cz+a
  //
  this.createMobiusExpressionInv = function(a,b,c,d) {
    var expr = "";

    if( d != "0" ) {
      if( d == "1" )
        expr = expr + "z";
      else
        expr = expr + "(" + d + ")*z";

      if( b != "0" )
        expr = expr + "-(" + b + ")";
    }
    else {
      if( b != "0" )
        expr = expr + "-(" + b + ")";
      else
        expr = expr + "-1";
    }

    if( c != "0" ) {
      expr = "(" + expr + ")/("

      if( c == "1" )
        expr = expr + "-z";
      else
        expr = expr + "-(" + c + ")*z";

      if( a != "0" )
        expr = expr + "+(" + a + ")";

      expr = expr + ")";
    }
    else {
      if( a != "1" && a != "0" )
        expr = "(" + expr + ")/(" + a + ")";
    }

    return expr;
  };

  //
  //
  //
  function parseMobiusCoefficients(a,b,c,d) {
    var
      a_expr = a.replace(/k/ig, "(" + k_expr + ")"),
      b_expr = b.replace(/k/ig, "(" + k_expr + ")"),
      c_expr = c.replace(/k/ig, "(" + k_expr + ")"),
      d_expr = d.replace(/k/ig, "(" + k_expr + ")");

    var values = [];

    try {
      values = [
        Complex.parseFunction(a_expr)(),
        Complex.parseFunction(b_expr)(),
        Complex.parseFunction(c_expr)(),
        Complex.parseFunction(d_expr)()
      ];
    }
    catch(err) { alert("Error parsing Möbius transformation coefficients:\n" + err); }

    return values;
  }


  //
  //
  //
  this.updateDomainData = function() {
    try { c = Complex.parseFunction(c_expr)(); }
    catch(err) { alert("Error parsing center expression:\n" + err); }

    if( r < 0.001 ) {
      var angle = Math.PI*r;
      normal = new Complex(Math.sin(angle), Math.cos(angle));

      if( c.equals(Complex.ZERO) )
        distanceToDomain = function(z) { return cdot(normal, z); };
      else
        distanceToDomain = function(z) { return cdot(normal, z.sub(c)); };

      r2 = 0.0;
    }
    else {
      if( c.equals(Complex.ZERO) )
        distanceToDomain = cabs2;
      else
        distanceToDomain = function(z) { return cabs2(z.sub(c)); };

    r2 = r*r;
    }
  };

  //
  //
  //
  this.updatePWMT = function() {
    fk_expr = createMobiusExpression(af_expr, bf_expr, cf_expr, df_expr);
    gk_expr = createMobiusExpression(ag_expr, bg_expr, cg_expr, dg_expr);

    try {
      fk = Complex.parseFunction(fk_expr, ["k","z"]);
      var f_expr = fk_expr.replace(/k/ig, "(" + k_expr + ")");
      f = Complex.parseFunction(f_expr, ["z"]);
    }
    catch(err) { alert("Error parsing f(z) expression:\n" + err); }

    try {
      gk = Complex.parseFunction(gk_expr, ["k","z"]);
      var g_expr = gk_expr.replace(/k/ig, "(" + k_expr + ")");
      g = Complex.parseFunction(g_expr, ["z"]);
    }
    catch(err) { alert("Error parsing g(z) expression:\n" + err); }

    updateDomainData();

    Fk/*pwmTk*/ = function(s,z) {
      if(distanceToDomain(z) <= r2) return fk(s,z); else return gk(s,z); };
    F/*pwmT*/  = function(z) {
      if(distanceToDomain(z) <= r2) return f(z);    else return g(z);    };

    //Fk = pwmTk;
    //F = pwmT;
  };

  //
  //
  //
  this.updatePWMTInv = function() {
    if( r < 0.001 ) { // Boundary straight line
      var angle = -this.r*Math.PI;
      var v = new Complex(10000.0*Math.cos(angle), 10000.0*Math.sin(angle));
      boundary = new LineSeg(c.sub(v.rMult(-1.0)), c.sub(v));
    }
    else // Boundary circunference
      boundary = new Arc(c,r,0.0,Math.PI2);

    var fk_1_expr = createMobiusExpressionInv(af_expr, bf_expr, cf_expr, df_expr);
    var gk_1_expr = createMobiusExpressionInv(ag_expr, bg_expr, cg_expr, dg_expr);
    var cf_expr_tmp = "0";
    var cg_expr_tmp = "0";

    try {
      f_1_expr = fk_1_expr.replace(/k/ig, "(" + k_expr + ")");
      f_1 = Complex.parseFunction(f_1_expr, ["z"]);
    }
    catch(err) { alert("Error parsing f_1(z) expression:\n" + err); }

    try {
      g_1_expr = gk_1_expr.replace(/k/ig, "(" + k_expr + ")");
      g_1 = Complex.parseFunction(g_1_expr, ["z"]);
    }
    catch(err) { alert("Error parsing g_1(z) expression:\n" + err /*+ " " + k_expr + " " + g_expr*/); }

    try {
      cf_expr_tmp = cf_expr.replace(/k/ig, "(" + k_expr + ")");
      cf = Complex.parseFunction(cf_expr_tmp)(k);
    }
    catch(err) { alert("Error parsing f_1(z) expression:\n" + err); }

    f_has_inv = (cf.r*cf.r + cf.i*cf.i) > 0.0;

    try {
      cg_expr_tmp = cg_expr.replace(/k/ig, "(" + k_expr + ")");
      cg = Complex.parseFunction(cg_expr_tmp)(k);
    }
    catch(err) { alert("Error parsing g_1(z) expression:\n" + err); }

    g_has_inv = (cg.r*cg.r + cg.i*cg.i) > 0.0;

    var values = [];
    values = parseMobiusCoefficients(af_expr,bf_expr,cf_expr,df_expr);
    af = values[3];             bf = values[1].rMult(-1.0);
    cf = values[2].rMult(-1.0); df = values[0];

    if( !f_has_inv/*cf.equals( Complex.ZERO)*/ ) { // Without inversion
      alphaf = af.div(df);
      betaf = bf.div(df);
      //mf = alphaf.mag();
      //anglef = alphaf.angle();

      f_1_ls = function(ls) { return new
        LineSeg(ls.zb.mult(alphaf).add(betaf), ls.ze.mult(alphaf).add(betaf)); }

      /*f_1_arc = function(arc) { return new
        Arc(arc.z0.mult(alphaf).add(betaf), arc.r*mf, arc.ab+anglef, arc.ae+anglef); }

      f_has_inv = false;*/
    }
    /*else { // With inversion
      alphaf = bf.mult(cf).sub(af.mult(df)).div(cf.mult(cf));
      betaf = bf.div(df);
      mf = alphaf.mag()
      anglef = alphaf.angle();

      f_1_ls = function(ls) { return new // To Do!
        LineSeg(ls.zb.mult(alphaf).add(betaf), ls.ze.mult(alphaf).add(betaf)); }

      f_1_arc = function(arc) { return new // To Do!
        Arc(arc.z0.mult(alphaf).add(betaf), arc.r*mf, arc.ab+anglef, arc.ae+anglef); }

      f_has_inv = true;
    }*/

    values = [];
    values = parseMobiusCoefficients(ag_expr,bg_expr,cg_expr,dg_expr);
    ag = values[3];             bg = values[1].rMult(-1.0);
    cg = values[2].rMult(-1.0); dg = values[0];

    if( !g_has_inv/*cg.equals( Complex.ZERO)*/ ) { // Without inversion
      alphag = ag.div(dg);
      betag = bg.div(dg);
      //mg = alphag.mag();
      //angleg = alphag.angle();

      g_1_ls = function(ls) { return new
        LineSeg(ls.zb.mult(alphag).add(betag), ls.ze.mult(alphag).add(betag)); }

      /*g_1_arc = function(arc) { return new
        Arc(arc.z0.mult(alphag).add(betag), arc.r*mg, arc.ab+angleg, arc.ae+angleg); }

      g_has_inv = false;*/
    }
    /*else { // With inversion
      alphag = bg.mult(cg).sub(ag.mult(dg)).div(cg.mult(cg));
      betag = bg.div(dg);
      mg = alphag.mag()
      angleg = alphag.angle();

      g_1_ls = function(ls) { return new // To Do!
        LineSeg(ls.zb.mult(alphag).add(betag), ls.ze.mult(alphag).add(betag)); }

      g_1_arc = function(arc) { return new // To Do!
        Arc(arc.z0.mult(alphag).add(betag), arc.r*mg, arc.ab+angleg, arc.ae+angleg); }

      g_has_inv = true;
    }*/

    //Fk = pwmTk;
    //F = pwmT;
  };

  //
  //
  //
  this.updatePWT = function() {
    try {
      hk = Complex.parseFunction(hk_expr, ["k","z"]);
      h_expr = hk_expr.replace(/k/ig, "(" + k_expr + ")");
      h = Complex.parseFunction(h_expr, ["z"]);
    }
    catch(err) { alert("Error parsing f(z) expression:\n" + err); }

    try {
      h2k = Complex.parseFunction(h2k_expr, ["k","z"]);
      h2_expr = h2k_expr.replace(/k/ig, "(" + k_expr + ")");
      h2 = Complex.parseFunction(h2_expr, ["z"]);
    }
    catch(err) { alert("Error parsing g(z) expression:\n" + err); }

    updateDomainData();

    Fk/*pwTk*/ = function(s,z) {
      if(distanceToDomain(z) <= r2) return hk(s,z); else return h2k(s,z); };
    F/*pwT*/  = function(z) {
      if(distanceToDomain(z) <= r2) return h(z);    else return h2(z);    };

    //Fk = pwTk;
    //F = pwT;
  };

  //
  //
  //
  this.updateGenF = function() {
    try {
      Fk/*hk*/ = Complex.parseFunction(hk_expr, ["k","z"]);
      h_expr = hk_expr.replace(/k/ig, "(" + k_expr + ")");
      F/*h*/ = Complex.parseFunction(h_expr, ["z"]);
    }
    catch(err) { alert("Error parsing f(z) expression:\n" + err); }

    //Fk = hk;
    //F = h;
  };

  //
  //
  //
  this.updateFunction = function() {
    if(function_kind == 0)      updatePWMT(); // Piecewise Möbius
    else if(function_kind == 1) updatePWT();  // Piecewise General
    else                        updateGenF(); // General
  };


  // Return closure
  return this;
}
)();
