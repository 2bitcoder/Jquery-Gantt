var app = app || {};

app.util = (function(){

	// var dateRegrex=/^(\d{1,2})\/(\d{1,2})\/(\d{4})/;
	var monthsCode=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	return {
		correctdate: function(str) {
			// var matches,datestr='';
			// matches=str.match(dateRegrex);
			// if(matches.length<4) throw 'Unknown date format';
			// for(i=1;i<3;i++){
			// 	datestr = datestr + ((matches[i].length<2)?'0'+matches[i]:matches[i]);
			// 	datestr += '/';
			// }
			// datestr += matches[3];
			return str;
		},
		formatdata: function(val, type) {
			if(type==='m'){
				return monthsCode[val];
			}
			return val;
		},
		hfunc:function(pos){
			return {
				x:pos.x,
				y: this.getAbsolutePosition().y
			};
		}
	};
}());
