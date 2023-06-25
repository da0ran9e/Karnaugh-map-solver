var varNames = new Array("A","B","C","D","E"); // Names used for each possible variable
var KLvl = new Array(0,1,1,1,1,2);
var KWid  = new Array(0,2,2,4,4,4);
var KHei = new Array(0,1,2,2,4,4);
var KVarX  = new Array(0,1,1,2,2,2);
var KVarY = new Array(0,0,1,1,2,2);
var bitOrd = new Array(0,1,3,2,4,5,7,6);
var normalColor = "white";			// 0xFFFFFF;
var selectColor = "yellow";			// 0xFFFF00;
var numVar = 4;
var allowDC = false;
var KMap = [];
var coverList = [];
var nCubeList = [];


initKMap(numVar);

function toBinString (val, b){
    var str = val.toString(2);
    for (var i=0; i<b; i++){
        if (str.length<b) str = "0" + str;
    }
    if (b===0) str = "";
    return str;
}

function boolToBin (bool){
    if (bool === 1) return "1";
    else if (bool === 0) return "0";
    else return "-";
}

function checkCube(coords, sizes){
    var no0val = true; // Remains true until a 0 value is found (we stop searching then).
    var has1val = false; // Remains false until a 1 value is found.
    for (var d=coords[2]; d<sizes[2]+coords[2] && no0val; d++){
    for (var w=coords[0]; w<sizes[0]+coords[0] && no0val; w++){
    for (var h=coords[1]; h<sizes[1]+coords[1] && no0val; h++){
        no0val = no0val && KMap[d][w%KMap.Width][h%KMap.Height].Value;
        has1val = has1val || KMap[d][w%KMap.Width][h%KMap.Height].Value == 1;
    }}}
    return (no0val && has1val);
}

function makeCube(coords, sizes){
    var newCube = [];
    for (var d=coords[2]; d<sizes[2]+coords[2]; d++){
    for (var w=coords[0]; w<sizes[0]+coords[0]; w++){
    for (var h=coords[1]; h<sizes[1]+coords[1]; h++){
        newCube.push([w%KMap.Width,h%KMap.Height,d]);
    }}}
    return newCube;
}

function checkForCollisions(nCubeArray) {
	var newCubeArray = [];
    var toKeep = [];
    var contained = false;
    for (var i=0; i<nCubeArray.length; i++){
        contained = false;
        for (var j=0; j<nCubeArray.length; j++){
			if ( i!=j &&  nCubeArray[i].length < nCubeArray[j].length){
				contained = contained || isContainedIn(nCubeArray[i],nCubeArray[j]);
			}
            else if ( j<i && nCubeArray[i].length == nCubeArray[j].length ){
				contained = contained || isContainedIn(nCubeArray[i],nCubeArray[j]);
			}
		}
        if (!contained) {toKeep.push(i);}
    }
    for (var k=0; k<toKeep.length; k++){
        newCubeArray.push(nCubeArray[toKeep[k]]);
    }
    return newCubeArray;
}

function isContainedIn(nCube1,nCube2){
    var check = 0; var found = false;
    for (var i=0; i<nCube1.length; i++){
		found = false;
        for (var j=0; j<nCube2.length; j++){
            if(nCube1[i][0] == nCube2[j][0] && nCube1[i][1] == nCube2[j][1] && nCube1[i][2] == nCube2[j][2]){
                found = true;
            }
        }
		if(found){check += 1;}
    }
    return (check == nCube1.length);
}

function alreadyCovered(space, cover){
    var covered = false;
    for (var i=0; i<cover.length; i++){
        if(space[0] == cover[i][0] && space[1] == cover[i][1] && space[2] == cover[i][2]) covered = true;
    }
    return covered;
}

function getCoverList(nCubeArray){
    cover = [];
    for (var i=0; i<nCubeArray.length; i++){
        for (var j=0; j<nCubeArray[i].length; j++){
            if(!alreadyCovered(nCubeArray[i][j], cover)) cover.push(nCubeArray[i][j]);
    }}
    return cover;
}

function coversAll1(cover){
    var check = true;
    for (var d=0; d<KMap.nLevels; d++){
    for (var w=0; w<KMap.Width; w++){
    for (var h=0; h<KMap.Height; h++){
        if(KMap[d][w][h].Value == 1 && !alreadyCovered([w,h,d], cover)) check = false;
    }}}
    return check;
}

function EspressoExpand() {
	var newCubeSet = []; // All of the expanded n-cubes created from a single space, regardless of wether some cubes contain others.

    var w = 0; var h = 0; var d = 0;

	while(d<KMap.nLevels){
        // For 1-level deep n-cubes (cover either E or notE in the 5 variable case).
        while(h<KMap.Height){
            while(w<KMap.Width){
				newCubeSet = [];

	            if( checkCube([w,h,d], [1,1,1]) ) newCubeSet.push(makeCube([w,h,d], [1,1,1]));

				//Expanding for n-cubes oriented along the width.
                if( checkCube([w,h,d], [2,1,1]) ) newCubeSet.push(makeCube([w,h,d], [2,1,1]));
                //In case a cube takes the whole width.
                if( KMap.Width==4 && w===0 ){
                    if( checkCube([w,h,d], [4,1,1]) ) newCubeSet.push(makeCube([w,h,d], [4,1,1]));
                    if( checkCube([w,h,d], [4,2,1]) ) newCubeSet.push(makeCube([w,h,d], [4,2,1]));
                }
                newCubeSet = checkForCollisions(newCubeSet);

                //Expanding for n-cubes oriented along the height.
                if( checkCube([w,h,d], [1,2,1]) ) newCubeSet.push(makeCube([w,h,d], [1,2,1]));
                //In case a cube takes the whole height.
                if( KMap.Height==4 && h===0 ){
                    if( checkCube([w,h,d], [1,4,1]) ) newCubeSet.push(makeCube([w,h,d], [1,4,1]));
                    if( checkCube([w,h,d], [2,4,1]) ) newCubeSet.push(makeCube([w,h,d], [2,4,1]));
                }
                newCubeSet = checkForCollisions(newCubeSet);

                //Expanding for square n-cubes.
                if( checkCube([w,h,d], [2,2,1]) ) newCubeSet.push(makeCube([w,h,d], [2,2,1]));
                //In case a cube takes the whole width and height.
				if( w===0 && h===0 && KMap.Width==4 && KMap.Height==4){
                    if( checkCube([w,h,d], [4,4,1]) ) newCubeSet.push(makeCube([w,h,d], [4,4,1]));
                }
                newCubeSet = checkForCollisions(newCubeSet);

	            for (var i=0; i<newCubeSet.length; i++){ nCubeList.push(newCubeSet[i]); }
	            w += 1;
	        }
	        w = 0; h += 1;
		}
		w = 0; h = 0;

        // For 2-levels deep n-cubes (cover E AND notE in the 5 variable case).
        if(d===0 && KMap.nLevels==2){
            while(h<KMap.Height){
                while(w<KMap.Width){
                    newCubeSet = [];

                    if( checkCube([w,h,d], [1,1,2]) ) newCubeSet.push(makeCube([w,h,d], [1,1,2]));

                    //Expanding for n-cubes oriented along the width.
                    if( checkCube([w,h,d], [2,1,2]) ) newCubeSet.push(makeCube([w,h,d], [2,1,2]));
                    //In case a cube takes the whole width.
                    if( KMap.Width==4 && w===0 ){
                        if( checkCube([w,h,d], [4,1,2]) ) newCubeSet.push(makeCube([w,h,d], [4,1,2]));
                        if( checkCube([w,h,d], [4,2,2]) ) newCubeSet.push(makeCube([w,h,d], [4,2,2]));
                    }
                    newCubeSet = checkForCollisions(newCubeSet);

                    //Expanding for n-cubes oriented along the height.
                    if( checkCube([w,h,d], [1,2,2]) ) newCubeSet.push(makeCube([w,h,d], [1,2,2]));
                    //In case a cube takes the whole height.
                    if( KMap.Width==4 && w===0 ){
                        if( checkCube([w,h,d], [1,4,2]) ) newCubeSet.push(makeCube([w,h,d], [1,4,2]));
                        if( checkCube([w,h,d], [2,4,2]) ) newCubeSet.push(makeCube([w,h,d], [2,4,2]));
                    }
                    newCubeSet = checkForCollisions(newCubeSet);

                    //Expanding for square n-cubes.
                    if( checkCube([w,h,d], [2,2,2]) ) newCubeSet.push(makeCube([w,h,d], [2,2,2]));
                    //In case a cube takes the whole width and height.
                    if( w===0 && h===0 && KMap.Width==4 && KMap.Height==4){
                        if( checkCube([w,h,d], [4,4,2]) ) newCubeSet.push(makeCube([w,h,d], [4,4,2]));
                    }
                    newCubeSet = checkForCollisions(newCubeSet);

                    for (var j=0; j<newCubeSet.length; j++){ nCubeList.push(newCubeSet[j]); }
                    w += 1;
                }
                w = 0; h += 1;
            }
            w = 0; h = 0;
        }
        w = 0; h = 0; d +=1;
    }
    nCubeList = checkForCollisions(nCubeList);
}

function EspressoIrredundantCover() {
    coverList = getCoverList(nCubeList);
    var lastIter = false;
    var newNCubeList = [];
    var newCover = [];
    while(lastIter === false){
        //If the previous itteration didn't remove any n-cubes, it becomes the last iteration and the algorithm stops.
        lastIter = true;
        for (var i=0; i<nCubeList.length; i++){
            //We itterate from the first n-cube on the list onwards. That is, from the top-left corner.
            newNCubeList = JSON.parse(JSON.stringify(nCubeList));
            newNCubeList.splice(i, 1);
            newCover = getCoverList(newNCubeList);
            //We check if the old cover is contained in the new one, to see if they are the same (the new one is always contained in the old one).
            if( isContainedIn(coverList,newCover) ){
                nCubeList = newNCubeList; coverList = newCover;
                lastIter = false;
            }
            //Alternatively, in the "don't care" case, we check if all the 1 values are still contained within the cover.
            else if (allowDC && coversAll1(newCover)) {
                nCubeList = newNCubeList; coverList = newCover;
                lastIter = false;
            }
        }
    }
}

function EspressoSolve() {
	nCubeList = [];
	coverList = [];
    EspressoExpand();
    EspressoIrredundantCover();
}

function initKMap (nVar){
    KMap = [];
    KMap.nLevels = KLvl[nVar];
    KMap.Width = KWid[nVar];
    KMap.Height = KHei[nVar];
    KMap.nVarX = KVarX[nVar];
    KMap.nVarY = KVarY[nVar];
    for (var d=0; d<KMap.nLevels; d++){
        KMap[d] = [];
        for (var w=0; w<KMap.Width; w++){
    		KMap[d][w] = [];
    		for (var h=0; h<KMap.Height; h++){
    			KMap[d][w][h] = [];
    			KMap[d][w][h].Value = 0; // False is default
    			valueStr = toBinString(bitOrd[d],KMap.nLevels-1) + toBinString(bitOrd[w],KMap.nVarX) + toBinString(bitOrd[h],KMap.nVarY);
    			value = parseInt(valueStr,2);

    			KMap[d][w][h].Button_id = "KM" + valueStr;
    			KMap[d][w][h].TD_id = "TD" + valueStr;
    	}}
    }
}

function resetKMap(){
    initKMap(numVar); redraw();
}

function changeNumVar(Num){
    if(Num != numVar){
        numVar = Num; initKMap(Num);
        document.getElementById("Var2").checked = (Num==2)?true:false;
        document.getElementById("Var3").checked = (Num==3)?true:false;
        document.getElementById("Var4").checked = (Num==4)?true:false;
        document.getElementById("Var5").checked = (Num==5)?true:false;
    }
    redraw();
}

function switchDontCare(){
    allowDC = !allowDC;
    for (var d=0; d<KMap.nLevels; d++){
    for (var w=0; w<KMap.Width; w++){
    for (var h=0; h<KMap.Height; h++){
        if(KMap[d][w][h].Value === 2) KMap[d][w][h].Value = 0;
    }}}
    redraw();
}

function modifyKMEntry(entry){
    if (entry.Value === 0) entry.Value = 1;
    else if (entry.Value === 1 && allowDC) entry.Value = 2;
    else entry.Value = 0;
    redraw();
}

function setAllToNormalColor(){
    for (d=0; d<KMap.nLevels; d++){
        for (h=0; h<KMap.Height; h++){
            for (w=0; w<KMap.Width; w++){
                    document.getElementById(KMap[d][w][h].Button_id).style.backgroundColor = normalColor;
    }}}
}

function setColor(nCube,color){
    for(var i=0; i<nCube.length; i++){
        document.getElementById(KMap[nCube[i][2]][nCube[i][0]][nCube[i][1]].Button_id).style.backgroundColor = color;
    }
}

function redraw(){
    document.getElementById("KMapMaker");
    document.getElementById("KMapDiv").innerHTML = generateKMapHTML();
    document.getElementById("SolutionDiv").innerHTML = generateSolutionHTML();
    document.getElementById("LaTeXCode").value = generateLaTeXCode();
}

 function generateKMapHTML() {
     var text = "<center>Please input your K-Map</center><br /><center>";
     var h,w,d; //Using a 3D table helps to account for 5 variables;


     //text += "<table border=1>";
     text += "<table>";

 	//Width of the matrix
 	text += "<tr><th></th><th></th><th colspan="+KMap.Width*KMap.Height+2+">";
 	for (var i=0; i<KMap.nVarX+KMap.nLevels-1; i++){
 		text += varNames[i];
 	}

 	text += "</th></tr>";
 	text += "<tr>";
 	text += "<th></th><th></th><th></th>";
    for (d=0; d<KMap.nLevels; d++){
 	for (w=0; w<KMap.Width; w++){
        if (w===0 && d==1) text += "<th style='width:1mm'></th>";
 		text += "<th>"+toBinString(bitOrd[d*4+w],KMap.nVarX+KMap.nLevels-1)+"</th>";
    }}
 	text+="</tr>";

 	//Height of the matrix
 	for (h=0; h<KMap.Height; h++){
 		text = text + "<tr>";
 		if (h===0){
            text += "<th rowspan="+KMap.Height+">";
 			for (var j=0; j<KMap.nVarY; j++){
 				text += varNames[j+KMap.nVarX+KMap.nLevels-1];
 			}
            text += "<th rowspan="+KMap.Height+">";
 		}
 		text += "<th>"+toBinString (bitOrd[h],KMap.nVarY)+"</th>";

 		//Filling the matrix with buttons
        for (d=0; d<KMap.nLevels; d++){
 		for (w=0; w<KMap.Width; w++){
            if (w===0 && d==1) text += "<th style='width:1mm'></th>";
 			text += "<td  ID='"+KMap[d][w][h].TFD_id+"'; style='background-color:0xFF'>";
 			text += "<input ID="+KMap[d][w][h].Button_id +" name="+KMap[d][w][h].Button_id;
            text += " type='button'  style='height:6mm;width:8mm' value=' "+ boolToBin(KMap[d][w][h].Value);
            text += " '; onClick=modifyKMEntry(KMap["+d+"]["+w+"]["+h+"]);></td>";
 		}}
 		text += "</tr>";
 	}
    text += "</table>";
 	text+="</center></td></tr>";

 	return text;
}

function getFunctionHTML(nCube, cubeId){
	var ref = toBinString(bitOrd[nCube[0][2]],KMap.nLevels-1) + toBinString(bitOrd[nCube[0][0]],KMap.nVarX) + toBinString(bitOrd[nCube[0][1]],KMap.nVarY);
	var logicFunct = [];
	for(var x=0; x<ref.length; x++) logicFunct[x] = parseInt(ref[x]);
	//N-cubes containing just one space will have a term given by a single binary string.
	//The term from the first space is thus stored in logicFunct.
	if (nCube.length >= 2){
		//If the n-cube in fact covers more than one space, we compare the binary strings of new spaces with logicFunct.
		//Whenever in those strings we find a bit that differs from the correspondent one in logicFunct, it is overwritten with a "2".
		for (var i=1; i<nCube.length; i++){
			ref = toBinString(bitOrd[nCube[i][2]],KMap.nLevels-1) + toBinString(bitOrd[nCube[i][0]],KMap.nVarX) + toBinString(bitOrd[nCube[i][1]],KMap.nVarY);
			for (var j=0; j<ref.length; j++){
				if (logicFunct[j] != parseInt(ref[j])) logicFunct[j] = 2;
		}}
	}
	//From the final version of logicFunct, we build the expression of the term with letters.
	//If the bit corresponding to a logic variable A is 0, we write notA. If it is 1, we write A.
	//If it is 2, we don't write anything (meaning we don't care about the variable A).
	var funct = "<span ID=" + cubeId;
    funct += " onMouseOver='setColor(nCubeList["+cubeId+"],selectColor);'";
    funct += " onMouseOut='setColor(nCubeList["+cubeId+"],normalColor);'>";
    var wholeMap = true;
	for (var k=0; k<logicFunct.length; k++){
		if (logicFunct[k] === 0){
			wholeMap = false;
			funct += "<span style='text-decoration: overline'>" + varNames[k] + "</span>";
		}
		else if (logicFunct[k] == 1){
			wholeMap = false;
			funct += varNames[k];
		}
	}
	if (wholeMap) funct += "1";
    else funct += "</span>";
	return funct;
}

function generateSolutionHTML(){
    setAllToNormalColor(); //Before anything, we set the K-Map's overal color to its normal, non-selected state.
    EspressoSolve();
    var text = "<h4><center>K-Map Function:</center></h4>";
    text+="<h2><center>F(";
    for (var x=0; x<(KMap.nVarX+KMap.nVarY+KMap.nLevels-1); x++){
        text += varNames[x]; if(x!=(KMap.nVarX+KMap.nVarY+KMap.nLevels-2)) text += ",";
    }
    text+=") = ";
    if (nCubeList.length === 0){ text += "0"; } //Case where no spaces are covered.
    else{ for (var i=0; i<nCubeList.length; i++){
        text += getFunctionHTML(nCubeList[i], i);
        if (i<nCubeList.length-1) text += " + ";
    }}
    text+="</center></h2>";

    return text;
}

function writeDocHeader(){
    var code = "\\documentclass[a4paper,10pt]{ltxdoc}\n";
    code += "\\usepackage[a4paper]{geometry}\n\n";
    code += "\\usepackage[scaled=0.92]{helvet}\n";
    code += "\\usepackage{sansmath}\n";
    code += "\\usepackage{color}\n";
    code += "\\usepackage{float}\n";
    code += "\\usepackage{listings}\n";
    code += "\\usepackage{array}\n\n";
    code += "\\usepackage{askmaps}\n\n";

    code += "\\definecolor{red}{rgb}{1,0,0}\n";
    code += "\\definecolor{green}{rgb}{0,1,0}\n";
    code += "\\definecolor{blue}{rgb}{0,0,1}\n";
    code += "\\definecolor{darkred}{rgb}{0.5,0,0}\n";
    code += "\\definecolor{darkgreen}{rgb}{0,0.5,0}\n";
    code += "\\definecolor{darkblue}{rgb}{0,0,0.5}\n";
    code += "\\definecolor{yellow}{rgb}{1,1,0}\n";
    code += "\\definecolor{cyan}{rgb}{0,1,1}\n";
    code += "\\definecolor{magenta}{rgb}{1,0,1}\n";
    code += "\\definecolor{gray}{rgb}{0.5,0.5,0.5}\n";
    code += "\\definecolor{orange}{rgb}{1,0.5,0}\n";
    code += "\\definecolor{aqua}{rgb}{0,1,0.5}\n";
    code += "\\definecolor{purple}{rgb}{0.5,0,1}\n";
    code += "\\definecolor{fuschia}{rgb}{1,0,0.5}\n";
    code += "\\definecolor{lime}{rgb}{0.5,1,0}\n";
    code += "\\definecolor{azur}{rgb}{0,0.5,1}\n";

    return code;
}

function getFunctionText(nCube, cubeId){
    var ref = toBinString(bitOrd[nCube[0][2]],KMap.nLevels-1) + toBinString(bitOrd[nCube[0][0]],KMap.nVarX) + toBinString(bitOrd[nCube[0][1]],KMap.nVarY);
	var logicFunct = [];
    for(var x=0; x<ref.length; x++) logicFunct[x] = parseInt(ref[x]);
    if (nCube.length >= 2){
        for (var i=1; i<nCube.length; i++){
			ref = toBinString(bitOrd[nCube[i][2]],KMap.nLevels-1) + toBinString(bitOrd[nCube[i][0]],KMap.nVarX) + toBinString(bitOrd[nCube[i][1]],KMap.nVarY);
			for (var j=0; j<ref.length; j++){
				if (logicFunct[j] != parseInt(ref[j])) logicFunct[j] = 2;
	}}}

    var funct = ""; var wholeMap = true;
	for (var k=0; k<logicFunct.length; k++){
		if (logicFunct[k] === 0){
			wholeMap = false; funct += "\\overline{" + varNames[k] + "}";
		}
        else if (logicFunct[k] == 1){
			wholeMap = false; funct += varNames[k];
		}
	}
	if (wholeMap) funct += "1";
	return funct;
}

function writeLogicFunction(){
    var text = "F(";
    for (var x=0; x<(KMap.nVarX+KMap.nVarY+KMap.nLevels-1); x++){
        text += varNames[x]; if(x!=(KMap.nVarX+KMap.nVarY+KMap.nLevels-2)) text += ",";
    }
    text+=")=";
    if (nCubeList.length === 0){ text += "0"; } //Case where no spaces are covered.
    else{ for (var i=0; i<nCubeList.length; i++){
        text += getFunctionText(nCubeList[i], i);
        if (i<nCubeList.length-1) text += "+";
    }}
    return text;
}

function findExCoord(nCube,ex,coord){
    var size;
    switch(ex){
        case 0: size = 4; break;
        case 1: size = 0; break;
    }
    for (var i=0; i<nCube.length; i++){ switch(ex){
            case 0: if (size > nCube[i][coord]) size = nCube[i][coord]; break;
            case 1: if (size < nCube[i][coord]) size = nCube[i][coord]; break;
    }}
    return size;
}

function writeNCubes(){
    var colors = ["red","green","blue","yellow","cyan","magenta","darkred","darkgreen","darkblue","gray","orange","fuschia","azur","purple","aqua","lime"];
    var code = "\n";
    var goesOutW; //If the n-cube goes out of the K-Map and back in, widthwise.
    var goesOutH; //If the n-cube goes out of the K-Map and back in, heightwise.
    if (nCubeList.length !== 0){ for (var i=0; i<nCubeList.length; i++){
        goesOutW = (nCubeList[i][0][0]==3 && findExCoord(nCubeList[i],0,0)===0);
        goesOutH = (nCubeList[i][0][1]==3 && findExCoord(nCubeList[i],0,1)===0);
        for(var d=0; d<2; d++){ if (findExCoord(nCubeList[i],d,2)==d){
            //For each depth level of the n-cube, if it exists.
            code += "\\color{" + colors[i%16] + "}";
            code += "\\put("+(4*d+nCubeList[i][0][0])+","+(KMap.Height-1-findExCoord(nCubeList[i],1,1))+".1)";
            if(goesOutW && goesOutH){
                code += "{\\dashbox{0.2}(0.8,0.8){}}\n";
                code += "\\color{" + colors[i%16] + "}\\put("+(4*d)+",0.1){\\dashbox{0.2}(0.8,0.8){}}\n";
                code += "\\color{" + colors[i%16] + "}\\put("+(4*d+3)+",3.1){\\dashbox{0.2}(0.8,0.8){}}\n";
                code += "\\color{" + colors[i%16] + "}\\put("+(4*d)+",3.1){\\dashbox{0.2}(0.8,0.8){}}\n";
            }else if(goesOutW){
                code += "{\\dashbox{0.2}(0.8,"+(findExCoord(nCubeList[i],1,1)-findExCoord(nCubeList[i],0,1))+".8){}}\n";
                code += "\\color{" + colors[i%16] + "}\\put("+(4*d)+","+(3-findExCoord(nCubeList[i],1,1))+".1)";
                code += "{\\dashbox{0.2}(0.8,"+(findExCoord(nCubeList[i],1,1)-findExCoord(nCubeList[i],0,1))+".8){}}\n";
            }else if(goesOutH){
                code += "{\\dashbox{0.2}("+(findExCoord(nCubeList[i],1,0)-findExCoord(nCubeList[i],0,0))+".8,0.8){}}\n";
                code += "\\color{" + colors[i%16] + "}\\put("+(4*d+nCubeList[i][0][0])+",3.1)";
                code += "{\\dashbox{0.2}("+(findExCoord(nCubeList[i],1,0)-findExCoord(nCubeList[i],0,0))+".8,0.8){}}\n";
            }else{
                code += "{\\dashbox{0.2}("+(findExCoord(nCubeList[i],1,0)-findExCoord(nCubeList[i],0,0))+".8,";
                code += (findExCoord(nCubeList[i],1,1)-findExCoord(nCubeList[i],0,1))+".8){}}\n";
            }
        }}
    }}
    return code;
}

function generateLaTeXCode(){
    var code = "{\\fontfamily{phv}\\selectfont\\sansmath\n";
    code += "\\askmap";

    //Number of variables.
    switch(numVar){
        case 2: code += "ii"; break;
        case 3: code += "iii"; break;
        case 4: code += "iv"; break;
        case 5: code += "v"; break;
    }
    code += "{$";

    //Solution (logic function).
    code += writeLogicFunction();
    code += "$}{";

    //Variable names.
    for (var x=0; x<(KMap.nVarX+KMap.nVarY+KMap.nLevels-1); x++) code += varNames[x];
    code += "}{}{";

    //Content of the K-Map.
    for (d=0; d<KMap.nLevels; d++){
    for (w=0; w<KMap.Width; w++){
    for (h=0; h<KMap.Height; h++){
    	code += boolToBin(KMap[bitOrd[d]][bitOrd[w]][bitOrd[h]].Value);
    }}}
    code += "}{";

    code += writeNCubes();
    code += "}}\n\n";
	return code;
}
