
export const $ = (e: string): HTMLElement => {
    const ele = document.querySelector(e);
    if (ele == null) throw new RangeError("Selector returned no elements.");
    return ele as HTMLElement;
};
export const $$ = (e: string): NodeListOf<HTMLElement> => document.querySelectorAll(e);

export const $id = (id: string): HTMLElement => {
    const ele = document.getElementById(id);
    if (ele == null) throw new RangeError("ID did not coorespond to an element.");
    return ele;
};

export const $c = <K extends keyof HTMLElementTagNameMap>(str: K, textContent: string | undefined = undefined): HTMLElementTagNameMap[K] => {
	const ele = document.createElement(str);
	if (textContent != undefined) {
		ele.textContent = textContent;
	}
	return ele as HTMLElementTagNameMap[K];
};

export const $i = (icon: string): HTMLElement => {
	const ele = $c("i");
	ele.classList.add(`fa-${icon}`);
	return ele;
};