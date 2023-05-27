/**
 * PROMPT PERSONALIZADO
 *
 * Este script genera un cuadro emergente que emula al cuadro de ingreso de datos del método window.prompt()
 *
 * MODO DE USO: Prompt.go("Texto a mostrar"/{Objeto de opciones de configuración});
 *
 * Se empleó el archivo notification.js: https://github.com/Alexis88/Notification
 *
 * @author		Alexis López Espinoza
 * @version		2.0
 * @param		options			Plain Object/String		
 */

"use strict";

let Prompt = {
	state: true, //Comodín que controla la creación de cuadros de ingreso de datos
	go: function(
		options
		/*** OPCIONES DE CONFIGURACIÓN ***
		 * 
		 * options.mensaje: El mensaje a mostrar
		 * options.inputType: El tipo de caja de texto
		 * options.callback: La llamada de retorno a ejecutarse luego de enviar el texto ingresado
		 * options.properties: Propiedades adicionales para la caja de texto
		 * options.content: Objeto con colores para el fondo del cuadro, el texto del encabezado y de la caja de texto
		 * options.width: El ancho de la caja de texto
		 * options.nodeBefore: El nodo que se insertará antes de la caja de texto
		 */
	){
		//Si se recibe una cadena de texto como argumento, se descarta el uso del objeto con las opciones de configuración
		if (arguments.length && {}.toString.call(arguments[0]) === "[object String]"){
			Prompt.mensaje = options;
		}
		//Si se recibe un objeto como argumento, se conserva el objeto con las opciones de configuración
		else if (arguments.length && {}.toString.call(arguments[0]) === "[object Object]"){
			Prompt.options = options;
		}
		//Caso contrario, se aborta la ejecución
		else{
			return;
		}

		//Se almacenan el mensaje, el tipo de campo, la llamada de retorno y las propiedades
		Prompt.mensaje = Prompt.options?.mensaje || Prompt.mensaje;
		Prompt.type = Prompt.options?.inputType || "text";
		Prompt.callback = Prompt.options?.callback || null;
		Prompt.content = Prompt.options?.content || null;
		Prompt.properties = Prompt.options?.properties || null;
		Prompt.inputWidth = Prompt.options?.width || "90%";
		Prompt.nodeBefore = Prompt.options?.nodeBefore || null;

		//Si no hay otro cuadro de ingreso de datos, se procede a mostrar uno nuevo
		if (Prompt.state){
			Prompt.show();
		}
		//Caso contrario, se le informa al usuario que tiene que resolver el ingreso de datos pendiente
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

		//Animación para mostrar el cuadro de ingreso de datos
		Prompt.back.animate([{
			opacity: 0
		}, {
			opacity: 1
		}], {
			duration: 400
		});

		//Cuadro frontal
		Prompt.front = document.createElement("div");
		Prompt.front.style.width = Prompt.width();
		Prompt.front.style.backgroundColor = Prompt.content?.front?.length ? Prompt.content.front : "#FFFFEF";
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
		Prompt.label.style.color = Prompt.content?.label?.length ? Prompt.content.label : "#1a1a1a";
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
		Prompt.input.style.borderBottom = Prompt.content?.border?.length ? `.1rem solid ${Prompt.content.border}` : ".1rem solid gray";
		Prompt.input.style.color = Prompt.content?.input?.length ? Prompt.content.input : "#262626";

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

		//Animación para mostrar el contenido central
		Prompt.front.animate([{
			transform: "scaleY(0)",
			opacity: 0
		}, {
			transform: "scaleY(1)",
			opacity: 1
		}], {
			duration: 400
		});

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
		//Se oculta el cuadro de ingreso de datos con un efecto de animación
		Prompt.back.animate([{
			opacity: 1
		}, {
			opacity: 0
		}], {
			duration: 400
		});

		//Se oculta el contenido central
		Prompt.front.animate([{
			transform: "scaleY(1)",
			opacity: 1
		}, {
			transform: "scaleY(0)",
			opacity: 0
		}], {
			duration: 400
		});

		//Se oculta el cuadro de ingreso de datos del todo (para evitar el problema del parpadeo)
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
		
		button.style.backgroundColor = "#305165";
		button.style.color = "#FFFFEF";
		button.style.fontWeight = "bold";
		button.style.cursor = "pointer";
		button.style.userSelect = "none";
		button.style.display = "inline-block";
		button.style.marginRight = "5px";
		button.style.paddingTop = "7.5px";
		button.style.paddingBottom = "7.5px";
		button.style.paddingRight = "12.5px";
		button.style.paddingLeft = "12.5px";
		button.style.border = ".1rem solid #FFFFEF";
		button.style.borderRadius = "5px";
		button.textContent = text;		

		button.addEventListener("mouseover", _ => button.style.backgroundColor = "#191919", false);
		button.addEventListener("mouseout", _ => button.style.backgroundColor = "#305165", false);		

		return button;
	}
};
