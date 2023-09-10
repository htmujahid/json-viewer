import { isUrl } from "../utils/url";

export default class JsonRenderer {
    createSimpleViewOf(value: any) {
        let spanEl = document.createElement("span");
        let type: string = typeof value;
        let asText = "" + value;
        if (isUrl(value)) {
            let a = document.createElement("a");
            a.innerText = '"' + value + '"';
            a.href = "https://www.google.com";
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
    }

    createItemsCount(count: number) {
        let itemsCount = document.createElement("span");
        itemsCount.className = "items-ph hide";
        itemsCount.innerHTML = this.getItemsTitle(count);

        return itemsCount;
    }

    createLink(title: string) {
        let linkElement = document.createElement("a") as HTMLAnchorElement;
        linkElement.classList.add("list-link");
        linkElement.href = "javascript:void(0)";
        linkElement.innerHTML = title || "";
        return linkElement;
    }

    getItemsTitle(count: number) {
        let itemsTxt = count > 1 || count === 0 ? "items" : "item";

        return count + " " + itemsTxt;
    }
}