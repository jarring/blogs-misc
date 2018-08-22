
(window.GLOBAL_VAR = window.GLOBAL_VAR || {}).page = new function() {
    var _self = this;
    var _data = [];
    var _index = [];
    var _content = "";
    var _pager = "";
    var _contentTpl = "";
    var _searching = "";
    var keyword = null;
    
    var handleJson = function(json, content, pager, contentTpl, pageSize, pageIndex, searching){
        _data = json || [];
        _content = content;
        _pager = pager;
        _contentTpl = contentTpl;
        _searching = searching;

        parseSearching();
        showSearching();
        showPager();
        _self.changePager(pageSize, pageIndex);
    };

    var parseSearching = function() {
        var url = location.search; 
        var param = {};
        if (url.indexOf("?") != -1) {
            var str = url.substr(1);
            strs = str.split("&");
            for(var i = 0; i < strs.length; i ++) {
                param[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
            }
        }
        keyword = param["q"] || null;

        if (!keyword) {
            //_data.forEach((v, i, arr) => _index.push(i));
            _data.forEach(function(v, i, arr){ _index.push(i); } );
        } else {
            keyword = unescape(unescape(keyword));
            /*
            _data.forEach((v, i, arr) => { 
                for(var x of v["categories"]) {
                    if (x == keyword) {
                        _index.push(i);
                        break;
                    }
                }
            });
            */
            _data.forEach(function(v, i, arr) { 
                for(var x in v["categories"]) {
                    if (v["categories"][x] == keyword) {
                        _index.push(i);
                        break;
                    }
                }
            });
        }
    };

    _self.changePager = function(pageSize, pageIndex) {
        var pIdx = parseInt(pageIndex) || 0;
        var pTtl = Math.ceil(_index.length / pageSize);
        if (pIdx <= 0 || pTtl > 0 && pIdx > pTtl) {
            return;
        }
        var c = $(_content);
        c.html("");
        if (_index.length == 0) {
            $(".content-nav").css("display", "none");
            c.html("<div class='tips'>无数据 Nothing</div>");
            return;
        } else {
            var t = $(_contentTpl);
            var from = pageSize * (pIdx - 1);
            for (var i = from; i < from + 5 && i < _index.length; i ++) {
                var idx = _index[i];
                var obj = _data[idx];
                //console.log(i);
                var n = t.clone(true);
                //icon
                var img = n.find("img");
                if (obj["icon"]) {
                    img.attr("src", obj["icon"]);
                }
                //link
                var link = n.find("a");
                link.attr("href", obj["url"]);
                link.text(obj["title"]);
                //info
                n.find(".info").html("categories: " + obj["categories"].join(", "));
                //intr
                var div = n.find(".intr");
                div.html(obj["summary"]);
                
                n.appendTo(c);
            }
        }
        var p = $(_pager);
        var links = [p.find(".first"), p.find(".prev"), p.find(".next"), p.find(".last")],
            current = p.find(".current");
            total = p.find(".total");
        var bool = [1 < pTtl && 1 < pIdx ? 1 : 0, 
            1 <= pIdx - 1 ? pIdx - 1 : 0, 
            pIdx + 1 <= pTtl ? pIdx + 1 : 0, 
            0 < pTtl && pIdx < pTtl ? pTtl : 0];

        for (var i = 0; i < 4; i ++) {
            links[i].attr("idx", bool[i]);
            if (bool[i]) {
                links[i].removeClass("disabled");
            } else {
                links[i].addClass("disabled");
            }
        }
        current.val(pIdx);
        total.text(pTtl);
    };
    
    var showSearching = function() {
        if (keyword != null) {
            var p = $(_searching);
            p.html("正在搜索分类Searching category : <mark>" + keyword + "<mark>");
        }
    };

    var showPager = function() {
        var p = $(_pager);
        if (_index.length > 0) {
            p.css("display", "inline-block");
            p.find(".nav").unbind().bind("click", 
                function() {
                    window.GLOBAL_VAR.page.changePager(5, $(this).attr('idx'));
                }
            );
            p.find(".current").unbind().bind("change", 
                function() {
                    window.GLOBAL_VAR.page.changePager(5, $(this).val());
                }
            );
        }
    };
    
    _self.make = function(url, content, pager, contentTpl, pageSize, pageIndex, searching) {
        $.ajax({
            "url": url,
            dataType: "json"
        })
        .done(function(data, textStatus, jqXHR) {
            //try {
                handleJson(data, content, pager, contentTpl, pageSize, pageIndex, searching);
            //} catch(e) {
            //    console.log(e);
            //}
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown); 
            try {
                handleJson([], content, pager, contentTpl, pageSize, pageIndex, searching);
            } catch(e) {
                console.log(e);
            }
        });
        /*
        fetch(url, {
              method: "get",
              headers:{
                "Content-type":"application/x-www-form-urlencoded"
              }
        })
        .then(function(response){ handleResponse(response); })
        .then(function(data){ return data ? data.json() : []; })
        .then(function(json){ handleJson(json, content, pager, contentTpl, pagerTpl, pageSize, pageIndex, searching); })
        .catch(function(err){console.log(err); handleJson([], content, pager, contentTpl, pagerTpl, pageSize, pageIndex, searching);});
        */
    };
};


(window.GLOBAL_VAR = window.GLOBAL_VAR || {}).search = new function() {
    var _self = this;
    
    _self.searchKey = function(link) {
        link.href = link.getAttribute("link") + "?q=" + escape(escape(link.innerHTML));
    };
};


(window.GLOBAL_VAR = window.GLOBAL_VAR || {}).summary = new function() {
    var _self = this;

    _self.toggle = function(t, s) {
        $(t).unbind().bind("click", function(){
            $(s).toggle(1000);
        });
    };
};
