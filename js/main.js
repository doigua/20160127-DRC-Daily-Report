

/* Get the current date */
var mydate = new Date();

/* This is for js test */
console.log('Hello, world!' + mydate.toDateString());



/* When the browser explorer get ready */
/* Write the date */
var date1 = mydate.format('yyyy-MM-dd');
var date2 = $.hd.dateCal(mydate, -1).format('yyyy-MM-dd');
var date3 = $.hd.dateCal(mydate, -2).format('yyyy-MM-dd');
var date4 = $.hd.dateCal(mydate, -3).format('yyyy-MM-dd');
$(document).ready(function(){
	$('#datebox-0').append("" + date1 + "");
	$('#datebox-1').append("" + date2 + "");	
	$('#datebox-2').append("" + date3 + "");	
	$('#datebox-3').append("" + date4 + "");
	var name = $.vcapp.ss.getJson("name");	
	$("#username").text("Hola,"+name);
	
	//模拟点击事件
	$("#datebox-0").trigger("click");
	
	initDateInput("#dateInput");
});

$("body").on("click", "#datebox-5", function(e){
	mydate = $.hd.dateCal(mydate, -1);
	date1 = mydate.format('yyyy-MM-dd');
	date2 = $.hd.dateCal(mydate, -1).format('yyyy-MM-dd');
	date3 = $.hd.dateCal(mydate, -2).format('yyyy-MM-dd');
	date4 = $.hd.dateCal(mydate, -3).format('yyyy-MM-dd');
	$('#datebox-0').replaceWith("<a id='datebox-0' class='datebox_cur'>" + date1 + "</a>");
	$('#datebox-1').replaceWith("<a id='datebox-1' class='datebox'>" + date2 + "</a>");	
	$('#datebox-2').replaceWith("<a id='datebox-2' class='datebox'>" + date3 + "</a>");
	$('#datebox-3').replaceWith("<a id='datebox-3' class='datebox'>" + date4 + "</a>");
});

$("body").on("click", "#datebox-6", function(e){
	mydate = $.hd.dateCal(mydate, +1);
	date1 = mydate.format('yyyy-MM-dd');
	date2 = $.hd.dateCal(mydate, -1).format('yyyy-MM-dd');
	date3 = $.hd.dateCal(mydate, -2).format('yyyy-MM-dd');
	date4 = $.hd.dateCal(mydate, -3).format('yyyy-MM-dd');
	$('#datebox-0').replaceWith("<a id='datebox-0' class='datebox_cur'>" + date1 + "</a>");
	$('#datebox-1').replaceWith("<a id='datebox-1' class='datebox'>" + date2 + "</a>");	
	$('#datebox-2').replaceWith("<a id='datebox-2' class='datebox'>" + date3 + "</a>");
	$('#datebox-3').replaceWith("<a id='datebox-3' class='datebox'>" + date4 + "</a>");
});


function initDateInput(scroll){
	var day = new Date();
	var minDate = $.vcapp.AddDays(day,-14);
	var yesterday = $.vcapp.AddDays(day,-1);
	var maxDate = day;
	
	$(scroll).mobiscroll().calendar({
		theme:"ios",
		display:"modal",
		lang:"zh",
		mode:"scroller",
		maxDate:maxDate,
		minDate:minDate,
		dateFormat:"yyyy-mm-dd",
		//multiSelect:true,
		showLabel:true,
		//rows:3,
		defaultValue:yesterday
		//selectedValues:[yesterday]
	});
	
	if($(scroll).val()=="")
		$(scroll).val(yesterday.format("yyyy-MM-dd"));
	
};





$(document).on("click","#fill",function(){
	var _this = $("#dateInput");
	var obj = {};
	obj.date = _this.val();
	obj.name = $.vcapp.ss.getJson("name");	
	var dataJson = JSON.stringify(obj);
	$.vcapp.queryAjax("log!search.do",dataJson,function(data){
		if(data.respCode=="0"){
			$("#tbody").empty();
			var log = data.jSONObject;
			var logId = log.id;
			$("#tbody").attr("data-logid", logId);
			var items = log.items;
			$.each(items,function(n,obj){
				var html = ['<tr id="record1" class="record">',
				            '<td class="column0"><p class="number">',
				            n+1,'</p></td><td class="column1"><textarea class="event" name="event">'
				            ,obj.content,'</textarea></td>'].join("");
				html = [html,'<td class="column2"><input class="schedule" type="text" name="schedule" value="',obj.status,'"></input></td>'].join("");
				html = [html,'<td class="column3"><select class="important" name="important" value="',obj.level,
				        '"><option class="record-op1" ',obj.level=="重要"?'selected="selected"':'',' value="重要">重要</option>',
				        '<option class="record-op2" ',obj.level=="一般"?'selected="selected"':'',' value="一般">一般</option></select></td>'].join("");
				html = [html,'<td class="column4"><textarea class="remark" name="remark">'
				        ,obj.remark,'</textarea></td>',
				        '<td class="column5"><a class="remove" href="#">×</a></td></tr>'].join("");
				$("#tbody").append(html);
			});
		}else{
			alert(data.respMsg);
		}
		
		
		
	});
	
	return false;
});



/* This is for ADD and DELETE record */
var tblength = $("#tdtable").find("tr").length; 
var count = tblength - 1; //Original record account
var MaxRecord = 20; //Max record allowed
var AddRecord = $("#record"); //Input boxes wrapper Class
var AddButton = $("#add-record"); //Add button Class



/* var x = Addrecord.length; */  //Initial record count


/* When the REMOVE button clicked, delete current record */
$("body").on("click", ".remove", function(e){
	tblength = $("#tdtable").find("tr").length; 
	count = tblength - 1; 
	if(count > 1){
		$(this).parents('tr').remove();
		count--;
		$.hd.freshChild();
	}
	else{
		alert('The last one');
	}
	return false;
});

/* When the ADD button clicked, add a new record */
$("body").on("click", ".add-record", function(e){
	tblength = $("#tdtable").find("tr").length; 
	count = tblength - 1; 
	if(count < MaxRecord){		
		var table = $("#tdtable");
		var tr = table.children("tbody").children("#record1");
		var tmp = tr[0.].outerHTML;
		table.append(tmp);
		count++;  
		$.hd.freshChild(); 
	}
	else{
		alert('Max');
	}
	return false;
});

/*
$("body").on("click", ".important", function(e)){
	if(this.children() == .record-op1 )
}
*/



/*Navigetion Part When Click*/
$("body").on("click", "#navli_0", function(e){
	$("#navli_0").attr("class", "navli_cur");
	$("#navli_0").children("a").attr("class", "navlia_cur");
	$("#navli_1").attr("class", "navli");
	$("#navli_1").children("a").attr("class", "navlia");
	$("#navli_2").attr("class", "navli");
	$("#navli_2").children("a").attr("class", "navlia");
});

$("body").on("click", "#navli_1", function(e){
	$("#navli_1").attr("class", "navli_cur");
	$("#navli_1").children("a").attr("class", "navlia_cur");
	$("#navli_0").attr("class", "navli");
	$("#navli_0").children("a").attr("class", "navlia");
	$("#navli_2").attr("class", "navli");
	$("#navli_2").children("a").attr("class", "navlia");
});

$("body").on("click", "#navli_2", function(e){
	$("#navli_2").attr("class", "navli_cur");
	$("#navli_2").children("a").attr("class", "navlia_cur");
	$("#navli_0").attr("class", "navli");
	$("#navli_0").children("a").attr("class", "navlia");
	$("#navli_1").attr("class", "navli");
	$("#navli_1").children("a").attr("class", "navlia");
/*	alert("你没有权限访问改区域！"); */
});


/*Date Part When Click*/
$("body").on("click", "#datebox-0", function(e){
	$("#datebox-0").attr("class", "datebox_cur");
	$("#datebox-1").attr("class", "datebox");
	$("#datebox-2").attr("class", "datebox");
	$("#datebox-3").attr("class", "datebox");
});

$("body").on("click", "#datebox-1", function(e){
	$("#datebox-0").attr("class", "datebox");
	$("#datebox-1").attr("class", "datebox_cur");
	$("#datebox-2").attr("class", "datebox");
	$("#datebox-3").attr("class", "datebox");
});

$("body").on("click", "#datebox-2", function(e){
	$("#datebox-0").attr("class", "datebox");
	$("#datebox-1").attr("class", "datebox");
	$("#datebox-2").attr("class", "datebox_cur");
	$("#datebox-3").attr("class", "datebox");
});

$("body").on("click", "#datebox-3", function(e){
	$("#datebox-0").attr("class", "datebox");
	$("#datebox-1").attr("class", "datebox");
	$("#datebox-2").attr("class", "datebox");
	$("#datebox-3").attr("class", "datebox_cur");
});


/* Important Part When Click*/
$("body").on("click", ".important", function(e){
	if(this.value == "重要"){
		$(this).css("color", "#ff6060");
	}
	else{
		$(this).css("color", "#4ae539");	
	}
});



/* Submit Part When Click */
$("body").on("click", "#submitTB", function(e){
	var obj = {};
	obj.date = $("#datebox_cur").attr("data-date");
	
	var items = [];
	var index = 0;
	$("#tbody").children().each(function(i,obj){
		var tbRecord = {};
		tbRecord.content = $(obj).find(".event").val();
		tbRecord.status = $(obj).find(".schedule").val();
		tbRecord.level = $(obj).find(".important").val();
		tbRecord.remark = $(obj).find(".remark").val();
		if(tbRecord.content==""&&tbRecord.status==""&&tbRecord.remark==""){
			console.log("empty content");
		}else{
			items[index++] = tbRecord;
		}
	});
	
	obj.items = items;
	var dataJson = JSON.stringify(obj);
	console.log(dataJson);
	
	$.ajax({
		url : "log!add.do",
		data : dataJson,
		type : 'post',
		dataType : 'json',
		contentType : 'application/json;charset=utf-8',
		cache : false,
		success : function(data){
			if(data.respCode = '0'){
				
			}
			
			alert(data.respMsg);
		},
		error : function(xhr,b) {
			$.vcapp.log(xhr.responseText);
			if(b == "error")
				$.vcapp.alert("系统升级中，请稍候再试");
			else if(b == "timeout")
				$.vcapp.alert("网络超时");
			else
				$.vcapp.alert("您的网络异常,请稍后再试");
		}
	});
});


$(document).on("click",".datebox_tod",function() { 
	var _this = $(this);
	var obj = {};
	obj.date = _this.attr("data-date");
	obj.name = $.vcapp.ss.getJson("name");	
	var dataJson = JSON.stringify(obj);
	$.vcapp.queryAjax("log!search.do",dataJson,function(data){
		if(data.respCode=="0"){
			$("#tbody").empty();
			var log = data.jSONObject;
			var logId = log.id;
			$("#tbody").attr("data-logid", logId);
			var items = log.items;
			$.each(items,function(n,obj){
				var html = ['<tr id="record1" class="record">',
				            '<td class="column0"><p class="number">',
				            n+1,'</p></td><td class="column1"><textarea class="event" name="event">'
				            ,obj.content,'</textarea></td>'].join("");
				html = [html,'<td class="column2"><input class="schedule" type="text" name="schedule" value="',obj.status,'"></input></td>'].join("");
				html = [html,'<td class="column3"><select class="important" name="important" value="',obj.level,
				        '"><option class="record-op1" ',obj.level=="重要"?'selected="selected"':'',' value="重要">重要</option>',
				        '<option class="record-op2" ',obj.level=="一般"?'selected="selected"':'',' value="一般">一般</option></select></td>'].join("");
				html = [html,'<td class="column4"><textarea class="remark" name="remark">'
				        ,obj.remark,'</textarea></td>',
				        '<td class="column5"><a class="remove" href="#">×</a></td></tr>'].join("");
				$("#tbody").append(html);
			});
		}
		
		
		
	});
	
	return false;
}); 
$(document).on("touchstart",".datebox_tod",function() { 
	$(".datebox_tod").trigger("click");
});
$(document).on("touchstart",".datebox_yes",function() { 
	$(".datebox_yes").trigger("click");
});

$(document).on("click",".datebox_yes",function() { 
	var _this = $(this);
	var obj = {};
	obj.date = _this.attr("data-date");
	obj.name = $.vcapp.ss.getJson("name");	
	var dataJson = JSON.stringify(obj);
	$.vcapp.queryAjax("log!search.do",dataJson,function(data){
		if(data.respCode=="0"){
			$("#tbody").empty();
			var log = data.jSONObject;
			var logId = log.id;
			$("#tbody").attr("data-logid", logId);
			var items = log.items;
			$.each(items,function(n,obj){
				var html = ['<tr id="record1" class="record">',
				            '<td class="column0"><p class="number">',
				            n+1,'</p></td><td class="column1"><textarea class="event" name="event">'
				            ,obj.content,'</textarea></td>'].join("");
				html = [html,'<td class="column2"><input class="schedule" type="text" name="schedule" value="',obj.status,'"></input></td>'].join("");
				html = [html,'<td class="column3"><select class="important" name="important" value="',obj.level,
				        '"><option class="record-op1" ',obj.level=="重要"?'selected="selected"':'',' value="重要">重要</option>',
				        '<option class="record-op2" ',obj.level=="一般"?'selected="selected"':'',' value="一般">一般</option></select></td>'].join("");
				html = [html,'<td class="column4"><textarea class="remark" name="remark">'
				        ,obj.remark,'</textarea></td>',
				        '<td class="column5"><a class="remove" href="#">×</a></td></tr>'].join("");
				$("#tbody").append(html);
			});
		}
		
		
		
	});
	
	return false;
}); 


