/**
 * Prompt personalizado
 *
 * Este script genera un cuadro emergente que emula al cuadro de ingreso de datos del método window.prompt()
 *
 * MODO DE USO: Prompt.go("El mensaje que indique al usuario qué dato tiene que ingresar", "Tipo de <input>", Llamada de retorno, Propiedades del <input>, Ancho del <input>, "Nodo a insertar antes del <input>");
 *
 * @author		Alexis López Espinoza
 * @version		1.0
 * @param		{mensaje}		String		El mensaje que indique al usuario qué dato tiene que ingresar
 * @param		{inputType}		String		El tipo de <input>
 * @param		{callback}		Function	Una función de llamada de retorno que se ejecutará luego 
 * 											de que el usuario pulse el botón de envío.
 * @param		{properties}	Object		Un objeto literal con propiedades adicionales para el <input>
 * @param		{width}			String		El ancho del <input>
 * @param		{nodeBefore}	String		Un nodo a insertar antes que el <input>
 */

"use strict";

let Prompt = {
	state: true, //Comodín que controla la creación de cuadros de ingreso de datos
	go: (mensaje, inputType, callback, properties, width, nodeBefore) => {
		//Si no se recibe un mensaje, se establece uno por defecto
		if (!mensaje || ({}.toString.call(mensaje) == "[object String]" && !mensaje.length)){
			mensaje = "Ingrese el texto:";
		}

		//Se almacenan el mensaje, el tipo de campo, la llamada de retorno y las propiedades
		Prompt.mensaje = mensaje;
		Prompt.type = inputType || "text";
		Prompt.callback = callback || null;
		Prompt.properties = properties || null;
		Prompt.inputWidth = width || "90%";
		Prompt.nodeBefore = nodeBefore || null;

		//Si no hay otro cuadro de Promptación, se procede a mostrar uno nuevo
		if (Prompt.state){
			Prompt.show();
		}
		//Caso contrario, se le informa al usuario que tiene que resolver la Promptación pendiente
		else{
			Notification.msg("Tiene un ingreso de datos pendiente");
		}
	},

	show: _ => {
		//Se almacena el valor actual de la propiedad overflow del document
		Prompt.overflow = getComputedStyle(document.body).overflow;

		//Fondo
		Prompt.back = document.createElement("div");
		Prompt.back.classList.add("prompt");
		Prompt.back.style.width = window.innerWidth + "px";
		Prompt.back.style.height = window.innerHeight + "px";
		Prompt.back.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
		Prompt.back.style.top = 0;
		Prompt.back.style.left = 0;
		Prompt.back.style.margin = 0;
		Prompt.back.style.position = "fixed";		
		Prompt.back.style.display = "flex";
		Prompt.back.style.alignItems = "center";
		Prompt.back.style.justifyContent = "center";
		Prompt.back.style.transition = "all ease .15s";
		Prompt.back.style.zIndex = "8888 !important";

		//Cuadro frontal
		Prompt.front = document.createElement("div");
		Prompt.front.style.width = Prompt.width();
		Prompt.front.style.backgroundColor = "snow";
		Prompt.front.style.borderRadius = "5px";
		Prompt.front.style.paddingTop = "1%";
		Prompt.front.style.paddingBottom = "1%";
		Prompt.front.style.paddingRight = "2.5%";
		Prompt.front.style.paddingLeft = "2.5%";
		Prompt.front.style.display = "flex";
		Prompt.front.style.alignItems = "center";
		Prompt.front.style.justifyContent = "center";
		Prompt.front.style.textAlign = "center";
		Prompt.front.style.flexDirection = "column";
		Prompt.front.style.transition = "all ease .15s";
		Prompt.front.style.zIndex = "9999 !important";

		//Botón para enviar
		Prompt.send = Prompt.buttons("Enviar");

		//Botón para cancelar
		Prompt.cancel = Prompt.buttons("Cancelar");

		//El mensaje
		Prompt.label = document.createElement("span");
		Prompt.label.style.display = "inline-block";
		Prompt.label.style.marginBottom = "1%";
		Prompt.label.style.userSelect = "none";
		Prompt.label.style.fontWeight = "bold";
		Prompt.label.style.color = "#1a1a1a";
		Prompt.label.textContent = Prompt.mensaje;

		//El cuadro de ingreso de datos
		Prompt.input = document.createElement("input");
		Prompt.input.type = Prompt.type;
		Prompt.input.style.display = "inline-block";
		Prompt.input.style.marginBottom = "1%";
		Prompt.input.style.backgroundColor = "transparent";
		Prompt.input.style.outline = 0;
		Prompt.input.style.border = 0;
		Prompt.input.style.width = Prompt.inputWidth || "90%";
		Prompt.input.style.borderBottom = ".1rem solid gray";
		Prompt.input.style.color = "#262626";

		//Si se establecieron otras propiedades, se añaden al <input>
		if (Prompt.properties){
			for (let prop in Prompt.properties){
				Prompt.input[prop] = Prompt.properties[prop];
			}
		}

		//Contenedor de los botones
		Prompt.container = document.createElement("p");
		Prompt.container.style.display = "flex";
		Prompt.container.style.alignItems = "center";
		Prompt.container.style.justifyContent = "center";
		Prompt.container.style.margin = "1px";	

		//Se adhieren los botones al contenedor
		Prompt.container.appendChild(Prompt.send);
		Prompt.container.appendChild(Prompt.cancel);

		//Se adhiere el mensaje al cuadro frontal
		Prompt.front.appendChild(Prompt.label);

		//Si hay un nodo especificado para insertar antes del <input>, se adhiere al cuadro frontal
		if (Prompt.nodeBefore){
			Prompt.front.insertAdjacentHTML("beforeend", Prompt.nodeBefore);
		}

		//Se adhiere el cuadro de ingreso de datos al cuadro frontal
		Prompt.front.appendChild(Prompt.input);

		//Se adhiere el contenedor de botones al cuadro frontal
		Prompt.front.appendChild(Prompt.container);		

		//Se adhiere el cuadro
		Prompt.back.appendChild(Prompt.front);

		//Se adhiere el fondo al documento
		document.body.appendChild(Prompt.back);

		//Se retiran las barras de desplazamiento del documento
		document.body.style.overflow = "hidden";

		//Se le da el enfoque al cuadro de ingreso de datos
		Prompt.input.focus();

		//Si se pulsa el botón de envío
		Prompt.send.addEventListener("click", Prompt.checkSend, false);

		//Si el cuadro de ingreso de datos está activo y se pulsa la tecla ENTER
		Prompt.input.addEventListener("keypress", e => {
			e.which == 13 && Prompt.checkSend();
		}, false);

		//Al girar el dispositivo, cambian las dimensiones del fondo
		window.addEventListener("orientationchange", Prompt.resize, false);
		window.addEventListener("resize", Prompt.resize, false);

		//Si se pulsa el botón para cancelar, se cierran el fondo oscuro y el cuadro frontal
		Prompt.cancel.addEventListener("click", Prompt.hide, false);
	},

	checkSend: _ => {
		let nodeValue = "";

		//Si el cuadro de ingreso de datos tiene uno o más caracteres
		if (Prompt.input.value.length){
			//Se ocultan el fondo y el cuadro frontal
			Prompt.hide();

			//Si se adhirió un nodo antes del <input>, se toma su valor y se concatena con el valor del <input>
			if (Prompt.nodeBefore && "value" in Prompt.input.previousElementSibling){
				nodeValue = Prompt.input.previousElementSibling.value;
			}
				
			//Si se recibió una llamada de retorno y es de tipo Function, se le pasa el valor ingresado como argumento y se ejecuta
			if (Prompt.callback && {}.toString.call(Prompt.callback) == "[object Function]"){
				Prompt.callback(nodeValue + Prompt.input.value);
			}
			//Si no, se devuelve el valor ingresado
			else{
				return nodeValue + Prompt.input.value;
			}
		}
		else{
			Prompt.input.focus();
		}
	},

	hide: _ => {
		//Se desvanecen el fondo y su contenido
		Prompt.back.style.opacity = 0;

		//Se devuelve al documento sus barras de desplazamiento
		document.body.style.overflow = Prompt.overflow;

		//Luego de 200 milésimas de segundo, se eliminan el fondo y su contenido y el valor del comodín vuelve a true
		setTimeout(_ => {
			document.body.removeChild(Prompt.back);			
			Prompt.flag = true;
		}, 200);
	},

	width: _ => window.matchMedia("(min-width: 920px)").matches ? "350px" : "250px",

	resize: _ => {
		Prompt.back.style.width = window.innerWidth + "px";
		Prompt.back.style.height = window.innerHeight + "px";
		Prompt.front.style.width = Prompt.width();
		Prompt.back.style.top = 0;
	},

	buttons: text => {
		let button = document.createElement("b");
		
		button.style.backgroundColor = "#262626";
		button.style.color = "snow";
		button.style.fontWeight = "bold";
		button.style.cursor = "pointer";
		button.style.userSelect = "none";
		button.style.display = "inline-block";
		button.style.marginRight = "5px";
		button.style.paddingTop = "7.5px";
		button.style.paddingBottom = "7.5px";
		button.style.paddingRight = "12.5px";
		button.style.paddingLeft = "12.5px";
		button.style.borderRadius = "5px";
		button.textContent = text;		

		button.addEventListener("mouseover", _ => button.style.backgroundColor = "#191919", false);
		button.addEventListener("mouseout", _ => button.style.backgroundColor = "#262626", false);		

		return button;
	}
};
