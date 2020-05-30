
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
        var c = document.querySelector(_content);
        c.innerHTML = "";
        if (_index.length == 0) {
            document.querySelector(".content-nav").style.display = "none";
            c.innerHTML = "<div class='tips'>无数据 Nothing</div>";
            return;
        } else {
            var t = document.querySelector(_contentTpl);
            var from = pageSize * (pIdx - 1);
            for (var i = from; i < from + 5 && i < _index.length && _data && _data.length > 0; i ++) {
                var idx = _index[i];
                var obj = _data[idx];
                //console.log(i);
                var n = t.cloneNode(true);
                //icon
                var img = n.querySelector("img");
                if (obj["icon"]) {
                    img.setAttribute("src", obj["icon"]);
                }
                //link
                var link = n.querySelector("a");
                link.setAttribute("href", obj["url"]);
                link.textContent = obj["title"];
                //info
                link.setAttribute("title",
                    "categories: " + obj["categories"].join(", ") 
                    + "\ntags: " + obj["tags"].join(", ")
                    + "\ndate: " + obj["date"]
                );
                //intr
                var div = n.querySelector(".intr");
                div.innerHTML = obj["summary"];
                
                c.appendChild(n);
            }
        }
        var p = document.querySelector(_pager);
        var links = [p.querySelector(".first"), p.querySelector(".prev"), p.querySelector(".next"), p.querySelector(".last")],
            current = p.querySelector(".current");
            total = p.querySelector(".total");
        var bool = [1 < pTtl && 1 < pIdx ? 1 : 0, 
            1 <= pIdx - 1 ? pIdx - 1 : 0, 
            pIdx + 1 <= pTtl ? pIdx + 1 : 0, 
            0 < pTtl && pIdx < pTtl ? pTtl : 0];

        for (var i = 0; i < 4; i ++) {
            links[i].setAttribute("idx", bool[i]);
            if (bool[i]) {
                links[i].classList.remove("disabled");
            } else {
                links[i].classList.add("disabled");
            }
        }
        current.value = pIdx;
        total.textContent = pTtl;
    };
    
    var showSearching = function() {
        if (keyword != null) {
            var p = document.querySelector(_searching);
            p.innerHTML = "正在搜索分类Searching category : <mark>" + keyword + "<mark>";
        }
    };

    var clickFunc = function(event) {
        try {
            var pThis = event.target ?  event.target : event.srcElement;
            window.GLOBAL_VAR.page.changePager(5, pThis.getAttribute('idx'));
        } catch (e) {
            console.log(arguments);
        }
    };
    var changeFunc = function(event) {
        try {
            var pThis = event.target ?  event.target : event.srcElement;
            window.GLOBAL_VAR.page.changePager(5, pThis.value);
        } catch (e) {
            console.log(arguments);
        }
    };

    var showPager = function() {
        var p = document.querySelector(_pager);
        if (_index.length > 0) {
            p.style.display = "inline-block";
            [].forEach.call(document.querySelectorAll(".nav"), function(){　
                this.removeEventListener("click", clickFunc);
                this.addEventListener("click", clickFunc);　　
            });
            [].forEach.call(document.querySelectorAll(".current"), function(){　
                this.removeEventListener("change", changeFunc);
                this.addEventListener("change", changeFunc);　　
            });
        }
    };
    
    _self.make = function(url, content, pager, contentTpl, pageSize, pageIndex, searching) {
        fetch(url, {
              method: "get",
              headers:{
                "Content-type":"application/x-www-form-urlencoded"
              }
        })
        .then(function(data){
             return data ? data.json() : []; 
        }).then(function(json){
            handleJson(json, content, pager, contentTpl, pageSize, pageIndex, searching); 
        }).catch(function(err){
            console.log(err); 
            handleJson([], content, pager, contentTpl, pageSize, pageIndex, searching);
        });
    };
};


(window.GLOBAL_VAR = window.GLOBAL_VAR || {}).search = new function() {
    var _self = this;
    
    _self.searchKey = function(link) {
        link.href = link.getAttribute("link") + "?q=" + escape(escape(link.innerHTML));
    };
};