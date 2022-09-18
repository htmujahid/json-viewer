class JSONViewer{

    constructor(){
        this.jsonContainer = document.createElement("pre");
        this.jsonContainer.classList.add("json-viewer");
    }

    showJSON(json, maxLvl, colAt){

		let maxLevel = typeof maxLvl === "number" ? maxLvl : -1; 
		let columnAt = typeof colAt === "number" ? colAt : -1; 		
		
        this.jsonContainer.innerHTML = "";

		this.parseJSON(this.jsonContainer, json, maxLevel, columnAt, 0);
    }
    
    parseJSON(outputParent, value, maxLevel, columnAt, level) {
        if (typeof value === "object" && value !== null) {
            this.parseObject(outputParent, value, maxLevel, columnAt, level)
		} else {
            this.parseValue(outputParent, value)
		}
	};
    
    parseObject(outputParent, value, maxLevel, columnAt, level){
        let isMaxLevel = maxLevel >= 0 && level >= maxLevel;
        let isCollapse = columnAt >= 0 && level >= columnAt;
        
        let isArray = Array.isArray(value);
        let items = isArray ? value : Object.keys(value);

        if (level === 0) {
            this.parseRoot(items, isArray, isMaxLevel, outputParent, isCollapse)
        }
        
        if (items.length && !isMaxLevel) {
            this.parseChild(items, level, isArray, value, maxLevel, columnAt, outputParent)
        }
        else if (items.length && isMaxLevel) {
            let itemsCount = this.createItemsCount(items.length);
            itemsCount.classList.remove("hide");
            outputParent.appendChild(itemsCount);
        }
        
        if (level === 0) {
            if (!items.length) {
                let itemsCount = this.createItemsCount(0);
                itemsCount.classList.remove("hide");
                
                outputParent.appendChild(itemsCount);  
            }

            outputParent.appendChild(document.createTextNode(isArray ? "]" : "}"));
            
            if (isCollapse) {
                outputParent.querySelector("ul").classList.add("hide");
            }
        }
    }
    
    parseRoot(items, isArray, isMaxLevel, outputParent, isCollapse){
        let rootCount = this.createItemsCount(items.length);
        let rootLink = this.createLink(isArray ? "[" : "{");
        
        if (items.length) {
            rootLink.addEventListener("click", function() {
                if (isMaxLevel) return;
                
                rootLink.classList.toggle("collapsed");
                rootCount.classList.toggle("hide");
                
                outputParent.querySelector("ul").classList.toggle("hide");
            });
            
            if (isCollapse) {
                rootLink.classList.add("collapsed");
                rootCount.classList.remove("hide");
            }
        }
        else {
            rootLink.classList.add("empty");
        }
        
        rootLink.appendChild(rootCount);
        outputParent.appendChild(rootLink); 
    }
    
    parseChild(items, level, isArray, value, maxLevel, columnAt, outputParent) {
        let len = items.length - 1;
        let ul = document.createElement("ul");
        ul.setAttribute("data-level", level);
        ul.classList.add("type-" + (isArray ? "array" : "object"));
        
        items.forEach((key, ind) => {
            let item = isArray ? key : value[key];
            let li = document.createElement("li");
            
            if (typeof item === "object") {
                this.parseChildObject(item, isArray, key, maxLevel, columnAt, level, li, ind)
            }
            else {
                if (!isArray) {
                    li.appendChild(document.createTextNode(key + ": "));
                } else {
                    li.appendChild(document.createTextNode(ind + ": "));
                }
                
                this.parseJSON(li, item, maxLevel, columnAt, level + 1);
            }
            
            if (ind < len) {
                li.appendChild(document.createTextNode(","));
            }
            
            ul.appendChild(li);
        }, this);
        
        outputParent.appendChild(ul); 
        
    }
    

    parseChildObject(item, isArray, key, maxLevel, columnAt, level, li, ind) {
        if (!item || item instanceof Date) {
            li.appendChild(document.createTextNode(isArray ? "" : key + ": "));
            li.appendChild(this.createSimpleViewOf(item ? item : null, true));
        }

        else {
            let itemIsArray = Array.isArray(item);
            let itemLen = itemIsArray ? item.length : Object.keys(item).length;
            
            if (!itemLen) {
                li.appendChild(document.createTextNode((typeof key === "string" ? key : ind)  + ": " + (itemIsArray ? "[]" : "{}")));
            }
            else {
                console.log(ind);
                let itemTitle = (typeof key === "string" ? key + ": " : ind + ": ") + (itemIsArray ? "[" : "{");
                let itemLink = this.createLink(itemTitle);
                let itemsCount = this.createItemsCount(itemLen);

                if (maxLevel >= 0 && level + 1 >= maxLevel) {
                    li.appendChild(document.createTextNode(itemTitle));
                }
                else {
                    itemLink.appendChild(itemsCount);
                    li.appendChild(itemLink);
                }
                
                this.parseJSON(li, item, maxLevel, columnAt, level + 1);
                li.appendChild(document.createTextNode(itemIsArray ? "]" : "}"));
                
                let list = li.querySelector("ul");
                let itemLinkCb = () => {
                    itemLink.classList.toggle("collapsed");
                    itemsCount.classList.toggle("hide");
                    list.classList.toggle("hide");
                };
                
                itemLink.addEventListener("click", itemLinkCb);

                if (columnAt >= 0 && level + 1 >= columnAt) {
                    itemLinkCb();
                }
            }
        }
    }
    
    parseValue(outputParent, value){
        let spanEl = document.createElement("span");
		let type = typeof value;
		let asText = "" + value;
        if(this.isUrl(value)){
            let a = document.createElement('a')
            a.innerText = '"' + value + '"';
            a.href = value
            a.setAttribute("target", "_blank");
            spanEl.appendChild(a);
        } else {
            if (type === "string") {
                asText = '"' + value + '"';
            } else if (value === null) {
                type = "null";
            } 
            spanEl.className = "type-" + type;
            spanEl.textContent = asText;
        }
        outputParent.appendChild( spanEl);
    }

    getContainer(){
        return this.jsonContainer;
    }
    
    createSimpleViewOf(value) {
        let spanEl = document.createElement("span");
		let type = typeof value;
		let asText = "" + value;
        if(this.isUrl(value)){
            let a = document.createElement('a')
            a.innerText = '"' + value + '"';
            a.href = 'https://www.google.com'
            a.setAttribute("target", "_blank");
            spanEl.appendChild(a);
        } else {
            if (type === "string") {
                asText = '"' + value + '"';
            } else if (value === null) {
                type = "null";
            } 
            spanEl.className = "type-" + type;
            spanEl.textContent = asText;
        }

		return spanEl;
	};

    createItemsCount(count) {
		let itemsCount = document.createElement("span");
		itemsCount.className = "items-ph hide";
		itemsCount.innerHTML = this.getItemsTitle(count);

		return itemsCount;
	};

    createLink(title) {
		let linkElement = document.createElement("a");
		linkElement.classList.add("list-link");
		linkElement.href = "javascript:void(0)";
		linkElement.innerHTML = title || "";
		return linkElement;
	};

    getItemsTitle(count) {
		let itemsTxt = count > 1 || count === 0 ? "items" : "item";

		return (count + " " + itemsTxt);
	};

    isUrl(value) {
        var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
        return regexp.test(value);
    };
    
}