/**
 * Created by SunLunatic on 2014/12/14.
 */
(function ($) {
	$.fn.Fmn = function(defaultOptions){
		var $editor = $(this);
		FmnGlobal.fmnEditor = this;
		var options = $.extend({}, FmnGlobal.defaults, defaultOptions);
		var $toolBarDiv = $($editor.before(FmnGlobal.toolbarHtml).prev());
		$.each(options.toolbars, function(barIndex, barId){
			var barOptions = FmnGlobal.toolbars[barId];
			if(FmnGlobal.initbars[barId]){
				return FmnGlobal.initbars[barId]($toolBarDiv, barOptions);
			}
			var id="fmn_barid_"+barId, name=barOptions["name"], icon=barOptions["icon"], cmd=barOptions["cmd"];
			FmnGlobal.initDefaultHtml($toolBarDiv, id, name, icon);
			$("#"+id).on("mouseup", function(){
				FmnGlobal.execCommand(cmd, "");
			});
		});
		$editor.attr("contenteditable", true)
			.addClass("fmn-content").addClass("fmn-editor")
			.on('mouseup keyup mouseout', function () {
				FmnGlobal.saveSelection();
			}).on("focus", function(){
				FmnGlobal.restoreSelection();
			});
		//对于可能会使文本编辑器失去焦点的dom(例如文本框)，绑定事件当编辑器失去焦点时记录已经选择的内容
		$toolBarDiv.find("input").on('focus', function() {
			var input = $(this);
			if (!input.data("fmn-marker")) {
				FmnGlobal.markSelection(input, true);
				input.focus();
			}
		}).on('blur', function() {
			var input = $(this);
			if (input.data("fmn-marker")) {
				FmnGlobal.markSelection(input, false);
			}
		});
		
		return this;
	}
	var FmnGlobal = {
		fmnEditor: null,
		defaults:{
			toolbars: ["link", "title", "bold", "italic", "strikeThrough", "underline", "justifyLeft", "justifyCenter", "justifyRight", "undo", "redo", "insertImage"]
		},
		toolbarHtml:'<div class="fmn-toolbar"></div>',
		toolbars:{
			"link": {name:"超链接", icon:"fa-chain", cmd:"createLink"},
			"title": {name: "样式", icon:"fa-header", cmd: "insertHtml",
				menus:[{name:"标题1", style:"padding-left: 10px;line-height: 45px;background-color:#F0F7FC;font-weight: bold;font-size: 24px;border-left: thick solid #2A6496;color: #2A6496;"},
				        {name:"标题2", style:"margin-top:0px;margin-bottom: 10px;font-size: 30px;border-bottom: 2px solid #F0F7FC;line-height: 60px;"},
				        {name:"标题3", style:"font-size:16px;border-bottom:2px solid #F0F7FC;width: 40%;font-weight: bolder;"},
				        {name:"正文", style:""}
				        ]},
			"bold": {name:"黑体", icon:"fa-bold", cmd:"bold"},
			"italic": {name:"斜体", icon:"fa-italic", cmd:"italic"},
			"strikeThrough": {name:"删除线", icon:"fa-strikethrough", cmd:"strikeThrough"},
			"underline": {name:"下划线", icon:"fa-underline", cmd:"underline"},
			"justifyLeft": {name:"左对齐", icon:"fa-align-left", cmd:"justifyLeft"},
			"justifyCenter": {name:"居中", icon:"fa-align-center", cmd:"justifyCenter"},
			"justifyRight": {name:"右对齐", icon:"fa-align-right", cmd:"justifyRight"},
			"undo": {name:"撤销", icon:"fa-undo", cmd:"undo"},
			"redo": {name:"恢复撤销", icon:"fa-repeat", cmd:"redo"},
			"insertImage": {name:"上传图片", icon:"fa-image", cmd:"insertImage", url:"/pool/upload/temp", getUrlPre:"/resource/temp/upload"},
			
		},
		execCommand: function(cmd, args, control){
			if(!cmd) return;
			document.execCommand(cmd, control || false, args);
		},
		addToolTip: function(id, name){
			$("#"+id).tooltip({title: name, placement:"top"});
		},
		//非标准编辑功能
		initbars:{},
		//标准编辑按钮
		initDefaultHtml: function($toolBarDiv, id, name, icon){
			$toolBarDiv.addClass("fmn-toolbar")
				.append('<div><a class="btn btn-default" id="'+id+'"><i class="fa '+icon+'"></i></a></div>');
			FmnGlobal.addToolTip(id, name);
		},
		//多选项菜单按钮
		initMenuHtml: function($toolBarDiv, id, name, icon, menus){
			$toolBarDiv.append('<div class="btn-group"><a class="btn btn-default" '+ 
					'data-toggle="dropdown" id="'+id+'" ><i class="fa '+icon+'"></i><span class="caret"></span></a>'+
					'<ul id="'+id+'_menu" class="dropdown-menu input-append" role="menu">'+
					FmnGlobal.createMenu(menus)+
					'</div>');
		},
		createMenu : function(menus){
			var appendHtml = "";
			$.each(menus, function(index, menuInfo){
				appendHtml += '<li><a style="' + (menuInfo["style"]||'')  +' "' + 
					'data-value="' + (menuInfo["value"]||'') + '">' + menuInfo["name"]+'</a></li>';
			});
			return appendHtml;
		},
		replaceHtml: function(text){
			return text?text.replace( /[<>]/g, function(html){
				var table = {"<" : "&lt;", ">" : "&gt;"};
				return table[html];
			}):"";
		},
		//选择范围标记与保存
		selectRange: null,
		saveSelection: function(){
			var sel = window.getSelection();
			if (sel.getRangeAt && sel.rangeCount) {
				FmnGlobal.selectedRange = sel.getRangeAt(0);
			}
		},
		restoreSelection: function(){
			var selection = window.getSelection();
			if (FmnGlobal.selectedRange) {
				try {
					selection.removeAllRanges();
				} catch (ex) {
					document.body.createTextRange().select();
					document.selection.empty();
				}
				selection.addRange(FmnGlobal.selectedRange);
			}
		},
		markSelection : function (input, mark) {
			FmnGlobal.restoreSelection();
			if (document.queryCommandSupported('hiliteColor')) {
				document.execCommand('hiliteColor', false,  'transparent');
			}
			FmnGlobal.saveSelection();
			input.data("fmn-marker", mark);
		},
		keycode:{
			"enter" : "13"
		},
		//绑定键盘事件
		bindKeyUpEvent: function(dom, selector, keycode, callback){
			$(dom).on("keyup", selector, function(event){
				return event.keyCode == FmnGlobal.keycode[keycode] && callback(event);
			});
		}
	};
	
	FmnGlobal.initbars["link"] = function($toolBarDiv, barOptions){
		var id="fmn_barid_link", name=barOptions["name"], icon=barOptions["icon"], cmd=barOptions["cmd"];
		var creatLink = function(){
			var args = FmnGlobal.replaceHtml($(this).prev().val());
			args = args.indexOf("http://")==0?args:"http://"+args;
			FmnGlobal.restoreSelection();
			FmnGlobal.execCommand(cmd, args);
			$(this).prev().val("");
		} 
		var triggerCreate = function(){
			$("#"+id+"_menu button").trigger("click");
		}
			
		$toolBarDiv.append('<div class="btn-group"><a class="btn btn-default" '+ 
				'data-toggle="dropdown" id="'+id+'" ><i class="fa '+icon+'"></i><span class="caret"></span></a>'+
				'<div id="'+id+'_menu" class="dropdown-menu input-append" style="width:260px;" role="menu">'+
				'<input class="form-control pull-left" type="text" placeholder="URL" style="width: 200px;"/>'+
				'<button class="btn btn-default pull-left" type="button">确定</button></div>');
		
		FmnGlobal.addToolTip(id, name);
		
		$("#"+id+"_menu input").on("click", function(event) {
			event.stopPropagation();
		});
		
		$("#"+id+"_menu").on("click", "button", creatLink);
		FmnGlobal.bindKeyUpEvent($("#"+id+"_menu"), "input", "enter", triggerCreate);
	}
	
	FmnGlobal.initbars["insertImage"] = function($toolBarDiv, barOptions){
		var id="fmn_barid_insertImage", name=barOptions["name"], icon=barOptions["icon"], cmd=barOptions["cmd"],
			postUrl=barOptions["url"], getUrlPre=barOptions["getUrlPre"];
		FmnGlobal.initDefaultHtml($toolBarDiv, id, name, icon);
		$("#"+id).append('<input type="file" accept="image/*" style="display:none" id="'+id+'_ipt" />');
		$("#"+id).on("mouseup", function(){
			$("#"+id+"_ipt").trigger("click");
		});
		$("#"+id+"_ipt").on("change", function(){
			if(!$(this).val()){
				return;
			}
			var formData = new FormData();
			formData.append("uploadFile", $(this)[0].files[0]);
			$.ajax({
				url: postUrl,
				type: "POST",
				dataType: "text",
				data: formData,
				contentType: false,
				processData: false,
				success: function(filePath){
					FmnGlobal.fmnEditor.focus();
					FmnGlobal.execCommand(cmd, getUrlPre + "/" + filePath);
				}
			});
		});
	}
	
	FmnGlobal.initbars["title"] = function($toolBarDiv, barOptions){
		var id="fmn_barid_title", name=barOptions["name"], icon=barOptions["icon"], cmd=barOptions["cmd"],
			menus=barOptions["menus"];
		FmnGlobal.initMenuHtml($toolBarDiv, id, name, icon, menus);
		FmnGlobal.addToolTip(id, name);
		
		$("#"+id+"_menu").on("mouseup", "li", function(){
			FmnGlobal.fmnEditor.focus();
			FmnGlobal.restoreSelection();
			if(window.getSelection()){
				FmnGlobal.execCommand(cmd, 
						"<div style='"+$(this).find("a").attr("style")+"' >" + 
						window.getSelection() + "</div>");
			}
		});
	}
})(jQuery);