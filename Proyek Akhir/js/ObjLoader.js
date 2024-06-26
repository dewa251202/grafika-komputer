// https://github.com/sketchpunk/FunWithWebGL2/blob/master/lesson_011/ObjLoader.js
class ObjLoader{
	static parseFromDom(elmID,flipYUV){ return ObjLoader.parseObjText(document.getElementById(elmID).innerHTML,flipYUV); }
	
	static parseFromUrl(url,flipYUV){ return fetch(url).then(response => response.text()).then(txt => ObjLoader.parseObjText(txt,flipYUV)); }
	
	static parseObjText(txt,flipYUV){
		txt = txt.trim() + "\n"; //add newline to be able to access last line in the for loop

		var line,				//Line text from obj file
			itm,				//Line split into an array
			ary,				//Itm split into an array, used for faced decoding
			i,
			ind,				//used to calculate index of the cache arrays
			isQuad = false,		//Determine if face is a quad or not
			aCache = [],		//Cache Dictionary key = itm array element, val = final index of the vertice
			cVert = [],			//Cache Vertice array read from obj
			cNorm = [],			//Cache Normal array ...
			cUV = [],			//Cache UV array ...
			fVert = [],			//Final Index Sorted Vertice Array
			fNorm = [],			//Final Index Sorted Normal Array
			fUV = [],			//Final Index Sorted UV array
			fIndex = [],		//Final Sorted index array
			fIndexCnt = 0,		//Final count of unique vertices
			posA = 0,
			posB = txt.indexOf("\n",0);
			
		var objName,
			obj,
			fObj = [],
			lastIndexCnt = 0;
		
		while(posB > posA){
			line = txt.substring(posA,posB).trim();

			switch(line.charAt(0)){
				//......................................................
				// Cache Vertex Data for Index processing when going through face data
				// Sample Data (x,y,z)
				// v -1.000000 1.000000 1.000000
				// vt 0.000000 0.666667
				// vn 0.000000 0.000000 -1.000000
				case "v":
					itm = line.split(" "); itm.shift();
					switch(line.charAt(1)){
						case " ": cVert.push(parseFloat(itm[0]) , parseFloat(itm[1]) , parseFloat(itm[2]) ); break;		//VERTEX
						case "t": cUV.push( parseFloat(itm[0]) , parseFloat(itm[1]) );	break;							//UV
						case "n": cNorm.push( parseFloat(itm[0]) , parseFloat(itm[1]) , parseFloat(itm[2]) ); break;	//NORMAL
					}
				break;

				//......................................................
				// Process face data
				// All index values start at 1, but javascript array index start at 0. So need to always subtract 1 from index to match things up
				// Sample Data [Vertex Index, UV Index, Normal Index], Each line is a triangle or quad. 
				// f 1/1/1 2/2/1 3/3/1 4/4/1
				// f 34/41/36 34/41/35 34/41/36
				// f 34//36 34//35 34//36
				case "f":
					itm = line.split(" ");
					itm.shift();
					isQuad = false;

					for(i=0; i < itm.length; i++){
						//--------------------------------
						//In the event the face is a quad
						if(i == 3 && !isQuad){
							i = 2; //Last vertex in the first triangle is the start of the 2nd triangle in a quad.
							isQuad = true;
						}

						//--------------------------------
						//Has this vertex data been processed?
						if(itm[i] in aCache){
							//fIndex.push( aCache[itm[i]] ); //it has, add its index to the list.
							obj.indices.push(aCache[itm[i]] - lastIndexCnt);
						}else{
							//New Unique vertex data, Process it.
							ary = itm[i].split("/");
							
							//Parse Vertex Data and save final version ordred correctly by index
							ind = (parseInt(ary[0])-1) * 3;
							//fVert.push( cVert[ind] , cVert[ind+1] , cVert[ind+2] );
							obj.positions.push(cVert[ind], cVert[ind+1], cVert[ind+2]);

							//Parse Normal Data and save final version ordered correctly by index
							ind = (parseInt(ary[2])-1) * 3;
							//fNorm.push( cNorm[ind] , cNorm[ind+1] , cNorm[ind+2] );
							obj.normals.push(cNorm[ind], cNorm[ind+1], cNorm[ind+2]);

							//Parse Texture Data if available and save final version ordered correctly by index
							if(ary[1] != ""){
								ind = (parseInt(ary[1])-1) * 2;
								//fUV.push( cUV[ind] , (!flipYUV)? cUV[ind+1] : 1-cUV[ind+1] );
								obj.textureCoords.push(cUV[ind], (!flipYUV ? cUV[ind+1] : 1 - cUV[ind+1]));
							}

							//Cache the vertex item value and its new index.
							//The idea is to create an index for each unique set of vertex data base on the face data
							//So when the same item is found, just add the index value without duplicating vertex,normal and texture.
							aCache[ itm[i] ] = fIndexCnt;
							//fIndex.push(fIndexCnt);
							obj.indices.push(fIndexCnt - lastIndexCnt);
							fIndexCnt++;
						}

						//--------------------------------
						//In a quad, the last vertex of the second triangle is the first vertex in the first triangle.
						if(i == 3 && isQuad){
							//fIndex.push( aCache[itm[0]] );
							obj.indices.push(aCache[itm[0]] - lastIndexCnt);
						}
					}
				break;
				
				case "o":
					if(fIndexCnt > 0){
						lastIndexCnt = fIndexCnt;
						obj.positions = new Float32Array(obj.positions);
						obj.normals = new Float32Array(obj.normals);
						obj.textureCoords = new Float32Array(obj.textureCoords);
						fObj.push(obj);
					}
					itm = line.split(" "); itm.shift();
					objName = itm[0];
					obj = {
						name: objName,
						positions: [],
						normals: [],
						textureCoords: [],
						indices: []
					}
				break;
				
				case "u":
					itm = line.split(" "); itm.shift();
					obj.materialName = itm[0];
				break;
			}

			//Get Ready to parse the next line of the obj data.
			posA = posB+1;
			posB = txt.indexOf("\n",posA);
			if(posA == posB){
				posA = posB+1;
				posB = txt.indexOf("\n",posA);
			}
		}
		obj.positions = new Float32Array(obj.positions);
		obj.normals = new Float32Array(obj.normals);
		obj.textureCoords = new Float32Array(obj.textureCoords);
		fObj.push(obj);
		
		return fObj;		
	}
}//cls