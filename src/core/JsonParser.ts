import { isUrl } from "../utils/url";
import JsonRenderer from "./JsonRenderer";

export default class JsonParser {
    jsonRenderer: JsonRenderer;
    root?: string;

    constructor() {
        this.jsonRenderer = new JsonRenderer();
    }

    parseJSON(
        outputParent: any,
        value: any,
        maxLevel: number,
        columnAt: number,
        level: number,
        root?: string
    ) {
        if (level === 0) {
            this.root = root;
        }

        if (typeof value === "object" && value !== null) {
            this.parseObject(outputParent, value, maxLevel, columnAt, level);
        } else {
            this.parseValue(outputParent, value);
        }
    }

    parseObject(
        outputParent: any,
        value: any,
        maxLevel: number,
        columnAt: number,
        level: number
    ) {
        let isMaxLevel = maxLevel >= 0 && level >= maxLevel;
        let isCollapse = columnAt >= 0 && level >= columnAt;

        let isArray = Array.isArray(value);
        let items = isArray ? value : Object.keys(value);

        if (level === 0) {
            this.parseRoot(
                items,
                isArray,
                isMaxLevel,
                outputParent,
                isCollapse
            );
        }

        if (items.length && !isMaxLevel) {
            this.parseChild(
                items,
                level,
                isArray,
                value,
                maxLevel,
                columnAt,
                outputParent
            );
        } else if (items.length && isMaxLevel) {
            let itemsCount = this.jsonRenderer.createItemsCount(items.length);
            itemsCount.classList.remove("hide");
            outputParent.appendChild(itemsCount);
        }

        if (level === 0) {
            if (!items.length) {
                let itemsCount = this.jsonRenderer.createItemsCount(0);
                itemsCount.classList.remove("hide");

                outputParent.appendChild(itemsCount);
            }

            outputParent.appendChild(
                document.createTextNode(isArray ? "]" : "}")
            );

            if (isCollapse) {
                outputParent.querySelector("ul").classList.add("hide");
            }
        }
    }

    parseRoot(
        items: any,
        isArray: any,
        isMaxLevel: any,
        outputParent: any,
        isCollapse: any
    ) {
        let rootCount = this.jsonRenderer.createItemsCount(items.length);
        const rootSymbol = this.root === "" ? "" : `${this.root}: `;
        let rootLink = this.jsonRenderer.createLink(
            isArray ? `${rootSymbol}[` : `${rootSymbol}{`
        );

        if (items.length) {
            rootLink.addEventListener("click", function () {
                if (isMaxLevel) return;

                rootLink.classList.toggle("collapsed");
                rootCount.classList.toggle("hide");

                outputParent.querySelector("ul").classList.toggle("hide");
            });

            if (isCollapse) {
                rootLink.classList.add("collapsed");
                rootCount.classList.remove("hide");
            }
        } else {
            rootLink.classList.add("empty");
        }

        rootLink.appendChild(rootCount);
        outputParent.appendChild(rootLink);
    }

    parseChild(
        items: any,
        level: any,
        isArray: any,
        value: any,
        maxLevel: any,
        columnAt: any,
        outputParent: any
    ) {
        let len = items.length - 1;
        let ul = document.createElement("ul");
        ul.setAttribute("data-level", level);
        ul.classList.add("type-" + (isArray ? "array" : "object"));

        items.forEach((key: number, ind: number) => {
            let item = isArray ? key : value[key];
            let li = document.createElement("li");

            if (typeof item === "object") {
                if (!Array.isArray(item)) {
                    this.parseChildObject(
                        item,
                        isArray,
                        key,
                        maxLevel,
                        columnAt,
                        level,
                        li,
                        ind
                    );
                } else {
                    this.parseChildArray(
                        item,
                        key,
                        maxLevel,
                        columnAt,
                        level,
                        li,
                        ind
                    );
                }
            } else {
                if (!isArray) {
                    li.appendChild(document.createTextNode(key + ": "));
                } else {
                    li.appendChild(document.createTextNode(ind + ": "));
                }

                this.parseJSON(li, item, maxLevel, columnAt, level + 1);
            }
            if (ind < len) {
                if (typeof item === "object") {
                    if (!Array.isArray(item)) {
                        li.appendChild(document.createTextNode(","));
                    } else {
                        li.appendChild(document.createTextNode(","));
                    }
                } else {
                    li.appendChild(document.createTextNode(","));
                }
            }

            ul.appendChild(li);
        }, this);

        outputParent.appendChild(ul);
    }

    parseChildObject(
        item: any,
        isArray: any,
        key: string | number,
        maxLevel: number,
        columnAt: number,
        level: number,
        li: HTMLElement,
        ind: number
    ) {
        if (!item || item instanceof Date) {
            li.appendChild(document.createTextNode(isArray ? "" : key + ": "));
            li.appendChild(
                this.jsonRenderer.createSimpleViewOf(item ? item : null)
            );
        } else {
            let itemIsArray = Array.isArray(item);
            let itemLen = itemIsArray ? item.length : Object.keys(item).length;

            if (!itemLen) {
                li.appendChild(
                    document.createTextNode(
                        (typeof key === "string" ? key : ind) +
                            ": " +
                            (itemIsArray ? "[]" : "{}")
                    )
                );
            } else {
                let itemTitle =
                    (typeof key === "string" ? key + ": " : ind + ": ") +
                    (itemIsArray ? "[" : "{");
                let itemLink = this.jsonRenderer.createLink(itemTitle);
                let itemsCount = this.jsonRenderer.createItemsCount(itemLen);
                if (maxLevel >= 0 && level + 1 >= maxLevel) {
                    li.appendChild(document.createTextNode(itemTitle));
                } else {
                    itemLink.appendChild(itemsCount);
                    li.appendChild(itemLink);
                }
                this.parseJSON(li, item, maxLevel, columnAt, level + 1);
                li.appendChild(
                    document.createTextNode(itemIsArray ? "]" : "}")
                );
                let list = li.querySelector("ul") as HTMLElement;
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

    parseChildArray(
        item: any,
        key: string | number,
        maxLevel: number,
        columnAt: number,
        level: number,
        li: HTMLElement,
        ind: number
    ) {
        let itemIsArray = Array.isArray(item);
        let itemLen = itemIsArray ? item.length : Object.keys(item).length;

        if (!itemLen) {
            li.appendChild(
                document.createTextNode(
                    (typeof key === "string" ? key : ind) +
                        ": " +
                        (itemIsArray ? "[]" : "{}")
                )
            );
        } else {
            let itemTitle =
                (typeof key === "string" ? key + ": " : ind + ": ") +
                (itemIsArray ? "[" : "{");
            let itemLink = this.jsonRenderer.createLink(itemTitle);
            let itemsCount = this.jsonRenderer.createItemsCount(itemLen);
            if (maxLevel >= 0 && level + 1 >= maxLevel) {
                li.appendChild(document.createTextNode(itemTitle));
            } else {
                itemLink.appendChild(itemsCount);
                li.appendChild(itemLink);
            }
            this.parseJSON(li, item, maxLevel, columnAt, level + 1);
            li.appendChild(document.createTextNode(itemIsArray ? "]" : "}"));
            let list = li.querySelector("ul") as HTMLElement;
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

    parseValue(outputParent: any, value: any) {
        let spanEl = document.createElement("span");
        let type: string = typeof value;
        let asText = "" + value;
        if (isUrl(value)) {
            let a = document.createElement("a");
            a.innerText = '"' + value + '"';
            a.href = value as string;
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
        outputParent.appendChild(spanEl);
    }
}