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

const Prompt = {
	state: true, //Comodín que controla la creación de cuadros de ingreso de datos
	go: options => {
		/*** OPCIONES DE CONFIGURACIÓN ***
		 * 
		 * options.mensaje: El mensaje a mostrar
		 * options.inputType: El tipo de caja de texto
		 * options.callback: La llamada de retorno a ejecutarse luego de enviar el texto ingresado
		 * options.properties: Propiedades adicionales para la caja de texto
		 * options.content: Objeto con propiedades CSS para personalizar los elementos del cuadro
		 * options.nodeBefore: El nodo que se insertará antes de la caja de texto
		 */

		//Si hay otro cuadro mostrándose, se le avisa al usuario que tiene que resolverlo
		if (!Prompt.state){
			Notification.msg("Tiene un ingreso de datos pendiente");
			return;
		}

		//Si se recibió argumentos
		if (options){
			//Si el argumento no es un objeto, se lo establece como el texto a mostrar
			if ({}.toString.call(options) !== "[object Object]"){
				Prompt.mensaje = options;
			}
			//Si el argumento es un objeto, se lo establece como configuración del cuadro
			else{
				Prompt.options = options;
				Prompt.mensaje = options.mensaje;
			}
		}
		//Caso contrario, se aborta la ejecución
		else{
			throw new Error("Tiene que añadir un texto o un objeto con opciones de configuración para poder mostrar el cuadro");
		}

		//Se almacenan el mensaje, el tipo de campo, la llamada de retorno y las propiedades
		Prompt.mensaje = Prompt.options?.mensaje ?? Prompt.mensaje;
		Prompt.type = Prompt.options?.inputType ?? "text";
		Prompt.callback = Prompt.options?.callback && {}.toString.call(Prompt.options?.callback) === "[object Function]" ? Prompt.options.callback : null;
		Prompt.content = Prompt.options?.content ?? null;
		Prompt.properties = Prompt.options?.properties ?? null;
		Prompt.nodeBefore = Prompt.options?.nodeBefore ?? null;

		//Se muestra el cuadro
		Prompt.show();
	},

	show: _ => {
		//Fondo
		Prompt.createBack();

		//Cuadro frontal
		Prompt.createFront();

		//Botón para enviar
		Prompt.send = Prompt.buttons("Enviar");

		//Botón para cancelar
		Prompt.cancel = Prompt.buttons("Cancelar");

		//El mensaje
		Prompt.createMessage();

		//El cuadro de ingreso de datos
		Prompt.createBox();

		//Contenedor de los botones
		Prompt.createContainer();

		//Se adhiere el mensaje al cuadro frontal
		Prompt.front.appendChild(Prompt.label);

		//Si hay un nodo especificado para insertar antes del <input>, se adhiere al cuadro frontal
		Prompt.nodeBefore && Prompt.front.insertAdjacentHTML("beforeend", Prompt.nodeBefore);

		//Se adhiere el cuadro de ingreso de datos al cuadro frontal
		Prompt.front.appendChild(Prompt.input);

		//Se adhiere el contenedor de botones al cuadro frontal
		Prompt.front.appendChild(Prompt.container);		

		//Se adhiere el cuadro
		Prompt.back.appendChild(Prompt.front);

		//Animación para mostrar el contenido central
		Prompt.animateFront();

		//Se adhiere el fondo al documento
		document.body.appendChild(Prompt.back);

		//Se le da el enfoque al cuadro de ingreso de datos
		Prompt.input.focus();

		//Se cambia el valor del comodín que verifica la existencia de un cuadro sin resolver
		Prompt.state = false;

		//Configuración de eventos
		Prompt.events();
	},

	events: _ => {
		//Si se pulsa el botón de envío
		Prompt.send.addEventListener("click", Prompt.checkSend, false);

		//Si el cuadro de ingreso de datos está activo y se pulsa la tecla ENTER, se procesa el dato
		Prompt.input.addEventListener("keypress", e => e.which == 13 && Prompt.checkSend(), false);

		//Al girar el dispositivo, cambian las dimensiones del fondo
		window.addEventListener("orientationchange", Prompt.resize, false);
		window.addEventListener("resize", Prompt.resize, false);

		//Si se pulsa el botón para cancelar, se cierran el fondo oscuro y el cuadro frontal
		Prompt.cancel.addEventListener("click", Prompt.hide, false);

		//Se bloquea el scrolling mientras haya un cuadro de confirmación presente
		window.addEventListener("scroll", _ => {
			const prompts = document.querySelectorAll("[id^=promptBack]");

			if (prompts.length){
				prompts[prompts.length - 1].scrollIntoView();
			}
		}, false);
	},

	createBack: _ => {
		Prompt.back = document.createElement("div");
		Prompt.back.id = `promptBack-${new Date().getTime()}`;
		Prompt.back.classList.add("prompt");
		Prompt.back.style = `
			width: ${window.innerWidth}px;
			height: ${window.innerHeight}px;
			background-color: rgba(0, 0, 0, 0.6);
			top: 0;
			left: 0;
			margin: 0;
			position: fixed;
			display: flex;
			align-items: center;
			justify-content: center;
			transition: all ease .15s;
			z-index: 8888 !important;
		`;

		//Animación para mostrar el cuadro de ingreso de datos
		Prompt.back.animate([{
			opacity: 0
		}, {
			opacity: 1
		}], {
			duration: 400
		});
	},

	createFront: _ => {
		Prompt.front = document.createElement("div");
		Prompt.front.style = `
			width: ${Prompt.width()};
			background-color: ${Prompt.content?.front?.backgroundColor?.length ? Prompt.content.front.backgroundColor : "#FFFFEF"};
			box-shadow: 0 3px 10px rgb(0 0 0 / 0.2);
			border: ${Prompt.content?.front?.border?.length ? Prompt.content.front.border : 0};
			border-radius: ${Prompt.content?.front?.borderRadius?.length ? Prompt.content.front.borderRadius : "5px"};
			padding: 1% 2.5%;
			display: flex;
			align-items: center;
			text-align: center;
			flex-direction: column;
			transition: all ease .15s;
			z-index: 9999 !important;
		`;
	},

	animateFront: _ => {
		Prompt.front.animate([{
			transform: "scaleY(0)",
			opacity: 0
		}, {
			transform: "scaleY(1)",
			opacity: 1
		}], {
			duration: 400
		});
	},

	createMessage: _ => {
		Prompt.label = document.createElement("span");
		Prompt.label.style = `
			display: inline-block;
			margin-bottom: 1%;
			user-select: none;
			font-weight: bold;
			color: ${Prompt.content?.label?.color?.length ? Prompt.content.label.color : "#1a1a1a"};
		`;
		Prompt.label.textContent = Prompt.mensaje;
	},

	createBox: _ => {
		Prompt.input = document.createElement("input");
		Prompt.input.type = Prompt.type;
		Prompt.input.style = `
			display: inline-block;
			margin-bottom: 1%;
			background-color: transparent;
			outline: 0;
			border: 0;
			width: ${Prompt.content?.input?.width?.length ? Prompt.content.input.width : "90%"};
			border-bottom: ${Prompt.content?.input?.borderBottom?.length ? Prompt.content.input.borderBottom : ".1rem solid gray"};
			color: ${Prompt.content?.input?.color?.length ? Prompt.content.input.color : "#262626"}
		`;

		//Si se establecieron otras propiedades, se añaden al <input>
		if (Prompt.properties){
			for (let prop in Prompt.properties){
				Prompt.input[prop] = Prompt.properties[prop];
			}
		}
	},

	createContainer: _ => {
		Prompt.container = document.createElement("p");
		Prompt.container.style = `
			display: flex;
			align-items: center;
			justify-content: center;
			margin: 1px;
		`;

		//Se adhieren los botones al contenedor
		Prompt.container.append(Prompt.send, Prompt.cancel);
	},

	checkSend: _ => {
		let nodeValue = "", inputData;

		//Si el cuadro de ingreso de datos tiene uno o más caracteres
		if (Prompt.input.value.length){
			//Se ocultan el fondo y el cuadro frontal
			Prompt.hide();

			//Si se adhirió un nodo antes del <input>, se toma su valor y se concatena con el valor del <input>
			if (Prompt.nodeBefore && "value" in Prompt.input.previousElementSibling){
				nodeValue = Prompt.input.previousElementSibling.value;
				inputData = nodeValue + Prompt.input.value;
			}
			else{
				inputData = Prompt.input.value;
			}
				
			//Si se recibió una llamada de retorno, se le pasa el valor ingresado como argumento y se ejecuta
			if (Prompt.callback){
				Prompt.callback(inputData);
			}
			//Si no, se devuelve el valor ingresado
			else{
				return inputData;
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
			duration: 400,
			fill: "forwards"
		});

		//Se oculta el contenido central
		Prompt.front.animate([{
			transform: "scaleY(1)",
			opacity: 1
		}, {
			transform: "scaleY(0)",
			opacity: 0
		}], {
			duration: 400,
			fill: "forwards"
		});

		//Se vuelve a permitir la creación de un nuevo cuadro
		Prompt.state = true;

		//Luego de 200 milésimas de segundo, se eliminan el fondo y su contenido y el valor del comodín vuelve a true
		setTimeout(_ => {
			Prompt.back && Prompt.back.remove();			
		}, 200);
	},

	width: _ => window.matchMedia("(min-width: 850px)").matches ? "350px" : "250px",

	resize: _ => {
		Prompt.back.style.width = `${window.innerWidth}px`;
		Prompt.back.style.height = `${window.innerHeight}px`;
		Prompt.front.style.width = Prompt.width();
		Prompt.back.style.top = 0;
	},

	buttons: text => {
		const button = document.createElement("b");
		
		button.style = `
			background-color: #305165;
			color: #FFFFEF;
			font-weight: bold;
			cursor: pointer;
			user-select: none;
			display: inline-block;
			margin-right: 5px;
			padding: 7.5px 12.5px;
			border: .1rem solid #FFFFEF;
			border-radius: 5px;
		`;
		button.textContent = text;		

		button.addEventListener("mouseover", _ => button.style.backgroundColor = "#191919", false);
		button.addEventListener("mouseout", _ => button.style.backgroundColor = "#305165", false);		

		return button;
	}
};
