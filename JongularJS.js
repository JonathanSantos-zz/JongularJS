(function(global){
	'use strict';

	//manipulador de DOM
	var _$ = function(el){
		if(global.document){
			return global.document.querySelectorAll(el);
		}else{
			throw new Error('Document não está definido!');
		}
	};

	//Modulos do Jongular
	var modules = {};

	modules['init'] = function joInit(element){
		var attr = element.attribute;
		var elements = element.element;
		var $scope = element.$scope;

		try{
			attr = attr.replace(/\(\)/g, '');
			eval('$scope.' + attr);
		}catch(err){
			console.error(err.message);
		}

	};

	modules['model'] = function joModel(element){
		var attr = element.attribute;
		var elements = element.element;
		var $scope = element.$scope;

		if(elements.nodeName === 'INPUT'){

			if(elements.getAttribute('type') === 'text'){

				elements.value = $scope[attr];

				elements.addEventListener('keypress', function(){
					$scope[attr] = this.value;
				});

				elements.addEventListener('keyup', function(){
					$scope[attr] = this.value;
				});

				elements.addEventListener('keydown', function(){
					$scope[attr] = this.value;
				});
			}

		}else{
			if(attr.indexOf('.') > 0){
				try{
					attr = attr.replace(/\(\)/g, '')
					var t = eval('$scope.' + attr);
					if(t != undefined){
						elements.innerText = t;
					}
				}catch(err){console.error(err.message);}
			}else{
				if(!($scope[attr] === undefined)){
					elements.innerText = $scope[attr];
				}else{
					elements.innerText = '';
				}
			}
		}
		
	};

	modules['click'] = function joClick(element){
		var attr = element.attribute;
		var elements = element.element;
		var $scope = element.$scope;
		
		try{
			elements.addEventListener('click', eval('$scope.' + attr));
		}catch(err){console.error(err.message);}
	};

	//Funções implementadas no jongular
	var $http = {
	  get : function(url, obj){
	    var xmlhttp;

	    if (window.XMLHttpRequest){
	      xmlhttp = new XMLHttpRequest();
	    }else{
	      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	    }

	    xmlhttp.onreadystatechange = function(){

	      if(obj.onSucess){
	        obj['onSucess'](xmlhttp);
	      }

	    }

	    xmlhttp.open("GET", url);
	    xmlhttp.send();
	  },

	  post : function(url, obj){
	  	 var xmlhttp;

	    if (window.XMLHttpRequest){
	      xmlhttp = new XMLHttpRequest();
	    }else{
	      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	    }

	    xmlhttp.onreadystatechange = function(){

	      if(obj.onSucess){
	        obj['onSucess'](xmlhttp);
	      }

	    }

	    xmlhttp.open("POST", url);
	    xmlhttp.send();
	  }
	};

	//Parametros mapeados
	var parameters = {};
	parameters['$scope'] = 'this.groups[name].$scope';
	parameters['$rootScope'] = 'this.$rootScope';
	parameters['$http'] = '$http';

	var __refresh__ = function(name, nameNode, val){

		var el = global.document.querySelectorAll('*[jo-controller="' + name + '"]');
		for(var j = 0; j < el.length; j++){
			var els = el[j].querySelectorAll('*[jo-model="' + nameNode + '"]');
			for(var i = 0; i < els.length; i++){

				if(els[i].nodeName === 'INPUT'){
					//els[i].value = val;
				}else{
					els[i].innerText = val;
				}
				
			}
		}

	};

	var __refreshAll__ = function(el){

		var app = global.document.querySelector('*[jo-app="' + el.name + '"]');
		for(var x in el.groups){

			var group = el.groups[x];
			var controllers = app.querySelectorAll('*[jo-controller="' + group.name + '"]');
			
			for(var y in modules){
				var module = {name : y, fn : modules[y]};

				var temporario = [];
				for(var i = 0; i < controllers.length; i++){
					var elementos = controllers[i].querySelectorAll('*[jo-' + module.name + ']');
					var nameController = controllers[i].getAttribute('jo-controller');
					for(var j = 0; j < elementos.length; j++){
						temporario.push({controller : nameController, el : elementos[j]});
					}
				}

				for(var i = 0; i < temporario.length; i++){
					var element = temporario[i].el;

					var attr = element.getAttribute('jo-' + module.name);
					var obj = {
						attribute : attr,
						element : element, 
						name : module.name, 
						controller : temporario[i].controller,
						$scope : el.groups[temporario[i].controller].$scope
					};

					module.fn.bind(el.groups[temporario[i].controller], obj)();
				}

			}

		}

	};

	//Definicao do Jongular começa aqui
	var Jongular = function(name){
		this.groups = {};
		this.services = {};
		this.$rootScope = {};
		this.name = name;
	};

	Jongular.fn = Jongular.prototype = {

		controller : function(name, fn){
			var attr = fn.toString().replace(/\n/g, '').replace(/ /g,'').replace(/function.*?\((.*?)\).*/, '$1').split(',');

			this.groups[name] = {
				name : name,
				fn : fn,
				attr : attr,
				$scope : {}
			};

			var temp = [];

			if(attr.indexOf('$scope') == 0 && attr.length === 1){
					this.groups[name].fn(eval(parameters['$scope']));
			}else{
				for(var i = 0; i < attr.length; i++){
					var check = 0;

					for(var x in parameters){
						if(x === attr[i]){
							temp.push(eval(parameters[x]));
							check = 1;
						}
					}

					if(check != 0){
						continue;
					}

					for(var x in this.services){
						if(attr[i] == x){
							temp.push(this.services[x].fn);
							check = 1;
						}
					}

					if(check != 0){
						temp.push(undefined);
					}
					
				}
				this.groups[name].fn.apply(this.groups[name], temp);
			}

			Object.observe(this.groups[name].$scope, function(a){
				__refresh__(name, a[0].name, a[0].object[a[0].name]);
			});

		},

		service : function(name, fn){
			var attr = fn.toString().replace(/\n/g, '').replace(/ /g,'').replace(/function.*?\((.*?)\).*/, '$1').split(',');

			this.services[name] = {
				name : name,
				fn : fn,
				attr : attr
			};
		},

	};

	var jongular = {

		module : function(name){
			name = name || 'undefined';
			var jong = new Jongular(name);
			this.app.push(jong);
			return jong;
		},

		app : []

	};

	global.document.addEventListener('DOMContentLoaded', function(e){

		if(jongular.app.length > 0){
			for(var i = 0; i < jongular.app.length; i++){
				var el = jongular.app[i];
				__refreshAll__(el);
			}
		}

	});


	global.jongular = jongular;

}(this));
