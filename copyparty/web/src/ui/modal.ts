import { $c } from "../utils/elements";
import { L } from "../utils/lang";

export class Modal {
    static dialogRoot: HTMLElement;
    static confirmModal: ConfirmModal;
    static alertModal: AlertModal;

    static init(dialogRoot: HTMLElement) {
        this.dialogRoot = dialogRoot;

        this.confirmModal = new ConfirmModal();
        this.alertModal = new AlertModal();
    }

    static async confirm(msg: string, confirm = L.get("m_ok"), deny = L.get("m_ng")): Promise<boolean> {
        return new Promise((res) => {
            this.confirmModal.setMessage(msg);
            this.confirmModal.setButtons(confirm, deny);
            this.confirmModal.onceConfirm(res);
        });
    }

    static async alert(msg: string, confirm = L.get("m_ok")): Promise<void> {
        return new Promise((res) => {
            this.alertModal.setMessage(msg);
            this.alertModal.setButton(confirm);
            this.alertModal.onceAlert(res);
        });
    }

    anchor: HTMLDialogElement;

    constructor() {
        this.anchor = $c("dialog");
        Modal.dialogRoot.appendChild(this.anchor);
    }
}

export class ConfirmModal extends Modal {
    msgElement: HTMLElement;
    confirm: HTMLElement;
    deny: HTMLElement;

    currentCallback: (value: boolean) => void = undefined;

    constructor() {
        super();
        this.msgElement = $c("span");
        this.anchor.appendChild(this.msgElement);

        this.confirm = $c("button");
        this.anchor.appendChild(this.confirm);
        this.confirm.addEventListener("click", () => {
            if (this.currentCallback != undefined) {
                this.currentCallback(true);
                this.currentCallback = undefined;
                this.anchor.close();
            }
        });

        this.deny = $c("button");
        this.anchor.appendChild(this.deny);
        this.deny.addEventListener("click", () => {
            if (this.currentCallback != undefined) {
                this.currentCallback(false);
                this.currentCallback = undefined;
                this.anchor.close();
            }
        });

        this.anchor.addEventListener("close", () => {
            if (this.currentCallback != undefined) {
                this.currentCallback(false);
                this.currentCallback = undefined;
            }
        });
    }

    setMessage(msg: string) {
        this.msgElement.textContent = msg;
    }

    setButtons(confirmText: string, denyText: string) {
        this.confirm.textContent = confirmText;
        this.deny.textContent = denyText;
    }

    onceConfirm(func: (value: boolean) => void) {
        this.currentCallback = func;
    }
}

export class AlertModal extends Modal {
    msgElement: HTMLElement;
    confirm: HTMLElement;

    currentCallback: () => void = undefined;

    constructor() {
        super();
        this.msgElement = $c("span");
        this.anchor.appendChild(this.msgElement);

        this.confirm = $c("button");
        this.anchor.appendChild(this.confirm);
        this.confirm.addEventListener("click", () => {
            if (this.currentCallback != undefined) {
                this.currentCallback();
                this.currentCallback = undefined;
                this.anchor.close();
            }
        });

        this.anchor.addEventListener("close", () => {
            if (this.currentCallback != undefined) {
                this.currentCallback();
                this.currentCallback = undefined;
            }
        });
    }

    setMessage(msg: string) {
        this.msgElement.textContent = msg;
    }

    setButton(confirmText: string) {
        this.confirm.textContent = confirmText;
    }

    onceAlert(func: () => void) {
        this.currentCallback = func;
    }
}
