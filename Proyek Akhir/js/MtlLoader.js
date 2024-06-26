// Adapted from ObjLoader.js
class MtlLoader {
	static parseFromDom(elmID){
		return ObjLoader.parseObjText(document.getElementById(elmID).innerHTML);
	}
	
	static parseFromUrl(url){
		return fetch(url).then(response => response.text()).then(txt => MtlLoader.parseMtlText(txt));
	}
	
	static parseMtlText(txt){
		txt = txt.trim() + "\n";
		
		let result = {},
			lastMtlName,
			posA = 0,
			posB = txt.indexOf("\n",0);
			
		while(posA < posB){
			let line = txt.substring(posA,posB).trim();
			
			let words = line.split(' ');
			switch(words[0]){
				case "newmtl":
					lastMtlName = words[1];
					result[lastMtlName] = {};
					break;
				case "Ns":
					result[lastMtlName].shininess = parseFloat(words[1]);
					break;
				case "Ka":
					result[lastMtlName].ambient = [parseFloat(words[1]), parseFloat(words[2]), parseFloat(words[3])];
					break;
				case "Kd":
					result[lastMtlName].diffuse = [parseFloat(words[1]), parseFloat(words[2]), parseFloat(words[3])];
					break;
				case "Ks":
					result[lastMtlName].specular = [parseFloat(words[1]), parseFloat(words[2]), parseFloat(words[3])];
					break;
				case "map_Kd":
					result[lastMtlName].diffuseMapUrl = words[1];
					break;
				case "map_Ks":
					result[lastMtlName].specularMapUrl = words[1];
					break;
			}
			
			posA = posB+1;
			posB = txt.indexOf("\n",posA);
			if(posA == posB){
				posA = posB+1;
				posB = txt.indexOf("\n",posA);
			}
		}
		return result;
	}
}