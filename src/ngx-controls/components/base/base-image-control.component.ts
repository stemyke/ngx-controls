import {Input} from "@angular/core";
import {BaseControlComponent} from "./base-control.component";

export abstract class BaseImageControlComponent extends BaseControlComponent {

    @Input() image: string;
    @Input() imagePath: string;
    @Input() imageType: string;
    @Input() imageContent: boolean | string;
    @Input() imageProject: boolean;

    ctrInit(): void {
        // Default image options
        this.image = "";
        this.imagePath = "";
        this.imageType = "png";
        this.imageProject = false;
    }

    getImage(item: any): Promise<any> {
        if (this.imageContent) {
            this.imageType = "content";
        }
        switch (this.imageType) {
            case "content":
                return Promise.resolve(item[this.image]);
            case "icon":
                return this.icon.getIcon(item[this.image], "", false);
            case "url":
                return Promise.resolve(`url(${item[this.image]})`);
        }
        const path = this.configs.prepareUrl(this.imagePath || this.commandClass.replace(/-/g, "/"), "/");
        const file = `${item[this.image]}.${this.imageType}`;
        return Promise.resolve(this.config.cssImageUrl(`${path}${file}`, this.imageProject));
    }
}
