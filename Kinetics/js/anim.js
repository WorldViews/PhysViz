
ANIM = {}
ANIM.viewNum = 0;
ANIM.viewNames = [];
ANIM.views = {};
ANIM.idx = 0;

ANIM.Animation = function()
{
    this.running = false;
    this.t0 = 0;
    this.t1 = 1;

    this.playTime = 0;

    function update() {
	var t = Date.now()/1000;
	//report("ANIM run "+t+" update");
    }
    this.update = update;
}

ANIM.bookmarkView = function(name)
{
    report("bookmarkView");
    if (!P.camera) {
        report("Cannot get camera");
        return;
    }
    if (!name) {
        ANIM.viewNum += 1;
        name = "View"+ANIM.viewNum;
    }
    var pos = P.camera.position.clone();
    var eulerAngles = P.camera.rotation.clone();
    var view = {'name': name, 'position': pos, 'rotation': eulerAngles};
    ANIM.viewNames.push(name)
    ANIM.views[name] = view;
    report("bookmarkView name "+name);
    report("bookmarkView pos "+JSON.stringify(pos));
    report("bookmarkView rot "+JSON.stringify(eulerAngles));
    report("bookmarkView test.... "+JSON.stringify({'a': 3, 'b': {'c': 8}}));
    //    report("bookmarkView "+JSON.stringify(view));
}

ANIM.gotoView = function(name)
{
    report("gotoView "+name);
    if (!name) {
        ANIM.idx++;
        name = ANIM.viewNames[ANIM.idx % ANIM.viewNames.length];
    }
    report("gotoView "+name);
    view = ANIM.views[name];
    if (!view) {
	report("No viewpoint named "+name);
	return;
    }
    report("pos: "+view.position);
    report("rot: "+view.rotation);
    //P.camera.position = view.position;
    P.camera.position.x = view.position.x;
    P.camera.position.y = view.position.y;
    P.camera.position.z = view.position.z;
    P.camera.rotation.x = view.rotation.x;
    P.camera.rotation.y = view.rotation.y;
    P.camera.rotation.z = view.rotation.z;
    P.camera.updateProjectionMatrix();
}


$(document).ready(function(e) {
	$("#markViewpoint").click(function(e) { ANIM.bookmarkView()});
	$("#nextViewpoint").click(function(e) { ANIM.gotoView()});
});
