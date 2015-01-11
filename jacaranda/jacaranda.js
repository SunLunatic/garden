/**
 * Created by SunLunatic on 2014/11/7.
 */
(function ($) {
    var Jacaranda = function (element, options) {
        this.target = $(element);
        this.options = options;
        this.init();
    };
    Jacaranda.prototype = {
        constructor: Jacaranda,
        init: function () {
            var that = this;
            var data = this.options.data;
            var htmlStr = '<div class="jcrd-tree jcrd-tree-unselectable">';
            var isSynac = !!this.options.synac;
            $(data).each(function(){
                htmlStr += JcrdGlobal.renderToHtml(this, that.options, isSynac, true);
            });
            htmlStr += '</div>';
            this.target.append(htmlStr);
            $(this.target).on("click", ".fa-plus-square-o", function (event) {
                var $this = $(this);
                $this.removeClass("fa-plus-square-o");
                if($this.attr("init") == "false"){
                	$this.addClass("fa-spinner");
                	$this.addClass("fa-spin");
                    $.ajax({
                        url: that.options.synac,
                        type: "POST",
                        dataType: "json",
                        data: {
                            parentId: $this.next().attr("data-id")
                        },
                        success: function(data){
                            var dataObj = {children: data};
                            $this.removeClass("fa-spinner");
                            $this.removeClass("fa-spin");
                            $this.addClass("fa-minus-square-o");
                            $this.parent().after(JcrdGlobal.renderToHtml(dataObj, that.options, isSynac, false));
                            $this.parent().next(".jcrd-tree-package-content").removeClass("jcrd-content-hide");
                            event.stopPropagation();
                        }
                    });
                }else{
                    $this.addClass("fa-minus-square-o");
                    $this.parent().next(".jcrd-tree-package-content").removeClass("jcrd-content-hide");
                    event.stopPropagation();
                }
            });
            $(this.target).on("click", ".fa-minus-square-o", function (event) {
                $(this).removeClass("fa-minus-square-o");
                $(this).addClass("fa-plus-square-o");
                $(this).parent().next(".jcrd-tree-package-content").addClass("jcrd-content-hide");
                event.stopPropagation();
            });
            $(this.target).on("click", ".jcrd-tree-package-header", function (event) {
                var isChoose = false;
                if ($(this).hasClass("jcrd-tree-selected")) {
                    $(this).removeClass("jcrd-tree-selected");
                } else {
                    isChoose = true;
                    $(this).addClass("jcrd-tree-selected");
                }
                var clickCb = $(event.delegateTarget).data("_jcrdTree").options.clickCb;
                if (clickCb) clickCb(event, $(this).children("div")[0], isChoose);
            });
        },
        select: function(selectIds, expand){
            var tree = this;
            $(selectIds).each(function(){
                var treeNode = $(tree.target).find("#_jcrd_"+this);
                if(!expand && treeNode) {
                    $(treeNode).parents(".jcrd-tree-package").each(function () {
                        var view = $(this).find(".fa-plus-square-o")[0];
                        if(view){
                            $(view).removeClass("fa-plus-square-o");
                            $(view).addClass("fa-minus-square-o");
                            $(view).parent().next(".jcrd-tree-package-content").removeClass("jcrd-content-hide");
                        }
                    });
                }
                $(treeNode).trigger("click");
            });
        },
        expandAll: function(){
            $(this.target).find(".jcrd-content-hide").each(function(){
                $(this).removeClass("jcrd-content-hide");
            });
            $(this.target).find(".fa-plus-square-o").each(function(){
                $(this).removeClass("fa-plus-square-o");
                $(this).addClass("fa-minus-square-o");
            });
        },
        closeAll: function(){
            $(this.target).find(".jcrd-tree-package-content").each(function(){
                $(this).addClass("jcrd-content-hide");
            });
            $(this.target).find(".fa-minus-square-o").each(function(){
                $(this).addClass("fa-plus-square-o");
                $(this).removeClass("fa-minus-square-o");
            });
        },
        destory: function(){
            this.target.removeData("_jcrdTree");
            this.target.off('click');
            $(this.target).find(".jcrd-tree").remove();
        }
    };
    $.fn.jacaranda = function (options) {
        var jcrdTree = this.data("_jcrdTree");
        if(!jcrdTree){
            jcrdTree = new Jacaranda(this, $.extend({}, $.fn.jacaranda.defaults, options));
            this.data("_jcrdTree", jcrdTree);
        }
        return jcrdTree;
    };
    $.fn.jacaranda.defaults = {
        data: null,
        clickCb: null,
        leaf: "leaf",
        children: "children",
        text: "name",
        synac: false
    };
    var JcrdGlobal = {
        renderToHtml: function (dataObj, options, isSynac, buildHead) {
            var htmlStr = "";
            if(buildHead) {
                htmlStr += '<div class="jcrd-tree-package"><div class="jcrd-tree-package-header">';
                //是否包含下一级节点 leaf = true/false 优先级最高 当leaf未定义时根据是否有children决定
                if (dataObj[options.leaf] == "true" || (dataObj[options.leaf] == undefined && !dataObj[options.children])) {
                    htmlStr += '<i class="fa"></i>';
                } else {
                    htmlStr += '<i class="fa fa-plus-square-o fa-1x" ';
                    if (isSynac) htmlStr += 'init="false" ';
                    htmlStr += '></i>';
                }

                htmlStr += '<div ' + JcrdGlobal.addAttrs(dataObj, options) + ' class="jcrd-tree-package-name">'
                    + dataObj[options.text] + '</div></div>';
            }

            if (dataObj[options["leaf"]] != "false" && dataObj[options["children"]]) {
                htmlStr += '<div class="jcrd-tree-package-content jcrd-content-hide">';
                for (var childKey in dataObj[options.children]) {
                    htmlStr += JcrdGlobal.renderToHtml(dataObj[options.children][childKey], options, isSynac, true);
                }
                htmlStr += "</div>";
            }
            htmlStr += "</div>";
            return htmlStr;
        },
        addAttrs: function (dataObj, params) {
            var htmlStr = "";
            for (var key in dataObj) {
                if (!key || params.text == key || params.children == key) continue;
                if("id" == key){
                    htmlStr += JcrdGlobal.addAttr("id", "_jcrd_"+dataObj[key]);
                    htmlStr += JcrdGlobal.addAttr("data-id", dataObj[key]);
                    continue;
                }
                htmlStr += JcrdGlobal.addAttr(key, dataObj[key]);
            }
            return htmlStr;
        },
        addAttr: function (attName, attVal) {
            return attName + '="' + attVal + '" ';
        }
    };
})(jQuery);