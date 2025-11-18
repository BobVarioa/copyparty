import { Modal } from "./modal";
import { BaseElement } from "./baselement";
import { $c, $id } from "../utils/elements";
import { FileManager } from "../utils/filemanager";
import { FileAccessor } from "../utils/fileaccess";

class UploadModal extends Modal {
    constructor() {
        super();

        const uploadFilesButton = $c("button", "Files");
        this.anchor.appendChild(uploadFilesButton);
        uploadFilesButton.addEventListener("click", () => {
            FileAccessor.uploadFiles();
            this.anchor.close();
        })

        const uploadFoldersButton = $c("button", "Folders");
        this.anchor.appendChild(uploadFoldersButton);
        uploadFoldersButton.addEventListener("click", () => {
            FileAccessor.uploadFiles();
            this.anchor.close();
        })

        const closeButton = $c("button", "Close");
        closeButton.addEventListener("click", () => {
            this.anchor.close();
        });
        this.anchor.appendChild(closeButton);
    }

    
}

export class ActionBarElement extends BaseElement {
    fs: FileManager;

    constructor(anchor: HTMLElement, fs: FileManager) {
        super(anchor);
        this.fs = fs;
    }

    searchModal!: Modal;
    uploadModal!: Modal;
    renameModal!: Modal;
    createFolderModal!: Modal;
    createMDModal!: Modal;

    init() {
        /*
        <div id="actionbar">
            <div>
                <button class="icon" id="search"><i class="fa-magnifying-glass"></i></button>
                <button class="icon" id="upload"><i class="fa-file-arrow-up"></i></button>
                <button class="icon" id="recents"><i class="fa-clock-rotate-left"></i></button>
                <button class="icon" id="add_folder"><i class="fa-folder-plus"></i></button>
                <button class="icon" id="add_md"><i class="fa-file-pen"></i></button>
                <button class="icon" id="download_file"><i class="fa-download"></i></button>
                <button class="icon" id="download_folder"><i class="fa-file-zipper"></i></button>
            </div>
            <div>
                <button class="icon" id="trash"><i class="fa-trash"></i></button>
                <button class="icon" id="view"><i class="fa-file-lines"></i></button>
                <button class="icon" id="rename"><i class="fa-pen"></i></button>
                <button class="icon" id="cut"><i class="fa-scissors"></i></button>
                <button class="icon" id="copy"><i class="fa-copy"></i></button>
                <button class="icon" id="paste"><i class="fa-paste"></i></button>
            </div>
        </div>
        */

        this.uploadModal = new UploadModal();

        $id("upload").addEventListener("click", () => {});

        $id("download_file").addEventListener("click", () => {
            const files = [...this.fs.selectedItems];
            if (files.length === 1) {
                FileAccessor.download(files[0]);
            } else {
                FileAccessor.downloadAll(files);
            }
        });
    }
}
