import {Directive, Input, TemplateRef} from "@angular/core";

@Directive({
    selector: "ng-template[tab]"
})

export class TabTemplateDirective {

    @Input() tab: string;

    constructor(public templateRef: TemplateRef<any>) {
    }
}
