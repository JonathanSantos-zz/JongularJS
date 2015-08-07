(function(global){

	var __refresh__ = function(name, nameNode, val){

		var el = global.document.querySelectorAll('*[jo-controller="' + name + '"]');

		for(var j = 0; j < el.length; j++){

			var els = el[j].querySelectorAll('*[jo-model="' + nameNode + '"]');

			for(var i = 0; i < els.length; i++){
				els[i].innerText = val;
			}
		}

	};

	var __refreshAll__ = function(el){

		var app = global.document.querySelector('*[jo-app="' + el.name + '"]');

		for(x in el.groups){

			var group = el.groups[x];
			var controllers = app.querySelectorAll('*[jo-controller="' + group.name + '"]');
			var models = [];

			for(var i = 0; i < controllers.length; i++){
				models = models.concat(controllers[i].querySelectorAll('*[jo-model]'));
			}
			
			for(var i = 0; i < models.length; i++){

				var element = models[i];

				for(var j = 0; j < element.length; j++){
					var attr = element[j].getAttribute('jo-model');
					element[j].innerText = group.$scope[attr] || '';
				}
				
			}

		}

	};

	//Definicao do Jongular começa aqui
	var Jongular = function(name){
		this.groups = {};
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

			if(attr.indexOf('$scope') == 0){
				this.groups[name].fn(this.groups[name].$scope);
			}

			Object.observe(this.groups[name].$scope, function(a){
				global._t = a;
				__refresh__(name, a[0].name, a[0].object[a[0].name]);
			});

		}

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
