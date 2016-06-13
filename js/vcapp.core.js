var debug = true;
var alertFlag = false;
var devMode = false;
var REQ_PARM ="REQ_PARM";
(function($, undefined) {
	$.vcapp = $.vcapp || {};
	$.vcapp.Map = $.vcapp.Map || function(options) {
		$.vcapp.log("new a map object");
		$.extend($.vcapp.Map.prototype, options);
		var myIcon = new BMap.Icon("image/my_point.png", new BMap.Size(18, 18),{
			imageSize:new BMap.Size(18, 18)
		});
		var taskIcon =new BMap.Icon("image/task_location.png", new BMap.Size(20, 28),{
			imageSize:new BMap.Size(20, 28),
		});
		$.extend($.vcapp.Map.prototype, {myIcon:myIcon  ,taskIcon:taskIcon});
	};
	$.extend($.vcapp.Map.prototype, {
		map : null,
		myMarker : null,
		zoom : 16,
		useGeo : true,
		tryGeo : 3,
		tryAge : 3000,
		defaultPos : "中山",
		headerId : "#header",
		contentId : "#content",
		footerId : "#footer",
		myIcon:null,
		taskIcon:null,
		myTaskbox:null,
		lastInfobox:null,
		fixFlag:0,
		init : function(containerId,point) {
			$.vcapp.showLoader("地图努力加载中，请稍后...");
			$.vcapp.fixgeometry(this.headerId, this.contentId, this.footerId,this.fixFlag);
			var pos = point || $.vcapp.myPos || this.defaultPos
			var container = $(containerId || this.contentId);
			
			$.vcapp.log("init a map-->" + container.attr('id') + ",pos-->" + pos
					+ ",zoom-->" + this.zoom);
			this.map = new BMap.Map(container.attr('id'),{enableMapClick:false,enableHighResolution:true,enableAutoResize:true,delay:1000});
			if(pos!=this.defaultPos)
				this.myMarker = this.addMarker(pos,this.myIcon);
			var top_right_navigation = new BMap.NavigationControl({anchor: BMAP_ANCHOR_TOP_RIGHT, type: BMAP_NAVIGATION_CONTROL_SMALL});
			var bottom_right_navigation = new BMap.NavigationControl({anchor: BMAP_ANCHOR_BOTTOM_RIGHT, type: BMAP_NAVIGATION_CONTROL_SMALL});
			if(this.fixFlag==0)
				this.map.addControl(top_right_navigation);
			else{
				this.map.disablePinchToZoom();
				this.map.addControl(bottom_right_navigation);
			}
				
//			this.geolocationController();
//			this.map.centerAndZoom(pos, this.zoom);
			this.map.addEventListener("tilesloaded",function(){
				$.vcapp.hideLoader();
			});
			var _this = this;
			setTimeout(function(){
				_this.map.centerAndZoom(pos, _this.zoom);
//				$.vcapp.hidePageloading();
			}, 100)
			$.vcapp.setMyAddress(pos);
			
			//禁用双击、双指放大缩小
			this.map.disableDoubleClickZoom();
			//this.map.disablePinchToZoom();
			
			return $.vcapp.deferred_resolve();
		},
		addMarker:function(point, icon) {
			var marker;
			if (icon) {
				marker = new BMap.Marker(point, {
					icon : icon
				});
			} else {
				marker = new BMap.Marker(point);
			}

			this.map.addOverlay(marker);
			return marker;
		},
		showMe:function(){
			if(this.myMarker){
				$.vcapp.log("remove mypos marker.");
				this.map.removeOverlay(this.myMarker);
			}else{
				this.map.centerAndZoom($.vcapp.myPos, this.zoom);
			}
				
			if($.vcapp.myPos){
				$.vcapp.log("add mypos marker.");
				this.myMarker = this.addMarker($.vcapp.myPos,this.myIcon);
				
			}
		},
		rmAllMarker:function(){
			$.vcapp.log("rm all marker");
			this.map.clearOverlays();
			this.showMe();
		},
		tapMap:function (callback) {
			this.map.addEventListener("click",function(e){
				if($.vcapp.MAP_CLICK_FLAG)
					callback(e);
			});
		},
		geolocationController:function(){
			// 添加定位控件
			  var geolocationControl = new BMap.GeolocationControl();
			  geolocationControl.addEventListener("locationSuccess", function(e){
			    // 定位成功事件
			    var address = '';
			    address += e.addressComponent.province;
			    address += e.addressComponent.city;
			    address += e.addressComponent.district;
			    address += e.addressComponent.street;
			    address += e.addressComponent.streetNumber;
			    $.vcapp.alert("当前定位地址为：" + address);
			  });
			  geolocationControl.addEventListener("locationError",function(e){
			    // 定位失败事件
				  $.vcapp.alert(e.message);
			  });
			  this.map.addControl(geolocationControl);
		},
		infobox:function(title, content, callback,style) {
			style=style||0;
			var width = ["215px","120px"]
			var style0 = [
					"<div class='taskbox'><div class='top'></div>",
					"<div class='middle'><div class='content'><font>" + title
							+ "</font><label>\></label><div class='main'>", content
							, "</div></div></div>",
					"<div class='bottom'></div>", "</div>" ].join("");
			var style1 = [
					"<div class='taskbox1'><div class='top'></div>",
					"<div class='middle'><div class='content'>"+
					"<div class='main'>", content, "</div></div></div>",
					"<div class='bottom'></div>", "</div>" ].join("");
			var html = new Array(style0,style1);
			var infobox = new BMapLib.InfoBox(this.map, html[style], {
				boxStyle : {
					width : width[style]
				},
				enableAutoPan : true,
				align : INFOBOX_AT_TOP,
				callback:callback
			});
			return infobox;
		},
		openBox:function(box, mk) {
			if (box) {
				if (this.lastInfobox)
					this.lastInfobox.close();
				this.lastInfobox = box;
				if (mk)
					box.open(mk);
				else
					box.open();
			}
		},
		distance:function(pointA,pointB){
			return (this.map.getDistance(pointA,pointB)).toFixed(2);
		}
	});
	
	
	// $.vcapp下的静态方法
	$
			.extend(
					$.vcapp,
					{	MAP_CLICK_FLAG:true,
						myPos : null,
						myAddr:null,
						watchGeoID : null,
						geolocationTimes : 0,
						geolocationMaxTimes : 300,
						log:function(str){
							if(debug)
								console.log(str);
							if(alertFlag)
								alert(str);
						},
						alert:function(str,alertDismissed){
							if(devMode){
								navigator.notification.alert(str, alertDismissed, // callback
										"提示", "确定");
							}
							else
								alert(str);
						},
						confirm:function(opts,callback){
							navigator.notification.confirm(
									opts.message,  // message
				                    function(buttonIndex){
				                        callback(buttonIndex);
				                    },              // callback to invoke with index of button pressed
				                    opts.title||'提示',            // title
				                    opts.buttonLabels||['确定','取消'] // buttonLabels
				                );
						},
					
						getCurrentGeolocation : function(success, error) {
							$.vcapp.showLoader("正在获取您的位置，请稍后...");
							_this = this;
							var options = {
								enableHighAccuracy : true,
								timeout : 5000,
								maximumAge : 2000
							};
							
							var _success = function(position) {
								$.vcapp.log("get current location success");
								var lat = position.coords.latitude;
								var lng = position.coords.longitude;
								$.vcapp.translatePoint(new BMap.Point(lng, lat), 0,success);
							};
							//安卓使用百度定位
							if(devMode&&myDevice=="Android"){
								//通过百度sdk来获取经纬度,并且alert出经纬度信息
						        var noop = function(){}
						        window.locationService.getCurrentPosition(function(position){
						        	$.vcapp.log(JSON.stringify(position))
						        	var lat = position.coords.latitude;
						        	var lng = position.coords.longitude;
						            var pt = new BMap.Point(lng, lat);
						            success(pt);
						            window.locationService.stop(noop,noop);
						        },function(e){
						            $.vcapp.log(JSON.stringify(e))
						            error(e);
						            window.locationService.stop(noop,noop);
						        });
							}else{//html5定位
								navigator.geolocation.getCurrentPosition(_success,
										error, options);
							}
						},
						startGeolocation : function(onGeoSuccess, onGeoError) {
							_this = this;
							$.vcapp.log("start geolocation..");
							var options = {
								enableHighAccuracy : true,
								timeout : 5000,
								maximumAge : 2000
							};

							var error = onGeoError
									|| function(error) {
										$.vcapp.log("geolocation error");
										$.vcapp.log(error.code + "-->"
												+ error.message);
//										$.vcapp.stopGeolocation();
									};
							var success = onGeoSuccess
									|| function(position) {
										$.vcapp.log("get location success");
										var lat = position.coords.latitude;
										var lng = position.coords.longitude;
										$.vcapp.translatePoint(new BMap.Point(
												lng, lat), 0, function(point) {
											$.vcapp.ls.setJson(LS_LOC,point);
											$.vcapp.myPos = point;
											$.vcapp.setMyAddress(point);
										});
									}
							$.vcapp.log("geolocation times:" + (++$.vcapp.geolocationTimes));
						
							//安卓使用百度定位
							if(devMode&&myDevice=="Android"){
								//通过百度sdk来获取经纬度,并且alert出经纬度信息
						        window.locationService.watchPosition(5000,function(position){
						        	$.vcapp.log("百度后台定位成功!")
						        	$.vcapp.log(JSON.stringify(position))
						        	var lat = position.coords.latitude;
						        	var lng = position.coords.longitude;
						            var point = new BMap.Point(lng, lat);
						            $.vcapp.ls.setJson(LS_LOC,point);
									$.vcapp.myPos = point;
									$.vcapp.setMyAddress(point);
						        },error);
							}else{//html5定位
								$.vcapp.watchGeoID = navigator.geolocation.watchPosition(success, error, options);
							}
						},

						stopGeolocation : function() {
							$.vcapp.log("try stop geolocation");
							if (this.geolocationTimes >= this.geolocationMaxTimes) {
								$.vcapp.log("over maxtimes："
										+ this.geolocationMaxTimes
										+ ",stopGeolocation")
								if ($.vcapp.watchGeoID) {
									navigator.geolocation
											.clearWatch($.vcapp.watchGeoID);
									$.vcapp.watchGeoID = null;
									$.vcapp.deferred_reject();
								}
							} else {
								$.vcapp.log("continue geolocation");
								$.vcapp.startGeolocation();
							}
						},
						setMyAddress:function (point){
								var gc = new BMap.Geocoder();
								var pt = point||$.vcapp.myPos;
								if(pt)
									gc.getLocation(pt, function(rs) {
										var addComp = rs.addressComponents;
										$.vcapp.myAddr = addComp;
									});
						},

						translatePoint : function(point, type, callback) {
							$.vcapp.translatePoint.convertor = $.vcapp.translatePoint.convertor
									|| {};
							$.vcapp.log("translatePoint" + times++);
							var callbackName = 'cbk_'
									+ Math.round(Math.random() * 10000); // 随机函数名
							var xyUrl = "http://api.map.baidu.com/ag/coord/convert?from="
									+ type
									+ "&to=4&x="
									+ point.lng
									+ "&y="
									+ point.lat
									+ "&callback=$.vcapp.translatePoint.convertor."
									+ callbackName;
							// 动态创建script标签
							$.vcapp.load_script(xyUrl);

							$.vcapp.translatePoint.convertor[callbackName] = function(
									xyResult) {
								delete $.vcapp.translatePoint.convertor[callbackName]; // 调用完需要删除改函数
								var point = new BMap.Point(xyResult.x, xyResult.y);
								callback && callback(point);
							}
						},

						load_script : function(xyUrl, callback) {
							var head = document.getElementsByTagName('head')[0];
							var script = document.createElement('script');
							script.type = 'text/javascript';
							script.src = xyUrl;
							// 借鉴了jQuery的script跨域方法
							script.onload = script.onreadystatechange = function() {
								if ((!this.readyState
										|| this.readyState === "loaded" || this.readyState === "complete")) {
									callback && callback();
									// Handle memory leak in IE
									script.onload = script.onreadystatechange = null;
									if (head && script.parentNode) {
										head.removeChild(script);
									}
								}
							};
							// Use insertBefore instead of appendChild to
							// circumvent an IE6 bug.
							head.insertBefore(script, head.firstChild);
						},
						fixgeometry : function(h, c, f,fixFlag) {
							$.vcapp.log("fixgeometry id-->" + h + " " + c + " "
									+ f);
							var header = $(h).outerHeight()||0;
							var footer = $(f).outerHeight()||0;
							var content = $(c);
							var viewport_height = $(window).height();
							$.vcapp.log("header:"+header+"footer:"+footer);
							
							content.css({
								bottom: footer+"px",
    							top: header+"px",
    							position: "absolute",
    							width: "100%",
    							overflow: "scroll",
    							"box-sizing": "border-box"
							});
							if(fixFlag==1){
								var content_height = viewport_height - header - footer;
								content_height -= (content.outerHeight() - content.height());
								content.height(content_height);
							}
						},
						sleep : function(numberMillis) {
							var now = new Date();
							var exitTime = now.getTime() + numberMillis;
							while (true) {
								now = new Date();
								if (now.getTime() > exitTime)
									return;
							}
						},
						deferred_resolve:function(){
							var dtd = new $.Deferred();
							$.vcapp.log("====dtd resolve===");
							dtd.resolve();
							return dtd;
						},
						deferred_reject:function(){
							var dtd = new $.Deferred();
							$.vcapp.log("====dtd reject===");
							dtd.reject();
							return dtd;
						},
						convertToJson:function (formArray) {
							var result = {};
							var serializeObj = {};
//							debugger;
							$(formArray).each(
									function() {
//										debugger;
										if (this.name.indexOf('.') < 0) {//非对象，string or string array
											if (serializeObj[this.name]) {//先判断是否存在这个对象，存在
												if ($.isArray(serializeObj[this.name])) {//判断是否为数组
													serializeObj[this.name].push(this.value);
												} else {//非数组，初始化数组
													serializeObj[this.name] = [serializeObj[this.name], this.value ];
												}
											} else {//不存在这个对象，先初始化
												serializeObj[this.name] = this.value;
											}
										} else {//对象
											// debugger;
											var simpleNames = this.name.split('.');
											var parent = simpleNames[0];
											var child = simpleNames[1];

											if (parent.indexOf('[]') < 0) {//判断是否为数组对象，非数组对象
												if (!serializeObj[parent])//初始化普通对象
													serializeObj[parent] = {};
												if ((serializeObj[parent])[child]) {//先判断这个对象是否存在，已存在

													if ($.isArray((serializeObj[parent])[child])) {
														(serializeObj[parent])[child].push(this.value);
													} else {
														(serializeObj[parent])[child] = [
																(serializeObj[parent])[child],
																this.value ];
													}

												} else {//不存在，先初始化
													(serializeObj[parent])[child] = this.value;
												}
											} else {//数组对象
												simpleNames = parent.split('[]');//bankCards[]1.cardNo
												parent = simpleNames[0];//bankCards
												index = simpleNames[1];//1
												if (serializeObj[parent]) {//判断父亲是否存在，已存在
													
														if (!index) {
															obj = {};
															obj[child] = this.value;
															(serializeObj[parent]).push(obj);
														} else {
															var iObj = (serializeObj[parent])[index];
															if(iObj)
																iObj[child] = this.value;
															else{
																iObj = {};
																iObj[child] = this.value;
																serializeObj[parent].push(iObj);
															}
														}

												} else {//不存在，初始化数组
													obj = {};
													obj[child] = this.value;
													serializeObj[parent] = {};
													(serializeObj[parent]) = [ obj ];
												}
											}

										}
									});
							var keys = Object.keys(serializeObj);
							
//							for(var i=0;i<keys.length;i++){
//								var key = keys[i];
//								if(key.toLocaleLowerCase().indexOf("password")>-1){
//									$.vcapp.log("转换pwd:"+key);
//									serializeObj[key] = $.vcapp.encrypt(serializeObj[key]);
//								}
//							}
							
							$.vcapp.log("表单转换后的json:" + JSON.stringify(serializeObj));
							return JSON.stringify(serializeObj);
						},
						showLoader:function(text) {
							$.mobile.activePage.append("<div class='bg'></div>");
							// 显示加载器.for jQuery Mobile 1.2.0
							$.mobile.loading('show', {
								text : text||"玩命加载中...", // 加载器中显示的文字
								textVisible : true, // 是否显示文字
								theme : 'b', // 加载器主题样式a-e
								textonly : false, // 是否只显示文字
								html : "" // 要显示的html内容，如图片等
							});
						},
						hideLoader:function () {
							$(".bg").remove();
							// 隐藏加载器
							$.mobile.loading('hide');
						},
						background:function(flag){
							if(flag=="show")
								$.mobile.activePage.append("<div class='bg'></div>");
							else if(flag=="hide")
								$.mobile.activePage.children(".bg").remove();
						},
						submitAjax:function(obj, callback) {
//							$.vcapp.showLoader(hint||"加载中...");
							// $.vcapp.log($.toJSON(obj.serializeArray()));
							var dataJson = $.vcapp.convertToJson(obj.serializeArray());
							$.vcapp.log(dataJson);
							$.ajax({
								url : obj.attr("action"),
								data : dataJson,
								type : 'post',
								dataType : 'json',
								contentType : 'application/json;charset=utf-8',
								cache : false,
								success : function(data){
//									$.vcapp.hideLoader();
									callback(data);
								},
								error : function(xhr,b) {
									$.vcapp.log(xhr.responseText)
									if(b == "error")
										$.vcapp.alert("系统升级中，请稍候再试");
									else if(b == "timeout")
										$.vcapp.alert("网络超时");
									else
										$.vcapp.alert("您的网络异常,请稍后再试");
//									$.vcapp.hideLoader();
								}
							});

						},
						queryAjax:function(action,dataJson,onSuccess,noLoader){
							$.vcapp.log("queryAjax:"+dataJson);
//							if(!noLoader)
//								$.vcapp.showLoader("数据加载中...");
							$.ajax({
								url :  action,
								data : dataJson,
								type : 'post',
								dataType : 'json',
								contentType : 'application/json;charset=utf-8',
								cache : false,
								success : function(data){
//									$.vcapp.hideLoader();
									onSuccess(data);
								},
								error : function(xhr,b) {
									$.vcapp.log(xhr.responseText)
									if(b == "error")
										$.vcapp.alert("系统升级中，请稍候再试");
									else if(b == "timeout")
										$.vcapp.alert("网络超时");
									else
										$.vcapp.alert("您的网络异常,请稍后再试");
//									$.vcapp.hideLoader();
									
								}
							});
						},
						
						
						//页面刷新
						pageRefresh:function (){
							$.mobile.pageContainer.trigger("create");
						},

						//加载底部菜单
						createFooter:function (page,id){
							$.vcapp.log("create footer");
							var footerUrl = page.attr("data-footer");
//							debugger;
							var footer = page.find('div[id="footer"]');
							
							if (footerUrl) {
								var footerHtml = this.ss.getItem(footerUrl);
								if (!footerHtml) {
									footerHtml = this.urlLoadContent(footerUrl);
									this.ss.setItem(footerUrl, footerHtml);
								}
								if(!footer[0]){
									$.vcapp.log("append footer");
									page.append(footerHtml);
								}
								if(id=='find_page'){
									var btnState =page.find('a[id="foot_find"]');
//									btnState.attr("class","ui-btn-active");
									btnState.addClass("ui-btn-active");
								}else if(id=='publish_page'){
									var btnState =page.find('a[id="foot_publish"]');
//									btnState.attr("class","ui-btn-active");
									btnState.addClass("ui-btn-active");
								}else if(id=='mine_page'){
									var btnState =page.find('a[id="foot_mine"]');
//									btnState.attr("class","ui-btn-active");
									btnState.addClass("ui-btn-active");
								}else if(id=='manage_page'){
									var btnState =page.find('a[id="foot_manage"]');
//									btnState.attr("class","ui-btn-active");
									btnState.addClass("ui-btn-active");
								}
							}
						},
						// 通过url加载html内容
						urlLoadContent: function(url) {
							var content = "";
							$.ajax({
								url : url,
								type : 'GET',
								dataType : "html",
								async : false,
								success : function(html, textStatus, xhr) {
									content = html;
								},
								error : function(xhr, textStatus, errorThrown) {
									content = "";
								}
							});
							return content;
						},
						//localStorage缓存
						ls:{
							setItem : function (key,value){
								localStorage.setItem(key,value)
							},
							setJson : function (key,value){
								localStorage.setItem(key,JSON.stringify(value))
							},
							getItem : function(key){
								return localStorage.getItem(key)
							},
							getJson : function(key){
								var item = localStorage.getItem(key)
								if(item&&item!="undefined"){
									try {
										return JSON.parse(item);
									} catch (e) {
										return item;
									}
								}else
									return null;
							},
							rmItem:function(key){
								localStorage.removeItem(key);
							}
						},

						//sessionStorage缓存
						ss :{
							setItem : function (key,value){
								sessionStorage.setItem(key,value)
							},
							setJson : function (key,value){
								sessionStorage.setItem(key,JSON.stringify(value))
							},
							getItem : function(key){
								var rtn = sessionStorage.getItem(key);
								if(key == REQ_PARM)
									$.vcapp.ss.rmItem(REQ_PARM);
								return rtn;
							},
							getJson : function(key){
								var item = sessionStorage.getItem(key)
								if(item&&item!="undefined"){
									if(key == REQ_PARM)
										$.vcapp.ss.rmItem(REQ_PARM);
									try {
										return JSON.parse(item);
									} catch (e) {
										return item;
									}
									
								}
								else 
									return null;
								
							},
							rmItem:function(key){
								sessionStorage.removeItem(key);
							}
						},
						filterURL:function(url){
							var urlArray = ["find_pwd.html"]
							var size = urlArray.length;
							for(var i=0;i<size;i++){
								if(url==urlArray[i])
									return false;
							}
							return true;
						},
						gotoPage:function(page,data){
							if(page!="find.html"&&page!="change_pwd.html"&&page!="find_pwd.html")
								if(!$.vcapp.isLogin()){
									$.vcapp.alert("请先登录");
									$('#find_page #loginBox').popup('open');
									return false;
								}
							var changeHash = $.vcapp.filterURL(page);
//							var opts = null;
//							debugger;
							var type = typeof data;
							if(data||data==0){
								if(type == "string"||type == "number" ){
									$.vcapp.ss.setItem(REQ_PARM,data);
								}else if(typeof data == "object"){
									$.vcapp.ss.setJson(REQ_PARM,data);
								}
//								opts = {changeHash: changeHash,
//										type: "post", 
//										data: data
//										};
							}
							if(!changeHash)
								$.mobile.changePage(page,{changeHash: changeHash});
							else
								$.mobile.changePage(page);
						},
						back:function(parm){
							if($.mobile.activePage.is('#order_page')){
								$.mobile.changePage("mine.html");
								return;
							}
							
							if(parm){
								var type = typeof parm;
								if(type == "object")
									$.vcapp.ss.setJson(REQ_PARM,parm);
								else
									$.vcapp.ss.setItem(REQ_PARM,parm);
							}
							$.mobile.back();
						},
						getImgUrls:function(imgContainer){
							var imgArray = imgContainer.find("img");
							var len = imgArray.length;
							var imgUrls = "";
							for(var i=0;i<len;i++){
								imgUrls += $(imgArray[i]).attr("url")+";";
							}
							$.vcapp.log(imgUrls);
							return imgUrls;
							
						},
						scanQRcode:function(success,error){
							$.vcapp.showLoader();
							var onSuccess = function (result) {
								$.vcapp.hideLoader();
                                $.vcapp.log("We got a barcode\n" +
                                        "Result: " + result.text + "\n" +
                                        "Format: " + result.format + "\n" +
                                        "Cancelled: " + result.cancelled);
                                success(result);
                                
                                  };
                            
                            var onError = error|| function (fail) {  
                            	$.vcapp.hideLoader();
                            	$.vcapp.alert("Scanning failed: " + fail);  
                            }; 
                                 
							cordova.plugins.barcodeScanner.scan(onSuccess,onError);
                                     
						},
						genQRcode:function(obj,txt){
//							var onSuccess = success||function(success) {  
//						        $.vcapp.log("encode success: " + success);  
//						      };
//						      var onError = error|| function(fail) {  
//							        alert("encoding failed: " + fail);  
//						      };
//							cordova.plugins.barcodeScanner.encode("TEXT_TYPE",txt,onSuccess, onError); 
//						}
							
							obj.qrcode({
								render: "canvas", //table方式
								width: 200, //宽度
								height:200, //高度
								text: txt //任意内容
							});
						},
						AddDays:function(date,days){
							var nd = new Date(date);
							nd = nd.valueOf();
							nd = nd + days * 24 * 60 * 60 * 1000;
							nd = new Date(nd);
							return nd;
						},
						uploadPicture:function (imageURI,opts) {
							var options = new FileUploadOptions();
							options.fileKey = opts.file||"file";
							options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
							options.mimeType = opts.mimeType||"image/jpeg";
							

							var ft = new FileTransfer();
							// 上传回调
							ft.onprogress = showUploadingProgress;
							if (myDevice == "Android1")
								navigator.notification.progressStart("", "当前上传进度");
							else
								showProgress();
							ft.upload(imageURI, encodeURI(backendURL + 'uploadFile'), function(result) {
								$.vcapp.log(result);
								var data = JSON.parse(result.response);
								if (data.respCode == "0")
									opts.callBack(imageURI, data.jSONObject);
								else
									$.vcapp.alert(data.respMsg);
								if (myDevice == "Android1")
									navigator.notification.progressStop();
								else
									closeProgress();
							}, function(result){
								$.vcapp.alert("上传失败，请重新上传");
								closeProgress();
							}, options);
							
							function showProgress() {
								$.mobile.activePage.append("<div class='bg'></div>");
								$.mobile.activePage.children('.progressBox').show();
							}
							function closeProgress() {
								$.mobile.activePage.children('.bg').remove();
								$.mobile.activePage.children('.progressBox').hide();
							}
							
							// 显示上传进度
							function showUploadingProgress(progressEvt) {
								if (progressEvt.lengthComputable) {
									// 已经上传
									var loaded = progressEvt.loaded;
									// 文件总长度
									var total = progressEvt.total;
									// 计算百分比，用于显示进度条
									var percent = parseInt((loaded / total) * 100);
									// 换算成MB
									loaded = (loaded / 1024 / 1024).toFixed(2);
									total = (total / 1024 / 1024).toFixed(2);
									if (myDevice == "Android1")
										navigator.notification.progressValue(Math
												.round((progressEvt.loaded / progressEvt.total) * 100));
									else {
										$('.progressBox .process_info').html(loaded + '/' + total);
										$('.progressBox .upload_current_process').css({
											'width' : percent + '%'
										});
									}
								}
							}
							
						},
						takePicture:function(opts) {
							var destinationType = navigator.camera.DestinationType;
							var options = {
								quality : opts.quality||100,
								destinationType : opts.destinationType||destinationType.FILE_URI,
								sourceType : opts.sourceType||0,
							// cameraDirection: Camera.Direction.FRONT,
								targetWidth: opts.width||$(window).width()*2,
								targetHeight: opts.height||$(window).height()*2
							// correctOrientation: true
							};

							navigator.camera.getPicture(function(data) {
								$.vcapp.uploadPicture(data,opts);
							}, null, options);

						},
						blurText:function(txt,type){
							var rtn;
							switch (type) {
							case "tel":
								rtn = txt.substr(0,3)+"****"+txt.substr(7,4);
								break;

							default:
								break;
							}
							return rtn;
						},
						//返回工作状态(用于DIV等没有disabled属性的容器的伪按钮)
						workIng:function (id)
						{
							id = typeof id == 'object' ? id : $("#"+id);
						    if(id.attr("working")=="true"||!id.attr("working"))
						    {
						        //工作中
						        return true;
						    }
						    else
						    {
						        //没有工作
						        if(id.attr("working")=="undefined")
						        {
						        	id.attr("working","false");
						        }
						        return false
						    }
						},
						//改变当前的工作状态(用于DIV等没有disabled属性的容器的伪按钮)
						changeWork:function (id)
						{
							id = typeof id == 'object' ? id : $("#"+id);
						    if(id.attr("working")=="true"||!id.attr("working"))
						    {
						    	id.attr("working","false")
						    }else
						    {
						    	id.attr("working","true")
						    }
						},
						toast:function(txt){
							var toast = "<div class='toast'>"+txt+"</div>";
							$(".ui-page-active").append(toast);
							// 3秒后隐藏移除
							var intervalID = window.setInterval(function() {
								window.clearInterval(intervalID);
								$(".toast").remove();
							}, 3000);
						},
						encrypt:function(str){
							return  hex_sha1(hex_md5(str));
						},
						refresh:function(page){
							$.vcapp.ss.rmItem(USER);
							$.vcapp.ss.rmItem(SESSION_USER);
							$.vcapp.ls.rmItem(USER);
							$.vcapp.ls.rmItem(SESSION_USER);
							FIND_MAP.rmAllMarker();
							//清空manage.html
							$("#manage_page").remove();
							 list1_page = 1;
							 list2_page = 1;
							 list1_first = true;
							 list2_first = true;
							 //清空order.html
							 $("#order_page").remove();
							 order1_page = 1;
							 order2_page = 1;
							 order1_first = true;
							 order2_first = true;
							 if(page)
								 $.vcapp.gotoPage(page);
						},
						logout:function(){
							$.vcapp.showLoader("安全退出中...");
							//user!loginOut.do
							$.ajax({
								url : backendURL + "user!loginOut.do",
								type : 'get',
								contentType : 'application/json;charset=utf-8',
								cache : false,
								success : function(data) {
									if (data.respCode == '0') {
										$.vcapp.refresh("find.html");
										$.vcapp.ls.rmItem(TOKEN);
									}else if(data.respCode=="ERR0020"){
										$.vcapp.refresh("find.html");
									}else{
										$.vcapp.alert(data.respMsg);
									}
									$.vcapp.hideLoader();
									
								},
								error : function(xhr) {
									$.vcapp.log(xhr.responseText)
									if(b == "error")
										$.vcapp.alert("系统升级中，请稍候再试");
									else if(b == "timeout")
										$.vcapp.alert("网络超时");
									else
										$.vcapp.alert("您的网络异常,请稍后再试");
									$.vcapp.hideLoader();
								}
							});
						},
						words_deal:function(obj){ 
							var max = $(obj).attr("maxlength");
							var curLength=$(obj).val().length; 
							if(curLength>max) 
							{ 
								var num=$(obj).val().substr(0,max); 
								$(obj).val(num); 
							} 
							else{ 
								$(obj).next("div").text(curLength+"/"+max); 
							} 
						},
						tokenLogin:function(callback){
							var token = $.vcapp.ls.getJson(TOKEN);
							if(token){
								var dataJson = {};
								dataJson.token = token.value;
								$.ajax({
									url : backendURL + "user!tokenLogin.do",
									data : JSON.stringify(dataJson),
									type : 'post',
									dataType : 'json',
									contentType : 'application/json;charset=utf-8',
									cache : false,
									success : function(data){
										if(data.respCode == '0'){
											$.vcapp.ss.setItem(SESSION_USER, "0");
											$.vcapp.ss.setJson(USER, data.jSONObject);
											$.vcapp.ls.setJson(TOKEN, data.jSONObject.token);
										}
										callback(data);
									},
									error : function(xhr,b) {
										$.vcapp.log(xhr.responseText)
										if(b == "error")
											$.vcapp.alert("系统升级中，请稍候再试");
										else if(b == "timeout")
											$.vcapp.alert("网络超时");
										else
											$.vcapp.alert("您的网络异常,请稍后再试");
										callback();
									}
								});
								
							}else{
								callback();
							}
							
						},
						isLogin:function(){
							var state = $.vcapp.ss.getItem(SESSION_USER);
							if (state == "0")
								return true;
							else
								return false;
						},
						pwdStrength:function (pwd){
							 var strongRegex = new RegExp("^(?=.{8,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\\W).*$", "g");
						     var mediumRegex = new RegExp("^(?=.{7,})(((?=.*[A-Z])(?=.*[a-z]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))).*$", "g");
						     var enoughRegex = new RegExp("(?=.{6,}).*", "g");
						     if (false == enoughRegex.test($(pwd).val())) {//不足6位
						             return -1;
						     } else if (strongRegex.test($(pwd).val())) {//高级
						             return 2;
						     } else if (mediumRegex.test($(pwd).val())) {//中级
						             return 1;
						     } else {//低级
						             return 0;
						     }
						},
						validate:function (obj,type){  
							var flag = true;
						    switch (type) {
							case "int":
								var reg = new RegExp("^[0-9]*$");
								if(!reg.test(obj.val())){  
							        flag = false;
							    }
								break;

							default:
								break;
							}
						    return flag;
						     
						  },
						 randomString:function (len) {
							 len = len || 32;
							 var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
							 var maxPos = $chars.length;
							 var pwd = '';
							 for (i = 0; i < len; i++) {
							  pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
							 }
							 return pwd;
						  },
						  schedule:function(text){
							  cordova.plugins.notification.local.schedule({
								    id: 1,
								    text: text,
								});
						  },
						  getParam:function(code,callback){
							  var data = {};
							  data.code = code;
							  var dataJson = JSON.stringify(data);
							  $.vcapp.queryAjax("parameter!getParameter.do",dataJson,function(data){
									if(data.respCode=="0"){
										callback(data.jSONObject);
									}else{
										$.vcapp.alert(data.respMsg);
									}
								});
							  
						  }
						  

					});
	
	
	
		

})(jQuery)