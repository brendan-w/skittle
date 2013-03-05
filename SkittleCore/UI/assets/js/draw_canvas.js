var mainLoop = window.setInterval(function(){
    if(isInvalidDisplay) {
        isInvalidDisplay = false
        drawGraphs();
        updateDials();
    }
},50)

var init = function() {
    imageObj = {};
    imageObj["n"] = []
    imageObj["n"][0] = new Image();
    imageObj["n"][0].src = graphURL('n',0);
    // imageND = new Image()
    // imageND.src = nd_url; //graphURL("n");
    // imageRMap = new Image();
    // imageRMap.src = rm_url; // source data


    c.imageSmoothingEnabled = false; // so it won't be blury when it scales
    c.webkitImageSmoothingEnabled = false;
    c.mozImageSmoothingEnabled = false;
    c.scale(Math.round(3*zoom),Math.round(3*zoom))
    imageObj["n"][0].onload = function(){
        isInvalidDisplay = true
    }

    if (document.defaultView && document.defaultView.getComputedStyle) {
      stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(cc, null)['paddingLeft'], 10)      || 0;
      stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(cc, null)['paddingTop'], 10)       || 0;
      styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(cc, null)['borderLeftWidth'], 10)  || 0;
      styleBorderTop   = parseInt(document.defaultView.getComputedStyle(cc, null)['borderTopWidth'], 10)   || 0;
    }

    $(window).resize(function() {
        calcSkixelsOnScreen();
        updateEnd();
    });
    $.each(graphStatus,function(i,v){ //add unordered graphs to the end of the order
        if ($.inArray(i,graphOrder)<0) {
            graphOrder.push(i)
        }
    })
    for (var i=0;i<graphOrder.length;i++) {
        $("#graphLabel-" + graphOrder[i]).appendTo("#graph-labels ul")
        $("#showGraph-" + graphOrder[i]).parent().appendTo("#graphList ul")
    }
}

var imageRequestor = function(graph,chunkOffset) {
    imageObj[graph] = imageObj[graph] || []

    var graphPath = graphURL(graph,chunkOffset)

    if (!imageObj[graph][chunkOffset] 
        || ( imageObj[graph][chunkOffset].complete 
            && imageObj[graph][chunkOffset].source != graphPath ) ) {
        imageObj[graph][chunkOffset] = new Image();
        imageObj[graph][chunkOffset].source = graphPath;
        imageObj[graph][chunkOffset].src = graphPath;
        imageObj[graph][chunkOffset].onload = function() { // causes a little bit of jitter when scrolling
            isInvalidDisplay = true
        }
        imageObj[graph][chunkOffset].onerror = function() {
            console.log('not a valid filename')
        }
    }
    return imageObj[graph][chunkOffset]
}
var graphURL = function(graph,chunkOffset) {
    var startTopOfScreen = (start-8*width*scale) >  0 ? (start-8*width*scale) : 1
    var startChunk = ( ( Math.floor(startTopOfScreen/(65536*scale) ) + chunkOffset )*65536*scale + 1 );
    var graphPath = "data.png?graph=" + graph + "&start=" + startChunk + "&scale=" + scale;
    if (graphStatus[graph].rasterGraph != true) graphPath += "&width=" + expRound(width,graphStatus[graph].widthTolerance)
    if (graph == 'h') graphPath += "&searchStart=" + selectionStart + "&searchStop=" + selectionEnd
    if (graphStatus[graph].colorPaletteSensitive) graphPath += "&colorPalette="+colorPalette
    return graphPath
}
    var loadedAnnotations = []
var annotationRequestor = function(chunkOffset) {
    if(!loadedAnnotations[chunkOffset]) {
        $.getJSON('annotation.json',{start:chunkOffset},function(data){
            $.extend(annotations,data[chunkOffset])
            isInvalidDisplay = true
            loadedAnnotations[chunkOffset] = true
        }).error(function(jqXHR, textStatus, errorThrown){console.log(jqXHR.responseText,textStatus,errorThrown)})
    }
}


// the part that does the actual work
var gutterWidth = 8 //skixels
var minimumWidth = 120 //pixels
var calculateOffsetWidth = function(skixelWidthofGraph) {
    return Math.max( (skixelWidthofGraph + gutterWidth), toSkixels(minimumWidth) )
}

var drawGraphs = function() {
    drawPixelStuff = [];
    b.clearRect(0,0,1024,1000)
    var offset = xOffset + gutterWidth
    var chunks = Math.min( Math.ceil(skixelsOnScreen/65536 + 1),(Math.ceil(fileLength/(65536*scale))-Math.floor((start-8*width*scale)/(65536*scale))),Math.ceil(fileLength/(65536*scale)) )
    // for (key in graphStatus) {
    $.each(graphOrder,function(i,key){
        if (graphStatus[key].visible) {
            graphStatus[key].skixelOffset = offset;
            var skixelWidthofGraph = graphStatus[key].skixelWidth = drawGraph(key,offset,chunks);
            skixelWidthofGraph = Math.max(skixelWidthofGraph,toSkixels(minimumWidth))
            offset = offset + skixelWidthofGraph;
            if (graphStatus[key].help) offset += toSkixels(200);
            $('#graphLabel-' + key).width(toPixels(skixelWidthofGraph));
        }
    })
    // for (var i=0;i<graphOrder.length;i++) {
    //     var key = graphOrder[i];
    //     if (graphStatus[key].visible) {
    //         graphStatus[key].skixelOffset = offset;
    //         var skixelWidthofGraph = graphStatus[key].skixelWidth = drawGraph(key,offset,chunks);
    //         skixelWidthofGraph = Math.max(skixelWidthofGraph,toSkixels(minimumWidth))
    //         offset = offset + skixelWidthofGraph;
    //         $('#graphLabel-' + key).width(toPixels(skixelWidthofGraph));
    //     }
    // }
    // var imageObj = imageRequestor("m",0)
        // b.drawImage(imageObj,200,20,imageObj.width,imageObj.height*0.55) // render data on hidden canvas


    c.clearRect(0,0,2000,1000) // render on visible canvas (which has scale applied)
    c.drawImage(b.canvas, 0, 0);

    while (drawPixelStuff.length) { // draw any pixel grid stuff
        var fn = drawPixelStuff.shift();
        fn();
    }

}

var drawGraph = function(graph,offset,chunks) {
    switch (graph) {
        case "a": return drawAnnotations(offset,chunks)
        case "b": return drawNucBias(offset,chunks);
        case "m": return drawRMap(offset,chunks);
        case "s": return drawSimHeat(offset,chunks);
        case "r": return drawRepeatOverview(offset,chunks);
        default: 
            if (graphStatus[graph].rasterGraph == true) return drawRasterGraph(graph,offset,chunks);
            else return drawVerticalGraph(graph,offset,chunks);
    }
}
var drawRasterGraph = function(graph,offset,chunks) {
    a.clearRect(0,0,1024,500)
    for (var i=0;i<chunks;i++) {
        var imageObj = imageRequestor(graph,i)
        if(!imageObj.complete || imageObj.naturalWidth === 0) imageObj = imageUnrendered;
        a.drawImage(imageObj,0,64*i) // render data on hidden canvas
    }

    var imageData = a.getImageData(0, 0, 1024, chunks*64);
    var data = imageData.data;
    var newImageData = b.createImageData(width,toSkixels(1000)) //create new image data with desired dimentions (width)
    var newData = newImageData.data;

    var fadePercent = 1
    if (annotationSelectedStart > 0) {
        fadePercent = 0.35
    }
    var chunkStartOffset = Math.max( Math.floor((start/scale-width*8)/(65536) ), 0 )*65536
    var startOffset = ( Math.round(start/scale) - 1 - width*8 - chunkStartOffset )*4;
    var selectedStart = ((annotationSelectedStart/scale) - chunkStartOffset)*4;
    var selectedEnd = ((annotationSelectedEnd/scale) - chunkStartOffset)*4;
    for (var x = 0; x < newData.length; x += 4) { // read in data from original pixel by pixel
        var y = x + startOffset
        newData[x] = data[y] || 0;
        newData[x + 1] = data[y + 1] || 0;
        newData[x + 2] = data[y + 2] || 0;
        (selectedEnd >y && selectedStart<y) ? newData[x + 3] = data[y + 3] : newData[x + 3] = data[y + 3]*fadePercent;
    }
    b.putImageData(newImageData, offset, 0);

    return calculateOffsetWidth(width)
}
var drawVerticalGraph = function(graph,offset,chunks) {
    var graphWidth = 0, graphHeight = 0;
    var stretchFactor = expRound(width,graphStatus[graph].widthTolerance)/width 
    for (var i=0;i<chunks;i++) {
        var imageObj = imageRequestor(graph,i)
        if(!imageObj.complete || imageObj.naturalWidth === 0) imageObj = imageUnrendered;
        else var graphWidth = imageObj.width
        var vOffset = -Math.round(((Math.round(start/scale)-8*width)%(65536))/(width) - i*(65536/width));
        (i == chunks - 1) ? graphHeight = imageObj.height*stretchFactor : graphHeight = Math.ceil(65536/width) // don't stretch last chunk
        // graphHeight = Math.ceil(imageObj.height*stretchFactor)
        b.drawImage(imageObj,offset,vOffset,graphWidth,graphHeight) // render data on hidden canvas
        // b.beginPath();
        // b.moveTo(offset,vOffset-0.5)
        // b.lineTo(offset + graphWidth,vOffset-0.5)
        // b.strokeStyle = "#f0f"
        // b.stroke();
    }
    return calculateOffsetWidth(graphWidth)
}
var drawAnnotations = function(offset,chunks) {
    var annotationWidth = 3
    var columnFilledTilRow = []


    for (var i = 0; i < chunks; i++) {
        annotationRequestor((Math.floor(start/65536)+i)*65536+1)
    };

    visibleAnnotations = []
    
    // var annotationsProcessed = []
    $.each(annotations,function(i,annotation){ // [2] = from, [3] = to
        // if($.inArray(i,annotationsProcessed)<0) { //check for duplicate annotations and push identifier to array if not. --Might not need, looks like $.extend gets rid of dups
            // annotationsProcessed.push(i)
            if (   (annotation[2] < ( start + (skixelsOnScreen + 37*width - 1)*scale ) && annotation[3] > ( start + (skixelsOnScreen + 37*width - 1)*scale ) )
                || (annotation[2] < (start - 8*width*scale) && annotation[3] > (start - 8*width*scale) )
                || (annotation[2] > (start - 8*width*scale) && annotation[3] < ( start + (skixelsOnScreen + 37*width - 1)*scale ) ) ) {
                

                visibleAnnotations.push(i)

            }
        // }
        //else do nothing
    })
    visibleAnnotations.sort(function(a,b){return annotations[a][2]-annotations[b][2]})

    $.each(visibleAnnotations,function(i,v){
        var currentColumn = 0
        var startRow = Math.floor((annotations[v][2]-start)/(width*scale)+8)
        var rowHeight = Math.ceil((annotations[v][3]-annotations[v][2])/(width*scale))

        for (currentColumn=0;currentColumn<=columnFilledTilRow.length;currentColumn++) {
            if (!columnFilledTilRow[currentColumn] || startRow > columnFilledTilRow[currentColumn]) {
                columnFilledTilRow[currentColumn] = startRow + rowHeight
                annotations[v].column = currentColumn
                annotations[v].startRow = startRow
                annotations[v].rowHeight = rowHeight
                break;
            }
        }
    })
    
    var offsetWidth = calculateOffsetWidth(columnFilledTilRow.length*annotationWidth)
    drawPixelStuff.push(function(){
        $.each(visibleAnnotations,function(i,v){
            if (annotations[v][3]-annotations[v][2]>3) {
                c.beginPath()
                c.rect(offsetWidth-annotations[v].column*annotationWidth-1,annotations[v].startRow,-2/(zoom*3),annotations[v].rowHeight)
                annotations[v].color = annotations[v].color || getGoodDeterministicColor(annotations[v][2] + "" + annotations[v][3] +"" + i + "")
                c.fillStyle=annotations[v].color
                c.fill()
            }
            else {
                c.beginPath()
                c.arc(offsetWidth-annotations[v].column*annotationWidth-annotationWidth/2,annotations[v].startRow+annotationWidth/2,annotationWidth/2,0,2*Math.PI,false)
                annotations[v].color = annotations[v].color || getGoodDeterministicColor(annotations[v][2] + "" + annotations[v][3] + "" + i + "")
                c.fillStyle=annotations[v].color
                c.fill()
            }
        })

    })


    return calculateOffsetWidth(Math.max(columnFilledTilRow.length*annotationWidth))
}
var drawNucBias = function(offset,chunks) {
    b.beginPath()
    b.rect(offset+20,0,20,500)
    b.fillStyle="#333";
    b.fill()

    drawVerticalGraph("b",offset,chunks)
    return calculateOffsetWidth(60)
}
var drawRMap = function(offset,chunks) {
    var offsetWidth = drawVerticalGraph("m",offset,chunks)
    
    drawPixelStuff.push(function() { 
        bpPerLine = width*scale
        if ( bpPerLine >= 1) { //draw the red lines
            var cumulativeWidth = 0, megaColumn=0, subColumn=0;

            while (cumulativeWidth<(bpPerLine-12)) {
                cumulativeWidth += Math.pow(2,megaColumn)
                subColumn++
                if(subColumn>=12) {
                    subColumn=0
                    megaColumn++
                } 
            }
            var widthPosition = offset + 11 + megaColumn*12+subColumn -(cumulativeWidth-bpPerLine+12)/Math.pow(2,megaColumn)
            // var widthPosition = offset + 17.315*Math.log(width*scale) - 42.85 - Math.min(0.9,(width*scale)/36);
            widthPosition = Math.round(widthPosition*3)/3
            c.beginPath();
            c.moveTo(widthPosition-0.18181818,0)
            c.lineTo(widthPosition-0.18181818,500)
            c.moveTo(widthPosition+1.18181818,0)
            c.lineTo(widthPosition+1.18181818,500)
            c.strokeStyle = "#f00"
            c.lineWidth = 0.333333333
            c.stroke();
        }
    })
    return Math.max(offsetWidth,calculateOffsetWidth(143))
}
var drawSimHeat = function(offset,chunks) {
    a.clearRect(0,0,350,10000)
    var displayWidth = 300
    var stretchFactor = expRound(width,graphStatus['s'].widthTolerance)/width
    var lineHeight = Math.round(65536/width) //Math.round((Math.round(width/10)*10)/width*Math.ceil(65536/width));
    var displayWidth = Math.round(stretchFactor*displayWidth)
    for (var i=0;i<chunks;i++) {
        var imageObj = imageRequestor("s",i)
        if(!imageObj.complete || imageObj.naturalWidth === 0) imageObj = imageUnrendered;
        a.drawImage(imageObj,0,lineHeight*i,displayWidth,lineHeight) // render data on hidden canvas
        // a.beginPath();
        // a.moveTo(0,lineHeight*i+0.5)
        // a.lineTo(300,lineHeight*i+0.5)
        // a.strokeStyle = "#0f0"
        // a.stroke();
    }
    var imageData = a.getImageData(0, 0, displayWidth, chunks*lineHeight);
    var data = imageData.data;
    var newImageData = b.createImageData(displayWidth,displayWidth) //create new image data with desired dimentions (width)
    var newData = newImageData.data;

    var lineLength = displayWidth*4;
    var bpPerLine = width*scale
    var offsetStart = start - bpPerLine*8
    var linesFromTop = offsetStart/bpPerLine
    var chunksFromTop = Math.max(Math.floor(offsetStart/(scale*65536)),0)
    var bpFromLastChunk = offsetStart - chunksFromTop*(65536*scale)
    var linesFromLastChunk = Math.floor(bpFromLastChunk/bpPerLine)
    var startOffset = linesFromLastChunk*lineLength

    var l = 0, i = startOffset
    for (var x = 0; x < newData.length; x += 4) { // read in data from original pixel by pixel
        var y = (x - l*lineLength)
        if (y >= lineLength) {
            l += 1
            x += 4*l
            i = startOffset + lineLength*l
        }
        var mirror = (y/4)*lineLength + l*4
        newData[x] = newData[mirror] = data[i] || 0;
        newData[x + 1] = newData[mirror + 1] = data[i + 1] || 0;
        newData[x + 2] = newData[mirror + 2] = data[i + 2] || 0;
        newData[x + 3] = newData[mirror + 3] = data[i + 3] || 0;
        i +=4
    }

    b.putImageData(newImageData, offset, 0);
        var vOffset = -Math.round(((start-8*width)%65536)/(width*scale));
        // b.putImageData(imageData, offset+320, vOffset);
    return calculateOffsetWidth(displayWidth)
    
}
var drawRepeatOverview = function(offset,chunks) {
    var offsetWidth = drawRasterGraph('r',offset+11,chunks)

    var height = toSkixels($('#canvasContainer').height()-70)
    drawPixelStuff.push(function() { 
        var legendGradient = c.createLinearGradient(0,0,0,height)
        legendGradient.addColorStop(0,'#00a')
        legendGradient.addColorStop(0.25,'#a00')
        legendGradient.addColorStop(0.5,'#aa0')
        legendGradient.addColorStop(0.75,'#0a0')
        legendGradient.addColorStop(1,'#0aa')
        c.fillStyle = legendGradient
        c.fillRect(offset,10,10,height)


        c.textBaseline = "middle"
        c.textAlign = "center"
        c.fillStyle = '#fff'
        c.font = "5px Exo,sans-serif"
        c.shadowOffsetX = 1;
        c.shadowOffsetY = 1;
        c.shadowBlur    = 2;
        c.shadowColor   = 'rgba(0, 0, 0, 1)';

        c.fillText("1bp",offset+5,13)
        c.fillText("50",offset+5,10+height/5*1)
        c.fillText("100",offset+5,10+height/5*2)
        c.fillText("150",offset+5,10+height/5*3)
        c.fillText("200",offset+5,10+height/5*4)
        c.fillText("250",offset+5,10+height-2)
    })
    return offsetWidth+11
}
var generatePlaceholderImage = function() {

}
