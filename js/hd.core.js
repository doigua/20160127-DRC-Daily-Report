(function($,undefined) {
	$.hd = $.hd||{}; //Create a self function library
	$.extend($.hd,{ 
		//Date Calculate Function
		//date: The standard date;
		//day: The differ day
		dateCal:function(date,days){
			var x = new Date(date);
			x = x.valueOf(); //Get the value;
			x = x + days * 24 * 60 * 60 * 1000;
			x = new Date(x);
			return x;
		},
		
		freshChild:function(){
			var tb = $("#tdtable");
			var t1 = tb.find("tr").length;
			var value = $("#record1");
			for ( var j=1; j<t1; j++ ){
				var tmp = value;
				tmp.find(".number").text(j); 
				value = value.next("tr");
			}
			
		},
		

		
		
		
	});
})(jQuery);