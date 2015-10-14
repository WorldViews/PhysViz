
var inputNames = [];

function getVal(id)
{
   var s = $("#"+id).val();
   report("got "+id+" "+s);
   P[id] = eval(s);
}

function getVals(e)
{
    for (var i=0; i<inputNames.length; i++) {
        getVal(inputNames[i]);
    }
}

function addInput(id)
{
   inputNames.push(id);
   var pd = $("#params");
   report("add input for "+id);
   pd.append("<br>\n");
   pd.append("&nbsp;"+id+": <input id='"+id+"' value='"+P[id]+"'>\n");
}


function setFun(id)
{
    addInput(id);
    $("#"+id).keypress(function (e) {
       if(e.which == 13)  // the enter key code
           getVals();
    });
}

function toggleParams()
{
    report("toggleParams");
    if ($("#showParams").prop("checked"))
        $("#params").show();
    else
        $("#params").hide();
}


function setupGUI(names)
{
    $("#reset").click(reset);
    $("#showParams").click(toggleParams);
    if (!names)
	return;
    for (var i=0; i<names.length; i++) {
	setFun(names[i]);
    }
}

