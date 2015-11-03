
ANIM = {}
ANIM.viewNum = 0;
ANIM.viewNames = [];
ANIM.views = {};
ANIM.idx = 0;
ANIM.bookmarksURL_ = "/Kinetics/bookmarks.json";

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
    ANIM.uploadBookmarks();
    //    report("bookmarkView "+JSON.stringify(view));
}

ANIM.getBookmarksURL = function()
{
    //TODO: maybe make smarter...
    return ANIM.bookmarksURL_ ;
}

ANIM.downloadBookmarks = function()
{
    var url = ANIM.getBookmarksURL();
    report("downloadBookmarks "+url);
    $.getJSON(url, ANIM.handleBookmarks)
}

ANIM.handleBookmarks = function(obj)
{
    report("handleBookmarks");
    report("views: "+JSON.stringify(obj));
    ANIM.views = obj;
    ANIM.viewNames = [];
    for (var name in ANIM.views) {
        report("name: "+name+" view: "+JSON.stringify(ANIM.views[name]));
        ANIM.viewNames.push(name);
    }
}

ANIM.uploadBookmarks = function()
{
    jstr = JSON.stringify(ANIM.views);
    var url = ANIM.getBookmarksURL();
    url = url.replace("/", "/update/");
    report("uploadBookmarks to "+url);
    jQuery.post(url, jstr, function () {
	    report("Succeeded at upload")}, "json");
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
    if (view.position) {
       //P.camera.position = view.position;
       P.camera.position.x = view.position.x;
       P.camera.position.y = view.position.y;
       P.camera.position.z = view.position.z;
    }
    if (view.rotation) {
       P.camera.rotation.x = view.rotation.x;
       P.camera.rotation.y = view.rotation.y;
       P.camera.rotation.z = view.rotation.z;
    }
    P.camera.updateProjectionMatrix();
}


$(document).ready(function(e) {
    $("#markViewpoint").click(function(e) { ANIM.bookmarkView()});
    $("#nextViewpoint").click(function(e) { ANIM.gotoView()});
    ANIM.downloadBookmarks();
});
