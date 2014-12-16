/**
 * Created by SunLunatic on 2014/11/7.
 */
(function ($) {
    var Jacaranda = function (element, options) {
        this.target = $(element);
        this.options = options;
        this.options["params"]["leaf"] = this.options["params"]["leaf"] || "_isLeaf";
        this.options["params"]["children"] = this.options["params"]["children"] || "_children";
        this.options["params"]["showVal"] = this.options["params"]["showVal"] || "_value";
        this.init();
    };
    Jacaranda.prototype = {
        constructor: Jacaranda,
        init: function () {
        	var that = this;
            var data = this.options["data"];
            var dataObj = $.evalJSON(data);
            var htmlStr = '<div class="jcrd-tree jcrd-tree-unselectable">';
            $(dataObj).each(function(){
                htmlStr += JcrdGlobal.renderToHtml(this, that.options["params"]);
            });
            htmlStr += '</div>';
            this.target.append(htmlStr);
            $(this.target).on("click", ".fa-plus-square-o", function (event) {
                $(this).removeClass("fa-plus-square-o");
                $(this).addClass("fa-minus-square-o");
                $(this).parent().next(".jcrd-tree-package-content").removeClass("jcrd-content-hide");
                event.stopPropagation();
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
        data: {},
        clickCb: null,
        params: {},
        synac: {}
    };
    var JcrdGlobal = {
        renderToHtml: function (dataObj, params) {
            var htmlStr = "";
            htmlStr += '<div class="jcrd-tree-package"><div class="jcrd-tree-package-header">';
            if (dataObj[params["leaf"]] == "false" || (!dataObj["_children"] && dataObj !== Array)) {
                htmlStr += '<i class="fa"></i>';
            } else {
                htmlStr += '<i class="fa fa-plus-square-o fa-1x"></i>';
            }
            htmlStr += '<div ' + JcrdGlobal.addAttrs(dataObj, params) + ' class="jcrd-tree-package-name">' + dataObj[params["showVal"]] + '</div></div>';
            if (dataObj[params["leaf"]] != "false" && dataObj[params["children"]]) {
                htmlStr += '<div class="jcrd-tree-package-content jcrd-content-hide">';
                for (var childKey in dataObj[params["children"]]) {
                    htmlStr += JcrdGlobal.renderToHtml(dataObj[params["children"]][childKey], params);
                }
                htmlStr += "</div>";
            }
            htmlStr += "</div>";
            return htmlStr;
        },
        addAttrs: function (dataObj, params) {
            var htmlStr = "";
            for (var key in dataObj) {
                if (!key || params["showVal"] == key || params["children"] == key) continue;
                if("id" == key){
                    htmlStr += JcrdGlobal.addAttr("id", "_jcrd_"+dataObj[key]);
                    continue;
                }
                htmlStr += JcrdGlobal.addAttr(key, dataObj[key]);
            }
            return htmlStr;
        },
        addAttr: function (attName, attVal) {
            return attName + '=' + attVal + ' ';
        }
    };
})(jQuery);