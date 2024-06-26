                                             //
//  initShaders.js
//

function initShadersFromDom(gl, vertexShaderId, fragmentShaderId){
	var vertElem = document.getElementById( vertexShaderId );
    if ( !vertElem ) {
        alert( "Unable to load vertex shader " + vertexShaderId );
        return -1;
    }
	
	var fragElem = document.getElementById( fragmentShaderId );
    if ( !fragElem ) {
        alert( "Unable to load vertex shader " + fragmentShaderId );
        return -1;
    }
	
	return initShaders(gl, vertElem.textContent, fragElem.textContent);
}

async function initShadersFromUrl(gl, vertexShaderUrl, fragmentShaderUrl){
	const vertexShaderCode = await fetch(vertexShaderUrl).then(response => response.text()); 
	const fragmentShaderCode = await fetch(fragmentShaderUrl).then(response => response.text()); 
	return initShaders(gl, vertexShaderCode, fragmentShaderCode);
}

function initShaders( gl, vertexShaderCode, fragmentShaderCode )
{
    var vertShdr;
    var fragShdr;

	vertShdr = gl.createShader( gl.VERTEX_SHADER );
	gl.shaderSource( vertShdr, vertexShaderCode.replace(/^\s+|\s+$/g, '' ));
	gl.compileShader( vertShdr );
	if ( !gl.getShaderParameter(vertShdr, gl.COMPILE_STATUS) ) {
		var msg = "Vertex shader failed to compile.  The error log is:\n\n" + gl.getShaderInfoLog( vertShdr );
		alert( msg );
		return -1;
	}


	fragShdr = gl.createShader( gl.FRAGMENT_SHADER );
	gl.shaderSource( fragShdr, fragmentShaderCode.replace(/^\s+|\s+$/g, '' ) );
	gl.compileShader( fragShdr );
	if ( !gl.getShaderParameter(fragShdr, gl.COMPILE_STATUS) ) {
		var msg = "Fragment shader failed to compile.  The error log is:\n\n" + gl.getShaderInfoLog( fragShdr );
		alert( msg );
		return -1;
	}

    var program = gl.createProgram();
    gl.attachShader( program, vertShdr );
    gl.attachShader( program, fragShdr );
    gl.linkProgram( program );

    if ( !gl.getProgramParameter(program, gl.LINK_STATUS) ) {
        var msg = "Shader program failed to link.  The error log is:\n\n"
            + gl.getProgramInfoLog( program );
        alert( msg );
        return -1;
    }

    return program;
}
