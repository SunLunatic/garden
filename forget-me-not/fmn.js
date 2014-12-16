/**
 * Created by SunLunatic on 2014/12/14.
 */
(function ($) {
	$.fn.Fmn = function(options){
		var $editor = $(this);
		var options = $.extend({}, FmnGlobal, options);
		
		var $toolBarDiv = $($editor.before(options.toolbarHtml).prev());
		$.each(options.toolbars, function(barId, barOptions){
			if(FmnGlobal.initbars[barId]){
				return FmnGlobal.initbars[barId]($toolBarDiv, barOptions);
			}
			var id="fmn_barid_"+barId, name=barOptions["name"], icon=barOptions["icon"], cmd=barOptions["cmd"];
			$toolBarDiv.addClass("fmn-toolbar")
				.append('<div><a class="btn btn-default" id="'+id+'"><i class="fa '+icon+'"></i></a></div>');
			$("#"+id).tooltip({title: name, placement:"top"})
				.on("mouseup", function(){
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
		toolbarHtml:'<div class="fmn-toolbar"></div>',
		toolbars:{
			"link": {name:"超链接", icon:"fa-chain", cmd:"createLink"},
			"bold": {name:"黑体", icon:"fa-bold", cmd:"bold"},
			"italic": {name:"斜体", icon:"fa-italic", cmd:"italic"},
			"strikeThrough": {name:"删除线", icon:"fa-strikethrough", cmd:"strikeThrough"},
			"underline": {name:"下划线", icon:"fa-underline", cmd:"underline"},
			"justifyLeft": {name:"左对齐", icon:"fa-align-left", cmd:"justifyLeft"},
			"justifyCenter": {name:"居中", icon:"fa-align-center", cmd:"justifyCenter"},
			"justifyRight": {name:"右对齐", icon:"fa-align-right", cmd:"justifyRight"},
			"undo": {name:"撤销", icon:"fa-undo", cmd:"undo"},
			"redo": {name:"恢复撤销", icon:"fa-repeat", cmd:"redo"}
		},
		execCommand: function(cmd, args){
			if(!cmd) return;
			document.execCommand(cmd, false, args);
		},
		initbars:{},
		replaceHtml: function(text){
			return text?text.replace( /[<>]/g, function(html){
				var table = {"<" : "&lt;", ">" : "&gt;"};
				return table[html];
			}):"";
		},
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
			console.info(callback);
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
			FmnGlobal.execCommand("createLink", args);
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
		$("#"+id).tooltip({title: name, placement:"top"});
		
		$("#"+id+"_menu input").on("click", function(event) {
			event.stopPropagation();
		});
		
		$("#"+id+"_menu").on("click", "button", creatLink);
		FmnGlobal.bindKeyUpEvent($("#"+id+"_menu"), "input", "enter", triggerCreate);
	}
})(jQuery);